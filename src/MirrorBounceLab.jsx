// MirrorBounceLab.jsx – FINAL FIX (2-mirror geometry corrected)
import React, { useState, useMemo, useEffect } from "react";
import {
  Sun,
  Target,
  ArrowRight,
  RotateCcw,
  Star,
  Home,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

// Board size
const WIDTH = 360;
const HEIGHT = 240;
const MIRROR_LENGTH = 80;

// LocalStorage for stars
const PROGRESS_KEY = "mirror_bounce_lab_progress_final";

const loadProgress = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProgress = (progress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

// ---- Math helpers ----
const toRad = (deg) => (deg * Math.PI) / 180;

const normalize = (v) => {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
};

const cross = (a, b) => a.x * b.y - a.y * b.x;

// Ray p + t r, t>=0 vs finite mirror segment
const intersectRayWithSegment = (rayOrigin, rayDir, center, dir, halfLen) => {
  const p = rayOrigin;
  const r = rayDir;
  const q = center;
  const s = dir;

  const rxs = cross(r, s);
  if (Math.abs(rxs) < 1e-6) return null; // parallel

  const qmp = { x: q.x - p.x, y: q.y - p.y };
  const t = cross(qmp, s) / rxs;
  if (t < 0) return null;

  const hit = { x: p.x + r.x * t, y: p.y + r.y * t };

  // inside segment?
  const vx = hit.x - center.x;
  const vy = hit.y - center.y;
  const proj = vx * s.x + vy * s.y;
  if (Math.abs(proj) > halfLen) return null;

  return hit;
};

// Reflect dIn across mirror line with given angle (deg)
const computeReflection = (dIn, mirrorAngleDeg) => {
  const theta = toRad(mirrorAngleDeg);
  const mirrorDir = { x: Math.cos(theta), y: Math.sin(theta) };
  const normal = normalize({ x: -mirrorDir.y, y: mirrorDir.x });

  const d = normalize(dIn);
  const dot = d.x * normal.x + d.y * normal.y;

  const out = {
    x: d.x - 2 * dot * normal.x,
    y: d.y - 2 * dot * normal.y,
  };

  const incAngleRad = Math.acos(
    Math.min(1, Math.max(-1, Math.abs(dot)))
  );
  const incAngleDeg = (incAngleRad * 180) / Math.PI;

  return {
    normal,
    out: normalize(out),
    incAngleDeg,
    refAngleDeg: incAngleDeg,
  };
};

// ---- LEVELS ----
// All levels start with a horizontal ray from the left.
// Geometry was computed so at the solution angles the light hits:
// source -> mirror1 -> (mirror2 if exists) -> target.
const LEVELS = [
  {
    id: 1,
    name: "Floor Bounce",
    intro: "Rotate the mirror so the beam bounces down towards the floor target.",
    mirrors: [
      {
        cx: 180, // reflection point on the horizontal middle line
        cy: 120,
        solutionAngle: 16.4, // works with the physics engine
        initialAngle: 16.4 + 20, // starts UNSOLVED
      },
    ],
    target: {
      x: 320,
      y: 210,
      r: 22,
    },
  },
  {
    id: 2,
    name: "Sky Shot",
    intro: "Now aim the beam upwards to hit the high target near the top.",
    mirrors: [
      {
        cx: 180,
        cy: 120,
        solutionAngle: -14.9,
        initialAngle: -14.9 + 20,
      },
    ],
    target: {
      x: 320,
      y: 40,
      r: 20,
    },
  },
  {
    id: 3,
    name: "Double Bounce Up",
    intro:
      "Use BOTH mirrors. First bounce, second bounce, then steer the beam up to the target.",
    mirrors: [
      {
        cx: 150, // first reflection point (on the beam)
        cy: 120,
        solutionAngle: -10.9,
        initialAngle: -10.9 + 20,
      },
      {
        cx: 250, // second reflection point
        cy: 80,
        solutionAngle: -24.2,
        initialAngle: -24.2 + 20,
      },
    ],
    target: {
      x: 330,
      y: 40,
      r: 22,
    },
  },
  {
    id: 4,
    name: "Double Bounce Around",
    intro:
      "Bounce off mirror 1 then mirror 2 to curve the light around and hit the side target.",
    mirrors: [
      {
        cx: 160,
        cy: 120,
        solutionAngle: 14.3,
        initialAngle: 14.3 + 20,
      },
      {
        cx: 270,
        cy: 180,
        solutionAngle: -58.5,
        initialAngle: -58.5 + 20,
      },
    ],
    target: {
      x: 80,
      y: 50,
      r: 22,
    },
  },
];

const MirrorBounceLab = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [view, setView] = useState("game"); // "game" | "win"
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(LEVELS[0].intro);
  const [angles, setAngles] = useState(
    LEVELS[0].mirrors.map((m) => m.initialAngle)
  );
  const [progress, setProgress] = useState(() => loadProgress());

  const currentLevel = LEVELS[levelIndex];
  const source = { x: 60, y: HEIGHT / 2 };
  const rayStartDir = { x: 1, y: 0 }; // always horizontal

  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  // ---------- GEOMETRY ----------
  const geom = useMemo(() => {
    const { mirrors, target } = currentLevel;

    let rayOrigin = { ...source };
    let rayDir = normalize(rayStartDir);

    const pathPoints = [source];
    const mirrorData = [];
    const halfLen = MIRROR_LENGTH / 2;

    let lastIncAngle = null;
    let lastRefAngle = null;
    let lastNormal = null;

    for (let i = 0; i < mirrors.length; i++) {
      const m = mirrors[i];
      const angleDeg = angles[i] ?? m.initialAngle;
      const center = { x: m.cx, y: m.cy };

      const theta = toRad(angleDeg);
      const lineDir = { x: Math.cos(theta), y: Math.sin(theta) };

      const hitPoint = intersectRayWithSegment(
        rayOrigin,
        rayDir,
        center,
        lineDir,
        halfLen
      );
      if (!hitPoint) break;

      const { normal, out, incAngleDeg, refAngleDeg } = computeReflection(
        rayDir,
        angleDeg
      );

      pathPoints.push(hitPoint);
      mirrorData.push({
        center,
        dir: lineDir,
        normal,
        hitPoint,
        angleDeg,
        incAngleDeg,
        refAngleDeg,
      });

      lastIncAngle = incAngleDeg;
      lastRefAngle = refAngleDeg;
      lastNormal = normal;

      rayOrigin = hitPoint;
      rayDir = out;
    }

    // Final segment
    const finalOrigin = { ...rayOrigin };
    const finalDir = normalize(rayDir);
    const finalLen = 500;
    const finalEnd = {
      x: finalOrigin.x + finalDir.x * finalLen,
      y: finalOrigin.y + finalDir.y * finalLen,
    };
    pathPoints.push(finalEnd);

    // Distance from target to this final ray
    const toTarget = {
      x: target.x - finalOrigin.x,
      y: target.y - finalOrigin.y,
    };
    const tProj = finalDir.x * toTarget.x + finalDir.y * toTarget.y;

    let hit = false;
    let closestPoint = null;

    if (tProj >= 0) {
      const proj = {
        x: finalOrigin.x + finalDir.x * tProj,
        y: finalOrigin.y + finalDir.y * tProj,
      };
      const dist = Math.hypot(proj.x - target.x, proj.y - target.y);
      closestPoint = { ...proj, dist };
      if (dist <= target.r) hit = true;
    }

    return {
      pathPoints,
      mirrorData,
      finalOrigin,
      finalEnd,
      lastIncAngle,
      lastRefAngle,
      lastNormal,
      hit,
      closestPoint,
    };
  }, [angles, currentLevel, rayStartDir, source]);

  const {
    pathPoints,
    mirrorData,
    finalOrigin,
    finalEnd,
    lastIncAngle,
    lastRefAngle,
    hit,
    closestPoint,
  } = geom;

  // ---------- GAME LOGIC ----------
  const resetLevel = () => {
    setAngles(currentLevel.mirrors.map((m) => m.initialAngle));
    setAttempts(0);
    setMessage(currentLevel.intro);
    setView("game");
  };

  const goNext = () => {
    if (levelIndex < LEVELS.length - 1) {
      const nextIndex = levelIndex + 1;
      const nextLevel = LEVELS[nextIndex];
      setLevelIndex(nextIndex);
      setAngles(nextLevel.mirrors.map((m) => m.initialAngle));
      setAttempts(0);
      setMessage(nextLevel.intro);
      setView("game");
    } else {
      // loop back to level 1
      const first = LEVELS[0];
      setLevelIndex(0);
      setAngles(first.mirrors.map((m) => m.initialAngle));
      setAttempts(0);
      setMessage(first.intro);
      setView("game");
    }
  };

  const starsEarned = useMemo(() => {
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    if (attempts <= 3) return 1;
    return 1;
  }, [attempts]);

  // Save progress on win
  useEffect(() => {
    if (view !== "win") return;
    const levelId = currentLevel.id;
    setProgress((prev) => {
      const prevStars = prev[levelId] || 0;
      const best = Math.max(prevStars, starsEarned);
      const next = { ...prev, [levelId]: best };
      saveProgress(next);
      return next;
    });
  }, [view, currentLevel.id, starsEarned]);

  const checkAnswer = () => {
    if (hit) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);

      if (!closestPoint) {
        setMessage(
          "Rotate the mirrors so the final beam gets closer to the target circle."
        );
        return;
      }

      if (closestPoint.dist <= currentLevel.target.r * 1.5) {
        setMessage(
          "So close! Tiny changes in one mirror angle will nudge the beam onto the target."
        );
      } else if (closestPoint.y < currentLevel.target.y) {
        setMessage(
          "Your beam is passing above the target. Tilt a mirror so the final ray aims lower."
        );
      } else {
        setMessage(
          "Your beam is passing below the target. Tilt a mirror so the final ray aims higher."
        );
      }
    }
  };

  const handleAngleChange = (index, newAngle) => {
    const clamped = Math.max(-90, Math.min(90, newAngle));
    setAngles((prev) => prev.map((a, i) => (i === index ? clamped : a)));
  };

  const giveHint = () => {
    const updated = currentLevel.mirrors.map((m, i) => {
      const current = angles[i];
      const target = m.solutionAngle;
      const diff = target - current;
      if (Math.abs(diff) < 1) return current;
      const step = diff > 0 ? 3 : -3;
      return current + step;
    });
    setAngles(updated);
    setMessage(
      "Hint used: I nudged each mirror closer to the perfect angles. Watch how the path changed!"
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Physics Lab
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight">
              Mirror Bounce Lab · Advanced
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Sun size={16} className="text-yellow-400" />
            <span className="font-semibold">
              Level {currentLevel.id} / {LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white flex items-center gap-1 text-[11px] sm:text-xs">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold">
              {totalStars} / {totalMaxStars} stars
            </span>
          </div>
        </div>
      </header>

      {/* GAME VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: visual board */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-sky-300 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md">
                Light bounces when it hits a mirror. The{" "}
                <span className="font-semibold">angle of incidence</span> equals
                the <span className="font-semibold">angle of reflection</span>.
                With two mirrors you can bend light around corners.
              </p>
            </div>

            {/* SVG scene */}
            <div className="bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-md">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-auto rounded-xl bg-slate-900"
              >
                {/* Grid */}
                <defs>
                  <pattern
                    id="grid"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(148,163,184,0.15)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />

                {/* Target */}
                <g>
                  <circle
                    cx={currentLevel.target.x}
                    cy={currentLevel.target.y}
                    r={currentLevel.target.r}
                    fill={hit ? "rgba(34,197,94,0.35)" : "rgba(56,189,248,0.25)"}
                    stroke={hit ? "#22c55e" : "#38bdf8"}
                    strokeWidth="2"
                    className={hit ? "animate-pulse" : ""}
                  />
                  <circle
                    cx={currentLevel.target.x}
                    cy={currentLevel.target.y}
                    r={6}
                    fill={hit ? "#22c55e" : "#38bdf8"}
                  />
                </g>

                {/* Source */}
                <g>
                  <circle
                    cx={source.x}
                    cy={source.y}
                    r={14}
                    fill="#facc15"
                    stroke="#fde68a"
                    strokeWidth="2"
                  />
                </g>

                {/* Beam */}
                {pathPoints.map((p, i) => {
                  if (i === 0) return null;
                  const p0 = pathPoints[i - 1];
                  const p1 = p;
                  const isFinal = i === pathPoints.length - 1;
                  return (
                    <line
                      key={i}
                      x1={p0.x}
                      y1={p0.y}
                      x2={p1.x}
                      y2={p1.y}
                      stroke={
                        isFinal ? (hit ? "#22c55e" : "#38bdf8") : "#f97316"
                      }
                      strokeWidth={isFinal ? 3.5 : 3}
                      strokeLinecap="round"
                      strokeDasharray={
                        isFinal ? (hit ? "none" : "6 6") : "none"
                      }
                    />
                  );
                })}

                {/* Mirrors (only the ones actually hit are drawn with hit point) */}
                {mirrorData.map((m, idx) => {
                  const length = MIRROR_LENGTH;
                  const half = length / 2;
                  const mx1 = m.center.x - m.dir.x * half;
                  const my1 = m.center.y - m.dir.y * half;
                  const mx2 = m.center.x + m.dir.x * half;
                  const my2 = m.center.y + m.dir.y * half;
                  const normalScale = 20;

                  return (
                    <g key={idx}>
                      <line
                        x1={mx1}
                        y1={my1}
                        x2={mx2}
                        y2={my2}
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={m.center.x}
                        cy={m.center.y}
                        r={5}
                        fill="#e5e7eb"
                      />
                      <line
                        x1={m.center.x}
                        y1={m.center.y}
                        x2={m.center.x + m.normal.x * normalScale}
                        y2={m.center.y + m.normal.y * normalScale}
                        stroke="rgba(248,250,252,0.5)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={m.hitPoint.x}
                        cy={m.hitPoint.y}
                        r={4}
                        fill="#f97316"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Info */}
            <div className="mt-4 text-[11px] sm:text-xs text-slate-300 text-center max-w-xs space-y-1">
              <p>
                Mirrors used:{" "}
                <span className="font-semibold text-sky-200">
                  {mirrorData.length}
                </span>{" "}
                / {currentLevel.mirrors.length}
              </p>
              {lastIncAngle != null && lastRefAngle != null && (
                <p>
                  At the <span className="font-semibold">last mirror</span> ·
                  incidence ≈{" "}
                  <span className="font-semibold text-amber-200">
                    {lastIncAngle.toFixed(1)}°
                  </span>{" "}
                  · reflection ≈{" "}
                  <span className="font-semibold text-emerald-200">
                    {lastRefAngle.toFixed(1)}°
                  </span>
                </p>
              )}
              {closestPoint && !hit && (
                <p>
                  Distance to target center ≈{" "}
                  <span className="font-semibold text-sky-200">
                    {closestPoint.dist.toFixed(1)} px
                  </span>
                  .
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: controls */}
          <div className="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-600 flex items-center justify-center text-yellow-200 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🔍
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-sky-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-sky-900">
                  <p className="font-semibold mb-1">
                    Physics idea: Angle of incidence = angle of reflection
                  </p>
                  <p>
                    The ray and its reflection make the same angle with the
                    normal line to the mirror. With two mirrors you can send
                    light round corners, like a periscope or laser maze.
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-3 sm:space-y-4">
                  {currentLevel.mirrors.map((m, idx) => {
                    const diff = angles[idx] - m.solutionAngle;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-100 rounded-2xl p-3 sm:p-4"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-xs sm:text-sm font-semibold text-slate-700">
                            Mirror {idx + 1} angle{" "}
                            <span className="text-slate-500">
                              ({angles[idx].toFixed(1)}°)
                            </span>
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-500">
                            Target ≈{" "}
                            <span className="font-semibold">
                              {m.solutionAngle.toFixed(1)}°
                            </span>{" "}
                            (Δ {diff.toFixed(1)}°)
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAngleChange(idx, angles[idx] - 5)
                            }
                            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm active:scale-95 transition-transform"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <input
                            type="range"
                            min={-90}
                            max={90}
                            value={angles[idx]}
                            onChange={(e) =>
                              handleAngleChange(
                                idx,
                                parseFloat(e.target.value)
                              )
                            }
                            className="flex-1 accent-sky-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleAngleChange(idx, angles[idx] + 5)
                            }
                            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm active:scale-95 transition-transform"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Tiny changes in angle move the beam a lot. Nudge, then
                          press <span className="font-semibold">Check Beam</span>.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-sky-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Beam
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={giveHint}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint (nudge mirrors)
                  </button>
                  <button
                    onClick={resetLevel}
                    className="flex-1 bg-slate-900 text-white py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset Level
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Attempts this level:{" "}
                  <span className="font-semibold">{attempts}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-sky-100">
            <div className="inline-flex bg-sky-100 p-3 sm:p-4 rounded-full mb-4 text-sky-500">
              <Target size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Laser Locked On!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              You steered the light exactly onto the target using{" "}
              {currentLevel.mirrors.length} mirror
              {currentLevel.mirrors.length > 1 ? "s" : ""}. This is how
              periscopes and laser puzzles work in real life.
            </p>

            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={30}
                  className={
                    s <= starsEarned
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-full bg-sky-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-sky-700 transition-colors flex justify-center gap-2 items-center"
            >
              Next Level
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => {
                setView("game");
                setAttempts(0);
                setMessage(currentLevel.intro);
              }}
              className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
            >
              Replay Level
            </button>

            <p className="mt-4 text-[11px] text-slate-400">
              Stars this level: {starsEarned} / 3 · Total: {totalStars} /{" "}
              {totalMaxStars}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MirrorBounceLab;
