-- ============================================================
-- CINESTATE — ClickHouse Schema
-- Production Event Memory
-- ============================================================

CREATE DATABASE IF NOT EXISTS cinestate;

USE cinestate;

-- ── Production Events ─────────────────────────────────────────
-- The core analytical table. Every meaningful production event
-- is stored here as an immutable record.
CREATE TABLE IF NOT EXISTS production_events (
    event_id        UUID DEFAULT generateUUIDv4(),
    project_id      String,
    production_day  String DEFAULT '',
    scene_id        String DEFAULT '',
    shot_id         String DEFAULT '',
    take_id         String DEFAULT '',
    entity_type     String,        -- CHARACTER, PROP, COSTUME, LOCATION, SCENE
    entity_id       String,        -- e.g. "arjun", "black_jacket"
    event_type      String,        -- SCRIPT_FACT, VIDEO_OBSERVATION, CONTINUITY_CONFLICT, etc.
    observed_value  String DEFAULT '',
    expected_value  String DEFAULT '',
    attribute_name  String DEFAULT '',
    confidence      Float32 DEFAULT 1.0,
    source_type     String DEFAULT 'SCRIPT', -- SCRIPT, VIDEO, AUDIO, MANUAL
    source_reference String DEFAULT '',       -- e.g. "scene_17_take_2.mp4@00:18.2"
    agent_name      String DEFAULT '',
    metadata        String DEFAULT '{}',      -- JSON blob for extra fields
    created_at      DateTime64(3) DEFAULT now64()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (project_id, entity_id, created_at)
TTL created_at + INTERVAL 2 YEAR;

-- ── Production State Snapshots ────────────────────────────────
-- Point-in-time snapshots of character/prop state after each scene.
CREATE TABLE IF NOT EXISTS state_snapshots (
    snapshot_id     UUID DEFAULT generateUUIDv4(),
    project_id      String,
    scene_id        String,
    entity_type     String,
    entity_id       String,
    attribute_name  String,
    attribute_value String,
    confidence      Float32 DEFAULT 1.0,
    introduced_scene String DEFAULT '',
    evidence_event_id String DEFAULT '',
    created_at      DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(created_at)
PARTITION BY toYYYYMM(created_at)
ORDER BY (project_id, scene_id, entity_id, attribute_name);

-- ── Continuity Conflicts ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS continuity_conflicts (
    conflict_id     UUID DEFAULT generateUUIDv4(),
    project_id      String,
    scene_id        String,
    take_id         String DEFAULT '',
    entity_type     String,
    entity_id       String,
    attribute_name  String,
    expected_value  String,
    observed_value  String,
    confidence      Float32,
    severity        String,  -- HIGH, MEDIUM, LOW
    status          String DEFAULT 'OPEN',  -- OPEN, APPROVED, REJECTED, RESOLVED
    blast_radius    String DEFAULT '{}',  -- JSON: affected_scenes, affected_assets
    recommendation  String DEFAULT '',
    approved_by     String DEFAULT '',
    approved_at     Nullable(DateTime64(3)),
    created_at      DateTime64(3) DEFAULT now64()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (project_id, created_at);

-- ── Scene Dependencies ────────────────────────────────────────
-- Tracks which scenes depend on which state facts.
CREATE TABLE IF NOT EXISTS scene_dependencies (
    project_id       String,
    scene_id         String,       -- scene that DEPENDS ON the state
    depends_on_scene String,       -- scene that ESTABLISHED the state
    entity_id        String,
    attribute_name   String,
    dependency_type  String DEFAULT 'STATE',  -- STATE, LOCATION, PROP, CHARACTER
    created_at       DateTime64(3) DEFAULT now64()
)
ENGINE = MergeTree()
PARTITION BY project_id
ORDER BY (project_id, depends_on_scene, scene_id);

-- ── Agent Audit Log ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_audit_log (
    log_id          UUID DEFAULT generateUUIDv4(),
    project_id      String,
    agent_name      String,
    action          String,
    tool_name       String DEFAULT '',
    tool_args       String DEFAULT '{}',
    result_summary  String DEFAULT '',
    status          String,  -- SUCCESS, FAILURE, PENDING
    latency_ms      UInt32 DEFAULT 0,
    user_id         String DEFAULT '',
    approval_status String DEFAULT 'N/A',
    created_at      DateTime64(3) DEFAULT now64()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (project_id, created_at);

-- ── Views ─────────────────────────────────────────────────────

-- Latest state per entity per scene
CREATE VIEW IF NOT EXISTS v_current_state AS
SELECT
    project_id,
    scene_id,
    entity_type,
    entity_id,
    attribute_name,
    attribute_value,
    confidence,
    introduced_scene,
    max(created_at) AS last_updated
FROM state_snapshots
GROUP BY project_id, scene_id, entity_type, entity_id, attribute_name,
         attribute_value, confidence, introduced_scene;

-- Open conflicts summary
CREATE VIEW IF NOT EXISTS v_open_conflicts AS
SELECT
    project_id,
    conflict_id,
    scene_id,
    entity_id,
    attribute_name,
    expected_value,
    observed_value,
    severity,
    confidence,
    created_at
FROM continuity_conflicts
WHERE status = 'OPEN'
ORDER BY created_at DESC;
