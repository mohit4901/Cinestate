import React from 'react';
import { Settings as SettingsIcon, Shield, Server, CheckCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          System Configuration & Telemetry
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          CINESTATE Settings & Integrations
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Production environment variables, partner track status, and active Google Cloud AI model diagnostics.
        </p>
      </div>

      <div className="google-card-light p-6 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-[#202124] uppercase flex items-center gap-2">
          <Server className="w-4 h-4 text-[#1a73e8]" />
          Runtime Environment & Database Health
        </h3>

        <div className="space-y-3 font-mono">
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
            <span className="text-[#5f6368]">ClickHouse Cloud Host:</span>
            <span className="text-[#202124] font-bold">zov6c09ywm.asia-northeast1.gcp.clickhouse.cloud</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
            <span className="text-[#5f6368]">ClickHouse MCP Server:</span>
            <span className="text-[#137333] font-bold bg-[#e6f4ea] px-2.5 py-0.5 rounded border border-[#ceead6]">mcp-clickhouse (Python 3.11)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
            <span className="text-[#5f6368]">Google Cloud AI Stack:</span>
            <span className="text-[#1a73e8] font-bold bg-[#e8f0fe] px-2.5 py-0.5 rounded border border-[#d2e3fc]">google-genai / google-adk (Gemini 2.0 Flash)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
            <span className="text-[#5f6368]">Primary Database:</span>
            <span className="text-[#137333] font-bold bg-[#e6f4ea] px-2.5 py-0.5 rounded border border-[#ceead6]">ClickHouse Cloud (ZERO MongoDB)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex justify-between items-center">
            <span className="text-[#5f6368]">Open Source License:</span>
            <span className="text-[#202124] font-bold">MIT License (Hackathon Compliant)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
