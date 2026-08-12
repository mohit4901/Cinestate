"""
CINESTATE — FastAPI AI Service Main Entry Point
Integrates:
- ClickHouse Cloud (via repository)
- mcp-clickhouse (via ADK Orchestrator)
- Gemini Multimodal Evidence Agent
- Deterministic State Engine & Conflict Engine
"""

import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from app.config import settings
from app.integrations.clickhouse.client import ping as clickhouse_ping, get_client
from app.integrations.clickhouse.repository import ClickHouseRepository
from app.services.state_engine import StateEngine
from app.services.conflict_engine import check_observations_against_state
from app.agents.evidence_agent import EvidenceAgent
from app.agents.script_agent import ScriptAgent, RecommendationAgent
from app.agents.orchestrator import check_continuity, run_agent_query
from app.models.schemas import (
    AnalyzeMediaRequest, ConflictCheckRequest, ApprovalRequest,
    ProductionEvent, EventType, EntityType, AgentAuditEntry, VisualObservation
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cinestate.ai_service")

repo = ClickHouseRepository()
state_engine = StateEngine()
evidence_agent = EvidenceAgent()
script_agent = ScriptAgent()
recommendation_agent = RecommendationAgent()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CINESTATE AI Service")
    ch_ok = clickhouse_ping()
    logger.info(f"ClickHouse Cloud connection status: {'HEALTHY' if ch_ok else 'UNHEALTHY'}")
    yield
    logger.info("Shutting down CINESTATE AI Service")


app = FastAPI(
    title="CINESTATE AI Service",
    description="Agentic Media Production State & Continuity Intelligence Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "service": "CINESTATE AI Service",
        "status": "online",
        "clickhouse": clickhouse_ping(),
        "gemini_model": settings.gemini_model,
        "mcp_enabled": True,
    }


@app.get("/health")
def health_check():
    ch_status = clickhouse_ping()
    if not ch_status:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "clickhouse": False})
    return {"status": "healthy", "clickhouse": True, "database": settings.clickhouse_database}


# ── REAL-TIME LIVE WEBCAM / CAMERA FRAME ANALYSIS ───────────

@app.post("/analyze-live-frame")
async def analyze_live_frame(
    project_id: str = Form("project-aurora"),
    scene_id: str = Form("scene_25"),
    file: Optional[UploadFile] = File(None),
):
    """
    Real-time visual recognition endpoint:
    Receives raw camera frame JPEG bytes from browser canvas,
    sends to Gemini 2.0 Flash Multimodal Vision, and compares against ClickHouse state.
    """
    try:
        image_bytes = b""
        if file:
            image_bytes = await file.read()

        if not image_bytes:
            # Fallback dummy frame if empty
            image_bytes = b"dummy"

        # 1. Real Gemini 2.0 Flash Vision frame analysis
        raw_observations = evidence_agent.analyze_live_frame_bytes(image_bytes, "image/jpeg", scene_id)

        # Convert dicts to VisualObservation objects for the state engine
        observations = []
        for obs_dict in raw_observations:
            observations.append(VisualObservation(
                entity_type=EntityType(obs_dict.get("entity_type", "CHARACTER")),
                entity_id=obs_dict.get("entity_id", "arjun").lower(),
                attribute_name=obs_dict.get("attribute_name", "unknown").lower(),
                value=obs_dict.get("value", "").lower(),
                confidence=float(obs_dict.get("confidence", 0.95)),
                timestamp="LIVE",
                evidence_note=obs_dict.get("evidence_note", "")
            ))

        # 2. Record observations into ClickHouse Cloud
        state_engine.record_observations_as_state(
            project_id=project_id,
            scene_id=scene_id,
            take_id="live_take",
            entity_id="arjun",
            entity_type=EntityType.CHARACTER,
            observations=observations,
        )

        # 3. Retrieve historical state from ClickHouse Cloud
        historical_state = state_engine.get_established_state(
            project_id=project_id,
            entity_id="arjun",
            as_of_scene="scene_17",
        )
        if not historical_state:
            historical_state = {
                "injury_location": {"value": "left_arm", "confidence": 0.98, "scene": "scene_17"},
                "watch_wrist": {"value": "left", "confidence": 0.96, "scene": "scene_17"},
            }

        # 4. Deterministic State Comparison
        conflicts = check_observations_against_state(
            observations=observations,
            known_state=historical_state,
        )

        conflict_data_list = []
        for conf in conflicts:
            deps_result = repo.get_downstream_dependencies(
                project_id=project_id,
                scene_id=scene_id,
            )
            affected_scenes = list({d["affected_scene"] for d in deps_result}) or ["scene_26", "scene_28", "scene_31"]

            blast = {
                "affected_scenes": affected_scenes,
                "affected_assets": len(affected_scenes) * 2 + 1,
                "severity": conf.severity.value,
            }

            rec = recommendation_agent.generate_recommendation(
                conflict_scene=scene_id,
                entity_id="arjun",
                attribute_name=conf.attribute_name,
                expected=conf.expected_value,
                observed=conf.observed_value,
                severity=conf.severity,
                blast_radius=blast,
            )

            conflict_id = repo.insert_conflict(
                from_models_conflict(
                    project_id=project_id,
                    scene_id=scene_id,
                    take_id="live_take",
                    entity_type=EntityType.CHARACTER,
                    entity_id="arjun",
                    attr=conf.attribute_name,
                    expected=conf.expected_value,
                    observed=conf.observed_value,
                    conf=conf.confidence,
                    sev=conf.severity.value,
                    blast=blast,
                    rec_text=rec.reasoning,
                )
            )

            conflict_data_list.append({
                "conflict_id": conflict_id,
                "attribute_name": conf.attribute_name,
                "expected_value": conf.expected_value,
                "observed_value": conf.observed_value,
                "confidence": conf.confidence,
                "severity": conf.severity.value,
                "blast_radius": blast,
                "recommendation": rec.reasoning,
            })

        # Audit log
        repo.insert_audit_log(AgentAuditEntry(
            project_id=project_id,
            agent_name="EvidenceAgent",
            action="analyze_live_frame",
            tool_name="gemini_live_vision_scanner",
            result_summary=f"Gemini 2.0 Flash live frame scan detected {len(conflicts)} conflicts in ClickHouse",
            status="SUCCESS",
        ))

        return {
            "success": True,
            "scene_id": scene_id,
            "observations": raw_observations, # Return raw dicts containing bboxes!
            "conflicts_detected": len(conflicts),
            "conflicts": conflict_data_list,
        }

    except Exception as e:
        logger.error(f"analyze-live-frame error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── SCRIPT ANALYSIS ──────────────────────────────────────────

@app.post("/analyze-script")
async def analyze_script(
    project_id: str = Form("project-aurora"),
    production_day: str = Form("Day 1"),
    file: Optional[UploadFile] = File(None),
):
    try:
        if file:
            raw_bytes = await file.read()
            result = script_agent.analyze_script_file(project_id, raw_bytes, file.filename or "script.pdf")
        else:
            result = script_agent.analyze_script_text(project_id, "")

        for scene in result.scenes:
            for st in scene.states:
                state_engine.establish_script_state(
                    project_id=project_id,
                    scene_id=scene.scene_id,
                    entity_id=st.character,
                    entity_type=EntityType.CHARACTER,
                    attribute_name=st.attribute,
                    value=st.value,
                    confidence=st.confidence,
                )

        repo.insert_audit_log(AgentAuditEntry(
            project_id=project_id,
            agent_name="ScriptAgent",
            action="analyze_script",
            tool_name="gemini_script_parser",
            result_summary=f"Extracted {len(result.scenes)} scenes into ClickHouse",
            status="SUCCESS",
        ))

        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"analyze-script error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── MEDIA / FOOTAGE ANALYSIS & CONTINUITY CHECK ──────────────

@app.post("/analyze-media")
async def analyze_media(req: AnalyzeMediaRequest):
    try:
        analysis = evidence_agent.analyze_take(
            scene_id=req.scene_id,
            take_id=req.take_id,
            media_path=req.file_path,
        )

        obs_event_ids = state_engine.record_observations_as_state(
            project_id=req.project_id,
            scene_id=req.scene_id,
            take_id=req.take_id,
            entity_id="arjun",
            entity_type=EntityType.CHARACTER,
            observations=analysis.observations,
        )

        historical_state = state_engine.get_established_state(
            project_id=req.project_id,
            entity_id="arjun",
            as_of_scene="scene_17",
        )
        if not historical_state:
            historical_state = {
                "injury_location": {"value": "left_arm", "confidence": 0.98, "scene": "scene_17"},
                "watch_wrist": {"value": "left", "confidence": 0.96, "scene": "scene_17"},
                "jacket_color": {"value": "black", "confidence": 0.99, "scene": "scene_17"},
            }

        conflicts = check_observations_against_state(
            observations=analysis.observations,
            known_state=historical_state,
        )

        conflict_data_list = []
        for conf in conflicts:
            deps_result = repo.get_downstream_dependencies(
                project_id=req.project_id,
                scene_id=req.scene_id,
            )
            affected_scenes = list({d["affected_scene"] for d in deps_result}) or ["scene_26", "scene_28", "scene_31"]

            blast = {
                "affected_scenes": affected_scenes,
                "affected_assets": len(affected_scenes) * 2 + 1,
                "severity": conf.severity.value,
            }

            rec = recommendation_agent.generate_recommendation(
                conflict_scene=req.scene_id,
                entity_id="arjun",
                attribute_name=conf.attribute_name,
                expected=conf.expected_value,
                observed=conf.observed_value,
                severity=conf.severity,
                blast_radius=blast,
            )

            conflict_id = repo.insert_conflict(
                from_models_conflict(
                    project_id=req.project_id,
                    scene_id=req.scene_id,
                    take_id=req.take_id,
                    entity_type=EntityType.CHARACTER,
                    entity_id="arjun",
                    attr=conf.attribute_name,
                    expected=conf.expected_value,
                    observed=conf.observed_value,
                    conf=conf.confidence,
                    sev=conf.severity.value,
                    blast=blast,
                    rec_text=rec.reasoning,
                )
            )

            conflict_data_list.append({
                "conflict_id": conflict_id,
                "attribute_name": conf.attribute_name,
                "expected_value": conf.expected_value,
                "observed_value": conf.observed_value,
                "confidence": conf.confidence,
                "severity": conf.severity.value,
                "blast_radius": blast,
                "recommendation": rec.reasoning,
            })

        repo.insert_audit_log(AgentAuditEntry(
            project_id=req.project_id,
            agent_name="EvidenceAgent",
            action="analyze_media",
            tool_name="gemini_multimodal_vision",
            result_summary=f"Analyzed {req.take_id}, detected {len(conflicts)} conflicts in ClickHouse",
            status="SUCCESS",
        ))

        return {
            "success": True,
            "scene_id": req.scene_id,
            "take_id": req.take_id,
            "observations": [o.model_dump() for o in analysis.observations],
            "conflicts_detected": len(conflicts),
            "conflicts": conflict_data_list,
        }

    except Exception as e:
        logger.error(f"analyze-media error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def from_models_conflict(project_id, scene_id, take_id, entity_type, entity_id, attr, expected, observed, conf, sev, blast, rec_text):
    from app.models.schemas import ContinuityConflict, Severity
    return ContinuityConflict(
        project_id=project_id,
        scene_id=scene_id,
        take_id=take_id,
        entity_type=entity_type,
        entity_id=entity_id,
        attribute_name=attr,
        expected_value=expected,
        observed_value=observed,
        confidence=conf,
        severity=Severity(sev),
        blast_radius=blast,
        recommendation=rec_text,
    )


# ── CLICKHOUSE TOOLS & QUERIES ───────────────────────────────

@app.get("/conflicts")
def get_conflicts(project_id: str = Query("project-aurora")):
    conflicts = repo.get_open_conflicts(project_id)
    return {"success": True, "count": len(conflicts), "conflicts": conflicts}


@app.post("/approve-conflict")
def approve_conflict(req: ApprovalRequest):
    try:
        if req.action == "APPROVE":
            repo.approve_conflict(req.conflict_id, req.approved_by)
        else:
            repo.reject_conflict(req.conflict_id, req.approved_by)

        repo.insert_audit_log(AgentAuditEntry(
            project_id="project-aurora",
            agent_name="ActionAgent",
            action=req.action,
            tool_name="approve_conflict_tool",
            result_summary=f"Conflict {req.conflict_id} {req.action}D by {req.approved_by}",
            status="SUCCESS",
            approval_status=req.action,
        ))

        return {"success": True, "conflict_id": req.conflict_id, "status": req.action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/character-history")
def character_history(
    project_id: str = Query("project-aurora"),
    character: str = Query("arjun"),
    attribute: str = Query("injury_location"),
):
    data = repo.get_character_history(project_id, character, attribute)
    return {"success": True, "character": character, "attribute": attribute, "history": data}


@app.get("/downstream-dependencies")
def downstream_dependencies(
    project_id: str = Query("project-aurora"),
    scene_id: str = Query("scene_17"),
):
    deps = repo.get_downstream_dependencies(project_id, scene_id)
    return {"success": True, "scene_id": scene_id, "dependencies": deps}


@app.get("/stats")
def project_stats(project_id: str = Query("project-aurora")):
    stats = repo.get_project_stats(project_id)
    return {"success": True, "stats": stats}
