export type ComputeTarget = 'CUDA_GPU' | 'CPU' | 'APPLE_MLX' | 'REMOTE_WORKER' | 'EXTERNAL_API';

export type ModelSlotId = 
  | 'image_generation'
  | 'three_dimensional_generation'
  | 'speech_recognition'
  | 'dialogue_model'
  | 'text_to_speech'
  | 'vision_model'
  | 'music_and_sound_generation';

export interface ModelSlotInfo {
  id: ModelSlotId;
  name: string;
  required: boolean;
  purpose: string;
  capabilities: string[];
  activeModel: string;
  fallbackModel: string;
  computeTarget: ComputeTarget;
  vramRequiredGB: number;
  ramRequiredGB: number;
  contextLimit: number;
  precision: string;
  status: 'idle' | 'warming_up' | 'loaded' | 'inferring' | 'error' | 'unloaded';
  latencyMs: number;
  isolationMode?: 'out_of_process_worker' | 'in_process_exception';
  ipcProtocol?: 'websocket' | 'unix_socket' | 'shared_memory' | 'grpc' | 'in_process';
  keepWarm?: boolean;
  workerPid?: number;
}

export type AssetState = 
  | 'imported'
  | 'queued'
  | 'generating'
  | 'generated'
  | 'processing'
  | 'validating'
  | 'review_required'
  | 'approved'
  | 'committed'
  | 'production_ready'
  | 'rejected'
  | 'failed'
  | 'rolled_back'
  | 'archived';

export interface AssetProvenance {
  jobId: string;
  actor: string;
  timestamp: string;
  model: string;
  version: string;
  license: string;
  seed: number;
  machine: string;
  prompt: string;
  settings: Record<string, any>;
}

export interface PBRMaterial {
  albedoUrl?: string;
  normalUrl?: string;
  roughnessUrl?: string;
  metallicUrl?: string;
  heightUrl?: string;
  aoUrl?: string;
  emissionUrl?: string;
}

export interface Mesh3DData {
  verticesCount: number;
  trianglesCount: number;
  hasHoles: boolean;
  nonManifoldEdges: number;
  isRigged: boolean;
  uvUnwrapped: boolean;
  lodLevels: number;
  scale: [number, number, number];
  bounds: [number, number, number];
}

export interface Asset {
  id: string;
  name: string;
  type: 'texture' | 'mesh_3d' | 'voice' | 'script' | 'animation' | 'sound';
  state: AssetState;
  pbr?: PBRMaterial;
  meshData?: Mesh3DData;
  previewUrl?: string;
  provenance: AssetProvenance;
  createdAt: string;
  updatedAt: string;
  version: number;
  versionHistory: { version: number; state: AssetState; timestamp: string; note: string }[];
}

export interface Job {
  job_id: string;
  job_type: string;
  asset_id?: string;
  requested_model: string;
  fallback_models: string[];
  assigned_worker: string;
  priority: 'low' | 'normal' | 'high' | 'realtime';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'review_required';
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  logs: string[];
  warnings: string[];
  errors: string[];
  provenance?: AssetProvenance;
}

export interface BoneNode {
  id: string;
  name: string;
  parent?: string;
  children: string[];
  restRotation: [number, number, number]; // Radians
  currentRotation: [number, number, number];
  rotationLimits: {
    min: [number, number, number];
    max: [number, number, number];
  };
  weight: number;
}

export interface SkeletonRig {
  id: string;
  name: string;
  bones: Record<string, BoneNode>;
  rootBone: string;
  ikTargets: {
    name: string;
    targetBone: string;
    chain: string[];
    position: [number, number, number];
  }[];
}

export interface TUICommand {
  id: string;
  timestamp: string;
  command: string;
  status: 'executing' | 'success' | 'failed' | 'rejected';
  affectedBones: string[];
  latencyMs: number;
  inputState: 'pressed' | 'held' | 'released' | 'pulse';
  resultDetails?: string;
}

export interface CharacterMemory {
  id: string;
  fact: string;
  category: 'world' | 'personal' | 'relationship';
  approved: boolean;
  timestamp: string;
  confidence: number;
}

export interface CharacterState {
  id: string;
  name: string;
  title: string;
  identity: string;
  personality: string;
  goals: string[];
  needs: string[];
  relationships: Record<string, string>;
  currentEmotion: 'calm' | 'thoughtful' | 'suspicious' | 'warm' | 'intense' | 'nostalgic';
  voiceConfig: {
    voiceId: string;
    pitch: number;
    speed: number;
    tone: string;
  };
  memories: CharacterMemory[];
  perceivedWorld: string[];
  authorizedActions: string[];
}

export interface ScriptSandbox {
  id: string;
  filename: string;
  code: string;
  language: 'gdscript' | 'typescript' | 'lua';
  syntaxValid: boolean;
  sandboxStatus: 'clean' | 'has_warnings' | 'sandbox_violation' | 'runtime_error';
  diff?: string;
  permissions: {
    filesystem: boolean;
    network: boolean;
    processSpawn: boolean;
    godotApi: boolean;
  };
  testResults: {
    passed: boolean;
    message: string;
    executionTimeMs: number;
  }[];
  version: number;
}

export interface WorkflowNode {
  id: string;
  label: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'needs_approval';
  dependencies: string[];
  modelUsed?: string;
  artifactRef?: string;
  resourceEstMb: number;
}
