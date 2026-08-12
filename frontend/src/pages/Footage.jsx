import React, { useState } from 'react';
import { Video, Upload, Play, Sparkles, CheckCircle2, AlertTriangle, Activity, Sliders, Shield, Layers, FileVideo, Check } from 'lucide-react';
import { analyzeTake } from '../services/api';

export default function Footage() {
  const [sceneId, setSceneId] = useState('scene_25');
  const [takeId, setTakeId] = useState('take_03');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Upload, 2: Gemini Vision, 3: ClickHouse Persistence, 4: Continuity Check
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setStep(1); // Upload

    setTimeout(() => setStep(2), 700); // Gemini Vision
    setTimeout(() => setStep(3), 1600); // ClickHouse Persistence

    try {
      const res = await analyzeTake({
        project_id: 'project-aurora',
        scene_id: sceneId,
        take_id: takeId,
        file_path: selectedFile ? selectedFile.name : './uploads/scene_25_take3.mp4',
      });
      setTimeout(() => {
        setStep(4); // Continuity Check Complete
        setResult(res);
      }, 2400);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAnalyzing(false), 2700);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="border-b border-[#dadce0] pb-4">
        <h1 className="text-2xl font-normal text-[#202124] tracking-tight">
          Footage Take Inspector
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Analyze video footage takes frame-by-frame using Gemini 2.0 Flash multimodal vision and store observations in ClickHouse Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="gc-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#1a73e8]" />
            Upload Video Take
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#5f6368] font-medium mb-1">Scene ID</label>
              <input
                type="text"
                value={sceneId}
                onChange={(e) => setSceneId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#f8f9fa] border border-[#dadce0] text-[#202124] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-medium mb-1">Take ID</label>
              <select
                value={takeId}
                onChange={(e) => setTakeId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white border border-[#dadce0] text-[#202124] font-mono font-bold"
              >
                <option value="take_03">Scene 25 / Take 3 (Conflict Demo Take)</option>
                <option value="take_01">Scene 25 / Take 1 (Consistent Take)</option>
                <option value="take_02">Scene 25 / Take 2 (Consistent Take)</option>
              </select>
            </div>

            {/* Drag & Drop File Area */}
            <div className="p-4 rounded border border-dashed border-[#dadce0] bg-[#f8f9fa] text-center space-y-2 relative">
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <FileVideo className="w-8 h-8 text-[#1a73e8] mx-auto" />
              <div className="text-xs text-[#202124] font-semibold">
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop MP4 Video Take'}
              </div>
              <p className="text-[11px] text-[#5f6368]">
                Gemini 2.0 Flash Multimodal Vision Supported
              </p>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="gc-btn-primary w-full justify-center py-2.5 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Analyzing Video Take...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Take with Gemini & ClickHouse
                </>
              )}
            </button>
          </form>

          {/* Simple Progress Indicator */}
          {analyzing && (
            <div className="p-4 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-2 text-xs font-mono">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {step >= 1 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                1. Uploading Video Media
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {step >= 2 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                2. Gemini 2.0 Multimodal Analysis
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {step >= 3 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                3. ClickHouse Evidence Persistence
              </div>
              <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#188038] font-bold' : 'text-[#5f6368]'}`}>
                {step >= 4 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                4. Continuity Check Complete
              </div>
            </div>
          )}
        </div>

        {/* Video Player & Side-by-Side Take Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Take 1 (Consistent Baseline) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#188038] flex items-center justify-between font-mono">
                <span>TAKE 1 (BASELINE REFERENCE)</span>
                <span className="gc-chip-green">PASSED</span>
              </div>
              <div className="aspect-video rounded bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-xs">
                <div className="absolute inset-10 border border-[#188038] rounded bg-[#188038]/20 flex items-start justify-end p-2">
                  <span className="bg-[#188038] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LEFT ARM INJURY @ 00:09.1 (98%)
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs font-mono text-white">Scene 25 / Take 1</div>
              </div>
            </div>

            {/* Take 3 (Conflict Take) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#d93025] flex items-center justify-between font-mono">
                <span>TAKE 3 (CURRENT ANALYSIS)</span>
                <span className="gc-chip-red">CONFLICT</span>
              </div>
              <div className="aspect-video rounded bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-xs">
                <div className="absolute inset-10 border-2 border-[#d93025] rounded bg-[#d93025]/20 flex items-start justify-end p-2 animate-pulse">
                  <span className="bg-[#d93025] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    RIGHT ARM INJURY @ 00:12.8 (93%)
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs font-mono text-white">Scene 25 / Take 3</div>
              </div>
            </div>
          </div>

          {/* Results Output */}
          {result && (
            <div className="gc-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
                <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#188038]" />
                  Extracted Visual Evidence
                </h3>
                <span className="text-xs font-mono">
                  {result.conflicts_detected > 0 ? (
                    <span className="gc-chip-red">
                      {result.conflicts_detected} Conflict Recorded in ClickHouse
                    </span>
                  ) : (
                    <span className="gc-chip-green">
                      State Fully Consistent
                    </span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {result.observations.map((obs, idx) => (
                  <div key={idx} className="p-3.5 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-1.5">
                    <div className="text-[10px] text-[#5f6368] uppercase font-bold">{obs.entity_id} · {obs.attribute_name}</div>
                    <div className="text-sm font-bold text-[#1a73e8]">{obs.value}</div>
                    <div className="text-[10px] text-[#188038] font-semibold">Gemini Confidence: {(obs.confidence * 100).toFixed(0)}%</div>
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
