// MirrorBounceLab.jsx (Advanced, fixed & unsolved by default)
import React, { useState, useMemo } from "react";
import {
  Sun,
  Target,
  ArrowRight,
  RotateCcw,
  Star,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const WIDTH = 360;
const HEIGHT = 240;

// ---------- MATH HELPERS ----------
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const normalize = (v) => {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
};

const cross = (a, b) => a.x * b.y - a.y * b.x;

// Ray: p + t r, t >= 0
// Line: q + u s, u any
const intersectRayWithLine = (rayOrigin, rayDir, linePoint, lineDir) => {
  const p = rayOrigin;
  const r = rayDir;
  const q = linePoint;
  const s = lineDir;

  const rxs = cross(r, s);
  if (Math.abs(rxs) < 1e-6) return null; // parallel

  const qmp = { x: q.x - p.x, y: q.y - p.y };
  const t = cross(qmp, s) / rxs;
  if (t < 0) return null; // intersection behind origin

  return {
    x: p.x + r.x * t,
    y: p.y + r.y * t,
  };
};

const computeReflection = (dIn, mirrorAngleDeg) => {
  const theta = toRad(mirrorAngleDeg);
  const mirrorDir = { x: Math.cos(theta), y: Math.sin(theta) };
  const normal = normalize({ x: -mirrorDir.y, y: mirrorDir.x });
  const d = normalize(dIn);
  const dot = d.x * normal.x + d.y * normal.y;

  // r = d - 2(d·n)n
  const out = {
    x: d.x - 2 * dot * normal.x,
    y: d.y - 2 * dot * normal.y,
  };

  const incAngleDeg = toDeg(
    Math.acos(Math.min(1, Math.max(-1, Math.abs(dot))))
  );

  return {
    normal,
    out: normalize(out),
    incAngleDeg,
    refAngleDeg: incAngleDeg, // equal for ideal mirror
  };
};

// ---------- LEVELS ----------
// These targets were computed from "solution angles".
// initialAngle is shifted so the level is NOT solved by default.
const LEVELS = [
  // LEVEL 1 – single bounce, target bottom-right
  {
    id: 1,
    name: "Warm-Up Bounce",
    intro: "Rotate the mirror so the light bounces down to hit the target.",
    target: {
      x: 340.35,
      y: 174.72,
      r: 20,
    },
    mirrors: [
      {
        cx: 190,
        cy: 120,
        // solution angle ≈ 10°, but we start at 30° so it's not solved
        initialAngle: 30,
      },
    ],
  },

  // LEVEL 2 – single bounce, target top-right
  {
    id: 2,
    name: "High Shot",
    intro: "Aim the beam upward to reach the high target.",
    target: {
      x: 328.56,
      y: 40.0,
      r: 20,
    },
    mirrors: [
      {
        cx: 190,
        cy: 120,
        // solution angle ≈ -15°, start at 5°
        initialAngle: 5,
      },
    ],
  },

  // LEVEL 3 – double bounce, target near top middle
  {
    id: 3,
    name: "Double Bounce Up",
    intro:
      "Use BOTH mirrors. First bounce, second bounce, then steer the beam up to the target.",
    target: {
      x: 145.86,
      y: 34.26,
      r: 22,
    },
    mirrors: [
      {
        cx: 160,
        cy: 140,
        // solution ≈ 25°, start far at 5° so NOT solved
        initialAngle: 5,
      },
      {
        cx: 240,
        cy: 120,
        // solution ≈ -20°, start at -50°
        initialAngle: -50,
      },
    ],
  },

  // LEVEL 4 – double bounce, target bottom-right
  {
    id: 4,
    name: "Double Bounce Down",
    intro:
      "Bounce from mirror 1 to mirror 2, then send the beam down to the lower target.",
    target: {
      x: 324.51,
      y: 31.04,
      r: 22,
    },
    mirrors: [
      {
        cx: 160,
        cy: 100,
        // solution ≈ 25°, start at 45°
        initialAngle: 45,
      },
      {
        cx: 240,
        cy: 170,
        // solution ≈ -5°, start at 15°
        initialAngle: 15,
      },
    ],
  },
];

const MirrorBounceLab = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [view, setView] = useState("game"); // "game" | "win"
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(LEVELS[0].intro);

  // Angles per mirror (start from initialAngle so levels are unsolved)
  const [angles, setAngles] = useState(
    LEVELS[0].mirrors.map((m) => m.initialAngle)
  );

  const currentLevel = LEVELS[levelIndex];
  const source = { x: 60, y: HEIGHT / 2 };

  // ---------- GEOMETRY / RAY-TRACING ----------
  const geom = useMemo(() => {
    const { mirrors, target } = currentLevel;

    let rayOrigin = { ...source };
    let rayDir = { x: 1, y: 0 }; // start horizontal to the right

    const pathPoints = [source];
    const mirrorData = [];

    let lastIncAngle = null;
    let lastRefAngle = null;
    let lastNormal = null;

    for (let i = 0; i < mirrors.length; i++) {
      const m = mirrors[i];
      const angleDeg = angles[i] ?? m.initialAngle;
      const center = { x: m.cx, y: m.cy };

      const theta = toRad(angleDeg);
      const lineDir = { x: Math.cos(theta), y: Math.sin(theta) };

      // Real intersection with mirror line (depending on ray direction)
      const hitPoint = intersectRayWithLine(rayOrigin, rayDir, center, lineDir);
      if (!hitPoint) {
        // Ray never hits this mirror (for current angles)
        break;
      }

      // Compute reflection on this mirror
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

    // Final segment after last mirror
    const finalOrigin = { ...rayOrigin };
    const finalDir = normalize(rayDir);
    const finalLen = 500;
    const finalEnd = {
      x: finalOrigin.x + finalDir.x * finalLen,
      y: finalOrigin.y + finalDir.y * finalLen,
    };
    pathPoints.push(finalEnd);

    // Check distance from target to this final ray
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
      finalDir,
      lastIncAngle,
      lastRefAngle,
      lastNormal,
      hit,
      closestPoint,
    };
  }, [angles, currentLevel, source]);

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
      const next = levelIndex + 1;
      const nextLevel = LEVELS[next];
      setLevelIndex(next);
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

  const checkAnswer = () => {
    if (hit) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);

      if (!closestPoint) {
        setMessage("Rotate the mirror(s) so the final beam reaches the target.");
      } else if (closestPoint.dist > currentLevel.target.r) {
        if (closestPoint.y < currentLevel.target.y) {
          setMessage(
            "Your beam is passing above the target. Adjust the mirror angles to aim lower."
          );
        } else {
          setMessage(
            "Your beam is passing below the target. Adjust the mirror angles to aim higher."
          );
        }
      } else {
        setMessage("Almost there! Tiny angle changes can make a big difference.");
      }
    }
  };

  const starsEarned = useMemo(() => {
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    return 1;
  }, [attempts]);

  const totalStars = LEVELS.length * 3;

  const handleAngleChange = (index, newAngle) => {
    const clamped = Math.max(-70, Math.min(70, newAngle));
    setAngles((prev) => prev.map((a, i) => (i === index ? clamped : a)));
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

        <div className="hidden sm:flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Sun size={18} className="text-yellow-400" />
          <span className="font-semibold">
            Level {currentLevel.id} / {LEVELS.length}
          </span>
        </div>
      </header>

      {/* MAIN VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: Visual lab */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-sky-300 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md">
                Light bounces every time it hits a mirror. The{" "}
                <span className="font-semibold">angle of incidence</span> equals
                the <span className="font-semibold">angle of reflection</span>{" "}
                at that mirror. Use one or two bounces to reach the target.
              </p>
            </div>

            {/* SVG scene */}
            <div className="bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-md">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-auto rounded-xl bg-slate-900"
              >
                {/* Background grid */}
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
                    fill="rgba(56,189,248,0.25)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <circle
                    cx={currentLevel.target.x}
                    cy={currentLevel.target.y}
                    r={6}
                    fill="#38bdf8"
                  />
                </g>

                {/* Light source */}
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

                {/* Beam path segments */}
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

                {/* Mirrors */}
                {mirrorData.map((m, idx) => {
                  const length = 60;
                  const half = length / 2;
                  const mx1 = m.center.x - m.dir.x * half;
                  const my1 = m.center.y - m.dir.y * half;
                  const mx2 = m.center.x + m.dir.x * half;
                  const my2 = m.center.y + m.dir.y * half;

                  const normalScale = 20;

                  return (
                    <g key={idx}>
                      {/* Mirror line */}
                      <line
                        x1={mx1}
                        y1={my1}
                        x2={mx2}
                        y2={my2}
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      {/* Mirror center */}
                      <circle
                        cx={m.center.x}
                        cy={m.center.y}
                        r={5}
                        fill="#e5e7eb"
                      />
                      {/* Normal indicator */}
                      <line
                        x1={m.center.x}
                        y1={m.center.y}
                        x2={m.center.x + m.normal.x * normalScale}
                        y2={m.center.y + m.normal.y * normalScale}
                        stroke="rgba(248,250,252,0.5)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      {/* Hit point on mirror */}
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

            {/* Angle info */}
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
                  Incidence angle ≈{" "}
                  <span className="font-semibold text-amber-200">
                    {lastIncAngle.toFixed(1)}°
                  </span>{" "}
                  · Reflection angle ≈{" "}
                  <span className="font-semibold text-emerald-200">
                    {lastRefAngle.toFixed(1)}°
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Tutor + controls */}
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
                    Physics idea: Multi-bounce reflection
                  </p>
                  <p>
                    Every time the ray hits a mirror, it bounces with the{" "}
                    <span className="font-bold">same angle</span> to the normal
                    as it arrived. With two mirrors you can steer light around
                    corners like in periscopes and laser mazes.
                  </p>
                </div>

                {/* Mirror sliders */}
                <div className="space-y-3 sm:space-y-4">
                  {currentLevel.mirrors.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-100 rounded-2xl p-3 sm:p-4"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Mirror {idx + 1} angle{" "}
                        <span className="text-slate-500">
                          ({angles[idx].toFixed(0)}°)
                        </span>
                      </p>
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
                          min={-70}
                          max={70}
                          value={angles[idx]}
                          onChange={(e) =>
                            handleAngleChange(
                              idx,
                              parseInt(e.target.value, 10)
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
                        Small angle changes move the beam a lot. Try nudging it
                        and watch how the path bends.
                      </p>
                    </div>
                  ))}
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

                <button
                  onClick={resetLevel}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset Level
                </button>
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
              You used one or more reflections to steer the light exactly onto
              the target. This is how periscopes, laser puzzles, and many
              optical tools work.
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
              Stars this level: {starsEarned} / 3 · Game total: {totalStars}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MirrorBounceLab;
