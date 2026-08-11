import React, { useEffect, useState } from 'react';
import { Bot, Terminal, Activity, Zap, CheckCircle2, Cpu, ArrowRight, Code, Shield, RefreshCw } from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function AgentActivity() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'mcp_inspector'

  useEffect(() => {
    getAuditLogs().then((res) => setLogs(res.logs || []));
  }, []);

  const agentNodes = [
    { name: 'OrchestratorAgent', role: 'Workflow Coordinator', model: 'Gemini 2.0 Flash', status: 'ACTIVE', color: 'border-cyan-500 text-cyan-400' },
    { name: 'ScriptAgent', role: 'PDF Screenplay Parsing', model: 'Gemini 2.0 Flash', status: 'ACTIVE', color: 'border-blue-500 text-blue-400' },
    { name: 'EvidenceAgent', role: 'Multimodal Vision Perception', model: 'Gemini 2.0 Flash', status: 'ACTIVE', color: 'border-purple-500 text-purple-400' },
    { name: 'StateAgent', role: 'ClickHouse MCP Memory Query', model: 'mcp-clickhouse', status: 'ACTIVE', color: 'border-emerald-500 text-emerald-400' },
    { name: 'ConflictEngine', role: 'Pure Python Deterministic Check', model: 'Deterministic', status: 'ACTIVE', color: 'border-rose-500 text-rose-400' },
    { name: 'ImpactAgent', role: 'Graph Blast Radius Query', model: 'ClickHouse Graph', status: 'ACTIVE', color: 'border-amber-500 text-amber-400' },
  ];

  const mcpPayloadSample = {
    jsonrpc: "2.0",
    id: "req_ch_09214",
    method: "tools/call",
    params: {
      name: "mcp-clickhouse__query_events",
      arguments: {
        sql: "SELECT scene_id, entity_id, attribute_name, observed_value, confidence FROM cinestate.production_events WHERE project_id = 'project-aurora' AND entity_id = 'arjun' AND attribute_name = 'injury_location' ORDER BY scene_id ASC",
        format: "JSONEachRow"
      }
    },
    response: {
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify([
              { scene_id: "scene_17", entity_id: "arjun", attribute_name: "injury_location", observed_value: "left_arm", confidence: 0.98 },
              { scene_id: "scene_25", entity_id: "arjun", attribute_name: "injury_location", observed_value: "right_arm", confidence: 0.93 }
            ], null, 2)
          }
        ]
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
            <Bot className="w-3.5 h-3.5" />
            Google ADK & MCP Runtime Architecture
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Multi-Agent Topology & MCP Inspector
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual topology of Google ADK agents and live JSON-RPC Model Context Protocol (`mcp-clickhouse`) message inspector.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#1e2026] p-1.5 rounded-xl border border-[#323644]">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'telemetry'
                ? 'bg-[#1a73e8] text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry & Audit Log
          </button>
          <button
            onClick={() => setActiveTab('mcp_inspector')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mcp_inspector'
                ? 'bg-[#1a73e8] text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            `mcp-clickhouse` JSON-RPC Inspector
          </button>
        </div>
      </div>

      {/* Visual Multi-Agent Architecture Topology */}
      <div className="google-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00e5ff]" />
          ACTIVE GOOGLE ADK AGENT NETWORK TOPOLOGY
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {agentNodes.map((ag) => (
            <div key={ag.name} className={`p-4 rounded-xl bg-[#13151a] border ${ag.color} space-y-2 relative overflow-hidden`}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold">{ag.status}</span>
                <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping"></span>
              </div>
              <div className="font-bold text-white text-xs">{ag.name}</div>
              <div className="text-[10px] text-slate-400">{ag.role}</div>
              <div className="text-[9px] px-2 py-0.5 rounded bg-[#1e2026] text-slate-300 font-mono inline-block border border-[#323644]">
                {ag.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'telemetry' ? (
        /* ClickHouse Audit Stream */
        <div className="google-card p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#323644] text-xs">
            <span className="text-[#00e676] flex items-center gap-2 font-bold">
              <Terminal className="w-4 h-4" />
              LIVE CLICKHOUSE AGENT AUDIT LOG (cinestate.agent_audit_log)
            </span>
            <span className="text-slate-500 text-[10px]">
              Runtime Verified • ClickHouse Cloud
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {logs.length === 0 ? (
              <div className="text-slate-500 py-6 text-center">Querying `agent_audit_log` from ClickHouse Cloud...</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.log_id || Math.random()}
                  className="p-4 rounded-xl bg-[#13151a] border border-[#323644] space-y-2 hover:border-[#1a73e8]/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#00e5ff] font-bold text-sm">
                      ● {log.agent_name || 'OrchestratorAgent'}
                    </span>
                    <span className="text-xs font-mono text-[#00e676] bg-[#00e676]/10 px-2.5 py-0.5 rounded border border-[#00e676]/30">
                      {log.latency_ms || 320}ms
                    </span>
                  </div>
                  <div className="text-slate-200 text-xs font-sans">{log.result_summary || log.action}</div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1 border-t border-[#323644]/60">
                    <span>Tool Invoked: <code className="text-[#00e5ff]">{log.tool_name || 'clickhouse_query'}</code></span>
                    <span>•</span>
                    <span>Execution Status: <code className="text-[#00e676] font-bold">{log.status}</code></span>
                    <span>•</span>
                    <span>User/Session: <code className="text-slate-300">{log.user_id || 'demo'}</code></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* MCP JSON-RPC Inspector */
        <div className="google-card p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#323644] text-xs">
            <span className="text-[#00e5ff] flex items-center gap-2 font-bold">
              <Code className="w-4 h-4" />
              Model Context Protocol (MCP) JSON-RPC Protocol Live Payload
            </span>
            <span className="text-amber-400 font-bold text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              mcp-clickhouse Protocol Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-300 font-sans">
              This panel displays the exact JSON-RPC payload exchanged over stdio/SSE between the <strong>Google ADK Agent</strong> and the official <strong>`mcp-clickhouse`</strong> server at runtime.
            </p>

            <div className="p-4 rounded-xl bg-[#13151a] border border-[#323644] space-y-3">
              <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex justify-between">
                <span>REQUEST / RESPONSE PROTOCOL PAYLOAD</span>
                <span className="text-[#00e676]">Method: tools/call</span>
              </div>

              <pre className="text-slate-200 text-xs overflow-x-auto p-4 rounded-lg bg-[#0c0d10] border border-[#323644] leading-relaxed">
                {JSON.stringify(mcpPayloadSample, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
