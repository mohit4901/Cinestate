import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
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
  BookOpen,
  Info,
  CheckCircle,
  Camera,
  FolderPlus,
} from 'lucide-react';

export default function Layout() {
  const [activeScenario, setActiveScenario] = useState('scenario_a');
  const [showOpsGuide, setShowOpsGuide] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ id: '', name: '', desc: '' });
  const { projects, activeProject, switchProject, createProject } = useProject();
  const navigate = useNavigate();

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (newProjectForm.id && newProjectForm.name) {
      await createProject(newProjectForm.id, newProjectForm.name, newProjectForm.desc);
      setShowProjectModal(false);
      setNewProjectForm({ id: '', name: '', desc: '' });
    }
  };

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
        { path: '/', label: 'Studio Home', icon: Film },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PRODUCTION',
      items: [
        { path: '/live-monitor', label: 'Live Camera Stream', icon: Camera, badge: 'LIVE' },
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
              <span className="font-bold text-base tracking-tight text-[#202124]">CINESTATE</span>
            </div>

            <div className="h-5 w-px bg-[#dadce0] mx-1" />

            {/* Project Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#f8f9fa] border border-[#dadce0] text-xs font-medium cursor-pointer transition">
                <span className="w-2 h-2 rounded-full bg-[#188038]"></span>
                <span className="text-[#202124] font-semibold">{activeProject ? activeProject.name : 'Loading...'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5f6368]" />
              </div>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#dadce0] rounded-md shadow-lg hidden group-hover:block z-50">
                <div className="py-1">
                  {projects.map(p => (
                    <button
                      key={p.project_id}
                      onClick={() => switchProject(p.project_id)}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-[#f1f3f4] ${activeProject?.project_id === p.project_id ? 'font-bold text-[#1a73e8]' : 'text-[#202124]'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                  <div className="border-t border-[#dadce0] my-1"></div>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="block w-full text-left px-4 py-2 text-xs text-[#1a73e8] font-semibold hover:bg-[#f1f3f4]"
                  >
                    + Create New Project
                  </button>
                </div>
              </div>
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
              onClick={() => setShowOpsGuide(true)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border border-[#d2e3fc] flex items-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              STUDIO OPERATIONS GUIDE
            </button>

            <button
              onClick={() => setShowOpsGuide(true)}
              className="p-2 rounded-md hover:bg-[#f1f3f4] text-[#5f6368] transition cursor-pointer"
              title="Help & Operations Documentation"
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
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center text-[#1a73e8] font-semibold text-xs cursor-pointer">
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
                    <div className="px-4 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider">
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
                            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                              item.badge === 'LIVE'
                                ? 'bg-[#e6f4ea] text-[#188038] border border-[#ceead6]'
                                : 'bg-[#fce8e6] text-[#d93025] border border-[#fad2cf]'
                            }`}>
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
              <div className="p-3 border-t border-[#dadce0] bg-[#f8f9fa] text-[11px] text-[#5f6368] space-y-1">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-[#188038] font-semibold">mcp-clickhouse</span>
                </div>
                <div className="flex justify-between">
                  <span>AI:</span>
                  <span className="text-[#1a73e8] font-semibold">Gemini 2.0 Flash</span>
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

      {/* 📘 STUDIO OPERATIONS GUIDE MODAL */}
      {showOpsGuide && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="gc-card max-w-2xl w-full p-6 space-y-4 relative shadow-xl">
            <button
              onClick={() => setShowOpsGuide(false)}
              className="absolute top-4 right-4 text-[#5f6368] hover:text-[#202124] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-[#1a73e8]">
              <BookOpen className="w-4.5 h-4.5" />
              STUDIO OPERATIONS GUIDE — HOW TO USE CINESTATE IN PRODUCTION
            </div>

            <p className="text-xs text-[#5f6368]">
              CINESTATE requires zero technical setup for film crews. Anyone on set (Director, Producer, Script Supervisor) can operate CINESTATE by following simple steps:
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded bg-[#e8f0fe] border border-[#d2e3fc] space-y-1">
                <div className="font-bold text-[#1a73e8] flex justify-between">
                  <span>Live Wireless Camera Feed (`/live-monitor`)</span>
                  <span>Real-time Recognition</span>
                </div>
                <p className="text-[#5f6368]">
                  Connect director camera stream (RTSP/Webcam). Gemini Vision scans live video frames continuously, flagging continuity errors on screen before wrapping set!
                </p>
              </div>

              <div className="p-3 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-1">
                <div className="font-bold text-[#202124] flex justify-between">
                  <span>Step 1: Upload Screenplay (`/script`)</span>
                  <span>Baseline Facts</span>
                </div>
                <p className="text-[#5f6368]">
                  Drag & drop your screenplay PDF. Gemini 2.0 Flash reads the script and establishes baseline scene facts (wardrobe, injuries, watches) in ClickHouse Cloud memory.
                </p>
              </div>

              <div className="p-3 rounded bg-[#fce8e6] border border-[#fad2cf] space-y-1">
                <div className="font-bold text-[#d93025] flex justify-between">
                  <span>Step 2: Review Conflicts (`/conflicts`)</span>
                  <span>Anti-Hallucination Engine</span>
                </div>
                <p className="text-[#5f6368]">
                  CINESTATE automatically compares script facts against camera footage. Mismatches (e.g. Left Arm vs Right Arm) are flagged with evidence provenance.
                </p>
              </div>

              <div className="p-3 rounded bg-[#e6f4ea] border border-[#ceead6] space-y-1">
                <div className="font-bold text-[#188038] flex justify-between">
                  <span>Step 3: Director Action Planner (`/conflicts`)</span>
                  <span>Financial ROI</span>
                </div>
                <p className="text-[#5f6368]">
                  Review resolution options: <strong>Option A (Reshoot Take - $1,500)</strong> vs <strong>Option C (Post-VFX Fix - $45,000)</strong>. Approve or log notes in 1 click!
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowOpsGuide(false)}
                className="gc-btn-primary cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-[#dadce0] overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-[#dadce0] bg-[#f8f9fa]">
              <h2 className="text-sm font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#1a73e8]" />
                Create New Project
              </h2>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">Project ID (e.g. project-test)</label>
                <input 
                  type="text" 
                  value={newProjectForm.id}
                  onChange={(e) => setNewProjectForm({...newProjectForm, id: e.target.value})}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-xs text-[#202124]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-xs text-[#202124]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">Description</label>
                <textarea 
                  value={newProjectForm.desc}
                  onChange={(e) => setNewProjectForm({...newProjectForm, desc: e.target.value})}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-xs text-[#202124] min-h-[80px]"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-[#dadce0]">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white transition shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
