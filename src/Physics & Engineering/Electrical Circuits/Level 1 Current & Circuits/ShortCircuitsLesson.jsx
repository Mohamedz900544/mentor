import React, { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, RotateCcw, Check, ArrowRight, Trophy, Zap, MousePointer2 } from "lucide-react";

// --------------------------------------------------------
// Simple sound system
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
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
};

// --------------------------------------------------------
// Graph helpers
// --------------------------------------------------------
function bfsPath(adj, start, goal, blockedEdgeIds = new Set()) {
  const q = [start];
  const prev = new Map();
  prev.set(start, null);

  while (q.length) {
    const u = q.shift();
    if (u === goal) break;
    const neighbors = adj.get(u) || [];
    for (const e of neighbors) {
      if (blockedEdgeIds.has(e.edgeId)) continue;
      if (!prev.has(e.to)) {
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

function findPathThroughBulb({ adj, pos, neg, bulbEdge }) {
  const blocked = new Set([bulbEdge.id]);

  const p1 = bfsPath(adj, pos, bulbEdge.a, blocked);
  const p2 = bfsPath(adj, bulbEdge.b, neg, blocked);
  if (p1 && p2) return [...p1, bulbEdge.id, ...p2];

  const p3 = bfsPath(adj, pos, bulbEdge.b, blocked);
  const p4 = bfsPath(adj, bulbEdge.a, neg, blocked);
  if (p3 && p4) return [...p3, bulbEdge.id, ...p4];

  return null;
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
      const isClosed = !!switchState[e.switchId]; // check if switch is closed
      if (!isClosed) continue; // skip the edge if switch is open
    }
    add(e.a, e.b, e.id); // add the edge to the adjacency list
    add(e.b, e.a, e.id); // bidirectional wiring
  }

  return adj;
}


function computeCircuitState(circuit, switchState) {
  const adj = buildAdjacency(circuit, switchState);

  const bulbEdge = circuit.edges.find((e) => e.type === "bulb");
  if (!bulbEdge) return { lit: false, flowEdges: [], shortEdges: [], bulbEdges: [] };

  const bulbPath = findPathThroughBulb({
    adj,
    pos: circuit.battery.pos,
    neg: circuit.battery.neg,
    bulbEdge: { id: bulbEdge.id, a: bulbEdge.a, b: bulbEdge.b },
  });

  const shortPath = bfsPath(adj, circuit.battery.pos, circuit.battery.neg, new Set([bulbEdge.id]));

  const shortExists = !!shortPath;
  const bulbLoopExists = !!bulbPath;
  const lit = bulbLoopExists && !shortExists;

  const flowEdges = lit ? bulbPath : shortExists ? shortPath : [];
  return { lit, flowEdges, shortEdges: shortPath || [], bulbEdges: bulbPath || [] };
}

// --------------------------------------------------------
// SVG components
// --------------------------------------------------------
function Battery({ x, y, w = 120, h = 34 }) {
  return (
    <g filter="url(#dropShadow)">
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#1e293b" />
      <rect x={x + w - 26} y={y + 4} width={22} height={h - 8} rx={6} fill="#f59e0b" />
      <rect x={x + w} y={y + h * 0.35} width={10} height={h * 0.3} rx={3} fill="#94a3b8" />
      <text x={x + 12} y={y + 22} fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="monospace">BAT</text>
    </g>
  );
}


function Bulb({ cx, cy, lit }) {
  return (
    <g>
      <defs>
        <filter id="bulbGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="2"/> 
             <feOffset dx="1" dy="1" result="offsetblur"/>
             <feComponentTransfer>
               <feFuncA type="linear" slope="0.3"/>
             </feComponentTransfer>
             <feMerge> 
               <feMergeNode/>
               <feMergeNode in="SourceGraphic"/> 
             </feMerge>
        </filter>

        <radialGradient id="bulbHalo" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {lit && (
        <circle
          cx={cx}
          cy={cy}
          r={52}
          fill="url(#bulbHalo)"
          filter="url(#bulbGlow)"
          opacity="0.95"
          className="animate-pulse-slow"
        />
      )}

      {/* Socket */}
      <rect x={cx - 14} y={cy + 18} width={28} height={16} rx={6} fill="#334155" />
      <rect x={cx - 10} y={cy + 22} width={20} height={3} rx={1} fill="#64748b" />
      <rect x={cx - 10} y={cy + 28} width={20} height={3} rx={1} fill="#64748b" />

      {/* Glass */}
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill={lit ? "#fffbeb" : "#f1f5f9"}
        stroke="#475569"
        strokeWidth="2"
      />

      {/* Filament */}
      <path
        d={`M ${cx - 8} ${cy + 12} C ${cx - 8} ${cy - 12}, ${cx + 8} ${cy - 12}, ${cx + 8} ${cy + 12}`}
        fill="none"
        stroke={lit ? "#f59e0b" : "#94a3b8"}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function WirePath({ d, active }) {
  return (
    <g>
      {/* Base wire */}
      <path
        d={d}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Core wire */}
      <path
        d={d}
        fill="none"
        stroke={active ? "#f59e0b" : "#64748b"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.8}
        className="transition-colors duration-300"
      />
      {/* Current flow animation */}
      {active && (
         <path
         d={d}
         fill="none"
         stroke="#fff"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeDasharray="4 16"
         className="wire-flow opacity-80"
       />
      )}
    </g>
  );
}

function Switch({ x1, y1, x2, y2, closed, active, onClick }) {
  // CORRECTED LOGIC: Calculate rotation based on vector angle
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const angleRad = Math.atan2(y2 - y1, x2 - x1);
  const baseAngle = angleRad * (180 / Math.PI);
  
  const liftAngle = -30;
  const currentRotation = baseAngle + (closed ? 0 : liftAngle);
  const leverLen = closed ? dist : dist * 0.85;

  const margin = 12;

  return (
    <g 
      onClick={onClick} 
      style={{ cursor: "pointer" }} 
      className="group"
    >
      {/* Hit Area */}
      <rect
        x={Math.min(x1, x2) - margin}
        y={Math.min(y1, y2) - margin}
        width={Math.abs(x2 - x1) + 2 * margin}
        height={Math.abs(y2 - y1) + 2 * margin}
        fill="transparent"
      />
      
      {/* Terminals */}
      <circle cx={x1} cy={y1} r={6} fill="#fff" stroke="#334155" strokeWidth="3" />
      <circle cx={x2} cy={y2} r={6} fill="#fff" stroke="#334155" strokeWidth="3" />

      {/* Lever Group */}
      <g transform={`translate(${x1} ${y1}) rotate(${currentRotation})`}>
        {/* Shadow for depth */}
        {!closed && (
            <line 
                x1={2} y1={4} x2={leverLen} y2={4} 
                stroke="#000" strokeWidth="4" strokeOpacity="0.1" strokeLinecap="round" 
            />
        )}
        {/* The Lever */}
        <line
          x1={0}
          y1={0}
          x2={leverLen}
          y2={0}
          stroke={closed ? "#334155" : "#ef4444"}
          strokeWidth="5"
          strokeLinecap="round"
          className="transition-all duration-300 ease-spring"
        />
        {/* Handle at end of lever */}
         <circle cx={leverLen} cy={0} r={4} fill="#fff" stroke={closed ? "#334155" : "#ef4444"} strokeWidth="2" />
      </g>
      
      {/* Hover indicator */}
      <circle 
        cx={(x1+x2)/2} cy={(y1+y2)/2} r={18} 
        fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" 
        className="opacity-0 group-hover:opacity-40 transition-opacity" 
      />
    </g>
  );
}


// --------------------------------------------------------
// Circuit view
// --------------------------------------------------------
function CircuitView({ circuit, switchState, setSwitchState, showFlow, lock, onSwitchToggle }) {
  const { lit, flowEdges } = useMemo(
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
    <div className="w-full flex items-center justify-center select-none">
      <svg viewBox="0 0 700 320" className="w-full max-w-[760px] h-auto overflow-visible">
        <defs>
            <style>{`
                .ease-spring { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
                .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 0.95; } 50% { opacity: 0.8; } }
            `}</style>
        </defs>

        {/* Wires */}
        {circuit.edges
          .filter((e) => e.type === "wire")
          .map((e) => (
            <WirePath key={e.id} d={e.d} active={showFlow && flowSet.has(e.id)} />
          ))}

        {/* Bulb Wires (special case to connect to midpoints) */}
        {(() => {
          const bulb = circuit.edges.find((e) => e.type === "bulb");
          if (!bulb) return null;
          const a = circuit.nodes[bulb.a];
          const b = circuit.nodes[bulb.b];
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

          const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
          const active = showFlow && flowSet.has(bulb.id);

          return (
            <g>
              <WirePath d={d} active={active} />
              <Bulb cx={mid.x} cy={mid.y - 14} lit={lit} />
            </g>
          );
        })()}

        {/* Switches */}
        {circuit.edges
          .filter((e) => e.type === "switch")
          .map((e) => {
            const a = circuit.nodes[e.a];
            const b = circuit.nodes[e.b];
            const closed = !!switchState[e.switchId];
            const active = showFlow && flowSet.has(e.id);

            return (
              <Switch
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                closed={closed}
                active={active}
                onClick={() => toggleSwitch(e.switchId)}
              />
            );
          })}

        <Battery
          x={circuit.battery.ui.x}
          y={circuit.battery.ui.y}
          w={circuit.battery.ui.w}
          h={circuit.battery.ui.h}
        />
      </svg>
    </div>
  );
}

// --------------------------------------------------------
// Circuits Data
// --------------------------------------------------------
const BASE = { L: 70, T: 70, R: 630, B: 270 };

function makeProblem1() {
  const L = 110,
    R = 610,
    T = 95,
    B = 260;
  const cx = (L + R) / 2;

  const nodes = {
    TL: { x: L, y: T },
    TR: { x: R, y: T },
    BL: { x: L, y: B },
    BR: { x: R, y: B },
    N: { x: cx - 85, y: T },
    P: { x: cx + 85, y: T },
    BulbL: { x: R - 170, y: B },
    BulbR: { x: R - 70, y: B },
    S1A: { x: L + 140, y: B + 35 },
    S1B: { x: R - 140, y: B + 35 },
  };

  const edges = [
    { id: "w_bl_tl", type: "wire", a: "BL", b: "TL", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.TL.x} ${nodes.TL.y}` },
    { id: "w_tl_n", type: "wire", a: "TL", b: "N", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.N.x} ${nodes.N.y}` },
    { id: "w_p_tr", type: "wire", a: "P", b: "TR", d: `M ${nodes.P.x} ${nodes.P.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_tr_br", type: "wire", a: "TR", b: "BR", d: `M ${nodes.TR.x} ${nodes.TR.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_bl_bulbl", type: "wire", a: "BL", b: "BulbL", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.BulbL.x} ${nodes.BulbL.y}` },
    { id: "bulb", type: "bulb", a: "BulbL", b: "BulbR" },
    { id: "w_bulbr_br", type: "wire", a: "BulbR", b: "BR", d: `M ${nodes.BulbR.x} ${nodes.BulbR.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_bl_s1a", type: "wire", a: "BL", b: "S1A", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.S1A.x} ${nodes.S1A.y}` },
    { id: "w_s1b_br", type: "wire", a: "S1B", b: "BR", d: `M ${nodes.S1B.x} ${nodes.S1B.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "sw_s1", type: "switch", a: "S1A", b: "S1B", switchId: "S1" },
  ];

  return {
    nodes,
    edges,
    battery: { pos: "P", neg: "N", ui: { x: cx - 60, y: T - 22, w: 120, h: 34 } },
    initialSwitches: { S1: true },
  };
}

function makeProblem2() {
  const nodes = {
    TL: { x: BASE.L, y: BASE.T },
    TR: { x: BASE.R, y: BASE.T },
    BR: { x: BASE.R, y: BASE.B },
    BL: { x: BASE.L, y: BASE.B },
    LM: { x: BASE.L, y: 170 },
    RM: { x: BASE.R, y: 170 },
    N: { x: 290, y: BASE.T },
    P: { x: 410, y: BASE.T },
    BulbL: { x: 470, y: BASE.B },
    BulbR: { x: 570, y: BASE.B },
    SB_A: { x: 380, y: BASE.B },
    SB_B: { x: 445, y: BASE.B },
    BY_L: { x: 170, y: 170 },
    BY_SA: { x: 305, y: 170 },
    BY_SB: { x: 365, y: 170 },
    BY_R: { x: 530, y: 170 },
  };

  const edges = [
    { id: "w_tl_n", type: "wire", a: "TL", b: "N", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.N.x} ${nodes.N.y}` },
    { id: "w_p_tr", type: "wire", a: "P", b: "TR", d: `M ${nodes.P.x} ${nodes.P.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_tr_rm", type: "wire", a: "TR", b: "RM", d: `M ${nodes.TR.x} ${nodes.TR.y} L ${nodes.RM.x} ${nodes.RM.y}` },
    { id: "w_rm_br", type: "wire", a: "RM", b: "BR", d: `M ${nodes.RM.x} ${nodes.RM.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_br_bulbr", type: "wire", a: "BR", b: "BulbR", d: `M ${nodes.BR.x} ${nodes.BR.y} L ${nodes.BulbR.x} ${nodes.BulbR.y}` },
    { id: "bulb", type: "bulb", a: "BulbR", b: "BulbL" },
    { id: "w_bulbl_sb_b", type: "wire", a: "BulbL", b: "SB_B", d: `M ${nodes.BulbL.x} ${nodes.BulbL.y} L ${nodes.SB_B.x} ${nodes.SB_B.y}` },
    { id: "sw_bulb", type: "switch", a: "SB_B", b: "SB_A", switchId: "Sbulb" },
    { id: "w_sb_a_bl", type: "wire", a: "SB_A", b: "BL", d: `M ${nodes.SB_A.x} ${nodes.SB_A.y} L ${nodes.BL.x} ${nodes.BL.y}` },
    { id: "w_bl_lm", type: "wire", a: "BL", b: "LM", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.LM.x} ${nodes.LM.y}` },
    { id: "w_lm_tl", type: "wire", a: "LM", b: "TL", d: `M ${nodes.LM.x} ${nodes.LM.y} L ${nodes.TL.x} ${nodes.TL.y}` },
    { id: "w_lm_byl", type: "wire", a: "LM", b: "BY_L", d: `M ${nodes.LM.x} ${nodes.LM.y} L ${nodes.BY_L.x} ${nodes.BY_L.y}` },
    { id: "w_byl_bysa", type: "wire", a: "BY_L", b: "BY_SA", d: `M ${nodes.BY_L.x} ${nodes.BY_L.y} L ${nodes.BY_SA.x} ${nodes.BY_SA.y}` },
    { id: "sw_bypass", type: "switch", a: "BY_SA", b: "BY_SB", switchId: "Sbypass" },
    { id: "w_bysb_byr", type: "wire", a: "BY_SB", b: "BY_R", d: `M ${nodes.BY_SB.x} ${nodes.BY_SB.y} L ${nodes.BY_R.x} ${nodes.BY_R.y}` },
    { id: "w_byr_rm", type: "wire", a: "BY_R", b: "RM", d: `M ${nodes.BY_R.x} ${nodes.BY_R.y} L ${nodes.RM.x} ${nodes.RM.y}` },
  ];

  return {
    nodes,
    edges,
    battery: { pos: "P", neg: "N", ui: { x: 315, y: 48, w: 120, h: 34 } },
    initialSwitches: { Sbulb: true, Sbypass: true },
  };
}

function makeProblem3() {
  const nodes = {
    TL: { x: BASE.L, y: BASE.T },
    TR: { x: BASE.R, y: BASE.T },
    BR: { x: BASE.R, y: BASE.B },
    BL: { x: BASE.L, y: BASE.B },
    N: { x: 290, y: BASE.T },
    P: { x: 410, y: BASE.T },
    BulbL: { x: 470, y: BASE.B },
    BulbR: { x: 570, y: BASE.B },
    T1A: { x: 140, y: 120 },
    T1B: { x: 210, y: 120 },
    T2A: { x: 270, y: 120 },
    T2B: { x: 340, y: 120 },
    T3A: { x: 400, y: 120 },
    T3B: { x: 470, y: 120 },
    LJoin: { x: BASE.L, y: 120 },
    RJoin: { x: BASE.R, y: 120 },
    SH_A: { x: 230, y: 235 },
    SH_B: { x: 310, y: 235 },
    SH_L: { x: 120, y: 235 },
    SH_R: { x: 520, y: 235 },
  };

  const edges = [
    { id: "w_tl_n", type: "wire", a: "TL", b: "N", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.N.x} ${nodes.N.y}` },
    { id: "w_p_tr", type: "wire", a: "P", b: "TR", d: `M ${nodes.P.x} ${nodes.P.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_tr_br", type: "wire", a: "TR", b: "BR", d: `M ${nodes.TR.x} ${nodes.TR.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_br_bulbr", type: "wire", a: "BR", b: "BulbR", d: `M ${nodes.BR.x} ${nodes.BR.y} L ${nodes.BulbR.x} ${nodes.BulbR.y}` },
    { id: "bulb", type: "bulb", a: "BulbR", b: "BulbL" },
    { id: "w_bulbl_bl", type: "wire", a: "BulbL", b: "BL", d: `M ${nodes.BulbL.x} ${nodes.BulbL.y} L ${nodes.BL.x} ${nodes.BL.y}` },
    { id: "w_bl_tl", type: "wire", a: "BL", b: "TL", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.TL.x} ${nodes.TL.y}` },
    { id: "w_ljoin", type: "wire", a: "TL", b: "LJoin", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.LJoin.x} ${nodes.LJoin.y}` },
    { id: "w_ljoin_t1a", type: "wire", a: "LJoin", b: "T1A", d: `M ${nodes.LJoin.x} ${nodes.LJoin.y} L ${nodes.T1A.x} ${nodes.T1A.y}` },
    { id: "sw_top1", type: "switch", a: "T1A", b: "T1B", switchId: "STop1" },
    { id: "w_t1b_t2a", type: "wire", a: "T1B", b: "T2A", d: `M ${nodes.T1B.x} ${nodes.T1B.y} L ${nodes.T2A.x} ${nodes.T2A.y}` },
    { id: "sw_top2", type: "switch", a: "T2A", b: "T2B", switchId: "STop2" },
    { id: "w_t2b_t3a", type: "wire", a: "T2B", b: "T3A", d: `M ${nodes.T2B.x} ${nodes.T2B.y} L ${nodes.T3A.x} ${nodes.T3A.y}` },
    { id: "sw_top3", type: "switch", a: "T3A", b: "T3B", switchId: "STop3" },
    { id: "w_t3b_rjoin", type: "wire", a: "T3B", b: "RJoin", d: `M ${nodes.T3B.x} ${nodes.T3B.y} L ${nodes.RJoin.x} ${nodes.RJoin.y}` },
    { id: "w_rjoin_tr", type: "wire", a: "RJoin", b: "TR", d: `M ${nodes.RJoin.x} ${nodes.RJoin.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_bl_shl", type: "wire", a: "BL", b: "SH_L", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.SH_L.x} ${nodes.SH_L.y}` },
    { id: "w_shl_sha", type: "wire", a: "SH_L", b: "SH_A", d: `M ${nodes.SH_L.x} ${nodes.SH_L.y} L ${nodes.SH_A.x} ${nodes.SH_A.y}` },
    { id: "sw_short", type: "switch", a: "SH_A", b: "SH_B", switchId: "SShort" },
    { id: "w_shb_shr", type: "wire", a: "SH_B", b: "SH_R", d: `M ${nodes.SH_B.x} ${nodes.SH_B.y} L ${nodes.SH_R.x} ${nodes.SH_R.y}` },
    { id: "w_shr_br", type: "wire", a: "SH_R", b: "BR", d: `M ${nodes.SH_R.x} ${nodes.SH_R.y} L ${nodes.BR.x} ${nodes.BR.y}` },
  ];

  return {
    nodes,
    edges,
    battery: { pos: "P", neg: "N", ui: { x: 315, y: 48, w: 120, h: 34 } },
    initialSwitches: { STop1: true, STop2: true, STop3: true, SShort: true },
  };
}

function makeProblem4() {
  const nodes = {
    TL: { x: BASE.L, y: BASE.T },
    TR: { x: BASE.R, y: BASE.T },
    BR: { x: BASE.R, y: BASE.B },
    BL: { x: BASE.L, y: BASE.B },
    N: { x: 290, y: BASE.T },
    P: { x: 410, y: BASE.T },
    BulbL: { x: 470, y: BASE.B },
    BulbR: { x: 570, y: BASE.B },
    LSA: { x: BASE.L, y: 155 },
    LSB: { x: BASE.L, y: 185 },
    RSA: { x: BASE.R, y: 155 },
    RSB: { x: BASE.R, y: 185 },
    MSA: { x: 300, y: 170 },
    MSB: { x: 380, y: 170 },
    ML: { x: 170, y: 170 },
    MR: { x: 530, y: 170 },
  };

  const edges = [
    { id: "w_tl_n", type: "wire", a: "TL", b: "N", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.N.x} ${nodes.N.y}` },
    { id: "w_p_tr", type: "wire", a: "P", b: "TR", d: `M ${nodes.P.x} ${nodes.P.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_tl_lsa", type: "wire", a: "TL", b: "LSA", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.LSA.x} ${nodes.LSA.y}` },
    { id: "sw_left", type: "switch", a: "LSA", b: "LSB", switchId: "SLeft" },
    { id: "w_lsb_bl", type: "wire", a: "LSB", b: "BL", d: `M ${nodes.LSB.x} ${nodes.LSB.y} L ${nodes.BL.x} ${nodes.BL.y}` },
    { id: "w_tr_rsa", type: "wire", a: "TR", b: "RSA", d: `M ${nodes.TR.x} ${nodes.TR.y} L ${nodes.RSA.x} ${nodes.RSA.y}` },
    { id: "sw_right", type: "switch", a: "RSA", b: "RSB", switchId: "SRight" },
    { id: "w_rsb_br", type: "wire", a: "RSB", b: "BR", d: `M ${nodes.RSB.x} ${nodes.RSB.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_br_bulbr", type: "wire", a: "BR", b: "BulbR", d: `M ${nodes.BR.x} ${nodes.BR.y} L ${nodes.BulbR.x} ${nodes.BulbR.y}` },
    { id: "bulb", type: "bulb", a: "BulbR", b: "BulbL" },
    { id: "w_bulbl_bl", type: "wire", a: "BulbL", b: "BL", d: `M ${nodes.BulbL.x} ${nodes.BulbL.y} L ${nodes.BL.x} ${nodes.BL.y}` },
    { id: "w_lsb_ml", type: "wire", a: "LSB", b: "ML", d: `M ${nodes.LSB.x} ${nodes.LSB.y} L ${nodes.ML.x} ${nodes.ML.y}` },
    { id: "w_ml_msa", type: "wire", a: "ML", b: "MSA", d: `M ${nodes.ML.x} ${nodes.ML.y} L ${nodes.MSA.x} ${nodes.MSA.y}` },
    { id: "sw_mid", type: "switch", a: "MSA", b: "MSB", switchId: "SMid" },
    { id: "w_msb_mr", type: "wire", a: "MSB", b: "MR", d: `M ${nodes.MSB.x} ${nodes.MSB.y} L ${nodes.MR.x} ${nodes.MR.y}` },
    { id: "w_mr_rsb", type: "wire", a: "MR", b: "RSB", d: `M ${nodes.MR.x} ${nodes.MR.y} L ${nodes.RSB.x} ${nodes.RSB.y}` },
  ];

  return {
    nodes,
    edges,
    battery: { pos: "P", neg: "N", ui: { x: 315, y: 48, w: 120, h: 34 } },
    initialSwitches: { SLeft: true, SRight: true, SMid: true },
  };
}

function makeProblem5() {
  const nodes = {
    TL: { x: BASE.L, y: BASE.T },
    TR: { x: BASE.R, y: BASE.T },
    BR: { x: BASE.R, y: BASE.B },
    BL: { x: BASE.L, y: BASE.B },
    N: { x: 290, y: BASE.T },
    P: { x: 410, y: BASE.T },
    BulbL: { x: 470, y: BASE.B },
    BulbR: { x: 570, y: BASE.B },
    RSA: { x: BASE.R, y: 145 },
    RSB: { x: BASE.R, y: 185 },
    BSA: { x: 170, y: BASE.B },
    BSB: { x: 250, y: BASE.B },
    SA1: { x: 300, y: 170 },
    SB1: { x: 380, y: 170 },
    SL: { x: 150, y: 170 },
    SR: { x: 540, y: 170 },
    SA2: { x: 300, y: 235 },
    SB2: { x: 380, y: 235 },
    SL2: { x: 150, y: 235 },
    SR2: { x: 540, y: 235 },
  };

  const edges = [
    { id: "w_tl_n", type: "wire", a: "TL", b: "N", d: `M ${nodes.TL.x} ${nodes.TL.y} L ${nodes.N.x} ${nodes.N.y}` },
    { id: "w_p_tr", type: "wire", a: "P", b: "TR", d: `M ${nodes.P.x} ${nodes.P.y} L ${nodes.TR.x} ${nodes.TR.y}` },
    { id: "w_tr_rsa", type: "wire", a: "TR", b: "RSA", d: `M ${nodes.TR.x} ${nodes.TR.y} L ${nodes.RSA.x} ${nodes.RSA.y}` },
    { id: "sw_right", type: "switch", a: "RSA", b: "RSB", switchId: "SRight" },
    { id: "w_rsb_br", type: "wire", a: "RSB", b: "BR", d: `M ${nodes.RSB.x} ${nodes.RSB.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_bl_bsa", type: "wire", a: "BL", b: "BSA", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.BSA.x} ${nodes.BSA.y}` },
    { id: "sw_bottom", type: "switch", a: "BSA", b: "BSB", switchId: "SBottom" },
    { id: "w_bsb_bulbl", type: "wire", a: "BSB", b: "BulbL", d: `M ${nodes.BSB.x} ${nodes.BSB.y} L ${nodes.BulbL.x} ${nodes.BulbL.y}` },
    { id: "bulb", type: "bulb", a: "BulbL", b: "BulbR" },
    { id: "w_bulbr_br", type: "wire", a: "BulbR", b: "BR", d: `M ${nodes.BulbR.x} ${nodes.BulbR.y} L ${nodes.BR.x} ${nodes.BR.y}` },
    { id: "w_bl_tl", type: "wire", a: "BL", b: "TL", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.TL.x} ${nodes.TL.y}` },
    { id: "w_bl_sl", type: "wire", a: "BL", b: "SL", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.SL.x} ${nodes.SL.y}` },
    { id: "w_sl_sa1", type: "wire", a: "SL", b: "SA1", d: `M ${nodes.SL.x} ${nodes.SL.y} L ${nodes.SA1.x} ${nodes.SA1.y}` },
    { id: "sw_short1", type: "switch", a: "SA1", b: "SB1", switchId: "SShort1" },
    { id: "w_sb1_sr", type: "wire", a: "SB1", b: "SR", d: `M ${nodes.SB1.x} ${nodes.SB1.y} L ${nodes.SR.x} ${nodes.SR.y}` },
    { id: "w_sr_rsb", type: "wire", a: "SR", b: "RSB", d: `M ${nodes.SR.x} ${nodes.SR.y} L ${nodes.RSB.x} ${nodes.RSB.y}` },
    { id: "w_bl_sl2", type: "wire", a: "BL", b: "SL2", d: `M ${nodes.BL.x} ${nodes.BL.y} L ${nodes.SL2.x} ${nodes.SL2.y}` },
    { id: "w_sl2_sa2", type: "wire", a: "SL2", b: "SA2", d: `M ${nodes.SL2.x} ${nodes.SL2.y} L ${nodes.SA2.x} ${nodes.SA2.y}` },
    { id: "sw_short2", type: "switch", a: "SA2", b: "SB2", switchId: "SShort2" },
    { id: "w_sb2_sr2", type: "wire", a: "SB2", b: "SR2", d: `M ${nodes.SB2.x} ${nodes.SB2.y} L ${nodes.SR2.x} ${nodes.SR2.y}` },
    { id: "w_sr2_br", type: "wire", a: "SR2", b: "BR", d: `M ${nodes.SR2.x} ${nodes.SR2.y} L ${nodes.BR.x} ${nodes.BR.y}` },
  ];

  return {
    nodes,
    edges,
    battery: { pos: "P", neg: "N", ui: { x: 315, y: 48, w: 120, h: 34 } },
    initialSwitches: { SRight: true, SBottom: true, SShort1: true, SShort2: true },
  };
}

// --------------------------------------------------------
// Lesson steps
// --------------------------------------------------------
const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    prompt: "Open the switch to light the bulb.",
    why: "Right now there is an easy path with no bulbs, so all the current takes that route instead of going through the bulb. Opening the switch breaks that shortcut and forces current through the bulb.",
    circuitFactory: makeProblem1,
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    prompt: "Open one of the switches to light the bulb.",
    why: "The switch next to the bulb must stay closed so current can reach the bulb. The other switch creates a shortcut: if it is closed, current skips the bulb and goes straight back to the battery.",
    circuitFactory: makeProblem2,
  },
  {
    id: "info1",
    type: "info",
    title: "Bulbs and shortcuts",
    prompt:
      "Bulbs act as obstacles to current. If there is a wire with no bulbs that still leads back to the battery, almost all the current will take that easier route.",
    why: "To make a bulb light, you need two things: a complete loop and no easier loop that avoids the bulb. Short-circuits happen when a bare wire gives current a way to dodge the bulb.",
    circuitFactory: makeProblem1,
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    prompt: "Open switches to light the bulb.",
    why: "Several branches connect the two sides of the circuit. Any branch that has no bulb is a shortcut. Every shortcut must be broken by opening at least one switch on that branch, while keeping a full route through the bulb.",
    circuitFactory: makeProblem3,
  },
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    prompt: "Open switches to light the bulb.",
    why: "Two switches need to stay closed to give current a path through the bulb. The middle branch is a bypass: if that switch is closed, current can travel from one side of the circuit to the other without passing through the bulb.",
    circuitFactory: makeProblem4,
  },
  {
    id: "prob5",
    type: "problem",
    title: "Problem 5",
    prompt: "Open switches to light the bulb.",
    why: "There are several extra branches that can short-circuit the bulb. The switches next to the bulb must stay closed so current can reach it. All of the other branches must be opened so there is no complete loop that skips the bulb.",
    circuitFactory: makeProblem5,
  },
  {
    id: "summary",
    type: "info",
    title: "Short-circuits",
    prompt: "An obstacle-free route for current that bypasses components is called a short-circuit.",
    why: "If you want current to flow through a component, like a bulb, every complete loop from the battery back to the battery must pass through that component. Any easier loop that avoids it will steal the current and leave the component off.",
    circuitFactory: makeProblem1,
  },
];

// --------------------------------------------------------
// Problem + info cards
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
    if (state.lit && !isCompleted) {
      playSound("win");
      setShowConfetti(true);
      onComplete?.();
      setTimeout(() => setShowConfetti(false), 800);
    }
  }, [state.lit, isCompleted, onComplete]);

  const handleReset = () => {
    playSound("snap");
    setSwitchState(circuit.initialSwitches);
    setShowWhy(false);
    setShowConfetti(false);
  };

  const handleSwitchToggle = () => {
    if (isCompleted) return;
    playSound("pop");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {step.title}
            </div>
            <div className="mt-2 text-xl md:text-2xl font-semibold leading-snug">
              {step.prompt}
            </div>
          </div>

          <div
            className={`shrink-0 w-10 h-10 rounded-full grid place-items-center border-2 transition-colors duration-500 ${
              state.lit
                ? "bg-green-50 border-green-200 text-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            {state.lit ? <Check size={20} strokeWidth={3} /> : <Zap size={20} />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => {
              playSound("pop");
              setShowWhy((v) => !v);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition flex items-center gap-2 text-sm"
          >
            <HelpCircle size={18} /> Why?
          </button>

          <button
            onClick={handleReset}
            className={`px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition flex items-center gap-2 text-sm ${
              isCompleted ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCompleted}
          >
            <RotateCcw size={18} /> Restart
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:flex">
            <MousePointer2 size={14} />
            Tap switches
          </div>
        </div>

        {showWhy && (
          <div className="mt-4 bg-blue-50/80 border border-blue-100 text-blue-800 rounded-2xl p-4 text-sm font-medium animate-in slide-in-from-top-2">
            {step.why}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-500">
          Status:{" "}
          <span className={`px-2 py-0.5 rounded-md ${state.lit ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
            {state.lit ? "BULB ON" : "BULB OFF"}
          </span>
          {isCompleted && (
            <span className="ml-auto text-emerald-600 text-xs uppercase tracking-wider flex items-center gap-1">
              <Check size={14} strokeWidth={3} /> Solved
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-200 rounded-[2rem] shadow-inner p-2 sm:p-5 relative overflow-hidden group">
        <div className="absolute left-6 top-5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/80 backdrop-blur border border-slate-200 px-2 py-1 rounded-md z-10 shadow-sm">
          Interactive Circuit
        </div>
        <div className="pt-8 sm:pt-4 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <CircuitView
            circuit={circuit}
            switchState={switchState}
            setSwitchState={setSwitchState}
            showFlow
            lock={false}
            onSwitchToggle={handleSwitchToggle}
          />
        </div>

        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center z-20">
            <div className="px-6 py-3 rounded-2xl bg-green-500 text-white font-black shadow-xl animate-pop flex items-center gap-2">
              <Check size={24} strokeWidth={4} />
              Excellent!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoStep = ({ step, isLast, onComplete }) => {
  const [expanded, setExpanded] = useState(false);

  const handleContinue = () => {
    playSound("snap");
    onComplete?.();
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900 text-slate-50 p-6 overflow-hidden shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap size={120} />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Key Concept
            </div>
            <div className="mt-1 text-xl md:text-2xl font-bold text-white tracking-tight">
              {step.title}
            </div>
          </div>
        </div>

        <p className="text-base md:text-lg leading-relaxed text-slate-300 max-w-2xl">
          {step.prompt}
        </p>

        <div className="pt-2">
            <button
            onClick={() => {
                playSound("pop");
                setExpanded((v) => !v);
            }}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 hover:text-indigo-200 transition-colors"
            >
            {expanded ? "Hide Explanation" : "Read Explanation"}
            <ArrowRight size={14} className={`transition-transform duration-300 ${expanded ? "rotate-90" : "group-hover:translate-x-1"}`} />
            </button>
        </div>

        {expanded && (
          <div className="text-sm leading-relaxed text-slate-300 bg-white/5 border border-white/10 rounded-xl p-4 animate-in slide-in-from-top-1">
            {step.why}
          </div>
        )}

        {!isLast && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 active:scale-[0.98] shadow-lg shadow-indigo-500/20 transition-all hover:pr-5"
            >
              Continue Lesson <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --------------------------------------------------------
// Main lesson component
// --------------------------------------------------------
const ShortCircuitsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);

  const problemSteps = useMemo(
    () => LESSON_STEPS.filter((s) => s.type === "problem"),
    []
  );

  const activeStepIndex = completedSteps.length;
  const visibleSteps = LESSON_STEPS.slice(0, activeStepIndex + 1);

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, [completedSteps.length]);

  const completedProblems = completedSteps.filter((id) =>
    problemSteps.some((s) => s.id === id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32 selection:bg-indigo-100 selection:text-indigo-900">
      {/* STICKY HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-none">
                Short Circuits
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interactive Physics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
            <Trophy
              size={16}
              className={
                completedProblems > 0
                  ? "text-amber-500 fill-amber-500 animate-bounce"
                  : "text-slate-300"
              }
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-700 text-sm">
                {completedProblems}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {problemSteps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE FEED */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-12 mt-4">
        {visibleSteps.map((step, index) => {
            const isLast =
            index === visibleSteps.length - 1 &&
            step.type === "info" &&
            step.id === LESSON_STEPS[LESSON_STEPS.length - 1].id;
            
          const isProblem = step.type === "problem";
          const isCompleted = completedSteps.includes(step.id);
          const problemNumber = problemSteps.findIndex((s) => s.id === step.id) + 1;

          if (step.type === "info") {
            return (
              <div key={step.id} ref={index === activeStepIndex ? bottomRef : undefined} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <InfoStep
                  step={step}
                  isLast={isLast}
                  onComplete={() => handleStepComplete(step.id)}
                />
              </div>
            );
          }

          return (
            <div
              key={step.id}
              className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
              ref={index === activeStepIndex ? bottomRef : undefined}
            >
              {isProblem && (
                <div className="absolute -left-3 md:-left-12 top-0 flex flex-col items-center h-full pointer-events-none hidden md:flex">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-500 z-10 ${
                      isCompleted
                        ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200"
                        : "bg-white border-slate-200 text-slate-300"
                    }`}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={4} /> : problemNumber}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-2 rounded-full"></div>}
                </div>
              )}

              <CircuitProblem
                step={step}
                isCompleted={isCompleted}
                onComplete={() => handleStepComplete(step.id)}
              />
            </div>
          );
        })}
      </div>

      {/* CSS animations */}
      <style>{`
        .wire-flow {
          animation: dash 0.8s linear infinite;
        }
        @keyframes dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
      `}</style>
    </div>
  );
};

export default ShortCircuitsLesson;