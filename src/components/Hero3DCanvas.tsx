import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  Zap,
  FlaskConical,
  Box,
  Dna,
  Bot,
  Rotate3d,
  Play,
  Pause,
} from "lucide-react";

export type STEMModelMode = "physics" | "chemistry" | "math" | "biology" | "mentor";

export const Hero3DCanvas: React.FC = () => {
  const [modelMode, setModelMode] = useState<STEMModelMode>("biology");
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [quantumN, setQuantumN] = useState<number>(2);
  const mountRef = useRef<HTMLDivElement>(null);

  const liveStateRef = useRef({
    modelMode,
    isAutoRotate,
    quantumN,
  });

  useEffect(() => {
    liveStateRef.current = { modelMode, isAutoRotate, quantumN };
  }, [modelMode, isAutoRotate, quantumN]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 340);

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
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    // 1. Physics Group (Bohr Atom)
    const physicsGroup = new THREE.Group();
    scene.add(physicsGroup);
    for (let i = 0; i < 10; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xef4444 : 0x3b82f6,
          roughness: 0.25,
          metalness: 0.3,
        })
      );
      const phi = Math.acos(-1 + (2 * i) / 10);
      const theta = Math.sqrt(10 * Math.PI) * phi;
      p.position.set(
        0.28 * Math.cos(theta) * Math.sin(phi),
        0.28 * Math.sin(theta) * Math.sin(phi),
        0.28 * Math.cos(phi)
      );
      physicsGroup.add(p);
    }
    const electrons: { mesh: THREE.Mesh; radius: number; speed: number; tilt: number }[] = [];
    [1.25, 1.85, 2.4].forEach((r, idx) => {
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.set((idx + 1) * 0.65, idx * 0.5, 0);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.016, 12, 64),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      orbitGroup.add(ring);
      const el = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff7a30,
          emissive: 0xff7a30,
          emissiveIntensity: 0.6,
        })
      );
      orbitGroup.add(el);
      physicsGroup.add(orbitGroup);
      electrons.push({ mesh: el, radius: r, speed: 2.8 - idx * 0.6, tilt: idx });
    });

    // 2. Biology Group (3D DNA Double Helix)
    const biologyGroup = new THREE.Group();
    scene.add(biologyGroup);
    const rungCount = 16;
    for (let i = 0; i < rungCount; i++) {
      const y = (i - rungCount / 2) * 0.24;
      const angle = i * 0.45;
      const r = 1.05;
      const x1 = Math.cos(angle) * r;
      const z1 = Math.sin(angle) * r;
      const x2 = Math.cos(angle + Math.PI) * r;
      const z2 = Math.sin(angle + Math.PI) * r;

      const s1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.25 })
      );
      s1.position.set(x1, y, z1);
      biologyGroup.add(s1);

      const s2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.25 })
      );
      s2.position.set(x2, y, z2);
      biologyGroup.add(s2);

      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, r * 2, 10),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xf59e0b : 0xec4899,
          roughness: 0.35,
        })
      );
      bond.position.set(0, y, 0);
      bond.rotation.z = Math.PI / 2;
      bond.rotation.y = -angle;
      biologyGroup.add(bond);
    }

    // 3. Chemistry Group (Benzene Ring)
    const chemistryGroup = new THREE.Group();
    scene.add(chemistryGroup);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const cx = Math.cos(a) * 1.4;
      const cy = Math.sin(a) * 1.4;
      const carbon = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 })
      );
      carbon.position.set(cx, cy, 0);
      chemistryGroup.add(carbon);

      const hydrogen = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
      );
      hydrogen.position.set(Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0);
      chemistryGroup.add(hydrogen);
    }
    const piTop = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.18, 16, 48),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
      })
    );
    piTop.position.z = 0.42;
    chemistryGroup.add(piTop);

    const piBottom = piTop.clone();
    piBottom.position.z = -0.42;
    chemistryGroup.add(piBottom);

    // 4. Math Group (3D Vector & Torus Knot)
    const mathGroup = new THREE.Group();
    scene.add(mathGroup);
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.15, 0.28, 96, 20),
      new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        roughness: 0.22,
        metalness: 0.35,
      })
    );
    mathGroup.add(knot);

    // 5. Mentor AI Core Group
    const mentorGroup = new THREE.Group();
    scene.add(mentorGroup);
    const coreSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 2),
      new THREE.MeshStandardMaterial({
        color: 0xff7a30,
        roughness: 0.2,
        metalness: 0.4,
      })
    );
    mentorGroup.add(coreSphere);
    const gyroRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.04, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.2 })
    );
    mentorGroup.add(gyroRing1);
    const gyroRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.035, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.2 })
    );
    gyroRing2.rotation.x = Math.PI / 2;
    mentorGroup.add(gyroRing2);

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

      const { modelMode: mode, isAutoRotate: rot } = liveStateRef.current;

      physicsGroup.visible = mode === "physics";
      biologyGroup.visible = mode === "biology";
      chemistryGroup.visible = mode === "chemistry";
      mathGroup.visible = mode === "math";
      mentorGroup.visible = mode === "mentor";

      if (rot) {
        physicsGroup.rotation.y = t * 0.4;
        biologyGroup.rotation.y = t * 0.55;
        chemistryGroup.rotation.y = t * 0.45;
        chemistryGroup.rotation.x = Math.sin(t * 0.7) * 0.35;
        mathGroup.rotation.y = t * 0.5;
        mathGroup.rotation.x = t * 0.3;
        mentorGroup.rotation.y = t * 0.6;
        gyroRing1.rotation.x = t * 1.1;
        gyroRing2.rotation.y = -t * 0.9;
      }

      electrons.forEach((e, i) => {
        const a = t * e.speed + i * 1.5;
        e.mesh.position.set(Math.cos(a) * e.radius, Math.sin(a) * e.radius, 0);
      });

      controls.update();
      renderer.render(scene, camera);
      afterDraw(tick);
    };

    afterDraw(tick);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 300);
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

  const metadataMap: Record<
    STEMModelMode,
    {
      title: string;
      sub: string;
      formula: string;
      desc: string;
      points: string[];
      tag: string;
      badgeColor: string;
    }
  > = {
    biology: {
      title: "Molecular DNA Double Helix & Replication",
      sub: "WBCHSE Class 12 Biology • Unit II Genetics",
      formula: "A = T (2 H-Bonds)  |  G ≡ C (3 H-Bonds)  |  Pitch = 3.4 nm",
      desc: "Interactive 3D B-DNA double helix illustrating antiparallel sugar-phosphate backbones (5'→3' and 3'→5') and complementary base pairing.",
      points: [
        "10 base pairs per complete helical turn (0.34 nm rise per bp)",
        "Helicase unwinds replication fork; SSB proteins stabilize single strands",
        "Okazaki fragments synthesized discontinuously on lagging strand",
      ],
      tag: "BIOLOGY 3D LAB",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    physics: {
      title: "Bohr Quantum Atomic Model & Spectral Transitions",
      sub: "WBCHSE Class 12 Physics • Atoms & Nuclei",
      formula: "E_n = -13.6 / n² eV   |   L = n·h / 2π",
      desc: "Quantized electron orbitals around a dense proton-neutron nucleus demonstrating angular momentum quantization and photon emission.",
      points: [
        "Electrons revolve in stationary orbits without radiating energy",
        "Lyman (UV), Balmer (Visible), and Paschen (IR) spectral series",
        "Bohr radius r_n ∝ n² / Z (r₁ = 0.529 Å for Hydrogen)",
      ],
      tag: "PHYSICS 3D LAB",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    },
    chemistry: {
      title: "Benzene (C₆H₆) Resonance & Delocalized 6π Cloud",
      sub: "WBCHSE Class 12 Organic Chemistry • Aromaticity",
      formula: "sp² Hybridization  |  Bond Angle = 120°  |  C–C = 1.39 Å",
      desc: "Planar hexagonal carbon ring with unhybridized 2p_z orbitals overlapping above and below the ring to form a stable aromatic π-cloud.",
      points: [
        "Follows Hückel's (4n + 2) π-electron rule (n = 1 → 6 π electrons)",
        "Intermediate C–C bond length (1.39 Å) between single & double bond",
        "Undergoes Electrophilic Aromatic Substitution (Nitration, Friedel-Crafts)",
      ],
      tag: "CHEMISTRY 3D LAB",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    math: {
      title: "3D Parametric Manifold & Vector Calculus",
      sub: "WBCHSE Class 12 Mathematics • 3D Geometry & Calculus",
      formula: "r⃗(t) = x(t)î + y(t)ĵ + z(t)k̂   |   cos²α + cos²β + cos²γ = 1",
      desc: "Three-dimensional topological surface and direction cosine vectors for visualizing skew lines, planes, and spatial integration.",
      points: [
        "Shortest distance between skew lines: |[b⃗₁ × b⃗₂ · (a⃗₂ - a⃗₁)]| / |b⃗₁ × b⃗₂|",
        "Normal vector to plane ax + by + cz + d = 0 is n⃗ = aî + bĵ + ck̂",
        "Cross product magnitude gives area of spatial parallelogram",
      ],
      tag: "MATH 3D LAB",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    },
    mentor: {
      title: "Study Stranger 3D Neural Reasoning Core",
      sub: "Bilingual Bengali + English AI Engine",
      formula: "Real-Time Voice + 3D Gesture Sync + WBCHSE Grounding",
      desc: "Multi-axis gyroscopic 3D core synchronizing live speech recognition, KaTeX whiteboard derivations, and 3D mentor animations.",
      points: [
        "Context-grounded in WBCHSE Class 12 Semester 3 curriculum",
        "Automatic mistake diagnosis & personalized revision flashcards",
        "Supports 1000MB PDF study vault & instant chapter summaries",
      ],
      tag: "AI MENTOR CORE",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    },
  };

  const currentMeta = metadataMap[modelMode];

  return (
    <div className="w-full bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-5 sm:p-7 space-y-5">
      {/* Header & Subject Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-[1.5px] border-[#18181b] ${currentMeta.badgeColor}`}
          >
            {currentMeta.tag}
          </span>
          <span className="text-xs sm:text-sm text-slate-700 font-extrabold">
            Interactive 3D Spatial Science &amp; Math Studio
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F6EF] rounded-2xl border-[1.5px] border-[#18181b]">
          {(
            [
              { id: "biology", label: "Biology", icon: Dna },
              { id: "physics", label: "Physics", icon: Zap },
              { id: "chemistry", label: "Chemistry", icon: FlaskConical },
              { id: "math", label: "Math", icon: Box },
              { id: "mentor", label: "AI Core", icon: Bot },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = modelMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModelMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  active
                    ? "bg-[#18181b] text-white shadow-xs"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split View: Clean Light 3D Viewport + Formula Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 relative h-[340px] sm:h-[380px] w-full rounded-[24px] bg-gradient-to-b from-[#FFFFFF] via-[#F7F6EF] to-[#EDF7F0] overflow-hidden border-2 border-[#18181b] shadow-inner">
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-white border-[1.5px] border-[#18181b] text-[11px] font-mono text-slate-900 font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#18181b]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              3D Interactive WebGL Stage
            </span>

            <button
              type="button"
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className="pointer-events-auto p-2 rounded-xl bg-white hover:bg-slate-100 border-[1.5px] border-[#18181b] text-slate-900 cursor-pointer shadow-[2px_2px_0px_#18181b]"
              title={isAutoRotate ? "Pause Rotation" : "Resume Rotation"}
            >
              {isAutoRotate ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 border-[1.5px] border-[#18181b] text-[11px] font-bold text-slate-800 pointer-events-none shadow-xs">
            <Rotate3d size={13} className="text-orange-600" />
            <span>Drag to rotate 360° in 3D space</span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 text-left">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-600 block">
              {currentMeta.sub}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {currentMeta.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {currentMeta.desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F6EF] border-2 border-[#18181b] space-y-1.5 shadow-[3px_3px_0px_#18181b]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Key Board Formula &amp; Constant
            </span>
            <code className="text-xs font-mono font-black text-slate-900 bg-[#FEF08A] px-2.5 py-1.5 rounded-lg border border-[#18181b] block">
              {currentMeta.formula}
            </code>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
              WBCHSE Semester 3 Exam Takeaways:
            </span>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium">
              {currentMeta.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black shrink-0 mt-0.5">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {modelMode === "physics" && (
            <button
              type="button"
              onClick={() => setQuantumN((prev) => (prev % 3) + 1)}
              className="px-4 py-2 rounded-xl bg-[#18181b] text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#3b82f6]"
            >
              <Zap size={14} className="text-amber-300" />
              <span>Trigger Quantum Jump (n = {quantumN})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
