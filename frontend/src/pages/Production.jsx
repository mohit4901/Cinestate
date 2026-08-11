import React, { useEffect, useState } from 'react';
import { Database, History, Search, ArrowRight, Shield } from 'lucide-react';
import { getCharacterHistory, getDependencies } from '../services/api';

export default function Production() {
  const [character, setCharacter] = useState('arjun');
  const [attribute, setAttribute] = useState('injury_location');
  const [history, setHistory] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadState = async () => {
    setLoading(true);
    try {
      const [histRes, depRes] = await Promise.all([
        getCharacterHistory('project-aurora', character, attribute),
        getDependencies('project-aurora', 'scene_17'),
      ]);
      setHistory(histRes.history || []);
      setDependencies(depRes.dependencies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, [character, attribute]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          ClickHouse Event Memory
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Production State History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Query state progression across scenes. Every character attribute has a versioned history stored in ClickHouse Cloud.
        </p>
      </div>

      {/* Selectors */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entity / Character</label>
          <select
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          >
            <option value="arjun">Arjun (Lead Character)</option>
            <option value="maya">Maya (Co-Lead)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attribute</label>
          <select
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          >
            <option value="injury_location">Injury Location</option>
            <option value="watch_wrist">Watch Wrist</option>
            <option value="jacket_color">Jacket Color</option>
          </select>
        </div>

        <button
          onClick={loadState}
          className="ml-auto px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
        >
          Refresh Query
        </button>
      </div>

      {/* State Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Chronological State Timeline: <code className="text-cyan-400">{character}</code> / <code className="text-emerald-400">{attribute}</code>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  item.value === 'right_arm' || item.observed_value === 'right_arm'
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-slate-400">Scene {item.scene_id}:</span>
                    <span className="text-cyan-400 font-mono">{item.value || item.observed_value}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Source: {item.source_type} ({item.source_reference || 'Screenplay'})
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Conf: {((item.confidence || 0.95) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Downstream Scene Graph */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Downstream Dependencies Graph
          </h3>
          <p className="text-xs text-slate-400">
            Scenes dependent on state established in <code className="text-white">Scene 17</code>:
          </p>

          <div className="space-y-2 font-mono text-xs">
            {dependencies.map((dep, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-amber-300">
                <span>{dep.scene_id}</span>
                <span className="text-[10px] text-slate-500">depends on Scene 17</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
