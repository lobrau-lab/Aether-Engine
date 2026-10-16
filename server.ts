import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mock Initial Data State
const workerMetrics = {
  cpuUsagePct: 18.4,
  ramUsageGB: 6.2,
  ramTotalGB: 32.0,
  gpuUsagePct: 34.1,
  vramUsageGB: 8.1,
  vramTotalGB: 16.0,
  queueDepth: 0,
  activeWorkers: [
    { id: "worker-cuda-0", name: "Local CUDA RTX 4090", type: "CUDA_GPU", status: "online", vramUsedGB: 5.2 },
    { id: "worker-mlx-0", name: "Apple M3 Max MLX", type: "APPLE_MLX", status: "online", vramUsedGB: 2.9 },
    { id: "worker-cpu-0", name: "Threadripper CPU Pool", type: "CPU", status: "online", vramUsedGB: 0.0 }
  ]
};

// 1. Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "Aether Engine v1 (Spark)", environment: "Arch Linux - Full Stack Local" });
});

// 2. Model Garage Status
app.get("/api/model-garage/status", (req, res) => {
  res.json({
    metrics: workerMetrics,
    slots: [
      {
        id: "image_generation",
        name: "Image & Material Synthesizer",
        required: true,
        purpose: "Generate PBR textures, material maps, decals and concept art",
        capabilities: ["Textures", "PBR Maps", "Decals", "Texture Repair"],
        activeModel: "gemini-3.1-flash-lite-image",
        fallbackModel: "Stable-Diffusion-XL-Turbo",
        computeTarget: "CUDA_GPU",
        vramRequiredGB: 4.5,
        ramRequiredGB: 8.0,
        contextLimit: 8192,
        precision: "FP16",
        status: "loaded",
        latencyMs: 140
      },
      {
        id: "three_dimensional_generation",
        name: "3D Geometry & Rig Generator",
        required: true,
        purpose: "Generate source geometry, retopologize, UV map, and weight skins",
        capabilities: ["Mesh Synthesis", "Topology Repair", "UV unwrapping", "Auto-rigging"],
        activeModel: "Tripo3D-Local-v2",
        fallbackModel: "ShapE-Worker-Node",
        computeTarget: "CUDA_GPU",
        vramRequiredGB: 6.0,
        ramRequiredGB: 12.0,
        contextLimit: 16384,
        precision: "FP16",
        status: "loaded",
        latencyMs: 380
      },
      {
        id: "speech_recognition",
        name: "Whisper VAD & STT Stream",
        required: true,
        purpose: "Streaming speech-to-text with intent classification",
        capabilities: ["Realtime STT", "Voice Activity Detection", "Intent Router"],
        activeModel: "Whisper-Large-v3-Turbo",
        fallbackModel: "Whisper-Medium",
        computeTarget: "CUDA_GPU",
        vramRequiredGB: 1.8,
        ramRequiredGB: 4.0,
        contextLimit: 4096,
        precision: "INT8",
        status: "loaded",
        latencyMs: 35
      },
      {
        id: "dialogue_model",
        name: "Character Reasoning & Memory Engine",
        required: true,
        purpose: "Control character reasoning, personality, goals, tool use, and response",
        capabilities: ["Memory Retrieval", "Emotion State Machine", "Tool Calling", "Dialogue"],
        activeModel: "gemini-3.6-flash",
        fallbackModel: "Llama-3.3-70B-Instruct-Q4",
        computeTarget: "EXTERNAL_API",
        vramRequiredGB: 0.0,
        ramRequiredGB: 2.0,
        contextLimit: 128000,
        precision: "BF16",
        status: "loaded",
        latencyMs: 180
      },
      {
        id: "text_to_speech",
        name: "Streaming TTS & Emotion Synthesizer",
        required: true,
        purpose: "Multi-speaker character voice generation with lip-sync output",
        capabilities: ["Streaming Audio", "Lip Sync Visemes", "Interruption Support"],
        activeModel: "gemini-3.1-flash-tts-preview",
        fallbackModel: "Piper-TTS-Local",
        computeTarget: "CUDA_GPU",
        vramRequiredGB: 2.2,
        ramRequiredGB: 4.0,
        contextLimit: 4096,
        precision: "FP16",
        status: "loaded",
        latencyMs: 95
      },
      {
        id: "vision_model",
        name: "Scene & Multimodal Inspector",
        required: true,
        purpose: "Inspect screenshots, UV maps, camera feeds, and scene geometry",
        capabilities: ["Mesh Visual Inspector", "Texture QA", "Player Gesture Analysis"],
        activeModel: "gemini-3.6-flash",
        fallbackModel: "Florence-2-Large",
        computeTarget: "EXTERNAL_API",
        vramRequiredGB: 0.0,
        ramRequiredGB: 2.0,
        contextLimit: 64000,
        precision: "FP16",
        status: "loaded",
        latencyMs: 210
      },
      {
        id: "music_and_sound_generation",
        name: "Adaptive Audio Synthesizer",
        required: true,
        purpose: "Generate ambient soundscapes, radio voice filters, and dynamic score",
        capabilities: ["SFX Generation", "Radio Filter DSP", "Ambient Loops"],
        activeModel: "AudioLDM2-Local",
        fallbackModel: "MusicGen-Small",
        computeTarget: "CUDA_GPU",
        vramRequiredGB: 3.5,
        ramRequiredGB: 6.0,
        contextLimit: 4096,
        precision: "FP16",
        status: "loaded",
        latencyMs: 310
      }
    ]
  });
});

// 3. AI Script Generator Endpoint
app.post("/api/script-engine/generate", async (req, res) => {
  const { prompt = "", language = "gdscript", currentCode = "" } = req.body;

  try {
    const systemPrompt = `You are the Aether Engine AI Scripting Assistant.
Your task is to write high-performance, sandboxed gameplay code for game actors (Godot 4.6 GDScript or TypeScript).
Rule 1: Always ensure code uses strict boundary checks (no direct shell/system calls).
Rule 2: Return a clean JSON object containing:
- "filename": string
- "code": string (full clean code)
- "diff": string (unified diff format comparing currentCode to generated code)
- "summary": string
- "syntaxValid": boolean
- "permissionFlags": { "filesystem": boolean, "network": boolean, "processSpawn": boolean, "godotApi": boolean }
- "warnings": array of strings`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Request: ${prompt}\n\nCurrent Code:\n${currentCode}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filename: { type: Type.STRING },
            code: { type: Type.STRING },
            diff: { type: Type.STRING },
            summary: { type: Type.STRING },
            syntaxValid: { type: Type.BOOLEAN },
            permissionFlags: {
              type: Type.OBJECT,
              properties: {
                filesystem: { type: Type.BOOLEAN },
                network: { type: Type.BOOLEAN },
                processSpawn: { type: Type.BOOLEAN },
                godotApi: { type: Type.BOOLEAN },
              },
              required: ["filesystem", "network", "processSpawn", "godotApi"]
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["filename", "code", "diff", "summary", "syntaxValid", "permissionFlags", "warnings"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Script generation fallback triggered due to API notice:", error.message);
    const cleanPrompt = prompt.replace(/[^a-zA-Z0-9_ ]/g, "");
    res.json({
      filename: "MotelDeskActor_Offline.gd",
      code: `@tool\nextends CharacterBody3D\n\n# Procedural Script generated via Offline Fallback\n@export var actor_name: String = "${cleanPrompt || "Evelyn"}"\n@export var flipper_force: float = 50.0\n\nfunc _ready() -> void:\n    print("[Aether Engine] Sandbox actor ready: ", actor_name)\n\nfunc trigger_action() -> void:\n    $ArmRig/FlipperBone.rotate_z(deg_to_rad(-flipper_force))\n`,
      diff: `+ @export var actor_name: String = "${cleanPrompt || "Evelyn"}"\n+ func trigger_action() -> void:`,
      summary: `Generated offline sandbox script for '${prompt || "actor control"}'`,
      syntaxValid: true,
      permissionFlags: { filesystem: false, network: false, processSpawn: false, godotApi: true },
      warnings: ["Offline mode active: Using local procedural template generator."]
    });
  }
});

// 4. Character Intelligence & Reasoning Endpoint
app.post("/api/character/dialogue", async (req, res) => {
  const { character = {}, userMessage = "", conversationHistory, memories } = req.body;

  try {
    const systemPrompt = `You are ${character.name || "Evelyn"} (${character.title || "Radio Host"}), a character in the game scene.
Identity: ${character.identity || "Host"}
Personality: ${character.personality || "Warm"}
Current Emotion: ${character.currentEmotion || "calm"}
Known Memories: ${JSON.stringify(memories || [])}

Respond to the player in voice/dialogue.
Also select an emotion transition if applicable, and trigger gameplay tool actions if appropriate (e.g. "tune_radio", "hand_over_keycard", "turn_on_desk_lamp").
Return a JSON object:
- "dialogueText": string
- "emotion": "calm" | "thoughtful" | "suspicious" | "warm" | "intense" | "nostalgic"
- "newMemoryCandidates": array of objects { fact: string, category: "world" | "personal" | "relationship" }
- "actionTriggered": string or null
- "visemeSequence": array of strings (e.g. ["A", "E", "O", "M", "S"]) for facial lip sync
- "latencyTargetMs": number`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Player message: "${userMessage}"\nHistory: ${JSON.stringify(conversationHistory || [])}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dialogueText: { type: Type.STRING },
            emotion: { type: Type.STRING },
            newMemoryCandidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fact: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["fact", "category"]
              }
            },
            actionTriggered: { type: Type.STRING },
            visemeSequence: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            latencyTargetMs: { type: Type.NUMBER }
          },
          required: ["dialogueText", "emotion", "newMemoryCandidates", "visemeSequence"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Character dialogue fallback triggered due to API notice:", error.message);
    res.json({
      dialogueText: `Frequency 98.4 is receiving your message through the desert static: "${userMessage}". The radio tower signals are grounded tonight.`,
      emotion: "thoughtful",
      newMemoryCandidates: [
        { fact: `Traveler inquired: "${userMessage}" at frequency 98.4`, category: "personal" }
      ],
      actionTriggered: "tune_radio",
      visemeSequence: ["A", "E", "O", "M", "S"],
      latencyTargetMs: 120
    });
  }
});

// 5. PBR Texture Generator Endpoint
app.post("/api/asset-pipeline/generate-pbr", async (req, res) => {
  const { prompt = "Procedural Wood PBR", resolution = "1024x1024", seamless = true } = req.body;

  let parsed: any = {};
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate PBR texture metadata and procedural shaders specification for material prompt: "${prompt}". Seamless: ${seamless}. Resolution: ${resolution}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            materialName: { type: Type.STRING },
            albedoDescription: { type: Type.STRING },
            normalMapIntensity: { type: Type.NUMBER },
            roughnessValue: { type: Type.NUMBER },
            metallicValue: { type: Type.NUMBER },
            heightScale: { type: Type.NUMBER },
            emissionColor: { type: Type.STRING },
            proceduralCode: { type: Type.STRING }
          },
          required: ["materialName", "albedoDescription", "normalMapIntensity", "roughnessValue", "metallicValue"]
        }
      }
    });

    parsed = JSON.parse(response.text || "{}");
  } catch (apiErr: any) {
    console.warn("PBR Gemini API call fallback triggered:", apiErr.message);
    parsed = {
      materialName: `${prompt.slice(0, 24)} PBR Material`,
      albedoDescription: "Seamless procedural albedo texture with surface wear",
      normalMapIntensity: 1.1,
      roughnessValue: 0.5,
      metallicValue: 0.05
    };
  }

  res.json({
    jobId: `job-pbr-${Date.now()}`,
    status: "review_required",
    materialName: parsed.materialName || `${prompt.slice(0, 24)} PBR Material`,
    pbr: {
      albedoUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}-albedo/1024/1024`,
      normalUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}-normal/1024/1024`,
      roughnessUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}-rough/1024/1024`,
      metallicUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}-metal/1024/1024`,
      heightUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}-height/1024/1024`
    },
    metadata: parsed,
    provenance: {
      jobId: `job-pbr-${Date.now()}`,
      actor: "Aether Worker Node 01",
      timestamp: new Date().toISOString(),
      model: "PBR-ProcEngine-OfflineFallback",
      version: "v1.4.2",
      license: "Commercial Game Studio License",
      seed: Math.floor(Math.random() * 999999),
      machine: "CUDA RTX 4090",
      prompt,
      settings: { resolution, seamless }
    }
  });
});

// 6. Terminal Skeletal Control Execution Endpoint
app.post("/api/terminal/execute-command", (req, res) => {
  const { command, rig_id = "character_001", input_state = "pressed", strength = 1.0 } = req.body;
  const startTime = Date.now();

  let affectedBones: string[] = [];
  let resultDetails = "";

  if (command.includes("flipper") || command.includes("arm")) {
    affectedBones = ["upper_arm.L", "forearm.L", "hand.L", "flipper_blade.L"];
    resultDetails = `Triggered Left Arm Flipper (State: ${input_state.toUpperCase()}, Impulse: ${(strength * 45).toFixed(1)}deg)`;
  } else if (command.includes("reset") || command.includes("rest")) {
    affectedBones = ["root", "spine", "upper_arm.L", "upper_arm.R", "neck", "head"];
    resultDetails = "Reset skeletal rig to default rest pose (T-Pose / Sit Pose).";
  } else if (command.includes("look_at") || command.includes("head")) {
    affectedBones = ["neck", "head", "eye.L", "eye.R"];
    resultDetails = `Updated IK LookAt target to camera focus (Strength: ${strength}).`;
  } else {
    affectedBones = ["spine", "root"];
    resultDetails = `Executed command '${command}' on rig '${rig_id}'.`;
  }

  const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 4 + 2); // Extremely fast (<10ms)

  res.json({
    id: `cmd-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    command,
    status: "success",
    affectedBones,
    latencyMs,
    inputState: input_state,
    resultDetails
  });
});

// Start Express / Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aether Engine Server running on http://localhost:${PORT}`);
  });
}

startServer();
