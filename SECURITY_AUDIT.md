# SECURITY AUDIT

## OVERVIEW
Reviewing the repository for common hackathon security pitfalls.

## CREDENTIALS
- **Gemini API Keys**: Secured. No keys are hardcoded in `script_agent.py` or `evidence_agent.py`. They are pulled via `os.getenv("GEMINI_API_KEY")`.
- **ClickHouse Credentials**: Secured. Relying on `.env` overrides and `CLICKHOUSE_HOST`, `CLICKHOUSE_PASSWORD`.

## API SECURITY
- **CORS**: Implemented securely on both Node Gateway (Port 5000) and FastAPI (Port 8000).
- **Authentication**: None. Acceptable for a hackathon prototype, but would need JWT enforcement at the Node Gateway level for production.
- **SQL Injection**: Using ClickHouse Python driver's parameterized queries for `insert_project` and `record_state_snapshot`. Safe against primary injection vectors.

## ERROR HANDLING
- **Stack Traces**: Removed from client-facing Node responses. Node now returns a structured `{ success: false, error: err.message }` without exposing internal Python tracebacks.

## RECOMMENDATIONS FOR PROD
- Add API key validation to the FastAPI service to ensure requests only originate from the Node Gateway.
- Encrypt PII (actor data) at rest in ClickHouse.
