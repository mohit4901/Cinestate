# 🎬 CINESTATE: Autonomous Production Memory & Intelligence Platform

![CINESTATE](https://raw.githubusercontent.com/google/material-design-icons/master/png/action/visibility/materialicons/24dp/2x/baseline_visibility_black_24dp.png)

CINESTATE is an enterprise-grade Production Memory & Intelligence Platform designed to eliminate multi-million dollar continuity errors in the film industry. By orchestrating **Google Gemini 2.0 Flash Vision** and **ClickHouse Cloud** via the **Model Context Protocol (MCP)**, CINESTATE actively monitors live camera feeds on set and instantly cross-references them against chronological script baselines to detect continuity hallucinations (errors) before the director yells "Cut."

In high-end film production, a continuity error (e.g., an actor wearing a watch in take 1, but not in take 2) can cost **$1,500+ per hour** to reshoot on set, or upwards of **$45,000** to fix in post-production VFX. CINESTATE solves this real-world enterprise friction by introducing deterministic Agentic Memory.

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Core Capabilities](#-core-capabilities)
3. [System Architecture](#-system-architecture)
4. [Technology Stack](#-technology-stack)
5. [Partner Integration: ClickHouse Cloud](#-partner-integration-clickhouse-cloud)
6. [AI Integration: Google Cloud & Gemini 2.0](#-ai-integration-google-cloud--gemini-20)
7. [Installation & Setup Guide](#-installation--setup-guide)
8. [Operations & User Guide](#-operations--user-guide)
9. [Database Schema & Event Ledger](#-database-schema--event-ledger)
10. [Security & Compliance](#-security--compliance)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)
12. [License](#-license)

---

## 🚀 Executive Summary

CINESTATE transitions continuity supervision from a manual, error-prone human task to a deterministic, AI-driven event sourcing pipeline. 

1. **Establishing Ground Truth:** The system parses screenplays (PDF/Fountain) to extract baseline facts (wardrobe, props, injuries) into a structured ledger.
2. **Agentic Memory (ClickHouse MCP):** It stores all entities, attributes, and temporal events in ClickHouse Cloud for lightning-fast, vector-capable retrieval.
3. **Live Vision (Gemini 2.0 Flash + TFJS):** It runs local TensorFlow.js object detection on the director's monitor, while seamlessly routing critical frames to Gemini 2.0 Flash to evaluate complex state logic (e.g., "Is the injury bandage on the left or right arm?").
4. **Deterministic Resolution:** It alerts the director in real-time if a conflict is found, quantifying the "blast radius" of the error across downstream scenes and providing immediate financial ROI options (Reshoot vs. Post-Fix).

---

## ✨ Core Capabilities

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Script Baseline Extraction** | Upload screenplays to auto-extract every prop, wardrobe item, and character state per scene using Gemini 2.0. | Eliminates manual script breakdown days. |
| **Live Camera Feed Analysis** | TFJS runs in-browser bounding boxes. Frames are sent to Gemini 2.0 Flash Vision for real-time analysis. | Catch continuity errors *while* the actors are on set. |
| **Agentic State Ledger** | Every observation is logged as an immutable event in ClickHouse. The State Engine chronologically resolves conflicts. | Provides a 100% deterministic source of truth for post-production. |
| **Conflict Blast Radius** | When a continuity error occurs, the system calculates exactly which downstream scenes will be ruined. | Allows producers to make data-driven financial decisions on reshoots. |
| **True Multi-Tenancy** | Enterprise data isolation. Multiple active film projects can run concurrently without data bleeding. | Ready for multi-stage studio deployment. |

---

## 🏗️ System Architecture

CINESTATE relies on a decoupled, microservice-inspired architecture combining edge inference with cloud AI.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Director HUD (React/Vite)]
        UI[User Interface]
        TFJS[TensorFlow.js Edge Detection]
        Webcam[Live Camera Feed]
    end

    %% Gateway Layer
    subgraph Gateway [Node.js Express Gateway]
        Router[API Router]
        Auth[Security & CORS]
    end

    %% AI Service Layer
    subgraph AIService [Python FastAPI / Orchestrator]
        Endpoints[REST Endpoints]
        ScriptAgent[Script Analysis Agent]
        EvidenceAgent[Video Evidence Agent]
        StateEngine[Continuity State Engine]
        MCP[MCP Client]
    end

    %% External Services
    subgraph CloudAI [Google Cloud]
        GeminiFlash[Gemini 2.0 Flash]
        GeminiVision[Gemini 2.0 Flash Vision]
    end

    subgraph DataWarehose [Partner Integration]
        ClickHouse[(ClickHouse Cloud)]
        MCPServer[ClickHouse MCP Server]
    end

    %% Flow
    Webcam --> TFJS
    TFJS --> UI
    UI -->|Media & Queries| Router
    Router -->|Proxy| Endpoints
    Endpoints --> ScriptAgent
    Endpoints --> EvidenceAgent
    ScriptAgent -->|Text Parsing| GeminiFlash
    EvidenceAgent -->|Frame Analysis| GeminiVision
    EvidenceAgent --> StateEngine
    StateEngine --> MCP
    MCP --> MCPServer
    MCPServer --> ClickHouse
```

### Request Lifecycle (Live Camera Scan)
1. **Edge Trigger**: The Director HUD captures a high-resolution frame from the video feed.
2. **Gateway Route**: The image is `POST`ed to the Node.js Express Gateway.
3. **AI Orchestration**: The Python FastAPI service routes the image to the `evidence_agent`.
4. **Multimodal Inference**: Gemini 2.0 Flash Vision scans the image against the active chronological constraints.
5. **Ledger Commit**: The extracted features are passed to the `state_engine`, which commits an immutable `VIDEO_OBSERVATION` event to ClickHouse.
6. **Conflict Resolution**: The engine pulls the historical baseline from ClickHouse and compares it to the new observation. If they clash, a high-severity alert is beamed back to the React UI.

---

## 💻 Technology Stack

- **Frontend Environment:** React 18, Vite, Tailwind CSS, GSAP (ScrollTrigger), Lucide React.
- **Edge Machine Learning:** TensorFlow.js, COCO-SSD (Browser-based bounding boxes).
- **Backend API Gateway:** Node.js, Express, Axios, Multer.
- **AI Microservice:** Python 3.11+, FastAPI, Uvicorn.
- **LLM Intelligence:** Google Gemini 2.0 Flash, Gemini 2.0 Flash Vision (`google-genai` v2.17).
- **Database / Memory:** ClickHouse Cloud (Columnar OLAP database).
- **Agentic Protocol:** Model Context Protocol (MCP) for standardizing AI-to-Database querying.

---

## 🤝 Partner Integration: ClickHouse Cloud

CINESTATE relies entirely on **ClickHouse Cloud** for its Agentic State Ledger. A standard relational database (like PostgreSQL) struggles with the hyper-scale analytical requirements of event-sourcing millions of live camera frames across a studio's slate. ClickHouse solves this elegantly.

### Why ClickHouse?
- **Columnar Efficiency**: We ingest unstructured observations rapidly. ClickHouse's `MergeTree` engines compress this data aggressively.
- **Time-Travel Queries**: The `production_state_ledger` table is append-only. To resolve continuity at "Scene 25", the State Engine queries ClickHouse for the `argMax(observed_value, created_at)` of an entity's attribute where `scene_id < 25`. ClickHouse executes these chronological rollups in milliseconds.
- **MCP Native**: By wrapping ClickHouse in a Model Context Protocol (MCP) server, our Gemini agents can directly and securely query the warehouse to answer complex natural language questions (e.g., "Show me the audit logs for when Arjun's jacket changed color").

### Tables
1. `projects`: Multi-tenant project metadata.
2. `scenes`: Chronological metadata extracted from screenplays.
3. `production_state_ledger`: The core event-sourced table (`project_id`, `scene_id`, `entity_id`, `attribute_name`, `observed_value`, `confidence`).
4. `conflicts`: Detected continuity errors awaiting Director approval.

---

## 🧠 AI Integration: Google Cloud & Gemini 2.0

Google's Gemini 2.0 models act as the autonomous "Script Supervisor" brains of CINESTATE.

### 1. Script Parsing (`script_agent.py`)
- **Model**: `gemini-2.0-flash`
- **Mechanism**: The agent ingests massive PDFs or text documents. It uses a strict system prompt and enforces a rigidly typed JSON schema output. It parses complex narrative text into deterministic states (e.g., mapping the phrase *"Arjun clutches his bleeding left arm"* to `entity_id: 'arjun', attribute: 'injury_location', value: 'left_arm'`).

### 2. Live Vision Analysis (`evidence_agent.py`)
- **Model**: `gemini-2.0-flash-exp` (Multimodal Vision)
- **Mechanism**: The agent receives live MP4 takes or JPG frames from the set. It doesn't just describe the image; it is explicitly prompted to evaluate the image against known entities (e.g., "Analyze the state of the entity 'arjun' in this frame. Where is the watch? Where is the injury?"). 
- **Resilience**: The backend Python layer strictly enforces Gemini's schema. If a hallucination occurs, a hard `500 Internal Server Error` is thrown back to the UI, guaranteeing zero fake data enters the ClickHouse ledger.

---

## ⚙️ Installation & Setup Guide

Deploying CINESTATE locally involves starting three distinct services: the Frontend, the Node Gateway, and the Python AI Service.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Google Cloud API Key**: A valid Gemini API key.
- **ClickHouse Cloud**: A ClickHouse Cloud cluster URL and password.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-ORG/Cinestate.git
cd Cinestate
```

### 2. Environment Configuration
Create a `.env` file in the root of the project (or copy `.env.example` if available). This single file will power both backends.

```env
# /Users/YOUR_PATH/Cinestate/.env

# --- Google Cloud ---
GEMINI_API_KEY=your_gemini_api_key_here

# --- ClickHouse Cloud ---
CLICKHOUSE_HOST=https://your-cluster-id.clickhouse.cloud:8443
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_secure_password
CLICKHOUSE_DATABASE=default

# --- Service Ports ---
BACKEND_PORT=3002
AI_SERVICE_URL=http://127.0.0.1:8000
```

### 3. Initialize the Database Schema
Before running the services, you must provision the tables in ClickHouse Cloud.

```bash
# Navigate to root
python3 -m pip install clickhouse-connect
python3 init_schema.py
```
*Note: This script will drop existing tables and recreate them securely.*

### 4. Start the Python AI Service (Port 8000)
This service handles all LLM inference and State Engine logic.

```bash
cd ai-service
# Create and activate a virtual environment
python3.11 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5. Start the Node.js API Gateway (Port 3002)
This service proxies frontend requests securely to Python and manages file uploads.

```bash
cd backend
npm install
npm run dev
# The gateway will boot on http://localhost:3002
```

### 6. Start the React Frontend (Port 5173)
The cinematic user interface for Directors and Script Supervisors.

```bash
cd frontend
npm install
npm run dev
# The UI will boot on http://localhost:5173
```

---

## 🎮 Operations & User Guide

Once all three services are running, follow this workflow to test the system:

1. **Access the App**: Navigate to `http://localhost:5173` in your browser.
2. **Create a Project**: Click the Project Dropdown in the top navigation bar and select **"+ Create New Project"**. Give it an ID like `prod-alpha`.
3. **Seed Baseline Data (Optional but Recommended)**: 
   - Go to the **Director HUD** (`/live-monitor`) from the sidebar.
   - Click the small **"Seed Demo Baseline"** button in the system terminal. This will populate your active project in ClickHouse with chronological script data for "Scene 17".
4. **Analyze Footage**:
   - Go to **Footage** (`/footage`).
   - Enter `Scene ID: scene_25` and `Character: arjun`.
   - Upload a test MP4 clip or click **Analyze Take**.
   - Watch as Gemini Vision extracts the actor's state, checks it against the ClickHouse ledger, and flags a Continuity Conflict if the injury is on the wrong arm!
5. **Resolve Conflicts**:
   - Navigate to **Conflicts** (`/conflicts`) to see the system's financial ROI calculations for reshooting vs fixing in post.

---

## 🗄️ Database Schema & Event Ledger

CINESTATE utilizes an **Event Sourcing** pattern. We never UPDATE a row; we only INSERT new chronological observations.

### `production_state_ledger`
| Column | Type | Description |
|--------|------|-------------|
| `event_id` | `UUID` | Unique identifier for the observation |
| `project_id` | `String` | Multi-tenant isolation |
| `scene_id` | `String` | Chronological placement (e.g. `scene_25`) |
| `entity_type` | `Enum` | `CHARACTER`, `PROP`, `SET` |
| `entity_id` | `String` | e.g. `arjun`, `rolex_watch` |
| `attribute_name`| `String` | e.g. `injury_location`, `color` |
| `observed_value`| `String` | e.g. `right_arm`, `red` |
| `confidence` | `UInt8` | AI Confidence score (0-100) |
| `event_type` | `Enum` | `STATE_SNAPSHOT` (from script), `VIDEO_OBSERVATION` |
| `created_at` | `DateTime` | Timestamp of the event |

---

## 🔒 Security & Compliance

- **No Hardcoded Secrets**: All keys are strictly loaded via `os.getenv` and `process.env`.
- **Strict Error Boundaries**: The Node Gateway strips Python stack traces and forwards clean `500` status codes.
- **Fail-Safe Integrity**: If Gemini hallucinates output schemas, the system crashes intentionally rather than logging corrupt data into ClickHouse.
- **Multi-Tenancy**: The React context explicitly passes `activeProjectId` to every API call, which is enforced in the ClickHouse `WHERE` clauses.

---

## 🔧 Troubleshooting & FAQ

**Q: I'm getting a 500 error when uploading a video.**
**A:** Check the terminal output of the `ai-service`. If Gemini returns a schema error, you may need to ensure your `GEMINI_API_KEY` has multimodal permissions, or the video file is too large.

**Q: ClickHouse connection refused.**
**A:** Ensure your `.env` contains `CLICKHOUSE_HOST` with `https://` prefix and port `8443`. Ensure your network allows outbound connections to ClickHouse Cloud.

**Q: The dashboard shows no data.**
**A:** Ensure you have created a project in the top navigation bar. The system strictly isolates data per project.

---

## 📄 License

This project is open-source under the MIT License. See the [LICENSE](LICENSE) file for details.

---
*Developed for the future of agentic filmmaking.*
