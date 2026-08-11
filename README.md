# CINESTATE 🎬
### AI Production State & Continuity Intelligence Platform
**Google Cloud Agentic Cinema Hackathon 2026 — ClickHouse Track Entry**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Database: ClickHouse Cloud](https://img.shields.io/badge/Database-ClickHouse%20Cloud-yellow.svg)](https://clickhouse.com/)
[![AI Engine: Gemini 2.0 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%202.0%20Flash-blue.svg)](https://deepmind.google/technologies/gemini/)
[![Framework: Google ADK](https://img.shields.io/badge/Framework-Google%20ADK-red.svg)](https://cloud.google.com/)

---

## 📽️ The Problem
Film and television productions lose **$50,000 to $500,000 per reshoot day** due to undetected continuity errors caught weeks after filming. An actor’s injury on the wrong arm, a wristwatch switched between takes, or a costume change between connected scenes can ruin millions of dollars in footage.

A film is not a static collection of files — **it is a continuously evolving state machine**.

---

## 🚀 What CINESTATE Does
CINESTATE is an autonomous media-production state intelligence engine powered by:
- **Google Gemini 2.0 Flash**: Multimodal perception extracting precise visual observations from video takes.
- **Google Agent Development Kit (ADK)**: Multi-agent orchestration (Orchestrator, Script, Evidence, State, Conflict, Impact, Recommendation).
- **ClickHouse Cloud**: Immutable production event memory and state snapshot history.
- **`mcp-clickhouse`**: Runtime Model Context Protocol (MCP) server allowing ADK agents to query ClickHouse directly.
- **Deterministic Conflict Engine**: Pure Python state comparison (`left_arm != right_arm`) preventing LLM hallucination.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────┐
                    │      React + Vite SPA        │
                    │   Cinematic Control Station  │
                    └──────────────┬───────────────┘
                                   │ HTTP / API
                                   ▼
                    ┌──────────────────────────────┐
                    │     Node.js Express API      │
                    │  Gateway & Dashboard Router  │
                    └──────────────┬───────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼                                           ▼
┌─────────────────────────┐                ┌─────────────────────────┐
│   Python AI Service     │                │   ClickHouse Cloud      │
│  FastAPI + ADK Agents   │                │   Production Memory     │
└────────────┬────────────┘                └─────────────▲───────────┘
             │                                           │
             ├─────────────────── MCP ───────────────────┤
             │           `mcp-clickhouse` server         │
             │                                           │
             ▼                                           │
┌─────────────────────────┐                              │
│   Google Gemini 2.0     │──────────────────────────────┘
│   Multimodal Vision     │ (Reads/Writes Production Events)
└─────────────────────────┘
```

---

## 🛠️ ClickHouse Schema (7 Core Tables)
All application state lives in ClickHouse Cloud — **Zero MongoDB dependency**.

1. `production_events`: Immutable log of every script fact, video observation, and agent action.
2. `state_snapshots`: Point-in-time state of characters, props, and costumes per scene.
3. `continuity_conflicts`: Recorded conflicts with expected vs observed values, confidence, and status.
4. `scene_dependencies`: Graph tracking which future scenes depend on state established in earlier scenes.
5. `agent_audit_log`: Real-time telemetry for all ADK agent tool calls and latencies.
6. `projects`: High-level production metadata.
7. `scenes`: Scene breakdowns, locations, and time-of-day attributes.

---

## ⚡ Quick Start / Local Setup

### 1. Environment Setup
Copy `.env.example` to `.env` and add your ClickHouse Cloud credentials and Gemini API key:
```bash
CLICKHOUSE_HOST=your-instance.clickhouse.cloud
CLICKHOUSE_PORT=8443
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_SECURE=true

GEMINI_API_KEY=AIzaSy...
```

### 2. Initialize Database & Seed Demo Data
```bash
# Initialize 7 ClickHouse tables
python3 init_schema.py

# Seed Project Aurora conflict scenario
python3 seed_demo.py
```

### 3. Start Backend & AI Service
```bash
# Terminal 1: Python AI Service
cd ai-service
python3.11 -m uvicorn app.main:app --port 8000 --reload

# Terminal 2: Node.js Express Gateway
cd backend
npm install
npm run dev

# Terminal 3: React Frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to open the CINESTATE Control Station!

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
