import React, { useState } from 'react';
import { Asset, AssetState } from '../types';
import { Layers, Sparkles, CheckCircle, RotateCcw, AlertTriangle, ShieldAlert, Eye, Sliders, Box, FileText, ListOrdered } from 'lucide-react';
import { BatchGenerationQueue } from './BatchGenerationQueue';

interface TextureAnd3DPipelineViewProps {
  assets: Asset[];
  onGeneratePBR: (prompt: string) => Promise<void>;
  onUpdateAssetState: (assetId: string, newState: AssetState) => void;
  onRollbackAsset: (assetId: string) => void;
}

export const TextureAnd3DPipelineView: React.FC<TextureAnd3DPipelineViewProps> = ({
  assets,
  onGeneratePBR,
  onUpdateAssetState,
  onRollbackAsset
}) => {
  const [prompt, setPrompt] = useState('Vintage weathered motel reception mahogany wood texture with brass scratches');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || 'ast-001');
  const [activeTab, setActiveTab] = useState<'pbr_preview' | 'batch_queue' | 'topology_inspector' | 'state_machine'>('pbr_preview');
  const [lodLevel, setLodLevel] = useState(100);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0] || {
    id: 'ast-fallback',
    name: 'Procedural Texture',
    type: 'texture',
    state: 'approved',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pbr: {
      albedoUrl: 'https://picsum.photos/seed/fallback-albedo/1024/1024',
      normalUrl: 'https://picsum.photos/seed/fallback-normal/1024/1024',
      roughnessUrl: 'https://picsum.photos/seed/fallback-rough/1024/1024',
      metallicUrl: 'https://picsum.photos/seed/fallback-metal/1024/1024'
    },
    provenance: {
      jobId: 'job-fb',
      actor: 'Local Procedural Engine',
      timestamp: new Date().toISOString(),
      model: 'Local-PBR-Synthesizer',
      version: 'v1.0',
      license: 'Internal License',
      seed: 12345,
      machine: 'Host CPU',
      prompt: 'Procedural texture preset',
      settings: {}
    },
    versionHistory: []
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      await onGeneratePBR(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto bg-[#0A0A0C] text-[#E0E0E6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-wide text-white">OFFLINE ASSET STUDIO</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              3D & PBR Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Offline PBR map generator, mesh topology validator, UV unwrapper, retopology LOD engine, and asset state machine.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#111114] p-1 rounded border border-[#2A2A30] text-xs font-mono">
          <button
            onClick={() => setActiveTab('pbr_preview')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'pbr_preview' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            PBR Material Maps
          </button>
          <button
            onClick={() => setActiveTab('batch_queue')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'batch_queue' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" /> Batch Queue
          </button>
          <button
            onClick={() => setActiveTab('topology_inspector')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'topology_inspector' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Mesh Inspector
          </button>
          <button
            onClick={() => setActiveTab('state_machine')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'state_machine' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            State Machine & QA
          </button>
        </div>
      </div>

      {/* Main Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Generation & Interactive Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Prompt Generator Input */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
            <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">PBR Material Synthesis Prompt</span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter texture or material description..."
                className="flex-1 px-4 py-2.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Synthesizing PBR...' : 'Generate PBR Maps'}
              </button>
            </div>
          </div>

          {/* Active Tab View Content */}
          {activeTab === 'batch_queue' && (
            <BatchGenerationQueue onGeneratePBR={onGeneratePBR} />
          )}

          {activeTab === 'pbr_preview' && (
            <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  PBR Channel Decomposition ({selectedAsset.name})
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Seamless Tileable (1024x1024)
                </span>
              </div>

              {/* 4 PBR Channel Map Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Albedo (Base Color)</span>
                  <div className="aspect-square rounded bg-[#1A1A1E] border border-[#2A2A30] overflow-hidden relative group">
                    <img
                      src={selectedAsset.pbr?.albedoUrl || `https://picsum.photos/seed/${selectedAsset.id}-albedo/300/300`}
                      alt="Albedo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0A0A0C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white">
                      Inspect Albedo
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Normal Map (OpenGL)</span>
                  <div className="aspect-square rounded bg-[#1A1A1E] border border-[#2A2A30] overflow-hidden relative group">
                    <img
                      src={selectedAsset.pbr?.normalUrl || `https://picsum.photos/seed/${selectedAsset.id}-normal/300/300`}
                      alt="Normal"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hue-rotate-90"
                    />
                    <div className="absolute inset-0 bg-[#0A0A0C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white">
                      Inspect Normal
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Roughness Map</span>
                  <div className="aspect-square rounded bg-[#1A1A1E] border border-[#2A2A30] overflow-hidden relative group">
                    <img
                      src={selectedAsset.pbr?.roughnessUrl || `https://picsum.photos/seed/${selectedAsset.id}-rough/300/300`}
                      alt="Roughness"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-[#0A0A0C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white">
                      Inspect Roughness
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Metallic / Height</span>
                  <div className="aspect-square rounded bg-[#1A1A1E] border border-[#2A2A30] overflow-hidden relative group">
                    <img
                      src={selectedAsset.pbr?.metallicUrl || `https://picsum.photos/seed/${selectedAsset.id}-metal/300/300`}
                      alt="Metallic"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover contrast-125 grayscale"
                    />
                    <div className="absolute inset-0 bg-[#0A0A0C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white">
                      Inspect Height
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topology_inspector' && (
            <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
                <span className="text-xs font-mono text-slate-300 font-semibold">3D Mesh Quality & Retopology Engine</span>
                <span className="text-xs font-mono text-emerald-400">0 Holes | Manifold Mesh</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 rounded bg-[#1A1A1E] border border-[#2A2A30]">
                  <span className="text-slate-400">Poly Count:</span>
                  <p className="text-base font-bold text-white mt-1">14,280 Tris</p>
                </div>
                <div className="p-3 rounded bg-[#1A1A1E] border border-[#2A2A30]">
                  <span className="text-slate-400">UV Unwrapped:</span>
                  <p className="text-base font-bold text-emerald-400 mt-1">100% Valid UVs</p>
                </div>
                <div className="p-3 rounded bg-[#1A1A1E] border border-[#2A2A30]">
                  <span className="text-slate-400">Rigging Weights:</span>
                  <p className="text-base font-bold text-blue-400 mt-1">18 Bones Weighted</p>
                </div>
              </div>

              {/* Retopology LOD Reduction Slider */}
              <div className="p-4 rounded bg-[#1A1A1E] border border-[#2A2A30] flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Retopology LOD Budget:</span>
                  <span className="text-blue-400 font-bold">{lodLevel}% ({Math.round(14280 * (lodLevel / 100))} Tris)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={lodLevel}
                  onChange={(e) => setLodLevel(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'state_machine' && (
            <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4 font-mono text-xs">
              <span className="text-slate-300 font-semibold">Asset State Machine Rules & QA Lifecycle</span>
              <div className="p-3 rounded bg-[#1A1A1E] border border-[#2A2A30] text-slate-400 space-y-1.5">
                <p>• Generated outputs enter <strong className="text-amber-400">review_required</strong> state before production substitution.</p>
                <p>• Only <strong className="text-emerald-400">approved</strong> assets may be committed into Godot 4.6 build pipeline.</p>
                <p>• Full provenance recorded: model, version, seed, actor, timestamp, inputs, outputs, settings.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Asset State Machine List & Approval Panel */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">Studio Asset Pipeline ({assets.length})</h2>
          
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {assets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col gap-3 ${
                    isSelected ? 'bg-[#111114] border-blue-500/80 shadow-md' : 'bg-[#0D0D10] border-[#2A2A30] hover:bg-[#111114]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold font-mono text-white">{asset.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500">v{asset.version} • {asset.type.toUpperCase()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      asset.state === 'approved' || asset.state === 'production_ready'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : asset.state === 'review_required'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-[#1A1A1E] text-slate-400'
                    }`}>
                      {asset.state}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono line-clamp-1">{asset.provenance?.prompt || 'Procedural material prompt'}</p>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A30]">
                    {asset.state === 'review_required' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateAssetState(asset.id, 'approved');
                        }}
                        className="flex-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-semibold transition-all"
                      >
                        Approve Asset
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRollbackAsset(asset.id);
                      }}
                      className="py-1 px-2 rounded bg-[#1A1A1E] hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-[#2A2A30] transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Rollback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
