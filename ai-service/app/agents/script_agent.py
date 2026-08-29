"""
CINESTATE — Gemini Script Agent & Recommendation Agent
- ScriptAgent: parses screenplays (text/PDF) and establishes baseline scene facts.
- RecommendationAgent: generates actionable fix/reshoot recommendations.
"""

import json
import logging
from typing import Optional
from google import genai
from google.genai import types

from app.config import settings
from app.models.schemas import (
    ExtractedScene, ScriptAnalysisResult, SceneCharacterState,
    RecommendationResult, Severity, BlastRadius
)

logger = logging.getLogger(__name__)


def _get_genai_client() -> genai.Client:
    import os
    api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "REPLACE_WITH_NEW_KEY_AFTER_ROTATING":
        return genai.Client(api_key=api_key)
    if settings.google_cloud_project and os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        return genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )
    return genai.Client(api_key="AIzaSy_DEMO_KEY_CINESTATE_HACKATHON")


class ScriptAgent:
    """Parses screenplays using Gemini 2.0 Flash to extract scene structures and state facts."""

    def __init__(self):
        self.client = _get_genai_client()
        self.model = settings.gemini_model

    def analyze_script_file(self, project_id: str, file_bytes: bytes, filename: str) -> ScriptAnalysisResult:
        """Parse PDF or text file bytes using Gemini 2.0 Flash multimodal vision/document parser."""
        system_instruction = """
You are an expert Hollywood Script Supervisor and Continuity Specialist.
Analyze the provided screenplay document (PDF/text) and extract:
1. All scene breakdown objects (scene_id, scene_number, location, time_of_day, characters, props, wardrobe, description).
2. Character state facts (injuries, watches, specific clothing, hair).
3. Continuity dependencies (which scenes depend on earlier scene states).

Return strict valid JSON matching this schema:
{
  "total_scenes": 2,
  "characters": ["Arjun", "Detective"],
  "locations": ["INT. HOTEL ROOM", "INT. INTERROGATION ROOM"],
  "scenes": [
    {
      "scene_id": "scene_17",
      "scene_number": 17,
      "location": "INT. HOTEL ROOM - NIGHT",
      "time_of_day": "NIGHT",
      "characters": ["Arjun"],
      "props": ["Watch"],
      "wardrobe": ["Black jacket"],
      "description": "Arjun tends to his LEFT ARM injury.",
      "states": [
        {"character": "arjun", "attribute": "injury_location", "value": "left_arm", "confidence": 0.98}
      ],
      "depends_on": []
    }
  ],
  "continuity_dependencies": 1
}
"""

        try:
            mime_type = "application/pdf" if filename.lower().endswith(".pdf") else "text/plain"
            part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            prompt = f"Parse this screenplay document for project {project_id}."

            response = self.client.models.generate_content(
                model=self.model,
                contents=[part, prompt],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            if response.text:
                parsed = json.loads(response.text)
                return self._parse_json_result(project_id, parsed)
            raise ValueError("Gemini returned empty response for script parsing.")
        except Exception as e:
            logger.error(f"Gemini live PDF parsing failed: {e}")
            raise RuntimeError(f"Script parsing failed: {e}")

    def analyze_script_text(self, project_id: str, script_text: str) -> ScriptAnalysisResult:
        """Extract scene breakdown, characters, props, and initial state facts from text."""
        if not script_text.strip():
            return self._build_aurora_script_result(project_id)

        system_instruction = """
You are an expert Hollywood Script Supervisor.
Parse the provided screenplay text and extract scene breakdown objects and character state facts.
Return strict valid JSON.
"""
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=f"Parse this screenplay text for project {project_id}:\n\n{script_text[:10000]}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            if response.text:
                parsed = json.loads(response.text)
                return self._parse_json_result(project_id, parsed)
            raise ValueError("Gemini returned empty response for text script parsing.")
        except Exception as e:
            logger.error(f"Script parsing text failed: {e}")
            raise RuntimeError(f"Script text parsing failed: {e}")

    def _build_aurora_script_result(self, project_id: str) -> ScriptAnalysisResult:
        """Fallback deterministic script result for Project Aurora."""
        scenes = [
            ExtractedScene(
                scene_id="scene_01",
                scene_number=1,
                location="INT. POLAR RESEARCH BASE - CORRIDOR",
                time_of_day="DAY",
                characters=["Arjun", "Maya"],
                props=["Thermal Suit", "Watch"],
                wardrobe=["White Thermal Suit"],
                description="Arjun slips on ice and sustains injury on his left arm.",
                states=[
                    SceneCharacterState(character="arjun", attribute="injury_location", value="left_arm", confidence=0.98),
                    SceneCharacterState(character="arjun", attribute="watch_wrist", value="left", confidence=0.96),
                ],
                depends_on=[],
            ),
            ExtractedScene(
                scene_id="scene_17",
                scene_number=17,
                location="INT. BASE HABITATION MODULE",
                time_of_day="NIGHT",
                characters=["Arjun", "Maya"],
                props=["Bandage", "Key Drive"],
                wardrobe=["Black Jacket", "Red Scarf"],
                description="Arjun bandages his left arm. Maya wears red scarf.",
                states=[
                    SceneCharacterState(character="arjun", attribute="injury_location", value="left_arm", confidence=0.97),
                    SceneCharacterState(character="maya", attribute="accessory", value="red_scarf", confidence=0.95),
                ],
                depends_on=["scene_01"],
            ),
            ExtractedScene(
                scene_id="scene_25",
                scene_number=25,
                location="INT. CENTRAL CONTROL VAULT",
                time_of_day="NIGHT",
                characters=["Arjun", "Detective"],
                props=["Keypad", "Data Terminal"],
                wardrobe=["Black Jacket"],
                description="Arjun operates terminal with right hand while left arm is bandaged.",
                states=[
                    SceneCharacterState(character="arjun", attribute="injury_location", value="left_arm", confidence=0.94),
                ],
                depends_on=["scene_17"],
            ),
            ExtractedScene(
                scene_id="scene_28",
                scene_number=28,
                location="INT. MEDICAL BAY AFTERMATH",
                time_of_day="DAY",
                characters=["Arjun", "Doctor"],
                props=["Medical Scanner"],
                wardrobe=["Hospital Gown"],
                description="Doctor inspects Arjun's left arm injury.",
                states=[
                    SceneCharacterState(character="arjun", attribute="injury_location", value="left_arm", confidence=0.96),
                ],
                depends_on=["scene_25", "scene_17"],
            ),
        ]
        return ScriptAnalysisResult(
            project_id=project_id,
            total_scenes=len(scenes),
            characters=["Arjun", "Maya", "Doctor", "Detective"],
            locations=["POLAR BASE", "HABITATION MODULE", "CONTROL VAULT", "MEDICAL BAY"],
            scenes=scenes,
            continuity_dependencies=3,
        )

    def _parse_json_result(self, project_id: str, parsed: dict) -> ScriptAnalysisResult:
        """Map Gemini JSON payload into Pydantic ScriptAnalysisResult."""
        scenes = []
        for sc in parsed.get("scenes", []):
            states = [
                SceneCharacterState(
                    character=st.get("character", "unknown"),
                    attribute=st.get("attribute", "unknown"),
                    value=st.get("value", "unknown"),
                    confidence=float(st.get("confidence", 0.95)),
                )
                for st in sc.get("states", [])
            ]
            scenes.append(
                ExtractedScene(
                    scene_id=sc.get("scene_id", f"scene_{sc.get('scene_number', 0)}"),
                    scene_number=int(sc.get("scene_number", 0)),
                    location=sc.get("location", "UNKNOWN"),
                    time_of_day=sc.get("time_of_day", "UNKNOWN"),
                    characters=sc.get("characters", []),
                    props=sc.get("props", []),
                    wardrobe=sc.get("wardrobe", []),
                    description=sc.get("description", ""),
                    states=states,
                    depends_on=sc.get("depends_on", []),
                )
            )
        return ScriptAnalysisResult(
            project_id=project_id,
            total_scenes=len(scenes),
            characters=parsed.get("characters", []),
            locations=parsed.get("locations", []),
            scenes=scenes,
            continuity_dependencies=parsed.get("continuity_dependencies", 0),
        )


class RecommendationAgent:
    """Generates cost-effective corrective recommendations for continuity conflicts."""

    def __init__(self):
        self.client = _get_genai_client()
        self.model = settings.gemini_model

    def generate_recommendation(
        self,
        conflict_scene: str,
        entity_id: str,
        attribute_name: str,
        expected: str,
        observed: str,
        severity: Severity,
        blast_radius: dict,
    ) -> RecommendationResult:

        affected_count = len(blast_radius.get("affected_scenes", []))

        prompt = f"""
Conflict detected in Scene {conflict_scene}:
Character: {entity_id}
Attribute: {attribute_name}
Expected State (Script/History): {expected}
Observed State (Footage): {observed}
Severity: {severity.value}
Blast Radius: {affected_count} downstream scenes affected ({', '.join(blast_radius.get('affected_scenes', []))})

Provide a short, authoritative, cost-aware recommendation for the Director & Script Supervisor.
Return ONLY a valid JSON object with:
"action": one of "RESHOOT_TAKE", "ACCEPT_EXCEPTION", or "DIGITAL_VFX"
"reasoning": detailed but concise explanation of the impact and estimated cost.
"""
        action = "RESHOOT_CURRENT_TAKE"
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )
            if response.text:
                import json
                data = json.loads(response.text)
                action = data.get("action", "RESHOOT_CURRENT_TAKE")
                reasoning = data.get("reasoning", "")
            else:
                reasoning = f"No recommendation generated. Severity: {severity.value}."
        except Exception as e:
            import logging
            logging.error(f"Failed to generate recommendation: {e}")
            reasoning = f"Action Required: Scene {conflict_scene} has injury on '{observed}' instead of '{expected}'. {affected_count} downstream scenes affected."

        return RecommendationResult(
            action=action,
            reasoning=reasoning,
            urgency=severity,
            requires_approval=True,
        )
