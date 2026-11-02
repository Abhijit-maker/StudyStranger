import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RotateCcw, Sliders, Sparkles as SparklesIcon, UserCheck, Eye, Smile, Volume2 } from "lucide-react";

export type AnjaliAnimationState =
  | "idle"
  | "talking"
  | "nodding"
  | "smiling"
  | "explaining"
  | "dancing"
  | "thinking"
  | "wave"
  | "clap"
  | "shy"
  | "laugh"
  | "cry"
  | "run"
  | "walk";

interface Anjali3DViewerProps {
  state?: "idle" | "listening" | "thinking" | "speaking" | "error" | "processing";
  animationState?: AnjaliAnimationState;
  onAnimationChange?: (anim: AnjaliAnimationState) => void;
  characterName?: string;
  isAudioPlaying?: boolean;
}

/**
 * Procedurally generate a photorealistic human eye iris texture
 * with radial fibrous striations, dark limbal ring, and depth gradient.
 */
function createProceduralIrisTexture(baseColorHex = 0x3d2817): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const cx = 256;
  const cy = 256;

  // Background dark base
  ctx.fillStyle = "#120b06";
  ctx.fillRect(0, 0, 512, 512);

  // Outer dark limbal ring
  const limbalGrad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 250);
  limbalGrad.addColorStop(0, "#2c1c11");
  limbalGrad.addColorStop(0.75, "#523722");
  limbalGrad.addColorStop(0.96, "#140c07");
  limbalGrad.addColorStop(1.0, "#080402");
  ctx.fillStyle = limbalGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // Dense radiating fibers
  ctx.save();
  ctx.translate(cx, cy);
  const numFibers = 240;
  for (let i = 0; i < numFibers; i++) {
    const angle = (i / numFibers) * Math.PI * 2 + (Math.sin(i * 13) * 0.02);
    const len = 90 + Math.sin(i * 3.7) * 45 + Math.cos(i * 11) * 35;
    const alpha = 0.25 + Math.sin(i * 5.1) * 0.2;
    ctx.strokeStyle = i % 3 === 0 ? `rgba(224, 169, 109, ${alpha})` : `rgba(138, 92, 56, ${alpha})`;
    ctx.lineWidth = i % 4 === 0 ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 55, Math.sin(angle) * 55);
    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();

  // Inner pupillary zone warm ring
  const innerRing = ctx.createRadialGradient(cx, cy, 45, cx, cy, 110);
  innerRing.addColorStop(0, "rgba(224, 175, 125, 0.45)");
  innerRing.addColorStop(0.6, "rgba(180, 120, 70, 0.25)");
  innerRing.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = innerRing;
  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.fill();

  // Deep central pupil
  ctx.fillStyle = "#050302";
  ctx.beginPath();
  ctx.arc(cx, cy, 58, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedurally generate a photorealistic human skin micro-texture
 * with dermal pore noise, subtle capillary blush, and skin warmth.
 */
function createProceduralSkinTexture(isBoy = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Base warm dermal tone
  const baseColor = isBoy ? "#f3cbba" : "#f7d2c1";
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Soft epidermal micro-pores and subtle tonal variation
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // Soft rosy capillary blush in center/cheeks
  const blushGrad = ctx.createRadialGradient(256, 320, 30, 256, 320, 220);
  blushGrad.addColorStop(0, "rgba(235, 120, 130, 0.16)");
  blushGrad.addColorStop(0.6, "rgba(240, 140, 150, 0.08)");
  blushGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = blushGrad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export const Anjali3DViewer: React.FC<Anjali3DViewerProps> = ({
  state = "idle",
  animationState = "idle",
  onAnimationChange,
  characterName = "Anjali",
  isAudioPlaying = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalAnim, setInternalAnim] = useState<AnjaliAnimationState>(animationState);
  const [showCustomize, setShowCustomize] = useState(false);

  // Gender model override: switch between Realistic Human Girl & Boy
  const defaultIsBoy = ["stranger", "rohan", "khud"].includes(characterName.toLowerCase());
  const [genderOverride, setGenderOverride] = useState<"auto" | "girl" | "boy">("auto");
  const isBoyMentor =
    genderOverride === "boy" ? true : genderOverride === "girl" ? false : defaultIsBoy;

  const [glasses, setGlasses] = useState<boolean>(false);
  const [headset, setHeadset] = useState<boolean>(false);
  const [blazerTheme, setBlazerTheme] = useState<"navy" | "cream" | "emerald" | "crimson">("navy");

  useEffect(() => {
    setInternalAnim(animationState);
  }, [animationState]);

  useEffect(() => {
    setGenderOverride("auto");
  }, [characterName]);

  const activeAnim: AnjaliAnimationState =
    state === "speaking" || isAudioPlaying
      ? internalAnim === "idle"
        ? "explaining"
        : internalAnim
      : state === "processing" || state === "thinking"
      ? "thinking"
      : state === "listening"
      ? "nodding"
      : internalAnim;

  const triggerAnim = (anim: AnjaliAnimationState) => {
    setInternalAnim(anim);
    onAnimationChange?.(anim);
  };

  const livePropsRef = useRef({
    activeAnim,
    isSpeaking: state === "speaking" || isAudioPlaying,
    isListening: state === "listening",
    glasses,
    headset,
    blazerTheme,
    isBoyMentor,
  });

  useEffect(() => {
    livePropsRef.current = {
      activeAnim,
      isSpeaking: state === "speaking" || isAudioPlaying,
      isListening: state === "listening",
      glasses,
      headset,
      blazerTheme,
      isBoyMentor,
    };
  }, [activeAnim, state, isAudioPlaying, glasses, headset, blazerTheme, isBoyMentor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 350);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const rendererStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererStr);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 2.65);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.12, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 4.0;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.85;
    controls.update();

    // Studio Portrait 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfffaf5, 1.05);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.1);
    keyLight.position.set(2.4, 4.0, 3.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.95);
    fillLight.position.set(-2.6, 2.2, 2.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.85);
    rimLight.position.set(0, 3.2, -2.6);
    scene.add(rimLight);

    // =========================================================
    // HYPER-REALISTIC HUMAN ANATOMY & PBR MATERIAL SETUP
    // =========================================================
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Studio Pedestal Floor & Contact Shadow
    const pedestalGeo = new THREE.CylinderGeometry(0.74, 0.80, 0.05, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.32,
      metalness: 0.06,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.025;
    rootGroup.add(pedestal);

    // Soft Radial Contact Grounding Shadow
    const contactShadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.052;
    rootGroup.add(contactShadow);

    const holoRingGeo = new THREE.TorusGeometry(0.76, 0.012, 16, 64);
    const holoRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.38,
      roughness: 0.22,
    });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.y = 0.054;
    rootGroup.add(holoRing);

    const characterGroup = new THREE.Group();
    characterGroup.position.y = 0.05;
    rootGroup.add(characterGroup);

    // PROCEDURAL TEXTURES FOR HUMAN REALISM
    const skinTex = createProceduralSkinTexture(false);
    const irisTex = createProceduralIrisTexture(0x382215);

    // Physically-Based Human Skin with Peach Sheen & Subsurface Appearance
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7d2c1,
      roughness: 0.38,
      metalness: 0.0,
      clearcoat: 0.16,
      clearcoatRoughness: 0.42,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffcaa7),
      map: skinTex,
    });

    // Deep Natural Hair Material with Anisotropic Sheen
    const hairMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1410,
      roughness: 0.45,
      metalness: 0.06,
      clearcoat: 0.22,
      clearcoatRoughness: 0.38,
      sheen: 0.48,
      sheenColor: new THREE.Color(0x634938),
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
    });

    const blazerMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.48,
      metalness: 0.06,
    });

    const trouserMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.52,
      metalness: 0.04,
    });

    const tieOrRibbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xbe123c,
      roughness: 0.32,
      clearcoat: 0.28,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xf43f5e),
    });

    // Crystalline Human Eye Materials
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfe,
      roughness: 0.18,
    });

    const irisMat = new THREE.MeshPhysicalMaterial({
      map: irisTex,
      roughness: 0.15,
      clearcoat: 0.8,
    });

    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.82,
      ior: 1.376,
    });

    const lipMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9777f,
      roughness: 0.28,
      clearcoat: 0.55,
      clearcoatRoughness: 0.25,
      sheen: 0.3,
      sheenColor: new THREE.Color(0xfb7185),
    });

    const teethMat = new THREE.MeshPhysicalMaterial({
      color: 0xfefefe,
      roughness: 0.14,
      clearcoat: 0.8,
    });

    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xd4606c,
      roughness: 0.35,
    });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.24,
      roughness: 0.8,
    });

    const goldButtonMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.18,
    });

    // =========================================================
    // LOWER BODY & LEGS
    // =========================================================
    const hipsGroup = new THREE.Group();
    hipsGroup.position.y = 0.58;
    characterGroup.add(hipsGroup);

    // Girl Pleated Skirt
    const girlSkirtGroup = new THREE.Group();
    const skirtMain = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.225, 0.27, 32), trouserMat);
    skirtMain.position.y = -0.05;
    girlSkirtGroup.add(skirtMain);
    hipsGroup.add(girlSkirtGroup);

    // Boy Pelvis / Trouser Top
    const boyPelvisGroup = new THREE.Group();
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.152, 0.14, 28), trouserMat);
    pelvisMesh.position.y = -0.01;
    boyPelvisGroup.add(pelvisMesh);
    hipsGroup.add(boyPelvisGroup);

    const createHumanLeg = (xOffset: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(xOffset, -0.1, 0);

      const skinLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.043, 0.44, 24), skinMat);
      skinLeg.position.y = -0.22;
      legGroup.add(skinLeg);

      const trouserLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.056, 0.45, 24), trouserMat);
      trouserLeg.position.y = -0.22;
      legGroup.add(trouserLeg);

      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.044, 0.09, 20), shirtMat);
      sock.position.y = -0.40;
      legGroup.add(sock);

      const shoe = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.048, 0.095, 10, 20),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.32, metalness: 0.12 })
      );
      shoe.rotation.x = Math.PI / 2;
      shoe.position.set(0, -0.45, 0.035);
      legGroup.add(shoe);

      return { legGroup, skinLeg, trouserLeg };
    };

    const leftLegObj = createHumanLeg(-0.086);
    const rightLegObj = createHumanLeg(0.086);
    hipsGroup.add(leftLegObj.legGroup);
    hipsGroup.add(rightLegObj.legGroup);

    // =========================================================
    // TORSO, CHEST, LAPELS & ATTIRE
    // =========================================================
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.67;
    characterGroup.add(torsoGroup);

    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.144, 0.45, 32), blazerMat);
    torsoMesh.scale.set(1.06, 1.0, 0.84);
    torsoMesh.position.y = 0.225;
    torsoGroup.add(torsoMesh);

    // Gold Blazer Buttons
    for (let b = 0; b < 2; b++) {
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.005, 16), goldButtonMat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(0, 0.18 + b * 0.09, 0.134);
      torsoGroup.add(btn);
    }

    // Shirt Front
    const shirtFront = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.092, 0.28, 24), shirtMat);
    shirtFront.scale.set(1.0, 1.0, 0.76);
    shirtFront.position.set(0, 0.31, 0.065);
    torsoGroup.add(shirtFront);

    // Collar
    const collarGeo = new THREE.BoxGeometry(0.062, 0.046, 0.022);
    const leftCollar = new THREE.Mesh(collarGeo, shirtMat);
    leftCollar.position.set(-0.042, 0.44, 0.112);
    leftCollar.rotation.set(0.2, 0.3, -0.35);
    torsoGroup.add(leftCollar);

    const rightCollar = new THREE.Mesh(collarGeo, shirtMat);
    rightCollar.position.set(0.042, 0.44, 0.112);
    rightCollar.rotation.set(0.2, -0.3, 0.35);
    torsoGroup.add(rightCollar);

    // Girl Ribbon
    const girlRibbonGroup = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), tieOrRibbonMat);
    knot.position.set(0, 0.39, 0.134);
    girlRibbonGroup.add(knot);

    const bowWingL = new THREE.Mesh(new THREE.ConeGeometry(0.029, 0.088, 14), tieOrRibbonMat);
    bowWingL.position.set(-0.028, 0.34, 0.132);
    bowWingL.rotation.z = 0.36;
    girlRibbonGroup.add(bowWingL);

    const bowWingR = new THREE.Mesh(new THREE.ConeGeometry(0.029, 0.088, 14), tieOrRibbonMat);
    bowWingR.position.set(0.028, 0.34, 0.132);
    bowWingR.rotation.z = -0.36;
    girlRibbonGroup.add(bowWingR);
    torsoGroup.add(girlRibbonGroup);

    // Boy Necktie
    const boyTieGroup = new THREE.Group();
    const tieKnot = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.017, 0.038, 14), tieOrRibbonMat);
    tieKnot.position.set(0, 0.40, 0.132);
    boyTieGroup.add(tieKnot);

    const tieBlade = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.22, 0.013), tieOrRibbonMat);
    tieBlade.position.set(0, 0.28, 0.134);
    boyTieGroup.add(tieBlade);
    torsoGroup.add(boyTieGroup);

    // Anatomical Neck
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.064, 0.12, 24), skinMat);
    neckMesh.position.y = 0.48;
    torsoGroup.add(neckMesh);

    // =========================================================
    // HYPER-REALISTIC SCULPTED HUMAN HEAD & FACE
    // =========================================================
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.56;
    torsoGroup.add(headGroup);

    // Cranium with anatomical human proportions
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.198, 44, 44), skinMat);
    cranium.scale.set(0.92, 1.05, 0.95);
    cranium.position.y = 0.15;
    headGroup.add(cranium);

    // Defined Zygomatic Cheekbones & Jaw Contour
    const jawCheek = new THREE.Mesh(new THREE.SphereGeometry(0.158, 36, 36), skinMat);
    jawCheek.scale.set(0.96, 0.94, 0.93);
    jawCheek.position.set(0, 0.088, 0.028);
    headGroup.add(jawCheek);

    // Chin contour
    const chinTip = new THREE.Mesh(new THREE.SphereGeometry(0.042, 18, 18), skinMat);
    chinTip.scale.set(1.0, 0.85, 1.15);
    chinTip.position.set(0, 0.018, 0.135);
    headGroup.add(chinTip);

    // Anatomical Human Ears
    const createEar = (side: -1 | 1) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.18, 0.135, -0.005);
      earGroup.rotation.y = side * -0.22;

      const outerHelix = new THREE.Mesh(new THREE.SphereGeometry(0.038, 18, 18), skinMat);
      outerHelix.scale.set(0.42, 1.18, 0.74);
      earGroup.add(outerHelix);

      const earLobe = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 14), skinMat);
      earLobe.position.set(0, -0.028, 0.004);
      earGroup.add(earLobe);

      return earGroup;
    };
    headGroup.add(createEar(-1));
    headGroup.add(createEar(1));

    // Sculpted Human Nose with Alar Wings (Nostrils)
    const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.046, 10, 14), skinMat);
    noseBridge.position.set(0, 0.136, 0.182);
    noseBridge.rotation.x = -0.24;
    headGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.017, 16, 16), skinMat);
    noseTip.scale.set(1.06, 0.88, 1.12);
    noseTip.position.set(0, 0.113, 0.194);
    headGroup.add(noseTip);

    // Nostril wings left & right
    const leftAla = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), skinMat);
    leftAla.position.set(-0.016, 0.108, 0.184);
    headGroup.add(leftAla);

    const rightAla = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), skinMat);
    rightAla.position.set(0.016, 0.108, 0.184);
    headGroup.add(rightAla);

    // Natural Philtrum Groove
    const philtrum = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.018, 8, 8), skinMat);
    philtrum.position.set(0, 0.093, 0.188);
    headGroup.add(philtrum);

    // HYPER-REALISTIC HUMAN EYES (Sclera + Iris + Cornea Lens Cap + Lids)
    const createHumanEye = (xSide: -1 | 1) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xSide * 0.069, 0.156, 0.168);
      eyeGroup.rotation.y = xSide * 0.11;

      // Sclera
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.033, 28, 28), scleraMat);
      sclera.scale.set(1.18, 0.88, 0.58);
      eyeGroup.add(sclera);

      // Procedural Fibrous Iris
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.021, 32), irisMat);
      iris.position.set(0, 0, 0.018);
      eyeGroup.add(iris);

      // Curved Transparent Cornea Catching Real-World Reflections
      const cornea = new THREE.Mesh(
        new THREE.SphereGeometry(0.023, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
        corneaMat
      );
      cornea.position.set(0, 0, 0.016);
      cornea.rotation.x = -Math.PI / 2;
      eyeGroup.add(cornea);

      // Tear duct (Caruncle)
      const caruncle = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 10), lipMat);
      caruncle.position.set(xSide * -0.028, -0.002, 0.018);
      eyeGroup.add(caruncle);

      // Upper Eyelash Rim & Lid
      const upperLid = new THREE.Mesh(
        new THREE.TorusGeometry(0.033, 0.0045, 12, 28, Math.PI),
        hairMat
      );
      upperLid.scale.set(1.14, 0.84, 0.7);
      upperLid.position.set(0, 0.003, 0.017);
      eyeGroup.add(upperLid);

      return eyeGroup;
    };

    const leftEyeGroup = createHumanEye(-1);
    const rightEyeGroup = createHumanEye(1);
    headGroup.add(leftEyeGroup);
    headGroup.add(rightEyeGroup);

    // Anatomical Eyebrows with Tapered Arc
    const browGeo = new THREE.CapsuleGeometry(0.006, 0.054, 8, 14);
    const leftBrow = new THREE.Mesh(browGeo, hairMat);
    leftBrow.rotation.z = Math.PI / 2 - 0.08;
    leftBrow.position.set(-0.069, 0.207, 0.174);
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMat);
    rightBrow.rotation.z = Math.PI / 2 + 0.08;
    rightBrow.position.set(0.069, 0.207, 0.174);
    headGroup.add(rightBrow);

    // Subtle Cheek Flush
    const blushGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.scale.set(1.3, 0.72, 0.22);
    leftBlush.position.set(-0.10, 0.105, 0.16);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.scale.set(1.3, 0.72, 0.22);
    rightBlush.position.set(0.10, 0.105, 0.16);
    headGroup.add(rightBlush);

    // REALISTIC MOUTH, CUPID'S BOW, TEETH & TONGUE
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, 0.067, 0.176);
    headGroup.add(mouthGroup);

    // Upper Lip with Cupid's bow
    const upperLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.029, 0.0055, 14, 28, Math.PI),
      lipMat
    );
    upperLip.rotation.x = Math.PI;
    upperLip.scale.set(1.18, 0.68, 0.85);
    mouthGroup.add(upperLip);

    // Lower Lip
    const lowerLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.0065, 14, 28, Math.PI),
      lipMat
    );
    lowerLip.scale.set(1.1, 0.72, 0.85);
    lowerLip.position.set(0, -0.015, 0.002);
    mouthGroup.add(lowerLip);

    // Oral Cavity
    const oralCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0x140608 })
    );
    oralCavity.scale.set(1.15, 0.45, 0.45);
    oralCavity.position.set(0, -0.008, -0.005);
    mouthGroup.add(oralCavity);

    // Enamel Upper Teeth Row
    const teethRow = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.009, 0.014), teethMat);
    teethRow.position.set(0, 0.002, 0.004);
    mouthGroup.add(teethRow);

    // Soft Tongue
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), tongueMat);
    tongue.scale.set(1.1, 0.4, 0.9);
    tongue.position.set(0, -0.012, 0.004);
    mouthGroup.add(tongue);

    // =========================================================
    // LAYERED REALISTIC HAIR WITH ANISOTROPIC VOLUME
    // =========================================================
    const baseHairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.206, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.48),
      hairMat
    );
    baseHairCrown.scale.set(0.96, 1.02, 0.96);
    baseHairCrown.position.set(0, 0.174, -0.016);
    baseHairCrown.rotation.x = -0.56;
    headGroup.add(baseHairCrown);

    // Girl Layered Haircut
    const girlHairGroup = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.07, 10, 14), hairMat);
      strand.position.set(i * 0.032, 0.278, 0.15 - Math.abs(i) * 0.012);
      strand.rotation.x = 0.26;
      strand.rotation.z = i * -0.14;
      girlHairGroup.add(strand);
    }

    const leftWave = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.35, 14, 18), hairMat);
    leftWave.position.set(-0.176, 0.0, 0.025);
    leftWave.rotation.z = 0.08;
    girlHairGroup.add(leftWave);

    const rightWave = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.35, 14, 18), hairMat);
    rightWave.position.set(0.176, 0.0, 0.025);
    rightWave.rotation.z = -0.08;
    girlHairGroup.add(rightWave);

    const backLongHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 18, 24), hairMat);
    backLongHair.scale.set(1.06, 1.0, 0.58);
    backLongHair.position.set(0, 0.01, -0.12);
    girlHairGroup.add(backLongHair);
    headGroup.add(girlHairGroup);

    // Boy Modern Textured Quiff & Fade
    const boyHairGroup = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const tuft = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.065, 10, 14), hairMat);
      tuft.position.set(i * 0.034, 0.298, 0.138 - Math.abs(i) * 0.01);
      tuft.rotation.set(0.36, 0.14, -0.2 + i * -0.05);
      boyHairGroup.add(tuft);
    }
    const leftSideburn = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.078, 10, 12), hairMat);
    leftSideburn.position.set(-0.18, 0.162, 0.01);
    boyHairGroup.add(leftSideburn);

    const rightSideburn = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.078, 10, 12), hairMat);
    rightSideburn.position.set(0.18, 0.162, 0.01);
    boyHairGroup.add(rightSideburn);

    const boyBackTaper = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 28), hairMat);
    boyBackTaper.scale.set(0.92, 0.92, 0.68);
    boyBackTaper.position.set(0, 0.12, -0.11);
    boyHairGroup.add(boyBackTaper);
    headGroup.add(boyHairGroup);

    // Glasses
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.156, 0.186);

    const metalFrameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.88, roughness: 0.18 });
    const lensMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, transmission: 0.9, roughness: 0.05 });

    const createLensFrame = (side: -1 | 1) => {
      const frameRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0035, 10, 28), metalFrameMat);
      frameRing.position.x = side * 0.072;
      glassesGroup.add(frameRing);

      const glassLens = new THREE.Mesh(new THREE.CircleGeometry(0.037, 24), lensMat);
      glassLens.position.x = side * 0.072;
      glassesGroup.add(glassLens);
    };
    createLensFrame(-1);
    createLensFrame(1);

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.038, 8), metalFrameMat);
    bridge.rotation.z = Math.PI / 2;
    glassesGroup.add(bridge);
    headGroup.add(glassesGroup);

    // Headset
    const headsetGroup = new THREE.Group();
    const headsetMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.55, roughness: 0.28 });
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.208, 0.011, 12, 32, Math.PI), headsetMat);
    headband.position.y = 0.158;
    headsetGroup.add(headband);

    const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.026, 18), headsetMat);
    leftCup.rotation.z = Math.PI / 2;
    leftCup.position.set(-0.205, 0.136, 0);
    headsetGroup.add(leftCup);

    const rightCup = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.026, 18), headsetMat);
    rightCup.rotation.z = Math.PI / 2;
    rightCup.position.set(0.205, 0.136, 0);
    headsetGroup.add(rightCup);
    headGroup.add(headsetGroup);

    // =========================================================
    // ARTICULATED HUMAN ARMS & 5-FINGERED REALISTIC HANDS
    // =========================================================
    const createArticulatedArm = (side: -1 | 1) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.208, 0.39, 0);

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.19, 12, 18), blazerMat);
      upperArm.position.y = -0.115;
      shoulderGroup.add(upperArm);

      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -0.23;
      shoulderGroup.add(elbowGroup);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.17, 12, 18), skinMat);
      forearm.position.y = -0.11;
      elbowGroup.add(forearm);

      // Shirt cuff
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.039, 0.03, 16), shirtMat);
      cuff.position.y = -0.19;
      elbowGroup.add(cuff);

      const handGroup = new THREE.Group();
      handGroup.position.y = -0.22;
      elbowGroup.add(handGroup);

      // Palm & Thenar Thumb Pad
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 16), skinMat);
      palm.scale.set(0.94, 1.18, 0.54);
      handGroup.add(palm);

      // 4 Distinct Articulated Fingers (Index, Middle, Ring, Pinky)
      const fingerMeshes: THREE.Mesh[] = [];
      const fingerLengths = [0.033, 0.036, 0.034, 0.028];
      const fingerSpreads = [-0.016, -0.005, 0.005, 0.016];

      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.0055, fingerLengths[f], 8, 10),
          skinMat
        );
        finger.position.set(fingerSpreads[f], -0.036 - (fingerLengths[f] - 0.03) * 0.5, 0.002);
        finger.rotation.x = 0.15; // Natural relaxed curl
        handGroup.add(finger);
        fingerMeshes.push(finger);
      }

      // Natural Human Opposable Thumb
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, 0.028, 8, 10), skinMat);
      thumb.position.set(side * -0.026, -0.014, 0.014);
      thumb.rotation.set(0.2, side * -0.3, side * 0.62);
      handGroup.add(thumb);

      return { shoulderGroup, elbowGroup, handGroup, fingerMeshes, thumb };
    };

    const leftArmRig = createArticulatedArm(-1);
    const rightArmRig = createArticulatedArm(1);
    torsoGroup.add(leftArmRig.shoulderGroup);
    torsoGroup.add(rightArmRig.shoulderGroup);

    // =========================================================
    // BIOMECHANICAL HUMAN ANIMATION LOOP
    // =========================================================
    let raf = 0;
    let disposed = false;
    let prevTime = performance.now();
    let elapsed = 0;

    const afterDraw = (cb: FrameRequestCallback) => {
      raf = requestAnimationFrame((now) => {
        setTimeout(() => {
          if (!disposed) cb(now);
        }, 0);
      });
    };

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      elapsed += dt;
      const t = elapsed;

      const {
        activeAnim: anim,
        isSpeaking,
        isListening,
        glasses: showGlasses,
        headset: showHeadset,
        blazerTheme: theme,
        isBoyMentor: boyMode,
      } = livePropsRef.current;

      glassesGroup.visible = showGlasses;
      headsetGroup.visible = showHeadset;

      girlHairGroup.visible = !boyMode;
      girlSkirtGroup.visible = !boyMode;
      girlRibbonGroup.visible = !boyMode;

      boyHairGroup.visible = boyMode;
      boyPelvisGroup.visible = boyMode;
      boyTieGroup.visible = boyMode;

      leftLegObj.skinLeg.visible = !boyMode;
      rightLegObj.skinLeg.visible = !boyMode;
      leftLegObj.trouserLeg.visible = boyMode;
      rightLegObj.trouserLeg.visible = boyMode;

      torsoGroup.scale.set(boyMode ? 1.08 : 1.0, boyMode ? 1.04 : 1.0, 1.0);
      leftArmRig.shoulderGroup.position.x = boyMode ? -0.218 : -0.205;
      rightArmRig.shoulderGroup.position.x = boyMode ? 0.218 : 0.205;

      const themeHex =
        theme === "cream"
          ? 0x334155
          : theme === "emerald"
          ? 0x065f46
          : theme === "crimson"
          ? 0x881337
          : 0x1e3a8a;
      blazerMat.color.setHex(themeHex);

      // Status indicator ring on pedestal
      if (isSpeaking || anim === "explaining" || anim === "talking") {
        holoRingMat.color.setHex(0xf97316);
        holoRingMat.emissive.setHex(0xf97316);
      } else if (isListening || anim === "nodding") {
        holoRingMat.color.setHex(0x10b981);
        holoRingMat.emissive.setHex(0x10b981);
      } else {
        holoRingMat.color.setHex(0x3b82f6);
        holoRingMat.emissive.setHex(0x3b82f6);
      }

      // NATURAL ASYMMETRIC HUMAN EYE BLINKING
      // Realistic blinking with double-blinks every 2.8 - 4.5 seconds
      const blinkCycle = Math.sin(t * 1.75) + Math.cos(t * 0.95);
      const isBlinking = blinkCycle > 1.88;
      const targetEyeY = isBlinking ? 0.08 : 1.0;
      leftEyeGroup.scale.y = THREE.MathUtils.lerp(leftEyeGroup.scale.y, targetEyeY, 0.38);
      rightEyeGroup.scale.y = THREE.MathUtils.lerp(rightEyeGroup.scale.y, targetEyeY, 0.38);

      // NATURAL EYE SACCADES (Human Micro-Gaze tracking)
      const saccadeX = Math.sin(t * 0.8) * 0.003 + Math.cos(t * 1.9) * 0.002;
      const saccadeY = Math.cos(t * 0.7) * 0.002;
      leftEyeGroup.position.x = -0.069 + saccadeX;
      leftEyeGroup.position.y = 0.156 + saccadeY;
      rightEyeGroup.position.x = 0.069 + saccadeX;
      rightEyeGroup.position.y = 0.156 + saccadeY;

      // NATURAL RESPIRATORY BREATHING (Chest & Torso Expansion)
      const breathPhase = Math.sin(t * 1.65);
      torsoGroup.position.y = 0.67 + breathPhase * 0.008;
      torsoGroup.scale.x = (boyMode ? 1.08 : 1.0) + breathPhase * 0.01;
      torsoGroup.scale.z = 0.84 + breathPhase * 0.012;

      // SYLLABIC LIP-SYNC WITH TEETH & TONGUE VISIBILITY
      const speakingActive = isSpeaking || anim === "talking" || anim === "explaining";
      if (speakingActive) {
        const speechOsc = Math.abs(Math.sin(t * 14.0)) * 0.7 + Math.abs(Math.cos(t * 9.2)) * 0.35;
        mouthGroup.scale.set(1.12 + speechOsc * 0.18, 0.35 + speechOsc * 1.25, 0.4);
        upperLip.position.y = speechOsc * 0.006;
        lowerLip.position.y = -0.015 - speechOsc * 0.014;
        teethRow.scale.y = 1.0 + speechOsc * 0.2;
        tongue.position.z = 0.004 + Math.sin(t * 12.0) * 0.004;
      } else if (anim === "smiling" || anim === "wave" || anim === "clap" || anim === "nodding") {
        mouthGroup.scale.set(1.24, 0.42, 0.38);
        upperLip.position.y = 0.004;
        lowerLip.position.y = -0.012;
      } else if (anim === "laugh") {
        const laughPulse = Math.abs(Math.sin(t * 13.5));
        mouthGroup.scale.set(1.32, 0.85 + laughPulse * 0.6, 0.45);
      } else {
        mouthGroup.scale.set(0.96, 0.16, 0.32);
        upperLip.position.y = 0;
        lowerLip.position.y = -0.015;
      }

      const isHappy =
        anim === "smiling" || anim === "laugh" || anim === "clap" || anim === "wave" || anim === "shy";
      blushMat.opacity = isHappy ? (boyMode ? 0.32 : 0.52) : boyMode ? 0.14 : 0.24;
      leftBrow.position.y = 0.207 + (isHappy ? 0.008 : anim === "thinking" ? 0.014 : 0);
      rightBrow.position.y = 0.207 + (isHappy ? 0.008 : anim === "thinking" ? -0.006 : 0);

      characterGroup.position.y = THREE.MathUtils.lerp(characterGroup.position.y, 0.05, 0.15);
      characterGroup.rotation.y = THREE.MathUtils.lerp(characterGroup.rotation.y, 0, 0.12);
      torsoGroup.rotation.set(0, 0, 0);
      hipsGroup.rotation.set(0, 0, 0);

      // EXQUISITE GESTURE CHOREOGRAPHY
      if (anim === "nodding") {
        const nodAngle = Math.sin(t * 6.5) * 0.19 + 0.06;
        headGroup.rotation.set(nodAngle, Math.sin(t * 1.5) * 0.05, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.42, -0.18, -0.22);
        rightArmRig.elbowGroup.rotation.set(-0.84, 0, 0);
        rightArmRig.handGroup.rotation.set(Math.sin(t * 6.5) * 0.16, 0, 0);
        leftArmRig.shoulderGroup.rotation.set(0.06, 0, 0.14);
        leftArmRig.elbowGroup.rotation.set(-0.22, 0, 0);
      } else if (anim === "smiling") {
        headGroup.rotation.set(-0.06, Math.sin(t * 2.2) * 0.09, 0.08);
        torsoGroup.rotation.z = 0.03;
        leftArmRig.shoulderGroup.rotation.set(-0.32, 0.18, 0.3);
        leftArmRig.elbowGroup.rotation.set(-0.72, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.32, -0.18, -0.3);
        rightArmRig.elbowGroup.rotation.set(-0.72, 0, 0);
      } else if (anim === "wave") {
        headGroup.rotation.set(-0.04, 0.08, 0.06);
        rightArmRig.shoulderGroup.rotation.set(-0.36, 0, -2.15);
        rightArmRig.elbowGroup.rotation.set(-0.36, 0, Math.sin(t * 9.5) * 0.4);
        rightArmRig.handGroup.rotation.z = Math.sin(t * 9.5) * 0.24;
        leftArmRig.shoulderGroup.rotation.set(0.08, 0, 0.15);
        leftArmRig.elbowGroup.rotation.set(-0.22, 0, 0);
      } else if (anim === "explaining" || anim === "talking") {
        const nod = Math.sin(t * 4.4) * 0.1;
        const headTurn = Math.sin(t * 1.8) * 0.14;
        headGroup.rotation.set(nod, headTurn, Math.cos(t * 2.4) * 0.04);
        torsoGroup.rotation.y = Math.sin(t * 1.6) * 0.08;

        leftArmRig.shoulderGroup.rotation.set(
          -0.54 + Math.sin(t * 3.8) * 0.22,
          0.18,
          0.3 + Math.cos(t * 3.2) * 0.12
        );
        leftArmRig.elbowGroup.rotation.set(-0.94 + Math.sin(t * 4.6) * 0.24, 0, 0);
        leftArmRig.handGroup.rotation.z = Math.sin(t * 5.5) * 0.2;

        rightArmRig.shoulderGroup.rotation.set(
          -0.6 + Math.cos(t * 3.8) * 0.24,
          -0.18,
          -0.3 - Math.sin(t * 3.2) * 0.12
        );
        rightArmRig.elbowGroup.rotation.set(-0.98 + Math.cos(t * 4.6) * 0.26, 0, 0);
        rightArmRig.handGroup.rotation.z = -Math.cos(t * 5.5) * 0.2;
      } else if (anim === "thinking") {
        headGroup.rotation.set(0.12, -0.16, 0.12);
        rightArmRig.shoulderGroup.rotation.set(-0.84, -0.38, -0.18);
        rightArmRig.elbowGroup.rotation.set(-1.54, 0, 0);
        leftArmRig.shoulderGroup.rotation.set(-0.32, 0.44, 0.14);
        leftArmRig.elbowGroup.rotation.set(-1.18, 0, 0);
      } else if (anim === "clap") {
        const clapOsc = Math.abs(Math.sin(t * 10.5));
        headGroup.rotation.set(-0.06 + clapOsc * 0.08, 0, 0);
        characterGroup.position.y = 0.05 + clapOsc * 0.026;
        leftArmRig.shoulderGroup.rotation.set(-0.74, 0.52 - clapOsc * 0.18, 0.14);
        leftArmRig.elbowGroup.rotation.set(-1.1, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.74, -0.52 + clapOsc * 0.18, -0.14);
        rightArmRig.elbowGroup.rotation.set(-1.1, 0, 0);
      } else if (anim === "laugh") {
        const bounce = Math.abs(Math.sin(t * 11.5));
        characterGroup.position.y = 0.05 + bounce * 0.032;
        headGroup.rotation.set(-0.16 + bounce * 0.08, Math.sin(t * 3.8) * 0.08, 0);
        torsoGroup.rotation.x = -0.07;
        leftArmRig.shoulderGroup.rotation.set(-0.5, 0.28, 0.22);
        leftArmRig.elbowGroup.rotation.set(-1.26, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.5, -0.28, -0.22);
        rightArmRig.elbowGroup.rotation.set(-1.26, 0, 0);
      } else if (anim === "dancing") {
        const beat = t * 7.4;
        characterGroup.position.y = 0.05 + Math.abs(Math.sin(beat)) * 0.08;
        characterGroup.rotation.y = Math.sin(beat * 0.5) * 0.32;
        hipsGroup.rotation.z = Math.sin(beat) * 0.16;
        headGroup.rotation.set(Math.sin(beat) * 0.08, Math.cos(beat * 0.5) * 0.15, Math.sin(beat * 0.5) * 0.11);
        leftArmRig.shoulderGroup.rotation.set(-0.4, 0, 1.28 + Math.sin(beat) * 0.52);
        leftArmRig.elbowGroup.rotation.set(-0.6 + Math.cos(beat) * 0.38, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.4, 0, -1.28 + Math.cos(beat) * 0.52);
        rightArmRig.elbowGroup.rotation.set(-0.6 + Math.sin(beat) * 0.38, 0, 0);
        leftLegObj.legGroup.rotation.x = Math.sin(beat) * 0.3;
        rightLegObj.legGroup.rotation.x = -Math.sin(beat) * 0.3;
      } else if (anim === "shy") {
        headGroup.rotation.set(0.18, 0.15, -0.09);
        leftArmRig.shoulderGroup.rotation.set(-0.35, 0.38, 0.12);
        leftArmRig.elbowGroup.rotation.set(-0.9, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(-0.35, -0.38, -0.12);
        rightArmRig.elbowGroup.rotation.set(-0.9, 0, 0);
      } else {
        // Natural Human Ambient Idle Motion
        headGroup.rotation.set(
          Math.sin(t * 1.4) * 0.035,
          Math.sin(t * 0.85) * 0.07,
          Math.cos(t * 1.1) * 0.025
        );
        leftArmRig.shoulderGroup.rotation.set(0.05, 0, 0.14 + Math.sin(t * 1.6) * 0.02);
        leftArmRig.elbowGroup.rotation.set(-0.2, 0, 0);
        rightArmRig.shoulderGroup.rotation.set(0.05, 0, -0.14 - Math.sin(t * 1.6) * 0.02);
        rightArmRig.elbowGroup.rotation.set(-0.2, 0, 0);
      }

      controls.update();
      renderer.render(scene, camera);
      afterDraw(tick);
    };

    afterDraw(tick);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 300);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  const gestureButtons: { id: AnjaliAnimationState; label: string }[] = [
    { id: "nodding", label: "🙂 Nod" },
    { id: "smiling", label: "😊 Smile" },
    { id: "wave", label: "👋 Wave" },
    { id: "explaining", label: "🙌 Explain" },
    { id: "thinking", label: "🤔 Think" },
    { id: "clap", label: "👏 Clap" },
    { id: "laugh", label: "😂 Laugh" },
    { id: "dancing", label: "💃 Dance" },
  ];

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-[28px] bg-gradient-to-b from-[#FFFFFF] via-[#FAF8F5] to-[#F1EDE4] border-2 border-[#18181b] overflow-hidden flex flex-col justify-between select-none shadow-[4px_4px_0px_#18181b]">
      {/* Top Status & Customization Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3.5 pt-3.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border-[1.5px] border-[#18181b] shadow-[2px_2px_0px_#18181b]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === "speaking" || isAudioPlaying
                ? "bg-orange-500 animate-ping"
                : state === "listening"
                ? "bg-emerald-500 animate-pulse"
                : "bg-blue-500"
            }`}
          />
          <span className="text-[11px] font-black text-stone-900 tracking-tight">
            {isBoyMentor ? "Realistic 3D Boy Mentor" : "Realistic 3D Girl Mentor"} • {activeAnim.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 1-Click Girl / Boy Realistic Model Switcher */}
          <div className="inline-flex items-center bg-white rounded-full p-0.5 border-[1.5px] border-[#18181b] shadow-[1.5px_1.5px_0px_#18181b]">
            <button
              type="button"
              onClick={() => setGenderOverride("girl")}
              className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                !isBoyMentor ? "bg-[#18181b] text-white" : "text-stone-700 hover:bg-stone-100"
              }`}
              title="Switch to Realistic Girl 3D Model"
            >
              👩 Girl 3D
            </button>
            <button
              type="button"
              onClick={() => setGenderOverride("boy")}
              className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                isBoyMentor ? "bg-[#18181b] text-white" : "text-stone-700 hover:bg-stone-100"
              }`}
              title="Switch to Realistic Boy 3D Model"
            >
              👦 Boy 3D
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomize((v) => !v)}
            className="px-3 py-1 rounded-full bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] text-[11px] font-bold text-stone-900 flex items-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#18181b]"
            title="Customize 3D Look"
          >
            <Sliders size={12} />
            <span className="hidden sm:inline">Look</span>
          </button>
          <button
            type="button"
            onClick={() => triggerAnim("idle")}
            className="p-1.5 rounded-full bg-white hover:bg-stone-100 border-[1.5px] border-[#18181b] text-stone-800 cursor-pointer shadow-[1.5px_1.5px_0px_#18181b]"
            title="Reset Pose"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Customization Drawer */}
      {showCustomize && (
        <div className="absolute top-14 right-3 z-30 w-60 p-3.5 rounded-2xl bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3 text-left pointer-events-auto">
          <div className="text-[11px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <UserCheck size={13} className="text-orange-500" /> Human 3D Look &amp; Attire
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>👓 Scholar Glasses</span>
            <input
              type="checkbox"
              checked={glasses}
              onChange={(e) => setGlasses(e.target.checked)}
              className="accent-stone-900 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>🎧 Studio Headset</span>
            <input
              type="checkbox"
              checked={headset}
              onChange={(e) => setHeadset(e.target.checked)}
              className="accent-stone-900 cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Blazer Color</span>
            <div className="grid grid-cols-4 gap-1">
              {(["navy", "cream", "emerald", "crimson"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBlazerTheme(c)}
                  className={`py-1 rounded-lg text-[10px] font-black capitalize border cursor-pointer ${
                    blazerTheme === c
                      ? "bg-[#18181b] text-white border-[#18181b]"
                      : "bg-stone-50 text-stone-700 border-stone-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Bottom Interactive Gesture Dock */}
      <div className="relative z-20 p-2.5 bg-white/95 backdrop-blur-md border-t-[1.5px] border-[#18181b] pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {gestureButtons.map((g) => {
            const isSelected = activeAnim === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => triggerAnim(g.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap border-[1.5px] border-[#18181b] transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#FF7A30]"
                    : "bg-white hover:bg-[#FEF08A] text-stone-900"
                }`}
              >
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
