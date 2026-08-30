import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload, Play, Sparkles, CheckCircle2, AlertTriangle, Activity, Sliders, Shield, Layers, FileVideo, Check, Info, ArrowRight } from 'lucide-react';
import { analyzeTake } from '../services/api';
import { useProject } from '../contexts/ProjectContext';

export default function Footage() {
  const { activeProjectId } = useProject();
  const navigate = useNavigate();
  const [sceneId, setSceneId] = useState('scene_25');
  const [entityId, setEntityId] = useState('arjun');
  const [takeId, setTakeId] = useState('take_03');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setStep(1);

    setTimeout(() => setStep(2), 700);
    setTimeout(() => setStep(3), 1600);

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('project_id', activeProjectId || 'project-aurora');
        formData.append('scene_id', sceneId);
        formData.append('entity_id', entityId);
        formData.append('take_id', takeId);
        formData.append('file', selectedFile);
        res = await analyzeTake(formData);
      } else {
        res = await analyzeTake({
          project_id: activeProjectId || 'project-aurora',
          scene_id: sceneId,
          entity_id: entityId,
          take_id: takeId,
          file_path: './uploads/scene_25_take3.mp4',
        });
      }
      setTimeout(() => {
        setStep(4);
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
        <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
          Footage Take Inspector
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Analyze video footage takes frame-by-frame using Gemini 2.0 Flash multimodal vision and store observations in ClickHouse Cloud.
        </p>
      </div>

      {/* ℹ️ HOW FOOTAGE INSPECTION WORKS */}
      <div className="p-4 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-[#1a73e8]">How Footage Take Inspection Works on Set</div>
          <p className="text-[#5f6368] leading-relaxed">
            As soon as a video take is recorded on camera cards (.mp4/.mov), upload it here. Gemini Multimodal Vision scans actor wardrobe, prop positions, and injury placements frame-by-frame, comparing them instantly against the screenplay baseline.
          </p>
        </div>
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
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5 uppercase">Take ID</label>
              <input
                type="text"
                value={takeId}
                onChange={(e) => setTakeId(e.target.value)}
                className="w-full bg-white border border-[#dadce0] rounded-md px-3 py-2 text-sm text-[#202124] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition"
                placeholder="e.g. take_03"
              />
            </div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setEntityId('vikram'); setSceneId('scene_18'); }}
                className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer border ${entityId === 'vikram' ? 'bg-[#1a73e8] text-white border-[#1a73e8]' : 'bg-white text-[#5f6368] border-[#dadce0]'}`}
              >
                Vikram (Cyberpunk)
              </button>
              <button
                type="button"
                onClick={() => { setEntityId('arjun'); setSceneId('scene_25'); }}
                className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer border ${entityId === 'arjun' ? 'bg-[#1a73e8] text-white border-[#1a73e8]' : 'bg-white text-[#5f6368] border-[#dadce0]'}`}
              >
                Arjun (Aurora)
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5 uppercase">Character / Entity Name</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full bg-white border border-[#dadce0] rounded-md px-3 py-2 text-sm text-[#202124] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition"
                placeholder="e.g. vikram or arjun"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5 uppercase">Scene ID</label>
              <input
                type="text"
                value={sceneId}
                onChange={(e) => setSceneId(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-sm text-[#202124]"
              />
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
            <div className="p-4 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-2 text-xs">
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
              <div className="text-xs font-semibold text-[#188038] flex items-center justify-between">
                <span>TAKE 1 (BASELINE REFERENCE)</span>
                <span className="gc-chip-green">PASSED</span>
              </div>
              <div className="aspect-video rounded bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-xs">
                <div className="absolute inset-10 border border-[#188038] rounded bg-[#188038]/20 flex items-start justify-end p-2">
                  <span className="bg-[#188038] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {entityId === 'vikram' ? 'LEFT OCULAR IMPLANT @ 00:04.1 (95%)' : 'LEFT ARM INJURY @ 00:09.1 (98%)'}
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs text-white">
                  {entityId === 'vikram' ? 'Scene 12 / Take 1 (Vikram)' : 'Scene 25 / Take 1 (Arjun)'}
                </div>
              </div>
            </div>

            {/* Take 3 (Conflict Take / Custom Upload) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#d93025] flex items-center justify-between">
                <span>{selectedFile ? `CUSTOM MEDIA: ${selectedFile.name.slice(0, 20)}...` : 'TAKE 3 (CURRENT ANALYSIS)'}</span>
                <span className="gc-chip-red">{result?.conflicts_detected > 0 ? 'CONFLICT' : 'EVIDENCE INGESTED'}</span>
              </div>
              <div className="aspect-video rounded bg-[#202124] relative overflow-hidden flex items-center justify-center shadow-xs">
                <div className="absolute inset-10 border-2 border-[#d93025] rounded bg-[#d93025]/20 flex items-start justify-end p-2 animate-pulse">
                  <span className="bg-[#d93025] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {result?.observations?.[0] 
                      ? `${result.observations[0].attribute_name.toUpperCase()} = ${result.observations[0].value.toUpperCase()} (${(result.observations[0].confidence * 100).toFixed(0)}%)` 
                      : (entityId === 'vikram' ? 'RIGHT OCULAR IMPLANT @ 00:08.5 (98%)' : 'RIGHT ARM INJURY @ 00:12.8 (93%)')}
                  </span>
                </div>
                <div className="relative z-10 text-center text-xs text-white">
                  {selectedFile ? `File: ${selectedFile.name}` : (entityId === 'vikram' ? 'Scene 18 / Take 3 (Vikram)' : 'Scene 25 / Take 3 (Arjun)')}
                </div>
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
                <span className="text-xs">
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

              {(result.scene_description || result.raw_description) && (
                <div className="p-4 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#1a73e8] font-semibold uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Multimodal Scene Breakdown
                  </div>
                  <p className="text-[#202124] leading-relaxed font-sans text-xs font-medium">
                    {result.scene_description || result.raw_description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {result.observations.map((obs, idx) => (
                  <div key={idx} className="p-3.5 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-1.5">
                    <div className="text-[10px] text-[#5f6368] uppercase font-bold">{obs.entity_id} · {obs.attribute_name}</div>
                    <div className="text-sm font-bold text-[#1a73e8]">{obs.value}</div>
                    <div className="text-[10px] text-[#188038] font-semibold">Gemini Confidence: {(obs.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>

              {result.conflicts_detected > 0 && (
                <button
                  onClick={() => navigate('/conflicts')}
                  className="gc-btn-primary w-full justify-center py-2.5 cursor-pointer"
                >
                  Review Conflict in Action Center
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
