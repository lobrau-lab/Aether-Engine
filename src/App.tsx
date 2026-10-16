import React, { useState, useEffect } from 'react';
import { Viewport3D } from './components/Viewport3D';
import { ModelGarageView } from './components/ModelGarageView';
import { TextureAnd3DPipelineView } from './components/TextureAnd3DPipelineView';
import { CharacterStudioView } from './components/CharacterStudioView';
import { TerminalRigConsole } from './components/TerminalRigConsole';
import { ScriptEngineView } from './components/ScriptEngineView';
import { WorkflowDependencyView } from './components/WorkflowDependencyView';
import { HeaderResourceMonitor } from './components/HeaderResourceMonitor';
import { CommandPalette } from './components/CommandPalette';

import {
  ModelSlotInfo,
  Asset,
  AssetState,
  CharacterState,
  SkeletonRig,
  BoneNode,
  TUICommand,
  ScriptSandbox,
  WorkflowNode
} from './types';

import {
  Box,
  Cpu,
  Layers,
  Brain,
  Terminal,
  Code,
  GitCommit,
  Radio,
  Zap,
  Activity,
  Maximize2,
  Sliders,
  Shield,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation & View Mode State
  const [activeView, setActiveView] = useState<
    'viewport' | 'model_garage' | 'pbr_pipeline' | 'character' | 'terminal_tui' | 'script_sandbox' | 'workflow'
  >('viewport');

  const [isTUIMode, setIsTUIMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [shadingMode, setShadingMode] = useState<'textured' | 'wireframe' | 'skeleton' | 'pbr_maps'>('textured');
  const [flipperState, setFlipperState] = useState<'released' | 'pressed' | 'held'>('released');

  // Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Backend Metrics & Model Garage Slots
  const [metrics, setMetrics] = useState({
    cpuUsagePct: 18.4,
    ramUsageGB: 6.2,
    ramTotalGB: 32.0,
    gpuUsagePct: 34.1,
    vramUsageGB: 8.1,
    vramTotalGB: 16.0,
    queueDepth: 0,
    activeWorkers: [
      { id: 'worker-cuda-0', name: 'Local CUDA RTX 4090', type: 'CUDA_GPU', status: 'online', vramUsedGB: 5.2 },
      { id: 'worker-mlx-0', name: 'Apple M3 Max MLX', type: 'APPLE_MLX', status: 'online', vramUsedGB: 2.9 }
    ]
  });

  const [slots, setSlots] = useState<ModelSlotInfo[]>([
    {
      id: 'image_generation',
      name: 'Image & Material Synthesizer',
      required: true,
      purpose: 'Generate PBR textures, material maps, decals and concept art',
      capabilities: ['Textures', 'PBR Maps', 'Decals', 'Texture Repair'],
      activeModel: 'gemini-3.1-flash-lite-image',
      fallbackModel: 'Stable-Diffusion-XL-Turbo',
      computeTarget: 'CUDA_GPU',
      vramRequiredGB: 4.5,
      ramRequiredGB: 8.0,
      contextLimit: 8192,
      precision: 'FP16',
      status: 'loaded',
      latencyMs: 140,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'unix_socket',
      keepWarm: true,
      workerPid: 48201
    },
    {
      id: 'three_dimensional_generation',
      name: '3D Geometry & Rig Generator',
      required: true,
      purpose: 'Generate source geometry, retopologize, UV map, and weight skins',
      capabilities: ['Mesh Synthesis', 'Topology Repair', 'UV unwrapping', 'Auto-rigging'],
      activeModel: 'Tripo3D-Local-v2',
      fallbackModel: 'ShapE-Worker-Node',
      computeTarget: 'CUDA_GPU',
      vramRequiredGB: 6.0,
      ramRequiredGB: 12.0,
      contextLimit: 16384,
      precision: 'FP16',
      status: 'loaded',
      latencyMs: 380,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'shared_memory',
      keepWarm: true,
      workerPid: 48202
    },
    {
      id: 'speech_recognition',
      name: 'Whisper VAD & STT Stream',
      required: true,
      purpose: 'Streaming speech-to-text with intent classification',
      capabilities: ['Realtime STT', 'Voice Activity Detection', 'Intent Router'],
      activeModel: 'Whisper-Large-v3-Turbo',
      fallbackModel: 'Whisper-Medium',
      computeTarget: 'CUDA_GPU',
      vramRequiredGB: 1.8,
      ramRequiredGB: 4.0,
      contextLimit: 4096,
      precision: 'INT8',
      status: 'loaded',
      latencyMs: 35,
      isolationMode: 'in_process_exception',
      ipcProtocol: 'in_process',
      keepWarm: true,
      workerPid: 0
    },
    {
      id: 'dialogue_model',
      name: 'Character Reasoning & Memory Engine',
      required: true,
      purpose: 'Control character reasoning, personality, goals, tool use, and response',
      capabilities: ['Memory Retrieval', 'Emotion State Machine', 'Tool Calling', 'Dialogue'],
      activeModel: 'gemini-3.6-flash',
      fallbackModel: 'Llama-3.3-70B-Instruct-Q4',
      computeTarget: 'EXTERNAL_API',
      vramRequiredGB: 0.0,
      ramRequiredGB: 2.0,
      contextLimit: 128000,
      precision: 'BF16',
      status: 'loaded',
      latencyMs: 180,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'websocket',
      keepWarm: true,
      workerPid: 48204
    },
    {
      id: 'text_to_speech',
      name: 'Streaming TTS & Emotion Synthesizer',
      required: true,
      purpose: 'Multi-speaker character voice generation with lip-sync output',
      capabilities: ['Streaming Audio', 'Lip Sync Visemes', 'Interruption Support'],
      activeModel: 'gemini-3.1-flash-tts-preview',
      fallbackModel: 'Piper-TTS-Local',
      computeTarget: 'CUDA_GPU',
      vramRequiredGB: 2.2,
      ramRequiredGB: 4.0,
      contextLimit: 4096,
      precision: 'FP16',
      status: 'loaded',
      latencyMs: 95,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'unix_socket',
      keepWarm: true,
      workerPid: 48205
    },
    {
      id: 'vision_model',
      name: 'Scene & Multimodal Inspector',
      required: true,
      purpose: 'Inspect screenshots, UV maps, camera feeds, and scene geometry',
      capabilities: ['Mesh Visual Inspector', 'Texture QA', 'Player Gesture Analysis'],
      activeModel: 'gemini-3.6-flash',
      fallbackModel: 'Florence-2-Large',
      computeTarget: 'EXTERNAL_API',
      vramRequiredGB: 0.0,
      ramRequiredGB: 2.0,
      contextLimit: 64000,
      precision: 'FP16',
      status: 'loaded',
      latencyMs: 210,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'websocket',
      keepWarm: false,
      workerPid: 48206
    },
    {
      id: 'music_and_sound_generation',
      name: 'Adaptive Audio Synthesizer',
      required: true,
      purpose: 'Generate ambient soundscapes, radio voice filters, and dynamic score',
      capabilities: ['SFX Generation', 'Radio Filter DSP', 'Ambient Loops'],
      activeModel: 'AudioLDM2-Local',
      fallbackModel: 'MusicGen-Small',
      computeTarget: 'CUDA_GPU',
      vramRequiredGB: 3.5,
      ramRequiredGB: 6.0,
      contextLimit: 4096,
      precision: 'FP16',
      status: 'loaded',
      latencyMs: 310,
      isolationMode: 'out_of_process_worker',
      ipcProtocol: 'unix_socket',
      keepWarm: true,
      workerPid: 48207
    }
  ]);

  // Assets Pipeline State
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'ast-001',
      name: 'Motel Desk Mahogany PBR',
      type: 'texture',
      state: 'production_ready',
      version: 1,
      createdAt: '2026-07-29T02:10:00Z',
      updatedAt: '2026-07-29T02:10:00Z',
      pbr: {
        albedoUrl: 'https://picsum.photos/seed/motel-mahogany-albedo/1024/1024',
        normalUrl: 'https://picsum.photos/seed/motel-mahogany-normal/1024/1024',
        roughnessUrl: 'https://picsum.photos/seed/motel-mahogany-rough/1024/1024',
        metallicUrl: 'https://picsum.photos/seed/motel-mahogany-metal/1024/1024'
      },
      provenance: {
        jobId: 'job-001',
        actor: 'Studio Lead',
        timestamp: '2026-07-29T02:10:00Z',
        model: 'gemini-3.1-flash-lite-image',
        version: 'v1.0',
        license: 'Game Studio License',
        seed: 482910,
        machine: 'CUDA RTX 4090',
        prompt: 'Vintage weathered mahogany motel desk with brass trim and coffee ring stains',
        settings: { resolution: '1024x1024', seamless: true }
      },
      versionHistory: [
        { version: 1, state: 'production_ready', timestamp: '2026-07-29T02:10:00Z', note: 'Initial release' }
      ]
    },
    {
      id: 'ast-002',
      name: 'Radio Host Evelyn Mesh',
      type: 'mesh_3d',
      state: 'review_required',
      version: 2,
      createdAt: '2026-07-29T02:40:00Z',
      updatedAt: '2026-07-29T03:00:00Z',
      meshData: {
        verticesCount: 14280,
        trianglesCount: 28560,
        hasHoles: false,
        nonManifoldEdges: 0,
        isRigged: true,
        uvUnwrapped: true,
        lodLevels: 3,
        scale: [1, 1, 1],
        bounds: [0.6, 1.7, 0.5]
      },
      provenance: {
        jobId: 'job-002',
        actor: 'Tripo3D Auto-Worker',
        timestamp: '2026-07-29T03:00:00Z',
        model: 'Tripo3D-Local-v2',
        version: 'v2.1',
        license: 'Commercial License',
        seed: 918231,
        machine: 'CUDA RTX 4090',
        prompt: 'Weathered female radio host Evelyn sitting behind desk wearing vintage headphones',
        settings: { polyTarget: 15000, autorig: true }
      },
      versionHistory: [
        { version: 1, state: 'generating', timestamp: '2026-07-29T02:40:00Z', note: 'Source generation' },
        { version: 2, state: 'review_required', timestamp: '2026-07-29T03:00:00Z', note: 'Mesh topology repaired' }
      ]
    }
  ]);

  // Character State
  const [character, setCharacter] = useState<CharacterState>({
    id: 'char-001',
    name: 'Evelyn Vane',
    title: 'Motel Velvet 98 Radio Host',
    identity: 'A night-shift radio announcer broadcasting from a secluded desert motel reception booth.',
    personality: 'Calm, observant, slightly melancholic, witty, protective of motel guests.',
    goals: ['Maintain midnight broadcast', 'Keep the radio tower grounded', 'Guide lost travelers'],
    needs: ['Coffee', 'Vacuum tube replacements', 'A quiet night'],
    relationships: { 'Player': 'Inquisitive traveler at desk' },
    currentEmotion: 'thoughtful',
    voiceConfig: {
      voiceId: 'gemini-3.1-flash-tts-preview',
      pitch: 0.95,
      speed: 0.98,
      tone: 'Velvet, warm, dusty'
    },
    memories: [
      { id: 'mem-1', fact: 'The radio tower lightning strike of 1989 left static on frequency 98.4.', category: 'world', approved: true, timestamp: '2026-07-29T01:00:00Z', confidence: 0.98 },
      { id: 'mem-2', fact: 'Guest Room 7 keycard has been missing since last autumn.', category: 'personal', approved: true, timestamp: '2026-07-29T01:15:00Z', confidence: 0.92 }
    ],
    perceivedWorld: ['Motel reception desk illuminated by warm lamp', 'Vintage radio glowing on counter'],
    authorizedActions: ['tune_radio', 'hand_over_keycard', 'turn_on_desk_lamp']
  });

  // Skeletal Rig State
  const [rig, setRig] = useState<SkeletonRig>({
    id: 'rig-001',
    name: 'Radio_Host_Scaffold_Rig',
    rootBone: 'root',
    bones: {
      root: { id: 'root', name: 'Root', children: ['spine'], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-0.1, -0.1, -0.1], max: [0.1, 0.1, 0.1] }, weight: 1.0 },
      spine: { id: 'spine', name: 'Spine', parent: 'root', children: ['neck', 'upper_arm.L', 'upper_arm.R'], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-0.3, -0.3, -0.3], max: [0.3, 0.3, 0.3] }, weight: 1.0 },
      neck: { id: 'neck', name: 'Neck', parent: 'spine', children: ['head'], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] }, weight: 0.8 },
      head: { id: 'head', name: 'Head', parent: 'neck', children: [], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-0.8, -0.8, -0.8], max: [0.8, 0.8, 0.8] }, weight: 0.8 },
      'upper_arm.L': { id: 'upper_arm.L', name: 'Upper Arm (Left)', parent: 'spine', children: ['forearm.L'], restRotation: [0, 0, 0.5], currentRotation: [0, 0, 0.5], rotationLimits: { min: [-1.2, -1.2, -1.2], max: [1.2, 1.2, 1.2] }, weight: 0.9 },
      'forearm.L': { id: 'forearm.L', name: 'Forearm (Left Flipper)', parent: 'upper_arm.L', children: ['hand.L'], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-1.5, -1.5, -1.5], max: [1.5, 1.5, 1.5] }, weight: 1.0 },
      'hand.L': { id: 'hand.L', name: 'Hand Flipper Blade', parent: 'forearm.L', children: [], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-2.0, -2.0, -2.0], max: [2.0, 2.0, 2.0] }, weight: 1.0 },
      'upper_arm.R': { id: 'upper_arm.R', name: 'Upper Arm (Right)', parent: 'spine', children: ['forearm.R'], restRotation: [0, 0, -0.5], currentRotation: [0, 0, -0.5], rotationLimits: { min: [-1.2, -1.2, -1.2], max: [1.2, 1.2, 1.2] }, weight: 0.9 },
      'forearm.R': { id: 'forearm.R', name: 'Forearm (Right)', parent: 'upper_arm.R', children: ['hand.R'], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-1.5, -1.5, -1.5], max: [1.5, 1.5, 1.5] }, weight: 1.0 },
      'hand.R': { id: 'hand.R', name: 'Hand (Right)', parent: 'forearm.R', children: [], restRotation: [0, 0, 0], currentRotation: [0, 0, 0], rotationLimits: { min: [-2.0, -2.0, -2.0], max: [2.0, 2.0, 2.0] }, weight: 1.0 }
    },
    ikTargets: [
      { name: 'flipper_target.L', targetBone: 'hand.L', chain: ['upper_arm.L', 'forearm.L', 'hand.L'], position: [-0.5, 1.0, 0.2] },
      { name: 'flipper_target.R', targetBone: 'hand.R', chain: ['upper_arm.R', 'forearm.R', 'hand.R'], position: [0.5, 1.0, 0.2] }
    ]
  });

  // TUI Command History
  const [tuiHistory, setTuiHistory] = useState<TUICommand[]>([
    {
      id: 'cmd-0',
      timestamp: '03:19:55',
      command: 'rig.action.trigger --rig character_001 --action left_arm_flipper',
      status: 'success',
      affectedBones: ['upper_arm.L', 'forearm.L', 'hand.L'],
      latencyMs: 8,
      inputState: 'released',
      resultDetails: 'Flipper arm at rest angle (0.0deg)'
    }
  ]);

  // Script Sandbox State
  const [script, setScript] = useState<ScriptSandbox>({
    id: 'script-001',
    filename: 'MotelDeskActor.gd',
    language: 'gdscript',
    code: `@tool
extends CharacterBody3D

signal keycard_interacted(player)

@export var host_name: String = "Evelyn Vane"
@export var flipper_impulse_strength: float = 45.0

func _ready() -> void:
    print("[Aether Engine] MotelDeskActor initialized for: ", host_name)

func trigger_flipper(pressed: bool) -> void:
    if pressed:
        $ArmRig/FlipperBone.rotate_z(deg_to_rad(-flipper_impulse_strength))
    else:
        $ArmRig/FlipperBone.rotation.z = 0.0
`,
    syntaxValid: true,
    sandboxStatus: 'clean',
    permissions: { filesystem: false, network: false, processSpawn: false, godotApi: true },
    testResults: [
        { passed: true, message: 'Syntax analysis passed without warnings', executionTimeMs: 12 },
        { passed: true, message: 'Sandbox capability permissions validated', executionTimeMs: 4 }
    ],
    version: 1
  });

  // Workflow Dependencies
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([
    { id: 'wn-1', label: '1. Character Concept Art', category: 'offline_asset', status: 'completed', dependencies: [], modelUsed: 'gemini-3.1-flash-lite-image', resourceEstMb: 512 },
    { id: 'wn-2', label: '2. 3D Source Mesh Generation', category: 'offline_asset', status: 'completed', dependencies: ['wn-1'], modelUsed: 'Tripo3D-Local-v2', resourceEstMb: 2048 },
    { id: 'wn-3', label: '3. Topology Inspection & Repair', category: 'offline_asset', status: 'completed', dependencies: ['wn-2'], modelUsed: 'MeshFixer-Worker', resourceEstMb: 1024 },
    { id: 'wn-4', label: '4. UV Unwrapping & Retopology', category: 'offline_asset', status: 'completed', dependencies: ['wn-3'], modelUsed: 'AutoUVEngine', resourceEstMb: 1024 },
    { id: 'wn-5', label: '5. Seamless PBR Map Synthesis', category: 'offline_asset', status: 'completed', dependencies: ['wn-4'], modelUsed: 'gemini-3.1-flash-lite-image', resourceEstMb: 1536 },
    { id: 'wn-6', label: '6. Skeleton Scaffold & Skin Weights', category: 'offline_asset', status: 'completed', dependencies: ['wn-5'], modelUsed: 'AutoRig-Worker', resourceEstMb: 1024 },
    { id: 'wn-7', label: '7. Voice Profile & TTS Lip-Sync', category: 'character_inference', status: 'completed', dependencies: ['wn-6'], modelUsed: 'gemini-3.1-flash-tts-preview', resourceEstMb: 512 },
    { id: 'wn-8', label: '8. Memory Profile & Reasoning Engine', category: 'character_inference', status: 'completed', dependencies: ['wn-7'], modelUsed: 'gemini-3.6-flash', resourceEstMb: 256 },
    { id: 'wn-9', label: '9. Motel Scene Placement & Approval', category: 'gameplay_runtime', status: 'needs_approval', dependencies: ['wn-8'], modelUsed: 'Godot 4.6 Engine', resourceEstMb: 1024 }
  ]);

  // Handle Terminal Command Execution & Rig Reset
  const handleResetRig = () => {
    setRig((prev) => {
      const updatedBones: Record<string, BoneNode> = {};
      for (const key in prev.bones) {
        const b = prev.bones[key];
        updatedBones[key] = {
          ...b,
          currentRotation: [...b.restRotation] as [number, number, number]
        };
      }
      return { ...prev, bones: updatedBones };
    });

    const cmdLog: TUICommand = {
      id: `cmd-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      command: 'rig.action.reset --rig character_001 --target all_bones',
      status: 'success',
      affectedBones: Object.keys(rig.bones),
      latencyMs: 3,
      inputState: 'pressed',
      resultDetails: 'Returned all bone rotations to rest positions defined in rig state.'
    };
    setTuiHistory((prev) => [cmdLog, ...prev]);
  };

  const handleUpdateBoneRotation = (boneId: string, newRot: [number, number, number]) => {
    setRig((prev) => {
      if (!prev.bones[boneId]) return prev;
      return {
        ...prev,
        bones: {
          ...prev.bones,
          [boneId]: {
            ...prev.bones[boneId],
            currentRotation: newRot
          }
        }
      };
    });
  };

  const handleExecuteCommand = async (cmd: string, inputState: 'pressed' | 'held' | 'released') => {
    setFlipperState(inputState);

    // Update Flipper Bone rotation in rig state
    if (cmd.includes('left_arm_flipper')) {
      const flipperZRot = inputState === 'pressed' || inputState === 'held' ? -0.85 : 0.0;
      handleUpdateBoneRotation('forearm.L', [0, 0, flipperZRot]);
      handleUpdateBoneRotation('hand.L', [0, 0, flipperZRot * 1.2]);
    }

    try {
      const res = await fetch('/api/terminal/execute-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, input_state: inputState })
      });
      const data = await res.json();
      setTuiHistory((prev) => [data, ...prev]);
    } catch (err) {
      // Fallback offline handler
      const fallbackCmd: TUICommand = {
        id: `cmd-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: cmd,
        status: 'success',
        affectedBones: ['upper_arm.L', 'forearm.L', 'hand.L'],
        latencyMs: 6,
        inputState,
        resultDetails: `Executed '${cmd}' on local rig Scaffold (State: ${inputState.toUpperCase()})`
      };
      setTuiHistory((prev) => [fallbackCmd, ...prev]);
    }
  };

  // Handle PBR Material Generation
  const handleGeneratePBR = async (promptStr: string) => {
    try {
      const res = await fetch('/api/asset-pipeline/generate-pbr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptStr })
      });
      const data = await res.json();

      const newAsset: Asset = {
        id: data.jobId || `job-pbr-${Date.now()}`,
        name: data.materialName || `${promptStr.slice(0, 24)} Material`,
        type: 'texture',
        state: 'review_required',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pbr: data.pbr || {
          albedoUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-albedo/1024/1024`,
          normalUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-normal/1024/1024`,
          roughnessUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-rough/1024/1024`,
          metallicUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-metal/1024/1024`
        },
        provenance: data.provenance || {
          jobId: `job-pbr-${Date.now()}`,
          actor: 'Offline Procedural Engine',
          timestamp: new Date().toISOString(),
          model: 'Local-PBR-Synthesizer',
          version: 'v1.4.2',
          license: 'Commercial License',
          seed: Math.floor(Math.random() * 999999),
          machine: 'CUDA RTX 4090',
          prompt: promptStr,
          settings: { resolution: '1024x1024', seamless: true }
        },
        versionHistory: [
          { version: 1, state: 'review_required', timestamp: new Date().toISOString(), note: 'Generated via PBR Synthesizer' }
        ]
      };

      setAssets((prev) => [newAsset, ...prev]);
    } catch (err) {
      console.error('Failed to generate PBR material:', err);
      const fallbackAsset: Asset = {
        id: `job-pbr-${Date.now()}`,
        name: `${promptStr.slice(0, 24)} PBR Material`,
        type: 'texture',
        state: 'review_required',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pbr: {
          albedoUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-albedo/1024/1024`,
          normalUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-normal/1024/1024`,
          roughnessUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-rough/1024/1024`,
          metallicUrl: `https://picsum.photos/seed/${encodeURIComponent(promptStr)}-metal/1024/1024`
        },
        provenance: {
          jobId: `job-pbr-${Date.now()}`,
          actor: 'Offline Procedural Engine',
          timestamp: new Date().toISOString(),
          model: 'Local-PBR-Synthesizer',
          version: 'v1.4.2',
          license: 'Commercial License',
          seed: Math.floor(Math.random() * 999999),
          machine: 'CUDA RTX 4090',
          prompt: promptStr,
          settings: { resolution: '1024x1024', seamless: true }
        },
        versionHistory: [
          { version: 1, state: 'review_required', timestamp: new Date().toISOString(), note: 'Generated via Local Synthesizer' }
        ]
      };
      setAssets((prev) => [fallbackAsset, ...prev]);
    }
  };

  // Handle Script Generation
  const handleGenerateScript = async (promptStr: string, lang: 'gdscript' | 'typescript' | 'lua') => {
    try {
      const res = await fetch('/api/script-engine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptStr, language: lang, currentCode: script.code })
      });
      const data = await res.json();

      setScript((prev) => ({
        ...prev,
        filename: data.filename || prev.filename,
        code: data.code || prev.code,
        version: prev.version + 1,
        testResults: [
          { passed: data.syntaxValid, message: data.summary || 'Generated successfully', executionTimeMs: 14 }
        ]
      }));
    } catch (err) {
      console.error('Failed to generate script:', err);
    }
  };

  // Handle Character Dialogue Reasoner
  const handleSendDialogue = async (userMsg: string) => {
    try {
      const res = await fetch('/api/character/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, userMessage: userMsg, memories: character.memories })
      });
      const data = await res.json();

      if (data.emotion) {
        setCharacter((prev) => ({
          ...prev,
          currentEmotion: data.emotion as any
        }));
      }

      if (data.newMemoryCandidates && data.newMemoryCandidates.length > 0) {
        const newMemories = data.newMemoryCandidates.map((m: any, idx: number) => ({
          id: `mem-${Date.now()}-${idx}`,
          fact: m.fact,
          category: m.category || 'personal',
          approved: false,
          timestamp: new Date().toISOString(),
          confidence: 0.95
        }));

        setCharacter((prev) => ({
          ...prev,
          memories: [...prev.memories, ...newMemories]
        }));
      }
    } catch (err) {
      console.error('Failed to process character dialogue:', err);
    }
  };

  // Memory Approval / Deletion handlers
  const handleApproveMemory = (memId: string) => {
    setCharacter((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === memId ? { ...m, approved: true } : m))
    }));
  };

  const handleDeleteMemory = (memId: string) => {
    setCharacter((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== memId)
    }));
  };

  const handleAddMemory = (fact: string, category: 'world' | 'personal' | 'relationship') => {
    const newMem = {
      id: `mem-${Date.now()}`,
      fact,
      category,
      approved: true,
      timestamp: new Date().toISOString(),
      confidence: 1.0
    };
    setCharacter((prev) => ({
      ...prev,
      memories: [...prev.memories, newMem]
    }));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0A0A0C] text-[#E0E0E6] font-sans overflow-hidden select-none">
      {/* Top Application Header */}
      <header className="h-12 bg-[#111114] border-b border-[#2A2A30] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center shadow-sm shadow-blue-500/30">
              <div className="w-2.5 h-2.5 bg-white rotate-45"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-white">AETHER ENGINE</span>
              <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 uppercase tracking-wider">
                V0.82.ALPHA
              </span>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-[#2A2A30] hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="px-2 py-0.5 rounded hover:bg-[#1A1A1E] hover:text-white cursor-pointer transition-colors">File</span>
            <span className="px-2 py-0.5 rounded hover:bg-[#1A1A1E] hover:text-white cursor-pointer transition-colors">Edit</span>
            <span className="px-2 py-0.5 rounded hover:bg-[#1A1A1E] hover:text-white cursor-pointer transition-colors">View</span>
            <span className="px-2 py-0.5 rounded hover:bg-[#1A1A1E] hover:text-white cursor-pointer transition-colors">Generate</span>
            <span className="px-2 py-0.5 rounded hover:bg-[#1A1A1E] hover:text-white cursor-pointer transition-colors">Bake</span>
          </div>
        </div>

        {/* Studio View Navigation Buttons */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#0D0D10] p-1 rounded-lg border border-[#2A2A30] text-xs font-mono">
          <button
            onClick={() => setActiveView('viewport')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'viewport' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> Viewport
          </button>
          <button
            onClick={() => setActiveView('model_garage')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'model_garage' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Model Garage
          </button>
          <button
            onClick={() => setActiveView('pbr_pipeline')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'pbr_pipeline' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Offline Studio
          </button>
          <button
            onClick={() => setActiveView('character')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'character' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Character
          </button>
          <button
            onClick={() => setActiveView('terminal_tui')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'terminal_tui' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Skeletal TUI
          </button>
          <button
            onClick={() => setActiveView('script_sandbox')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'script_sandbox' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Script Sandbox
          </button>
          <button
            onClick={() => setActiveView('workflow')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeView === 'workflow' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" /> Workflow
          </button>
        </nav>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* Floating Sparkline Resource Monitor */}
          <HeaderResourceMonitor metrics={metrics} />

          {/* Command Palette Trigger Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-2.5 py-1 bg-[#1A1A1E] hover:bg-[#25252b] border border-[#2A2A30] text-slate-300 hover:text-white rounded text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Open Command Palette (Cmd+K)"
          >
            <span className="text-[10px] bg-[#0D0D10] px-1 py-0.2 rounded border border-[#2A2A30] text-blue-400 font-bold">⌘K</span>
            <span className="hidden sm:inline">Palette</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#1A1A1E] rounded border border-[#2A2A30] text-[10px] text-emerald-400 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            NEURAL SYNC
          </div>
          <button
            onClick={() => setIsTUIMode(!isTUIMode)}
            className={`px-2.5 py-1 rounded font-mono text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isTUIMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-sm'
                : 'bg-[#1A1A1E] text-slate-300 border-[#2A2A30] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> TUI Mode
          </button>
        </div>
      </header>

      {/* Mobile/Compact Viewport Tabs Bar */}
      <div className="xl:hidden flex items-center gap-1 bg-[#0D0D10] border-b border-[#2A2A30] p-1 overflow-x-auto text-xs font-mono shrink-0">
        {(['viewport', 'model_garage', 'pbr_pipeline', 'character', 'terminal_tui', 'script_sandbox', 'workflow'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-2.5 py-1 rounded capitalize whitespace-nowrap ${
              activeView === view ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {view.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {activeView === 'viewport' && (
          <div className="w-full h-full p-4 flex flex-col gap-4">
            <div className="flex-1 relative">
              <Viewport3D
                shadingMode={shadingMode}
                flipperState={flipperState}
                characterEmotion={character.currentEmotion}
                isSpeaking={false}
              />
            </div>
            {/* Shading & Control Bar */}
            <div className="h-12 bg-[#111114] rounded-lg border border-[#2A2A30] px-4 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Shading Mode:</span>
                {(['textured', 'wireframe', 'skeleton', 'pbr_maps'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setShadingMode(m)}
                    className={`px-2.5 py-1 rounded uppercase font-semibold transition-all ${
                      shadingMode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#1A1A1E]'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onMouseDown={() => handleExecuteCommand('rig.action.trigger --action left_arm_flipper', 'pressed')}
                  onMouseUp={() => handleExecuteCommand('rig.action.trigger --action left_arm_flipper', 'released')}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs transition-all shadow-md shadow-blue-950/50"
                >
                  Trigger Arm Flipper
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'model_garage' && (
          <ModelGarageView
            slots={slots}
            metrics={metrics}
            onBenchmarkSlot={(slotId) => {
              setSlots((prev) =>
                prev.map((s) => (s.id === slotId ? { ...s, latencyMs: Math.floor(Math.random() * 50 + 20) } : s))
              );
            }}
            onUpdateSlotModel={(slotId, modelName) => {
              setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, activeModel: modelName } : s)));
            }}
          />
        )}

        {activeView === 'pbr_pipeline' && (
          <TextureAnd3DPipelineView
            assets={assets}
            onGeneratePBR={handleGeneratePBR}
            onUpdateAssetState={(assetId, newState) => {
              setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, state: newState } : a)));
            }}
            onRollbackAsset={(assetId) => {
              setAssets((prev) =>
                prev.map((a) => (a.id === assetId ? { ...a, version: Math.max(1, a.version - 1), state: 'approved' } : a))
              );
            }}
          />
        )}

        {activeView === 'character' && (
          <CharacterStudioView
            character={character}
            onSendDialogue={handleSendDialogue}
            onApproveMemory={handleApproveMemory}
            onDeleteMemory={handleDeleteMemory}
            onAddMemory={handleAddMemory}
            isSpeaking={false}
          />
        )}

        {activeView === 'terminal_tui' && (
          <TerminalRigConsole
            rig={rig}
            history={tuiHistory}
            flipperState={flipperState}
            onExecuteCommand={handleExecuteCommand}
            onResetRig={handleResetRig}
            onUpdateBoneRotation={handleUpdateBoneRotation}
            isTUIMode={isTUIMode}
            onToggleTUI={() => setIsTUIMode(!isTUIMode)}
          />
        )}

        {activeView === 'script_sandbox' && (
          <ScriptEngineView
            script={script}
            onGenerateScript={handleGenerateScript}
            onApplyScript={() => {
              alert('Script successfully hot-reloaded into Godot 4.6 runtime actor.');
            }}
            onRollbackScript={() => {
              setScript((prev) => ({ ...prev, version: Math.max(1, prev.version - 1) }));
            }}
          />
        )}

        {activeView === 'workflow' && (
          <WorkflowDependencyView
            nodes={workflowNodes}
            assets={assets}
            onRollbackAsset={(assetId) => {
              setAssets((prev) =>
                prev.map((a) => (a.id === assetId ? { ...a, version: Math.max(1, a.version - 1) } : a))
              );
            }}
          />
        )}
      </main>

      {/* Global Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectView={(v) => setActiveView(v)}
        onRefreshPipeline={() => {
          setWorkflowNodes((prev) =>
            prev.map((n) => ({ ...n, timestamp: new Date().toISOString() }))
          );
        }}
        onForceWarmModels={() => {
          setSlots((prev) => prev.map((s) => ({ ...s, status: 'loaded', keepWarm: true })));
        }}
        onTriggerFlipper={() => {
          handleExecuteCommand('rig.action.trigger --action left_arm_flipper', 'pressed');
          setTimeout(() => setFlipperState('released'), 300);
        }}
        onToggleTuiMode={() => setIsTUIMode(!isTUIMode)}
        onCycleShadingMode={() => {
          const modes = ['textured', 'wireframe', 'skeleton', 'pbr_maps'] as const;
          const nextIdx = (modes.indexOf(shadingMode) + 1) % modes.length;
          setShadingMode(modes[nextIdx]);
        }}
        onClearMemoryCache={() => {
          setMetrics((prev) => ({ ...prev, vramUsageGB: 2.1, ramUsageGB: 3.4 }));
        }}
        onExportProvenance={() => {
          const jsonStr = JSON.stringify(assets.map((a) => a.provenance), null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Aether_Provenance_Audit_${Date.now()}.json`;
          a.click();
        }}
      />
    </div>
  );
}
