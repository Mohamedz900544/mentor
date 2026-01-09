import React, { useState, useMemo, useEffect } from "react";
import {
  Grid3x3,
  Star,
  Home,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

const STORAGE_KEY = "matrix_portal_progress_v1";

// ---- Progress helpers ----
const loadProgress = () => {
  if (typeof window === "undefined") return { level: 0, stars: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { level: 0, stars: {} };
  } catch {
    return { level: 0, stars: {} };
  }
};

const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

// ---- Math helpers ----
const multiplyMatrixVector = (M, v) => {
  const [[a, b], [c, d]] = M;
  const { x, y } = v;
  return { x: a * x + b * y, y: c * x + d * y };
};

const equalVec = (v1, v2) => v1.x === v2.x && v1.y === v2.y;

// Map math coordinates to SVG screen coords (origin at center)
const PLANE_SIZE = 260;
const UNIT = 30;
const origin = { x: PLANE_SIZE / 2, y: PLANE_SIZE / 2 };
const toScreen = ({ x, y }) => ({
  x: origin.x + x * UNIT,
  y: origin.y - y * UNIT, // y grows upward in math, downward in SVG
});

// ---- LEVEL DATA ----
// Each level: starting vector, target, candidate matrices, correct index
const LEVELS = [
  {
    id: 1,
    name: "Double Booster",
    intro:
      "This matrix scales both x and y. Pick the machine that doubles the robot's distance from the origin.",
    start: { x: 1, y: 1 },
    target: { x: 2, y: 2 },
    matrices: [
      {
        label: "A",
        M: [
          [2, 0],
          [0, 2],
        ],
        note: "Doubles both x and y.",
      },
      {
        label: "B",
        M: [
          [1, 0],
          [0, 1],
        ],
        note: "Does nothing (identity).",
      },
      {
        label: "C",
        M: [
          [0, 1],
          [1, 0],
        ],
        note: "Swaps x and y.",
      },
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    name: "Floor Flip",
    intro:
      "One matrix flips the robot over the x-axis (floor). Choose the one that turns (1, 2) into (1, −2).",
    start: { x: 1, y: 2 },
    target: { x: 1, y: -2 },
    matrices: [
      {
        label: "A",
        M: [
          [1, 0],
          [0, -1],
        ],
        note: "Keep x, flip y.",
      },
      {
        label: "B",
        M: [
          [-1, 0],
          [0, 1],
        ],
        note: "Flip left/right.",
      },
      {
        label: "C",
        M: [
          [1, 0],
          [0, 1],
        ],
        note: "Identity matrix.",
      },
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    name: "Coordinate Swap",
    intro:
      "Now we use a matrix that swaps x and y, like turning (2, 1) into (1, 2).",
    start: { x: 2, y: 1 },
    target: { x: 1, y: 2 },
    matrices: [
      {
        label: "A",
        M: [
          [0, 1],
          [1, 0],
        ],
        note: "Swap x and y.",
      },
      {
        label: "B",
        M: [
          [1, 0],
          [0, -1],
        ],
        note: "Flip over x-axis.",
      },
      {
        label: "C",
        M: [
          [2, 0],
          [0, 1],
        ],
        note: "Stretch horizontally.",
      },
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    name: "Shear Slide",
    intro:
      "A shear slides points sideways depending on y. We want (1, 1) to go to (3, 1).",
    start: { x: 1, y: 1 },
    target: { x: 3, y: 1 },
    matrices: [
      {
        label: "A",
        M: [
          [1, 0],
          [1, 1],
        ],
        note: "Slide y into x? No, slide x into y.",
      },
      {
        label: "B",
        M: [
          [2, 0],
          [0, 1],
        ],
        note: "Just stretch x.",
      },
      {
        label: "C",
        M: [
          [1, 2],
          [0, 1],
        ],
        note: "x ← x + 2y.",
      },
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    name: "Quarter Turn",
    intro:
      "One matrix rotates the robot 90° counter-clockwise, like turning (1, 0) into (0, 1).",
    start: { x: 1, y: 0 },
    target: { x: 0, y: 1 },
    matrices: [
      {
        label: "A",
        M: [
          [0, -1],
          [1, 0],
        ],
        note: "Rotate 90° counter-clockwise.",
      },
      {
        label: "B",
        M: [
          [0, 1],
          [-1, 0],
        ],
        note: "Rotate 90° clockwise.",
      },
      {
        label: "C",
        M: [
          [-1, 0],
          [0, -1],
        ],
        note: "Rotate 180°.",
      },
    ],
    correctIndex: 0,
  },
];

const MatrixPortalQuest = () => {
  const [progress, setProgress] = useState(loadProgress);
  const [levelIndex, setLevelIndex] = useState(progress.level || 0);
  const [selectedMatrix, setSelectedMatrix] = useState(null);
  const [resultVec, setResultVec] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [view, setView] = useState("game"); // "game" | "win"
  const [message, setMessage] = useState(LEVELS[0].intro);

  const currentLevel = LEVELS[levelIndex];
  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress.stars || {}).reduce(
    (a, b) => a + b,
    0
  );

  // Compute current correct/incorrect
  const isCorrect = useMemo(() => {
    if (!resultVec) return false;
    return equalVec(resultVec, currentLevel.target);
  }, [resultVec, currentLevel.target]);

  const starsThisLevel = useMemo(() => {
    if (!isCorrect && view !== "win") return 0;
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    return 1;
  }, [attempts, isCorrect, view]);

  // Save progress when level is cleared
  useEffect(() => {
    if (view !== "win") return;
    setProgress((prev) => {
      const stars = { ...(prev.stars || {}) };
      const existing = stars[currentLevel.id] || 0;
      stars[currentLevel.id] = Math.max(existing, starsThisLevel);
      const next = {
        level: Math.max(prev.level || 0, levelIndex),
        stars,
      };
      saveProgress(next);
      return next;
    });
  }, [view, currentLevel.id, levelIndex, starsThisLevel]);

  const resetLevel = () => {
    setSelectedMatrix(null);
    setResultVec(null);
    setAttempts(0);
    setView("game");
    setMessage(currentLevel.intro);
  };

  const applyMatrix = () => {
    if (selectedMatrix === null) {
      setMessage("Pick a portal matrix first, then tap RUN PORTAL.");
      return;
    }
    const chosen = currentLevel.matrices[selectedMatrix];
    const newVec = multiplyMatrixVector(chosen.M, currentLevel.start);
    setResultVec(newVec);

    if (equalVec(newVec, currentLevel.target)) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);
      setMessage(
        `That matrix moved the robot to (${newVec.x}, ${newVec.y}). Compare it with the glowing target and try another one.`
      );
    }
  };

  const goNextLevel = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      setLevelIndex(nextIndex);
      setSelectedMatrix(null);
      setResultVec(null);
      setAttempts(0);
      setView("game");
      setMessage(LEVELS[nextIndex].intro);
    } else {
      // back to first level
      setLevelIndex(0);
      setSelectedMatrix(null);
      setResultVec(null);
      setAttempts(0);
      setView("game");
      setMessage(LEVELS[0].intro);
    }
  };

  // Build arrows for SVG
  const startScreen = toScreen(currentLevel.start);
  const targetScreen = toScreen(currentLevel.target);
  const resultScreen = resultVec ? toScreen(resultVec) : null;

  const renderArrow = (from, to, color) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy) || 1;
    const head = 10;

    const tipX = from.x + dx;
    const tipY = from.y + dy;
    const backX = tipX - head * Math.cos(angle);
    const backY = tipY - head * Math.sin(angle);

    const leftX =
      backX + (head / 2) * Math.cos(angle + Math.PI / 2);
    const leftY =
      backY + (head / 2) * Math.sin(angle + Math.PI / 2);
    const rightX =
      backX + (head / 2) * Math.cos(angle - Math.PI / 2);
    const rightY =
      backY + (head / 2) * Math.sin(angle - Math.PI / 2);

    return (
      <g>
        <line
          x1={from.x}
          y1={from.y}
          x2={tipX}
          y2={tipY}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon
          points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Lab
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1">
              <Grid3x3 size={18} className="text-indigo-500" />
              Matrix Portal Quest
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="font-semibold">
              Level {currentLevel.id} / {LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white flex items-center gap-1 text-[11px] sm:text-xs">
            <Star className="text-amber-400 fill-amber-400" size={14} />
            <span className="font-semibold">
              {totalStars} / {totalMaxStars} stars
            </span>
          </div>
        </div>
      </header>

      {/* MAIN VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: board */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md">
                A{" "}
                <span className="font-semibold">
                  2×2 matrix is a little machine
                </span>{" "}
                that takes in a coordinate (x, y) and spits out a new one.
                Choose the matrix that sends the robot from the blue point to
                the glowing target.
              </p>
            </div>

            {/* PLANE */}
            <div className="bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-md">
              <svg
                viewBox={`0 0 ${PLANE_SIZE} ${PLANE_SIZE}`}
                className="w-full h-auto rounded-xl bg-slate-900"
              >
                {/* grid */}
                <defs>
                  <pattern
                    id="grid-pattern"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(148,163,184,0.2)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect
                  width={PLANE_SIZE}
                  height={PLANE_SIZE}
                  fill="url(#grid-pattern)"
                />

                {/* axes */}
                <line
                  x1={0}
                  y1={origin.y}
                  x2={PLANE_SIZE}
                  y2={origin.y}
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth="1.5"
                />
                <line
                  x1={origin.x}
                  y1={0}
                  x2={origin.x}
                  y2={PLANE_SIZE}
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth="1.5"
                />

                {/* origin */}
                <circle
                  cx={origin.x}
                  cy={origin.y}
                  r={4}
                  fill="#e5e7eb"
                />

                {/* target */}
                <g>
                  <circle
                    cx={targetScreen.x}
                    cy={targetScreen.y}
                    r={14}
                    fill="rgba(34,197,94,0.3)"
                    stroke="#22c55e"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <circle
                    cx={targetScreen.x}
                    cy={targetScreen.y}
                    r={4}
                    fill="#22c55e"
                  />
                </g>

                {/* start point */}
                <g>
                  <circle
                    cx={startScreen.x}
                    cy={startScreen.y}
                    r={8}
                    fill="#38bdf8"
                  />
                </g>

                {/* start arrow (from origin to start) */}
                {renderArrow(origin, startScreen, "#38bdf8")}

                {/* result arrow */}
                {resultScreen &&
                  renderArrow(origin, resultScreen, isCorrect ? "#22c55e" : "#f97316")}

                {/* result point */}
                {resultScreen && (
                  <circle
                    cx={resultScreen.x}
                    cy={resultScreen.y}
                    r={6}
                    fill={isCorrect ? "#22c55e" : "#f97316"}
                  />
                )}
              </svg>
            </div>

            <div className="mt-3 text-[11px] sm:text-xs text-slate-300 text-center max-w-xs space-y-1">
              <p>
                Start coordinate:{" "}
                <span className="font-semibold text-sky-200">
                  ({currentLevel.start.x}, {currentLevel.start.y})
                </span>{" "}
                · Target:{" "}
                <span className="font-semibold text-emerald-200">
                  ({currentLevel.target.x}, {currentLevel.target.y})
                </span>
              </p>
              {resultVec && (
                <p>
                  Current result:{" "}
                  <span
                    className={
                      isCorrect
                        ? "font-semibold text-emerald-300"
                        : "font-semibold text-orange-300"
                    }
                  >
                    ({resultVec.x}, {resultVec.y})
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: control panel */}
          <div className="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-600 flex items-center justify-center text-indigo-100 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    M
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Quick concept card */}
                <div className="bg-indigo-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-indigo-900">
                  <p className="font-semibold mb-1">
                    Matrix = transformation machine
                  </p>
                  <p>
                    If{" "}
                    <span className="font-mono font-semibold">
                      M = [[a, b], [c, d]]
                    </span>{" "}
                    and{" "}
                    <span className="font-mono font-semibold">
                      v = (x, y)
                    </span>
                    , then the output is{" "}
                    <span className="font-mono font-semibold">
                      M·v = (a·x + b·y, c·x + d·y)
                    </span>
                    . Each level is a puzzle: which machine sends the starting
                    vector onto the glowing target?
                  </p>
                </div>

                {/* Matrix choices */}
                <div className="space-y-3 sm:space-y-4">
                  {currentLevel.matrices.map((choice, idx) => {
                    const isSelected = selectedMatrix === idx;
                    const [row1, row2] = choice.M;
                    return (
                      <button
                        key={choice.label}
                        type="button"
                        onClick={() => {
                          setSelectedMatrix(idx);
                          setMessage(
                            `Matrix ${choice.label} selected. Press RUN PORTAL to see where it sends (${currentLevel.start.x}, ${currentLevel.start.y}).`
                          );
                        }}
                        className={`w-full text-left rounded-2xl border px-3 sm:px-4 py-3 sm:py-4 transition-all flex gap-3 sm:gap-4 items-center ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-semibold text-slate-500">
                            Matrix
                          </span>
                          <span className="text-lg font-black">
                            {choice.label}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="inline-grid grid-cols-2 gap-1 rounded-lg bg-slate-900 text-white text-xs font-mono px-2 py-1">
                            <span>{row1[0]}</span>
                            <span>{row1[1]}</span>
                            <span>{row2[0]}</span>
                            <span>{row2[1]}</span>
                          </div>
                          <p className="mt-1.5 text-[11px] sm:text-xs text-slate-600">
                            {choice.note}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-3 sm:space-y-4">
                <button
                  onClick={applyMatrix}
                  className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  RUN PORTAL
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // hint: highlight correct matrix in text
                      const correct = currentLevel.matrices[
                        currentLevel.correctIndex
                      ];
                      setMessage(
                        `Hint: one matrix description secretly tells you the rule you need. Look for: "${correct.note}".`
                      );
                    }}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint
                  </button>
                  <button
                    onClick={resetLevel}
                    className="flex-1 bg-slate-900 text-white py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-indigo-100">
            <div className="inline-flex bg-indigo-100 p-3 sm:p-4 rounded-full mb-4 text-indigo-500">
              <Grid3x3 size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Portal Perfect!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              Your chosen matrix sent the robot exactly from{" "}
              <span className="font-mono">
                ({currentLevel.start.x}, {currentLevel.start.y})
              </span>{" "}
              to{" "}
              <span className="font-mono">
                ({currentLevel.target.x}, {currentLevel.target.y})
              </span>
              . That’s matrix–vector multiplication in action.
            </p>

            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={30}
                  className={
                    s <= starsThisLevel
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>

            <button
              onClick={goNextLevel}
              className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-indigo-700 transition-colors flex justify-center gap-2 items-center"
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
              Stars this level: {starsThisLevel} / 3 · Total: {totalStars} /{" "}
              {totalMaxStars}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixPortalQuest;
