import React, { useEffect, useState } from 'react';
import { Database, History, Search, ArrowRight, Shield, Layers, FileText, Video, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getCharacterHistory, getDependencies } from '../services/api';

export default function Production() {
  const [character, setCharacter] = useState('arjun');
  const [attribute, setAttribute] = useState('injury_location');
  const [history, setHistory] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadState = async () => {
    setLoading(true);
    try {
      const [histRes, depRes] = await Promise.all([
        getCharacterHistory('project-aurora', character, attribute),
        getDependencies('project-aurora', 'scene_17'),
      ]);
      setHistory(histRes.history || []);
      setDependencies(depRes.dependencies || []);
    } catch (err) {
      console.error('Production state query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, [character, attribute]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          ClickHouse Production Memory Ledger
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          ARJUN — PRODUCTION MEMORY explorer
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          ClickHouse Cloud serves as CINESTATE's persistent Production Memory. Query versioned character states, baseline facts, and visual observations across all scenes.
        </p>
      </div>

      {/* Selectors */}
      <div className="google-card-light p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Entity / Character</label>
          <select
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="arjun">Arjun (Lead Character)</option>
            <option value="maya">Maya (Co-Lead)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Attribute Memory</label>
          <select
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="injury_location">Injury Location</option>
            <option value="watch_wrist">Watch Wrist</option>
            <option value="jacket_color">Jacket Color</option>
          </select>
        </div>

        <button
          onClick={loadState}
          className="google-btn-blue ml-auto px-4 py-1.5 text-xs font-semibold cursor-pointer"
        >
          Query ClickHouse Memory
        </button>
      </div>

      {/* Main Memory Timeline & State Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 google-card-light p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <History className="w-4 h-4 text-[#1a73e8]" />
              CHRONOLOGICAL PRODUCTION MEMORY LEDGER: <code className="text-[#1a73e8]">{character.toUpperCase()}</code> / <code className="text-[#137333]">{attribute}</code>
            </h3>
            <span className="text-xs font-mono bg-[#e6f4ea] text-[#137333] font-bold px-2.5 py-0.5 rounded border border-[#ceead6]">
              Immutable MergeTree Events
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Step 1: Scene 17 Baseline */}
            <div className="p-4 rounded-xl bg-[#e6f4ea]/60 border border-[#ceead6] space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="text-[#137333] font-extrabold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  SCENE 17 — ESTABLISHED SCREENPLAY FACT
                </span>
                <span className="text-[10px] bg-[#137333] text-white px-2 py-0.5 rounded font-bold">BASE FACT</span>
              </div>
              <div className="text-sm font-extrabold text-[#202124]">
                {attribute} = <code className="text-[#137333]">left_arm</code> (98% Confidence)
              </div>
              <p className="text-xs text-[#5f6368] font-sans">
                Extracted from Scene 17 Screenplay PDF Page 4. Stored as initial state snapshot in ClickHouse Cloud.
              </p>
            </div>

            {/* Step 2: Scene 21 Confirmation */}
            <div className="p-4 rounded-xl bg-[#e8f0fe]/60 border border-[#d2e3fc] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1a73e8] font-extrabold text-sm flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  SCENE 21 — CONFIRMED FOOTAGE OBSERVATION
                </span>
                <span className="text-[10px] bg-[#1a73e8] text-white px-2 py-0.5 rounded font-bold">CONFIRMED</span>
              </div>
              <div className="text-sm font-extrabold text-[#202124]">
                {attribute} = <code className="text-[#1a73e8]">left_arm</code> (96% Confidence)
              </div>
              <p className="text-xs text-[#5f6368] font-sans">
                Extracted from Scene 21 Take 1 footage by Gemini 2.0 Vision. Consistent with Scene 17 baseline.
              </p>
            </div>

            {/* Step 3: Scene 25 Conflict */}
            <div className="p-4 rounded-xl bg-[#fce8e6]/60 border border-[#fad2cf] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#c5221f] font-extrabold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  SCENE 25 (TAKE 3) — STATE-BREAKING INGESTION
                </span>
                <span className="text-[10px] bg-[#c5221f] text-white px-2 py-0.5 rounded font-bold">🔴 CONFLICT</span>
              </div>
              <div className="text-sm font-extrabold text-[#c5221f]">
                {attribute} = <code className="text-[#c5221f]">right_arm</code> (93% Confidence)
              </div>
              <p className="text-xs text-[#202124] font-sans">
                Extracted from newly ingested Take 3 video footage @ 00:12.8. Deterministic conflict engine flagged state mismatch: <code className="text-[#c5221f] font-bold">left_arm != right_arm</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Downstream Scene Dependencies Graph */}
        <div className="google-card-light p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#b06000]" />
            ClickHouse Graph Dependencies
          </h3>
          <p className="text-xs text-[#5f6368]">
            Downstream scenes linked to state established in <code className="text-[#202124] font-bold">Scene 17</code>:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#fef7e0] border border-[#feefc3] space-y-1">
              <div className="flex justify-between text-[#b06000] font-bold">
                <span>SCENE 26</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#feefc3]">AFFECTED</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">INT. POLICE CAR — Dialogue assumes left_arm bandage.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#fef7e0] border border-[#feefc3] space-y-1">
              <div className="flex justify-between text-[#b06000] font-bold">
                <span>SCENE 28</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#feefc3]">AFFECTED</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">EXT. ALLEYWAY — Fight scene assumes left_arm restriction.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#fce8e6] border border-[#fad2cf] space-y-1">
              <div className="flex justify-between text-[#c5221f] font-bold">
                <span>SCENE 31</span>
                <span className="text-[10px] bg-[#c5221f] text-white px-1.5 py-0.2 rounded">CRITICAL BREAK</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">INT. HOSPITAL ROOM — Doctor examines cast on left_arm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
