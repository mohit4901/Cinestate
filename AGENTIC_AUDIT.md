# AGENTIC AUDIT

## SYSTEM ARCHITECTURE
The system relies on Google's Gemini 2.0 Flash and Flash Vision models to perform deterministic reasoning on unstructured data (video/PDFs).

## WEAKNESSES IDENTIFIED & FIXED

1. **Hallucination Fallbacks**: 
   - *Issue*: `script_agent.py` used a hardcoded JSON dump if Gemini hallucinated the output schema.
   - *Fix*: The system now strictly demands JSON schema adherence. If Gemini fails, it will throw an exception rather than lying to the user with fallback data.

2. **Entity Recognition Blindness**:
   - *Issue*: `evidence_agent.py` was previously blind to WHO it was looking at, expecting `main.py` to hardcode the `entity_id` to 'arjun'.
   - *Fix*: `evidence_agent.py` now explicitly requires `entity_id` in its JSON extraction array, meaning Gemini is tasked with identifying the character/prop itself or validating against the provided form data.

3. **State Engine Rigidity**:
   - *Issue*: The `state_engine.py` was overly reliant on chronological scene IDs (e.g. `scene_17` must always precede `scene_25`).
   - *Note*: While chronological dependency mapping works well for structured film workflows, the system currently lacks a dynamic Directed Acyclic Graph (DAG) for non-linear shoots. Acceptable for hackathon, but a production gap.

## STRENGTHS
- Exceptional use of `gemini-2.0-flash` for multimodal video frame ingestion.
- MCP (Model Context Protocol) is natively supported, allowing external agents to query the ClickHouse ledger dynamically.
