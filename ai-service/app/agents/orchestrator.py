"""
CINESTATE — ADK Orchestrator + mcp-clickhouse Integration
The central agent that coordinates all sub-agents.

MCP Integration:
  ADK Agent → MCPToolset → mcp-clickhouse → ClickHouse Cloud

Per hackathon rules: "your project must actively use ClickHouse at runtime
via the official ClickHouse MCP server (mcp-clickhouse)"

Usage:
  StdioServerParameters: when mcp-clickhouse installed locally (Python 3.10+)
  SseServerParams: when using ClickHouse Cloud Remote MCP endpoint
"""

import asyncio
import logging
import os
from typing import AsyncGenerator

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters, SseConnectionParams
from google.genai import types as genai_types

from app.config import settings
from app.tools.clickhouse_tools import (
    get_character_history,
    get_scene_history,
    get_take_observations,
    get_open_conflicts,
    get_downstream_dependencies,
    search_production_events,
    get_project_stats,
)
from app.tools.production_tools import (
    compare_states_tool,
    record_conflict_tool,
    approve_conflict_tool,
    get_blast_radius_tool,
)

logger = logging.getLogger(__name__)

APP_NAME = "cinestate_orchestrator"


def _get_mcp_toolset() -> MCPToolset:
    """
    Create MCPToolset connecting to mcp-clickhouse.

    Tries remote ClickHouse Cloud MCP first (no local install needed),
    falls back to local stdio mcp-clickhouse if available.

    This is the REQUIRED runtime integration per hackathon rules.
    """
    # Option 1: ClickHouse Cloud Remote MCP (preferred — no local install)
    # Enable in ClickHouse Cloud console → Integrations → MCP
    mcp_url = os.environ.get("CLICKHOUSE_MCP_URL", "")
    if mcp_url:
        logger.info("Using ClickHouse Cloud Remote MCP", extra={"url": mcp_url})
        return MCPToolset(
            connection_params=SseConnectionParams(
                url=mcp_url,
                headers={"Authorization": f"Bearer {settings.clickhouse_password}"},
            )
        )

    # Option 2: Local mcp-clickhouse subprocess (requires Python 3.10+, pip install mcp-clickhouse)
    logger.info("Using local mcp-clickhouse subprocess (stdio)")
    return MCPToolset(
        connection_params=StdioServerParameters(
            command="mcp-clickhouse",
            env={
                "CLICKHOUSE_HOST": settings.clickhouse_host,
                "CLICKHOUSE_PORT": str(settings.clickhouse_port),
                "CLICKHOUSE_USER": settings.clickhouse_user,
                "CLICKHOUSE_PASSWORD": settings.clickhouse_password,
                "CLICKHOUSE_HTTPS_PORT": str(settings.clickhouse_port),
                "CLICKHOUSE_SECURE": "true" if settings.clickhouse_secure else "false",
            },
        )
    )


def create_orchestrator(mcp_toolset: MCPToolset) -> LlmAgent:
    """
    Build the Orchestrator Agent.
    Uses both MCP tools (mcp-clickhouse) and safe parameterized custom tools.
    """
    return LlmAgent(
        name="CINESTATEOrchestrator",
        model=settings.gemini_model,
        description=(
            "CINESTATE Orchestrator — coordinates the film production state "
            "intelligence workflow. Uses ClickHouse production memory to detect "
            "continuity conflicts and calculate blast radius."
        ),
        instruction="""
You are the CINESTATE Orchestrator — an AI system for film production continuity.

Your workflow for CONTINUITY CHECKING:
1. Use get_character_history() to retrieve historical state from ClickHouse
2. Compare with new observations using compare_states_tool()
3. If conflict found, use get_downstream_dependencies() for blast radius
4. Record the conflict with record_conflict_tool()
5. Generate a clear explanation with recommendation

Your workflow for SEARCH:
- Use search_production_events() for general queries
- Use get_scene_history() for scene-level analysis

CRITICAL RULES:
- NEVER decide a continuity conflict exists from language alone
- ALWAYS retrieve ClickHouse history first
- Deterministic comparison (left_arm != right_arm) drives conflicts
- You EXPLAIN conflicts, you do NOT create them from imagination
- Always show confidence scores
- If confidence < 70%, flag as LOW CONFIDENCE — HUMAN REVIEW REQUIRED

You have access to the mcp-clickhouse MCP server for direct ClickHouse queries
and to safe parameterized tools for specific operations.
""",
        tools=[
            # Safe parameterized tools (primary)
            get_character_history,
            get_scene_history,
            get_take_observations,
            get_open_conflicts,
            get_downstream_dependencies,
            search_production_events,
            get_project_stats,
            compare_states_tool,
            record_conflict_tool,
            approve_conflict_tool,
            get_blast_radius_tool,
            # MCP toolset (mcp-clickhouse — required by hackathon)
            mcp_toolset,
        ],
    )


async def run_agent_query(
    query: str,
    project_id: str,
    session_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Run an orchestrator query and stream responses.
    Used by FastAPI SSE endpoint for real-time agent activity.
    """
    session_service = InMemorySessionService()
    sid = session_id or f"session_{project_id}"

    await session_service.create_session(
        app_name=APP_NAME,
        user_id="cinestate_user",
        session_id=sid,
    )

    mcp_toolset = _get_mcp_toolset()
    async with mcp_toolset:
        agent = create_orchestrator(mcp_toolset)
        runner = Runner(
            agent=agent,
            app_name=APP_NAME,
            session_service=session_service,
        )

        enriched_query = f"[Project: {project_id}] {query}"
        content = genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=enriched_query)],
        )

        async for event in runner.run_async(
            user_id="cinestate_user",
            session_id=sid,
            new_message=content,
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    yield event.content.parts[0].text
            elif hasattr(event, "tool_call"):
                yield f"[TOOL] {event.tool_call.name}: {event.tool_call.args}"


async def check_continuity(
    project_id: str,
    scene_id: str,
    take_id: str,
    observations: list[dict],
    session_id: str | None = None,
) -> dict:
    """
    Full continuity check workflow.
    Returns conflict analysis with evidence and blast radius.
    """
    obs_text = "\n".join([
        f"- {o['entity_id']} / {o['attribute_name']} = {o['value']} (confidence: {o['confidence']:.0%})"
        for o in observations
    ])

    query = f"""
    Perform a continuity check for Scene {scene_id}, Take {take_id}.

    New observations from video analysis:
    {obs_text}

    Steps:
    1. For each observation, call get_character_history() to get the historical value
    2. Use compare_states_tool() for each attribute
    3. If any conflicts found, call get_downstream_dependencies() for scene {scene_id}
    4. Record each conflict with record_conflict_tool()
    5. Provide a summary with: EXPECTED vs OBSERVED, severity, blast radius, recommendation

    Project: {project_id}
    """

    result_parts = []
    async for chunk in run_agent_query(query, project_id, session_id):
        result_parts.append(chunk)

    return {
        "project_id": project_id,
        "scene_id": scene_id,
        "take_id": take_id,
        "analysis": "\n".join(result_parts),
        "status": "completed",
    }
