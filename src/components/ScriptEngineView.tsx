import React, { useState } from 'react';
import { ScriptSandbox } from '../types';
import { Code, Sparkles, Shield, Play, RotateCcw, AlertTriangle, CheckCircle, FileCode, Check, X } from 'lucide-react';

interface ScriptEngineViewProps {
  script: ScriptSandbox;
  onGenerateScript: (prompt: string, language: 'gdscript' | 'typescript' | 'lua') => Promise<void>;
  onApplyScript: () => void;
  onRollbackScript: () => void;
}

export const ScriptEngineView: React.FC<ScriptEngineViewProps> = ({
  script,
  onGenerateScript,
  onApplyScript,
  onRollbackScript
}) => {
  const [prompt, setPrompt] = useState('Create a motel reception desk interactive keycard pickup script with GDScript');
  const [language, setLanguage] = useState<'gdscript' | 'typescript' | 'lua'>('gdscript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      await onGenerateScript(prompt, language);
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
            <h1 className="text-xl font-bold font-mono tracking-wide text-white">SCRIPT SANDBOX ENGINE</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Godot 4.6 GDScript & TS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Natural-language script generation, syntax analysis, sandbox security permissions, and hot-reload diffing.
          </p>
        </div>

        {/* Sandbox Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111114] border border-[#2A2A30] text-xs font-mono">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Sandbox Isolation:</span>
          <span className="text-emerald-400 font-semibold uppercase">{script.sandboxStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prompt & Code Editor / Diff Inspector */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Prompt Bar */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                Natural Language Gameplay Script Request
              </span>
              <div className="flex items-center gap-1 bg-[#1A1A1E] p-1 rounded border border-[#2A2A30] text-xs font-mono">
                {(['gdscript', 'typescript', 'lua'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-0.5 rounded uppercase ${
                      language === lang ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe gameplay script logic..."
                className="flex-1 px-4 py-2.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating Script...' : 'Generate Script'}
              </button>
            </div>
          </div>

          {/* Code Viewer / Diff Window */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A30] font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <FileCode className="w-4 h-4 text-blue-400" />
                {script.filename} (v{script.version})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="px-2.5 py-1 rounded bg-[#1A1A1E] hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-[#2A2A30]"
                >
                  {showDiff ? 'Hide Diff' : 'View Code Diff'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded bg-[#111114] border border-[#2A2A30] font-mono text-xs overflow-x-auto h-[320px] text-slate-200">
              <pre className="leading-relaxed">{script.code}</pre>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2A2A30]">
              <button
                onClick={onApplyScript}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Hot-Reload & Apply to Game Scene
              </button>
              <button
                onClick={onRollbackScript}
                className="px-3 py-2 rounded bg-[#1A1A1E] hover:bg-slate-800 text-slate-300 text-xs font-mono border border-[#2A2A30] transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rollback Version
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Security Permissions & Test Console */}
        <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-5 font-mono text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-3">
              Sandbox Capability Permissions
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#111114] border border-[#2A2A30]">
                <span className="text-slate-300">Godot Engine API Access</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Allowed</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#111114] border border-[#2A2A30]">
                <span className="text-slate-300">Host Filesystem Write</span>
                <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Denied</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#111114] border border-[#2A2A30]">
                <span className="text-slate-300">External Network Sockets</span>
                <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Denied</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#111114] border border-[#2A2A30]">
                <span className="text-slate-300">Process Spawn Privileges</span>
                <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Denied</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-2">Automated Test Execution</span>
            <div className="space-y-2">
              {script.testResults.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#111114] border border-[#2A2A30] flex items-center justify-between">
                  <span className="text-slate-300">{t.message}</span>
                  <span className="text-emerald-400 font-bold">{t.executionTimeMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
