import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Layers, Maximize2, RefreshCw, Sliders, Play, Pause, Radio, Zap } from 'lucide-react';

interface Viewport3DProps {
  shadingMode: 'textured' | 'wireframe' | 'skeleton' | 'pbr_maps';
  flipperState: 'released' | 'pressed' | 'held';
  characterEmotion: string;
  isSpeaking: boolean;
  onSelectBone?: (boneName: string) => void;
  selectedBone?: string | null;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  shadingMode,
  flipperState,
  characterEmotion,
  isSpeaking,
  onSelectBone,
  selectedBone
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Mesh & Rig references
  const flipperArmRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const radioTubeRef = useRef<THREE.Mesh | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);

  const [fps, setFps] = useState(60);
  const [cameraPreset, setCameraPreset] = useState<'desk' | 'character' | 'flipper' | 'ortho'>('desk');
  const [wireframeActive, setWireframeActive] = useState(shadingMode === 'wireframe');

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.08);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 3.8);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x222838, 1.5);
    scene.add(ambientLight);

    // Motel Desk Lamp (Warm Directional / Spot)
    const deskLamp = new THREE.SpotLight(0xffaa55, 8, 10, Math.PI / 4, 0.5, 1);
    deskLamp.position.set(-1.2, 2.8, 0.5);
    deskLamp.target.position.set(-0.2, 0.9, 0);
    deskLamp.castShadow = true;
    scene.add(deskLamp);
    scene.add(deskLamp.target);

    // Cyber Cyan Accent Rim Light
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    rimLight.position.set(3, 4, -2);
    scene.add(rimLight);

    // Deep Magenta Atmosphere Fill
    const fillLight = new THREE.PointLight(0xff0055, 3, 8);
    fillLight.position.set(1.5, 0.5, -1);
    scene.add(fillLight);

    // 5. Build Environment: Motel Reception Desk Scene
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x12151c, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Reception Counter Desk
    const deskGeo = new THREE.BoxGeometry(2.4, 0.9, 0.9);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.6, metalness: 0.1 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.45, 0);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Retro Vintage Radio Box
    const radioGeo = new THREE.BoxGeometry(0.4, 0.25, 0.25);
    const radioMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.4 });
    const radio = new THREE.Mesh(radioGeo, radioMat);
    radio.position.set(0.6, 1.025, 0.1);
    desk.add(radio);

    // Vacuum Tube Glow
    const tubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 2 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(0.1, 0.16, 0);
    radio.add(tube);
    radioTubeRef.current = tube;

    // Vintage Microphone
    const micStandGeo = new THREE.CylinderGeometry(0.01, 0.04, 0.35);
    const micMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
    const micStand = new THREE.Mesh(micStandGeo, micMat);
    micStand.position.set(-0.5, 1.07, 0.2);
    scene.add(micStand);

    const micHeadGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const micHead = new THREE.Mesh(micHeadGeo, micMat);
    micHead.position.set(0, 0.2, 0);
    micStand.add(micHead);

    // 6. Radio Host Character Mesh & Skeleton
    const characterGroup = new THREE.Group();
    characterGroup.position.set(-0.1, 0.9, -0.2); // Sitting behind desk

    // Character Torso
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.7, 16);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x223344,
      roughness: 0.7,
      wireframe: shadingMode === 'wireframe'
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.35;
    torso.castShadow = true;
    characterGroup.add(torso);

    // Character Neck & Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.75, 0);
    characterGroup.add(headGroup);
    headRef.current = headGroup;

    const headGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xcc9977,
      roughness: 0.5,
      wireframe: shadingMode === 'wireframe'
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headGroup.add(headMesh);

    // Headphones
    const hpArchGeo = new THREE.TorusGeometry(0.18, 0.015, 8, 24, Math.PI);
    const hpArch = new THREE.Mesh(hpArchGeo, micMat);
    hpArch.rotation.x = Math.PI / 2;
    headGroup.add(hpArch);

    // Left Arm + Terminal Flipper Mechanism
    const flipperArmGroup = new THREE.Group();
    flipperArmGroup.position.set(-0.28, 0.65, 0);
    characterGroup.add(flipperArmGroup);
    flipperArmRef.current = flipperArmGroup;

    // Upper Arm
    const upperArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.35);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2e3b4e, wireframe: shadingMode === 'wireframe' });
    const upperArm = new THREE.Mesh(upperArmGeo, armMat);
    upperArm.position.y = -0.175;
    upperArm.rotation.z = Math.PI / 6;
    flipperArmGroup.add(upperArm);

    // Mechanical Pinball-Flipper Forearm/Blade
    const flipperBladeGeo = new THREE.BoxGeometry(0.08, 0.05, 0.4);
    const flipperBladeMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x006655, emissiveIntensity: 0.8 });
    const flipperBlade = new THREE.Mesh(flipperBladeGeo, flipperBladeMat);
    flipperBlade.position.set(-0.1, -0.32, 0.15);
    flipperArmGroup.add(flipperBlade);

    scene.add(characterGroup);

    // 7. Visual Skeleton Bones Overlay
    const skeletonGroup = new THREE.Group();
    const boneMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });

    const boneLines: THREE.Vector3[][] = [
      [new THREE.Vector3(-0.1, 0.9, -0.2), new THREE.Vector3(-0.1, 1.25, -0.2)], // Spine
      [new THREE.Vector3(-0.1, 1.25, -0.2), new THREE.Vector3(-0.1, 1.65, -0.2)], // Neck to Head
      [new THREE.Vector3(-0.1, 1.55, -0.2), new THREE.Vector3(-0.38, 1.55, -0.2)], // Shoulder Left
      [new THREE.Vector3(-0.38, 1.55, -0.2), new THREE.Vector3(-0.48, 1.25, -0.05)], // Elbow Left
      [new THREE.Vector3(-0.48, 1.25, -0.05), new THREE.Vector3(-0.58, 1.0, 0.1)] // Hand Flipper Left
    ];

    boneLines.forEach((points) => {
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, boneMaterial);
      skeletonGroup.add(line);

      // Bone Joint Spheres
      points.forEach((pt) => {
        const jGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const jMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const jMesh = new THREE.Mesh(jGeo, jMat);
        jMesh.position.copy(pt);
        skeletonGroup.add(jMesh);
      });
    });

    skeletonGroup.visible = shadingMode === 'skeleton';
    scene.add(skeletonGroup);
    skeletonGroupRef.current = skeletonGroup;

    // 8. Animation Loop
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      frameCount++;

      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      // Procedural Idle Breathing
      const breath = Math.sin(now * 0.002) * 0.015;
      torso.position.y = 0.35 + breath;

      // Vacuum Tube Pulse
      if (radioTubeRef.current) {
        const tubeMat = radioTubeRef.current.material as THREE.MeshStandardMaterial;
        tubeMat.emissiveIntensity = 1.5 + Math.sin(now * 0.008) * 0.8;
      }

      // Radio Host Head Look-At & Speaking Animation
      if (headRef.current) {
        if (isSpeaking) {
          headRef.current.rotation.y = Math.sin(now * 0.01) * 0.1;
          headRef.current.rotation.x = Math.sin(now * 0.015) * 0.08;
        } else {
          headRef.current.rotation.y = Math.sin(now * 0.001) * 0.05;
          headRef.current.rotation.x = Math.sin(now * 0.0015) * 0.03;
        }
      }

      // Real-time Flipper Arm Motion (Press / Hold / Release)
      if (flipperArmRef.current) {
        const targetRotationZ = flipperState === 'pressed' || flipperState === 'held' ? -0.85 : 0.0;
        flipperArmRef.current.rotation.z += (targetRotationZ - flipperArmRef.current.rotation.z) * 0.35; // Snappy physics interpolation
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        containerRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Sync Shading Mode Changes
  useEffect(() => {
    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.visible = shadingMode === 'skeleton';
    }
  }, [shadingMode]);

  // Handle Camera Presets
  const handleCameraPreset = (preset: 'desk' | 'character' | 'flipper' | 'ortho') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;

    if (preset === 'desk') {
      cameraRef.current.position.set(0, 1.8, 3.8);
      cameraRef.current.lookAt(0, 1.2, 0);
    } else if (preset === 'character') {
      cameraRef.current.position.set(-0.1, 1.6, 1.5);
      cameraRef.current.lookAt(-0.1, 1.5, 0);
    } else if (preset === 'flipper') {
      cameraRef.current.position.set(-0.6, 1.3, 1.2);
      cameraRef.current.lookAt(-0.35, 1.1, 0);
    } else if (preset === 'ortho') {
      cameraRef.current.position.set(0, 3.5, 0.1);
      cameraRef.current.lookAt(0, 0.9, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Target */}
      <div ref={containerRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Top Left Viewport Status Overlay */}
      <div className="absolute top-3 left-3 bg-[#111114]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#2A2A30] text-xs font-mono text-emerald-400 flex items-center gap-3 shadow-md">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
          Godot 4.6 Viewport (WebGL2)
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300">{fps} FPS</span>
        <span className="text-slate-600">|</span>
        <span className="text-blue-400 font-semibold uppercase">{shadingMode}</span>
      </div>

      {/* Top Right Camera Presets */}
      <div className="absolute top-3 right-3 bg-[#111114]/90 backdrop-blur-md p-1.5 rounded-md border border-[#2A2A30] flex items-center gap-1 text-xs shadow-md">
        <button
          onClick={() => handleCameraPreset('desk')}
          className={`px-2.5 py-1 rounded font-mono transition-all ${
            cameraPreset === 'desk' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A1E]'
          }`}
        >
          Desk Scene
        </button>
        <button
          onClick={() => handleCameraPreset('character')}
          className={`px-2.5 py-1 rounded font-mono transition-all ${
            cameraPreset === 'character' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A1E]'
          }`}
        >
          Host Close-Up
        </button>
        <button
          onClick={() => handleCameraPreset('flipper')}
          className={`px-2.5 py-1 rounded font-mono transition-all ${
            cameraPreset === 'flipper' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A1E]'
          }`}
        >
          Flipper Rig
        </button>
      </div>

      {/* Bottom Live Flipper & Character Status Bar */}
      <div className="absolute bottom-3 left-3 right-3 bg-[#111114]/95 backdrop-blur-md px-4 py-2.5 rounded-lg border border-blue-500/30 flex items-center justify-between text-xs font-mono shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300">Radio Host: <strong className="text-white">Velvet Radio (Evelyn)</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Emotion:</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase text-[10px] tracking-wider font-bold">
              {characterEmotion}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 ${flipperState !== 'released' ? 'text-blue-400 animate-ping' : 'text-slate-500'}`} />
            <span className="text-slate-400">Left Arm Flipper:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              flipperState !== 'released' ? 'bg-blue-600 text-white border border-blue-400 shadow-sm' : 'bg-[#1A1A1E] text-slate-400 border border-[#2A2A30]'
            }`}>
              {flipperState.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
