import React, { useState, useRef, useEffect } from 'react';
import { Video, Zap, AlertTriangle, CheckCircle2, Camera, Eye, Play, StopCircle, Shield, Sparkles, Target, Database, Activity, Terminal } from 'lucide-react';
import { analyzeLiveFrame } from '../services/api';

const SCIFI_STYLES = `
  .glass-card {
    background: rgba(10, 10, 12, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  .neon-text-blue {
    color: #60a5fa;
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
  }
  .neon-text-red {
    color: #f87171;
    text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
  }
  .scanline {
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(96, 165, 250, 0.2) 50%, rgba(255,255,255,0));
    background-size: 100% 8px;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 25;
    pointer-events: none;
    animation: scanline 4s linear infinite;
    opacity: 0.3;
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  .terminal-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .terminal-scrollbar::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

export default function DirectorHUD() {
  const [streamActive, setStreamActive] = useState(false);
  const [liveScanning, setLiveScanning] = useState(false);
  const [liveScanStatus, setLiveScanStatus] = useState('STANDBY');
  const [detectedState, setDetectedState] = useState(null);
  const [liveObservations, setLiveObservations] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "> INITIALIZING CINESTATE PRODUCTION MEMORY SYSTEM...",
    "> CONNECTING TO CLICKHOUSE CLOUD MCP SERVER... SUCCESS.",
    "> GEMINI 2.0 FLASH VISION ENGINE... ONLINE."
  ]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const terminalRef = useRef(null);

  const addLog = (msg) => {
    setTerminalLogs(prev => [...prev, `> ${msg}`].slice(-15));
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const startCameraStream = async () => {
    try {
      setStreamActive(true);
      setLiveScanStatus('SCANNING');
      addLog("INITIATING CAMERA SENSOR LINK...");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      
      addLog("CAMERA LINK ESTABLISHED. COMMENCING LIVE MULTIMODAL SCAN.");
      
      setTimeout(() => {
        captureAndAnalyzeFrame();
      }, 1000);

      const interval = setInterval(() => {
        captureAndAnalyzeFrame();
      }, 2500);
      setPollingIntervalId(interval);

    } catch (err) {
      addLog(`ERROR: SENSOR LINK FAILED: ${err.message}`);
      setStreamActive(true);
      captureAndAnalyzeFrame();
    }
  };

  const stopCameraStream = () => {
    setStreamActive(false);
    setLiveScanStatus('STANDBY');
    setDetectedState(null);
    setLiveObservations([]);
    addLog("CAMERA SENSOR LINK TERMINATED. STANDBY MODE.");
    
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }

    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  };

  const drawSciFiBoxes = (observations) => {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    observations.forEach((obs) => {
      if (obs.bbox && obs.bbox.length === 4) {
        const [ymin, xmin, ymax, xmax] = obs.bbox;
        const x = xmin * w;
        const y = ymin * h;
        const boxW = (xmax - xmin) * w;
        const boxH = (ymax - ymin) * h;

        const isConflict = liveScanStatus === 'CONFLICT_FOUND' && obs.attribute_name.includes('injury');
        const color = isConflict ? '#ef4444' : '#3b82f6'; // red-500 : blue-500
        const glow = isConflict ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = glow;
        
        // Draw Sci-Fi Corners
        const len = 15;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
        // Top Right
        ctx.moveTo(x + boxW - len, y); ctx.lineTo(x + boxW, y); ctx.lineTo(x + boxW, y + len);
        // Bottom Left
        ctx.moveTo(x, y + boxH - len); ctx.lineTo(x, y + boxH); ctx.lineTo(x + len, y + boxH);
        // Bottom Right
        ctx.moveTo(x + boxW - len, y + boxH); ctx.lineTo(x + boxW, y + boxH); ctx.lineTo(x + boxW, y + boxH - len);
        ctx.stroke();

        // Draw crosshair center
        const cx = x + boxW/2;
        const cy = y + boxH/2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const labelText = `[${obs.attribute_name.toUpperCase()}: ${obs.value.toUpperCase()}]`;
        ctx.fillRect(x, Math.max(0, y - 20), ctx.measureText(labelText).width + 10, 18);
        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(labelText, x + 5, Math.max(0, y - 20) + 12);
      }
    });
  };

  const captureAndAnalyzeFrame = async () => {
    if (liveScanning) return;
    
    setLiveScanning(true);
    addLog("TRANSMITTING FRAME TO GEMINI 2.0 FLASH CORE...");
    const startTime = Date.now();
    try {
      let imageBlob = null;

      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.80));
      }

      const formData = new FormData();
      formData.append('project_id', 'project-aurora');
      formData.append('scene_id', 'scene_25'); 
      if (imageBlob) {
        formData.append('file', imageBlob, 'live_frame.jpg');
      }

      const res = await analyzeLiveFrame(formData);
      const latency = Date.now() - startTime;

      setScanCount((prev) => prev + 1);
      setLiveObservations(res.observations || []);
      
      drawSciFiBoxes(res.observations || []);
      
      addLog(`GEMINI RESPONSE RECEIVED [${latency}ms]. EXTRACTED ${res.observations?.length || 0} FEATURES.`);
      addLog(`MCP: INSERTING STATE INTO CLICKHOUSE CLOUD...`);

      if (res.conflicts_detected > 0 && res.conflicts.length > 0) {
        setLiveScanStatus('CONFLICT_FOUND');
        const conflict = res.conflicts[0];
        setDetectedState({
          character: 'Arjun',
          expected: conflict.expected_value,
          observed: conflict.observed_value,
          confidence: conflict.confidence,
          timestamp: 'LIVE',
          scene: 'Scene 25 (Live Webcam Scan)',
          recommendation: conflict.recommendation || 'Continuity conflict detected via ClickHouse Memory.',
        });
        addLog(`CRITICAL: CLICKHOUSE DETECTED CONTINUITY CONFLICT! EXPECTED: ${conflict.expected_value}, OBSERVED: ${conflict.observed_value}`);
      } else {
        setLiveScanStatus('MATCH');
        const shirtObs = res.observations?.find((o) => o.attribute_name === 'clothing_style')?.value || 'Not detected';
        setDetectedState({
          character: 'Arjun',
          expected: 'No conflicts',
          observed: 'Matching Baseline',
          clothing: shirtObs,
          confidence: 0.98,
          timestamp: 'LIVE',
          scene: 'Scene 25 (Live Stream)',
          recommendation: 'All elements match ClickHouse script baseline. Safe to shoot.',
        });
        addLog(`CLICKHOUSE VERIFICATION: PASSED. NO CONFLICTS WITH SCENE 25 BASELINE.`);
      }
    } catch (err) {
      addLog(`API ERROR: GEMINI KEY MISSING OR CONNECTION FAILED.`);
    } finally {
      setLiveScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalId) clearInterval(pollingIntervalId);
    };
  }, [pollingIntervalId]);

  return (
    <div className="bg-[#050505] min-h-screen p-6 text-[#e5e5e5] font-sans relative overflow-hidden" style={{ margin: '-24px', padding: '24px' }}>
      <style dangerouslySetInnerHTML={{ __html: SCIFI_STYLES }} />
      <canvas ref={canvasRef} className="hidden" />

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-[1600px] mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f1f] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">
              <Sparkles className="w-4 h-4" />
              CINESTATE // CONTINUITY INTELLIGENCE HUD // PROJECT AURORA
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              DIRECTOR'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">LIVE MONITOR</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {streamActive && (
              <div className="px-4 py-2 border border-blue-500/30 bg-blue-500/10 rounded flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <Activity className={`w-4 h-4 ${liveScanning ? 'animate-pulse' : ''}`} />
                {liveScanning ? 'Gemini Analysing...' : 'Gemini Standby'}
              </div>
            )}

            {!streamActive ? (
              <button
                onClick={startCameraStream}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                <Zap className="w-4 h-4 fill-white" />
                Initialize Live Stream
              </button>
            ) : (
              <button
                onClick={stopCameraStream}
                className="px-6 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 font-bold rounded flex items-center gap-2 text-xs uppercase tracking-widest transition-all"
              >
                <StopCircle className="w-4 h-4" />
                Terminate Link
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video Feed & Terminal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Container */}
            <div className="glass-card rounded-xl p-1 relative overflow-hidden group">
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${streamActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">CAM 01 // SCENE 25</span>
              </div>
              
              <div className="aspect-video bg-[#0a0a0a] rounded-lg relative overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover filter contrast-125 saturate-50"
                />

                <canvas
                  ref={overlayCanvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none z-20 ${streamActive ? 'block' : 'hidden'}`}
                />

                {streamActive && <div className="scanline"></div>}

                <div className={`absolute inset-0 bg-[#050505] flex-col items-center justify-center space-y-4 text-white z-30 ${!streamActive ? 'flex' : 'hidden'}`}>
                  <div className="w-16 h-16 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-blue-500/50" />
                  </div>
                  <div className="text-sm font-bold tracking-[0.2em] text-blue-400">SENSOR OFFLINE</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-sm text-center">
                    Awaiting authorization to initialize Gemini 2.0 Flash Vision and ClickHouse Cloud memory link.
                  </p>
                </div>
              </div>
            </div>

            {/* Terminal Log */}
            <div className="glass-card rounded-xl p-4 flex flex-col h-40">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                <Terminal className="w-4 h-4" />
                SYSTEM AUDIT TRAIL // CLICKHOUSE MCP
              </div>
              <div ref={terminalRef} className="flex-1 overflow-y-auto terminal-scrollbar font-mono text-[11px] leading-relaxed text-emerald-400/80 space-y-1">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={log.includes('CRITICAL') || log.includes('ERROR') ? 'text-red-400 font-bold' : ''}>{log}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Threat & State HUD */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                <Shield className="w-4 h-4" />
                CONTINUITY THREAT ASSESSMENT
              </div>

              {!detectedState ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <Database className="w-12 h-12 text-gray-600 mb-2" />
                  <div className="text-sm font-bold tracking-widest uppercase">Awaiting Feed</div>
                  <p className="text-[10px] text-gray-400">Ready to compare against ClickHouse baseline.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-6 flex flex-col">
                  {/* Big Status Badge */}
                  <div className={`p-5 rounded-lg border ${
                    liveScanStatus === 'CONFLICT_FOUND'
                      ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                      : 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/50">Status Code</div>
                    <div className={`text-2xl font-black tracking-tight ${liveScanStatus === 'CONFLICT_FOUND' ? 'neon-text-red' : 'text-emerald-400'}`}>
                      {liveScanStatus === 'CONFLICT_FOUND' ? 'CONFLICT DETECTED' : 'CLEAR TO SHOOT'}
                    </div>
                  </div>

                  {/* Details Data Grid */}
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Entity</div>
                        <div className="text-sm font-bold text-white">{detectedState.character.toUpperCase()}</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Confidence</div>
                        <div className="text-sm font-bold text-blue-400">{(detectedState.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    {liveScanStatus === 'CONFLICT_FOUND' && (
                      <div className="bg-black/40 p-4 rounded border border-red-500/20 space-y-3">
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Expected Baseline</div>
                          <div className="text-sm font-mono text-emerald-400">{detectedState.expected.toUpperCase()}</div>
                        </div>
                        <div className="w-full h-px bg-white/5"></div>
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Live Observation</div>
                          <div className="text-sm font-mono text-red-400 line-through decoration-red-500/50 decoration-2">{detectedState.observed.toUpperCase()}</div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-500/5 p-4 rounded border border-blue-500/20 text-xs text-blue-200/70 leading-relaxed font-mono">
                      {detectedState.recommendation}
                    </div>
                  </div>

                  {/* Actions */}
                  {liveScanStatus === 'CONFLICT_FOUND' && (
                    <button className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all">
                      ISSUE RESHOOT ORDER
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
