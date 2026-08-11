import React, { useState } from 'react';
import { Video, Upload, Play, Sparkles, CheckCircle2, AlertTriangle, Activity, Sliders, Shield, Layers } from 'lucide-react';
import { analyzeTake } from '../services/api';

export default function Footage() {
  const [sceneId, setSceneId] = useState('scene_25');
  const [takeId, setTakeId] = useState('take_03');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await analyzeTake({
        project_id: 'project-aurora',
        scene_id: sceneId,
        take_id: takeId,
        file_path: './uploads/scene_25_take3.mp4',
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <Video className="w-3.5 h-3.5" />
          Gemini 2.0 Multimodal Vision Perception Engine
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          Footage Take Inspector & Side-by-Side Comparison
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Analyze video footage takes frame-by-frame with Gemini 2.0 Flash. Extracted visual attributes are stored in ClickHouse Cloud and compared against baseline screenplay state memory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form & Upload Controls */}
        <div className="google-card-light p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#1a73e8]" />
            SELECT / UPLOAD VIDEO TAKE
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#5f6368] font-medium mb-1 font-sans">Scene ID</label>
              <input
                type="text"
                value={sceneId}
                onChange={(e) => setSceneId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-[#202124]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-medium mb-1 font-sans">Take ID</label>
              <select
                value={takeId}
                onChange={(e) => setTakeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-[#202124] font-bold"
              >
                <option value="take_03">Scene 25 / Take 3 (Conflict Demo Take)</option>
                <option value="take_01">Scene 25 / Take 1 (Consistent Take)</option>
                <option value="take_02">Scene 25 / Take 2 (Consistent Take)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] text-center space-y-2 font-sans">
              <Video className="w-8 h-8 text-[#5f6368] mx-auto" />
              <div className="text-xs text-[#5f6368]">
                Drag & drop video take file (<code className="text-[#202124]">.mp4, .mov</code>)
              </div>
              <span className="inline-block px-2.5 py-1 rounded bg-white text-[10px] text-[#1a73e8] font-mono border border-[#dadce0] font-bold">
                Gemini 2.0 Flash Vision Supported
              </span>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="google-btn-blue w-full py-3 text-xs tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Gemini Analyzing Take Video...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Take with Gemini & ClickHouse
                </>
              )}
            </button>
          </form>
        </div>

        {/* Video Player & Side-by-Side Take Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Take 1 (Consistent Baseline) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#137333] flex items-center justify-between font-mono">
                <span>TAKE 1 (BASELINE REFERENCE)</span>
                <span className="text-[10px] bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#ceead6]">PASSED</span>
              </div>
              <div className="aspect-video rounded-xl bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-sm">
                <div className="absolute inset-10 border border-[#00e676] rounded bg-[#00e676]/10 flex items-start justify-end p-2">
                  <span className="bg-[#137333] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LEFT ARM INJURY @ 00:09.1 (98%)
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs font-mono text-white">Scene 25 / Take 1</div>
              </div>
            </div>

            {/* Take 3 (Conflict Take) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#c5221f] flex items-center justify-between font-mono">
                <span>TAKE 3 (CURRENT ANALYSIS)</span>
                <span className="text-[10px] bg-[#fce8e6] px-2 py-0.5 rounded border border-[#fad2cf]">CONFLICT</span>
              </div>
              <div className="aspect-video rounded-xl bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-sm">
                <div className="absolute inset-10 border-2 border-rose-500 rounded bg-rose-500/20 flex items-start justify-end p-2 animate-pulse">
                  <span className="bg-[#c5221f] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    RIGHT ARM INJURY @ 00:12.8 (93%)
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs font-mono text-white">Scene 25 / Take 3</div>
              </div>
            </div>
          </div>

          {/* Results Output */}
          {result && (
            <div className="google-card-light p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                  Gemini Extracted Visual Attributes
                </h3>
                <span className="text-xs font-mono">
                  {result.conflicts_detected > 0 ? (
                    <span className="text-[#c5221f] font-bold bg-[#fce8e6] px-2.5 py-1 rounded border border-[#fad2cf]">
                      {result.conflicts_detected} Conflict Recorded in ClickHouse
                    </span>
                  ) : (
                    <span className="text-[#137333] font-bold bg-[#e6f4ea] px-2.5 py-1 rounded border border-[#ceead6]">
                      State Fully Consistent
                    </span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {result.observations.map((obs, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-1.5">
                    <div className="text-[10px] text-[#5f6368] uppercase font-bold">{obs.entity_id} • {obs.attribute_name}</div>
                    <div className="text-sm font-extrabold text-[#1a73e8]">{obs.value}</div>
                    <div className="text-[10px] text-[#137333] font-semibold">Gemini Confidence: {(obs.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
