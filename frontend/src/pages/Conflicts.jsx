import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
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
} from 'lucide-react';
import { getConflicts, approveConflict } from '../services/api';

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [notes, setNotes] = useState('');

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

  const handleAction = async (conflictId, action) => {
    try {
      await approveConflict(conflictId, 'Director', action);
      setActionMessage({
        type: 'success',
        text: `Conflict resolution executed: ${action}D for conflict ID ${conflictId.slice(0, 8)}... Recorded to ClickHouse Cloud audit log.`,
      });
      fetchConflicts();
    } catch (err) {
      setActionMessage({ type: 'error', text: `Action failed: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#c5221f] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            Human-in-the-Loop Studio Governance
          </div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
            Continuity Conflict Center
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Review automatically detected film state conflicts. Approvals or rejections are written as immutable audit events into ClickHouse Cloud.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#202124] bg-white px-3.5 py-2 rounded-xl border border-[#dadce0] shadow-xs">
            <Database className="w-4 h-4 text-[#1a73e8]" />
            <span>ClickHouse Table: <code className="text-[#1a73e8] font-bold">continuity_conflicts</code></span>
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
                      ID: {conf.conflict_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-[#5f6368] font-mono">
                    Status: <strong className="text-[#b06000] font-bold">{conf.status}</strong>
                  </span>
                </div>

                {/* Main Side-by-Side Comparison Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expected State */}
                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
                    <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider flex items-center justify-between">
                      <span>EXPECTED STATE (SCRIPT FACT)</span>
                      <span className="text-[#137333] font-mono">ClickHouse Verified</span>
                    </div>
                    <div className="text-base font-extrabold text-[#137333] font-mono">
                      {conf.attribute_name} = {conf.expected_value}
                    </div>
                    <p className="text-xs text-[#5f6368]">
                      Established in Scene 17 (Script parsing & Scene 17 Take 1).
                    </p>
                  </div>

                  {/* Observed State */}
                  <div className="p-4 rounded-xl bg-[#fce8e6]/40 border border-[#fad2cf] space-y-2">
                    <div className="text-[10px] font-bold text-[#c5221f] uppercase tracking-wider flex items-center justify-between">
                      <span>OBSERVED FOOTAGE (TAKE 3)</span>
                      <span className="text-[#c5221f] font-mono">Gemini Multimodal Vision ({(conf.confidence * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="text-base font-extrabold text-[#c5221f] font-mono">
                      {conf.attribute_name} = {conf.observed_value}
                    </div>
                    <p className="text-xs text-[#202124]">
                      Extracted from video frame at 00:12.8 in Scene 25 Take 3.
                    </p>
                  </div>
                </div>

                {/* Financial ROI & Blast Radius Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Blast Radius Box */}
                  <div className="p-4 rounded-xl bg-[#fef7e0]/60 border border-[#feefc3] space-y-2">
                    <div className="text-xs font-bold text-[#b06000] uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      BLAST RADIUS (AFFECTED DOWNSTREAM SCENES)
                    </div>
                    <p className="text-xs text-[#202124]">
                      If unaddressed, <strong className="text-[#202124] font-bold">{affectedScenes.length} future scenes</strong> will suffer continuity breakage:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {affectedScenes.map((sc) => (
                        <span
                          key={sc}
                          className="px-3 py-1 rounded-lg bg-[#fef7e0] text-[#b06000] font-mono text-xs border border-[#feefc3] font-bold"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cost Calculator Box */}
                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2 font-mono text-xs">
                    <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider flex items-center justify-between">
                      <span>FINANCIAL IMPACT CALCULATOR</span>
                      <DollarSign className="w-4 h-4 text-[#137333]" />
                    </div>
                    <div className="flex justify-between items-center text-[#137333]">
                      <span>Immediate Reshoot Today:</span>
                      <span className="font-bold text-sm">$1,500</span>
                    </div>
                    <div className="flex justify-between items-center text-[#c5221f]">
                      <span>Post-Prod VFX Fix:</span>
                      <span className="font-bold text-sm">$45,000</span>
                    </div>
                    <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0]">
                      <strong>Savings:</strong> $43,500 + 3-week schedule protection
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-1">
                  <div className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI AGENT RECOMMENDATION (Gemini 2.0 Flash)
                  </div>
                  <p className="text-xs text-[#202124] leading-relaxed font-sans font-medium">
                    {conf.recommendation || 'Reshoot Scene 25 Take 3 immediately while actor and crew are still on set.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#dadce0]">
                  <div className="text-xs text-[#5f6368] flex items-center gap-1.5 font-sans">
                    <Info className="w-3.5 h-3.5 text-[#1a73e8]" />
                    Human approval required before reshoot order is issued.
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleAction(conf.conflict_id, 'REJECT')}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-white hover:bg-[#f8f9fa] text-[#5f6368] font-bold text-xs border border-[#dadce0] flex items-center justify-center gap-1.5 transition"
                    >
                      <X className="w-4 h-4 text-[#5f6368]" />
                      Reject Conflict
                    </button>
                    <button
                      onClick={() => handleAction(conf.conflict_id, 'APPROVE')}
                      className="google-btn-blue flex-1 sm:flex-none px-6 py-2.5 text-xs tracking-wide flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Approve Reshoot Action
                    </button>
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
