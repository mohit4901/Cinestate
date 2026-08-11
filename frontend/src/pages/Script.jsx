import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Film, CheckCircle2, FileUp, Activity } from 'lucide-react';
import api from '../services/api';

export default function Script() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleParse = async (e) => {
    e.preventDefault();
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append('project_id', 'project-aurora');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      const response = await api.post('/analyze-script', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.data);
    } catch (err) {
      console.error('Script parse error:', err);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1a73e8] uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          Screenplay Intelligence Studio
        </div>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">
          Script Parser & Baseline Fact Extractor
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Upload screenplay PDFs or text. Gemini 2.0 Flash parses scene structures, wardrobe, props, and initial character state baseline facts into ClickHouse Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="google-card-light p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#1a73e8]" />
            UPLOAD SCREENPLAY FILE
          </h3>

          <form onSubmit={handleParse} className="space-y-4 text-xs font-sans">
            <div className="p-6 rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] text-center space-y-2 relative">
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
              <p className="text-[10px] text-[#5f6368]">
                Supports PDF, TXT, and Fountain formats
              </p>
            </div>

            <button
              type="submit"
              disabled={parsing}
              className="google-btn-blue w-full py-3 text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {parsing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Gemini Parsing Screenplay...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse Script with Gemini 2.0 Flash
                </>
              )}
            </button>
          </form>
        </div>

        {/* Extracted Scene Baseline Display */}
        <div className="lg:col-span-2 google-card-light p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Film className="w-4 h-4 text-[#137333]" />
              Extracted Scenes & Character Baseline Facts (Project Aurora)
            </h3>
            <span className="text-xs font-mono text-[#137333] font-bold bg-[#e6f4ea] px-2.5 py-1 rounded border border-[#ceead6]">
              ClickHouse Memory Synchronized
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1a73e8] font-bold text-sm">Scene 17: INT. HOTEL ROOM - NIGHT</span>
                <span className="text-[10px] bg-[#e6f4ea] text-[#137333] font-bold px-2 py-0.5 rounded border border-[#ceead6]">ESTABLISHED FACT</span>
              </div>
              <p className="text-xs text-[#202124] font-sans">
                Arjun tends to his LEFT ARM injury. Watch on LEFT wrist.
              </p>
              <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0] flex gap-4">
                <span>injury_location = <code className="text-[#137333] font-bold">left_arm</code></span>
                <span>watch_wrist = <code className="text-[#137333] font-bold">left</code></span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1a73e8] font-bold text-sm">Scene 25: INT. INTERROGATION ROOM - DAY</span>
                <span className="text-[10px] bg-[#fef7e0] text-[#b06000] font-bold px-2 py-0.5 rounded border border-[#feefc3]">DEPENDS ON SCENE 17</span>
              </div>
              <p className="text-xs text-[#202124] font-sans">
                Arjun interrogated by detective. Injury from Scene 17 must be on LEFT ARM.
              </p>
              <div className="text-[10px] text-[#5f6368] pt-1 border-t border-[#dadce0] flex gap-4">
                <span>injury_location = <code className="text-[#137333] font-bold">left_arm</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
