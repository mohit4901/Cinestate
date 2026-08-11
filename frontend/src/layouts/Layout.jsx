import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  FileText,
  Video,
  Database,
  AlertTriangle,
  Search,
  Bot,
  Settings,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';

export default function Layout() {
  const [activeScenario, setActiveScenario] = useState('scenario_a');

  const navItems = [
    { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { path: '/production', label: 'Production Ledger', icon: Database },
    { path: '/script', label: 'Script Studio', icon: FileText },
    { path: '/footage', label: 'Footage Inspector', icon: Video },
    { path: '/conflicts', label: 'Conflict Center', icon: AlertTriangle, badge: '1 High' },
    { path: '/search', label: 'ClickHouse Query', icon: Search },
    { path: '/agents', label: 'Agent Topology & MCP', icon: Bot },
    { path: '/settings', label: 'System Health', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#202124] font-sans overflow-hidden">
      {/* Google Cloud Studio Light Sidebar */}
      <aside className="w-64 bg-white border-r border-[#dadce0] flex flex-col justify-between shrink-0 z-20 shadow-sm">
        <div>
          {/* Google Cloud Header */}
          <div className="p-4 border-b border-[#dadce0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a73e8] flex items-center justify-center shadow-md shadow-blue-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#202124]">CINESTATE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#e8f0fe] text-[#1a73e8] font-bold border border-[#d2e3fc]">
                  GCP
                </span>
              </div>
              <p className="text-[11px] text-[#5f6368] font-medium">
                Gemini Enterprise Agent Studio
              </p>
            </div>
          </div>

          {/* Project & Scenario Selector */}
          <div className="mx-3 my-3 p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#137333]"></span>
                <span className="text-xs font-bold text-[#202124]">Project Aurora</span>
              </div>
              <span className="text-[9px] font-mono bg-white text-[#5f6368] px-2 py-0.5 rounded border border-[#dadce0]">
                ClickHouse Cloud
              </span>
            </div>

            {/* Hackathon Preset Scenario Switcher */}
            <div>
              <label className="block text-[9px] font-bold text-[#5f6368] uppercase tracking-wider mb-1">
                Judge Test Scenario:
              </label>
              <select
                value={activeScenario}
                onChange={(e) => setActiveScenario(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-[#dadce0] rounded-lg px-2.5 py-1.5 text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="scenario_a">Scenario A: Arjun Injury Mismatch (Active)</option>
                <option value="scenario_b">Scenario B: Maya Scarf Flip</option>
                <option value="scenario_c">Scenario C: Watch Wrist Swap</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#e8f0fe] text-[#1a73e8] font-bold border border-[#d2e3fc] shadow-xs'
                        : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footprint Status */}
        <div className="p-4 border-t border-[#dadce0] bg-[#f8f9fa] text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#5f6368]">
            <span className="flex items-center gap-1.5 font-bold text-[#137333]">
              <CheckCircle className="w-3.5 h-3.5" />
              100% Rules Compliant
            </span>
            <span className="text-[#1a73e8] font-mono text-[10px] font-bold">v1.0.0</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#dadce0] text-[10px] space-y-1 font-mono text-[#5f6368]">
            <div className="flex justify-between">
              <span>Partner Track:</span>
              <span className="text-[#b06000] font-bold">ClickHouse Cloud</span>
            </div>
            <div className="flex justify-between">
              <span>MCP Protocol:</span>
              <span className="text-[#137333] font-bold">mcp-clickhouse</span>
            </div>
            <div className="flex justify-between">
              <span>AI Engine:</span>
              <span className="text-[#1a73e8] font-bold">Gemini 2.0 + ADK</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Google Cloud Header Bar */}
        <header className="h-14 bg-white border-b border-[#dadce0] flex items-center justify-between px-6 z-10 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]"></span>
            <h2 className="text-xs font-bold text-[#202124] tracking-wider uppercase flex items-center gap-2">
              Google Cloud Agentic Cinema — CINESTATE Studio Platform
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-ping"></span>
              ClickHouse Cloud Connected
            </span>

            <div className="h-4 w-px bg-[#dadce0]" />

            <a
              href="https://github.com/mohit4901/Cinestate"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#5f6368] hover:text-[#1a73e8] flex items-center gap-1 transition font-semibold"
            >
              Open Source GitHub Repo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
