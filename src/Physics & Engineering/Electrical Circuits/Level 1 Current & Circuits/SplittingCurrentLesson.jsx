import React, { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, RotateCcw, Check, ArrowRight, Trophy, Zap, MousePointer2, Lightbulb, AlertCircle } from "lucide-react";

// --------------------------------------------------------
// Sound System
// --------------------------------------------------------
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/win.mp3",
  error: "/audio/matrix_intro.mp3",
  snap: "/audio/matrix_intro.mp3",
};

const playSound = (key) => {
  try {
    const audio = new Audio(SOUNDS[key]);
    if (key === "win") audio.volume = 0.6;
    else if (key === "snap") audio.volume = 0.2;
    else audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
};

// --------------------------------------------------------
// SVG Components
// --------------------------------------------------------
function Battery({ x, y, w = 120, h = 34 }) {
  return (
    <g filter="url(#dropShadow)">
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#1e293b" />
      <rect x={x + w - 26} y={y + 4} width={22} height={h - 8} rx={6} fill="#f59e0b" />
      <rect x={x + w} y={y + h * 0.35} width={10} height={h * 0.3} rx={3} fill="#94a3b8" />
      <text x={x + 12} y={y + 24} fill="#94a3b8" fontSize="16" fontWeight="bold" fontFamily="monospace" letterSpacing="1px">POWER</text>
    </g>
  );
}

function Bulb({ cx, cy, current = 1, isSelected, onClick, isCorrect, showResult }) {
  // Visual scaling based on current (1.0 = Main Path, 0.5 = Split Path)
  const brightness = current; 
  const opacity = 0.5 + (0.5 * brightness);
  
  let ringColor = "transparent";
  if (isSelected) ringColor = "#6366f1"; // Blue selection
  if (showResult && isSelected) {
    ringColor = isCorrect ? "#22c55e" : "#ef4444"; // Green/Red result
  }

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} className="group">
      <defs>
        <filter id={`bulbGlow-${brightness}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={12 * brightness} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="bulbHalo" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Selection Ring */}
      <circle 
        cx={cx} cy={cy} r={48} 
        fill="none" 
        stroke={ringColor} 
        strokeWidth={isSelected ? 4 : 0}
        className="transition-all duration-300"
      />
      
      {/* Hover Indicator */}
      {!isSelected && !showResult && (
        <circle cx={cx} cy={cy} r={48} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 6" className="opacity-0 group-hover:opacity-40 transition-opacity" />
      )}

      {/* Result Badge */}
      {isSelected && showResult && (
        <text x={cx} y={cy + 75} textAnchor="middle" fill={ringColor} fontSize="14" fontWeight="900" letterSpacing="1px">
          {isCorrect ? "CORRECT" : "TRY AGAIN"}
        </text>
      )}

      {/* Light Glow */}
      <circle cx={cx} cy={cy} r={50} fill="url(#bulbHalo)" filter={`url(#bulbGlow-${brightness})`} opacity={opacity} />

      {/* Hardware */}
      <rect x={cx - 14} y={cy + 18} width={28} height={16} rx={6} fill="#334155" />
      <rect x={cx - 10} y={cy + 22} width={20} height={3} rx={1} fill="#64748b" />
      <rect x={cx - 10} y={cy + 28} width={20} height={3} rx={1} fill="#64748b" />
      <circle cx={cx} cy={cy} r={24} fill={brightness > 0 ? "#fffbeb" : "#f1f5f9"} stroke="#475569" strokeWidth="2" />
      
      {/* Filament */}
      <path 
        d={`M ${cx - 8} ${cy + 12} C ${cx - 8} ${cy - 12}, ${cx + 8} ${cy - 12}, ${cx + 8} ${cy + 12}`} 
        fill="none" 
        stroke={brightness >= 1 ? "#f59e0b" : "#d97706"} 
        strokeWidth={3} 
        strokeLinecap="round" 
      />
    </g>
  );
}

function WirePath({ d, current = 1 }) {
  // Speed depends on current. 1.0 = Fast, 0.5 = Slower.
  // animation-duration is inverse of speed.
  const animDuration = 1 / current * 0.8; 

  return (
    <g>
      {/* Base Wire */}
      <path d={d} fill="none" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      {/* Core Color (Brighter for higher current) */}
      <path 
        d={d} 
        fill="none" 
        stroke={current >= 1 ? "#f59e0b" : "#d97706"} 
        strokeWidth={4 + (2 * current)} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity={0.5 + (0.5 * current)} 
      />
      {/* Flow Animation */}
      <path 
        d={d} 
        fill="none" 
        stroke="#fff" 
        strokeWidth={2 + current} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray={`${8 * current} ${16}`} 
        className="wire-flow"
        style={{ animationDuration: `${animDuration}s` }}
        opacity={0.8}
      />
    </g>
  );
}

// --------------------------------------------------------
// Circuit View
// --------------------------------------------------------
function CircuitView({ circuit, selectedBulbId, onSelectBulb, showResult }) {
  
  return (
    <div className="w-full flex items-center justify-center select-none p-4 bg-white/40 rounded-3xl border border-slate-100 shadow-sm">
      <svg viewBox="0 0 800 450" className="w-full max-w-[800px] h-auto overflow-visible">
        <defs>
          <style>{`
            .wire-flow { animation: dash linear infinite; }
            @keyframes dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -24; } }
          `}</style>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
             <feOffset dx="2" dy="3" result="offsetblur"/>
             <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
             <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="450" fill="url(#grid)" opacity="0.3" rx="20" />

        {/* Draw Wires */}
        {circuit.edges.filter(e => e.type === "wire").map(e => (
          <WirePath key={e.id} d={e.d} current={e.current} />
        ))}

        {/* Draw Bulbs */}
        {circuit.edges.filter(e => e.type === "bulb").map(bulb => {
          const a = circuit.nodes[bulb.a];
          const b = circuit.nodes[bulb.b];
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
          
          return (
            <g key={bulb.id}>
              {/* Wire underneath bulb */}
              <WirePath d={d} current={bulb.current} />
              <Bulb 
                cx={mid.x} cy={mid.y - 14} 
                current={bulb.current}
                isSelected={selectedBulbId === bulb.id}
                isCorrect={bulb.id === circuit.correctBulbId}
                showResult={showResult}
                onClick={() => onSelectBulb(bulb.id)}
              />
            </g>
          );
        })}

        <Battery x={circuit.battery.ui.x} y={circuit.battery.ui.y} w={circuit.battery.ui.w} h={circuit.battery.ui.h} />
      </svg>
    </div>
  );
}

// --------------------------------------------------------
// Problems Data (Static Layouts with Pre-calculated Current)
// --------------------------------------------------------

// P1: Right bulb receives ALL current. Left bulbs split.
function makeProblem1() {
  const nodes = {
    // Battery at Top
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Top Corners
    TL: {x: 100, y: 70}, TR: {x: 700, y: 70},
    // Bot Corners
    BL: {x: 100, y: 350}, BR: {x: 700, y: 350},
    
    // Right Side (Main Path)
    R1: {x: 700, y: 150}, R2: {x: 700, y: 270}, // Bulb nodes
    
    // Left Side (Split)
    SplitTop: {x: 250, y: 70}, SplitBot: {x: 250, y: 350},
    L1_T: {x: 150, y: 150}, L1_B: {x: 150, y: 270},
    L2_T: {x: 350, y: 150}, L2_B: {x: 350, y: 270},
  };

  const edges = [
    // --- MAIN PATH (Current = 1) ---
    { id: "p", type: "wire", a: "P", b: "TR", d: "M 470 70 L 700 70", current: 1 },
    { id: "r_in", type: "wire", a: "TR", b: "R1", d: "M 700 70 L 700 150", current: 1 },
    { id: "r_bulb", type: "bulb", a: "R1", b: "R2", id: "bMain", current: 1 }, // CORRECT ANSWER
    { id: "r_out", type: "wire", a: "R2", b: "BR", d: "M 700 270 L 700 350", current: 1 },
    { id: "bot", type: "wire", a: "BR", b: "SplitBot", d: "M 700 350 L 250 350", current: 1 },
    
    // --- SPLIT PATHS (Current = 0.5) ---
    // Left Bulb 1
    { id: "sp_l1_in", type: "wire", a: "SplitBot", b: "L1_B", d: "M 250 350 L 150 350 L 150 270", current: 0.5 },
    { id: "l1_bulb", type: "bulb", a: "L1_B", b: "L1_T", id: "bSplit1", current: 0.5 },
    { id: "sp_l1_out", type: "wire", a: "L1_T", b: "SplitTop", d: "M 150 150 L 150 70 L 250 70", current: 0.5 },
    
    // Left Bulb 2
    { id: "sp_l2_in", type: "wire", a: "SplitBot", b: "L2_B", d: "M 250 350 L 350 350 L 350 270", current: 0.5 },
    { id: "l2_bulb", type: "bulb", a: "L2_B", b: "L2_T", id: "bSplit2", current: 0.5 },
    { id: "sp_l2_out", type: "wire", a: "L2_T", b: "SplitTop", d: "M 350 150 L 350 70 L 250 70", current: 0.5 },

    // Return to Bat
    { id: "n", type: "wire", a: "SplitTop", b: "N", d: "M 250 70 L 330 70", current: 1 },
  ];

  return { nodes, edges, battery: {ui:{x:330,y:53,w:140,h:34}}, correctBulbId: "bMain" };
}

// P2: Left bulb receives ALL current. Right bulbs split.
function makeProblem2() {
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Main Bulb on Left
    L_Top: {x: 150, y: 70}, L_In: {x: 150, y: 150}, L_Out: {x: 150, y: 270}, L_Bot: {x: 150, y: 350},
    // Split Section on Right
    S_Top: {x: 550, y: 70}, S_Bot: {x: 550, y: 350},
    R1_In: {x: 450, y: 150}, R1_Out: {x: 450, y: 270},
    R2_In: {x: 650, y: 150}, R2_Out: {x: 650, y: 270},
  };

  const edges = [
    // --- MAIN PATH (Left) ---
    { id: "n", type: "wire", a: "N", b: "L_Top", d: "M 330 70 L 150 70", current: 1 },
    { id: "l_in", type: "wire", a: "L_Top", b: "L_In", d: "M 150 70 L 150 150", current: 1 },
    { id: "b_main", type: "bulb", a: "L_In", b: "L_Out", id: "bMain", current: 1 }, // CORRECT
    { id: "l_out", type: "wire", a: "L_Out", b: "L_Bot", d: "M 150 270 L 150 350", current: 1 },
    { id: "bot", type: "wire", a: "L_Bot", b: "S_Bot", d: "M 150 350 L 550 350", current: 1 },

    // --- SPLIT PATHS (Right) ---
    // R1
    { id: "r1_in", type: "wire", a: "S_Bot", b: "R1_Out", d: "M 550 350 L 450 350 L 450 270", current: 0.5 },
    { id: "b_r1", type: "bulb", a: "R1_Out", b: "R1_In", id: "bS1", current: 0.5 },
    { id: "r1_out", type: "wire", a: "R1_In", b: "S_Top", d: "M 450 150 L 450 70 L 550 70", current: 0.5 },
    // R2
    { id: "r2_in", type: "wire", a: "S_Bot", b: "R2_Out", d: "M 550 350 L 650 350 L 650 270", current: 0.5 },
    { id: "b_r2", type: "bulb", a: "R2_Out", b: "R2_In", id: "bS2", current: 0.5 },
    { id: "r2_out", type: "wire", a: "R2_In", b: "S_Top", d: "M 650 150 L 650 70 L 550 70", current: 0.5 },

    // Return
    { id: "p", type: "wire", a: "S_Top", b: "P", d: "M 550 70 L 470 70", current: 1 },
  ];

  return { nodes, edges, battery: {ui:{x:330,y:53,w:140,h:34}}, correctBulbId: "bMain" };
}

// P3: Top Bulb Main, Bottom Bulbs Split
function makeProblem3() {
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    T_In: {x: 250, y: 140}, T_Out: {x: 350, y: 140},
    Split_L: {x: 100, y: 200}, Split_R: {x: 700, y: 200},
    // Bottoms
    B1_In: {x: 200, y: 250}, B1_Out: {x: 200, y: 350},
    B2_In: {x: 600, y: 250}, B2_Out: {x: 600, y: 350},
  };

  const edges = [
    // Main Path (Top Bulb)
    { id: "n", type: "wire", a: "N", b: "T_In", d: "M 330 70 L 150 70 L 150 140 L 250 140", current: 1 },
    { id: "b_main", type: "bulb", a: "T_In", b: "T_Out", id: "bMain", current: 1 }, // CORRECT
    { id: "to_split", type: "wire", a: "T_Out", b: "Split_R", d: "M 350 140 L 700 140 L 700 200", current: 1 },

    // Splits
    // B1 (Left Bot)
    { id: "b1_w1", type: "wire", a: "Split_R", b: "B1_Out", d: "M 700 200 L 750 200 L 750 400 L 200 400 L 200 350", current: 0.5 }, // Long loop
    { id: "b_s1", type: "bulb", a: "B1_Out", b: "B1_In", id: "bS1", current: 0.5 },
    { id: "b1_w2", type: "wire", a: "B1_In", b: "Split_L", d: "M 200 250 L 200 200 L 100 200", current: 0.5 },

    // B2 (Right Bot) - Actually let's make it simpler layout
    // Let's do T-junction
  ];

  // Simplified Layout for P3
  const n2 = {
      N: {x: 330, y: 70}, P: {x: 470, y: 70},
      // Main Bulb (Top)
      M_L: {x: 350, y: 130}, M_R: {x: 450, y: 130},
      // Split Junction
      J_L: {x: 150, y: 200}, J_R: {x: 650, y: 200},
      // Bottom Bulbs
      B1_T: {x: 250, y: 280}, B1_B: {x: 350, y: 280},
      B2_T: {x: 450, y: 280}, B2_B: {x: 550, y: 280},
  };
  const e2 = [
      // N -> Main Bulb
      { id: "n", type: "wire", a: "N", b: "M_L", d: "M 330 70 L 150 70 L 150 130 L 350 130", current: 1 },
      { id: "b_main", type: "bulb", a: "M_L", b: "M_R", id: "bMain", current: 1 },
      
      // Main Bulb -> Right Split Point
      { id: "m_out", type: "wire", a: "M_R", b: "J_R", d: "M 450 130 L 650 130 L 650 200", current: 1 },
      
      // Split Branch 1 (Bottom Left)
      { id: "s1_in", type: "wire", a: "J_R", b: "B1_B", d: "M 650 200 L 650 350 L 350 350 L 350 280", current: 0.5 },
      { id: "b_s1", type: "bulb", a: "B1_B", b: "B1_T", id: "bS1", current: 0.5 },
      { id: "s1_out", type: "wire", a: "B1_T", b: "J_L", d: "M 250 280 L 250 200 L 150 200", current: 0.5 },

      // Split Branch 2 (Bottom Right)
      { id: "s2_in", type: "wire", a: "J_R", b: "B2_B", d: "M 650 200 L 650 280 L 550 280", current: 0.5 },
      { id: "b_s2", type: "bulb", a: "B2_B", b: "B2_T", id: "bS2", current: 0.5 },
      { id: "s2_out", type: "wire", a: "B2_T", b: "J_L", d: "M 450 280 L 450 200 L 150 200", current: 0.5 },

      // J_L -> P
      { id: "p", type: "wire", a: "J_L", b: "P", d: "M 150 200 L 150 70 L 470 70", current: 1 },
  ];

  return { nodes: n2, edges: e2, battery: {ui:{x:330,y:53,w:140,h:34}}, correctBulbId: "bMain" };
}

const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    prompt: "Only one bulb receives ALL the current from the battery. Select that bulb.",
    why: "All the current flows through the single bulb on the right before it splits into two paths. This bulb carries the most current and is the brightest.",
    circuitFactory: makeProblem1,
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    prompt: "Select the bulb which receives all the current from the battery.",
    why: "The bulb on the left is on the main path connected directly to the battery. After passing through it, the current splits for the two bulbs on the right.",
    circuitFactory: makeProblem2,
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    prompt: "Select the bulb which receives all the current from the battery.",
    why: "The top bulb is in series with the battery, so it gets 100% of the current. The circuit then splits into parallel branches for the bottom two bulbs.",
    circuitFactory: makeProblem3,
  },
  {
    id: "summary",
    type: "info",
    title: "Lesson Complete",
    prompt: "When a circuit splits, the current divides.",
    why: "Bulbs on the main path (series) get full current and are brightest. Bulbs on split paths (parallel) share the current and are dimmer.",
  },
];

// --------------------------------------------------------
// Card Component (Selection Logic)
// --------------------------------------------------------
const CircuitProblem = ({ step, isCompleted, onComplete }) => {
  const [selectedBulb, setSelectedBulb] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const circuit = useMemo(() => step.circuitFactory(), [step]);

  useEffect(() => {
    setSelectedBulb(null);
    setShowWhy(false);
    setShowConfetti(false);
  }, [circuit]);

  const handleBulbClick = (id) => {
    if (isCompleted) return;
    
    setSelectedBulb(id);
    const isCorrect = id === circuit.correctBulbId;

    if (isCorrect) {
      playSound("win");
      setShowConfetti(true);
      onComplete();
    } else {
      playSound("error");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleReset = () => {
    if (isCompleted) return;
    playSound("snap");
    setSelectedBulb(null);
    setShowWhy(false);
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 ${shake ? "animate-shake" : ""}`}>
      {/* Instructions */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              {step.title}
            </div>
            <div className="mt-2 text-xl md:text-2xl font-semibold leading-snug text-slate-800">
              {step.prompt}
            </div>
          </div>
          <div className={`shrink-0 w-12 h-12 rounded-2xl grid place-items-center border-2 transition-colors duration-500 ${isCompleted ? "bg-green-50 border-green-200 text-green-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            {isCompleted ? <Check size={24} strokeWidth={3} /> : <MousePointer2 size={24} />}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <button onClick={() => setShowWhy((v) => !v)} className="px-5 py-3 rounded-xl font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-white hover:border-indigo-200 active:scale-[0.98] transition flex items-center gap-2 text-sm">
            <HelpCircle size={18} /> Why?
          </button>
          <button onClick={handleReset} disabled={isCompleted} className={`px-5 py-3 rounded-xl font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-white active:scale-[0.98] transition flex items-center gap-2 text-sm ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>

        {showWhy && (
          <div className="mt-6 bg-indigo-50/80 border border-indigo-100 text-indigo-900 rounded-2xl p-5 text-sm font-medium leading-relaxed animate-in slide-in-from-top-2">
            {step.why}
          </div>
        )}
      </div>

      {/* Interactive Canvas */}
      <div className="bg-slate-100/50 border border-slate-200 rounded-[2.5rem] shadow-inner p-2 sm:p-6 relative overflow-hidden group">
        <div className="absolute left-8 top-6 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/60 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg z-10">
          Circuit Viewer
        </div>
        <div className="pt-8 sm:pt-4 transition-transform duration-500 ease-out group-hover:scale-[1.01]">
          <CircuitView
            circuit={circuit}
            selectedBulbId={selectedBulb}
            onSelectBulb={handleBulbClick}
            showResult={!!selectedBulb}
          />
        </div>
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center z-20">
            <div className="px-8 py-4 rounded-2xl bg-green-500 text-white font-black text-lg shadow-2xl animate-pop flex items-center gap-3">
              <Check size={28} strokeWidth={4} />
              Correct!
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

// --------------------------------------------------------
// Info Step
// --------------------------------------------------------
const InfoStep = ({ step, isLast, onComplete }) => (
  <div className="relative rounded-[2rem] border border-slate-200 bg-white p-8 overflow-hidden shadow-xl animate-in slide-in-from-bottom-8 duration-700">
    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-indigo-900">
      <Zap size={140} />
    </div>
    <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
      <div className="bg-indigo-50 p-6 rounded-3xl shrink-0 hidden md:block">
        <Trophy size={40} className="text-indigo-500" />
      </div>
      <div className="w-full">
        <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">
          {step.id === "summary" ? "Lesson Complete" : "Concept"}
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900">
          {step.title}
        </h2>
        <p className="text-slate-600 text-xl leading-relaxed font-medium mb-6">
          {step.prompt}
        </p>
        <div className="text-slate-500 text-base font-medium bg-slate-50 border border-slate-100 rounded-2xl p-6 leading-relaxed">
          {step.why}
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={() => { playSound("pop"); onComplete(); }} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-500 active:scale-[0.98] shadow-xl shadow-indigo-200 transition-all hover:pr-6">
            {step.id === "summary" ? "Finish" : "Continue"} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --------------------------------------------------------
// Main Component
// --------------------------------------------------------
const SplittingCurrentLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);
  const problemSteps = useMemo(() => LESSON_STEPS.filter((s) => s.type === "problem"), []);
  const activeStepIndex = completedSteps.length;
  const visibleSteps = LESSON_STEPS.slice(0, activeStepIndex + 1);

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) setCompletedSteps((prev) => [...prev, stepId]);
  };

  useEffect(() => {
    if (bottomRef.current) setTimeout(() => bottomRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 pb-32">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-900 leading-none mb-1">Splitting Current</h1>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Parallel Circuits</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 pl-4 pr-5 py-2 rounded-full border border-slate-200">
            <Trophy size={18} className={completedSteps.length > 0 ? "text-amber-500 animate-bounce" : "text-slate-300"} />
            <span className="font-black text-slate-700 text-sm">{completedSteps.filter(id => problemSteps.some(s => s.id === id)).length} / {problemSteps.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-16 mt-6">
        {visibleSteps.map((step, index) => (
          <div key={step.id} className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" ref={index === activeStepIndex ? bottomRef : undefined}>
            {step.type === "info" ? (
              <InfoStep step={step} isLast={index === visibleSteps.length - 1} onComplete={() => handleStepComplete(step.id)} />
            ) : (
              <div className="relative">
                 <div className="absolute -left-4 md:-left-16 top-0 flex flex-col items-center h-full pointer-events-none hidden md:flex">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all duration-500 z-10 ${completedSteps.includes(step.id) ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110" : "bg-white border-slate-200 text-slate-300"}`}>
                    {completedSteps.includes(step.id) ? <Check size={18} strokeWidth={4} /> : problemSteps.findIndex(s => s.id === step.id) + 1}
                  </div>
                  {index !== visibleSteps.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-3 rounded-full opacity-50"></div>}
                </div>
                <CircuitProblem step={step} isCompleted={completedSteps.includes(step.id)} onComplete={() => handleStepComplete(step.id)} />
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .wire-flow { animation: dash linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -24; } }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 40% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
      `}</style>
    </div>
  );
};

export default SplittingCurrentLesson;