# FAILURE HANDLING AUDIT

## PRE-AUDIT VULNERABILITIES
Previously, the application utilized dangerous "silent failures." If a Python AI Agent crashed or hallucinated, the Node Gateway caught the error and responded with a static HTTP 200 OK containing hardcoded, fake JSON data (e.g. returning that 'Arjun' was wearing a 'Black jacket' regardless of actual upload).

This is a critical failure pattern for hackathons, as it masks underlying instability and risks disqualification for "faking the demo."

## POST-AUDIT HARDENING

1. **Gateway Transparency**
   - The Node.js Express Gateway now strips `catch` blocks that generate fake data.
   - It correctly issues `HTTP 500` status codes with structured `{ success: false, error: err.message }` payloads.
   
2. **Strict LLM Output Parsing**
   - In `script_agent.py` and `evidence_agent.py`, the `_build_aurora_script_result` fallbacks were deleted.
   - If the Gemini 2.0 Flash model hallucinates schema keys or returns malformed JSON, a `RuntimeError` is raised in Python, triggering a cascade failure up to the UI.
   - *Why this is better*: It forces the demonstrator to show the actual reliability of the prompts, and ensures zero fake data enters ClickHouse.

3. **Multi-Tenant Guardrails**
   - Attempting to query `/conflicts` without an active `project_id` now safely returns empty arrays or raises parameter errors instead of defaulting to `project-aurora`.

## FUTURE RECOMMENDATIONS
- Implement a structured retry loop with exponential backoff on the Python agents if a JSON parse fails, rather than immediately failing the HTTP request.
- Add user-friendly Error Boundaries in the React Frontend to catch `500` responses and show a "AI Processing Failed" toast rather than relying on console logs.
