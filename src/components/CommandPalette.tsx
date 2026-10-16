import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Box,
  Cpu,
  Layers,
  Brain,
  Terminal,
  Code,
  GitCommit,
  RefreshCw,
  RotateCcw,
  Zap,
  Activity,
  Command,
  X,
  Shield,
  Eye,
  Trash2,
  Download
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (
    view: 'viewport' | 'model_garage' | 'pbr_pipeline' | 'character' | 'terminal_tui' | 'script_sandbox' | 'workflow'
  ) => void;
  onRefreshPipeline: () => void;
  onForceWarmModels: () => void;
  onTriggerFlipper: () => void;
  onToggleTuiMode: () => void;
  onCycleShadingMode: () => void;
  onClearMemoryCache: () => void;
  onExportProvenance: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Engine Actions' | 'Diagnostics & Memory';
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onRefreshPipeline,
  onForceWarmModels,
  onTriggerFlipper,
  onToggleTuiMode,
  onCycleShadingMode,
  onClearMemoryCache,
  onExportProvenance
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navigation Views
    {
      id: 'nav-viewport',
      category: 'Navigation',
      label: 'Switch to 3D Viewport',
      description: 'Open Godot real-time scene viewport & skeletal armature',
      shortcut: 'Alt+1',
      icon: <Box className="w-4 h-4 text-blue-400" />,
      action: () => {
        onSelectView('viewport');
        onClose();
      }
    },
    {
      id: 'nav-model-garage',
      category: 'Navigation',
      label: 'Switch to Model Garage',
      description: 'Worker engine, isolated IPC slot processes, hardware compute',
      shortcut: 'Alt+2',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectView('model_garage');
        onClose();
      }
    },
    {
      id: 'nav-pbr-pipeline',
      category: 'Navigation',
      label: 'Switch to Offline Studio (PBR & Batch Queue)',
      description: 'PBR texture synthesizer, material maps, and batch generation queue',
      shortcut: 'Alt+3',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSelectView('pbr_pipeline');
        onClose();
      }
    },
    {
      id: 'nav-character',
      category: 'Navigation',
      label: 'Switch to Character Intelligence',
      description: 'Voice reasoning engine, Whisper VAD, TTS, emotional trajectory',
      shortcut: 'Alt+4',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      action: () => {
        onSelectView('character');
        onClose();
      }
    },
    {
      id: 'nav-tui-console',
      category: 'Navigation',
      label: 'Switch to Skeletal Terminal Console',
      description: 'Interactive CLI for bone transforms, inverse kinematics & actions',
      shortcut: 'Alt+5',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectView('terminal_tui');
        onClose();
      }
    },
    {
      id: 'nav-script-sandbox',
      category: 'Navigation',
      label: 'Switch to GDScript / TS Sandbox',
      description: 'Sandboxed code generator, syntax checker, security permissions',
      shortcut: 'Alt+6',
      icon: <Code className="w-4 h-4 text-blue-400" />,
      action: () => {
        onSelectView('script_sandbox');
        onClose();
      }
    },
    {
      id: 'nav-workflow',
      category: 'Navigation',
      label: 'Switch to Workflow Graph',
      description: 'Dependency DAG nodes, version provenance rollback, asset tree',
      shortcut: 'Alt+7',
      icon: <GitCommit className="w-4 h-4 text-rose-400" />,
      action: () => {
        onSelectView('workflow');
        onClose();
      }
    },

    // Engine Actions
    {
      id: 'act-refresh-pipeline',
      category: 'Engine Actions',
      label: 'Refresh Pipeline & Assets',
      description: 'Re-sync workflow nodes, asset states, and local textures',
      icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
      action: () => {
        onRefreshPipeline();
        onClose();
      }
    },
    {
      id: 'act-force-warm-models',
      category: 'Engine Actions',
      label: 'Force Warm All Models',
      description: 'Pre-warm all model slots to bypass cold start inference delay',
      icon: <RotateCcw className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onForceWarmModels();
        onClose();
      }
    },
    {
      id: 'act-trigger-flipper',
      category: 'Engine Actions',
      label: 'Trigger Arm Flipper Kinematic Action',
      description: 'Execute left arm flipper rotational impulse in Godot runtime',
      shortcut: 'Space',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => {
        onTriggerFlipper();
        onClose();
      }
    },
    {
      id: 'act-toggle-tui',
      category: 'Engine Actions',
      label: 'Toggle Skeletal TUI Console Mode',
      description: 'Toggle persistent terminal command bar at bottom of studio',
      icon: <Terminal className="w-4 h-4 text-emerald-300" />,
      action: () => {
        onToggleTuiMode();
        onClose();
      }
    },
    {
      id: 'act-cycle-shading',
      category: 'Engine Actions',
      label: 'Cycle Viewport Shading Mode',
      description: 'Switch between Textured, Wireframe, Skeleton, and PBR Maps',
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      action: () => {
        onCycleShadingMode();
        onClose();
      }
    },

    // Diagnostics & Memory
    {
      id: 'diag-clear-cache',
      category: 'Diagnostics & Memory',
      label: 'Clear Memory & VRAM Cache',
      description: 'Evict transient model buffers and flush system memory cache',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      action: () => {
        onClearMemoryCache();
        onClose();
      }
    },
    {
      id: 'diag-export-provenance',
      category: 'Diagnostics & Memory',
      label: 'Export Asset Provenance JSON Log',
      description: 'Download structured C2PA/AI provenance audit log for studio assets',
      icon: <Download className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onExportProvenance();
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0D0D10] border border-[#2A2A30] rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs text-[#E0E0E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-[#2A2A30] flex items-center gap-3 bg-[#111114]">
          <Command className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search studio views... (Esc to cancel)"
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500 font-sans"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1A1A1E]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No matching commands found</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/50 text-white'
                      : 'bg-[#111114]/50 border-transparent text-slate-300 hover:bg-[#111114]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#1A1A1E] border border-[#2A2A30]">{cmd.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{cmd.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A1A1E] text-slate-400 uppercase border border-[#2A2A30]">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cmd.description}</p>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1E] text-slate-400 border border-[#2A2A30] shrink-0 font-mono">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-[#2A2A30] bg-[#111114] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-slate-200">↑↓</strong> Navigate
            </span>
            <span>
              <strong className="text-slate-200">↵</strong> Select
            </span>
            <span>
              <strong className="text-slate-200">Esc</strong> Close
            </span>
          </div>
          <span className="text-blue-400 font-semibold">AETHER ENGINE COMMAND PALETTE</span>
        </div>
      </div>
    </div>
  );
};
