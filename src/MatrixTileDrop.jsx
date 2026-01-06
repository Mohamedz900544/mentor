import React, { useState, useMemo, useEffect } from "react";
import {
  Grid3x3,
  Star,
  Home,
  Smile,
  ArrowRight,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

const STORAGE_KEY = "matrix_tile_drop_progress_v1";

// ---------- Progress helpers ----------
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

// ---------- Level data ----------
/*
  A, B: number matrices
  op: "add" (A + B) or "sub" (A - B)
*/
const LEVELS = [
  {
    id: 1,
    name: "Starter Tiles",
    op: "add",
    intro:
      "Drag the number tiles into the RESULT boxes so that RESULT = A + B, box by box.",
    A: [
      [1, 2],
      [0, 1],
    ],
    B: [
      [2, 0],
      [1, 3],
    ],
  },
  {
    id: 2,
    name: "Mindful Zeros",
    op: "add",
    intro:
      "Zeros are empty boxes. Add the numbers in A and B in the same position to fill RESULT.",
    A: [
      [3, 0],
      [1, 2],
    ],
    B: [
      [1, 1],
      [0, 4],
    ],
  },
  {
    id: 3,
    name: "Wide Row Add",
    op: "add",
    intro:
      "Now the trays are 2×3. Still do RESULT[i][j] = A[i][j] + B[i][j] for each spot.",
    A: [
      [1, 2, 0],
      [0, 1, 3],
    ],
    B: [
      [2, 0, 1],
      [1, 1, 0],
    ],
  },
  {
    id: 4,
    name: "Take Away Tiles",
    op: "sub",
    intro:
      "Subtraction time! RESULT = A − B. Each box shows how many more are in A than in B.",
    A: [
      [5, 3],
      [4, 2],
    ],
    B: [
      [2, 1],
      [1, 0],
    ],
  },
  {
    id: 5,
    name: "Below Zero",
    op: "sub",
    intro:
      "Some results can be negative. That means B has more in that spot than A.",
    A: [
      [2, 0],
      [1, -1],
    ],
    B: [
      [3, 1],
      [0, 2],
    ],
  },
  {
    id: 6,
    name: "Final Tile Challenge",
    op: "sub",
    intro:
      "Big 2×3 grid. Drag tiles so RESULT[i][j] = A[i][j] − B[i][j] everywhere.",
    A: [
      [4, 1, 2],
      [0, 3, 1],
    ],
    B: [
      [1, 2, 0],
      [2, 1, 1],
    ],
  },
];

// ---------- Helpers ----------
const computeAnswer = (level) => {
  const rows = level.A.length;
  const cols = level.A[0].length;
  const result = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const a = level.A[i][j];
      const b = level.B[i][j];
      row.push(level.op === "add" ? a + b : a - b);
    }
    result.push(row);
  }
  return result;
};

const makeEmptyBoard = (rows, cols) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

const makeEmptyFeedback = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "")
  ); // "", "correct", "wrong", "empty"

// create tiles: one per correct answer cell + some distractors
const createTilesForLevel = (level) => {
  const answer = computeAnswer(level);
  const rows = answer.length;
  const cols = answer[0].length;

  const tiles = [];
  // correct tiles
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      tiles.push({
        id: `ans-${i}-${j}`,
        value: answer[i][j],
        kind: "answer",
      });
    }
  }

  // distractors
  const distractorsCount = rows * cols; // same number as correct tiles
  const allAnswers = answer.flat();

  let counter = 0;
  while (counter < distractorsCount) {
    const base =
      allAnswers[Math.floor(Math.random() * allAnswers.length)];
    const delta = [-2, -1, 1, 2, 3][
      Math.floor(Math.random() * 5)
    ];
    const val = base + delta;
    // allow duplicates, just avoid exact same base too often
    if (!allAnswers.includes(val) || Math.random() < 0.3) {
      tiles.push({
        id: `dist-${counter}`,
        value: val,
        kind: "distractor",
      });
      counter++;
    }
  }

  // shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles;
};

// check if a tile is already placed somewhere on the board
const tileUsedOnBoard = (board, tileId) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === tileId) return true;
    }
  }
  return false;
};

const MatrixTileDrop = () => {
  const [progress, setProgress] = useState(loadProgress);
  const [levelIndex, setLevelIndex] = useState(progress.level || 0);
  const [tiles, setTiles] = useState(() => createTilesForLevel(LEVELS[0]));
  const [board, setBoard] = useState(() =>
    makeEmptyBoard(LEVELS[0].A.length, LEVELS[0].A[0].length)
  );
  const [feedback, setFeedback] = useState(() =>
    makeEmptyFeedback(LEVELS[0].A.length, LEVELS[0].A[0].length)
  );
  const [selectedTileId, setSelectedTileId] = useState(null); // for tap-to-place
  const [attempts, setAttempts] = useState(0);
  const [view, setView] = useState("game"); // "game" | "win"
  const [message, setMessage] = useState(LEVELS[0].intro);
  const [shake, setShake] = useState(false);

  const currentLevel = LEVELS[levelIndex];
  const correctMatrix = useMemo(
    () => computeAnswer(currentLevel),
    [currentLevel]
  );

  const rows = currentLevel.A.length;
  const cols = currentLevel.A[0].length;
  const opSymbol = currentLevel.op === "add" ? "+" : "−";

  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress.stars || {}).reduce(
    (a, b) => a + b,
    0
  );

  // stars for this level
  const starsThisLevel = useMemo(() => {
    if (view !== "win") return 0;
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    return 1;
  }, [view, attempts]);

  // re-init when level changes
  useEffect(() => {
    const lvl = currentLevel;
    const newTiles = createTilesForLevel(lvl);
    setTiles(newTiles);
    setBoard(makeEmptyBoard(lvl.A.length, lvl.A[0].length));
    setFeedback(makeEmptyFeedback(lvl.A.length, lvl.A[0].length));
    setAttempts(0);
    setSelectedTileId(null);
    setView("game");
    setMessage(lvl.intro);
  }, [currentLevel]);

  // save progress on win
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

  const handleDropTile = (row, col, tileId) => {
    if (!tileId) return;

    // allow moving a tile: clear any existing cell that has this tile
    setBoard((prev) => {
      const copy = prev.map((r) => [...r]);

      for (let i = 0; i < copy.length; i++) {
        for (let j = 0; j < copy[i].length; j++) {
          if (copy[i][j] === tileId) {
            copy[i][j] = null;
          }
        }
      }

      copy[row][col] = tileId;
      return copy;
    });

    setSelectedTileId(tileId);
  };

  const clearCell = (row, col) => {
    setBoard((prev) =>
      prev.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? null : cell))
      )
    );
  };

  const checkAnswer = () => {
    let allFilled = true;
    let allCorrect = true;
    const newFeedback = makeEmptyFeedback(rows, cols);

    const tileMap = new Map();
    tiles.forEach((t) => tileMap.set(t.id, t.value));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const tileId = board[i][j];
        if (!tileId) {
          newFeedback[i][j] = "empty";
          allFilled = false;
          allCorrect = false;
        } else {
          const val = tileMap.get(tileId);
          const correctVal = correctMatrix[i][j];
          if (val === correctVal) {
            newFeedback[i][j] = "correct";
          } else {
            newFeedback[i][j] = "wrong";
            allCorrect = false;
          }
        }
      }
    }

    setFeedback(newFeedback);

    if (!allFilled) {
      setMessage("Drop a tile into every RESULT box first.");
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    if (allCorrect) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);
      setMessage(
        "Some boxes are wrong. Red boxes need new tiles. Try swapping those tiles and check again!"
      );
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  };

  const giveHint = () => {
    const tileMap = new Map();
    tiles.forEach((t) => tileMap.set(t.id, t.value));

    // find first wrong or empty cell
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const correctVal = correctMatrix[i][j];
        const tileId = board[i][j];
        const val = tileId ? tileMap.get(tileId) : null;
        const empty = !tileId;
        const wrong = !empty && val !== correctVal;

        if (empty || wrong) {
          // find a tile with correctVal
          const candidate = tiles.find((t) => t.value === correctVal);
          if (!candidate) {
            setMessage("No hint tile found (this shouldn't happen)!");
            return;
          }

          // place that tile
          setBoard((prev) => {
            const copy = prev.map((r) => [...r]);
            // remove candidate from anywhere else
            for (let r = 0; r < copy.length; r++) {
              for (let c = 0; c < copy[r].length; c++) {
                if (copy[r][c] === candidate.id) copy[r][c] = null;
              }
            }
            copy[i][j] = candidate.id;
            return copy;
          });

          setFeedback((prev) =>
            prev.map((r, ri) =>
              r.map((c, cj) =>
                ri === i && cj === j ? "correct" : c
              )
            )
          );

          const a = currentLevel.A[i][j];
          const b = currentLevel.B[i][j];
          setMessage(
            currentLevel.op === "add"
              ? `Hint: here we do ${a} + ${b} = ${correctVal}. Now use the same idea for the other boxes.`
              : `Hint: here we do ${a} − ${b} = ${correctVal}. Subtract B from A in each box.`
          );
          setSelectedTileId(candidate.id);
          return;
        }
      }
    }
    setMessage("All boxes look correct already. Great job!");
  };

  const goNextLevel = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      setLevelIndex(nextIndex);
    } else {
      setLevelIndex(0);
    }
  };

  const availableTiles = tiles.filter(
    (t) => !tileUsedOnBoard(board, t.id)
  );

  // ---------- RENDER ----------
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
              Matrix Tile Drop
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={16} className="text-indigo-400" />
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

      {/* GAME VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: tutor + explanation */}
          <div className="w-full md:w-[380px] bg-white border-b md:border-b-0 md:border-r border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-500 flex items-center justify-center text-indigo-50 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🎲
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-indigo-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-indigo-900">
                  <p className="font-semibold mb-1">
                    What does each tile mean?
                  </p>
                  <p>
                    Every result box follows the same rule: we only mix numbers
                    in the{" "}
                    <span className="font-semibold">
                      same row and same column
                    </span>
                    .
                  </p>
                  <p className="mt-1.5">
                    For each position (i, j):{" "}
                    <span className="font-mono font-semibold">
                      RESULT[i][j] = A[i][j] {opSymbol} B[i][j]
                    </span>
                    .
                  </p>
                  <p className="mt-1">
                    Drag a tile into a box (or tap a tile, then tap a box on
                    mobile).
                  </p>
                </div>

                {/* Little reminder */}
                <div className="bg-slate-900 text-slate-50 rounded-2xl p-3 text-xs sm:text-sm">
                  <p className="font-semibold mb-1">
                    Quick tip for checking:
                  </p>
                  <p>
                    Pick one box and say it out loud: “A has 3, B has 2, so
                    RESULT is 3 {opSymbol} 2”. This helps lock in the idea.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Tiles
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={giveHint}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint (fix one box)
                  </button>
                  <button
                    onClick={() => {
                      const lvl = currentLevel;
                      setBoard(makeEmptyBoard(lvl.A.length, lvl.A[0].length));
                      setFeedback(
                        makeEmptyFeedback(lvl.A.length, lvl.A[0].length)
                      );
                      setAttempts(0);
                      setSelectedTileId(null);
                      setView("game");
                      setMessage(lvl.intro);
                    }}
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

          {/* RIGHT: matrices + tiles */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-indigo-200 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md mx-auto">
                Put tiles into the RESULT grid so that{" "}
                <span className="font-semibold">
                  RESULT = A {opSymbol} B
                </span>{" "}
                in every box.
              </p>
            </div>

            {/* Equation row */}
            <div
              className={`bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-xl overflow-x-auto ${
                shake ? "animate-shake" : ""
              }`}
            >
              <div className="min-w-[260px] flex flex-col gap-3 sm:gap-4 items-center">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <StaticMatrix
                    label="A"
                    matrix={currentLevel.A}
                    color="from-sky-400 to-sky-500"
                  />
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {opSymbol}
                  </span>
                  <StaticMatrix
                    label="B"
                    matrix={currentLevel.B}
                    color="from-emerald-400 to-emerald-500"
                  />
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    =
                  </span>
                  <DroppableMatrix
                    matrix={board}
                    feedback={feedback}
                    tiles={tiles}
                    onDropTile={handleDropTile}
                    onClearCell={clearCell}
                    selectedTileId={selectedTileId}
                    setSelectedTileId={setSelectedTileId}
                  />
                </div>
              </div>
            </div>

            {/* Tiles tray */}
            <div className="mt-4 sm:mt-6 w-full max-w-xl">
              <p className="text-[11px] sm:text-xs text-slate-200 mb-2">
                Drag a tile into a box, or tap a tile then tap a box.
              </p>
              <div className="bg-slate-900/70 rounded-2xl p-3 sm:p-4 border border-slate-700">
                <TileTray
                  tiles={availableTiles}
                  selectedTileId={selectedTileId}
                  setSelectedTileId={setSelectedTileId}
                />
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
              Tiles In The Right Spots!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              Every RESULT box matches{" "}
              <span className="font-semibold">
                A {opSymbol} B
              </span>
              . You just did matrix{" "}
              {currentLevel.op === "add" ? "addition" : "subtraction"} with
              drag-and-drop tiles.
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

      {/* extra CSS for shake animation */}
      <style>{`
        @keyframes shake-tiles {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake-tiles 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// ---------- Subcomponents ----------

const StaticMatrix = ({ label, matrix, color }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">Matrix {label}</span>
      <div
        className={`inline-flex rounded-xl bg-gradient-to-br ${color} px-1.5 py-1 shadow-lg`}
      >
        <div
          className="border-2 border-white/40 rounded-lg px-2 py-1 text-xs sm:text-sm text-white font-mono grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <span key={`${i}-${j}`} className="text-center">
                {val}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DroppableMatrix = ({
  matrix,
  feedback,
  tiles,
  onDropTile,
  onClearCell,
  selectedTileId,
  setSelectedTileId,
}) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const tileMap = new Map();
  tiles.forEach((t) => tileMap.set(t.id, t.value));

  const getCellClass = (fb) => {
    if (fb === "correct")
      return "border-emerald-400 bg-emerald-50 text-emerald-700";
    if (fb === "wrong") return "border-rose-400 bg-rose-50 text-rose-700";
    if (fb === "empty") return "border-slate-300 bg-slate-50 text-slate-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("text/plain");
    if (tileId) {
      onDropTile(row, col, tileId);
    }
  };

  const handleClickCell = (row, col) => {
    if (selectedTileId) {
      onDropTile(row, col, selectedTileId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">RESULT</span>
      <div className="inline-flex rounded-xl bg-slate-900 px-1.5 py-1 shadow-lg">
        <div
          className="border-2 border-slate-600 rounded-lg px-2 py-1 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, i) =>
            row.map((tileId, j) => {
              const fb = feedback[i][j];
              const value = tileId ? tileMap.get(tileId) : "";
              return (
                <div
                  key={`${i}-${j}`}
                  className={`rounded-lg border px-1.5 py-1 min-w-[48px] sm:min-w-[56px] min-h-[44px] sm:min-h-[52px] flex flex-col items-center justify-center text-xs sm:text-sm font-mono relative ${getCellClass(
                    fb
                  )}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, i, j)}
                  onClick={() => handleClickCell(i, j)}
                >
                  <span>{value}</span>
                  {tileId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearCell(i, j);
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 text-[10px] rounded-full bg-slate-800 text-white flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const TileTray = ({ tiles, selectedTileId, setSelectedTileId }) => {
  if (tiles.length === 0) {
    return (
      <p className="text-[11px] sm:text-xs text-slate-300">
        All tiles are placed. You can tap a tile in the grid and remove it
        if you want to try a different one.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tiles.map((t) => {
        const isSelected = selectedTileId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", t.id);
              setSelectedTileId(t.id);
            }}
            onClick={() =>
              setSelectedTileId((prev) => (prev === t.id ? null : t.id))
            }
            className={`px-3 py-2 rounded-2xl border text-sm font-bold flex items-center justify-center gap-1 shadow-sm transition-all ${
              isSelected
                ? "bg-indigo-500 border-indigo-400 text-white"
                : "bg-slate-800 border-slate-600 text-slate-100 hover:border-indigo-400"
            }`}
          >
            <span>{t.value}</span>
            <span className="text-[11px]">
              {t.kind === "answer" ? "✨" : "🎲"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MatrixTileDrop;
