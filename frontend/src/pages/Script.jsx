import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Film, CheckCircle2, FileUp, Activity, Check, Info } from 'lucide-react';
import api from '../services/api';
import { useProject } from '../contexts/ProjectContext';

export default function Script() {
  const { activeProjectId } = useProject();
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleParse = async (e) => {
    e.preventDefault();
    setParsing(true);
    setParseStep(1);

    setTimeout(() => setParseStep(2), 600);
    setTimeout(() => setParseStep(3), 1500);

    try {
      const formData = new FormData();
      formData.append('project_id', activeProjectId);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      const response = await api.post('/analyze-script', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTimeout(() => {
        setParseStep(4);
        setResult(response.data.data);
      }, 2200);
    } catch (err) {
      console.error('Script parse error:', err);
    } finally {
      setTimeout(() => setParsing(false), 2500);
    }
  };

  const scenes = result?.scenes || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="border-b border-[#dadce0] pb-4">
        <h1 className="text-2xl font-semibold text-[#202124] tracking-tight">
          Scripts & Screenplay Intelligence
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Upload screenplay documents. Gemini 2.0 Flash extracts scene structures and initial character baseline facts into ClickHouse.
        </p>
      </div>

      {/* ℹ️ HOW SCRIPT BASELINE EXTRACTION WORKS */}
      <div className="p-4 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-[#1a73e8]">How Screenplay Parsing Works for Film Crews</div>
          <p className="text-[#5f6368] leading-relaxed">
            Drag & drop any screenplay PDF or Fountain file below. Gemini 2.0 Flash reads the script line-by-line, identifying every character's initial state (e.g. <i>Arjun injury_location = left_arm</i> in Scene 17). These facts form the ground truth memory ledger in ClickHouse Cloud.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Screenplay Form */}
        <div className="gc-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#1a73e8]" />
            Upload Screenplay Document
          </h3>

          <form onSubmit={handleParse} className="space-y-4 text-xs font-sans">
            <div className="p-6 rounded-md border border-dashed border-[#dadce0] bg-[#f8f9fa] text-center space-y-2 relative">
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <FileUp className="w-8 h-8 text-[#1a73e8] mx-auto" />
              <div className="text-xs text-[#202124] font-semibold">
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop PDF Screenplay'}
              </div>
              <p className="text-[11px] text-[#5f6368]">
                PDF, TXT, or Fountain formats supported
              </p>
            </div>

            <button
              type="submit"
              disabled={parsing}
              className="gc-btn-primary w-full justify-center py-2.5 cursor-pointer disabled:opacity-50"
            >
              {parsing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Processing Screenplay...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse Script with Gemini 2.0 Flash
                </>
              )}
            </button>
          </form>

          {/* Simple Progress Indicators */}
          {parsing && (
            <div className="p-4 rounded bg-[#f8f9fa] border border-[#dadce0] space-y-2 text-xs">
              <div className={`flex items-center gap-2 ${parseStep >= 1 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {parseStep >= 1 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                1. Uploading Document Stream
              </div>
              <div className={`flex items-center gap-2 ${parseStep >= 2 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {parseStep >= 2 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                2. Analyzing with Gemini 2.0 Flash
              </div>
              <div className={`flex items-center gap-2 ${parseStep >= 3 ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'}`}>
                {parseStep >= 3 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                3. Writing State Facts to ClickHouse
              </div>
              <div className={`flex items-center gap-2 ${parseStep >= 4 ? 'text-[#188038] font-bold' : 'text-[#5f6368]'}`}>
                {parseStep >= 4 ? <Check className="w-3.5 h-3.5 text-[#188038]" /> : <span className="w-3.5 h-3.5 rounded-full border border-[#5f6368] inline-block" />}
                4. Processing Complete
              </div>
            </div>
          )}

          {result && !parsing && (
            <div className="p-3 rounded bg-[#e6f4ea] border border-[#ceead6] text-[#188038] text-xs font-semibold">
              ✅ Gemini 2.0 parsed {scenes.length} scenes into ClickHouse Cloud memory!
            </div>
          )}
        </div>

        {/* Extracted Scene Baseline Display */}
        <div className="lg:col-span-2 gc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
              <Film className="w-4 h-4 text-[#188038]" />
              Extracted Screenplay Baseline Facts (Project Aurora)
            </h3>
            <span className="gc-chip-green">
              ClickHouse Synchronized
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {scenes.map((sc, idx) => (
              <div key={sc.scene_id || idx} className="p-4 rounded-md bg-[#f8f9fa] border border-[#dadce0] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#1a73e8] font-bold text-xs">
                    Scene {sc.scene_number || sc.scene_id}: {sc.location}
                  </span>
                  <span className="gc-chip-green">ESTABLISHED FACT</span>
                </div>
                <p className="text-xs text-[#202124] font-sans">
                  {sc.description || `Scene ${sc.scene_id} baseline character facts.`}
                </p>
                <div className="text-[11px] text-[#5f6368] pt-1 border-t border-[#dadce0] flex flex-wrap gap-4">
                  {sc.states?.map((st, i) => (
                    <span key={i}>
                      {st.attribute} = <code className="text-[#188038] font-bold">{st.value}</code> ({(st.confidence * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
