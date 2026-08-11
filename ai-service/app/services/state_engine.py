"""
CINESTATE — Production State Engine
Manages historical state retrieval and merging from ClickHouse.
"""

import logging
from typing import Optional
from app.integrations.clickhouse.repository import ClickHouseRepository
from app.models.schemas import (
    ProductionEvent, StateSnapshot, EventType, EntityType,
    VisualObservation, ProductionState,
)

logger = logging.getLogger(__name__)


class StateEngine:
    """
    Manages production state — retrieves history from ClickHouse,
    merges new observations, maintains versioned snapshots.
    """

    def __init__(self):
        self.repo = ClickHouseRepository()

    def get_established_state(
        self,
        project_id: str,
        entity_id: str,
        as_of_scene: str,
    ) -> dict[str, dict]:
        """
        Retrieve established state for an entity up to (and including) a scene.
        Returns: {attribute_name: {value, confidence, scene, source}}
        """
        try:
            # Get chronological character history for all attributes
            snapshots = self.repo.get_state_snapshots(
                project_id=project_id,
                scene_id=as_of_scene,
                entity_id=entity_id,
            )

            # Build state dict — latest value per attribute wins
            state: dict[str, dict] = {}
            for snap in snapshots:
                attr = snap["attribute_name"]
                # Since ordered by scene DESC, first occurrence = latest known state
                if attr not in state:
                    state[attr] = {
                        "value": snap["attribute_value"],
                        "confidence": snap["confidence"],
                        "scene": snap["introduced_scene"] or snap["scene_id"],
                        "source": "state_snapshot",
                    }

            logger.info(
                "State retrieved",
                extra={
                    "project_id": project_id,
                    "entity_id": entity_id,
                    "as_of_scene": as_of_scene,
                    "attributes_found": len(state),
                },
            )
            return state

        except Exception as e:
            logger.error(f"State retrieval failed: {e}")
            return {}

    def get_character_attribute_history(
        self,
        project_id: str,
        character: str,
        attribute: str,
    ) -> list[dict]:
        """
        Full chronological history for one attribute.
        Used by the Impact Agent and Conflict Center UI.
        """
        return self.repo.get_character_history(
            project_id=project_id,
            character=character,
            attribute=attribute,
        )

    def record_observations_as_state(
        self,
        project_id: str,
        scene_id: str,
        take_id: str,
        entity_id: str,
        entity_type: EntityType,
        observations: list[VisualObservation],
        agent_name: str = "EvidenceAgent",
    ) -> list[str]:
        """
        After Gemini extracts observations from a video take,
        store them as production events AND state snapshots.
        """
        event_ids = []
        for obs in observations:
            # 1. Write as production event
            event = ProductionEvent(
                project_id=project_id,
                event_type=EventType.VIDEO_OBSERVATION,
                entity_type=entity_type,
                entity_id=entity_id,
                scene_id=scene_id,
                take_id=take_id,
                attribute_name=obs.attribute_name,
                observed_value=obs.value,
                confidence=obs.confidence,
                source_type="VIDEO",
                source_reference=obs.timestamp or "",
                agent_name=agent_name,
                metadata={"evidence_note": obs.evidence_note},
            )
            eid = self.repo.insert_production_event(event)
            event_ids.append(eid)

            # 2. Write as state snapshot (for future comparisons)
            snapshot = StateSnapshot(
                project_id=project_id,
                scene_id=scene_id,
                entity_type=entity_type,
                entity_id=entity_id,
                attribute_name=obs.attribute_name,
                attribute_value=obs.value,
                confidence=obs.confidence,
                introduced_scene=scene_id,
                evidence_event_id=eid,
            )
            self.repo.insert_state_snapshot(snapshot)

        logger.info(
            f"Recorded {len(observations)} observations as state",
            extra={"project_id": project_id, "scene_id": scene_id, "entity": entity_id},
        )
        return event_ids

    def establish_script_state(
        self,
        project_id: str,
        scene_id: str,
        entity_id: str,
        entity_type: EntityType,
        attribute_name: str,
        value: str,
        confidence: float = 0.95,
        agent_name: str = "ScriptAgent",
    ) -> str:
        """
        When script is parsed, establish ground-truth state facts.
        These become the 'expected' values for future comparisons.
        """
        event = ProductionEvent(
            project_id=project_id,
            event_type=EventType.SCRIPT_FACT,
            entity_type=entity_type,
            entity_id=entity_id,
            scene_id=scene_id,
            attribute_name=attribute_name,
            observed_value=value,
            confidence=confidence,
            source_type="SCRIPT",
            agent_name=agent_name,
        )
        eid = self.repo.insert_production_event(event)

        snapshot = StateSnapshot(
            project_id=project_id,
            scene_id=scene_id,
            entity_type=entity_type,
            entity_id=entity_id,
            attribute_name=attribute_name,
            attribute_value=value,
            confidence=confidence,
            introduced_scene=scene_id,
            evidence_event_id=eid,
        )
        self.repo.insert_state_snapshot(snapshot)
        return eid
