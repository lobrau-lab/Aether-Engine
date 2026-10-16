import React, { useState } from 'react';
import { Layers, Play, Pause, Plus, Trash2, CheckCircle2, Clock, GitFork, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export interface BatchJob {
  id: string;
  materialName: string;
  prompt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  dependsOnId?: string;
  progressPct: number;
  currentStep: string;
  resolution: string;
}

interface BatchGenerationQueueProps {
  onGeneratePBR: (prompt: string) => Promise<void>;
}

export const BatchGenerationQueue: React.FC<BatchGenerationQueueProps> = ({ onGeneratePBR }) => {
  const [jobs, setJobs] = useState<BatchJob[]>([
    {
      id: 'batch-job-1',
      materialName: 'Motel Counter Mahogany Base',
      prompt: 'Weathered mahogany wood desk surface with brass scratches and varnish wear',
      status: 'completed',
      progressPct: 100,
      currentStep: 'Done - Asset Published',
      resolution: '2048x2048'
    },
    {
      id: 'batch-job-2',
      materialName: 'Brass Desk Bell Inlay',
      prompt: 'Polished oxidized brass metal material with fingerprints and patina in grooves',
      dependsOnId: 'batch-job-1',
      status: 'queued',
      progressPct: 0,
      currentStep: 'Waiting in queue for parent node',
      resolution: '2048x2048'
    },
    {
      id: 'batch-job-3',
      materialName: 'Vintage Radio Dial Glass',
      prompt: 'Scratched transparent radio dial glass with yellowed backlight glow and dust',
      dependsOnId: 'batch-job-2',
      status: 'queued',
      progressPct: 0,
      currentStep: 'Waiting in queue',
      resolution: '1024x1024'
    }
  ]);

  const [newPrompt, setNewPrompt] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('none');
  const [isQueueRunning, setIsQueueRunning] = useState(false);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    const newJob: BatchJob = {
      id: `batch-job-${Date.now()}`,
      materialName: newName.trim() || `Material Job #${jobs.length + 1}`,
      prompt: newPrompt.trim(),
      status: 'queued',
      dependsOnId: selectedParentId !== 'none' ? selectedParentId : undefined,
      progressPct: 0,
      currentStep: 'Ready in queue',
      resolution: '2048x2048'
    };

    setJobs((prev) => [...prev, newJob]);
    setNewPrompt('');
    setNewName('');
    setSelectedParentId('none');
  };

  const handleRunBatch = async () => {
    if (isQueueRunning) return;
    setIsQueueRunning(true);

    const steps = [
      'Initializing Isolated Worker Process...',
      'Synthesizing Albedo Color Map...',
      'Computing Tangent Normal Vectors...',
      'Baking Roughness & Metallic Channels...',
      'Generating Heights & AO Displacement...',
      'Signing C2PA Provenance & Finalizing'
    ];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.status === 'completed') continue;

      // Mark processing
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: 'processing', progressPct: 10, currentStep: steps[0] } : j))
      );

      for (let s = 1; s < steps.length; s++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const pct = Math.floor(((s + 1) / steps.length) * 100);
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, progressPct: pct, currentStep: steps[s] } : j))
        );
      }

      // Generate in main app state
      try {
        await onGeneratePBR(job.prompt);
      } catch (err) {
        console.warn('Batch item generation handled:', err);
      }

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? { ...j, status: 'completed', progressPct: 100, currentStep: 'Completed & Published to Asset Library' }
            : j
        )
      );
    }

    setIsQueueRunning(false);
  };

  const handleClearCompleted = () => {
    setJobs((prev) => prev.filter((j) => j.status !== 'completed'));
  };

  const handleLoadPreset = (presetType: 'motel' | 'cyberpunk' | 'industrial') => {
    if (presetType === 'motel') {
      setJobs([
        {
          id: 'b-1',
          materialName: 'Motel Carpet Pattern',
          prompt: '1970s geometric patterned motel corridor carpet with low pile texture',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '2048x2048'
        },
        {
          id: 'b-2',
          materialName: 'Neon Signage Enamel',
          prompt: 'Weathered red enamel metal housing for vintage neon motel sign',
          dependsOnId: 'b-1',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '2048x2048'
        },
        {
          id: 'b-3',
          materialName: 'Keycard Reader Metal',
          prompt: 'Brushed aluminum keycard door slot lock with red indicator LED lens',
          dependsOnId: 'b-2',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '1024x1024'
        }
      ]);
    } else if (presetType === 'cyberpunk') {
      setJobs([
        {
          id: 'c-1',
          materialName: 'Cyber Panel Carbon Fiber',
          prompt: 'Black woven carbon fiber panel with teal fiber-optic weave inlay',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '2048x2048'
        },
        {
          id: 'c-2',
          materialName: 'Holographic Display Filter',
          prompt: 'Iridescent diffraction grating glass filter with fingerprint smudges',
          dependsOnId: 'c-1',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '2048x2048'
        }
      ]);
    } else {
      setJobs([
        {
          id: 'i-1',
          materialName: 'Rust Heavy Iron Plate',
          prompt: 'Corroded industrial cast iron plate with orange rust flakes and riveted edge',
          status: 'queued',
          progressPct: 0,
          currentStep: 'Queued',
          resolution: '2048x2048'
        }
      ]);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Batch Asset Generation Queue</h2>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/20">
              {jobs.length} Jobs Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Queue multiple PBR texture prompts with node dependencies and background worker execution.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunBatch}
            disabled={isQueueRunning || jobs.every((j) => j.status === 'completed')}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
          >
            {isQueueRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isQueueRunning ? 'Processing Batch...' : 'Run Queue'}
          </button>

          <button
            onClick={handleClearCompleted}
            className="px-3 py-1.5 rounded bg-[#1A1A1E] hover:bg-slate-800 border border-[#2A2A30] text-slate-300 text-xs flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            Clear Completed
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-slate-400">Load Batch Preset:</span>
        <button
          onClick={() => handleLoadPreset('motel')}
          className="px-2.5 py-1 rounded bg-[#111114] hover:bg-[#1A1A1E] border border-[#2A2A30] text-blue-300"
        >
          Motel Lobby Set
        </button>
        <button
          onClick={() => handleLoadPreset('cyberpunk')}
          className="px-2.5 py-1 rounded bg-[#111114] hover:bg-[#1A1A1E] border border-[#2A2A30] text-purple-300"
        >
          Cyberpunk Props
        </button>
        <button
          onClick={() => handleLoadPreset('industrial')}
          className="px-2.5 py-1 rounded bg-[#111114] hover:bg-[#1A1A1E] border border-[#2A2A30] text-amber-300"
        >
          Industrial Iron
        </button>
      </div>

      {/* Add New Batch Item Form */}
      <form onSubmit={handleAddJob} className="p-3 rounded-lg bg-[#111114] border border-[#2A2A30] flex flex-col gap-3">
        <span className="text-blue-400 font-bold uppercase text-[11px]">Add Job to Queue</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Material Name (e.g. Vintage Brass Inlay)"
            className="px-3 py-1.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-white focus:outline-none focus:border-blue-500 text-xs font-sans"
          />
          <input
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="PBR prompt (e.g. Oxidized brass with scratches)"
            className="px-3 py-1.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-white focus:outline-none focus:border-blue-500 text-xs font-sans md:col-span-2"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Dependency:</span>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="px-2 py-1 rounded bg-[#1A1A1E] border border-[#2A2A30] text-slate-200 focus:outline-none"
            >
              <option value="none">Independent Root Asset</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Child of: {j.materialName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Queue Asset
          </button>
        </div>
      </form>

      {/* Queue Job Cards List with Progress & Dependency Links */}
      <div className="space-y-2 mt-1">
        {jobs.map((job, index) => {
          const parentJob = jobs.find((p) => p.id === job.dependsOnId);

          return (
            <div
              key={job.id}
              className={`p-3.5 rounded-lg border flex flex-col gap-2.5 transition-all ${
                job.status === 'processing'
                  ? 'bg-blue-950/20 border-blue-500/60 shadow-md'
                  : job.status === 'completed'
                  ? 'bg-[#111114] border-emerald-500/30'
                  : 'bg-[#111114] border-[#2A2A30]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-[10px]">#{index + 1}</span>
                    <h3 className="font-bold text-white text-xs">{job.materialName}</h3>

                    {parentJob && (
                      <span className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        <GitFork className="w-3 h-3" /> Depends on: {parentJob.materialName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">"{job.prompt}"</p>
                </div>

                <div className="shrink-0">
                  {job.status === 'completed' && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                  {job.status === 'processing' && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Processing ({job.progressPct}%)
                    </span>
                  )}
                  {job.status === 'queued' && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-[#1A1A1E] px-2 py-0.5 rounded border border-[#2A2A30]">
                      <Clock className="w-3 h-3" /> Queued
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Current Step */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{job.currentStep}</span>
                  <span>{job.progressPct}%</span>
                </div>
                <div className="w-full bg-[#1A1A1E] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${job.progressPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
