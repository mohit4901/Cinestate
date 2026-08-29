# 🎬 CINESTATE — Official Hackathon Demo Video Guide (3-Minute Script)

Welcome! This step-by-step guide is designed to help you record a **flawless, high-scoring 3-minute demo video** for your Devpost hackathon submission.

---

## 🎥 Pre-Recording Setup:
1. **Screen Layout (Split Screen Recommended):**
   * **Left Side (70%):** Chrome Browser with CINESTATE Frontend (`http://localhost:5173`)
   * **Right Side (30%):** Terminal showing AI Service logs with the high-tech Cyberpunk HUD (`python3 -m uvicorn app.main:app`)
2. **Recording Tool:** Press **`Cmd + Shift + 5`** on your Mac to start Screen Recording with microphone audio.

---

## ⏱️ Video Timeline & Spoken Script:

### 🌟 0:00 – 0:35 : The Hook & Problem Statement
* **What to Show on Screen:** Open CINESTATE **Mission Control Dashboard** (`http://localhost:5173/dashboard`).
* **What to Say:**
  > *"Hi everyone! In modern film and episodic television production, multi-million dollar continuity mistakes happen all the time — an actor's bandage is on the wrong arm across scenes, wardrobe changes unexpectedly, or a prop disappears. Today, this requires human script supervisors to manually flip through hundreds of script pages and camera logs.*
  >
  > *Meet **CINESTATE** — the first Agentic Cinema Intelligence Platform powered by **Google ADK, Gemini 3.5 Flash Multimodal Vision, and ClickHouse Cloud** that provides automated, deterministic production memory and continuity supervision in real-time."*

---

### 📜 0:35 – 1:15 : Feature 1: Dynamic Screenplay Ingestion
* **What to Show on Screen:** Click **"Script Breakdown"** (`/script`) from the sidebar. Drag & drop `data/screenplay_aurora_protocol.txt` and click **"Analyze Script with Gemini & ClickHouse"**.
* **What to Say:**
  > *"It starts with the screenplay. As soon as a production begins, we upload the raw screenplay PDF or text. Gemini 3.5 Flash reads the entire screenplay, extracting characters, locations, props, and critical physical state facts — like Arjun's left arm injury in Scene 17.*
  >
  > *These facts are instantly written to **ClickHouse Cloud**, establishing our immutable production baseline and dependency graph."*

---

### 👁️ 1:15 – 2:05 : Feature 2: Multimodal Take Ingestion & Continuity Watchdog
* **What to Show on Screen:** Go to **"Footage Inspector"** (`/footage`) or **Dashboard**.
  1. **First test Take 1 (Consistent Take):**
     * Take ID: `take_01`, Entity: `arjun`, Scene: `scene_25`.
     * Click **Analyze Take**.
     * Show the terminal print: **`✅ 100% IN CONTINUITY (APPROVED)`**.
  2. **Now test Take 3 (The Continuity Conflict!):**
     * Take ID: `take_03`, Entity: `arjun`, Scene: `scene_25`.
     * Click **Analyze Take**.
     * Show the terminal print: **`🚨 CONTINUITY DISCREPANCY DETECTED`** with Blast Radius!
* **What to Say:**
  > *"On set, camera takes are ingested live. Watch what happens when we analyze Take 1: Gemini parses the video, compares against ClickHouse state, and verifies that Arjun's injury is consistently on his left arm — 100% Approved.*
  >
  > *Now, in Take 3, the actor accidentally wore the bandage on his right arm! CINESTATE's Deterministic State Engine catches the mismatch immediately: Expected Left Arm vs Observed Right Arm. Look at the terminal: our Multi-Agent Orchestrator computed the downstream **Blast Radius**, showing that Scenes 26, 28, and 31 will be compromised if this take is accepted!"*

---

### ⚖️ 2:05 – 2:40 : Feature 3: Actionable Director Resolution & Audit Ledger
* **What to Show on Screen:** Navigate to **"Continuity Conflicts"** (`/conflicts`). Click **"Approve Reshoot Directive"** on the conflict card. Show the terminal generate the **`⚖️ DIRECTOR ACTION EXECUTED`** card.
* **What to Say:**
  > *"CINESTATE doesn't just flag errors; RecommendationAgent provides actionable directives to the director: 'Reshoot Take 3 immediately before tearing down the set lighting'.*
  >
  > *When the director approves the reshoot, the decision is committed as an immutable audit record in ClickHouse's `agent_audit_log`, ensuring a verifiable ledger of all production state decisions."*

---

### 🚀 2:40 – 3:00 : Conclusion & Architecture Recap
* **What to Show on Screen:** Show the **Live Director HUD** (`/director-hud`) with camera scan or the main Dashboard metrics.
* **What to Say:**
  > *"Built with Google ADK, Gemini 3.5 Flash, ClickHouse Cloud, and React, CINESTATE brings Hollywood-grade agentic memory to the modern film set, saving millions in reshoot costs and post-production fixes.*
  >
  > *Thank you!"*

---

## 📁 Files to use:
* Screenplay 1: `data/screenplay_aurora_protocol.txt`
* Screenplay 2: `data/screenplay_cyberpunk_neomumbai.txt`
