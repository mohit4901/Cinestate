"""
CINESTATE — ClickHouse Agent Tools
Safe, parameterized tools for ADK agents.
Gemini selects these tools — never executes raw SQL.

These wrap ClickHouseRepository so the LLM never sees SQL.
"""

import json
import logging
import time
from typing import Optional

from google.adk.tools import FunctionTool

from app.integrations.clickhouse.repository import ClickHouseRepository

logger = logging.getLogger(__name__)
_repo = ClickHouseRepository()


# Tool 1: Character History

def get_character_history(
    project_id: str,
    character: str,
    attribute: str,
) -> dict:
    """
    Retrieve the chronological history of a character attribute from ClickHouse.

    This is the primary tool for continuity checking. It returns every
    recorded value for a character's attribute across all scenes, ordered
    chronologically. Use this BEFORE making any continuity judgment.

    Args:
        project_id: The production project identifier (e.g., "project-aurora")
        character: Character name/ID (e.g., "arjun", "maya")
        attribute: The attribute to check (e.g., "injury_location", "watch_wrist", "jacket_color")

    Returns:
        dict with 'history' (list of records) and 'latest_value' (most recent known state)
    """
    start = time.time()
    try:
        # Validate inputs — never pass raw user strings to SQL
        if not all([project_id, character, attribute]):
            return {"error": "project_id, character, and attribute are required", "history": []}

        history = _repo.get_character_history(
            project_id=project_id,
            character=character.lower().strip(),
            attribute=attribute.lower().replace(" ", "_").strip(),
        )

        latest = None
        if history:
            latest = {
                "value": history[-1].get("value") or history[-1].get("observed_value"),
                "scene": history[-1].get("scene_id"),
                "confidence": history[-1].get("confidence"),
            }

        latency_ms = int((time.time() - start) * 1000)
        logger.info(
            "Tool: get_character_history",
            extra={
                "project_id": project_id, "character": character,
                "attribute": attribute, "count": len(history),
                "latency_ms": latency_ms,
            },
        )

        return {
            "project_id": project_id,
            "character": character,
            "attribute": attribute,
            "history_count": len(history),
            "history": history,
            "latest_known_value": latest,
            "latency_ms": latency_ms,
            "source": "ClickHouse production_events",
        }
    except Exception as e:
        logger.error(f"get_character_history failed: {e}")
        return {"error": str(e), "history": [], "character": character, "attribute": attribute}


# Tool 2: Scene History

def get_scene_history(project_id: str, scene_id: str) -> dict:
    """
    Retrieve all production events for a given scene from ClickHouse.

    Returns a complete picture of everything that happened in a scene:
    script facts, video observations, conflicts, and agent actions.

    Args:
        project_id: The production project identifier
        scene_id: Scene identifier (e.g., "scene_17", "scene_25")

    Returns:
        dict with all events for the scene, grouped by type
    """
    start = time.time()
    try:
        events = _repo.get_scene_history(project_id=project_id, scene_id=scene_id)
        latency_ms = int((time.time() - start) * 1000)

        # Group by event type for clarity
        grouped: dict[str, list] = {}
        for e in events:
            et = e.get("event_type", "OTHER")
            grouped.setdefault(et, []).append(e)

        logger.info("Tool: get_scene_history", extra={
            "project_id": project_id, "scene_id": scene_id,
            "count": len(events), "latency_ms": latency_ms,
        })

        return {
            "project_id": project_id,
            "scene_id": scene_id,
            "total_events": len(events),
            "events_by_type": grouped,
            "events": events,
            "latency_ms": latency_ms,
            "source": "ClickHouse production_events",
        }
    except Exception as e:
        logger.error(f"get_scene_history failed: {e}")
        return {"error": str(e), "events": [], "scene_id": scene_id}


# Tool 3: Take Observations

def get_take_observations(project_id: str, take_id: str) -> dict:
    """
    Retrieve all structured observations extracted from a video take.

    Returns Gemini's extracted observations stored in ClickHouse,
    including entity states, confidence scores, and timestamps.

    Args:
        project_id: The production project identifier
        take_id: Take identifier (e.g., "take_03", "take_01")

    Returns:
        dict with observations and their confidence scores
    """
    start = time.time()
    try:
        observations = _repo.get_take_observations(project_id=project_id, take_id=take_id)
        latency_ms = int((time.time() - start) * 1000)

        logger.info("Tool: get_take_observations", extra={
            "project_id": project_id, "take_id": take_id,
            "count": len(observations), "latency_ms": latency_ms,
        })

        return {
            "project_id": project_id,
            "take_id": take_id,
            "observation_count": len(observations),
            "observations": observations,
            "latency_ms": latency_ms,
            "source": "ClickHouse production_events (VIDEO_OBSERVATION)",
        }
    except Exception as e:
        logger.error(f"get_take_observations failed: {e}")
        return {"error": str(e), "observations": [], "take_id": take_id}


# Tool 4: Open Conflicts

def get_open_conflicts(project_id: str) -> dict:
    """
    Retrieve all open continuity conflicts for a project.

    Returns conflicts ordered by severity (HIGH first), including
    expected vs observed values and blast radius information.

    Args:
        project_id: The production project identifier

    Returns:
        dict with list of open conflicts and severity breakdown
    """
    start = time.time()
    try:
        conflicts = _repo.get_open_conflicts(project_id=project_id)
        latency_ms = int((time.time() - start) * 1000)

        high = [c for c in conflicts if c.get("severity") == "HIGH"]
        medium = [c for c in conflicts if c.get("severity") == "MEDIUM"]
        low = [c for c in conflicts if c.get("severity") == "LOW"]

        logger.info("Tool: get_open_conflicts", extra={
            "project_id": project_id, "total": len(conflicts),
            "high": len(high), "latency_ms": latency_ms,
        })

        return {
            "project_id": project_id,
            "total_conflicts": len(conflicts),
            "high_severity": len(high),
            "medium_severity": len(medium),
            "low_severity": len(low),
            "conflicts": conflicts,
            "latency_ms": latency_ms,
            "source": "ClickHouse continuity_conflicts",
        }
    except Exception as e:
        logger.error(f"get_open_conflicts failed: {e}")
        return {"error": str(e), "conflicts": [], "total_conflicts": 0}


# Tool 5: Downstream Dependencies (Blast Radius)

def get_downstream_dependencies(project_id: str, scene_id: str) -> dict:
    """
    Find all scenes that will be affected if the state in scene_id is wrong.
    This is the BLAST RADIUS calculation — do NOT hard-code scene counts.

    For example, if Scene 17 establishes Arjun's injury as left_arm,
    and that's wrong, this returns all scenes that assumed left_arm is correct.

    Args:
        project_id: The production project identifier
        scene_id: The scene whose state change might cascade

    Returns:
        dict with affected scenes and impact count — queried from ClickHouse
    """
    start = time.time()
    try:
        deps = _repo.get_downstream_dependencies(
            project_id=project_id,
            scene_id=scene_id,
        )
        latency_ms = int((time.time() - start) * 1000)

        affected_scenes = list({d.get("affected_scene") for d in deps})
        affected_entities = list({d.get("entity_id") for d in deps})

        logger.info("Tool: get_downstream_dependencies", extra={
            "project_id": project_id, "scene_id": scene_id,
            "affected_scenes": len(affected_scenes), "latency_ms": latency_ms,
        })

        return {
            "project_id": project_id,
            "source_scene": scene_id,
            "affected_scene_count": len(affected_scenes),
            "affected_scenes": sorted(affected_scenes),
            "affected_entities": affected_entities,
            "dependency_details": deps,
            "latency_ms": latency_ms,
            "source": "ClickHouse scene_dependencies",
        }
    except Exception as e:
        logger.error(f"get_downstream_dependencies failed: {e}")
        return {"error": str(e), "affected_scenes": [], "affected_scene_count": 0}


# Tool 6: Search Production Events

def search_production_events(
    project_id: str,
    character: Optional[str] = None,
    scene_id: Optional[str] = None,
    take_id: Optional[str] = None,
    attribute: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 20,
) -> dict:
    """
    Search production events with structured filters.
    Use this for general queries. Never executes arbitrary SQL.

    Args:
        project_id: The production project identifier
        character: Filter by character (optional)
        scene_id: Filter by scene (optional)
        take_id: Filter by take (optional)
        attribute: Filter by attribute name (optional)
        event_type: Filter by event type e.g. VIDEO_OBSERVATION (optional)
        limit: Max results (default 20, max 100)

    Returns:
        dict with matching events
    """
    start = time.time()
    try:
        limit = min(max(1, limit), 100)  # Clamp to safe range
        events = _repo.search_production_events(
            project_id=project_id,
            character=character,
            scene_id=scene_id,
            take_id=take_id,
            attribute=attribute,
            event_type=event_type,
            limit=limit,
        )
        latency_ms = int((time.time() - start) * 1000)

        return {
            "project_id": project_id,
            "result_count": len(events),
            "events": events,
            "filters_applied": {
                k: v for k, v in {
                    "character": character, "scene_id": scene_id,
                    "take_id": take_id, "attribute": attribute,
                    "event_type": event_type,
                }.items() if v is not None
            },
            "latency_ms": latency_ms,
            "source": "ClickHouse production_events",
        }
    except Exception as e:
        logger.error(f"search_production_events failed: {e}")
        return {"error": str(e), "events": [], "result_count": 0}


# Tool 7: Project Stats

def get_project_stats(project_id: str) -> dict:
    """
    Get dashboard statistics for a project from ClickHouse.
    Returns scenes, takes, conflicts, and consistency score.

    Args:
        project_id: The production project identifier

    Returns:
        dict with project metrics
    """
    start = time.time()
    try:
        stats = _repo.get_project_stats(project_id=project_id)
        latency_ms = int((time.time() - start) * 1000)

        # Also get open conflicts count
        conflicts = _repo.get_open_conflicts(project_id=project_id)
        high_conflicts = [c for c in conflicts if c.get("severity") == "HIGH"]

        return {
            "project_id": project_id,
            **stats,
            "open_conflicts": len(conflicts),
            "high_severity_conflicts": len(high_conflicts),
            "latency_ms": latency_ms,
            "source": "ClickHouse analytical query",
        }
    except Exception as e:
        logger.error(f"get_project_stats failed: {e}")
        return {"error": str(e), "project_id": project_id}
