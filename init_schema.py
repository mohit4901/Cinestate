#!/usr/bin/env python3
"""
CINESTATE — ClickHouse Schema Initializer
Run once to create all tables in ClickHouse Cloud.
"""
import sys
import warnings
warnings.filterwarnings("ignore")

CLICKHOUSE_HOST = "zov6c09ywm.asia-northeast1.gcp.clickhouse.cloud"
CLICKHOUSE_PORT = 8443
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASSWORD = "YK0TzcQpix_xt"
CLICKHOUSE_DATABASE = "cinestate"

TABLES = [
    # ── Production Events (core analytical table) ────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.production_events (
        event_id        String DEFAULT generateUUIDv4(),
        project_id      String,
        production_day  String DEFAULT '',
        scene_id        String DEFAULT '',
        shot_id         String DEFAULT '',
        take_id         String DEFAULT '',
        entity_type     String,
        entity_id       String,
        event_type      String,
        observed_value  String DEFAULT '',
        expected_value  String DEFAULT '',
        attribute_name  String DEFAULT '',
        confidence      Float32 DEFAULT 1.0,
        source_type     String DEFAULT 'SCRIPT',
        source_reference String DEFAULT '',
        agent_name      String DEFAULT '',
        metadata        String DEFAULT '{}'
    )
    ENGINE = MergeTree()
    ORDER BY (project_id, entity_id, scene_id)
    """,

    # ── State Snapshots ───────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.state_snapshots (
        snapshot_id      String DEFAULT generateUUIDv4(),
        project_id       String,
        scene_id         String,
        entity_type      String,
        entity_id        String,
        attribute_name   String,
        attribute_value  String,
        confidence       Float32 DEFAULT 1.0,
        introduced_scene String DEFAULT '',
        evidence_event_id String DEFAULT '',
        created_at       DateTime64(3) DEFAULT now64()
    )
    ENGINE = ReplacingMergeTree(created_at)
    ORDER BY (project_id, scene_id, entity_id, attribute_name)
    """,

    # ── Continuity Conflicts ──────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.continuity_conflicts (
        conflict_id     String DEFAULT generateUUIDv4(),
        project_id      String,
        scene_id        String,
        take_id         String DEFAULT '',
        entity_type     String,
        entity_id       String,
        attribute_name  String,
        expected_value  String,
        observed_value  String,
        confidence      Float32,
        severity        String,
        status          String DEFAULT 'OPEN',
        blast_radius    String DEFAULT '{}',
        recommendation  String DEFAULT '',
        approved_by     String DEFAULT '',
        approved_at     Nullable(DateTime64(3)),
        created_at      DateTime64(3) DEFAULT now64()
    )
    ENGINE = MergeTree()
    ORDER BY (project_id, created_at)
    """,

    # ── Scene Dependencies (blast radius graph) ───────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.scene_dependencies (
        project_id       String,
        scene_id         String,
        depends_on_scene String,
        entity_id        String,
        attribute_name   String,
        dependency_type  String DEFAULT 'STATE',
        created_at       DateTime64(3) DEFAULT now64()
    )
    ENGINE = MergeTree()
    ORDER BY (project_id, depends_on_scene, scene_id)
    """,

    # ── Agent Audit Log ───────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.agent_audit_log (
        log_id          String DEFAULT generateUUIDv4(),
        project_id      String,
        agent_name      String,
        action          String,
        tool_name       String DEFAULT '',
        tool_args       String DEFAULT '{}',
        result_summary  String DEFAULT '',
        status          String,
        latency_ms      UInt32 DEFAULT 0,
        user_id         String DEFAULT '',
        approval_status String DEFAULT 'N/A',
        created_at      DateTime64(3) DEFAULT now64()
    )
    ENGINE = MergeTree()
    ORDER BY (project_id, created_at)
    """,

    # ── Projects (app state — no MongoDB needed) ──────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.projects (
        project_id      String,
        name            String,
        description     String DEFAULT '',
        production_day  String DEFAULT 'Day 1',
        status          String DEFAULT 'ACTIVE',
        created_by      String DEFAULT '',
        metadata        String DEFAULT '{}',
        created_at      DateTime64(3) DEFAULT now64(),
        updated_at      DateTime64(3) DEFAULT now64()
    )
    ENGINE = ReplacingMergeTree(updated_at)
    ORDER BY (project_id)
    """,

    # ── Scenes ────────────────────────────────────────────────
    """
    CREATE TABLE IF NOT EXISTS cinestate.scenes (
        project_id      String,
        scene_id        String,
        scene_number    UInt32 DEFAULT 0,
        location        String DEFAULT '',
        time_of_day     String DEFAULT '',
        characters      String DEFAULT '[]',
        props           String DEFAULT '[]',
        wardrobe        String DEFAULT '[]',
        description     String DEFAULT '',
        depends_on      String DEFAULT '[]',
        created_at      DateTime64(3) DEFAULT now64()
    )
    ENGINE = ReplacingMergeTree(created_at)
    ORDER BY (project_id, scene_id)
    """,
]

def init_schema():
    try:
        import clickhouse_connect
        client = clickhouse_connect.get_client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            username=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD,
            secure=True,
            verify=True,
        )
        print("✅ Connected to ClickHouse Cloud")

        # Create database
        client.command("CREATE DATABASE IF NOT EXISTS cinestate")
        print("✅ Database 'cinestate' ready")

        # Create tables
        for i, ddl in enumerate(TABLES, 1):
            table_name = ddl.strip().split("IF NOT EXISTS ")[1].split(" ")[0]
            client.command(ddl)
            print(f"✅ Table {i}/{len(TABLES)}: {table_name}")

        # Verify
        result = client.query("SHOW TABLES FROM cinestate")
        tables = [row[0] for row in result.result_rows]
        print(f"\n📊 Tables created: {tables}")
        print("\n🎉 CINESTATE ClickHouse schema initialized!")
        client.close()
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = init_schema()
    sys.exit(0 if success else 1)
