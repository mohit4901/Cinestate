import React, { useEffect, useState } from 'react';
import { Database, History, Search, ArrowRight, Shield, Layers, FileText, Video, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
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
      {/* Header */}
      <div className="border-b border-[#dadce0] pb-4">
        <h1 className="text-2xl font-normal text-[#202124] tracking-tight">
          Production State
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Historical state across characters, scenes and production events in ClickHouse Cloud.
        </p>
      </div>

      {/* Top Filter Bar */}
      <div className="gc-card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs text-[#5f6368] font-semibold uppercase">
          <Filter className="w-4 h-4 text-[#1a73e8]" />
          Filters:
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Project</label>
          <select disabled className="px-3 py-1.5 rounded bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#202124] font-bold">
            <option>Project Aurora</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Character</label>
          <select
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="px-3 py-1.5 rounded bg-white border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="arjun">Arjun (Lead Character)</option>
            <option value="maya">Maya (Co-Lead)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Attribute</label>
          <select
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="px-3 py-1.5 rounded bg-white border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="injury_location">Injury Location</option>
            <option value="watch_wrist">Watch Wrist</option>
            <option value="jacket_color">Jacket Color</option>
          </select>
        </div>

        <button
          onClick={loadState}
          className="gc-btn-secondary ml-auto cursor-pointer"
        >
          Query ClickHouse State
        </button>
      </div>

      {/* Main Memory Timeline & State Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <History className="w-4 h-4 text-[#1a73e8]" />
              Character State Timeline: <code className="text-[#1a73e8] font-bold">{character.toUpperCase()}</code> / <code className="text-[#188038] font-bold">{attribute}</code>
            </h3>
            <span className="gc-chip-blue font-mono">
              ClickHouse Memory
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Step 1: Scene 17 Baseline */}
            <div className="p-4 rounded-md bg-[#f8f9fa] border border-[#dadce0] space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="text-[#1a73e8] font-bold text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  SCENE 17 — SCREENPLAY BASELINE FACT
                </span>
                <span className="gc-chip-green">98% CONFIDENCE</span>
              </div>
              <div className="text-sm font-bold text-[#202124]">
                {attribute} = <code className="text-[#1a73e8]">left_arm</code>
              </div>
              <p className="text-xs text-[#5f6368] font-sans">
                Extracted from Scene 17 Screenplay PDF Page 4. Initial state snapshot in ClickHouse Cloud.
              </p>
            </div>

            {/* Step 2: Scene 21 Confirmation */}
            <div className="p-4 rounded-md bg-[#f8f9fa] border border-[#dadce0] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1a73e8] font-bold text-xs flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  SCENE 21 — CONFIRMED FOOTAGE OBSERVATION
                </span>
                <span className="gc-chip-green">96% CONFIDENCE</span>
              </div>
              <div className="text-sm font-bold text-[#202124]">
                {attribute} = <code className="text-[#1a73e8]">left_arm</code>
              </div>
              <p className="text-xs text-[#5f6368] font-sans">
                Extracted from Scene 21 Take 1 footage by Gemini 2.0 Vision. Consistent with Scene 17 baseline.
              </p>
            </div>

            {/* Step 3: Scene 25 Conflict */}
            <div className="p-4 rounded-md bg-[#fce8e6]/40 border border-[#fad2cf] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#d93025] font-bold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  SCENE 25 (TAKE 3) — OBSERVED FOOTAGE
                </span>
                <span className="gc-chip-red">CONFLICT (93% CONF)</span>
              </div>
              <div className="text-sm font-bold text-[#d93025]">
                {attribute} = <code className="text-[#d93025]">right_arm</code>
              </div>
              <p className="text-xs text-[#202124] font-sans">
                Extracted from Take 3 video footage @ 00:12.8. Mismatch flagged: <code className="text-[#d93025] font-bold">left_arm != right_arm</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Downstream Scene Dependencies Graph */}
        <div className="gc-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#b06000]" />
            ClickHouse Dependencies Graph
          </h3>
          <p className="text-xs text-[#5f6368]">
            Scenes dependent on state established in <code className="text-[#202124] font-bold">Scene 17</code>:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-[#fef7e0] border border-[#feefc3] space-y-1">
              <div className="flex justify-between text-[#b06000] font-bold">
                <span>SCENE 26</span>
                <span className="gc-chip-amber">AFFECTED</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">INT. POLICE CAR — Dialogue assumes left_arm bandage.</p>
            </div>

            <div className="p-3 rounded bg-[#fef7e0] border border-[#feefc3] space-y-1">
              <div className="flex justify-between text-[#b06000] font-bold">
                <span>SCENE 28</span>
                <span className="gc-chip-amber">AFFECTED</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">EXT. ALLEYWAY — Fight scene choreography restriction.</p>
            </div>

            <div className="p-3 rounded bg-[#fce8e6] border border-[#fad2cf] space-y-1">
              <div className="flex justify-between text-[#d93025] font-bold">
                <span>SCENE 31</span>
                <span className="gc-chip-red">CRITICAL BREAK</span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-sans">INT. HOSPITAL ROOM — Doctor examines cast on left_arm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
