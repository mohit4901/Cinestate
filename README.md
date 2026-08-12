# 🎬 CINESTATE: Autonomous Cinema Intelligence

**Built for the Google Cloud "Agentic Cinema: The Blockbuster Hackathon" ($75,000 Prize Pool)**
**Track: ClickHouse Partner Track**

CINESTATE is a Production Memory & Intelligence Platform designed to eliminate Hollywood's multi-million dollar continuity errors. By orchestrating **Gemini 2.0 Flash Vision** and **ClickHouse Cloud** via the **Model Context Protocol (MCP)**, CINESTATE actively monitors live camera feeds on set and instantly cross-references them against script baseline facts to detect continuity hallucinations (errors) before the director yells "Cut."

![CINESTATE Dashboard](https://raw.githubusercontent.com/google/material-design-icons/master/png/action/visibility/materialicons/24dp/2x/baseline_visibility_black_24dp.png) *(Insert your actual screenshot here!)*

## 🏆 Hackathon Alignment (Why This Solves the Problem)
In film production, a continuity error (e.g., an actor wearing a watch in take 1, but not in take 2) can cost **$1,500+ per hour** to reshoot on set, or upwards of **$45,000** to fix in post-production VFX. 

CINESTATE solves this real-world enterprise friction by:
1. **Establishing Ground Truth:** Parsing screenplays to extract baseline facts (wardrobe, props, injuries).
2. **Agentic Memory (ClickHouse MCP):** Storing all entities, attributes, and temporal events in ClickHouse Cloud for lightning-fast, vector-capable retrieval via an MCP server.
3. **Live Vision (Gemini 2.0 Flash + TFJS):** Running local TensorFlow.js object detection on the director's monitor, while sending critical frames to Gemini 2.0 Flash to evaluate complex state (e.g., "Is the injury bandage on the left or right arm?").
4. **Deterministic Resolution:** Alerting the director in real-time if a conflict is found, providing immediate financial ROI options (Reshoot vs. Post-Fix).

## 🚀 Architecture & Tech Stack
- **Google Cloud AI:** Gemini 2.0 Flash (`google-genai` SDK v2.17) for multimodal frame analysis.
- **Partner Integration (ClickHouse):** ClickHouse Cloud used as the persistent memory ledger. Connected via the official `mcp-clickhouse` server to allow the AI Agent to query past scene states deterministically.
- **Frontend:** React + Vite, GSAP 3D ScrollTrigger Animations, Tailwind CSS, Google Material 3 Design System.
- **Local Browser ML:** TensorFlow.js + COCO-SSD running directly on the `<canvas>` for real-time bounding box tracking.
- **Backend/Agents:** FastAPI (Python), LangChain/Smolagents orchestration.

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- ClickHouse Cloud Account URL & Credentials
- Google Cloud / Gemini API Key

### 1. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 2. Start the Backend API Gateway
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:3002
```

### 3. Start the AI Service & Agents
```bash
cd ai-service
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

*Ensure you configure your `.env` files in both backend and ai-service with your `CLICKHOUSE_URL`, `CLICKHOUSE_PASSWORD`, and `GEMINI_API_KEY`!*

## 🎬 The 3-Minute Demo Scenario (How to Test)
1. Open the **Cinematic Landing Page** (`http://localhost:5173/`).
2. Scroll down to experience the GSAP 3D depth interaction, then click **Launch Studio Dashboard**.
3. Navigate to **Live Camera Stream** (`/live-monitor`).
4. Click **Connect Live Camera Stream**. You will see TensorFlow.js drawing real-time bounding boxes around you.
5. Click **Demo Conflict Scenario**. CINESTATE will simulate capturing a frame, sending it to Gemini, checking ClickHouse memory, and discovering that the actor's injury is on the wrong arm compared to the script baseline!
6. Review the HUD Alert box recommending a reshoot to save post-production costs.

## 📄 License
This project is open-source under the MIT License. See the [LICENSE](LICENSE) file for details.
