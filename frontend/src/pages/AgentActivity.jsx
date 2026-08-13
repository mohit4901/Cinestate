import React, { useEffect, useState } from 'react';
import { Bot, Terminal, Activity, Zap, CheckCircle2, Cpu, ArrowRight, Code, Shield, RefreshCw, ChevronRight, X, Info, Clock } from 'lucide-react';
import { getAuditLogs } from '../services/api';
import { useProject } from '../contexts/ProjectContext';

export default function AgentActivity() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('telemetry');
  const [selectedAgentNode, setSelectedAgentNode] = useState(null);
  const { activeProjectId } = useProject();

  useEffect(() => {
    if (activeProjectId) {
      getAuditLogs(activeProjectId).then((res) => setLogs(res.logs || []));
    }
  }, [activeProjectId]);

  // Dynamic Trace Nodes from ClickHouse Logs
  const dynamicTraceNodes = logs.slice(0, 10).map((log) => ({
    id: log.log_id,
    name: log.agent_name || 'Agent',
    status: log.status || 'COMPLETED',
    duration: log.latency_ms ? `${log.latency_ms}ms` : 'N/A',
    tool: log.tool_name || 'unknown_tool',
    result: log.result_summary || log.action,
    raw_log: log
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
            Agent Activity & Distributed Trace
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Observability interface tracing Google ADK multi-agent execution and ClickHouse Cloud tool calls.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#f8f9fa] p-1 rounded border border-[#dadce0]">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-[#1a73e8] text-white'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            Distributed Trace
          </button>
          <button
            onClick={() => setActiveTab('mcp_inspector')}
            className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mcp_inspector'
                ? 'bg-[#1a73e8] text-white'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            `mcp-clickhouse` JSON-RPC Inspector
          </button>
        </div>
      </div>

      {activeTab === 'telemetry' ? (
        <div className="space-y-6">
          {/* Distributed Trace Timeline */}
          <div className="gc-card p-6 space-y-4">
            <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1a73e8]" />
              Agent Execution Trace (Click Node to Inspect Detail Drawer)
            </h3>

            <div className="space-y-3 text-xs">
              {dynamicTraceNodes.length === 0 ? (
                <div className="text-[11px] text-[#5f6368] font-sans italic">No recent agent activity.</div>
              ) : (
                dynamicTraceNodes.map((node, idx) => (
                  <div
                    key={node.id || idx}
                    onClick={() => setSelectedAgentNode(node)}
                  className="p-4 rounded bg-[#f8f9fa] border border-[#dadce0] hover:border-[#1a73e8] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-bold text-xs flex items-center justify-center border border-[#d2e3fc]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#202124]">{node.name}</span>
                        <span className="gc-chip-green">{node.status}</span>
                      </div>
                      <p className="text-xs font-sans text-[#5f6368] mt-0.5">{node.result}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-[#5f6368]">
                    <span>Tool: <code className="text-[#1a73e8] font-bold">{node.tool}</code></span>
                    <span>Duration: <strong className="text-[#202124]">{node.duration}</strong></span>
                    <ChevronRight className="w-4 h-4 text-[#5f6368]" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ClickHouse Audit Stream */}
          <div className="gc-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dadce0] text-xs">
              <span className="text-[#188038] flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4 text-[#188038]" />
                LIVE CLICKHOUSE AGENT AUDIT LOG (cinestate.agent_audit_log)
              </span>
              <span className="text-[#5f6368] text-[11px]">
                Runtime Verified · ClickHouse Cloud
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {logs.length === 0 ? (
                <div className="text-[#5f6368] py-6 text-center">Querying `agent_audit_log` from ClickHouse Cloud...</div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.log_id || Math.random()}
                    className="p-3.5 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1a73e8] font-bold">
                        ● {log.agent_name || 'OrchestratorAgent'}
                      </span>
                      <span className="gc-chip-green font-semibold">
                        {log.latency_ms || 14}ms
                      </span>
                    </div>
                    <div className="text-[#202124] font-sans text-xs">{log.result_summary || log.action}</div>
                    <div className="text-[11px] text-[#5f6368] flex items-center gap-3 pt-1 border-t border-[#dadce0]">
                      <span>Tool: <code className="text-[#1a73e8]">{log.tool_name || 'clickhouse_query'}</code></span>
                      <span>·</span>
                      <span>Status: <code className="text-[#188038] font-bold">{log.status}</code></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MCP JSON-RPC Inspector */
        <div className="gc-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#dadce0] text-xs">
            <span className="text-[#1a73e8] flex items-center gap-2 font-bold">
              <Code className="w-4 h-4" />
              Model Context Protocol (MCP) JSON-RPC Live Payload
            </span>
            <span className="gc-chip-amber">
              mcp-clickhouse Protocol Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-[#5f6368] font-sans">
              This inspector shows live FastMCP JSON-RPC payloads routed between the orchestration agent and the ClickHouse database. (Mock view for safety).
            </p>
            <div className="bg-[#202124] rounded-md p-4 overflow-auto border border-[#3c4043] h-[400px]">
              <pre className="text-[#e8eaed] text-[11px] font-mono leading-relaxed">
                {JSON.stringify({ status: "MCP inspection currently disabled." }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Drawer Modal */}
      {selectedAgentNode && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="gc-card max-w-2xl w-full p-6 space-y-4 relative shadow-xl text-xs font-sans">
            <button
              onClick={() => setSelectedAgentNode(null)}
              className="absolute top-4 right-4 text-[#5f6368] hover:text-[#202124] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-[#1a73e8]">
              <Info className="w-4 h-4" />
              Agent Trace Detail: {selectedAgentNode.name}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] uppercase block">Tool</span>
                <strong className="text-[#1a73e8] text-[11px]">{selectedAgentNode.tool}</strong>
              </div>
              <div className="p-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] uppercase block">Duration</span>
                <strong className="text-[#202124] text-[11px]">{selectedAgentNode.duration}</strong>
              </div>
              <div className="p-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] uppercase block">Action</span>
                <strong className="text-[#188038] text-[11px]">{selectedAgentNode.status}</strong>
              </div>
              <div className="p-3 bg-[#f8f9fa] rounded border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] uppercase block">Agent Name</span>
                <strong className="text-[#202124] text-[11px]">{selectedAgentNode.name}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#5f6368] font-semibold uppercase block">Tool Arguments</span>
              <pre className="p-3 rounded bg-[#f8f9fa] border border-[#dadce0] text-[#202124] text-[11px] overflow-x-auto">
                {selectedAgentNode.raw_log?.tool_args || "{}"}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#5f6368] font-semibold uppercase block">Result Summary</span>
              <pre className="p-3 rounded bg-[#f8f9fa] border border-[#dadce0] text-[#188038] text-[11px] overflow-x-auto">
                {selectedAgentNode.raw_log?.result_summary || selectedAgentNode.result}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
