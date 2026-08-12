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
  Filter,
} from 'lucide-react';
import { getConflicts, approveConflict } from '../services/api';

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
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
        text: `Action executed: ${actionType} logged for Conflict ID ${conflictId.slice(0, 8)}... Audit record committed to ClickHouse Cloud.`,
      });
      fetchConflicts();
    } catch (err) {
      setActionMessage({ type: 'error', text: `Action execution failed: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Incident Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-2xl font-normal text-[#202124] tracking-tight">
            Continuity Conflicts
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Detected state inconsistencies across production evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5f6368] font-mono">ClickHouse Memory:</span>
          <span className="gc-chip-blue font-mono">continuity_conflicts</span>
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5f6368] uppercase mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'RESOLVED'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterSeverity === sev
                ? 'bg-[#1a73e8] text-white'
                : 'bg-[#f8f9fa] text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-md border flex items-center justify-between text-xs ${
            actionMessage.type === 'success'
              ? 'bg-[#e6f4ea] border-[#ceead6] text-[#188038]'
              : 'bg-[#fce8e6] border-[#fad2cf] text-[#d93025]'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <FileCheck className="w-4 h-4" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conflicts List */}
      <div className="space-y-6">
        {conflicts.length === 0 && !loading ? (
          <div className="gc-card p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#188038] mx-auto" />
            <h3 className="text-base font-semibold text-[#202124]">No Open Continuity Conflicts</h3>
            <p className="text-xs text-[#5f6368]">
              All analyzed production evidence is currently consistent.
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
                className="gc-card p-6 border-[#fad2cf] space-y-6"
              >
                {/* Conflict Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="gc-chip-red uppercase tracking-wider">
                      {conf.severity || 'HIGH'} SEVERITY
                    </span>
                    <span className="text-xs font-bold text-[#202124]">
                      Scene {conf.scene_id} · Take {conf.take_id || '03'}
                    </span>
                    <span className="text-xs font-mono text-[#5f6368]">
                      ID: {conf.conflict_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-[#5f6368] font-mono">
                    Status: <strong className="text-[#b06000] font-semibold">{conf.status}</strong>
                  </span>
                </div>

                {/* Side-by-Side Comparison Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                    Evidence Provenance Comparison
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {/* Expected Card */}
                    <div className="p-4 rounded-md bg-[#e6f4ea]/40 border border-[#ceead6] space-y-2">
                      <div className="flex justify-between text-[10px] font-semibold text-[#188038] uppercase">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> EXPECTED</span>
                        <span>Scene 17 Screenplay Baseline</span>
                      </div>
                      <div className="text-base font-extrabold text-[#188038]">
                        {conf.attribute_name} = {conf.expected_value}
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">
                        Established in <strong>Scene 17 Screenplay</strong> (Page 4, Line 12).
                      </div>
                      <div className="text-[10px] text-[#188038] font-semibold pt-1 border-t border-[#ceead6]">
                        98% Confidence · Baseline Fact
                      </div>
                    </div>

                    {/* Observed Card */}
                    <div className="p-4 rounded-md bg-[#fce8e6]/40 border border-[#fad2cf] space-y-2">
                      <div className="flex justify-between text-[10px] font-semibold text-[#d93025] uppercase">
                        <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> OBSERVED</span>
                        <span>Scene 25 / Take 3</span>
                      </div>
                      <div className="text-base font-extrabold text-[#d93025]">
                        {conf.attribute_name} = {conf.observed_value}
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">
                        Extracted at timestamp <strong>00:12.8</strong> via Gemini 2.0 Vision.
                      </div>
                      <div className="text-[10px] text-[#d93025] font-semibold pt-1 border-t border-[#fad2cf]">
                        {(conf.confidence * 100).toFixed(0)}% Confidence · Visual Bounding Box
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blast Radius Section */}
                <div className="p-4 rounded-md bg-[#fef7e0]/60 border border-[#feefc3] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#b06000] uppercase">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Downstream Impact (Scenes Depended on State)
                    </span>
                    <span className="gc-chip-amber">ClickHouse Graph Engine</span>
                  </div>

                  <p className="text-xs text-[#202124] font-sans">
                    If Take 3 is approved with <code className="text-[#d93025] font-bold">{conf.observed_value}</code>, <strong className="text-[#202124]">{affectedScenes.length} future scenes</strong> will break:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded bg-white border border-[#feefc3] space-y-1">
                      <div className="flex justify-between text-[#b06000] font-semibold">
                        <span>SCENE 26</span>
                        <span className="gc-chip-amber">AFFECTED</span>
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">INT. POLICE CAR — Dialogue assumes left_arm bandage.</div>
                    </div>

                    <div className="p-3 rounded bg-white border border-[#feefc3] space-y-1">
                      <div className="flex justify-between text-[#b06000] font-semibold">
                        <span>SCENE 28</span>
                        <span className="gc-chip-amber">AFFECTED</span>
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">EXT. ALLEYWAY — Fight choreography restriction.</div>
                    </div>

                    <div className="p-3 rounded bg-white border border-[#fad2cf] space-y-1">
                      <div className="flex justify-between text-[#d93025] font-semibold">
                        <span>SCENE 31</span>
                        <span className="gc-chip-red">CRITICAL BREAK</span>
                      </div>
                      <div className="text-[11px] text-[#5f6368] font-sans">INT. HOSPITAL — Doctor examines cast on left_arm.</div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation & Action Planner */}
                <div className="space-y-4 pt-2 border-t border-[#dadce0]">
                  <h4 className="text-xs font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#1a73e8]" />
                    Recommended Actions
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div
                      onClick={() => setSelectedAction('OPTION_A')}
                      className={`p-4 rounded-md border cursor-pointer transition ${
                        selectedAction === 'OPTION_A'
                          ? 'bg-[#e6f4ea] border-[#188038]'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#188038]">OPTION A: RESHOOT TAKE 3</span>
                        <span className="gc-chip-green">RECOMMENDED</span>
                      </div>
                      <div className="text-lg font-bold text-[#202124] font-mono">$1,500</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Immediate reshoot on set today. Zero downstream script modification.
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAction('OPTION_B')}
                      className={`p-4 rounded-md border cursor-pointer transition ${
                        selectedAction === 'OPTION_B'
                          ? 'bg-[#fef7e0] border-[#b06000]'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#b06000]">OPTION B: ACCEPT EXCEPTION</span>
                        <span className="gc-chip-amber">SCRIPT MOD</span>
                      </div>
                      <div className="text-lg font-bold text-[#b06000] font-mono">$0 Today</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Accept Take 3. Requires modifying screenplay state for Scenes 26, 28, 31.
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedAction('OPTION_C')}
                      className={`p-4 rounded-md border cursor-pointer transition ${
                        selectedAction === 'OPTION_C'
                          ? 'bg-[#fce8e6] border-[#d93025]'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#d93025]">OPTION C: DIGITAL VFX PATCH</span>
                        <span className="gc-chip-red">HIGH COST</span>
                      </div>
                      <div className="text-lg font-bold text-[#d93025] font-mono">$45,000</div>
                      <p className="text-xs text-[#5f6368] font-sans mt-1">
                        Paint out bandage digitally in post-production. Adds 3 weeks to release schedule.
                      </p>
                    </div>
                  </div>

                  {/* Director Notes & Actions */}
                  <div className="p-4 rounded-md bg-[#f8f9fa] border border-[#dadce0] space-y-3 font-sans">
                    <label className="block text-xs font-semibold text-[#5f6368] uppercase">
                      Director Governance Notes (Audit Logged):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Approved reshoot while actor and lighting rig are still in Int. Interrogation Room set."
                      value={directorNotes}
                      onChange={(e) => setDirectorNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white border border-[#dadce0] text-xs text-[#202124] outline-none focus:border-[#1a73e8]"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-[#5f6368] font-mono">
                        Selected Action: <strong className="text-[#1a73e8]">{selectedAction}</strong>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleActionExecution(conf.conflict_id, 'REJECT')}
                          className="gc-btn-danger cursor-pointer"
                        >
                          Reject Conflict
                        </button>
                        <button
                          onClick={() => handleActionExecution(conf.conflict_id, selectedAction === 'OPTION_A' ? 'APPROVE_RESHOOT' : selectedAction === 'OPTION_B' ? 'ACCEPT_EXCEPTION' : 'DIGITAL_VFX_PATCH')}
                          className="gc-btn-primary cursor-pointer"
                        >
                          Approve Action & Log in ClickHouse
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
