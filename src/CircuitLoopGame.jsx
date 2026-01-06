// CircuitLoopGame.jsx
import React, { useState } from "react";
import {
  Zap,
  BatteryCharging,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Star,
  Home,
} from "lucide-react";

const STORAGE_KEY = "circuit_loop_lab_v1";

// --- Local Storage Helpers ---
const getProgress = () => {
  if (typeof window === "undefined") return { unlockedIndex: 0, scores: {} };
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { unlockedIndex: 0, scores: {} };
};

const saveProgress = (index, stars) => {
  const current = getProgress();
  const newScores = { ...current.scores };
  if (!newScores[index] || stars > newScores[index]) {
    newScores[index] = stars;
  }
  const data = {
    unlockedIndex: Math.max(current.unlockedIndex, index + 1),
    scores: newScores,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
};

// --- Grid / Circuit Definitions ---
// Directions: 0 = up, 1 = right, 2 = down, 3 = left
const DIRS = [
  { dr: -1, dc: 0 }, // up
  { dr: 0, dc: 1 }, // right
  { dr: 1, dc: 0 }, // down
  { dr: 0, dc: -1 }, // left
];
const OPP = [2, 3, 0, 1];

// cell.kind: "empty" | "wire" | "battery" | "bulb"
// shape: "straight" | "corner"
// rotation: 0–3

const LEVELS = [
  // LEVEL 1
  {
    id: 1,
    name: "First Spark",
    rows: 3,
    cols: 4,
    intro:
      "Rotate the wires so the electricity can go from the battery to the bulb!",
    grid: [
      // row 0
      {
        kind: "battery",
        shape: "straight",
        rotation: 1, // left–right
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 1,
      },
      {
        kind: "empty",
      },

      // row 1
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 2,
      },
      {
        kind: "bulb",
        shape: "straight",
        rotation: 3,
      },

      // row 2
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
    ],
  },

  // LEVEL 2 – Bendy Path (starts scrambled)
  {
    id: 2,
    name: "Bendy Path",
    rows: 3,
    cols: 4,
    intro: "Make a bendy path from the battery to the bulb!",
    grid: [
      // row 0
      {
        kind: "battery",
        shape: "straight",
        rotation: 1, // target: 1 (left–right)
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 0, // scrambled, solution uses 1 (horizontal)
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 0, // scrambled, solution uses 2 (down+left)
      },
      {
        kind: "empty",
      },

      // row 1
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 2, // scrambled, solution uses 0 (up+right)
      },
      {
        kind: "bulb",
        shape: "straight",
        rotation: 3, // left–right
      },

      // row 2
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
    ],
  },

  // LEVEL 3 – Big U-Turn
  {
    id: 3,
    name: "Big U-Turn",
    rows: 3,
    cols: 4,
    intro: "Can you loop all the way around and reach the bulb?",
    grid: [
      // row 0
      {
        kind: "battery",
        shape: "straight",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1,
      },

      // row 1
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 2,
      },
      {
        kind: "bulb",
        shape: "straight",
        rotation: 3,
      },

      // row 2
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 3,
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1,
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 2,
      },
    ],
  },

  // LEVEL 4 – Border Run (starts scrambled)
  {
    id: 4,
    name: "Border Run",
    rows: 4,
    cols: 4,
    intro: "Run the circuit all around the edge to reach the bulb!",
    grid: [
      // row 0
      {
        kind: "battery",
        shape: "straight",
        rotation: 1, // target: 1 (horizontal)
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 0, // scrambled, solution uses horizontal (1)
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 0, // scrambled, solution uses horizontal (1)
      },
      {
        kind: "wire",
        shape: "corner",
        rotation: 0, // scrambled, solution uses 2 (down+left)
      },

      // row 1
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1, // scrambled, solution uses vertical (0)
      },

      // row 2
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 1, // scrambled, solution uses vertical (0)
      },

      // row 3
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "bulb",
        shape: "straight",
        rotation: 0, // vertical, connects from above
      },
    ],
  },

  // LEVEL 5 – Zigzag Tower (starts scrambled)
  {
    id: 5,
    name: "Zigzag Tower",
    rows: 4,
    cols: 4,
    intro: "Build a tall zigzag from the battery to the bulb!",
    grid: [
      // row 0
      {
        kind: "wire",
        shape: "corner",
        rotation: 3, // scrambled, solution uses 1 (down+right)
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 0, // scrambled, solution uses 1 (horizontal)
      },
      {
        kind: "wire",
        shape: "straight",
        rotation: 0, // scrambled, solution uses 1 (horizontal)
      },
      {
        kind: "bulb",
        shape: "straight",
        rotation: 3, // horizontal, connects from left
      },

      // row 1
      {
        kind: "wire",
        shape: "straight",
        rotation: 1, // scrambled, solution uses vertical (0)
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },

      // row 2
      {
        kind: "wire",
        shape: "straight",
        rotation: 1, // scrambled, solution uses vertical (0)
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },

      // row 3
      {
        kind: "battery",
        shape: "straight",
        rotation: 0, // vertical
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
      {
        kind: "empty",
      },
    ],
  },
];

// Compute connection directions for a cell
const getConnections = (cell) => {
  if (!cell || (!cell.shape && cell.kind === "empty")) return [];

  const { shape, rotation = 0 } = cell;

  // If battery/bulb somehow used without shape, treat as straight L–R
  if (!shape && (cell.kind === "battery" || cell.kind === "bulb")) {
    return [1, 3]; // right, left
  }

  if (shape === "straight") {
    // even rotation: up–down, odd rotation: left–right
    return rotation % 2 === 0 ? [0, 2] : [1, 3];
  }

  if (shape === "corner") {
    // rotation 0: up + right
    // rotation 1: right + down
    // rotation 2: down + left
    // rotation 3: left + up
    if (rotation === 0) return [0, 1];
    if (rotation === 1) return [1, 2];
    if (rotation === 2) return [2, 3];
    if (rotation === 3) return [3, 0];
  }

  return [];
};

const CircuitLoopGame = () => {
  const [view, setView] = useState("menu"); // menu | game | win
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  const [gridState, setGridState] = useState(
    LEVELS[0].grid.map((c) => ({ ...c }))
  );
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState(LEVELS[0].intro);
  const [isPowered, setIsPowered] = useState(false);

  const currentLevel = LEVELS[currentLevelIdx];

  const loadLevel = (index) => {
    const lvl = LEVELS[index];
    setCurrentLevelIdx(index);
    setGridState(lvl.grid.map((cell) => ({ ...cell })));
    setMistakes(0);
    setMessage(lvl.intro);
    setIsPowered(false);
    setView("game");
  };

  const resetLevel = () => {
    const lvl = LEVELS[currentLevelIdx];
    setGridState(lvl.grid.map((cell) => ({ ...cell })));
    setMistakes(0);
    setMessage(lvl.intro);
    setIsPowered(false);
  };

  const rotateWire = (index) => {
    setGridState((prev) =>
      prev.map((cell, i) => {
        if (i !== index) return cell;
        if (cell.kind !== "wire") return cell;
        const newRotation =
          typeof cell.rotation === "number" ? (cell.rotation + 1) % 4 : 0;
        return { ...cell, rotation: newRotation };
      })
    );
  };

  const findIndexOfKind = (kind) =>
    gridState.findIndex((c) => c.kind === kind);

  const checkCircuit = () => {
    const rows = currentLevel.rows;
    const cols = currentLevel.cols;

    const startIdx = findIndexOfKind("battery");
    const endIdx = findIndexOfKind("bulb");
    if (startIdx === -1 || endIdx === -1) return;

    const visited = new Set();
    const queue = [startIdx];

    const neighborsOf = (idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const cell = gridState[idx];
      const cons = getConnections(cell);
      const result = [];

      cons.forEach((dir) => {
        const nr = r + DIRS[dir].dr;
        const nc = c + DIRS[dir].dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

        const nIdx = nr * cols + nc;
        const nCell = gridState[nIdx];
        if (!nCell || nCell.kind === "empty") return;

        const nCons = getConnections(nCell);
        if (nCons.includes(OPP[dir])) {
          result.push(nIdx);
        }
      });

      return result;
    };

    while (queue.length) {
      const idx = queue.shift();
      if (idx == null || visited.has(idx)) continue;
      visited.add(idx);

      if (idx === endIdx) {
        // ✅ Found a complete circuit:
        // light the bulb for 2 seconds on the game screen,
        // then show the win screen.
        setIsPowered(true);
        setMessage("The bulb is glowing! You made a complete circuit.");
        setTimeout(() => {
          handleWin();
        }, 2000);
        return;
      }

      const neigh = neighborsOf(idx) || [];
      neigh.forEach((n) => {
        if (!visited.has(n)) queue.push(n);
      });
    }

    // No valid path
    setIsPowered(false);
    setMistakes((m) => m + 1);
    setMessage(
      "The circuit is broken somewhere. Every wire end must connect to another wire, the battery, or the bulb."
    );
  };

  const handleWin = () => {
    let stars = 3;
    if (mistakes === 1) stars = 2;
    if (mistakes > 1) stars = 1;

    const newProgress = saveProgress(currentLevelIdx, stars);
    setProgress(newProgress);
    setView("win");
  };

  const goNext = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      loadLevel(currentLevelIdx + 1);
    } else {
      setView("menu");
    }
  };

  // --- Renderers ---
  const renderMenu = () => (
    <div className="flex-1 bg-gradient-to-b from-sky-50 to-slate-50 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 text-white p-2 rounded-xl shadow">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Circuit Loop Lab
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Rotate the wires to make a complete circuit and light the bulb.
              </p>
            </div>
          </div>

          <div className="bg-white px-3 py-1 rounded-full shadow-sm border text-xs sm:text-sm font-bold text-amber-500 flex items-center gap-1">
            <Star size={14} fill="currentColor" />
            {Object.values(progress.scores).reduce((a, b) => a + b, 0)} /{" "}
            {LEVELS.length * 3}
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {LEVELS.map((lvl, idx) => {
            const isUnlocked = idx <= progress.unlockedIndex;
            const stars = progress.scores[idx] || 0;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => loadLevel(idx)}
                className={`relative w-full p-3 sm:p-4 rounded-2xl border-b-4 transition-all flex items-center gap-3 sm:gap-4 text-left group
                  ${
                    isUnlocked
                      ? "bg-white border-amber-200 hover:border-amber-500 hover:-translate-y-1 shadow-sm"
                      : "bg-slate-100 border-transparent opacity-60 cursor-not-allowed"
                  }
                `}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-inner bg-amber-400">
                  {lvl.id}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {lvl.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    {lvl.rows}×{lvl.cols} circuit
                  </p>
                </div>

                {isUnlocked && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }
                      />
                    ))}
                  </div>
                )}

                {isUnlocked && (
                  <div className="text-amber-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCellWireGraphic = (cell) => {
    if (cell.kind === "battery") {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <BatteryCharging className="text-amber-500" size={20} />
          <span className="text-[10px] font-bold text-slate-100">BAT</span>
        </div>
      );
    }
    if (cell.kind === "bulb") {
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <Lightbulb
            className={isPowered ? "text-yellow-300" : "text-slate-400"}
            size={20}
          />
          <span className="text-[10px] font-bold text-slate-700">BULB</span>
        </div>
      );
    }
    if (cell.kind === "empty") {
      return null;
    }
    const baseClasses =
      "absolute inset-0 flex items-center justify-center pointer-events-none";
    const segmentCommon =
      "absolute bg-amber-400 rounded-full shadow-sm transition-all";

    const cons = getConnections(cell);
    return (
      <div className={baseClasses}>
        {cons.includes(0) && (
          <div
            className={segmentCommon}
            style={{ width: "22%", height: "55%", top: "0%" }}
          />
        )}
        {cons.includes(2) && (
          <div
            className={segmentCommon}
            style={{ width: "22%", height: "55%", bottom: "0%" }}
          />
        )}
        {cons.includes(1) && (
          <div
            className={segmentCommon}
            style={{ height: "22%", width: "55%", right: "0%" }}
          />
        )}
        {cons.includes(3) && (
          <div
            className={segmentCommon}
            style={{ height: "22%", width: "55%", left: "0%" }}
          />
        )}
      </div>
    );
  };

  const renderGrid = () => {
    const cols = currentLevel.cols;

    return (
      <div
        className="grid gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {gridState.map((cell, idx) => {
          const clickable = cell.kind === "wire";
          return (
            <button
              key={idx}
              type="button"
              onClick={() => clickable && rotateWire(idx)}
              className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center transition-all
                ${
                  cell.kind === "battery"
                    ? "bg-slate-900 border-slate-900"
                    : cell.kind === "bulb"
                    ? isPowered
                      ? "bg-yellow-50 border-yellow-300 shadow-glow"
                      : "bg-slate-900/60 border-yellow-200/60"
                    : cell.kind === "wire"
                    ? "bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-950"
                    : "bg-slate-900/40 border-slate-800/60"
                }
              `}
            >
              {renderCellWireGraphic(cell)}
            </button>
          );
        })}
      </div>
    );
  };

  // --- MAIN ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <button
          className="flex items-center gap-2"
          onClick={() => setView("menu")}
        >
          <div className="bg-amber-400 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight hidden sm:block">
            CIRCUIT LOOP LAB
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Zap size={16} className={isPowered ? "text-amber-400" : ""} />
          <span className="font-semibold">
            {isPowered ? "Circuit Complete" : "Circuit Open"}
          </span>
        </div>
      </header>

      {/* ROUTER */}
      {view === "menu" && renderMenu()}

      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: Circuit Grid */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-sm">
                Electricity is like a tiny race. It can only run if there is a
                complete path with no breaks.
              </p>
            </div>

            {renderGrid()}

            <p className="mt-4 text-xs sm:text-sm text-slate-300 text-center max-w-xs">
              Tap the dark tiles to rotate the wires until the battery and bulb
              are linked by one continuous path.
            </p>
          </div>

          {/* RIGHT: Tutor + Controls */}
          <div className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-300 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    ⚡
                  </div>
                <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-amber-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-amber-900">
                  <p className="font-semibold mb-1">
                    Physics idea: Electric Circuit
                  </p>
                  <p>
                    For the bulb to shine, electricity must travel in a{" "}
                    <span className="font-bold">complete circuit</span> from the
                    battery, through the wires, the bulb, and back again.
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={checkCircuit}
                  className="w-full bg-amber-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Circuit
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={resetLevel}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset Wires
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-amber-100">
            <div className="inline-flex bg-amber-100 p-3 sm:p-4 rounded-full mb-4 text-amber-500">
              <Lightbulb size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              The Bulb is ON!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              You made a working circuit. This is how real lights and toys work
              in your electronics kits.
            </p>

            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => {
                let earned = 3;
                if (mistakes === 1) earned = 2;
                if (mistakes > 1) earned = 1;
                return (
                  <Star
                    key={s}
                    size={30}
                    className={
                      s <= earned
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                    }
                  />
                );
              })}
            </div>

            <button
              onClick={goNext}
              className="w-full bg-amber-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-amber-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Circuit
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setView("menu")}
              className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
            >
              Back to Lab Map
            </button>
          </div>
        </div>
      )}

      {/* Extra small CSS for bulb glow */}
      <style>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(250, 204, 21, 0.8);
        }
      `}</style>
    </div>
  );
};

export default CircuitLoopGame;
