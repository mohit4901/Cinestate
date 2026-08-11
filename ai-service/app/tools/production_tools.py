"""
CINESTATE — Production Tools
Helper tools for conflict recording, deterministic state comparison, and blast radius calculation.
"""

from app.services.conflict_engine import compare_states
from app.integrations.clickhouse.repository import ClickHouseRepository
from app.models.schemas import ContinuityConflict, Severity, EntityType

_repo = ClickHouseRepository()


def compare_states_tool(
    attribute_name: str,
    expected_value: str,
    observed_value: str,
    confidence: float,
) -> dict:
    """
    Deterministic comparison tool for ADK agents.
    Checks expected vs observed value and returns severity.
    """
    res = compare_states(attribute_name, expected_value, observed_value, confidence)
    return res.model_dump()


def record_conflict_tool(
    project_id: str,
    scene_id: str,
    take_id: str,
    character: str,
    attribute_name: str,
    expected_value: str,
    observed_value: str,
    confidence: float,
    severity: str,
    recommendation: str,
) -> dict:
    """
    Record a verified continuity conflict into ClickHouse Cloud.
    """
    try:
        conflict = ContinuityConflict(
            project_id=project_id,
            scene_id=scene_id,
            take_id=take_id,
            entity_type=EntityType.CHARACTER,
            entity_id=character,
            attribute_name=attribute_name,
            expected_value=expected_value,
            observed_value=observed_value,
            confidence=confidence,
            severity=Severity(severity.upper()),
            recommendation=recommendation,
        )
        conflict_id = _repo.insert_conflict(conflict)
        return {"success": True, "conflict_id": conflict_id}
    except Exception as e:
        return {"success": False, "error": str(e)}


def approve_conflict_tool(conflict_id: str, approved_by: str, action: str) -> dict:
    """
    Approve or reject a conflict in ClickHouse.
    """
    try:
        if action.upper() == "APPROVE":
            _repo.approve_conflict(conflict_id, approved_by)
        else:
            _repo.reject_conflict(conflict_id, approved_by)
        return {"success": True, "conflict_id": conflict_id, "status": action}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_blast_radius_tool(project_id: str, scene_id: str) -> dict:
    """
    Calculate blast radius (downstream scene dependencies) from ClickHouse.
    """
    deps = _repo.get_downstream_dependencies(project_id, scene_id)
    affected = list({d["affected_scene"] for d in deps})
    return {
        "project_id": project_id,
        "source_scene": scene_id,
        "affected_scene_count": len(affected),
        "affected_scenes": sorted(affected),
    }
