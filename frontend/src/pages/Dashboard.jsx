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
  Shield,
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
    setWatchdogStep(1);

    setTimeout(() => setWatchdogStep(2), 800);
    setTimeout(() => setWatchdogStep(3), 1600);
    setTimeout(() => setWatchdogStep(4), 2400);

    try {
      await analyzeTake({
        project_id: 'project-aurora',
        scene_id: 'scene_25',
        take_id: 'take_03',
        file_path: './uploads/scene_25_take3.mp4',
      });
      setTimeout(() => {
        setWatchdogStep(5);
        loadData();
      }, 3000);
    } catch (err) {
      console.error('Watchdog trigger error:', err);
    } finally {
      setTimeout(() => setWatchdogRunning(false), 4000);
    }
  };

  const recentActivity = [
    { time: '10:42 AM', title: 'Scene 25 / Take 3 analyzed', desc: 'Gemini 2.0 extracted injury_location = right_arm (93% conf)', type: 'OBSERVATION', icon: Video, color: 'text-[#1a73e8]' },
    { time: '10:41 AM', title: 'Continuity conflict detected', desc: 'State mismatch: left_arm != right_arm in Scene 25 Take 3', type: 'CONFLICT', icon: AlertTriangle, color: 'text-[#d93025]' },
    { time: '10:39 AM', title: 'ClickHouse state updated', desc: 'Recorded 3 visual observations into cinestate.production_events', type: 'CLICKHOUSE', icon: Database, color: 'text-[#188038]' },
    { time: '10:37 AM', title: 'Scene 17 baseline extracted', desc: 'Screenplay fact: Arjun injury_location = left_arm (98% conf)', type: 'SCRIPT', icon: FileText, color: 'text-[#1a73e8]' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-2xl font-normal text-[#202124] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            AI-powered production state and continuity intelligence for Project Aurora.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAutonomousWatchdog}
            disabled={watchdogRunning}
            className="gc-btn-primary cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${watchdogRunning ? 'animate-spin' : ''}`} />
            {watchdogRunning ? 'Running Ingest Pipeline...' : 'Simulate Footage Ingest'}
          </button>
          <button
            onClick={loadData}
            className="gc-btn-secondary cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autonomous Watchdog Active Pipeline Notification */}
      {watchdogRunning && (
        <div className="p-4 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] space-y-2 text-xs font-mono">
          <div className="text-xs font-bold text-[#1a73e8] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1a73e8] animate-spin" />
            AUTONOMOUS WATCHDOG PIPELINE STREAM IN PROGRESS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
            <div className={`p-2 rounded border text-center ${watchdogStep >= 1 ? 'bg-white border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>1. Footage Ingest</div>
            <div className={`p-2 rounded border text-center ${watchdogStep >= 2 ? 'bg-white border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>2. Gemini Vision</div>
            <div className={`p-2 rounded border text-center ${watchdogStep >= 3 ? 'bg-white border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>3. ClickHouse Lookup</div>
            <div className={`p-2 rounded border text-center ${watchdogStep >= 4 ? 'bg-white border-[#1a73e8] text-[#1a73e8] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>4. State Check</div>
            <div className={`p-2 rounded border text-center ${watchdogStep >= 5 ? 'bg-[#fce8e6] border-[#d93025] text-[#d93025] font-bold' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'}`}>5. Director Alert</div>
          </div>
        </div>
      )}

      {/* Google Cloud Style Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenes Card */}
        <div className="gc-card p-5 space-y-2">
          <div className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
            Scenes Tracked
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-normal text-[#202124] font-mono">
              {stats?.total_scenes || 8}
            </span>
            <span className="gc-chip-blue">ClickHouse `scenes`</span>
          </div>
          <div className="text-[11px] text-[#5f6368] pt-2 border-t border-[#f1f3f4]">
            Screenplay baseline breakdown
          </div>
        </div>

        {/* Production Events Card */}
        <div className="gc-card p-5 space-y-2">
          <div className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
            Production Events
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-normal text-[#202124] font-mono">
              {stats?.total_events || 31}
            </span>
            <span className="gc-chip-green">ClickHouse Cloud</span>
          </div>
          <div className="text-[11px] text-[#5f6368] pt-2 border-t border-[#f1f3f4]">
            Immutable MergeTree event store
          </div>
        </div>

        {/* Active Conflicts Card */}
        <div className="gc-card p-5 border-[#fad2cf] bg-[#fce8e6]/10 space-y-2">
          <div className="text-xs font-semibold text-[#d93025] uppercase tracking-wider">
            Active Conflicts
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-normal text-[#d93025] font-mono">
              {stats?.open_conflicts || 1}
            </span>
            <span className="gc-chip-red">HIGH SEVERITY</span>
          </div>
          <div className="text-[11px] text-[#5f6368] pt-2 border-t border-[#fad2cf]">
            Scene 25 / Take 3 (Arjun Injury)
          </div>
        </div>

        {/* Continuity Health Card */}
        <div className="gc-card p-5 space-y-2">
          <div className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
            Continuity Health
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-normal text-[#188038] font-mono">
              {stats?.consistency_score || 92}%
            </span>
            <span className="gc-chip-green">HEALTHY</span>
          </div>
          <div className="text-[11px] text-[#5f6368] pt-2 border-t border-[#f1f3f4]">
            Analytical state calculation
          </div>
        </div>
      </div>

      {/* Production Health Indicator Bar */}
      <div className="gc-card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#202124]">Production Continuity Health Overview</span>
          <span className="font-mono text-[#188038] font-bold">92% Consistent Across 8 Scenes</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#f1f3f4] overflow-hidden flex">
          <div className="h-full bg-[#188038]" style={{ width: '92%' }}></div>
          <div className="h-full bg-[#d93025]" style={{ width: '8%' }}></div>
        </div>
      </div>

      {/* Main Content Grid: Recent Activity Stream & Blast Radius Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Stream */}
        <div className="lg:col-span-2 gc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a73e8]" />
              Recent Activity & Event Stream
            </h3>
            <span className="text-xs font-mono text-[#5f6368]">ClickHouse Stream</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="p-3.5 rounded-md bg-[#f8f9fa] border border-[#dadce0] flex items-start gap-3 text-xs">
                  <div className={`p-2 rounded bg-white border border-[#dadce0] ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#202124]">{act.title}</span>
                      <span className="text-[11px] font-mono text-[#5f6368]">{act.time}</span>
                    </div>
                    <p className="text-xs text-[#5f6368]">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blast Radius & Quick Action Box */}
        <div className="gc-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#dadce0] pb-3 mb-3">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#b06000]" />
                Downstream Blast Radius
              </h3>
              <span className="gc-chip-amber">3 SCENES AFFECTED</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#fef7e0] border border-[#feefc3] text-[#b06000] font-semibold">
                Scene 26: INT. POLICE CAR — Dialogue assumes left_arm
              </div>
              <div className="p-2.5 rounded bg-[#fef7e0] border border-[#feefc3] text-[#b06000] font-semibold">
                Scene 28: EXT. ALLEYWAY — Fight choreography affected
              </div>
              <div className="p-2.5 rounded bg-[#fce8e6] border border-[#fad2cf] text-[#d93025] font-semibold">
                Scene 31: INT. HOSPITAL — CRITICAL BREAK (Page 8)
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/conflicts')}
            className="gc-btn-primary w-full justify-center py-2.5 cursor-pointer"
          >
            Review Conflict in Action Planner
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
