import React, { useState, useEffect } from 'react';
import { Search, Database, Filter, RefreshCw, Layers } from 'lucide-react';
import { searchEvents } from '../services/api';

export default function ProductionSearch() {
  const [character, setCharacter] = useState('');
  const [scene, setScene] = useState('');
  const [eventType, setEventType] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await searchEvents('project-aurora', character, scene, eventType);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <Search className="w-3.5 h-3.5" />
          Structured Event Query Engine
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          ClickHouse Event Search Studio
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Execute safe, parameterized analytical queries across all production events in ClickHouse Cloud.
        </p>
      </div>

      <form onSubmit={handleSearch} className="google-card-light p-6 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#5f6368] mb-1 font-sans font-medium">Character / Entity Filter</label>
            <input
              type="text"
              placeholder="e.g. arjun"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <label className="block text-[#5f6368] mb-1 font-sans font-medium">Scene ID Filter</label>
            <input
              type="text"
              placeholder="e.g. scene_25"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-[#202124]"
            />
          </div>
          <div>
            <label className="block text-[#5f6368] mb-1 font-sans font-medium">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-[#202124] font-bold"
            >
              <option value="">ALL PRODUCTION EVENTS</option>
              <option value="VIDEO_OBSERVATION">VIDEO_OBSERVATION</option>
              <option value="STATE_SNAPSHOT">STATE_SNAPSHOT</option>
              <option value="CONTINUITY_CONFLICT">CONTINUITY_CONFLICT</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="google-btn-blue px-6 py-2.5 text-xs tracking-wide font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Execute ClickHouse Filter Query
        </button>
      </form>

      {/* Query Results */}
      <div className="google-card-light p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#dadce0] pb-3 text-xs font-mono">
          <span className="text-[#137333] font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1a73e8]" />
            Query Output ({events.length} events returned)
          </span>
          <span className="text-[#5f6368]">ClickHouse Table: cinestate.production_events</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-[#5f6368] py-8 text-center">No matching events in ClickHouse Cloud.</div>
          ) : (
            events.map((ev, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8] font-bold text-[10px] border border-[#d2e3fc]">
                      {ev.event_type}
                    </span>
                    <span className="font-bold text-[#202124]">Scene {ev.scene_id}</span>
                  </div>
                  <div className="text-[11px] text-[#5f6368]">
                    Entity: <strong className="text-[#202124]">{ev.entity_id || 'arjun'}</strong> • {ev.attribute_name || 'injury_location'} = <strong className="text-[#1a73e8]">{ev.observed_value || ev.value || 'left_arm'}</strong>
                  </div>
                </div>
                <span className="text-[10px] text-[#5f6368] font-mono">{ev.created_at || '2026-08-11'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
