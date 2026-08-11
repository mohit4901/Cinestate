import React from 'react';
import { Settings as SettingsIcon, Shield, Server } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          System Configuration
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          CINESTATE Settings & Integrations
        </h1>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Runtime Environment & Database Settings
        </h3>

        <div className="space-y-3">
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between">
            <span className="text-slate-400">ClickHouse Host:</span>
            <span className="text-white">zov6c09ywm.asia-northeast1.gcp.clickhouse.cloud</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between">
            <span className="text-slate-400">ClickHouse MCP Server:</span>
            <span className="text-emerald-400">mcp-clickhouse (Python 3.11)</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Google Cloud AI:</span>
            <span className="text-cyan-400">google-genai / google-adk (Gemini 2.0 Flash)</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Primary Database:</span>
            <span className="text-emerald-400">ClickHouse Cloud (ZERO MongoDB)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
