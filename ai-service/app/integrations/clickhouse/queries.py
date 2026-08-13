"""
CINESTATE — ClickHouse Parameterized Queries
All SQL is here. No SQL anywhere else in the codebase.
Parameters use {name:Type} syntax (clickhouse-connect native).
"""

# Character History
# Core query: drives State Agent and conflict detection
SELECT_CHARACTER_HISTORY = """
    SELECT
        pe.event_id,
        pe.scene_id,
        pe.take_id,
        pe.entity_id   AS character,
        pe.attribute_name AS attribute,
        pe.observed_value AS value,
        pe.expected_value,
        pe.confidence,
        pe.source_type,
        pe.source_reference,
        pe.event_type,
        pe.agent_name
    FROM production_events AS pe
    WHERE
        pe.project_id   = {project_id:String}
        AND pe.entity_id = {character:String}
        AND pe.attribute_name = {attribute:String}
        AND pe.observed_value != ''
    ORDER BY pe.scene_id ASC
"""

# Scene History
SELECT_SCENE_HISTORY = """
    SELECT
        event_id,
        scene_id,
        shot_id,
        take_id,
        entity_type,
        entity_id,
        event_type,
        attribute_name,
        observed_value,
        expected_value,
        confidence,
        source_type,
        source_reference,
        agent_name
    FROM production_events
    WHERE
        project_id = {project_id:String}
        AND scene_id = {scene_id:String}
"""

# Take Observations
SELECT_TAKE_OBSERVATIONS = """
    SELECT
        event_id,
        scene_id,
        take_id,
        entity_type,
        entity_id,
        attribute_name,
        observed_value,
        confidence,
        source_reference,
        metadata
    FROM production_events
    WHERE
        project_id = {project_id:String}
        AND take_id = {take_id:String}
        AND event_type IN ('VIDEO_OBSERVATION', 'AUDIO_OBSERVATION', 'DIALOGUE_OBSERVATION')
"""

# Open Conflicts
SELECT_OPEN_CONFLICTS = """
    SELECT
        conflict_id,
        project_id,
        scene_id,
        take_id,
        entity_type,
        entity_id,
        attribute_name,
        expected_value,
        observed_value,
        confidence,
        severity,
        status,
        blast_radius,
        recommendation
    FROM continuity_conflicts
    WHERE
        project_id = {project_id:String}
        AND status = 'OPEN'
    ORDER BY
        CASE severity
            WHEN 'HIGH'   THEN 1
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW'    THEN 3
            ELSE 4
        END ASC
"""

# Single Conflict
SELECT_CONFLICT_BY_ID = """
    SELECT *
    FROM continuity_conflicts
    WHERE conflict_id = {conflict_id:String}
    LIMIT 1
"""

# Downstream Dependencies (Blast Radius)
SELECT_DOWNSTREAM_DEPENDENCIES = """
    SELECT
        sd.scene_id          AS affected_scene,
        sd.depends_on_scene  AS source_scene,
        sd.entity_id,
        sd.attribute_name,
        sd.dependency_type
    FROM scene_dependencies AS sd
    WHERE
        sd.project_id       = {project_id:String}
        AND sd.depends_on_scene = {scene_id:String}
    ORDER BY sd.scene_id ASC
"""

# State Snapshots
SELECT_STATE_SNAPSHOTS = """
    SELECT
        snapshot_id,
        scene_id,
        entity_type,
        entity_id,
        attribute_name,
        attribute_value,
        confidence,
        introduced_scene
    FROM state_snapshots
    WHERE
        project_id = {project_id:String}
        AND scene_id <= {scene_id:String}
    ORDER BY scene_id DESC
"""

# Project Stats (Dashboard)
SELECT_PROJECT_STATS = """
    SELECT
        countIf(event_type = 'SCENE_CREATED')          AS total_scenes,
        countIf(event_type = 'TAKE_UPLOADED')           AS total_takes,
        countIf(event_type = 'VIDEO_OBSERVATION')       AS total_observations,
        countIf(event_type = 'CONTINUITY_CONFLICT')     AS total_conflicts,
        count()                                          AS total_events,
        round(
            (1 - (
                countIf(event_type = 'CONTINUITY_CONFLICT') /
                greatest(countIf(event_type = 'VIDEO_OBSERVATION'), 1)
            )) * 100,
            1
        )                                               AS consistency_score
    FROM production_events
    WHERE project_id = {project_id:String}
"""

# Agent Events (for real-time UI feed)
SELECT_AGENT_EVENTS = """
    SELECT
        log_id,
        agent_name,
        action,
        tool_name,
        result_summary,
        status,
        latency_ms,
        approval_status
    FROM agent_audit_log
    WHERE project_id = {project_id:String}
    LIMIT {limit:UInt32}
"""

# INSERT STATEMENTS (used by repository.py)
# These are defined here for reference; actual inserts use
# client.insert() with column_names for type safety.
INSERT_PRODUCTION_EVENT = "-- see repository.py insert_production_event()"
INSERT_STATE_SNAPSHOT   = "-- see repository.py insert_state_snapshot()"
INSERT_CONFLICT         = "-- see repository.py insert_conflict()"
INSERT_SCENE_DEPENDENCY = "-- see repository.py insert_scene_dependency()"
INSERT_AUDIT_LOG        = "-- see repository.py insert_audit_log()"
UPDATE_CONFLICT_STATUS  = "-- see repository.py approve_conflict()"
SELECT_PRODUCTION_EVENTS_SEARCH = "-- see repository.py search_production_events()"
