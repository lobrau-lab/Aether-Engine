import React from 'react';
import { WorkflowNode, Asset } from '../types';
import { GitCommit, Layers, CheckCircle, Clock, RotateCcw, ShieldCheck, Box, RefreshCw } from 'lucide-react';

interface WorkflowDependencyViewProps {
  nodes: WorkflowNode[];
  assets: Asset[];
  onRollbackAsset: (assetId: string) => void;
}

export const WorkflowDependencyView: React.FC<WorkflowDependencyViewProps> = ({
  nodes,
  assets,
  onRollbackAsset
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto bg-[#0A0A0C] text-[#E0E0E6] font-mono">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide text-white">UNIFIED CREATIVE WORKFLOW</h1>
            <span className="px-2.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Character Sequence Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            End-to-end character creation dependency graph (Concept -&gt; 3D Mesh -&gt; Repair -&gt; UV -&gt; Textures -&gt; Skeleton -&gt; Voice -&gt; Memory -&gt; Scene Placement -&gt; Commit).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111114] border border-[#2A2A30] text-xs">
          <GitCommit className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400">Total Nodes:</span>
          <span className="text-white font-bold">{nodes.length} Stages</span>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sequential Dependency Graph Visualization */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Character Pipeline Stages & Resource Usage
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isInProgress = node.status === 'in_progress';
              const isNeedsApproval = node.status === 'needs_approval';

              return (
                <div
                  key={node.id}
                  className={`p-4 rounded-lg border flex flex-col justify-between gap-3 transition-all ${
                    isCompleted
                      ? 'bg-[#0D0D10] border-[#2A2A30]'
                      : isInProgress
                      ? 'bg-blue-950/30 border-blue-500/80 shadow-md shadow-blue-950/50'
                      : isNeedsApproval
                      ? 'bg-amber-950/30 border-amber-500/80'
                      : 'bg-[#111114] border-[#2A2A30]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#1A1A1E] text-slate-300 text-[10px] flex items-center justify-center font-bold border border-[#2A2A30]">
                        {index + 1}
                      </span>
                      <h3 className="text-xs font-bold text-white">{node.label}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                          : isNeedsApproval
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#1A1A1E] text-slate-400'
                      }`}
                    >
                      {node.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#2A2A30]">
                    <span>Est: {node.resourceEstMb} MB RAM</span>
                    <span className="text-blue-300">{node.modelUsed || 'Engine Worker'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Asset Provenance Inspector */}
        <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
            <span className="text-xs text-slate-300 font-bold">PROVENANCE LOGS ({assets.length})</span>
            <span className="text-[10px] text-emerald-400">Model Tracking Active</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[460px] pr-1 text-xs">
            {assets.map((ast) => (
              <div key={ast.id} className="p-3.5 rounded bg-[#111114] border border-[#2A2A30] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{ast.name}</span>
                  <span className="text-[10px] text-slate-500">v{ast.version}</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <p>Actor: <strong className="text-slate-200">{ast.provenance?.actor || 'Offline Engine'}</strong></p>
                  <p>Model: <strong className="text-blue-300">{ast.provenance?.model || 'Procedural Worker'}</strong></p>
                  <p>License: <strong className="text-slate-300">{ast.provenance?.license || 'Internal License'}</strong></p>
                  <p>Seed: {ast.provenance?.seed ?? 0}</p>
                </div>
                <button
                  onClick={() => onRollbackAsset(ast.id)}
                  className="mt-1 py-1 px-2 rounded bg-[#1A1A1E] hover:bg-slate-800 text-slate-300 border border-[#2A2A30] text-[10px] flex items-center justify-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3" /> Rollback to Last Approved Version
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
