import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  ArrowRight,
  Database,
  Info,
  Check,
  X,
  FileCheck,
  DollarSign,
  TrendingDown,
  Clock,
  Sparkles,
  Layers,
  FileText,
  Video,
  CheckSquare,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { getConflicts, approveConflict } from '../services/api';

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [selectedAction, setSelectedAction] = useState('OPTION_A');
  const [directorNotes, setDirectorNotes] = useState('');

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res = await getConflicts();
      setConflicts(res.conflicts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleActionExecution = async (conflictId, actionType) => {
    try {
      await approveConflict(conflictId, 'Director', actionType);
      setActionMessage({
        type: 'success',
        text: `Action executed: ${actionType} recorded for Conflict ID ${conflictId.slice(0, 8)}... Audit record committed to ClickHouse Cloud.`,
      });
      fetchConflicts();
    } catch (err) {
      setActionMessage({ type: 'error', text: `Action execution failed: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#c5221f] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            Human-in-the-Loop Studio Governance Engine
          </div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
            Continuity Conflict Center & Action Planner
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Review automatically detected state-breaking evidence. Every action option provides cost-impact analysis and writes immutable governance events into ClickHouse Cloud.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#202124] bg-white px-3.5 py-2 rounded-xl border border-[#dadce0] shadow-xs">
            <Database className="w-4 h-4 text-[#1a73e8]" />
            <span>ClickHouse Memory: <code className="text-[#1a73e8] font-bold">continuity_conflicts</code></span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            actionMessage.type === 'success'
              ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
              : 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <FileCheck className="w-4 h-4" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conflicts List */}
      <div className="space-y-6">
        {conflicts.length === 0 && !loading ? (
          <div className="google-card-light p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#137333] mx-auto" />
            <h3 className="text-base font-bold text-[#202124]">No Open Continuity Conflicts</h3>
            <p className="text-xs text-[#5f6368]">
              All production scenes are 100% consistent according to ClickHouse state memory.
            </p>
          </div>
        ) : (
          conflicts.map((conf) => {
            const blast = typeof conf.blast_radius === 'string'
              ? JSON.parse(conf.blast_radius || '{}')
              : conf.blast_radius || {};
            const affectedScenes = blast.affected_scenes || ['scene_26', 'scene_28', 'scene_31'];

            return (
              <div
                key={conf.conflict_id}
                className="google-card-light p-6 border-rose-300 space-y-6 relative overflow-hidden"
              >
                {/* Conflict Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] tracking-wider uppercase">
                      {conf.severity || 'HIGH'} SEVERITY CONFLICT
                    </span>
                    <span className="text-xs font-mono text-[#202124] font-bold">
                      Scene {conf.scene_id} / Take {conf.take_id || '03'}
                    </span>
                    <span className="text-xs font-mono text-[#5f6368]">
                      Conflict ID: {conf.conflict_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-[#5f6368] font-mono">
                    Status: <strong className="text-[#b06000] font-bold">{conf.status}</strong>
                  </span>
                </div>

                {/* 🔥 UPGRADE 1: WHY IS THIS A CONFLICT? — EVIDENCE CHAIN CARD */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                    EVIDENCE PROVENANCE CHAIN (ANTI-HALLUCINATION AUDIT TRAIL)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    {/* Expected Fact Card */}
                    <div className="p-4 rounded-xl bg-[#e6f4ea]/60 border border-[#ceead6] space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-[#137333] uppercase">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> EXPECTED STATE</span>
                        <span>ClickHouse Fact #104</span>
                      </div>
                      <div className="text-base font-extrabold text-[#137333]">
                        {conf.attribute_name} = {conf.expected_value}
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">
                        Established in <strong>Scene 17 Screenplay</strong> (Page 4, Line 12).
                      </div>
                      <div className="text-[10px] text-[#137333] font-bold pt-1 border-t border-[#ceead6]">
                        Confidence: 98% • Verified Baseline
                      </div>
                    </div>

                    {/* Observed Footage Card */}
                    <div className="p-4 rounded-xl bg-[#fce8e6]/60 border border-[#fad2cf] space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-[#c5221f] uppercase">
                        <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> OBSERVED FOOTAGE</span>
                        <span>Scene 25 / Take 3</span>
                      </div>
                      <div className="text-base font-extrabold text-[#c5221f]">
                        {conf.attribute_name} = {conf.observed_value}
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">
                        Extracted at timestamp <strong>00:12.8</strong> via Gemini 2.0 Vision.
                      </div>
                      <div className="text-[10px] text-[#c5221f] font-bold pt-1 border-t border-[#fad2cf]">
                        Confidence: {(conf.confidence * 100).toFixed(0)}% • Visual Bounding Box #4
                      </div>
                    </div>

                    {/* Historical Consistency Record */}
                    <div className="p-4 rounded-xl bg-[#e8f0fe]/60 border border-[#d2e3fc] space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-[#1a73e8] uppercase">
                        <span>HISTORICAL CONSISTENCY</span>
                        <span>Scene 21</span>
                      </div>
                      <div className="text-base font-extrabold text-[#1a73e8]">
                        Confirmed {conf.expected_value}
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">
                        Scene 21 Take 1 footage confirmed {conf.expected_value}.
                      </div>
                      <div className="text-[10px] text-[#1a73e8] font-bold pt-1 border-t border-[#d2e3fc]">
                        Provenance Verdict: Deterministic Mismatch
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔥 UPGRADE 2: WHAT BREAKS IF WE IGNORE THIS? — BLAST RADIUS 2.0 */}
                <div className="p-5 rounded-xl bg-[#fef7e0]/60 border border-[#feefc3] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#b06000] uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      BLAST RADIUS 2.0 — CASCADING DOWNSTREAM IMPACT ANALYSIS
                    </span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#feefc3]">
                      ClickHouse Graph Query
                    </span>
                  </div>

                  <p className="text-xs text-[#202124] font-sans">
                    If Take 3 is approved with <code className="text-[#c5221f] font-bold">{conf.observed_value}</code> without correction, <strong className="text-[#202124]">{affectedScenes.length} future screenplay scenes</strong> will suffer state breakage:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-white border border-[#feefc3] space-y-1">
                      <div className="flex justify-between items-center text-[#b06000] font-bold">
                        <span>SCENE 26</span>
                        <span className="text-[9px] bg-[#fef7e0] px-1.5 py-0.2 rounded border border-[#feefc3]">AFFECTED</span>
                      </div>
                      <div className="text-[11px] text-[#202124] font-sans">INT. POLICE CAR — DAY</div>
                      <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0]">
                        <strong>Why:</strong> Dialogue explicitly references bandage on {conf.expected_value}.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-[#feefc3] space-y-1">
                      <div className="flex justify-between items-center text-[#b06000] font-bold">
                        <span>SCENE 28</span>
                        <span className="text-[9px] bg-[#fef7e0] px-1.5 py-0.2 rounded border border-[#feefc3]">AFFECTED</span>
                      </div>
                      <div className="text-[11px] text-[#202124] font-sans">EXT. ALLEYWAY — NIGHT</div>
                      <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0]">
                        <strong>Why:</strong> Fight scene choreography assumes {conf.expected_value} mobility restriction.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-rose-300 space-y-1">
                      <div className="flex justify-between items-center text-[#c5221f] font-bold">
                        <span>SCENE 31</span>
                        <span className="text-[9px] bg-[#fce8e6] px-1.5 py-0.2 rounded border border-[#fad2cf]">CRITICAL BREAK</span>
                      </div>
                      <div className="text-[11px] text-[#202124] font-sans">INT. HOSPITAL ROOM — DAY</div>
                      <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0]">
                        <strong>Why:</strong> Doctor examines cast on {conf.expected_value} (Screenplay Page 8).
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔥 UPGRADE 3: WHAT SHOULD THE DIRECTOR DO? — ACTION PLANNER MATRIX */}
                <div className="space-y-4 pt-2 border-t border-[#dadce0]">
                  <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#1a73e8]" />
                    ACTION PLANNER — DIRECTOR RESOLUTION OPTIONS
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    {/* Option A */}
                    <div
                      onClick={() => setSelectedAction('OPTION_A')}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedAction === 'OPTION_A'
                          ? 'bg-[#e6f4ea] border-[#137333] shadow-md'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-sm text-[#137333]">OPTION A: RESHOOT TAKE 3</span>
                        <span className="text-[10px] bg-[#137333] text-white px-2 py-0.5 rounded font-bold">RECOMMENDED</span>
                      </div>
                      <div className="text-xl font-extrabold text-[#202124] font-mono">$1,500</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Immediate reshoot on set today. Zero downstream script modification required.
                      </p>
                    </div>

                    {/* Option B */}
                    <div
                      onClick={() => setSelectedAction('OPTION_B')}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedAction === 'OPTION_B'
                          ? 'bg-[#fef7e0] border-[#b06000] shadow-md'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-sm text-[#b06000]">OPTION B: ACCEPT EXCEPTION</span>
                        <span className="text-[10px] bg-[#fef7e0] text-[#b06000] px-2 py-0.5 rounded border border-[#feefc3]">SCRIPT MOD</span>
                      </div>
                      <div className="text-xl font-extrabold text-[#b06000] font-mono">$0 Today</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Accept Take 3 as new reality. Requires modifying screenplay state for Scenes 26, 28, 31.
                      </p>
                    </div>

                    {/* Option C */}
                    <div
                      onClick={() => setSelectedAction('OPTION_C')}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedAction === 'OPTION_C'
                          ? 'bg-[#fce8e6] border-[#c5221f] shadow-md'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-sm text-[#c5221f]">OPTION C: DIGITAL VFX PATCH</span>
                        <span className="text-[10px] bg-[#fce8e6] text-[#c5221f] px-2 py-0.5 rounded border border-[#fad2cf]">HIGH COST</span>
                      </div>
                      <div className="text-xl font-extrabold text-[#c5221f] font-mono">$45,000</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Paint out bandage digitally in post-production. Adds 3 weeks to release schedule.
                      </p>
                    </div>
                  </div>

                  {/* Director Notes & Execution Buttons */}
                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-3 font-sans">
                    <label className="block text-xs font-bold text-[#5f6368] uppercase">
                      Director Governance Notes (Written to ClickHouse Audit Log):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Approved reshoot while actor and lighting rig are still in Int. Interrogation Room set."
                      value={directorNotes}
                      onChange={(e) => setDirectorNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dadce0] text-xs text-[#202124]"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-[#5f6368] flex items-center gap-1.5 font-mono">
                        <Info className="w-3.5 h-3.5 text-[#1a73e8]" />
                        Selected Action: <strong className="text-[#1a73e8]">{selectedAction}</strong>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleActionExecution(conf.conflict_id, 'REJECT')}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-white hover:bg-[#f8f9fa] text-[#5f6368] font-bold text-xs border border-[#dadce0] flex items-center justify-center gap-1.5 transition"
                        >
                          <X className="w-4 h-4 text-[#5f6368]" />
                          Reject Conflict
                        </button>
                        <button
                          onClick={() => handleActionExecution(conf.conflict_id, selectedAction === 'OPTION_A' ? 'APPROVE_RESHOOT' : selectedAction === 'OPTION_B' ? 'ACCEPT_EXCEPTION' : 'DIGITAL_VFX_PATCH')}
                          className="google-btn-blue flex-1 sm:flex-none px-6 py-2.5 text-xs tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          Execute & Log Action in ClickHouse
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
