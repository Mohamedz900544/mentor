// ... existing imports ...
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, RotateCcw, Check, ArrowRight, Trophy, Zap, MousePointer2, Lightbulb } from "lucide-react";

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
// Graph / Circuit Logic
// --------------------------------------------------------
function bfsPath(adj, start, goal, blockedEdgeIds = new Set()) {
  if (!adj.has(start) || !adj.has(goal)) return null;

  const q = [start];
  const prev = new Map();
  prev.set(start, null);
  const visited = new Set([start]);

  while (q.length) {
    const u = q.shift();
    if (u === goal) break;
    const neighbors = adj.get(u) || [];
    for (const e of neighbors) {
      if (blockedEdgeIds.has(e.edgeId)) continue;
      if (!visited.has(e.to)) {
        visited.add(e.to);
        prev.set(e.to, { from: u, edgeId: e.edgeId });
        q.push(e.to);
      }
    }
  }

  if (!prev.has(goal)) return null;

  const edges = [];
  let cur = goal;
  while (cur !== start) {
    const step = prev.get(cur);
    edges.push(step.edgeId);
    cur = step.from;
  }
  edges.reverse();
  return edges;
}

function buildAdjacency(circuit, switchState) {
  const adj = new Map();
  const add = (a, b, edgeId) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push({ to: b, edgeId });
  };

  for (const e of circuit.edges) {
    if (e.type === "battery") continue;
    if (e.type === "switch") {
      const isClosed = !!switchState[e.switchId];
      if (!isClosed) continue;
    }
    add(e.a, e.b, e.id);
    add(e.b, e.a, e.id);
  }
  return adj;
}

function computeCircuitState(circuit, switchState) {
  // 1. Full Graph (Wires + Switches + Bulbs)
  const fullAdj = buildAdjacency(circuit, switchState);

  // 2. Short Graph (Wires + Switches ONLY)
  const shortAdj = new Map();
  const addShort = (a, b, edgeId) => {
    if (!shortAdj.has(a)) shortAdj.set(a, []);
    shortAdj.get(a).push({ to: b, edgeId });
  };
  for (const e of circuit.edges) {
    if (e.type === "battery" || e.type === "bulb") continue;
    if (e.type === "switch" && !switchState[e.switchId]) continue;
    addShort(e.a, e.b, e.id);
    addShort(e.b, e.a, e.id);
  }

  // 3. Check for Global Battery Short
  const globalShortPath = bfsPath(shortAdj, circuit.battery.pos, circuit.battery.neg);
  if (globalShortPath) {
    return { bulbs: {}, flowEdges: globalShortPath, batteryShort: true };
  }

  // 4. Check Bulbs
  const bulbStates = {};
  const allFlowEdges = new Set();

  circuit.edges.filter(e => e.type === "bulb").forEach(bulb => {
    // A. Is it locally shorted?
    const localShort = bfsPath(shortAdj, bulb.a, bulb.b);
    if (localShort) {
      bulbStates[bulb.id] = false;
      localShort.forEach(id => allFlowEdges.add(id));
      return;
    }

    // B. Is it connected to battery?
    const blocked = new Set([bulb.id]);
    
    // Path: Pos -> A ... B -> Neg
    let p1 = bfsPath(fullAdj, circuit.battery.pos, bulb.a, blocked);
    let p2 = bfsPath(fullAdj, bulb.b, circuit.battery.neg, blocked);
    let path = (p1 && p2) ? [...p1, bulb.id, ...p2] : null;

    // Path: Pos -> B ... A -> Neg
    if (!path) {
      p1 = bfsPath(fullAdj, circuit.battery.pos, bulb.b, blocked);
      p2 = bfsPath(fullAdj, bulb.a, circuit.battery.neg, blocked);
      path = (p1 && p2) ? [...p1, bulb.id, ...p2] : null;
    }

    if (path) {
      bulbStates[bulb.id] = true;
      path.forEach(id => allFlowEdges.add(id));
    } else {
      bulbStates[bulb.id] = false;
    }
  });

  return { 
    bulbs: bulbStates, 
    flowEdges: Array.from(allFlowEdges), 
    batteryShort: false 
  };
}

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

function Bulb({ cx, cy, lit, isTarget, flash }) {
  return (
    <g>
      <defs>
        <filter id="bulbGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="bulbHalo" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Target Indicator */}
      {isTarget && !lit && (
        <g className="transition-opacity duration-1000" style={{ opacity: flash ? 1 : 0.4 }}>
            <circle cx={cx} cy={cy} r={48} fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="8 6" />
            <text x={cx} y={cy + 70} textAnchor="middle" fill="#6366f1" fontSize="12" fontWeight="800" letterSpacing="1px">TARGET</text>
        </g>
      )}

      {lit && (
        <circle cx={cx} cy={cy} r={54} fill="url(#bulbHalo)" filter="url(#bulbGlow)" opacity="0.9" />
      )}

      <rect x={cx - 14} y={cy + 18} width={28} height={16} rx={6} fill="#334155" />
      <rect x={cx - 10} y={cy + 22} width={20} height={3} rx={1} fill="#64748b" />
      <rect x={cx - 10} y={cy + 28} width={20} height={3} rx={1} fill="#64748b" />
      <circle cx={cx} cy={cy} r={24} fill={lit ? "#fffbeb" : "#f1f5f9"} stroke="#475569" strokeWidth="2" />
      <path d={`M ${cx - 8} ${cy + 12} C ${cx - 8} ${cy - 12}, ${cx + 8} ${cy - 12}, ${cx + 8} ${cy + 12}`} fill="none" stroke={lit ? "#f59e0b" : "#94a3b8"} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function WirePath({ d, active, isShort }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={active ? (isShort ? "#ef4444" : "#f59e0b") : "#64748b"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.8} className="transition-colors duration-300" />
      {active && (
         <path d={d} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 20" className="wire-flow opacity-70" />
      )}
    </g>
  );
}

function Switch({ x1, y1, x2, y2, closed, active, onClick }) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const angleRad = Math.atan2(y2 - y1, x2 - x1);
  const baseAngle = angleRad * (180 / Math.PI);
  const currentRotation = baseAngle + (closed ? 0 : -30);
  const leverLen = closed ? dist : dist * 0.85;
  const margin = 15;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} className="group">
      <rect x={Math.min(x1, x2) - margin} y={Math.min(y1, y2) - margin} width={Math.abs(x2 - x1) + 2 * margin} height={Math.abs(y2 - y1) + 2 * margin} fill="transparent" />
      <circle cx={x1} cy={y1} r={8} fill="#fff" stroke="#334155" strokeWidth="3" />
      <circle cx={x2} cy={y2} r={8} fill="#fff" stroke="#334155" strokeWidth="3" />
      <g transform={`translate(${x1} ${y1}) rotate(${currentRotation})`}>
        {!closed && <line x1={2} y1={4} x2={leverLen} y2={4} stroke="#000" strokeWidth="6" strokeOpacity="0.1" strokeLinecap="round" />}
        <line x1={0} y1={0} x2={leverLen} y2={0} stroke={closed ? "#334155" : "#ef4444"} strokeWidth="6" strokeLinecap="round" className="transition-all duration-300 ease-spring" />
        <circle cx={leverLen} cy={0} r={5} fill="#fff" stroke={closed ? "#334155" : "#ef4444"} strokeWidth="2" />
      </g>
      <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r={24} fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="6 6" className="opacity-0 group-hover:opacity-30 transition-opacity" />
    </g>
  );
}

// --------------------------------------------------------
// Circuit View
// --------------------------------------------------------
function CircuitView({ circuit, switchState, setSwitchState, showFlow, lock, onSwitchToggle, targetBulbId }) {
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => { setFlash(p => !p); }, 1000); 
    return () => clearInterval(interval);
  }, []);

  const { bulbs, flowEdges, batteryShort } = useMemo(
    () => computeCircuitState(circuit, switchState),
    [circuit, switchState]
  );

  const flowSet = useMemo(() => new Set(flowEdges), [flowEdges]);

  const toggleSwitch = (id) => {
    if (lock) return;
    setSwitchState((s) => ({ ...s, [id]: !s[id] }));
    if (onSwitchToggle) onSwitchToggle(id);
  };

  return (
    <div className="w-full flex items-center justify-center select-none p-4 bg-white/40 rounded-3xl border border-slate-100 shadow-sm">
      <svg viewBox="0 0 800 450" className="w-full max-w-[800px] h-auto overflow-visible">
        <defs>
          <style>{`
            .ease-spring { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
            .wire-flow { animation: dash 0.8s linear infinite; }
            @keyframes dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -26; } }
          `}</style>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
             <feOffset dx="2" dy="3" result="offsetblur"/>
             <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
             <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Subtle Grid Pattern for Background */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="800" height="450" fill="url(#grid)" opacity="0.3" rx="20" />

        {/* Wires */}
        {circuit.edges.filter((e) => e.type === "wire").map((e) => (
            <WirePath key={e.id} d={e.d} active={showFlow && flowSet.has(e.id)} isShort={batteryShort} />
        ))}

        {/* Bulbs */}
        {circuit.edges.filter((e) => e.type === "bulb").map((bulb) => {
            const a = circuit.nodes[bulb.a];
            const b = circuit.nodes[bulb.b];
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
            const active = showFlow && flowSet.has(bulb.id);
            const isLit = bulbs[bulb.id];
            
            return (
              <g key={bulb.id}>
                <WirePath d={d} active={active} isShort={batteryShort} />
                <Bulb 
                    cx={mid.x} cy={mid.y - 14} 
                    lit={isLit} 
                    isTarget={bulb.id === targetBulbId} 
                    flash={flash}
                />
              </g>
            );
        })}

        {/* Switches */}
        {circuit.edges.filter((e) => e.type === "switch").map((e) => {
            const a = circuit.nodes[e.a];
            const b = circuit.nodes[e.b];
            return (
              <Switch
                key={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                closed={!!switchState[e.switchId]}
                active={showFlow && flowSet.has(e.id)}
                onClick={() => toggleSwitch(e.switchId)}
              />
            );
        })}

        <Battery x={circuit.battery.ui.x} y={circuit.battery.ui.y} w={circuit.battery.ui.w} h={circuit.battery.ui.h} />
      </svg>
    </div>
  );
}

// --------------------------------------------------------
// Problems
// --------------------------------------------------------

// P1: AND Gate (Series)
function makeProblem1() {
  const yMain = 250;
  const nodes = {
    TL: {x: 80, y: yMain}, TR: {x: 720, y: yMain},
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Switches
    S1_A: {x: 100, y: yMain}, S1_B: {x: 220, y: yMain},
    S2_A: {x: 300, y: yMain}, S2_B: {x: 420, y: yMain},
    // Bulb
    B_A: {x: 550, y: yMain}, B_B: {x: 700, y: yMain},
  };

  const edges = [
    { id: "p", type: "wire", a: "P", b: "B_B", d: `M 470 70 L 720 70 L 720 ${yMain}` },
    { id: "n", type: "wire", a: "N", b: "S1_A", d: `M 330 70 L 80 70 L 80 ${yMain} L 100 ${yMain}` },
    
    // Series Chain: Sw1 -> Wire -> Sw2 -> Wire -> Bulb
    { id: "sw1", type: "switch", a: "S1_A", b: "S1_B", switchId: "S1" },
    { id: "w1", type: "wire", a: "S1_B", b: "S2_A", d: `M 220 ${yMain} L 300 ${yMain}` },
    { id: "sw2", type: "switch", a: "S2_A", b: "S2_B", switchId: "S2" },
    { id: "w2", type: "wire", a: "S2_B", b: "B_A", d: `M 420 ${yMain} L 550 ${yMain}` },
    { id: "bulb", type: "bulb", a: "B_A", b: "B_B", id: "bTarget" },
  ];

  return { 
    nodes, edges, 
    battery: {pos:"P", neg:"N", ui:{x:330,y:53,w:140,h:34}}, 
    initialSwitches: {S1:false, S2:false}, 
    targetBulbId: "bTarget" 
  };
}

// P2: OR Gate (Parallel)
function makeProblem2() {
  const yTop = 150;
  const yBot = 320;
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Split points
    SplitL: {x: 120, y: 235}, SplitR: {x: 500, y: 235},
    // Top Branch (Sw1)
    T1: {x: 120, y: yTop}, T2: {x: 200, y: yTop}, T3: {x: 320, y: yTop}, T4: {x: 500, y: yTop},
    // Bot Branch (Sw2)
    B1: {x: 120, y: yBot}, B2: {x: 200, y: yBot}, B3: {x: 320, y: yBot}, B4: {x: 500, y: yBot},
    // Bulb (After split)
    Bulb_A: {x: 500, y: 235}, Bulb_B: {x: 650, y: 235},
  };

  const edges = [
    // Power to SplitL
    { id: "n", type: "wire", a: "N", b: "SplitL", d: "M 330 70 L 80 70 L 80 235 L 120 235" },
    
    // Top Branch
    { id: "t_up", type: "wire", a: "SplitL", b: "T2", d: `M 120 235 L 120 ${yTop} L 200 ${yTop}` },
    { id: "sw1", type: "switch", a: "T2", b: "T3", switchId: "S1" },
    { id: "t_dn", type: "wire", a: "T3", b: "SplitR", d: `M 320 ${yTop} L 500 ${yTop} L 500 235` },

    // Bot Branch
    { id: "b_dn", type: "wire", a: "SplitL", b: "B2", d: `M 120 235 L 120 ${yBot} L 200 ${yBot}` },
    { id: "sw2", type: "switch", a: "B2", b: "B3", switchId: "S2" },
    { id: "b_up", type: "wire", a: "B3", b: "SplitR", d: `M 320 ${yBot} L 500 ${yBot} L 500 235` },

    // SplitR to Bulb to Bat
    { id: "bulb", type: "bulb", a: "SplitR", b: "Bulb_B", id: "bTarget" },
    { id: "p", type: "wire", a: "Bulb_B", b: "P", d: "M 650 235 L 720 235 L 720 70 L 470 70" },
  ];

  return { 
    nodes, edges, 
    battery: {pos:"P", neg:"N", ui:{x:330,y:53,w:140,h:34}}, 
    initialSwitches: {S1:false, S2:false}, 
    targetBulbId: "bTarget" 
  };
}

// P3: NOT Gate (Inverter)
function makeProblem3() {
  const yMain = 200;
  const yBypass = 320;
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Main line nodes
    L1: {x: 100, y: yMain}, L2: {x: 250, y: yMain}, L3: {x: 500, y: yMain}, L4: {x: 700, y: yMain},
    // Bypass Switch Nodes
    Sw_A: {x: 250, y: yBypass}, Sw_B: {x: 500, y: yBypass},
  };

  const edges = [
    { id: "n", type: "wire", a: "N", b: "L1", d: `M 330 70 L 80 70 L 80 ${yMain} L 100 ${yMain}` },
    { id: "w1", type: "wire", a: "L1", b: "L2", d: `M 100 ${yMain} L 250 ${yMain}` },
    
    // Bulb on Main Line
    { id: "bulb", type: "bulb", a: "L2", b: "L3", id: "bTarget" },
    
    // Bypass Switch (Parallel to Bulb)
    { id: "bp_1", type: "wire", a: "L2", b: "Sw_A", d: `M 250 ${yMain} L 250 ${yBypass}` },
    { id: "sw_not", type: "switch", a: "Sw_A", b: "Sw_B", switchId: "SNot" },
    { id: "bp_2", type: "wire", a: "Sw_B", b: "L3", d: `M 500 ${yBypass} L 500 ${yMain}` },

    { id: "w2", type: "wire", a: "L3", b: "L4", d: `M 500 ${yMain} L 700 ${yMain}` },
    { id: "p", type: "wire", a: "L4", b: "P", d: `M 700 ${yMain} L 720 ${yMain} L 720 70 L 470 70` },
  ];

  return { 
    nodes, edges, 
    battery: {pos:"P", neg:"N", ui:{x:330,y:53,w:140,h:34}}, 
    initialSwitches: {SNot:true}, 
    targetBulbId: "bTarget" 
  };
}

// P4: NAND Gate (Series Short)
function makeProblem4() {
  const yMain = 200;
  const yBypass = 320;
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    L_Start: {x: 150, y: yMain}, L_End: {x: 600, y: yMain},
    // Bypass chain
    S1_A: {x: 150, y: yBypass}, S1_B: {x: 270, y: yBypass},
    S2_A: {x: 450, y: yBypass}, S2_B: {x: 600, y: yBypass},
  };

  const edges = [
    { id: "n", type: "wire", a: "N", b: "L_Start", d: `M 330 70 L 80 70 L 80 ${yMain} L 150 ${yMain}` },
    
    // Bulb on Main Line
    { id: "bulb", type: "bulb", a: "L_Start", b: "L_End", id: "bTarget" },
    
    // Bypass Chain (Two switches in series)
    { id: "bp_1", type: "wire", a: "L_Start", b: "S1_A", d: `M 150 ${yMain} L 150 ${yBypass}` },
    { id: "sw1", type: "switch", a: "S1_A", b: "S1_B", switchId: "S1" },
    { id: "bp_mid", type: "wire", a: "S1_B", b: "S2_A", d: `M 270 ${yBypass} L 450 ${yBypass}` },
    { id: "sw2", type: "switch", a: "S2_A", b: "S2_B", switchId: "S2" },
    { id: "bp_2", type: "wire", a: "S2_B", b: "L_End", d: `M 600 ${yBypass} L 600 ${yMain}` },

    { id: "p", type: "wire", a: "L_End", b: "P", d: `M 600 ${yMain} L 720 ${yMain} L 720 70 L 470 70` },
  ];

  return { 
    nodes, edges, 
    battery: {pos:"P", neg:"N", ui:{x:330,y:53,w:140,h:34}}, 
    initialSwitches: {S1:true, S2:true}, 
    targetBulbId: "bTarget" 
  };
}

// P5: Logic Puzzle (A AND (NOT B))
function makeProblem5() {
  const yMain = 200;
  const yBypass = 320;
  const nodes = {
    N: {x: 330, y: 70}, P: {x: 470, y: 70},
    // Series Switch
    S1_A: {x: 120, y: yMain}, S1_B: {x: 240, y: yMain},
    // Node before Bulb
    NodeB: {x: 300, y: yMain},
    // Node after Bulb
    NodeC: {x: 550, y: yMain},
    // Parallel Switch
    S2_A: {x: 300, y: yBypass}, S2_B: {x: 550, y: yBypass},
  };

  const edges = [
    { id: "n", type: "wire", a: "N", b: "S1_A", d: `M 330 70 L 80 70 L 80 ${yMain} L 120 ${yMain}` },
    
    // Series Switch (A)
    { id: "sw_ser", type: "switch", a: "S1_A", b: "S1_B", switchId: "S_Series" },
    { id: "w_mid", type: "wire", a: "S1_B", b: "NodeB", d: `M 240 ${yMain} L 300 ${yMain}` },
    
    // Bulb
    { id: "bulb", type: "bulb", a: "NodeB", b: "NodeC", id: "bTarget" },
    
    // Parallel Switch (B) - The "Kill Switch"
    { id: "bp_1", type: "wire", a: "NodeB", b: "S2_A", d: `M 300 ${yMain} L 300 ${yBypass}` },
    { id: "sw_par", type: "switch", a: "S2_A", b: "S2_B", switchId: "S_Parallel" },
    { id: "bp_2", type: "wire", a: "S2_B", b: "NodeC", d: `M 550 ${yBypass} L 550 ${yMain}` },

    { id: "p", type: "wire", a: "NodeC", b: "P", d: `M 550 ${yMain} L 720 ${yMain} L 720 70 L 470 70` },
  ];

  return { 
    nodes, edges, 
    battery: {pos:"P", neg:"N", ui:{x:330,y:53,w:140,h:34}}, 
    initialSwitches: {S_Series:false, S_Parallel:true}, 
    targetBulbId: "bTarget" 
  };
}

const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Logic Gate: AND",
    prompt: "Light the bulb. (Hint: Current needs a complete path).",
    why: "This is an AND gate. The current must pass through Switch 1 AND Switch 2 to reach the bulb. Both must be closed.",
    circuitFactory: makeProblem1,
  },
  {
    id: "prob2",
    type: "problem",
    title: "Logic Gate: OR",
    prompt: "Light the bulb using either path.",
    why: "This is an OR gate. The current can flow through Switch 1 OR Switch 2. Closing either one (or both) completes the circuit.",
    circuitFactory: makeProblem2,
  },
  {
    id: "prob3",
    type: "problem",
    title: "Logic Gate: NOT",
    prompt: "The switch is creating a short circuit. Open it to light the bulb.",
    why: "This is a NOT gate (Inverter). When the switch is CLOSED (1), the bulb is OFF (0) because the current takes the easier path through the switch. When OPEN (0), bulb is ON (1).",
    circuitFactory: makeProblem3,
  },
  {
    id: "prob4",
    type: "problem",
    title: "Logic Gate: NAND",
    prompt: "The bulb is currently shorted out. Break the short circuit to light it.",
    why: "This is a NAND gate behavior. The bulb is ON unless BOTH switches are closed. Since they are in series on the shorting path, you only need to open one to break the short.",
    circuitFactory: makeProblem4,
  },
  {
    id: "prob5",
    type: "problem",
    title: "Logic Puzzle: A AND (NOT B)",
    prompt: "Configure the switches to light the bulb.",
    why: "To light the bulb, you need a path from the battery (Close the Series Switch) AND you must NOT have a short circuit (Open the Parallel Switch).",
    circuitFactory: makeProblem5,
  },
  {
    id: "summary",
    type: "info",
    title: "Lesson Complete",
    prompt: "You've built the fundamental building blocks of all computers!",
    why: "AND, OR, and NOT gates can be combined to create any digital logic circuit.",
  },
];

// --------------------------------------------------------
// Main Card Component
// --------------------------------------------------------
const CircuitProblem = ({ step, isCompleted, onComplete }) => {
  const [switchState, setSwitchState] = useState(step.circuitFactory().initialSwitches);
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const circuit = useMemo(() => step.circuitFactory(), [step]);

  useEffect(() => {
    setSwitchState(circuit.initialSwitches);
    setShowWhy(false);
    setShowConfetti(false);
  }, [circuit]);

  const state = useMemo(
    () => computeCircuitState(circuit, switchState),
    [circuit, switchState]
  );

  useEffect(() => {
    if (isCompleted) return;
    
    // Win Condition: Target Lit
    // (We removed the 'othersLit' check because these logic gate problems only have 1 bulb)
    const targetLit = state.bulbs[step.circuitFactory().targetBulbId];
    
    if (targetLit) {
      playSound("win");
      setShowConfetti(true);
      onComplete();
      setTimeout(() => setShowConfetti(false), 900);
    }
  }, [state.bulbs, isCompleted, onComplete, step]);

  const handleReset = () => {
    if (isCompleted) return;
    playSound("snap");
    setSwitchState(circuit.initialSwitches);
    setShowWhy(false);
    setShowConfetti(false);
  };

  const handleSwitchToggle = () => {
    if (isCompleted) return;
    playSound("pop");
  };

  const targetLit = state.bulbs[step.circuitFactory().targetBulbId];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
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
          <div className={`shrink-0 w-12 h-12 rounded-2xl grid place-items-center border-2 transition-colors duration-500 ${targetLit ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            {targetLit ? <Check size={24} strokeWidth={3} /> : <Lightbulb size={24} />}
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

      <div className="bg-slate-100/50 border border-slate-200 rounded-[2.5rem] shadow-inner p-2 sm:p-6 relative overflow-hidden group">
        <div className="absolute left-8 top-6 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/60 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg z-10">
          Circuit
        </div>
        <div className="pt-8 sm:pt-4 transition-transform duration-500 ease-out group-hover:scale-[1.01]">
          <CircuitView
            circuit={circuit}
            switchState={switchState}
            setSwitchState={setSwitchState}
            showFlow={true}
            lock={isCompleted}
            onSwitchToggle={handleSwitchToggle}
            targetBulbId={step.circuitFactory().targetBulbId}
          />
        </div>
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center z-20">
            <div className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-2xl animate-pop flex items-center gap-3">
              <Check size={28} strokeWidth={4} />
              Perfect!
            </div>
          </div>
        )}
      </div>
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
const ChoosingBulbsLesson = () => {
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
              <h1 className="font-black text-lg text-slate-900 leading-none mb-1">Logic Circuits</h1>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Logic Gates & Selectors</span>
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
        .wire-flow { animation: dash 0.5s linear infinite; }
        @keyframes dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -20; } }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 40% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
      `}</style>
    </div>
  );
};

export default ChoosingBulbsLesson;