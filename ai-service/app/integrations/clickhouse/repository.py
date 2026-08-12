"""
CINESTATE — ClickHouse Repository
All production data read/write goes through here.
Parameterized queries only — no raw user SQL ever reaches ClickHouse.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from app.integrations.clickhouse.client import get_client
from app.integrations.clickhouse.queries import (
    INSERT_PRODUCTION_EVENT,
    INSERT_STATE_SNAPSHOT,
    INSERT_CONFLICT,
    INSERT_SCENE_DEPENDENCY,
    INSERT_AUDIT_LOG,
    SELECT_CHARACTER_HISTORY,
    SELECT_SCENE_HISTORY,
    SELECT_TAKE_OBSERVATIONS,
    SELECT_OPEN_CONFLICTS,
    SELECT_CONFLICT_BY_ID,
    SELECT_DOWNSTREAM_DEPENDENCIES,
    SELECT_PRODUCTION_EVENTS_SEARCH,
    SELECT_STATE_SNAPSHOTS,
    SELECT_PROJECT_STATS,
    UPDATE_CONFLICT_STATUS,
)
from app.models.schemas import (
    ProductionEvent,
    StateSnapshot,
    ContinuityConflict,
    SceneDependency,
    AgentAuditEntry,
)

logger = logging.getLogger(__name__)


class ClickHouseRepository:
    """
    Single source of truth for all ClickHouse operations in CINESTATE.
    The agents and tools use this — never raw SQL from LLM.
    """

    # ── WRITES ──────────────────────────────────────────────────

    def insert_production_event(self, event: ProductionEvent) -> str:
        """Write a production event to ClickHouse."""
        client = get_client()
        event_id = str(uuid.uuid4())
        client.insert(
            "production_events",
            [
                [
                    event_id,
                    event.project_id,
                    event.production_day or "",
                    event.scene_id or "",
                    event.shot_id or "",
                    event.take_id or "",
                    event.entity_type,
                    event.entity_id,
                    event.event_type,
                    event.observed_value or "",
                    event.expected_value or "",
                    event.attribute_name or "",
                    float(event.confidence),
                    event.source_type or "SCRIPT",
                    event.source_reference or "",
                    event.agent_name or "",
                    json.dumps(event.metadata or {}),
                ]
            ],
            column_names=[
                "event_id", "project_id", "production_day", "scene_id",
                "shot_id", "take_id", "entity_type", "entity_id", "event_type",
                "observed_value", "expected_value", "attribute_name", "confidence",
                "source_type", "source_reference", "agent_name", "metadata",
            ],
        )
        logger.info(
            "Production event inserted",
            extra={
                "event_id": event_id,
                "event_type": event.event_type,
                "project_id": event.project_id,
                "entity_id": event.entity_id,
            },
        )
        return event_id

    def insert_production_events_batch(self, events: list[ProductionEvent]) -> list[str]:
        """Batch insert for efficiency during script processing."""
        event_ids = []
        rows = []
        for event in events:
            eid = str(uuid.uuid4())
            event_ids.append(eid)
            rows.append([
                eid,
                event.project_id,
                event.production_day or "",
                event.scene_id or "",
                event.shot_id or "",
                event.take_id or "",
                event.entity_type,
                event.entity_id,
                event.event_type,
                event.observed_value or "",
                event.expected_value or "",
                event.attribute_name or "",
                float(event.confidence),
                event.source_type or "SCRIPT",
                event.source_reference or "",
                event.agent_name or "",
                json.dumps(event.metadata or {}),
            ])
        if rows:
            client = get_client()
            client.insert(
                "production_events",
                rows,
                column_names=[
                    "event_id", "project_id", "production_day", "scene_id",
                    "shot_id", "take_id", "entity_type", "entity_id", "event_type",
                    "observed_value", "expected_value", "attribute_name", "confidence",
                    "source_type", "source_reference", "agent_name", "metadata",
                ],
            )
        logger.info(f"Batch inserted {len(rows)} production events")
        return event_ids

    def insert_state_snapshot(self, snapshot: StateSnapshot) -> str:
        """Record a point-in-time state snapshot after a scene."""
        client = get_client()
        snapshot_id = str(uuid.uuid4())
        client.insert(
            "state_snapshots",
            [[
                snapshot_id,
                snapshot.project_id,
                snapshot.scene_id,
                snapshot.entity_type,
                snapshot.entity_id,
                snapshot.attribute_name,
                snapshot.attribute_value,
                float(snapshot.confidence),
                snapshot.introduced_scene or "",
                snapshot.evidence_event_id or "",
            ]],
            column_names=[
                "snapshot_id", "project_id", "scene_id", "entity_type",
                "entity_id", "attribute_name", "attribute_value", "confidence",
                "introduced_scene", "evidence_event_id",
            ],
        )
        return snapshot_id

    def insert_conflict(self, conflict: ContinuityConflict) -> str:
        """Record a detected continuity conflict."""
        client = get_client()
        conflict_id = str(uuid.uuid4())
        client.insert(
            "continuity_conflicts",
            [[
                conflict_id,
                conflict.project_id,
                conflict.scene_id,
                conflict.take_id or "",
                conflict.entity_type,
                conflict.entity_id,
                conflict.attribute_name,
                conflict.expected_value,
                conflict.observed_value,
                float(conflict.confidence),
                conflict.severity,
                "OPEN",
                json.dumps(conflict.blast_radius or {}),
                conflict.recommendation or "",
            ]],
            column_names=[
                "conflict_id", "project_id", "scene_id", "take_id",
                "entity_type", "entity_id", "attribute_name", "expected_value",
                "observed_value", "confidence", "severity", "status",
                "blast_radius", "recommendation",
            ],
        )
        logger.info(
            "Conflict recorded",
            extra={
                "conflict_id": conflict_id,
                "severity": conflict.severity,
                "attribute": conflict.attribute_name,
                "expected": conflict.expected_value,
                "observed": conflict.observed_value,
            },
        )
        return conflict_id

    def insert_scene_dependency(self, dep: SceneDependency) -> None:
        """Record that scene X depends on state established by scene Y."""
        client = get_client()
        client.insert(
            "scene_dependencies",
            [[
                dep.project_id,
                dep.scene_id,
                dep.depends_on_scene,
                dep.entity_id,
                dep.attribute_name,
                dep.dependency_type or "STATE",
            ]],
            column_names=[
                "project_id", "scene_id", "depends_on_scene",
                "entity_id", "attribute_name", "dependency_type",
            ],
        )

    def insert_audit_log(self, entry: AgentAuditEntry) -> str:
        """Write an agent action to the audit log."""
        client = get_client()
        log_id = str(uuid.uuid4())
        client.insert(
            "agent_audit_log",
            [[
                log_id,
                entry.project_id,
                entry.agent_name,
                entry.action,
                entry.tool_name or "",
                json.dumps(entry.tool_args or {}),
                entry.result_summary or "",
                entry.status,
                int(entry.latency_ms or 0),
                entry.user_id or "",
                entry.approval_status or "N/A",
            ]],
            column_names=[
                "log_id", "project_id", "agent_name", "action", "tool_name",
                "tool_args", "result_summary", "status", "latency_ms",
                "user_id", "approval_status",
            ],
        )
        return log_id

    def approve_conflict(self, conflict_id: str, approved_by: str) -> None:
        """Mark a conflict as approved — requires human action."""
        client = get_client()
        client.command(
            """
            ALTER TABLE continuity_conflicts UPDATE
                status = 'APPROVED',
                approved_by = {approved_by:String},
                approved_at = now64()
            WHERE conflict_id = {conflict_id:String}
            """,
            parameters={"conflict_id": conflict_id, "approved_by": approved_by},
        )
        logger.info("Conflict approved", extra={"conflict_id": conflict_id, "by": approved_by})

    def reject_conflict(self, conflict_id: str, rejected_by: str) -> None:
        """Mark a conflict as rejected."""
        client = get_client()
        client.command(
            """
            ALTER TABLE continuity_conflicts UPDATE
                status = 'REJECTED',
                approved_by = {rejected_by:String},
                approved_at = now64()
            WHERE conflict_id = {conflict_id:String}
            """,
            parameters={"conflict_id": conflict_id, "rejected_by": rejected_by},
        )

    # ── READS ───────────────────────────────────────────────────

    def get_character_history(
        self,
        project_id: str,
        character: str,
        attribute: str,
    ) -> list[dict]:
        """
        Retrieve chronological history of a character attribute.
        Core tool for the State Agent — drives conflict detection.
        """
        client = get_client()
        result = client.query(
            SELECT_CHARACTER_HISTORY,
            parameters={
                "project_id": project_id,
                "character": character,
                "attribute": attribute,
            },
        )
        rows = result.named_results()
        logger.info(
            "Character history retrieved",
            extra={
                "project_id": project_id,
                "character": character,
                "attribute": attribute,
                "count": len(rows),
            },
        )
        return [dict(r) for r in rows]

    def get_scene_history(self, project_id: str, scene_id: str) -> list[dict]:
        """All production events for a given scene."""
        client = get_client()
        result = client.query(
            SELECT_SCENE_HISTORY,
            parameters={"project_id": project_id, "scene_id": scene_id},
        )
        return [dict(r) for r in result.named_results()]

    def get_take_observations(self, project_id: str, take_id: str) -> list[dict]:
        """All structured observations extracted from a video take."""
        client = get_client()
        result = client.query(
            SELECT_TAKE_OBSERVATIONS,
            parameters={"project_id": project_id, "take_id": take_id},
        )
        return [dict(r) for r in result.named_results()]

    def get_open_conflicts(self, project_id: str) -> list[dict]:
        """All open continuity conflicts for a project."""
        client = get_client()
        result = client.query(
            SELECT_OPEN_CONFLICTS,
            parameters={"project_id": project_id},
        )
        return [dict(r) for r in result.named_results()]

    def get_conflict_by_id(self, conflict_id: str) -> Optional[dict]:
        """Single conflict details."""
        client = get_client()
        result = client.query(
            SELECT_CONFLICT_BY_ID,
            parameters={"conflict_id": conflict_id},
        )
        rows = [dict(r) for r in result.named_results()]
        return rows[0] if rows else None

    def get_downstream_dependencies(
        self, project_id: str, scene_id: str
    ) -> list[dict]:
        """
        Blast Radius: find all scenes that depend on the state
        established in scene_id.
        """
        client = get_client()
        result = client.query(
            SELECT_DOWNSTREAM_DEPENDENCIES,
            parameters={"project_id": project_id, "scene_id": scene_id},
        )
        rows = [dict(r) for r in result.named_results()]
        logger.info(
            "Downstream dependencies retrieved",
            extra={
                "project_id": project_id,
                "scene_id": scene_id,
                "affected_scenes": len(rows),
            },
        )
        return rows

    def get_state_snapshots(
        self, project_id: str, scene_id: str, entity_id: Optional[str] = None
    ) -> list[dict]:
        """Get production state as established at a given scene."""
        client = get_client()
        query = SELECT_STATE_SNAPSHOTS
        params: dict = {"project_id": project_id, "scene_id": scene_id}
        if entity_id:
            query += " AND entity_id = {entity_id:String}"
            params["entity_id"] = entity_id
        result = client.query(query, parameters=params)
        return [dict(r) for r in result.named_results()]

    def search_production_events(
        self,
        project_id: str,
        character: Optional[str] = None,
        scene_id: Optional[str] = None,
        take_id: Optional[str] = None,
        attribute: Optional[str] = None,
        event_type: Optional[str] = None,
        limit: int = 50,
    ) -> list[dict]:
        """
        Structured search over production events.
        Gemini calls this via tool — never raw SQL.
        """
        conditions = ["project_id = {project_id:String}"]
        params: dict = {"project_id": project_id, "limit": min(limit, 200)}

        if character:
            conditions.append("entity_id = {character:String}")
            params["character"] = character
        if scene_id:
            conditions.append("scene_id = {scene_id:String}")
            params["scene_id"] = scene_id
        if take_id:
            conditions.append("take_id = {take_id:String}")
            params["take_id"] = take_id
        if attribute:
            conditions.append("attribute_name = {attribute:String}")
            params["attribute"] = attribute
        if event_type:
            conditions.append("event_type = {event_type:String}")
            params["event_type"] = event_type

        where = " AND ".join(conditions)
        query = f"""
            SELECT *
            FROM production_events
            WHERE {where}
            LIMIT {{limit:UInt32}}
        """
        client = get_client()
        result = client.query(query, parameters=params)
        return [dict(r) for r in result.named_results()]

    def get_project_stats(self, project_id: str) -> dict:
        """Dashboard stats — scenes, events, conflicts, consistency score."""
        client = get_client()
        result = client.query(
            SELECT_PROJECT_STATS,
            parameters={"project_id": project_id},
        )
        rows = [dict(r) for r in result.named_results()]
        return rows[0] if rows else {}
