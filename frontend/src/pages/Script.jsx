import React from 'react';
import { FileText, Upload, Sparkles, Film } from 'lucide-react';

export default function Script() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          Screenplay Intelligence
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Script Parser & Scene Extractor
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload screenplay PDFs or raw text. Gemini parses scenes, wardrobe, props, and character state facts into ClickHouse Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            Upload Screenplay
          </h3>
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-xs text-slate-400">Upload PDF screenplay (<code className="text-slate-300">.pdf, .txt</code>)</div>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
            Parse Script with Gemini
          </button>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400" />
            Extracted Scenes (Project Aurora)
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">Scene 17: INT. HOTEL ROOM - NIGHT</div>
              <div className="text-slate-300 text-[11px] mt-1">Arjun tends to his LEFT ARM injury. Watch on LEFT wrist.</div>
              <div className="text-[10px] text-emerald-400 mt-1">ClickHouse Facts Established: 2</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">Scene 25: INT. INTERROGATION ROOM - DAY</div>
              <div className="text-slate-300 text-[11px] mt-1">Arjun questioned. Injury must match Scene 17 (LEFT ARM).</div>
              <div className="text-[10px] text-amber-400 mt-1">Depends on: Scene 17</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
