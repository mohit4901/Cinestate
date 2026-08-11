#!/usr/bin/env python3
"""
CINESTATE — Project Aurora Demo Data Seeder
Seeds ClickHouse Cloud with deterministic demo data.

The known conflict:
  Scene 17: Arjun injury = left_arm  (established by script)
  Scene 21: Arjun injury = left_arm  (confirmed on set)
  Scene 25 Take 3: Gemini observes = right_arm  ← CONFLICT!
  Scenes 26, 28, 31 depend on Scene 17 state → Blast Radius

Run: python3 seed_demo.py
"""
import sys
import uuid
import json
import warnings
warnings.filterwarnings("ignore")

CLICKHOUSE_HOST = "zov6c09ywm.asia-northeast1.gcp.clickhouse.cloud"
CLICKHOUSE_PORT = 8443
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASSWORD = "YK0TzcQpix_xt"

PROJECT_ID = "project-aurora"

def seed():
    try:
        import clickhouse_connect
        client = clickhouse_connect.get_client(
            host=CLICKHOUSE_HOST, port=CLICKHOUSE_PORT,
            username=CLICKHOUSE_USER, password=CLICKHOUSE_PASSWORD,
            secure=True, database="cinestate",
            connect_timeout=30, send_receive_timeout=60,
        )
        print("✅ Connected to ClickHouse Cloud")

        # ── Clear existing demo data ──────────────────────────────
        client.command(f"DELETE FROM projects WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM production_events WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM state_snapshots WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM continuity_conflicts WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM scene_dependencies WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM scenes WHERE project_id='{PROJECT_ID}'")
        client.command(f"DELETE FROM agent_audit_log WHERE project_id='{PROJECT_ID}'")
        print("🧹 Cleared existing demo data")

        # ── 1. Project ────────────────────────────────────────────
        client.insert("projects", [[
            PROJECT_ID, "Project Aurora",
            "A psychological thriller set in a remote research station in Antarctica.",
            "Day 17", "ACTIVE", "demo",
            json.dumps({"genre": "Thriller", "director": "Demo Director",
                        "production_company": "Aurora Films"}),
        ]], column_names=["project_id","name","description","production_day",
                          "status","created_by","metadata"])
        print("✅ Project Aurora created")

        # ── 2. Scenes ─────────────────────────────────────────────
        scenes_data = [
            (PROJECT_ID,"scene_01",1,"INT. RESEARCH STATION - CORRIDOR","DAY",
             '["Arjun","Maya"]','["Research files","Flashlight"]','["White lab coat","Black jacket"]',
             "Arjun and Maya discover the abandoned station. Arjun slips and injures his LEFT ARM.",'[]'),

            (PROJECT_ID,"scene_17",17,"INT. HOTEL ROOM - NIGHT","NIGHT",
             '["Arjun"]','["Whiskey glass","Watch"]','["Black jacket","White shirt"]',
             "Arjun tends to his LEFT ARM injury. His watch is on his LEFT WRIST. Black jacket on chair.",'["scene_01"]'),

            (PROJECT_ID,"scene_18",18,"INT. HOTEL ROOM - BATHROOM","NIGHT",
             '["Arjun"]','["Medical kit"]','["White shirt"]',
             "Arjun bandages his LEFT ARM. Consistent with Scene 17.",'["scene_17"]'),

            (PROJECT_ID,"scene_21",21,"EXT. HOTEL ROOFTOP - DAWN","DAWN",
             '["Arjun","Maya"]','["Phone","Coffee"]','["Black jacket","Scarf"]',
             "Arjun holds coffee with his RIGHT HAND. LEFT ARM still bandaged.",'["scene_17"]'),

            (PROJECT_ID,"scene_25",25,"INT. INTERROGATION ROOM","DAY",
             '["Arjun","Detective"]','["Evidence files","Table"]','["Black jacket","Shirt"]',
             "Arjun is questioned. New take uploaded — RIGHT ARM shows injury. CONFLICT!",'["scene_17","scene_21"]'),

            (PROJECT_ID,"scene_26",26,"INT. HOSPITAL","DAY",
             '["Arjun","Doctor"]','["Medical equipment"]','["Hospital gown"]',
             "Doctor examines Arjun's injury — references SAME ARM as Scene 17.",'["scene_25","scene_17"]'),

            (PROJECT_ID,"scene_28",28,"EXT. POLICE STATION","DAY",
             '["Arjun","Maya"]','["Bandage","Sling"]','["Black jacket"]',
             "Arjun wears a sling for his injury — continuity from Scene 17.",'["scene_17","scene_25"]'),

            (PROJECT_ID,"scene_31",31,"INT. COURTROOM","DAY",
             '["Arjun","Lawyer","Judge"]','["Evidence photos"]','["Suit","Sling"]',
             "Injury evidence presented in court — photos reference Scene 17 arm.",'["scene_17","scene_25","scene_28"]'),
        ]

        client.insert("scenes", scenes_data,
            column_names=["project_id","scene_id","scene_number","location","time_of_day",
                          "characters","props","wardrobe","description","depends_on"])
        print(f"✅ {len(scenes_data)} scenes created")

        # ── 3. Production Events (script facts) ───────────────────
        script_events = [
            # Scene 01 — injury established
            (str(uuid.uuid4()), PROJECT_ID,"Day 1","scene_01","","",
             "CHARACTER","arjun","SCRIPT_FACT","left_arm","","injury_location",
             0.98,"SCRIPT","screenplay.pdf@page_12","ScriptAgent","{}"),

            # Scene 17 — injury state confirmed + watch
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_17","","",
             "CHARACTER","arjun","SCRIPT_FACT","left_arm","","injury_location",
             0.97,"SCRIPT","screenplay.pdf@page_47","ScriptAgent","{}"),

            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_17","","",
             "CHARACTER","arjun","SCRIPT_FACT","left","","watch_wrist",
             0.96,"SCRIPT","screenplay.pdf@page_47","ScriptAgent","{}"),

            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_17","","",
             "CHARACTER","arjun","SCRIPT_FACT","black","","jacket_color",
             0.99,"SCRIPT","screenplay.pdf@page_47","ScriptAgent","{}"),

            # Scene 17 — Maya dress state
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_17","","",
             "CHARACTER","maya","SCRIPT_FACT","red_scarf","","accessory",
             0.94,"SCRIPT","screenplay.pdf@page_48","ScriptAgent","{}"),

            # Scene 18 — injury confirmed
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_18","","",
             "CHARACTER","arjun","SCRIPT_FACT","left_arm","","injury_location",
             0.97,"SCRIPT","screenplay.pdf@page_51","ScriptAgent","{}"),

            # Scene 21 — injury consistent
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_21","","",
             "CHARACTER","arjun","SCRIPT_FACT","left_arm","","injury_location",
             0.96,"SCRIPT","screenplay.pdf@page_62","ScriptAgent","{}"),

            # Scene 25 Take 1 (good take — left arm correct)
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_25","shot_01","take_01",
             "CHARACTER","arjun","VIDEO_OBSERVATION","left_arm","","injury_location",
             0.91,"VIDEO","scene_25_take1.mp4@00:08.3","EvidenceAgent","{}"),

            # Scene 25 Take 2 (good take — left arm correct)
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_25","shot_01","take_02",
             "CHARACTER","arjun","VIDEO_OBSERVATION","left_arm","","injury_location",
             0.88,"VIDEO","scene_25_take2.mp4@00:11.1","EvidenceAgent","{}"),

            # Scene 25 Take 3 ← THE CONFLICT (right arm!)
            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_25","shot_01","take_03",
             "CHARACTER","arjun","VIDEO_OBSERVATION","right_arm","left_arm","injury_location",
             0.93,"VIDEO","scene_25_take3.mp4@00:12.8","EvidenceAgent","{}"),

            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_25","shot_01","take_03",
             "CHARACTER","arjun","VIDEO_OBSERVATION","right","left","watch_wrist",
             0.89,"VIDEO","scene_25_take3.mp4@00:14.2","EvidenceAgent","{}"),

            (str(uuid.uuid4()), PROJECT_ID,"Day 17","scene_25","shot_01","take_03",
             "CHARACTER","arjun","VIDEO_OBSERVATION","black","","jacket_color",
             0.97,"VIDEO","scene_25_take3.mp4@00:09.5","EvidenceAgent","{}"),
        ]

        client.insert("production_events", script_events,
            column_names=["event_id","project_id","production_day","scene_id","shot_id",
                          "take_id","entity_type","entity_id","event_type","observed_value",
                          "expected_value","attribute_name","confidence","source_type",
                          "source_reference","agent_name","metadata"])
        print(f"✅ {len(script_events)} production events seeded")

        # ── 4. State Snapshots ────────────────────────────────────
        snapshots = [
            (str(uuid.uuid4()), PROJECT_ID,"scene_01","CHARACTER","arjun",
             "injury_location","left_arm",0.98,"scene_01",""),

            (str(uuid.uuid4()), PROJECT_ID,"scene_17","CHARACTER","arjun",
             "injury_location","left_arm",0.97,"scene_01",""),

            (str(uuid.uuid4()), PROJECT_ID,"scene_17","CHARACTER","arjun",
             "watch_wrist","left",0.96,"scene_17",""),

            (str(uuid.uuid4()), PROJECT_ID,"scene_17","CHARACTER","arjun",
             "jacket_color","black",0.99,"scene_17",""),

            (str(uuid.uuid4()), PROJECT_ID,"scene_18","CHARACTER","arjun",
             "injury_location","left_arm",0.97,"scene_01",""),

            (str(uuid.uuid4()), PROJECT_ID,"scene_21","CHARACTER","arjun",
             "injury_location","left_arm",0.96,"scene_01",""),
        ]

        client.insert("state_snapshots", snapshots,
            column_names=["snapshot_id","project_id","scene_id","entity_type",
                          "entity_id","attribute_name","attribute_value","confidence",
                          "introduced_scene","evidence_event_id"])
        print(f"✅ {len(snapshots)} state snapshots created")

        # ── 5. Scene Dependencies (blast radius graph) ────────────
        deps = [
            # Scenes that depend on Scene 17 injury state
            (PROJECT_ID,"scene_25","scene_17","arjun","injury_location","STATE"),
            (PROJECT_ID,"scene_26","scene_17","arjun","injury_location","STATE"),
            (PROJECT_ID,"scene_28","scene_17","arjun","injury_location","STATE"),
            (PROJECT_ID,"scene_31","scene_17","arjun","injury_location","STATE"),
            # Watch wrist dependency
            (PROJECT_ID,"scene_25","scene_17","arjun","watch_wrist","STATE"),
            (PROJECT_ID,"scene_26","scene_17","arjun","watch_wrist","STATE"),
        ]

        client.insert("scene_dependencies", deps,
            column_names=["project_id","scene_id","depends_on_scene",
                          "entity_id","attribute_name","dependency_type"])
        print(f"✅ {len(deps)} scene dependencies seeded (blast radius graph)")

        # ── 6. Pre-seed the known conflict ────────────────────────
        conflict_id = str(uuid.uuid4())
        blast = json.dumps({
            "affected_scenes": ["scene_26","scene_28","scene_31"],
            "affected_assets": 7,
            "severity": "HIGH"
        })
        client.insert("continuity_conflicts", [[
            conflict_id, PROJECT_ID, "scene_25", "take_03",
            "CHARACTER", "arjun", "injury_location",
            "left_arm", "right_arm", 0.93, "HIGH", "OPEN",
            blast,
            "Reshoot Scene 25 Take 3 immediately. The injury appears on the wrong arm. "
            "3 downstream scenes (26, 28, 31) reference this state and will be inconsistent.",
            "", None,
        ]], column_names=[
            "conflict_id","project_id","scene_id","take_id","entity_type",
            "entity_id","attribute_name","expected_value","observed_value",
            "confidence","severity","status","blast_radius","recommendation",
            "approved_by","approved_at",
        ])
        print(f"✅ Pre-seeded known conflict: {conflict_id}")

        # ── 7. Agent audit log sample ─────────────────────────────
        agent_logs = [
            (str(uuid.uuid4()), PROJECT_ID,"OrchestratorAgent","script_analysis",
             "analyze_script","{}","Processed 8 scenes, 3 characters","SUCCESS",320,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"ScriptAgent","extract_entities",
             "gemini_extract","{}","Extracted 31 continuity facts","SUCCESS",1240,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"EvidenceAgent","analyze_video",
             "gemini_multimodal","{}","Scene 25 Take 3: 3 observations extracted","SUCCESS",2180,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"StateAgent","get_character_history",
             "clickhouse_query","{}","Retrieved 6 historical events for Arjun/injury_location","SUCCESS",45,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"ConflictAgent","compare_states",
             "conflict_engine","{}","CONFLICT: left_arm != right_arm (HIGH severity)","SUCCESS",8,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"ImpactAgent","get_downstream_dependencies",
             "clickhouse_query","{}","3 affected scenes: 26, 28, 31","SUCCESS",38,"demo","N/A"),
            (str(uuid.uuid4()), PROJECT_ID,"RecommendationAgent","generate_recommendation",
             "gemini_reason","{}","RESHOOT Take 3 immediately","SUCCESS",890,"demo","N/A"),
        ]

        client.insert("agent_audit_log", agent_logs,
            column_names=["log_id","project_id","agent_name","action","tool_name",
                          "tool_args","result_summary","status","latency_ms",
                          "user_id","approval_status"])
        print(f"✅ {len(agent_logs)} agent audit events seeded")

        # ── Verify ────────────────────────────────────────────────
        print("\n📊 Verification:")
        for table in ["projects","scenes","production_events","state_snapshots",
                      "continuity_conflicts","scene_dependencies","agent_audit_log"]:
            count = client.command(f"SELECT count() FROM cinestate.{table} WHERE project_id='{PROJECT_ID}'")
            print(f"   {table}: {count} rows")

        print(f"""
╔══════════════════════════════════════════════════════════╗
║          PROJECT AURORA — DEMO DATA SEEDED! 🎬           ║
╠══════════════════════════════════════════════════════════╣
║  Known conflict ready:                                   ║
║  Scene 17: Arjun injury = LEFT ARM  (established)        ║
║  Scene 25 Take 3: Gemini sees = RIGHT ARM (conflict!)    ║
║  Blast radius: Scenes 26, 28, 31 affected               ║
╚══════════════════════════════════════════════════════════╝
        """)
        client.close()
        return True

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = seed()
    sys.exit(0 if success else 1)
