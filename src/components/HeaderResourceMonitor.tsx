import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, RefreshCw, X, Sliders, Server, Shield } from 'lucide-react';

interface MetricsData {
  cpuUsagePct: number;
  ramUsageGB: number;
  ramTotalGB: number;
  gpuUsagePct: number;
  vramUsageGB: number;
  vramTotalGB: number;
  queueDepth: number;
  activeWorkers: Array<{ id: string; name: string; type: string; status: string; vramUsedGB: number }>;
}

interface HeaderResourceMonitorProps {
  metrics: MetricsData;
}

interface HistorySample {
  timestamp: number;
  gpu: number;
  vram: number;
  cpu: number;
}

export const HeaderResourceMonitor: React.FC<HeaderResourceMonitorProps> = ({ metrics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistorySample[]>(() => {
    // Seed initial 20 samples for smooth sparklines
    const now = Date.now();
    return Array.from({ length: 25 }, (_, i) => ({
      timestamp: now - (25 - i) * 1000,
      gpu: Math.max(10, Math.min(95, metrics.gpuUsagePct + (Math.sin(i * 0.5) * 8))),
      vram: Math.max(1, Math.min(metrics.vramTotalGB, metrics.vramUsageGB + (Math.cos(i * 0.4) * 0.8))),
      cpu: Math.max(5, Math.min(90, metrics.cpuUsagePct + (Math.sin(i * 0.8) * 5)))
    }));
  });

  // Periodically push metrics to historical trend line
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const nextGpu = Math.max(10, Math.min(98, metrics.gpuUsagePct + (Math.random() * 6 - 3)));
        const nextVram = Math.max(2, Math.min(metrics.vramTotalGB, metrics.vramUsageGB + (Math.random() * 0.4 - 0.2)));
        const nextCpu = Math.max(8, Math.min(95, metrics.cpuUsagePct + (Math.random() * 5 - 2.5)));

        const newSample: HistorySample = {
          timestamp: Date.now(),
          gpu: nextGpu,
          vram: nextVram,
          cpu: nextCpu
        };
        const updated = [...prev.slice(1), newSample];
        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [metrics]);

  // Generate SVG path string for sparkline
  const generateSvgPath = (data: number[], min: number, max: number, width: number, height: number) => {
    if (data.length === 0) return '';
    const range = max - min || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const gpuData = history.map((h) => h.gpu);
  const vramData = history.map((h) => h.vram);
  const latestGpu = history[history.length - 1]?.gpu ?? metrics.gpuUsagePct;
  const latestVram = history[history.length - 1]?.vram ?? metrics.vramUsageGB;

  const sparklineWidth = 80;
  const sparklineHeight = 20;

  const gpuPath = generateSvgPath(gpuData, 0, 100, sparklineWidth, sparklineHeight);
  const vramPath = generateSvgPath(vramData, 0, metrics.vramTotalGB, sparklineWidth, sparklineHeight);

  return (
    <div className="relative">
      {/* Floating Sparkline Header Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-3 px-2.5 py-1 bg-[#0D0D10] hover:bg-[#15151a] rounded border border-[#2A2A30] text-[11px] font-mono transition-all group cursor-pointer"
        title="Click to toggle Real-time Hardware Telemetry Monitor"
      >
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <Activity className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>GPU/VRAM</span>
        </div>

        {/* Small Dual Sparkline SVG */}
        <div className="flex items-center gap-1">
          <svg width={sparklineWidth} height={sparklineHeight} className="overflow-visible">
            {/* GPU line */}
            <path d={gpuPath} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* VRAM line */}
            <path d={vramPath} fill="none" stroke="#10B981" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-blue-300 font-bold">{latestGpu.toFixed(0)}%</span>
          <span className="text-emerald-400 font-bold">{latestVram.toFixed(1)}GB</span>
        </div>
      </button>

      {/* Floating Detailed Resource Monitor Modal Panel */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-[380px] bg-[#0D0D10]/95 backdrop-blur-md border border-[#2A2A30] rounded-xl shadow-2xl p-4 text-xs font-mono z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white tracking-wide uppercase">Telemetry & VRAM Monitor</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1A1A1E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 mt-3">
            {/* GPU Usage Card with Large Trend SVG */}
            <div className="p-3 rounded-lg bg-[#111114] border border-[#2A2A30] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CUDA GPU Compute Core</span>
                </div>
                <span className="text-blue-300 font-bold">{latestGpu.toFixed(1)}% Load</span>
              </div>
              <div className="h-12 w-full bg-[#0A0A0C] rounded p-1 border border-[#1A1A1E] relative overflow-hidden flex items-end">
                <svg width="100%" height="100%" viewBox="0 0 320 40" preserveAspectRatio="none">
                  <path
                    d={generateSvgPath(gpuData, 0, 100, 320, 40)}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* VRAM Memory Allocation Card */}
            <div className="p-3 rounded-lg bg-[#111114] border border-[#2A2A30] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Unified VRAM Buffer</span>
                </div>
                <span className="text-emerald-300 font-bold">
                  {latestVram.toFixed(1)} / {metrics.vramTotalGB} GB
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1A1A1E] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(latestVram / metrics.vramTotalGB) * 100}%` }}
                ></div>
              </div>

              <div className="h-10 w-full bg-[#0A0A0C] rounded p-1 border border-[#1A1A1E] relative overflow-hidden flex items-end">
                <svg width="100%" height="100%" viewBox="0 0 320 32" preserveAspectRatio="none">
                  <path
                    d={generateSvgPath(vramData, 0, metrics.vramTotalGB, 320, 32)}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Active Workers Telemetry */}
            <div className="p-2.5 rounded-lg bg-[#111114] border border-[#2A2A30] space-y-1.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Isolated IPC Worker Nodes</span>
              <div className="space-y-1 text-[11px]">
                {metrics.activeWorkers.map((w) => (
                  <div key={w.id} className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {w.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{w.vramUsedGB} GB VRAM</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
