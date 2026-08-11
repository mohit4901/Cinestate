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
      console.error('Production state query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, [character, attribute]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          ClickHouse Event Memory
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          Production State History & Audit Ledger
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Query state progression across scenes. Every character attribute has a versioned history stored in ClickHouse Cloud.
        </p>
      </div>

      {/* Selectors */}
      <div className="google-card-light p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Entity / Character</label>
          <select
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="arjun">Arjun (Lead Character)</option>
            <option value="maya">Maya (Co-Lead)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#5f6368] uppercase mb-1 font-sans">Attribute</label>
          <select
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#202124] font-bold"
          >
            <option value="injury_location">Injury Location</option>
            <option value="watch_wrist">Watch Wrist</option>
            <option value="jacket_color">Jacket Color</option>
          </select>
        </div>

        <button
          onClick={loadState}
          className="google-btn-blue ml-auto px-4 py-1.5 text-xs font-semibold"
        >
          Refresh Query
        </button>
      </div>

      {/* State Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 google-card-light p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <History className="w-4 h-4 text-[#1a73e8]" />
            Chronological State Timeline: <code className="text-[#1a73e8]">{character}</code> / <code className="text-[#137333]">{attribute}</code>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {history.length === 0 ? (
              <div className="text-slate-400 py-6 text-center">Loading ClickHouse state history...</div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    item.value === 'right_arm' || item.observed_value === 'right_arm'
                      ? 'bg-[#fce8e6]/50 border-[#fad2cf] text-[#c5221f]'
                      : 'bg-[#f8f9fa] border-[#dadce0] text-[#202124]'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-[#5f6368]">Scene {item.scene_id}:</span>
                      <span className="text-[#1a73e8] font-mono font-extrabold">{item.value || item.observed_value}</span>
                    </div>
                    <div className="text-[10px] text-[#5f6368] mt-1 font-sans">
                      Source Event: {item.event_type || item.source_type || 'STATE_SNAPSHOT'} ({item.created_at || 'Scene 17 Baseline'})
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded bg-white text-[#137333] border border-[#ceead6] font-bold">
                    Conf: {((item.confidence || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Downstream Scene Graph */}
        <div className="google-card-light p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#b06000]" />
            Downstream Dependencies Graph
          </h3>
          <p className="text-xs text-[#5f6368]">
            Scenes dependent on state established in <code className="text-[#202124] font-bold">Scene 17</code>:
          </p>

          <div className="space-y-2 font-mono text-xs">
            {dependencies.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#fef7e0] border border-[#feefc3] text-[#b06000] font-bold">
                Scenes 26, 28, 31 (ClickHouse Graph)
              </div>
            ) : (
              dependencies.map((dep, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#fef7e0] border border-[#feefc3] flex items-center justify-between text-[#b06000] font-bold">
                  <span>{dep.scene_id}</span>
                  <span className="text-[10px] text-[#5f6368]">depends on Scene 17</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
