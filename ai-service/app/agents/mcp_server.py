import json
import logging
from mcp.server.fastmcp import FastMCP
from app.integrations.clickhouse.repository import ClickHouseRepository
from app.models.schemas import ContinuityConflict, Severity

logger = logging.getLogger(__name__)

# Official ClickHouse MCP Server Implementation using FastMCP
mcp = FastMCP("ClickHouseMCP")
repo = ClickHouseRepository()

@mcp.tool()
def get_downstream_dependencies(project_id: str, scene_id: str) -> str:
    """Find all scenes that depend on the state established in scene_id."""
    deps = repo.get_downstream_dependencies(project_id, scene_id)
    return json.dumps(deps)

@mcp.tool()
def insert_conflict(
    project_id: str, scene_id: str, take_id: str,
    entity_type: str, entity_id: str, attribute_name: str,
    expected_value: str, observed_value: str, confidence: float,
    severity: str, recommendation: str
) -> str:
    """Record a detected continuity conflict into ClickHouse."""
    conf = ContinuityConflict(
        project_id=project_id, scene_id=scene_id, take_id=take_id,
        entity_type=entity_type, entity_id=entity_id,
        attribute_name=attribute_name, expected_value=expected_value,
        observed_value=observed_value, confidence=confidence,
        severity=Severity(severity), blast_radius={}, recommendation=recommendation
    )
    conflict_id = repo.insert_conflict(conf)
    return json.dumps({"conflict_id": conflict_id})

@mcp.tool()
def get_open_conflicts(project_id: str) -> str:
    """Get all open continuity conflicts for a project."""
    conflicts = repo.get_open_conflicts(project_id)
    return json.dumps(conflicts)

if __name__ == "__main__":
    # Start the MCP stdio server
    mcp.run()
