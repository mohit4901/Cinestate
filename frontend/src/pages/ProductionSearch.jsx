import React from 'react';
import { Search, Database, Filter } from 'lucide-react';

export default function ProductionSearch() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Search className="w-3.5 h-3.5" />
          Structured Event Search
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ClickHouse Event Search
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Safe parameterized filtering across all 31+ production events in ClickHouse Cloud.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Character Filter</label>
            <input type="text" placeholder="e.g. arjun" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Scene Filter</label>
            <input type="text" placeholder="e.g. scene_25" className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Event Type</label>
            <select className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white">
              <option value="">ALL EVENTS</option>
              <option value="VIDEO_OBSERVATION">VIDEO_OBSERVATION</option>
              <option value="SCRIPT_FACT">SCRIPT_FACT</option>
              <option value="CONTINUITY_CONFLICT">CONTINUITY_CONFLICT</option>
            </select>
          </div>
        </div>

        <button className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs">
          Execute Filtered Query
        </button>
      </div>
    </div>
  );
}
