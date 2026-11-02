import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Atom, 
  FlaskConical, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Calculator, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Check, 
  Maximize2, 
  Minimize2,
  X,
  Flame,
  Info,
  RotateCcw
} from "lucide-react";

export type ScienceSubject = "chemistry" | "physics" | "math" | "biology";

interface ScienceLab3DProps {
  initialSubject?: ScienceSubject;
  isModal?: boolean;
  onClose?: () => void;
  onExploreTopic?: (topic: string) => void;
}

export const ScienceLab3D: React.FC<ScienceLab3DProps> = ({
  initialSubject = "chemistry",
  isModal = false,
  onClose,
  onExploreTopic
}) => {
  const [activeSubject, setActiveSubject] = useState<ScienceSubject>(initialSubject);
  const [activeModelId, setActiveModelId] = useState<string>("benzene");
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [quantumJump, setQuantumJump] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({ x: 0.35, y: 0.45 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Models catalog
  const models = {
    chemistry: [
      {
        id: "benzene",
        name: "Benzene Ring (C₆H₆)",
        bengaliName: "বেনজিন বলয় ও পাই-ইলেকট্রন মেঘ",
        tag: "Organic Chemistry",
        formula: "C₆H₆ · 120° Sp²",
        desc: "Planar aromatic ring with delocalized π-electrons (Hückel's 4n+2 rule). All 6 C-C bonds have equal bond length (1.39 Å).",
        wbchseNotes: "WBCHSE Class 12 Sem 3: Important for aromatic electrophilic substitution & resonance stabilization energy (150.6 kJ/mol).",
        colorTheme: "from-amber-500 to-orange-600"
      },
      {
        id: "water",
        name: "Water Dipole (H₂O)",
        bengaliName: "জলীয় অণু (দ্বিমেরু গঠন)",
        tag: "Inorganic & Chemical Bonding",
        formula: "H₂O · 104.5° Bent",
        desc: "Bent V-shaped geometry with 104.5° bond angle due to 2 lone pairs on Oxygen (sp³ hybridized). Strong dipole moment (1.85 D).",
        wbchseNotes: "Hydrogen bonding causes abnormally high boiling point and capillary action in biological systems.",
        colorTheme: "from-cyan-500 to-blue-600"
      },
      {
        id: "methane",
        name: "Methane Tetrahedron (CH₄)",
        bengaliName: "মিথেন চতুস্তলক কাঠামো",
        tag: "Organic Foundations",
        formula: "CH₄ · 109.5° sp³",
        desc: "Regular tetrahedral geometry with 109.5° bond angles and 4 equivalent C-H σ-bonds formed by sp³ hybrid orbitals.",
        wbchseNotes: "Foundation of alkane hydrocarbon structures and non-polar tetrahedral bonding in Class 12.",
        colorTheme: "from-emerald-500 to-teal-600"
      },
      {
        id: "nacl",
        name: "NaCl Crystal Lattice",
        bengaliName: "সোডিয়াম ক্লোরাইড কেলাস (FCC)",
        tag: "Solid State",
        formula: "Na⁺Cl⁻ · 6:6 Coord",
        desc: "Face-Centered Cubic (FCC) crystal lattice. Each Na⁺ ion is octahedrally surrounded by 6 Cl⁻ ions with coordination number 6:6.",
        wbchseNotes: "High lattice enthalpy (788 kJ/mol) and ionic cleavage planes in solid state syllabus.",
        colorTheme: "from-purple-500 to-indigo-600"
      }
    ],
    physics: [
      {
        id: "bohr_atom",
        name: "Bohr Quantum Atom",
        bengaliName: "বোর কোয়ান্টাম পরমাণু মডেল",
        tag: "Modern Physics",
        formula: "E_n = -13.6/n² eV",
        desc: "Quantized circular electron orbits around proton nucleus. When an electron transitions between shells, a photon is emitted or absorbed (ΔE = hν).",
        wbchseNotes: "WBCHSE Sem 3: Lyman (UV), Balmer (Visible), Paschen (Infrared) spectral series derivations.",
        colorTheme: "from-blue-500 to-cyan-500"
      },
      {
        id: "em_wave",
        name: "3D Electromagnetic Wave",
        bengaliName: "তড়িৎ-চুম্বকীয় তরঙ্গ বিস্তার",
        tag: "Optics & Wave Physics",
        formula: "c = 1 / √(μ₀ε₀)",
        desc: "Self-propagating oscillation of orthogonal Electric field E⃗ and Magnetic field B⃗ in phase, transverse to direction of propagation.",
        wbchseNotes: "Poynting vector S⃗ = (1/μ₀)(E⃗ × B⃗) represents directional energy flux density.",
        colorTheme: "from-rose-500 to-purple-600"
      },
      {
        id: "lorentz_field",
        name: "Lorentz Helical Motion",
        bengaliName: "লরেঞ্জ বল ও সাইক্লোট্রন সর্পিলাকার গতি",
        tag: "Magnetism & Currents",
        formula: "F⃗ = q(E⃗ + v⃗ × B⃗)",
        desc: "A charged particle injected at an angle θ into a magnetic field follows a 3D helical spiral trajectory with radius r = mvsinθ / qB.",
        wbchseNotes: "Cyclotron principle, pitch of helix, and particle accelerators in WBCHSE syllabus.",
        colorTheme: "from-amber-500 to-rose-600"
      }
    ],
    math: [
      {
        id: "saddle_surface",
        name: "Hyperbolic Paraboloid (Saddle)",
        bengaliName: "হাইপারবোলিক প্যারাবোলয়েড (স্যাডেল পৃষ্ঠ)",
        tag: "3D Geometry & Calculus",
        formula: "z = x² - y²",
        desc: "Doubly ruled quadric surface featuring a saddle point at (0,0) where partial derivatives vanish (critical point with Hessian < 0).",
        wbchseNotes: "Crucial for 3D coordinate geometry, tangent planes, and extrema of two-variable functions in Class 12.",
        colorTheme: "from-fuchsia-500 to-purple-600"
      },
      {
        id: "torus_donut",
        name: "3D Torus Manifold",
        bengaliName: "ত্রিমাত্রিক টোরাস ম্যানিফোল্ড",
        tag: "Topology & Vector Calc",
        formula: "(R - √(x²+y²))² + z² = r²",
        desc: "Surface of revolution generated by revolving a circle in three-dimensional space about an axis coplanar with the circle.",
        wbchseNotes: "Volume = 2π²Rr², Surface Area = 4π²Rr. Used in multivariable surface integrals.",
        colorTheme: "from-indigo-500 to-cyan-500"
      },
      {
        id: "wave_surface",
        name: "Bessel Wave Surface",
        bengaliName: "দ্বিমাত্রিক তরঙ্গ প্যাটার্ন",
        tag: "Differential Equations",
        formula: "z = cos(√(x²+y²) - t)",
        desc: "Concentric circular ripple interference pattern with radial decay, solving the 2D wave equation in polar coordinates.",
        wbchseNotes: "2D wave equation in polar coordinates and circular membrane vibration modes.",
        colorTheme: "from-cyan-500 to-emerald-500"
      }
    ],
    biology: [
      {
        id: "dna_helix",
        name: "DNA Double Helix (B-DNA)",
        bengaliName: "ডিএনএ দ্বি-তন্ত্রী গঠন ও বেস-পেয়ারিং",
        tag: "Molecular Genetics",
        formula: "A=T (2 bonds) · G≡C (3 bonds)",
        desc: "Right-handed antiparallel double helix with 10 base pairs per turn (pitch 3.4 nm). Sugar-phosphate backbone on outside.",
        wbchseNotes: "WBCHSE Unit II: Replication fork, SSB proteins, DNA Polymerase III, and Chargaff's rule.",
        colorTheme: "from-emerald-500 to-teal-600"
      },
      {
        id: "sperm_anatomy",
        name: "Human Sperm 3D Structure",
        bengaliName: "মানব শুক্রাণু অঙ্গসংস্থান (ZP3 রিসেপ্টর)",
        tag: "Reproduction Unit I",
        formula: "Head (Acrosome) + Midpiece + Tail",
        desc: "Acrosome cap containing hyaluronidase enzyme for ZP3 receptor penetration, spiral mitochondria midpiece, and 9+2 axoneme flagellum.",
        wbchseNotes: "Class 12 Sem 3 must-know: Acrosome reaction, ZP3 binding, and capacitation in female genital tract.",
        colorTheme: "from-sky-500 to-indigo-600"
      }
    ]
  };

  // Sync active model if subject changes
  useEffect(() => {
    const list = models[activeSubject];
    if (list && list.length > 0) {
      if (!list.find(m => m.id === activeModelId)) {
        setActiveModelId(list[0].id);
      }
    }
  }, [activeSubject]);

  const currentModel = 
    models[activeSubject]?.find(m => m.id === activeModelId) || models.chemistry[0];

  // 3D Canvas Projection Helpers
  function project3D(x: number, y: number, z: number, rot: { x: number; y: number }, cx: number, cy: number) {
    // Rotate Y
    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // Rotate X
    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective projection
    const fov = 420;
    const scale = fov / (fov + z2 + 300);
    return {
      x: cx + x1 * scale,
      y: cy + y2 * scale,
      scale,
      z: z2
    };
  }

  // 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const updateCanvasSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width || canvas.parentElement?.clientWidth || 360;
      const h = rect.height || canvas.parentElement?.clientHeight || 320;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Dark / Light Background with radial cosmic aura
      const isDark = document.documentElement.classList.contains("dark");
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.7);
      if (isDark) {
        grad.addColorStop(0, "#1c1917");
        grad.addColorStop(0.7, "#0c0a09");
        grad.addColorStop(1, "#050403");
      } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.7, "#fdfcf9");
        grad.addColorStop(1, "#f4eee4");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Auto rotation
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current.y += 0.008;
      }

      // Responsive scale based on canvas resolution & zoom
      const responsiveScale = (Math.min(width, height) / (440 * dpr)) * zoomLevel * dpr;

      // Draw subtle 3D coordinate ground grid
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(200, 195, 185, 0.45)";
      ctx.lineWidth = 1 * dpr;
      const gridCount = 5;
      const gridSize = 40 * responsiveScale;
      ctx.beginPath();
      for (let i = -gridCount; i <= gridCount; i++) {
        const p1 = project3D(i * gridSize, 130 * responsiveScale, -gridCount * gridSize, rotationRef.current, cx, cy);
        const p2 = project3D(i * gridSize, 130 * responsiveScale, gridCount * gridSize, rotationRef.current, cx, cy);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        const p3 = project3D(-gridCount * gridSize, 130 * responsiveScale, i * gridSize, rotationRef.current, cx, cy);
        const p4 = project3D(gridCount * gridSize, 130 * responsiveScale, i * gridSize, rotationRef.current, cx, cy);
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
      }
      ctx.stroke();

      // Render Selected Model
      switch (activeModelId) {
        case "benzene":
          drawBenzene(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe, time);
          break;
        case "water":
          drawWater(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe);
          break;
        case "methane":
          drawMethane(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe);
          break;
        case "nacl":
          drawNaCl(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe);
          break;
        case "bohr_atom":
          drawBohrAtom(ctx, cx, cy, rotationRef.current, responsiveScale, quantumJump, time);
          break;
        case "em_wave":
          drawEMWave(ctx, cx, cy, rotationRef.current, responsiveScale, time);
          break;
        case "lorentz_field":
          drawLorentzField(ctx, cx, cy, rotationRef.current, responsiveScale, time);
          break;
        case "saddle_surface":
          drawSaddleSurface(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe);
          break;
        case "torus_donut":
          drawTorus(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe, time);
          break;
        case "wave_surface":
          drawWaveSurface(ctx, cx, cy, rotationRef.current, responsiveScale, time);
          break;
        case "dna_helix":
          drawDNA(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe, time);
          break;
        case "sperm_anatomy":
          drawSpermAnatomy(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe, time);
          break;
        default:
          drawBenzene(ctx, cx, cy, rotationRef.current, responsiveScale, isWireframe, time);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [activeModelId, isRotating, zoomLevel, isWireframe, quantumJump]);

  // 1. Benzene Ring Model
  function drawBenzene(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean, time: number) {
    const r = 85 * zoom;
    const carbonNodes: { x: number; y: number; z: number }[] = [];
    const hydrogenNodes: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      carbonNodes.push({
        x: Math.cos(angle) * r,
        y: 0,
        z: Math.sin(angle) * r
      });
      hydrogenNodes.push({
        x: Math.cos(angle) * (r + 48 * zoom),
        y: 0,
        z: Math.sin(angle) * (r + 48 * zoom)
      });
    }

    // Connect C-C ring bonds
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4 * zoom;
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      const p1 = project3D(carbonNodes[i].x, carbonNodes[i].y, carbonNodes[i].z, rot, cx, cy);
      const p2 = project3D(carbonNodes[next].x, carbonNodes[next].y, carbonNodes[next].z, rot, cx, cy);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // C-H bonds
      const pH = project3D(hydrogenNodes[i].x, hydrogenNodes[i].y, hydrogenNodes[i].z, rot, cx, cy);
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(pH.x, pH.y);
      ctx.stroke();
    }

    // Delocalized π-electron cloud toroids (Top and Bottom of ring)
    const piR = 52 * zoom;
    for (const yOffset of [-24 * zoom, 24 * zoom]) {
      ctx.strokeStyle = "rgba(255, 122, 48, 0.75)";
      ctx.lineWidth = 3 * zoom;
      ctx.setLineDash([6 * zoom, 4 * zoom]);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
        const px = Math.cos(a + time * 1.5) * piR;
        const pz = Math.sin(a + time * 1.5) * piR;
        const proj = project3D(px, yOffset, pz, rot, cx, cy);
        if (a === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Hydrogen atoms (white/light blue)
    for (let i = 0; i < 6; i++) {
      const p = project3D(hydrogenNodes[i].x, hydrogenNodes[i].y, hydrogenNodes[i].z, rot, cx, cy);
      ctx.fillStyle = "#E2E8F0";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7 * p.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#64748B";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Carbon atoms (dark gray/black)
    for (let i = 0; i < 6; i++) {
      const p = project3D(carbonNodes[i].x, carbonNodes[i].y, carbonNodes[i].z, rot, cx, cy);
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11 * p.scale * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = "#94A3B8";
      ctx.beginPath();
      ctx.arc(p.x - 3 * p.scale * zoom, p.y - 3 * p.scale * zoom, 3 * p.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Water Molecule
  function drawWater(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean) {
    const pO = project3D(0, -25 * zoom, 0, rot, cx, cy);
    const pH1 = project3D(-55 * zoom, 35 * zoom, 0, rot, cx, cy);
    const pH2 = project3D(55 * zoom, 35 * zoom, 0, rot, cx, cy);

    // O-H Bonds
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pH1.x, pH1.y);
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pH2.x, pH2.y);
    ctx.stroke();

    // Dipole vector arrow
    const pArrow = project3D(0, -90 * zoom, 0, rot, cx, cy);
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pArrow.x, pArrow.y);
    ctx.stroke();

    // Oxygen Atom (Red)
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(pO.x, pO.y, 22 * pO.scale * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Hydrogen Atoms (White)
    for (const pH of [pH1, pH2]) {
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.arc(pH.x, pH.y, 13 * pH.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#64748B";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 3. Methane Model
  function drawMethane(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean) {
    const pC = project3D(0, 0, 0, rot, cx, cy);
    const d = 60 * zoom;
    const hNodes = [
      project3D(0, -d * 1.2, 0, rot, cx, cy),
      project3D(d * 1.1, d * 0.5, 0, rot, cx, cy),
      project3D(-d * 0.55, d * 0.5, d * 0.95, rot, cx, cy),
      project3D(-d * 0.55, d * 0.5, -d * 0.95, rot, cx, cy)
    ];

    // Bonds
    ctx.strokeStyle = "#64748B";
    ctx.lineWidth = 4 * zoom;
    for (const h of hNodes) {
      ctx.beginPath();
      ctx.moveTo(pC.x, pC.y);
      ctx.lineTo(h.x, h.y);
      ctx.stroke();
    }

    // Carbon (Black)
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(pC.x, pC.y, 16 * pC.scale * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Hydrogens (White)
    for (const h of hNodes) {
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.arc(h.x, h.y, 11 * h.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#64748B";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 4. NaCl Lattice
  function drawNaCl(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean) {
    const size = 3;
    const spacing = 38 * zoom;
    const offset = ((size - 1) * spacing) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;

          const proj = project3D(px, py, pz, rot, cx, cy);
          const isNa = (x + y + z) % 2 === 0;

          ctx.fillStyle = isNa ? "#8B5CF6" : "#10B981"; // Purple Na+, Green Cl-
          const r = isNa ? 8 * proj.scale * zoom : 12 * proj.scale * zoom;

          ctx.beginPath();
          ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // 5. Bohr Quantum Atom
  function drawBohrAtom(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, jump: boolean, time: number) {
    // Nucleus (Proton / Neutron cluster)
    const pNuc = project3D(0, 0, 0, rot, cx, cy);
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(pNuc.x, pNuc.y, 14 * pNuc.scale * zoom, 0, Math.PI * 2);
    ctx.fill();

    // 3 Concentric Orbits (n=1, n=2, n=3)
    const radii = [45 * zoom, 80 * zoom, 120 * zoom];
    radii.forEach((r, idx) => {
      ctx.strokeStyle = idx === 1 ? "rgba(59, 130, 246, 0.8)" : "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
        const p = project3D(Math.cos(a) * r, 0, Math.sin(a) * r, rot, cx, cy);
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    });

    // Orbiting Electrons
    const speeds = [3, 2, 1.2];
    radii.forEach((r, idx) => {
      const a = time * speeds[idx];
      const pEl = project3D(Math.cos(a) * r, 0, Math.sin(a) * r, rot, cx, cy);
      ctx.fillStyle = "#38BDF8";
      ctx.beginPath();
      ctx.arc(pEl.x, pEl.y, 6 * pEl.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
    });

    // Photon Jump visual emission
    if (jump) {
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      for (let i = 0; i < 15; i++) {
        const waveX = Math.cos(time * 8 + i * 0.4) * 6 * zoom;
        const proj = project3D(radii[2] - i * 4 * zoom, waveX, 0, rot, cx, cy);
        if (i === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.stroke();
    }
  }

  // 6. EM Wave
  function drawEMWave(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, time: number) {
    const length = 240 * zoom;
    const points = 40;

    for (let i = 0; i < points; i++) {
      const x = -length / 2 + (i / points) * length;
      const phase = (x / (40 * zoom)) - time * 3;
      const ey = Math.sin(phase) * (45 * zoom);
      const bz = Math.sin(phase) * (45 * zoom);

      // Electric field vector (Red)
      const pZero = project3D(x, 0, 0, rot, cx, cy);
      const pE = project3D(x, -ey, 0, rot, cx, cy);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(pZero.x, pZero.y);
      ctx.lineTo(pE.x, pE.y);
      ctx.stroke();

      // Magnetic field vector (Blue)
      const pB = project3D(x, 0, bz, rot, cx, cy);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(pZero.x, pZero.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();
    }
  }

  // 7. Lorentz Field
  function drawLorentzField(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, time: number) {
    // Magnetic field lines (B⃗ vertical)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
    ctx.lineWidth = 1.5 * zoom;
    for (let x = -80 * zoom; x <= 80 * zoom; x += 40 * zoom) {
      for (let z = -80 * zoom; z <= 80 * zoom; z += 40 * zoom) {
        const p1 = project3D(x, -100 * zoom, z, rot, cx, cy);
        const p2 = project3D(x, 100 * zoom, z, rot, cx, cy);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // 3D Helical trajectory
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    for (let t = 0; t < 30; t += 0.2) {
      const r = 45 * zoom;
      const angle = t * 2 - time * 4;
      const y = -100 * zoom + t * 7 * zoom;
      const p = project3D(Math.cos(angle) * r, y, Math.sin(angle) * r, rot, cx, cy);
      if (t === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // 8. Hyperbolic Paraboloid Saddle
  function drawSaddleSurface(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean) {
    const steps = 14;
    const range = 65 * zoom;

    ctx.strokeStyle = "#8B5CF6";
    ctx.lineWidth = 1.8 * zoom;

    for (let i = -steps; i <= steps; i++) {
      const x = (i / steps) * range;
      ctx.beginPath();
      for (let j = -steps; j <= steps; j++) {
        const y = (j / steps) * range;
        const z = (x * x - y * y) / (45 * zoom);
        const p = project3D(x, z, y, rot, cx, cy);
        if (j === -steps) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  // 9. 3D Torus
  function drawTorus(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean, time: number) {
    const R = 60 * zoom;
    const r = 24 * zoom;
    const rings = 14;
    const segments = 18;

    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 1.5 * zoom;

    for (let i = 0; i < rings; i++) {
      const u = (i / rings) * Math.PI * 2;
      ctx.beginPath();
      for (let j = 0; j <= segments; j++) {
        const v = (j / segments) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = r * Math.sin(v);
        const z = (R + r * Math.cos(v)) * Math.sin(u);
        const p = project3D(x, y, z, rot, cx, cy);
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  // 10. Bessel Wave Surface
  function drawWaveSurface(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, time: number) {
    const steps = 16;
    const size = 80 * zoom;

    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.6 * zoom;

    for (let i = -steps; i <= steps; i++) {
      const x = (i / steps) * size;
      ctx.beginPath();
      for (let j = -steps; j <= steps; j++) {
        const y = (j / steps) * size;
        const dist = Math.sqrt(x * x + y * y);
        const z = Math.sin(dist * 0.1 - time * 3) * (18 * zoom) * Math.exp(-dist * 0.015);
        const p = project3D(x, z, y, rot, cx, cy);
        if (j === -steps) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  // 11. DNA Double Helix
  function drawDNA(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean, time: number) {
    const turns = 2.5;
    const points = 45;
    const r = 38 * zoom;
    const height = 230 * zoom;

    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2 * turns;
      const y = -height / 2 + (i / points) * height;

      const p1 = project3D(Math.cos(a) * r, y, Math.sin(a) * r, rot, cx, cy);
      const p2 = project3D(Math.cos(a + Math.PI) * r, y, Math.sin(a + Math.PI) * r, rot, cx, cy);

      // Base pair ladder rung (A=T or G≡C)
      if (i % 2 === 0) {
        ctx.strokeStyle = i % 4 === 0 ? "#10B981" : "#F59E0B";
        ctx.lineWidth = 3.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Strand 1 node
      ctx.fillStyle = "#3B82F6";
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 4.5 * p1.scale * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Strand 2 node
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, 4.5 * p2.scale * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 12. Human Sperm Anatomy
  function drawSpermAnatomy(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: any, zoom: number, wire: boolean, time: number) {
    // Head (oval)
    const pHead = project3D(-70 * zoom, 0, 0, rot, cx, cy);
    ctx.fillStyle = "#38BDF8";
    ctx.beginPath();
    ctx.ellipse(pHead.x, pHead.y, 22 * zoom, 14 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acrosome cap
    ctx.fillStyle = "#0284C7";
    ctx.beginPath();
    ctx.ellipse(pHead.x - 10 * zoom, pHead.y, 10 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Midpiece with spiral mitochondria
    const pMid = project3D(-35 * zoom, 0, 0, rot, cx, cy);
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(pMid.x, pMid.y - 6 * zoom, 30 * zoom, 12 * zoom);

    // Tail (undulating sine wave)
    ctx.strokeStyle = "#64748B";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pMid.x + 30 * zoom, pMid.y);
    for (let x = 0; x <= 140 * zoom; x += 5) {
      const wave = Math.sin((x * 0.08) - time * 6) * (14 * (x / (140 * zoom)));
      ctx.lineTo(pMid.x + 30 * zoom + x, pMid.y + wave);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = document.documentElement.classList.contains("dark") ? "#E2E8F0" : "#0F172A";
    ctx.font = `bold ${Math.max(10, Math.floor(11 * zoom))}px sans-serif`;
    ctx.fillText("Acrosome (ZP3 Receptor)", pHead.x - 30, pHead.y - 20);
    ctx.fillText("Midpiece (Mitochondria)", pMid.x - 10, pMid.y + 24);
  }

  // Mouse Interaction handlers for 3D manual rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setIsRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    rotationRef.current.y += dx * 0.008;
    rotationRef.current.x += dy * 0.008;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsRotating(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMousePosRef.current.x;
    const dy = e.touches[0].clientY - lastMousePosRef.current.y;
    rotationRef.current.y += dx * 0.008;
    rotationRef.current.x += dy * 0.008;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    rotationRef.current = { x: 0.35, y: 0.45 };
    setZoomLevel(1);
    setIsRotating(true);
  };

  return (
    <div className={`relative w-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col ${
      isFullscreen ? "fixed inset-0 z-[200] rounded-none h-screen w-screen p-0 m-0" : ""
    }`}>
      {/* 1. Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 border-b border-stone-100 dark:border-stone-800 bg-[#FBF9F6] dark:bg-stone-950">
        
        {/* Left Title & Live Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-amber-500 text-white flex items-center justify-center shadow-md shadow-[#FF7A30]/20 shrink-0">
            <Atom size={18} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A30] bg-[#FF7A30]/10 px-2 py-0.5 rounded-full">
                3D Science Lab
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-base font-black text-stone-900 dark:text-white tracking-tight">
              Interactive 3D Visualizer
            </h3>
          </div>
        </div>

        {/* Center Subject Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/90 dark:bg-stone-800/90 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 overflow-x-auto scrollbar-hide max-w-full">
          {[
            { id: "chemistry", label: "🧪 Chemistry" },
            { id: "physics", label: "⚡ Physics" },
            { id: "math", label: "📐 Math" },
            { id: "biology", label: "🧬 Biology" },
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id as ScienceSubject)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeSubject === sub.id
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-stone-700"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Right Tools & Fullscreen */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isRotating ? "bg-[#FF7A30]/10 border-[#FF7A30]/30 text-[#FF7A30]" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300"
            }`}
            title={isRotating ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))}
            className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.65))}
            className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={resetView}
            className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
            title="Reset 3D View"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Model Selection Sub-bar */}
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-stone-50/80 dark:bg-stone-950/80 border-b border-stone-100 dark:border-stone-800 overflow-x-auto scrollbar-hide">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 shrink-0">
          Models:
        </span>
        {models[activeSubject]?.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModelId(m.id)}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModelId === m.id
                ? "bg-[#FF7A30] text-white shadow-xs"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-stone-300"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 3. Pure 3D Canvas Viewport (Unobstructed & Clean on all screens) */}
      <div className={`relative w-full bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none ${
        isFullscreen ? "flex-1 min-h-[420px]" : "h-[300px] sm:h-[380px] md:h-[440px]"
      }`}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block"
        />

        {/* 360° Touch Instruction Badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300 shadow-xs flex items-center gap-1.5">
            <RotateCw size={11} className="text-[#FF7A30]" />
            <span>Touch / Drag to rotate 360°</span>
          </div>
        </div>

        {/* Model-specific Trigger (Photon Jump) */}
        {activeModelId === "bohr_atom" && (
          <div className="absolute bottom-3 left-3 z-10">
            <button
              onClick={() => {
                setQuantumJump(true);
                setTimeout(() => setQuantumJump(false), 2400);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Trigger Photon Jump (n=3 → n=2)</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Dedicated Model Details & Exam Notes Section (Placed below canvas so 3D model is 100% visible on mobile) */}
      <div className="p-3.5 sm:p-5 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#FF7A30] tracking-wider">
                {currentModel.tag}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700">
                {currentModel.formula}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white leading-snug">
              {currentModel.name} · <span className="text-[#FF7A30]">{currentModel.bengaliName}</span>
            </h4>
          </div>

          {onExploreTopic && (
            <button
              onClick={() => onExploreTopic(currentModel.name)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#FF7A30] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-center"
            >
              <span>Explore Chapter</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
          {currentModel.desc}
        </p>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-2">
          <span className="text-sm">💡</span>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
            {currentModel.wbchseNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
