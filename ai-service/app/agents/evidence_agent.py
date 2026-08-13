"""
CINESTATE — Gemini Evidence Agent
Multimodal Vision Analysis using google-genai SDK.
Extracts structured observations with bounding boxes from live camera frames.
"""

import json
import logging
import time
import os
from typing import Optional, List
from google import genai
from google.genai import types

from app.config import settings
from app.models.schemas import (
    VisualObservation, EntityType, VideoAnalysisResult
)

logger = logging.getLogger(__name__)


def _get_genai_client() -> genai.Client:
    """Initialize Google GenAI client (using API key or Vertex AI)."""
    api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "REPLACE_WITH_NEW_KEY_AFTER_ROTATING":
        return genai.Client(api_key=api_key)
    if settings.google_cloud_project and os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        return genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )
    raise ValueError("Valid GEMINI_API_KEY is required for Production Live Vision.")


class EvidenceAgent:
    """
    Analyzes video footage & live camera frames using Gemini 2.0 Multimodal capabilities.
    Extracts structured continuity observations with strict JSON formatting and Bounding Boxes.
    """

    def __init__(self):
        try:
            self.client = _get_genai_client()
            self.model = settings.gemini_model
        except ValueError as e:
            logger.warning(f"GenAI Client init failed: {e}")
            self.client = None
            self.model = settings.gemini_model

    def analyze_live_frame_bytes(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        scene_id: str = "scene_25",
    ) -> List[dict]:
        """
        Real-time Gemini 2.0 Flash visual recognition on live webcam / camera feed bytes.
        Performs 100% REAL vision perception on the actual image provided.
        Returns a list of dicts directly so it can include 'bbox' which is not in VisualObservation schema.
        """
        if not self.client:
            raise RuntimeError("GEMINI_API_KEY is required for live dynamic vision analysis.")

        start_time = time.time()
        logger.info(f"EvidenceAgent analyzing live frame bytes size={len(image_bytes)}")

        system_instruction = """
You are a Lead Script Supervisor & AI Vision Expert analyzing a live camera feed on a film set.
Examine the image carefully and extract REAL visual facts about the person and room in frame.
You must return 2D bounding boxes for every object/person you detect.

Rules:
1. Return ONLY valid JSON array.
2. Be 100% honest and accurate about what is visible in the picture. Do NOT invent bandages if none are visible.
3. Keep attribute names and values normalized lowercase with underscores.
4. Bounding boxes MUST be in the format: [ymin, xmin, ymax, xmax] normalized from 0.0 to 1.0 relative to image dimensions.
"""

        prompt = """
Analyze this live camera frame from set.
Extract observed visual attributes for the person visible in frame. Detect clothing style, presence of injury/bandages, watches, or props.

Return a JSON array of objects. Example:
[
  {
    "entity_type": "CHARACTER",
    "entity_id": "ActorNameOrCharacterName",
    "attribute_name": "clothing_style",
    "value": "t_shirt",
    "confidence": 0.96,
    "bbox": [0.10, 0.20, 0.80, 0.70],
    "evidence_note": "Person wearing a t-shirt."
  },
  {
    "entity_type": "PROP",
    "entity_id": "cell_phone",
    "attribute_name": "prop",
    "value": "cell_phone",
    "confidence": 0.98,
    "bbox": [0.50, 0.40, 0.60, 0.45],
    "evidence_note": "Person holding a cell phone in hand."
  }
]
"""

        if len(image_bytes) < 100:
            raise ValueError("Empty or invalid image frame provided.")

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = self.client.models.generate_content(
            model=self.model,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        raw_json = response.text or "[]"
        try:
            parsed = json.loads(raw_json)
            return parsed
        except Exception as e:
            logger.error(f"Failed to parse Gemini JSON: {raw_json}")
            raise RuntimeError("Gemini did not return valid JSON.")

    def analyze_take(
        self,
        scene_id: str,
        take_id: str,
        media_path: Optional[str] = None,
        raw_text_description: Optional[str] = None,
    ) -> VideoAnalysisResult:
        if not self.client:
            raise RuntimeError("GEMINI_API_KEY is required for live dynamic vision analysis.")

        start_time = time.time()
        logger.info(f"EvidenceAgent analyzing scene={scene_id}, take={take_id}")

        system_instruction = """
You are a Lead Script Supervisor & Continuity Expert on a film set.
Your job is to observe video footage or scene descriptions and extract EXACT visual facts.
Return a JSON array of objects with keys: entity_type, entity_id, attribute_name, value, confidence, timestamp, evidence_note.
"""

        prompt = f"""
Analyze Scene {scene_id}, Take {take_id}.
Extract all visual continuity observations from the video.
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        raw_json = response.text or "[]"
        parsed_data = json.loads(raw_json)

        obs_list = []
        for item in parsed_data:
            obs_list.append(VisualObservation(
                entity_type=EntityType(item.get("entity_type", "CHARACTER")),
                entity_id=item.get("entity_id", "unknown").lower(),
                attribute_name=item.get("attribute_name", "unknown").lower(),
                value=item.get("value", "").lower(),
                confidence=float(item.get("confidence", 0.8)),
                timestamp=item.get("timestamp", "00:00.0"),
                evidence_note=item.get("evidence_note", "Extracted by Gemini 2.0 Flash"),
            ))

        processing_ms = int((time.time() - start_time) * 1000)
        return VideoAnalysisResult(
            scene_id=scene_id,
            take_id=take_id,
            observations=obs_list,
            raw_description=raw_text_description or "Video Analysis via Gemini 2.0 Flash",
            processing_ms=processing_ms,
        )
