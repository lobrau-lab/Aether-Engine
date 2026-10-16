import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TUICommand, SkeletonRig, BoneNode } from '../types';
import {
  Terminal,
  Zap,
  RotateCcw,
  Download,
  Key,
  Copy,
  FlipHorizontal,
  Save,
  Check,
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Bookmark
} from 'lucide-react';

export interface IKPreset {
  id: string;
  name: string;
  label: string;
  description: string;
  isBuiltIn: boolean;
  boneRotations: Record<string, [number, number, number]>;
  ikTargets: { name: string; position: [number, number, number] }[];
}

interface TerminalRigConsoleProps {
  rig: SkeletonRig;
  history: TUICommand[];
  flipperState: 'released' | 'pressed' | 'held';
  onExecuteCommand: (cmd: string, inputState: 'pressed' | 'held' | 'released') => void;
  onResetRig?: () => void;
  onUpdateBoneRotation?: (boneId: string, newRot: [number, number, number]) => void;
  isTUIMode: boolean;
  onToggleTUI: () => void;
}

const BUILTIN_PRESETS: IKPreset[] = [
  {
    id: 'idle',
    name: 'idle_rest',
    label: 'Idle Rest',
    description: 'Default upright stance with arms resting at rest angles.',
    isBuiltIn: true,
    boneRotations: {
      spine: [0, 0, 0],
      neck: [0, 0, 0],
      head: [0, 0, 0],
      'upper_arm.L': [0, 0, 0.5],
      'forearm.L': [0, 0, 0],
      'hand.L': [0, 0, 0],
      'upper_arm.R': [0, 0, -0.5],
      'forearm.R': [0, 0, 0],
      'hand.R': [0, 0, 0]
    },
    ikTargets: [
      { name: 'flipper_target.L', position: [-0.5, 1.0, 0.2] },
      { name: 'flipper_target.R', position: [0.5, 1.0, 0.2] }
    ]
  },
  {
    id: 'waving',
    name: 'on_air_waving',
    label: 'On-Air Waving',
    description: 'Left flipper arm raised high in an energetic radio broadcast wave.',
    isBuiltIn: true,
    boneRotations: {
      spine: [0.05, 0, 0.05],
      neck: [0, 0, 0.1],
      head: [-0.1, 0, 0.15],
      'upper_arm.L': [-0.6, 0.2, 1.4],
      'forearm.L': [0, 0.3, 0.9],
      'hand.L': [0.2, 0, 0.4],
      'upper_arm.R': [0, 0, -0.4],
      'forearm.R': [0, 0, 0],
      'hand.R': [0, 0, 0]
    },
    ikTargets: [
      { name: 'flipper_target.L', position: [-0.6, 1.8, 0.5] }
    ]
  },
  {
    id: 'desk-typing',
    name: 'desk_tuning',
    label: 'Desk Tuning',
    description: 'Leaning forward over motel desk, tuning vintage radio dial.',
    isBuiltIn: true,
    boneRotations: {
      spine: [0.2, 0, 0],
      neck: [0.1, 0, 0],
      head: [0.15, 0, 0],
      'upper_arm.L': [0.5, 0.2, 0.3],
      'upper_arm.R': [0.5, -0.2, -0.3],
      'forearm.L': [0.9, 0, 0.2],
      'forearm.R': [0.9, 0, -0.2],
      'hand.L': [0.3, 0, 0],
      'hand.R': [0.3, 0, 0]
    },
    ikTargets: [
      { name: 'flipper_target.L', position: [-0.2, 0.8, 0.4] }
    ]
  },
  {
    id: 'victory',
    name: 'broadcast_triumph',
    label: 'Broadcast Triumph',
    description: 'Both flipper arms raised high celebrating peak signal reach.',
    isBuiltIn: true,
    boneRotations: {
      spine: [-0.1, 0, 0],
      neck: [-0.15, 0, 0],
      head: [-0.2, 0, 0],
      'upper_arm.L': [-0.8, 0.2, 1.5],
      'upper_arm.R': [-0.8, -0.2, -1.5],
      'forearm.L': [0, 0, 0.5],
      'forearm.R': [0, 0, -0.5],
      'hand.L': [0.4, 0, 0],
      'hand.R': [0.4, 0, 0]
    },
    ikTargets: [
      { name: 'flipper_target.L', position: [0.0, 2.0, 0.0] }
    ]
  }
];

export const TerminalRigConsole: React.FC<TerminalRigConsoleProps> = ({
  rig,
  history,
  flipperState,
  onExecuteCommand,
  onResetRig,
  onUpdateBoneRotation,
  isTUIMode,
  onToggleTUI
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [selectedBoneId, setSelectedBoneId] = useState<string>('upper_arm.L');

  // IK Presets state
  const [presets, setPresets] = useState<IKPreset[]>(BUILTIN_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string>('idle');
  const [customPresetInput, setCustomPresetInput] = useState('');
  const [presetNotification, setPresetNotification] = useState<string | null>(null);

  // Symmetry Mirror mode state
  const [mirrorMode, setMirrorMode] = useState<'invert' | 'copy'>('invert');
  const [mirrorFeedback, setMirrorFeedback] = useState<string | null>(null);

  // Key Listener for Live Flipper Impulse Control (<50ms latency target)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'ArrowLeft') {
        e.preventDefault();
        onExecuteCommand('rig.action.trigger --rig character_001 --action left_arm_flipper', 'pressed');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'ArrowLeft') {
        e.preventDefault();
        onExecuteCommand('rig.action.trigger --rig character_001 --action left_arm_flipper', 'released');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExecuteCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onExecuteCommand(commandInput, 'pressed');
    setCommandInput('');
  };

  // Reset Rig Trigger Handler
  const handleReset = () => {
    setActivePresetId('idle');
    if (onResetRig) {
      onResetRig();
    } else {
      onExecuteCommand('rig.action.reset --rig character_001 --target all_bones', 'pressed');
    }
  };

  // Batch Export Skeletal Configuration JSON Handler
  const handleExportConfig = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      rigId: rig.id,
      rigName: rig.name,
      rootBone: rig.rootBone,
      bonesCount: Object.keys(rig.bones).length,
      bones: rig.bones,
      ikTargets: rig.ikTargets,
      presets,
      flipperState,
      provenance: {
        engine: 'Aether Engine v0.82',
        format: 'SkeletalRigScaffold_v1.0',
        timestamp: new Date().toISOString(),
        machine: 'Aether Worker CUDA RTX 4090'
      }
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aether_Skeletal_Config_${rig.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onExecuteCommand(`rig.export --format json --output ${rig.name}_config.json`, 'pressed');
  };

  const selectedBone = rig.bones[selectedBoneId] || Object.values(rig.bones)[0];

  const handleAdjustRotation = (axisIndex: number, deltaRad: number) => {
    if (!selectedBone || !onUpdateBoneRotation) return;
    const nextRot = [...selectedBone.currentRotation] as [number, number, number];
    nextRot[axisIndex] = parseFloat((nextRot[axisIndex] + deltaRad).toFixed(2));
    onUpdateBoneRotation(selectedBone.id, nextRot);
  };

  // Counterpart resolution for symmetry tool
  const getCounterpartBoneId = (id: string): string | null => {
    if (!id) return null;
    if (id.endsWith('.L')) return id.replace(/\.L$/, '.R');
    if (id.endsWith('.R')) return id.replace(/\.R$/, '.L');
    if (id.endsWith('_L')) return id.replace(/_L$/, '_R');
    if (id.endsWith('_R')) return id.replace(/_R$/, '_L');
    if (id.includes('(Left)')) return id.replace('(Left)', '(Right)');
    if (id.includes('(Right)')) return id.replace('(Right)', '(Left)');
    return null;
  };

  const counterpartBoneId = selectedBone ? getCounterpartBoneId(selectedBone.id) : null;
  const counterpartBone = counterpartBoneId ? rig.bones[counterpartBoneId] : null;

  // Mirror Selected Bone Handler
  const handleMirrorSelectedBone = () => {
    if (!selectedBone || !counterpartBoneId || !onUpdateBoneRotation) return;

    const sourceRot = selectedBone.currentRotation;
    const targetRot: [number, number, number] =
      mirrorMode === 'invert'
        ? [sourceRot[0], parseFloat((-sourceRot[1]).toFixed(2)), parseFloat((-sourceRot[2]).toFixed(2))]
        : [sourceRot[0], sourceRot[1], sourceRot[2]];

    onUpdateBoneRotation(counterpartBoneId, targetRot);

    const msg = `Mirrored ${selectedBone.id} → ${counterpartBoneId} (${mirrorMode.toUpperCase()})`;
    setMirrorFeedback(msg);
    setTimeout(() => setMirrorFeedback(null), 3000);

    onExecuteCommand(
      `rig.symmetry_mirror --source ${selectedBone.id} --target ${counterpartBoneId} --mode ${mirrorMode}`,
      'pressed'
    );
  };

  // Mirror All Symmetrical Bones Handler
  const handleMirrorAllBones = () => {
    if (!onUpdateBoneRotation) return;
    let mirroredCount = 0;

    (Object.values(rig.bones) as BoneNode[]).forEach((bone) => {
      if (bone.id.endsWith('.L') || bone.id.endsWith('_L') || bone.id.includes('(Left)')) {
        const targetId = getCounterpartBoneId(bone.id);
        if (targetId && rig.bones[targetId]) {
          const sourceRot = bone.currentRotation;
          const targetRot: [number, number, number] =
            mirrorMode === 'invert'
              ? [sourceRot[0], parseFloat((-sourceRot[1]).toFixed(2)), parseFloat((-sourceRot[2]).toFixed(2))]
              : [sourceRot[0], sourceRot[1], sourceRot[2]];
          onUpdateBoneRotation(targetId, targetRot);
          mirroredCount++;
        }
      }
    });

    const msg = `Symmetry scaffold mirrored across ${mirroredCount} paired bones!`;
    setMirrorFeedback(msg);
    setTimeout(() => setMirrorFeedback(null), 3500);

    onExecuteCommand(`rig.symmetry_mirror_all --scaffold character_001 --mode ${mirrorMode}`, 'pressed');
  };

  // Apply IK Preset
  const handleApplyPreset = (preset: IKPreset) => {
    setActivePresetId(preset.id);

    if (onUpdateBoneRotation) {
      Object.entries(preset.boneRotations).forEach(([bId, rot]) => {
        if (rig.bones[bId]) {
          onUpdateBoneRotation(bId, rot);
        }
      });
    }

    setPresetNotification(`Applied Preset: ${preset.label}`);
    setTimeout(() => setPresetNotification(null), 2500);

    onExecuteCommand(`rig.preset.apply --name ${preset.name}`, 'pressed');
  };

  // Save Custom Pose as IK Preset
  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = customPresetInput.trim();
    const nameSlug = rawName.toLowerCase().replace(/\s+/g, '_') || `custom_pose_${Date.now().toString().slice(-4)}`;
    const labelName = rawName || `Custom Pose #${presets.length + 1}`;

    const currentBonesSnapshot: Record<string, [number, number, number]> = {};
    (Object.values(rig.bones) as BoneNode[]).forEach((b) => {
      currentBonesSnapshot[b.id] = [b.currentRotation[0], b.currentRotation[1], b.currentRotation[2]];
    });

    const newPreset: IKPreset = {
      id: `custom-${Date.now()}`,
      name: nameSlug,
      label: labelName,
      description: 'User-saved custom skeletal rotation snapshot.',
      isBuiltIn: false,
      boneRotations: currentBonesSnapshot,
      ikTargets: rig.ikTargets.map((t) => ({ name: t.name, position: [...t.position] }))
    };

    setPresets((prev) => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
    setCustomPresetInput('');

    setPresetNotification(`Saved pose as preset: "${labelName}"`);
    setTimeout(() => setPresetNotification(null), 3000);

    onExecuteCommand(`rig.preset.save --name ${nameSlug}`, 'pressed');
  };

  return (
    <div
      className={`w-full h-full flex flex-col gap-6 p-6 overflow-y-auto ${
        isTUIMode ? 'bg-black text-emerald-400 font-mono selection:bg-emerald-900' : 'bg-[#0A0A0C] text-[#E0E0E6]'
      }`}
    >
      {/* Header & ASCII Banner when TUI Mode Active */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          {isTUIMode && (
            <pre className="text-[10px] leading-tight text-emerald-500 font-bold mb-2 hidden sm:block">
{`   _  _____ _____ _  _ ___ ___   _____ _  _  ___ ___ _  _ ___ 
  /_\\| ____|_   _| || | __| _ \\ | ___| \\| |/ __|_ _| \\| | __|
 / _ \\  _|   | | | __ | _||   / | _| | .\` | (_ || || .\` | _| 
/_/ \\_\\_____|_| |_||_|___|_|_\\ |_____|_|\\_|\\___|___|_|\\_|___|`}
            </pre>
          )}
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold font-mono tracking-wide text-white">TERMINAL SKELETAL CONTROL (TUI)</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Latency Target: &lt;50ms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time terminal-driven skeletal scaffold control with symmetry mirroring and named IK pose presets.
          </p>
        </div>

        {/* Header Action Buttons: Reset Rig, Export JSON, Toggle TUI Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reset Rig Button */}
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded font-mono text-xs font-bold border border-[#2A2A30] bg-[#111114] text-amber-400 hover:bg-[#1A1A1E] hover:border-amber-500/60 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Reset all bone rotations to rest positions"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Rig</span>
          </button>

          {/* Batch Export Skeletal JSON Button */}
          <button
            onClick={handleExportConfig}
            className="px-3.5 py-2 rounded font-mono text-xs font-bold border border-[#2A2A30] bg-[#111114] text-indigo-300 hover:bg-[#1A1A1E] hover:border-indigo-500/60 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Batch export current skeletal configuration JSON"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Rig JSON</span>
          </button>

          {/* TUI Mode Toggle Button */}
          <button
            onClick={onToggleTUI}
            className={`px-4 py-2 rounded font-mono text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              isTUIMode
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 shadow-md shadow-emerald-950/60'
                : 'bg-[#111114] text-blue-400 border-[#2A2A30] hover:border-blue-500'
            }`}
          >
            <Key className="w-4 h-4" />
            {isTUIMode ? 'TUI Mode: ACTIVE (CRT)' : 'Enable TUI Console Mode'}
          </button>
        </div>
      </div>

      {/* Main Console & Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Interactive Terminal & Quick Impulse Bar */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Flipper Impulse Quick Trigger Bar */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <span className="text-xs font-mono text-white font-bold">PINBALL FLIPPER QUICK TRIGGER</span>
                <p className="text-[11px] text-slate-400 font-mono">Press [SPACEBAR] or [LEFT ARROW] for instant flipper impulse</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onMouseDown={() => onExecuteCommand('rig.action.trigger --rig character_001 --action left_arm_flipper', 'pressed')}
                onMouseUp={() => onExecuteCommand('rig.action.trigger --rig character_001 --action left_arm_flipper', 'released')}
                className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase transition-all shadow-sm ${
                  flipperState !== 'released'
                    ? 'bg-blue-600 text-white shadow-blue-500/50 scale-95'
                    : 'bg-[#1A1A1E] hover:bg-slate-800 text-blue-300 border border-[#2A2A30]'
                }`}
              >
                Press Flipper ({flipperState.toUpperCase()})
              </button>
            </div>
          </div>

          {/* Terminal History Window */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] font-mono text-xs flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              <div className="text-slate-500 text-[11px] border-b border-[#2A2A30] pb-2">
                Aether Rig Socket v1.0 connected to localhost:3000. Listening for low-latency JSON RPC commands...
              </div>

              {history.map((cmd) => (
                <div key={cmd.id} className="p-2.5 rounded bg-[#111114] border border-[#2A2A30] flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">$ {cmd.command}</span>
                    <span className="text-[10px] text-slate-500">{cmd.timestamp} | {cmd.latencyMs}ms</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{cmd.resultDetails}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>Affected Bones:</span>
                    {cmd.affectedBones.map((b) => (
                      <span key={b} className="px-1.5 py-0.2 rounded bg-[#1A1A1E] text-blue-300 border border-[#2A2A30]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Command Input Bar */}
            <form onSubmit={handleSubmit} className="pt-3 border-t border-[#2A2A30] flex items-center gap-2 mt-2">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="rig.action.trigger --rig character_001 --action left_arm_flipper"
                className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder:text-slate-600"
              />
              <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold">
                Execute
              </button>
            </form>
          </div>
        </div>

        {/* Middle Column (3 cols): IK Preset Selector & Symmetry Mirror Tools */}
        <div className="lg:col-span-3 flex flex-col gap-4 font-mono">
          {/* 1. IK Preset Selector Box */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2A30] pb-2">
              <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>IK POSE PRESETS</span>
              </div>
              <span className="text-[10px] text-slate-500">{presets.length} Presets</span>
            </div>

            {/* Preset Selector Badges */}
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                        : 'bg-[#111114] text-slate-400 border-[#2A2A30] hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {isActive && <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
              {presetNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="px-2.5 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{presetNotification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Current Pose as Preset Form */}
            <form onSubmit={handleSaveCustomPreset} className="pt-2 border-t border-[#2A2A30] flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Save Current Pose Snapshot</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customPresetInput}
                  onChange={(e) => setCustomPresetInput(e.target.value)}
                  placeholder="Pose name (e.g., motel_lean)"
                  className="flex-1 px-2.5 py-1.5 rounded bg-[#111114] border border-[#2A2A30] text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-[#1A1A1E] hover:bg-[#25252b] border border-[#2A2A30] text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Symmetry Mirror Tool Box */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2A30] pb-2">
              <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                <FlipHorizontal className="w-4 h-4 text-cyan-400" />
                <span>SYMMETRY MIRROR TOOL</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">.L ↔ .R</span>
            </div>

            {/* Selected Bone & Counterpart Information */}
            <div className="p-2.5 rounded bg-[#111114] border border-[#2A2A30] flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Active Bone:</span>
                <span className="text-white font-bold">{selectedBone?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Symmetry Counterpart:</span>
                <span className={counterpartBone ? 'text-cyan-400 font-bold' : 'text-slate-500 italic'}>
                  {counterpartBoneId ? counterpartBoneId : 'No .L / .R pair'}
                </span>
              </div>
            </div>

            {/* Mirror Mode Radio Selection */}
            <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
              <span className="text-slate-400">Mirror Mode:</span>
              <div className="flex items-center gap-1 bg-[#111114] p-1 rounded border border-[#2A2A30]">
                <button
                  type="button"
                  onClick={() => setMirrorMode('invert')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    mirrorMode === 'invert' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Invert Y/Z
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('copy')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    mirrorMode === 'copy' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct Copy
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {mirrorFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="px-2.5 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{mirrorFeedback}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleMirrorSelectedBone}
                disabled={!counterpartBoneId}
                className={`w-full py-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  counterpartBoneId
                    ? 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-[#111114] text-slate-600 border-[#2A2A30] cursor-not-allowed'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Mirror Selected ({selectedBone?.id} → {counterpartBoneId || 'N/A'})</span>
              </button>

              <button
                onClick={handleMirrorAllBones}
                className="w-full py-1.5 rounded bg-[#111114] hover:bg-[#1A1A1E] border border-[#2A2A30] text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mirror All Scaffold Bones (.L ↔ .R)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Skeleton Hierarchy & Animated Joint Rotations */}
        <div className="lg:col-span-4 p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
            <span className="text-xs text-slate-300 font-bold">BONE HIERARCHY ({Object.keys(rig.bones).length})</span>
            <span className="text-[11px] text-blue-400">Root: {rig.rootBone}</span>
          </div>

          {/* Selected Bone Interactive Controller & Animated Rotations */}
          {selectedBone && (
            <motion.div
              key={selectedBone.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-3.5 rounded-lg bg-[#111114] border border-blue-500/50 flex flex-col gap-2.5 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#2A2A30] pb-2">
                <span className="text-xs font-bold text-white uppercase">{selectedBone.name}</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  {selectedBone.id}
                </span>
              </div>

              {/* Rotations Smooth Animated Display */}
              <div className="space-y-2.5 text-xs">
                {(['X-Axis', 'Y-Axis', 'Z-Axis'] as const).map((axisLabel, idx) => {
                  const currentVal = selectedBone.currentRotation[idx];
                  const minLimit = selectedBone.rotationLimits.min[idx];
                  const maxLimit = selectedBone.rotationLimits.max[idx];
                  const range = maxLimit - minLimit || 1;
                  const pct = Math.max(0, Math.min(100, ((currentVal - minLimit) / range) * 100));

                  return (
                    <div key={axisLabel} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">{axisLabel}</span>
                        <div className="flex items-center gap-2">
                          <motion.span
                            key={`${selectedBone.id}-${axisLabel}-${currentVal}`}
                            initial={{ scale: 1.12, color: '#60A5FA' }}
                            animate={{ scale: 1, color: '#E0E0E6' }}
                            transition={{ duration: 0.3 }}
                            className="font-bold font-mono"
                          >
                            {(currentVal * (180 / Math.PI)).toFixed(1)}° ({currentVal.toFixed(2)} rad)
                          </motion.span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAdjustRotation(idx, -0.15)}
                              className="px-2 py-0.5 bg-[#1A1A1E] hover:bg-[#2A2A30] text-slate-300 rounded border border-[#2A2A30] text-[11px] font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleAdjustRotation(idx, 0.15)}
                              className="px-2 py-0.5 bg-[#1A1A1E] hover:bg-[#2A2A30] text-slate-300 rounded border border-[#2A2A30] text-[11px] font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Smooth Framer Motion Progress Meter */}
                      <div className="w-full bg-[#1A1A1E] h-1.5 rounded-full overflow-hidden relative border border-[#2A2A30]">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={false}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Full Bones List with Animated Angle Badges & Transitions */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[260px] pr-1 text-xs">
            {(Object.values(rig.bones) as BoneNode[]).map((bone) => {
              const isSelected = selectedBoneId === bone.id;
              const rotXDeg = (bone.currentRotation[0] * (180 / Math.PI)).toFixed(0);
              const rotYDeg = (bone.currentRotation[1] * (180 / Math.PI)).toFixed(0);
              const rotZDeg = (bone.currentRotation[2] * (180 / Math.PI)).toFixed(0);

              return (
                <motion.div
                  key={bone.id}
                  onClick={() => setSelectedBoneId(bone.id)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  className={`p-3 rounded border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected ? 'bg-[#111114] border-blue-500/80 shadow-md' : 'bg-[#1A1A1E]/60 border-[#2A2A30] hover:bg-[#111114]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{bone.name}</span>
                    <span className="text-[10px] text-slate-500">{bone.parent ? `Parent: ${bone.parent}` : 'Root Bone'}</span>
                  </div>

                  {/* Animated Rotation Angles Badge */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-slate-500">Limits: [{bone.rotationLimits.min[0]}, {bone.rotationLimits.max[0]}]</span>
                    <motion.span
                      key={`${bone.id}-${rotXDeg}-${rotYDeg}-${rotZDeg}`}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="px-2 py-0.5 rounded bg-[#0A0A0C] border border-[#2A2A30] text-blue-300 font-mono font-semibold"
                    >
                      Rot: [{rotXDeg}°, {rotYDeg}°, {rotZDeg}°]
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
