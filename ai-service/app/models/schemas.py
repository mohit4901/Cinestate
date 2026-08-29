"""
CINESTATE — Pydantic Schemas
All data structures used across agents, tools, and ClickHouse.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


# Enums

class EventType(str, Enum):
    SCRIPT_FACT           = "SCRIPT_FACT"
    SCENE_CREATED         = "SCENE_CREATED"
    CHARACTER_STATE       = "CHARACTER_STATE"
    PROP_STATE            = "PROP_STATE"
    COSTUME_STATE         = "COSTUME_STATE"
    LOCATION_STATE        = "LOCATION_STATE"
    SHOT_CREATED          = "SHOT_CREATED"
    TAKE_UPLOADED         = "TAKE_UPLOADED"
    VIDEO_OBSERVATION     = "VIDEO_OBSERVATION"
    AUDIO_OBSERVATION     = "AUDIO_OBSERVATION"
    DIALOGUE_OBSERVATION  = "DIALOGUE_OBSERVATION"
    CONTINUITY_CONFLICT   = "CONTINUITY_CONFLICT"
    IMPACT_DISCOVERED     = "IMPACT_DISCOVERED"
    RECOMMENDATION_CREATED = "RECOMMENDATION_CREATED"
    APPROVAL_REQUESTED    = "APPROVAL_REQUESTED"
    APPROVAL_GRANTED      = "APPROVAL_GRANTED"
    ACTION_EXECUTED       = "ACTION_EXECUTED"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_upper = value.upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        return cls.VIDEO_OBSERVATION


class EntityType(str, Enum):
    CHARACTER = "CHARACTER"
    PROP      = "PROP"
    COSTUME   = "COSTUME"
    LOCATION  = "LOCATION"
    SCENE     = "SCENE"
    ACCESSORY = "ACCESSORY"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_upper = value.upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        return cls.CHARACTER


class Severity(str, Enum):
    HIGH   = "HIGH"
    MEDIUM = "MEDIUM"
    LOW    = "LOW"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_upper = value.upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        return cls.MEDIUM


class ConflictStatus(str, Enum):
    OPEN     = "OPEN"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RESOLVED = "RESOLVED"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            val_upper = value.upper()
            for member in cls:
                if member.value == val_upper:
                    return member
        return cls.OPEN


# Production Event

class ProductionEvent(BaseModel):
    project_id:       str
    event_type:       EventType
    entity_type:      EntityType
    entity_id:        str                     # e.g. "arjun", "black_jacket"
    production_day:   Optional[str] = None
    scene_id:         Optional[str] = None
    shot_id:          Optional[str] = None
    take_id:          Optional[str] = None
    attribute_name:   Optional[str] = None   # e.g. "injury_location"
    observed_value:   Optional[str] = None   # e.g. "right_arm"
    expected_value:   Optional[str] = None   # e.g. "left_arm"
    confidence:       float = Field(default=1.0, ge=0.0, le=1.0)
    source_type:      Optional[str] = "SCRIPT"
    source_reference: Optional[str] = None   # e.g. "scene_25_take3.mp4@00:12.8"
    agent_name:       Optional[str] = None
    metadata:         Optional[dict[str, Any]] = None


# Gemini Observation

class VisualObservation(BaseModel):
    """Single observation extracted by Gemini from video/image."""
    entity_type:    EntityType
    entity_id:      str
    attribute_name: str
    value:          str
    confidence:     float = Field(ge=0.0, le=1.0)
    timestamp:      Optional[str] = None    # e.g. "00:12.8"
    evidence_note:  Optional[str] = None    # brief Gemini description


class VideoAnalysisResult(BaseModel):
    """Structured output from Evidence Agent video analysis."""
    scene_id:       str
    take_id:        str
    observations:   list[VisualObservation]
    raw_description: Optional[str] = None
    processing_ms:  Optional[int] = None


# State

class StateSnapshot(BaseModel):
    project_id:       str
    scene_id:         str
    entity_type:      EntityType
    entity_id:        str
    attribute_name:   str
    attribute_value:  str
    confidence:       float = 1.0
    introduced_scene: Optional[str] = None
    evidence_event_id: Optional[str] = None


class ProductionState(BaseModel):
    """The current known state of an entity across all attributes."""
    project_id:  str
    entity_id:   str
    entity_type: EntityType
    as_of_scene: str
    attributes:  dict[str, dict]   # attr → {value, confidence, scene, source}


# Conflict

class ContinuityConflict(BaseModel):
    project_id:     str
    scene_id:       str
    entity_type:    EntityType
    entity_id:      str
    attribute_name: str
    expected_value: str
    observed_value: str
    confidence:     float
    severity:       Severity
    take_id:        Optional[str] = None
    blast_radius:   Optional[dict] = None
    recommendation: Optional[str] = None


class ConflictResult(BaseModel):
    """Output from the deterministic conflict engine."""
    conflict:        bool
    attribute_name:  str
    expected_value:  str
    observed_value:  str
    confidence:      float
    severity:        Severity
    reason:          str


# Blast Radius

class BlastRadius(BaseModel):
    conflict_scene:   str
    affected_scenes:  list[str]
    affected_assets:  int
    severity:         Severity
    explanation:      str


# Recommendation

class RecommendationResult(BaseModel):
    action:       str    # e.g. "RESHOOT_TAKE", "ACCEPT_EXCEPTION", "FLAG_EDITOR"
    reasoning:    str
    urgency:      Severity
    requires_approval: bool = True


# Scene Dependency

class SceneDependency(BaseModel):
    project_id:      str
    scene_id:        str       # depends-on scene
    depends_on_scene: str      # scene that established the state
    entity_id:       str
    attribute_name:  str
    dependency_type: str = "STATE"


# Agent Audit

class AgentAuditEntry(BaseModel):
    project_id:     str
    agent_name:     str
    action:         str
    tool_name:      Optional[str] = None
    tool_args:      Optional[dict] = None
    result_summary: Optional[str] = None
    status:         str            # SUCCESS, FAILURE, PENDING
    latency_ms:     Optional[int] = None
    user_id:        Optional[str] = None
    approval_status: Optional[str] = "N/A"


# Script Extraction

class SceneCharacterState(BaseModel):
    character:   str
    attribute:   str
    value:       str
    confidence:  float = 0.95
    source_note: Optional[str] = None


class ExtractedScene(BaseModel):
    scene_id:     str
    scene_number: int
    location:     str
    time_of_day:  str             # DAY / NIGHT / DAWN / DUSK
    characters:   list[str]
    props:        list[str]
    wardrobe:     list[str]
    description:  str
    states:       list[SceneCharacterState]
    depends_on:   list[str] = []  # scene IDs this scene references


class ScriptAnalysisResult(BaseModel):
    project_id:     str
    total_scenes:   int
    characters:     list[str]
    locations:      list[str]
    scenes:         list[ExtractedScene]
    continuity_dependencies: int


# API Request/Response

class AnalyzeScriptRequest(BaseModel):
    project_id:    str
    file_path:     str
    production_day: Optional[str] = "Day 1"


class AnalyzeMediaRequest(BaseModel):
    project_id: Optional[str] = "project-aurora"
    scene_id:   Optional[str] = "scene_25"
    take_id:    Optional[str] = "take_03"
    file_path:  Optional[str] = ""
    entity_id:  Optional[str] = "arjun"


class ConflictCheckRequest(BaseModel):
    project_id:   str
    scene_id:     str
    take_id:      str
    observations: list[VisualObservation]


class ApprovalRequest(BaseModel):
    conflict_id: str
    approved_by: str
    action:      str   # "APPROVE" | "REJECT" | "REVIEW"
    notes:       Optional[str] = None
    project_id:  Optional[str] = "project-aurora"


class AgentResponse(BaseModel):
    success:    bool
    message:    str
    data:       Optional[dict] = None
    agent_log:  list[dict] = []
