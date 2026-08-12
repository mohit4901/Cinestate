import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  Video,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  DollarSign,
  Layers,
  Clock,
  Zap,
  TrendingDown,
  ChevronRight,
  Sliders,
  Play,
  Check,
  Shield,
  FileCheck,
} from 'lucide-react';
import { getStats, getConflicts, getDependencies, analyzeTake } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchdogRunning, setWatchdogRunning] = useState(false);
  const [watchdogStep, setWatchdogStep] = useState(0);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, confRes, depRes] = await Promise.all([
        getStats(),
        getConflicts(),
        getDependencies('project-aurora', 'scene_17'),
      ]);
      setStats(statsRes.stats);
      setConflicts(confRes.conflicts || []);
      setDependencies(depRes.dependencies || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAutonomousWatchdog = async () => {
    setWatchdogRunning(true);
    setWatchdogStep(1); // 1: Ingesting Footage

    setTimeout(() => setWatchdogStep(2), 800); // 2: Gemini Perception
    setTimeout(() => setWatchdogStep(3), 1600); // 3: ClickHouse Memory Lookup
    setTimeout(() => setWatchdogStep(4), 2400); // 4: Deterministic Conflict Check

    try {
      await analyzeTake({
        project_id: 'project-aurora',
        scene_id: 'scene_25',
        take_id: 'take_03',
        file_path: './uploads/scene_25_take3.mp4',
      });
      setTimeout(() => {
        setWatchdogStep(5); // 5: Conflict Alert Issued
        loadData();
      }, 3000);
    } catch (err) {
      console.error('Watchdog trigger error:', err);
    } finally {
      setTimeout(() => setWatchdogRunning(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Google Stream Ticker Bar */}
      <div className="bg-white border border-[#dadce0] rounded-xl px-4 py-2 flex items-center justify-between text-xs font-mono shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#1a73e8] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-ping"></span>
            CLICKHOUSE EVENT MEMORY STREAM
          </span>
          <span className="text-[#dadce0]">|</span>
          <span className="text-[#202124] truncate max-w-2xl font-sans font-medium">
            Proactive Pipeline Watchdog: <code className="text-[#137333] font-bold">VIDEO_OBSERVATION</code> [Scene 25 / Take 3] Arjun injury_location = <code className="text-[#c5221f] font-bold">right_arm</code> (0.93 conf)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#5f6368]">
          <span>Latency: <strong className="text-[#137333]">12ms</strong></span>
          <span>MCP Server: <strong className="text-[#1a73e8]">mcp-clickhouse</strong></span>
        </div>
      </div>

      {/* Main Google Cloud Studio Executive Header Banner */}
      <div className="google-card-light p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-[#e8f0fe]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1a73e8] uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#1a73e8]" />
              AUTONOMOUS CONTINUITY OPERATING SYSTEM • GOOGLE ADK + CLICKHOUSE CLOUD
            </div>
            <h1 className="text-3xl font-extrabold text-[#202124] tracking-tight flex items-center gap-3">
              CINESTATE Executive Control Station
              <span className="px-3 py-1 text-xs rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-mono">
                Project Aurora
              </span>
            </h1>
            <p className="text-sm text-[#5f6368] max-w-3xl leading-relaxed">
              CINESTATE doesn't wait for a continuity error to be discovered in post-production. It detects state-breaking evidence as soon as new footage enters the production pipeline, offloading state checks to ClickHouse Cloud.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={runAutonomousWatchdog}
              disabled={watchdogRunning}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#1a73e8] to-[#0288d1] hover:from-[#1557b0] hover:to-[#01579b] text-white font-extrabold text-xs tracking-wider shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${watchdogRunning ? 'animate-bounce text-amber-300' : ''}`} />
              {watchdogRunning ? 'WATCHDOG RUNNING PIPELINE...' : 'SIMULATE LIVE FOOTAGE INGESTION'}
            </button>

            <button
              onClick={() => navigate('/conflicts')}
              className="px-5 py-3 rounded-xl bg-[#c5221f] hover:bg-[#a50e0e] text-white font-bold text-xs tracking-wider shadow-md border border-rose-600 flex items-center gap-2.5 transition animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              CONFLICT CENTER (1 HIGH SEVERITY)
            </button>
          </div>
        </div>

        {/* 🔥 AUTONOMOUS WATCHDOG PIPELINE STEP EXPLORER */}
        {watchdogRunning && (
          <div className="mt-6 p-4 rounded-xl bg-white border border-[#d2e3fc] space-y-3 font-mono text-xs shadow-sm">
            <div className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1a73e8] animate-spin" />
              AUTONOMOUS CONTINUITY WATCHDOG INGESTION STREAM
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className={`p-2.5 rounded-lg border text-center ${watchdogStep >= 1 ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>
                1. FOOTAGE INGEST
              </div>
              <div className={`p-2.5 rounded-lg border text-center ${watchdogStep >= 2 ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>
                2. GEMINI VISION
              </div>
              <div className={`p-2.5 rounded-lg border text-center ${watchdogStep >= 3 ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>
                3. CLICKHOUSE LOOKUP
              </div>
              <div className={`p-2.5 rounded-lg border text-center ${watchdogStep >= 4 ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>
                4. STATE COMPARISON
              </div>
              <div className={`p-2.5 rounded-lg border text-center ${watchdogStep >= 5 ? 'bg-[#fce8e6] border-[#c5221f] text-[#c5221f] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>
                5. DIRECTOR ALERT
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tracked Scenes */}
        <div className="google-card-light p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
              Scenes Tracked
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] flex items-center justify-center border border-[#d2e3fc]">
              <Film className="w-4 h-4 text-[#1a73e8]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-[#202124] font-mono">
              {stats?.total_scenes || 8}
            </span>
            <span className="text-xs text-[#5f6368]">screenplay scenes</span>
          </div>
          <div className="text-[10px] text-[#5f6368] font-mono pt-1 border-t border-[#dadce0]/60">
            ClickHouse `scenes` table
          </div>
        </div>

        {/* ClickHouse Event Store */}
        <div className="google-card-light p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
              Production Events
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e1f5fe] flex items-center justify-center border border-[#b3e5fc]">
              <Database className="w-4 h-4 text-[#0288d1]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-[#202124] font-mono">
              {stats?.total_events || 31}
            </span>
            <span className="text-xs text-[#0288d1] font-bold">ClickHouse Cloud</span>
          </div>
          <div className="text-[10px] text-[#5f6368] font-mono pt-1 border-t border-[#dadce0]/60">
            Immutable MergeTree store
          </div>
        </div>

        {/* Active Conflicts */}
        <div className="google-card-light p-5 border-rose-300 bg-[#fce8e6]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#c5221f] uppercase tracking-wider">
              Active Conflicts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#fce8e6] flex items-center justify-center border border-[#fad2cf]">
              <AlertTriangle className="w-4 h-4 text-[#c5221f]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-[#c5221f] font-mono">
              {stats?.open_conflicts || 1}
            </span>
            <span className="text-xs text-[#c5221f] font-bold uppercase">
              High Severity
            </span>
          </div>
          <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#fad2cf]">
            Scene 25 Take 3 (Arjun Injury)
          </div>
        </div>

        {/* Reshoot Financial Risk */}
        <div className="google-card-light p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b06000] uppercase tracking-wider">
              Unresolved Risk
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#fef7e0] flex items-center justify-center border border-[#feefc3]">
              <DollarSign className="w-4 h-4 text-[#b06000]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-[#b06000] font-mono">
              $45,000
            </span>
            <span className="text-xs text-[#b06000] font-semibold">Post-VFX cost</span>
          </div>
          <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0]/60">
            Immediate reshoot: $1,500
          </div>
        </div>

        {/* Consistency Index */}
        <div className="google-card-light p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
              Consistency Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] flex items-center justify-center border border-[#ceead6]">
              <CheckCircle2 className="w-4 h-4 text-[#137333]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-[#137333] font-mono">
              {stats?.consistency_score || 92}%
            </span>
            <span className="text-xs text-[#5f6368]">film accuracy</span>
          </div>
          <div className="text-[10px] text-[#5f6368] font-mono pt-1 border-t border-[#dadce0]/60">
            Analytical ClickHouse calculation
          </div>
        </div>
      </div>

      {/* Main Feature: Interactive Visual Blast Radius 2.0 & Evidence Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Visual Scene Graph & Blast Radius Canvas */}
        <div className="lg:col-span-2 google-card-light p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#dadce0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#1a73e8]" />
                  Blast Radius 2.0 — Production Dependency Tree
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  ClickHouse `scene_dependencies` graph maps state dependencies across scenes.
                </p>
              </div>
              <span className="text-xs font-mono bg-[#f1f3f4] text-[#1a73e8] font-bold px-3 py-1 rounded-full border border-[#dadce0]">
                ClickHouse Graph Engine
              </span>
            </div>

            {/* Interactive Timeline Graph Simulation */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-3">
                <div className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex justify-between font-mono">
                  <span>PRODUCTION MEMORY TIMELINE & CASCADING IMPACT</span>
                  <span className="text-[#1a73e8]">Arjun / injury_location</span>
                </div>

                {/* Nodes Display */}
                <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                  {/* Scene 17 */}
                  <div className="p-3 rounded-lg bg-[#e6f4ea] border border-[#ceead6] text-center space-y-1">
                    <div className="text-[10px] text-[#137333] font-bold">SCENE 17</div>
                    <div className="text-[11px] font-extrabold text-[#202124]">left_arm</div>
                    <div className="text-[9px] text-[#137333] font-semibold">FACT (98%)</div>
                  </div>

                  {/* Scene 21 */}
                  <div className="p-3 rounded-lg bg-[#e6f4ea] border border-[#ceead6] text-center space-y-1">
                    <div className="text-[10px] text-[#137333] font-bold">SCENE 21</div>
                    <div className="text-[11px] font-extrabold text-[#202124]">left_arm</div>
                    <div className="text-[9px] text-[#137333] font-semibold">CONFIRMED</div>
                  </div>

                  {/* Scene 25 (Take 3 Conflict Node) */}
                  <div className="p-3 rounded-lg bg-[#fce8e6] border-2 border-[#c5221f] text-center space-y-1">
                    <div className="text-[10px] text-[#c5221f] font-bold">SCENE 25 (T3)</div>
                    <div className="text-[11px] font-extrabold text-[#c5221f]">right_arm</div>
                    <div className="text-[9px] bg-[#c5221f] text-white font-bold rounded px-1">CONFLICT!</div>
                  </div>

                  {/* Scene 26 (Affected) */}
                  <div className="p-3 rounded-lg bg-[#fef7e0] border border-[#feefc3] text-center space-y-1">
                    <div className="text-[10px] text-[#b06000] font-bold">SCENE 26</div>
                    <div className="text-[11px] text-[#b06000] font-bold">left_arm</div>
                    <div className="text-[9px] text-[#b06000]">AFFECTED</div>
                  </div>

                  {/* Scene 28 & 31 (Affected) */}
                  <div className="p-3 rounded-lg bg-[#fef7e0] border border-[#feefc3] text-center space-y-1">
                    <div className="text-[10px] text-[#b06000] font-bold">SCENES 28, 31</div>
                    <div className="text-[11px] text-[#b06000] font-bold">left_arm</div>
                    <div className="text-[9px] text-[#c5221f] font-bold">CRITICAL BREAK</div>
                  </div>
                </div>
              </div>

              {/* Financial Risk Comparison Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#e6f4ea]/60 border border-[#ceead6] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#137333] uppercase">
                    <span>OPTION A: IMMEDIATE RESHOOT (TODAY)</span>
                    <TrendingDown className="w-4 h-4 text-[#137333]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#202124] font-mono">$1,500</div>
                  <p className="text-xs text-[#5f6368]">
                    Reshoot Take 3 immediately while actor & set lighting are active. Zero schedule delay.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fce8e6]/60 border border-[#fad2cf] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#c5221f] uppercase">
                    <span>OPTION B: POST-PRODUCTION VFX FIX</span>
                    <AlertTriangle className="w-4 h-4 text-[#c5221f]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#c5221f] font-mono">$45,000+</div>
                  <p className="text-xs text-[#5f6368]">
                    Paint out bandage digitally across 3 downstream scenes + 3-week post-production delay risk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#dadce0]">
            <span className="text-xs text-[#5f6368] font-mono">
              Query Latency: 14ms • ClickHouse Graph Engine
            </span>
            <button
              onClick={() => navigate('/conflicts')}
              className="google-btn-blue px-5 py-2.5 text-xs tracking-wide flex items-center gap-2 cursor-pointer"
            >
              Open Conflict Inspection & Action Planner
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Gemini Multimodal Vision Evidence Card */}
        <div className="google-card-light p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#dadce0] pb-3">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#1a73e8]" />
                Gemini Vision Evidence Card
              </h3>
              <span className="text-[10px] font-mono text-[#1a73e8] bg-[#e8f0fe] border border-[#d2e3fc] px-2 py-0.5 rounded font-bold">
                Gemini 2.0 Flash
              </span>
            </div>

            {/* Video Frame Mock Inspector with Bounding Box Overlay */}
            <div className="aspect-video rounded-xl bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#202124] via-transparent to-transparent" />

              {/* Bounding box visual simulation */}
              <div className="absolute inset-12 border-2 border-rose-500 rounded bg-rose-500/20 flex items-start justify-end p-2 animate-pulse">
                <span className="bg-[#c5221f] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                  ARJUN: RIGHT ARM INJURY @ 00:12.8 (93%)
                </span>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <div className="text-xs font-mono font-bold text-white">Scene 25 / Take 3</div>
                <div className="text-[10px] text-slate-300 font-mono">Frame Timestamp: 00:12.8</div>
              </div>
            </div>

            {/* Extracted Facts List */}
            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">
                EXTRACTED VISUAL FACTS
              </div>
              <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
                <span className="text-[#202124]">injury_location</span>
                <span className="text-[#c5221f] font-bold">right_arm (93%)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
                <span className="text-[#202124]">watch_wrist</span>
                <span className="text-[#b06000] font-bold">right (89%)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
                <span className="text-[#202124]">jacket_color</span>
                <span className="text-[#137333] font-bold">black (97%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/footage')}
            className="google-btn-outlined w-full py-2.5 text-center text-xs tracking-wide cursor-pointer"
          >
            Launch Full Take Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
