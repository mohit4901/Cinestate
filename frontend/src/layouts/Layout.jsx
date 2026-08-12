import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  HelpCircle,
  Bell,
  User,
  ChevronDown,
  Play,
  X,
  Clock,
  Menu,
  Sparkles,
} from 'lucide-react';

export default function Layout() {
  const [activeScenario, setActiveScenario] = useState('scenario_a');
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PRODUCTION',
      items: [
        { path: '/production', label: 'Production State', icon: Database },
        { path: '/script', label: 'Scripts', icon: FileText },
        { path: '/footage', label: 'Footage', icon: Video },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { path: '/conflicts', label: 'Conflicts', icon: AlertTriangle, badge: '1 High' },
        { path: '/search', label: 'Search', icon: Search },
      ],
    },
    {
      title: 'AGENTS',
      items: [
        { path: '/agents', label: 'Agent Activity', icon: Bot },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#ffffff] text-[#202124] font-sans overflow-hidden">
      {/* Google Cloud Shell Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Google Cloud Style Top Navigation Bar (64px) */}
        <header className="h-16 bg-white border-b border-[#dadce0] flex items-center justify-between px-4 z-30 shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-[#f1f3f4] text-[#5f6368] transition cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#1a73e8] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#202124]">CINESTATE</span>
            </div>

            <div className="h-5 w-px bg-[#dadce0] mx-1" />

            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#f8f9fa] border border-[#dadce0] text-xs font-medium cursor-pointer transition">
              <span className="w-2 h-2 rounded-full bg-[#188038]"></span>
              <span className="text-[#202124] font-bold">Project Aurora</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" />
            </div>
          </div>

          {/* Center Global Search Field */}
          <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5f6368]" />
              <input
                type="text"
                placeholder="Search scenes, characters, takes, conflicts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white focus:ring-1 focus:ring-[#1a73e8] border border-transparent focus:border-[#1a73e8] rounded-md pl-9 pr-4 py-2 text-xs text-[#202124] placeholder-[#5f6368] transition outline-none"
              />
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDemoGuide(true)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border border-[#d2e3fc] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#1a73e8]" />
              3-MIN PITCH DEMO
            </button>

            <button
              onClick={() => setShowDemoGuide(true)}
              className="p-2 rounded-md hover:bg-[#f1f3f4] text-[#5f6368] transition cursor-pointer"
              title="Help & Documentation"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-md hover:bg-[#f1f3f4] text-[#5f6368] transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-[#d93025] absolute top-2 right-2 border border-white"></span>
            </button>

            <div className="h-5 w-px bg-[#dadce0] mx-1" />

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center text-[#1a73e8] font-bold text-xs cursor-pointer">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Main Body: Sidebar + Viewport */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Google Cloud Style Sidebar */}
          <aside
            className={`${
              sidebarCollapsed ? 'w-16' : 'w-60'
            } bg-white border-r border-[#dadce0] flex flex-col justify-between shrink-0 transition-all duration-200 z-20`}
          >
            <div className="py-2 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.title} className="mb-4">
                  {!sidebarCollapsed && (
                    <div className="px-4 py-1 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}
                  <nav className="px-2 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-[#e8f0fe] text-[#1a73e8] font-bold'
                                : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                            }`
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                          </div>
                          {!sidebarCollapsed && item.badge && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#fce8e6] text-[#d93025] border border-[#fad2cf]">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Sidebar Footprint Status */}
            {!sidebarCollapsed && (
              <div className="p-3 border-t border-[#dadce0] bg-[#f8f9fa] text-[11px] font-mono text-[#5f6368] space-y-1">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-[#188038] font-bold">mcp-clickhouse</span>
                </div>
                <div className="flex justify-between">
                  <span>AI:</span>
                  <span className="text-[#1a73e8] font-bold">Gemini 2.0 Flash</span>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#ffffff] p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 🎥 3-MINUTE PITCH DEMO GUIDE MODAL */}
      {showDemoGuide && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="gc-card max-w-2xl w-full p-6 space-y-4 relative shadow-xl">
            <button
              onClick={() => setShowDemoGuide(false)}
              className="absolute top-4 right-4 text-[#5f6368] hover:text-[#202124] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-[#1a73e8]">
              <Clock className="w-4 h-4" />
              3-MINUTE JUDGE PITCH DEMO FLOW (180-SECOND PRESENTATION GUIDE)
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded bg-[#e8f0fe] border border-[#d2e3fc] space-y-1">
                <div className="font-bold text-[#1a73e8] flex justify-between">
                  <span>0:00 – 0:30 | Screenplay Baseline (`/script`)</span>
                  <span>Gemini 2.0 PDF Vision</span>
                </div>
                <p className="text-[#5f6368]">
                  Show screenplay parsing. Gemini 2.0 Flash extracts Scene 17 baseline fact: <strong>Arjun injury = Left Arm (98% Conf)</strong> into ClickHouse.
                </p>
              </div>

              <div className="p-3 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-1">
                <div className="font-bold text-[#202124] flex justify-between">
                  <span>0:30 – 1:00 | Autonomous Watchdog Ingestion (`/dashboard`)</span>
                  <span>Proactive Ingest Pipeline</span>
                </div>
                <p className="text-[#5f6368]">
                  Click <strong>"SIMULATE LIVE FOOTAGE INGESTION"</strong>. Show how CINESTATE evaluates new footage automatically as soon as it arrives from camera cards.
                </p>
              </div>

              <div className="p-3 rounded bg-[#fce8e6] border border-[#fad2cf] space-y-1">
                <div className="font-bold text-[#d93025] flex justify-between">
                  <span>1:00 – 1:40 | Evidence Chain & Conflict (`/conflicts`)</span>
                  <span>Anti-Hallucination</span>
                </div>
                <p className="text-[#5f6368]">
                  Show Scene 25 Take 3: Observed Right Arm @ 00:12.8. Highlight Evidence Chain Card proving zero LLM hallucination.
                </p>
              </div>

              <div className="p-3 rounded bg-[#fef7e0] border border-[#feefc3] space-y-1">
                <div className="font-bold text-[#b06000] flex justify-between">
                  <span>1:40 – 2:20 | Blast Radius 2.0 & Cost Matrix (`/conflicts`)</span>
                  <span>ClickHouse Graph</span>
                </div>
                <p className="text-[#5f6368]">
                  Show ClickHouse dependency tree affecting Scenes 26, 28, 31. Explain financial risk: <strong>$1,500 immediate reshoot vs $45,000 post-VFX fix</strong>.
                </p>
              </div>

              <div className="p-3 rounded bg-[#e6f4ea] border border-[#ceead6] space-y-1">
                <div className="font-bold text-[#188038] flex justify-between">
                  <span>2:20 – 3:00 | Action Planner & MCP Proof (`/agents`)</span>
                  <span>mcp-clickhouse Protocol</span>
                </div>
                <p className="text-[#5f6368]">
                  Click <strong>"Execute Option A Reshoot"</strong>. Open Agent Activity tab showing node trace drawer and raw `mcp-clickhouse` JSON-RPC messages.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDemoGuide(false)}
                className="gc-btn-primary"
              >
                Start Demo Pitch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
