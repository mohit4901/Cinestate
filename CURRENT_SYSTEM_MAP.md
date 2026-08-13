# CURRENT_SYSTEM_MAP

## FRONTEND (React / Vite)
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Context**: `ProjectContext.jsx` for global multi-tenant project state
- **Pages**: `Dashboard.jsx`, `DirectorHUD.jsx`, `Production.jsx`, `Footage.jsx`, `Script.jsx`, `Conflicts.jsx`, `AgentActivity.jsx`
- **Gateway**: Axios via `services/api.js` pointing to Node Express.

## BACKEND GATEWAY (Node.js / Express)
- **Port**: 5000
- **Purpose**: Serves as the frontend's direct API, orchestrating requests to Python.
- **Key Route**: `routes/api.js` acts as a proxy for `/analyze-live-frame`, `/analyze-script` using FormData uploads to FastAPI.
- *Audit Status*: Hardcoded fallback responses (catch blocks returning `200 OK` JSON arrays) have been removed. Gateway now accurately bubbles up Python `500` errors.

## AI SERVICE (Python / FastAPI)
- **Port**: 8000
- **Framework**: FastAPI
- **Key Files**:
  - `main.py`: Endpoints for `seed-demo-data`, `projects`, `analyze-media`, `analyze-live-frame`.
  - `agents/script_agent.py`: Parses scripts and extracts character baselines using Gemini 2.0 Flash.
  - `agents/evidence_agent.py`: Analyzes video/frames and extracts multi-modal evidence using Gemini 2.0 Flash Vision.
- *Audit Status*: Hardcoded `arjun` default dependencies stripped. Strict JSON schema enforcement applied to Gemini output.

## STATE ENGINE & DB (Python / ClickHouse Cloud)
- **Core Engine**: `state_engine.py` - Evaluates visual evidence against the chronological script ledger.
- **Database**: `ClickHouseRepository` (`repository.py`) interacting with ClickHouse Cloud over port 8443.
- **MCP**: `mcp_server.py` allowing standardized AI access to query the ClickHouse warehouse.

## DEPENDENCY GRAPH
`React UI` -> `Node Gateway (5000)` -> `FastAPI (8000)` -> `Gemini Flash Vision` -> `State Engine` -> `ClickHouse Cloud` -> `FastAPI` -> `Node Gateway` -> `React UI`.
