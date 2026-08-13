# STATIC DATA AUDIT

## SCOPE
A forensic audit was conducted to locate hardcoded demo data, bypasses, or fallback loops intended to simulate AI/DB behavior.

## FINDINGS & REMEDIATION

1. **Node Express Try/Catch Bypass**
   - *Status*: REMOVED
   - *Detail*: `backend/src/routes/api.js` caught any Python timeout or error and returned hardcoded JSON arrays simulating a successful API call. This was deleted. It now correctly forwards `500 Internal Server Error`.

2. **Frontend Default Parameters**
   - *Status*: REMOVED
   - *Detail*: `frontend/src/services/api.js` passed `project_id = 'project-aurora'` and `character = 'arjun'` in JS method definitions. Replaced with mandatory arguments passed via `ProjectContext`.

3. **Python FastAPI Query/Form Defaults**
   - *Status*: REMOVED
   - *Detail*: `app/main.py` defaulted `project_id` to 'project-aurora'. The defaults were stripped. A true multi-tenant design is enforced.

4. **Agent Fallback Logic**
   - *Status*: REMOVED
   - *Detail*: `app/agents/script_agent.py` contained `_build_aurora_script_result()` which injected a hardcoded 8-scene script if Gemini failed schema validation. Replaced with strict `RuntimeError`.

5. **Static UI Components**
   - *Status*: REFACTORED
   - *Detail*: `Footage.jsx`, `Script.jsx`, and `Layout.jsx` contained hardcoded dropdown options. These were wired to the real `api.js` backend fetches or rewritten to accept manual user input (e.g., Character names).
