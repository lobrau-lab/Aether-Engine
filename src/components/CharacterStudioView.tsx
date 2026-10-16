import React, { useState } from 'react';
import { CharacterState, CharacterMemory } from '../types';
import { Mic, MicOff, Volume2, Send, Brain, Database, Check, X, Search, Sparkles, MessageSquare, ShieldCheck, Smile } from 'lucide-react';
import { EmotionalTrajectoryChart } from './EmotionalTrajectoryChart';

interface CharacterStudioViewProps {
  character: CharacterState;
  onSendDialogue: (userMsg: string) => Promise<void>;
  onApproveMemory: (memoryId: string) => void;
  onDeleteMemory: (memoryId: string) => void;
  onAddMemory: (fact: string, category: 'world' | 'personal' | 'relationship') => void;
  isSpeaking: boolean;
}

export const CharacterStudioView: React.FC<CharacterStudioViewProps> = ({
  character,
  onSendDialogue,
  onApproveMemory,
  onDeleteMemory,
  onAddMemory,
  isSpeaking
}) => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [memorySearch, setMemorySearch] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newCategory, setNewCategory] = useState<'world' | 'personal' | 'relationship'>('world');
  const [micActive, setMicActive] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<{ sender: 'player' | 'character'; text: string; emotion?: string }[]>([
    { sender: 'character', text: "Welcome to Motel Velvet 98... mind the static on line three. Who's asking?", emotion: 'thoughtful' }
  ]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setDialogueHistory((prev) => [...prev, { sender: 'player', text: msg }]);
    setIsProcessing(true);

    try {
      await onSendDialogue(msg);
      // Mock updated character response appended in App state or here
      setDialogueHistory((prev) => [
        ...prev,
        { sender: 'character', text: `[${character.currentEmotion.toUpperCase()}] I remember when the highway used to bring travelers through at midnight...`, emotion: character.currentEmotion }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddMemory(newFact, newCategory);
    setNewFact('');
  };

  const filteredMemories = character.memories.filter((m) =>
    m.fact.toLowerCase().includes(memorySearch.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto bg-[#0A0A0C] text-[#E0E0E6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-wide text-white">CHARACTER INTELLIGENCE</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              Voice & Memory Studio
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Character reasoning engine, memory inspection, Whisper VAD STT stream, and TTS lip-sync synthesizer.
          </p>
        </div>

        {/* Emotion Indicator Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111114] border border-[#2A2A30] text-xs font-mono">
            <Smile className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Current Emotion:</span>
            <span className="text-blue-300 font-semibold uppercase">{character.currentEmotion}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dialogue Testing Room & Voice Input */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-blue-300 text-base">
                EV
              </div>
              <div>
                <h2 className="text-sm font-bold font-mono text-white">{character.name}</h2>
                <p className="text-xs text-slate-400">{character.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-2 rounded border text-xs font-mono flex items-center gap-2 transition-all ${
                  micActive
                    ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                    : 'bg-[#1A1A1E] border-[#2A2A30] text-slate-300 hover:text-white'
                }`}
              >
                {micActive ? <Mic className="w-4 h-4 text-red-400" /> : <MicOff className="w-4 h-4" />}
                {micActive ? 'VAD Voice Stream Active' : 'Enable Voice Mic'}
              </button>
            </div>
          </div>

          {/* Dialogue Chat Box */}
          <div className="p-4 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col h-[380px]">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {dialogueHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${
                    item.sender === 'player' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 mb-1">
                    {item.sender === 'player' ? 'PLAYER' : `${character.name.toUpperCase()} [${item.emotion || 'CALM'}]`}
                  </span>
                  <div
                    className={`p-3 rounded text-xs font-sans leading-relaxed ${
                      item.sender === 'player'
                        ? 'bg-blue-600/30 border border-blue-500/40 text-blue-100 rounded-tr-none'
                        : 'bg-[#111114] border border-[#2A2A30] text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-3 border-t border-[#2A2A30] flex items-center gap-2 mt-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Speak or type to ${character.name}...`}
                className="flex-1 px-4 py-2 rounded bg-[#1A1A1E] border border-[#2A2A30] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing}
                className="p-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* D3 Emotional Trajectory Chart Component */}
          <EmotionalTrajectoryChart dialogueHistory={dialogueHistory} currentEmotion={character.currentEmotion} />
        </div>

        {/* Right Col: Memory Inspector & Approval Engine */}
        <div className="p-5 rounded-lg bg-[#0D0D10] border border-[#2A2A30] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold font-mono text-white">MEMORY INSPECTOR</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{character.memories.length} Facts</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              placeholder="Search approved facts & memories..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-xs font-mono text-white focus:outline-none"
            />
          </div>

          {/* Memory List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[260px] pr-1">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-3 rounded bg-[#111114] border border-[#2A2A30] flex items-start justify-between gap-2 text-xs font-mono"
              >
                <div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                    mem.category === 'world' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {mem.category}
                  </span>
                  <p className="text-slate-300 mt-1">{mem.fact}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!mem.approved && (
                    <button
                      onClick={() => onApproveMemory(mem.id)}
                      className="p-1 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50"
                      title="Approve Memory"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    className="p-1 rounded bg-red-600/30 text-red-300 hover:bg-red-600/50"
                    title="Delete Memory"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Fact Form */}
          <form onSubmit={handleCreateMemory} className="pt-3 border-t border-[#2A2A30] flex flex-col gap-2">
            <span className="text-[11px] font-mono text-slate-400">Add Character Fact:</span>
            <input
              type="text"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="e.g. Host lost radio tower signal in 1989 storm..."
              className="px-3 py-1.5 rounded bg-[#1A1A1E] border border-[#2A2A30] text-xs font-mono text-white focus:outline-none"
            />
            <button
              type="submit"
              className="py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-all"
            >
              Commit Fact to Memory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
