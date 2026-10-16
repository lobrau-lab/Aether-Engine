import React, { useState } from 'react';
import { ModelSlotInfo } from '../types';
import { Cpu, HardDrive, Zap, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Activity, Layers, Database, Server, Radio, RotateCcw, Shield } from 'lucide-react';

interface ModelGarageViewProps {
  slots: ModelSlotInfo[];
  metrics: any;
  onBenchmarkSlot: (slotId: string) => void;
  onUpdateSlotModel: (slotId: string, modelName: string) => void;
}

export const ModelGarageView: React.FC<ModelGarageViewProps> = ({
  slots,
  metrics,
  onBenchmarkSlot,
  onUpdateSlotModel
}) => {
  const [slotList, setSlotList] = useState<ModelSlotInfo[]>(slots);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || 'image_generation');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [restartingWorkerId, setRestartingWorkerId] = useState<string | null>(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(true);

  const selectedSlot = slotList.find((s) => s.id === selectedSlotId) || slotList[0];

  const handleRunBenchmark = (slotId: string) => {
    setIsBenchmarking(true);
    setTimeout(() => {
      onBenchmarkSlot(slotId);
      setIsBenchmarking(false);
    }, 800);
  };

  const handleRestartWorker = (slotId: string) => {
    setRestartingWorkerId(slotId);
    setTimeout(() => {
      setSlotList((prev) =>
        prev.map((s) => {
          if (s.id === slotId) {
            const newPid = Math.floor(40000 + Math.random() * 20000);
            return {
              ...s,
              status: 'loaded',
              workerPid: newPid,
              latencyMs: Math.max(15, Math.floor(s.latencyMs * (0.9 + Math.random() * 0.2)))
            };
          }
          return s;
        })
      );
      setRestartingWorkerId(null);
    }, 1100);
  };

  const handleToggleIsolationMode = (slotId: string) => {
    setSlotList((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          const nextMode = s.isolationMode === 'in_process_exception' ? 'out_of_process_worker' : 'in_process_exception';
          const nextIpc = nextMode === 'in_process_exception' ? 'in_process' : 'unix_socket';
          return {
            ...s,
            isolationMode: nextMode,
            ipcProtocol: nextIpc,
            workerPid: nextMode === 'in_process_exception' ? 0 : Math.floor(40000 + Math.random() * 20000)
          };
        }
        return s;
      })
    );
  };

  const handleToggleKeepWarm = (slotId: string) => {
    setSlotList((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return { ...s, keepWarm: !s.keepWarm };
        }
        return s;
      })
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto bg-[#0A0A0C] text-[#E0E0E6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-wide text-white">MODEL GARAGE</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Worker Engine v0.82
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Isolated Workers Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Model-agnostic compute garage & worker network manager. Model inference runs in persistent out-of-process workers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111114] border border-[#2A2A30] text-xs font-mono">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">IPC Workers:</span>
            <span className="text-emerald-400 font-semibold">{slotList.filter(s => s.isolationMode !== 'in_process_exception').length} Isolated</span>
          </div>
        </div>
      </div>

      {/* Model Isolation Policy Summary Box */}
      <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3 font-mono text-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPolicyDetails(!showPolicyDetails)}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold tracking-wide uppercase">Model Isolation & Runtime Boundary Policy</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/20">Active Enforcement</span>
          </div>
          <button className="text-slate-400 hover:text-white text-[11px] underline">
            {showPolicyDetails ? 'Collapse Policy Rules' : 'Expand Policy Rules'}
          </button>
        </div>

        {showPolicyDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#1A1A1E] text-[11px]">
            <div className="p-3 rounded bg-[#111114] border border-[#2A2A30] space-y-1.5">
              <span className="text-blue-400 font-bold uppercase tracking-wider block">1. Default Worker Policy</span>
              <p className="text-slate-300">Run generative & replaceable models in persistent out-of-process workers.</p>
              <p className="text-slate-400 text-[10px]">• Keeps models loaded & warm</p>
              <p className="text-slate-400 text-[10px]">• Structured IPC: WebSockets, Unix Sockets, Shared Memory</p>
            </div>

            <div className="p-3 rounded bg-[#111114] border border-[#2A2A30] space-y-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider block">2. In-Process Exceptions</span>
              <p className="text-slate-300">Strict exceptions for deterministic real-time models or native extensions.</p>
              <p className="text-slate-400 text-[10px]">• Low-latency VAD / STT streams (&lt;50ms)</p>
              <p className="text-slate-400 text-[10px]">• Validated native C++/GDExtension modules</p>
            </div>

            <div className="p-3 rounded bg-[#111114] border border-[#2A2A30] space-y-1.5">
              <span className="text-emerald-400 font-bold uppercase tracking-wider block">3. Runtime Boundary Split</span>
              <p className="text-slate-300">Strict division between AI generation and gameplay runtime execution.</p>
              <p className="text-slate-400 text-[10px]">• <strong className="text-slate-200">Model Workers:</strong> Assets, dialogue, intent, plans, motion requests</p>
              <p className="text-slate-400 text-[10px]">• <strong className="text-slate-200">Godot Runtime:</strong> Physics, bone transforms, IK, animation, input</p>
            </div>
          </div>
        )}
      </div>

      {/* Hardware Compute & Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-blue-400" /> GPU VRAM</span>
            <span className="text-blue-300">{metrics.vramUsageGB} GB / {metrics.vramTotalGB} GB</span>
          </div>
          <div className="w-full bg-[#1A1A1E] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(metrics.vramUsageGB / metrics.vramTotalGB) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono text-right">{((metrics.vramUsageGB / metrics.vramTotalGB) * 100).toFixed(1)}% Allocated</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-purple-400" /> System RAM</span>
            <span className="text-purple-300">{metrics.ramUsageGB} GB / {metrics.ramTotalGB} GB</span>
          </div>
          <div className="w-full bg-[#1A1A1E] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(metrics.ramUsageGB / metrics.ramTotalGB) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono text-right">{((metrics.ramUsageGB / metrics.ramTotalGB) * 100).toFixed(1)}% Allocated</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> GPU Load</span>
            <span className="text-amber-300">{metrics.gpuUsagePct}%</span>
          </div>
          <div className="w-full bg-[#1A1A1E] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.gpuUsagePct}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono text-right">RTX 4090 Active</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-400" /> Job Queue</span>
            <span className="text-emerald-300">{metrics.queueDepth} Pending</span>
          </div>
          <div className="w-full bg-[#1A1A1E] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `5%` }}></div>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono text-right">0ms Waiting</span>
        </div>
      </div>

      {/* Main Slots Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Model Slot Cards */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
            Engine Model Slots ({slotList.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {slotList.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              const isOutOfProcess = slot.isolationMode !== 'in_process_exception';
              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#111114] border-blue-500/80 shadow-md shadow-blue-950/30'
                      : 'bg-[#0D0D10] border-[#2A2A30] hover:border-slate-700 hover:bg-[#111114]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1E] text-slate-400 uppercase tracking-wide border border-[#2A2A30]">
                          {slot.computeTarget}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                          isOutOfProcess
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isOutOfProcess ? 'Out-of-Process Worker' : 'In-Process Exception'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold font-mono text-white mt-2">{slot.name}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      {slot.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{slot.purpose}</p>

                  <div className="pt-2 border-t border-[#2A2A30] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span className="text-blue-400 font-semibold">{slot.activeModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A1E] text-slate-400 uppercase border border-[#2A2A30]">
                        IPC: {slot.ipcProtocol || 'unix_socket'}
                      </span>
                      <span className="text-slate-500">{slot.latencyMs}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Slot Inspector Panel */}
        <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
              <div>
                <span className="text-xs font-mono text-blue-400 font-semibold">{selectedSlot.id.toUpperCase()}</span>
                <h2 className="text-base font-bold text-white font-mono mt-0.5">{selectedSlot.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunBenchmark(selectedSlot.id)}
                  disabled={isBenchmarking}
                  className="px-2.5 py-1.5 rounded bg-[#1A1A1E] hover:bg-slate-800 border border-[#2A2A30] text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin' : ''}`} />
                  Bench
                </button>

                {selectedSlot.isolationMode !== 'in_process_exception' && (
                  <button
                    onClick={() => handleRestartWorker(selectedSlot.id)}
                    disabled={restartingWorkerId === selectedSlot.id}
                    className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                    title="Restart out-of-process worker without restarting editor"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${restartingWorkerId === selectedSlot.id ? 'animate-spin' : ''}`} />
                    Restart Process
                  </button>
                )}
              </div>
            </div>

            {/* Worker Isolation Status & Process Info */}
            <div className="mt-4 p-3 rounded bg-[#111114] border border-[#2A2A30] flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Worker Process Mode:</span>
                <button
                  onClick={() => handleToggleIsolationMode(selectedSlot.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    selectedSlot.isolationMode !== 'in_process_exception'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  {selectedSlot.isolationMode !== 'in_process_exception' ? 'Out-of-Process Worker' : 'In-Process Exception'}
                </button>
              </div>

              {selectedSlot.isolationMode !== 'in_process_exception' && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Process PID:</span>
                    <span className="text-emerald-400 font-semibold">PID {selectedSlot.workerPid || 48201} (Isolated)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Structured IPC Protocol:</span>
                    <span className="text-blue-300 uppercase font-semibold">{selectedSlot.ipcProtocol || 'unix_socket'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Keep Warm State:</span>
                    <button
                      onClick={() => handleToggleKeepWarm(selectedSlot.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                        selectedSlot.keepWarm !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-[#2A2A30]'
                      }`}
                    >
                      {selectedSlot.keepWarm !== false ? 'Warm / Loaded' : 'On-Demand Cold'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1A1A1E]">
                <span className="text-slate-400">Primary Model:</span>
                <span className="text-white font-semibold">{selectedSlot.activeModel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1E]">
                <span className="text-slate-400">Fallback Model:</span>
                <span className="text-amber-400">{selectedSlot.fallbackModel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1E]">
                <span className="text-slate-400">Compute Backend:</span>
                <span className="text-blue-300">{selectedSlot.computeTarget}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1E]">
                <span className="text-slate-400">VRAM Requirement:</span>
                <span className="text-slate-200">{selectedSlot.vramRequiredGB} GB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1E]">
                <span className="text-slate-400">Precision / Quant:</span>
                <span className="text-slate-200">{selectedSlot.precision}</span>
              </div>
            </div>

            {/* Runtime Boundary Responsibilities */}
            <div className="mt-4 p-3 rounded bg-[#0A0A0C] border border-[#2A2A30] text-[11px] font-mono space-y-1">
              <span className="text-blue-400 font-bold uppercase tracking-wider block">Runtime Boundary Designation</span>
              <p className="text-slate-300">
                <strong className="text-white">Worker Responsibility:</strong> High-level assets, dialogue generation, intent classification & plans.
              </p>
              <p className="text-slate-400">
                <strong className="text-slate-300">Godot Engine Duty:</strong> Realtime bone transforms, IK, physics solver, and input loop.
              </p>
            </div>

            <div className="mt-4">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider block mb-2">Slot Capabilities</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSlot.capabilities.map((cap, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-[#1A1A1E] text-slate-300 text-xs font-mono border border-[#2A2A30]">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-[#0A0A0C] border border-[#2A2A30] text-xs font-mono text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-300 font-semibold">Worker Sandbox & Fault Isolation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                If model worker crashes or runs out of VRAM, the Godot Engine Editor and viewport continue running uninterrupted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

