import React, { useState, useMemo, useEffect } from "react";
import {
  Grid3x3,
  Star,
  Home,
  Smile,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "matrix_candy_mixer_progress_v1";

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
  Each level:
  - op: "add" | "sub"
  - A, B: matrices (2D arrays)
*/
const LEVELS = [
  {
    id: 1,
    name: "Tiny Candy Sum",
    op: "add",
    intro:
      "Each number is candies in a box. Add the candies from tray A and tray B to fill the result grid.",
    A: [
      [1, 2],
      [0, 3],
    ],
    B: [
      [2, 1],
      [4, 0],
    ],
  },
  {
    id: 2,
    name: "Zero Boxes",
    op: "add",
    intro:
      "Zero means an empty box. Add box by box: result = A + B (top-left with top-left, and so on).",
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
    name: "Take Some Away",
    op: "sub",
    intro:
      "Now we are TAKING candies away: result = A − B. Subtract the matching boxes.",
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
    id: 4,
    name: "Going Negative",
    op: "sub",
    intro:
      "Sometimes we owe candies! If A has less than B in a box, the result can be negative.",
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
    id: 5,
    name: "Wide Candy Trays",
    op: "add",
    intro:
      "Bigger trays! Add A and B cell by cell. Same position, same friends, then write the total.",
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
    id: 6,
    name: "Mixed Candy Change",
    op: "sub",
    intro:
      "Last challenge: subtract B from A in a 2×3 grid. Some boxes will give negative answers.",
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
const makeEmptyMatrix = (rows, cols) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

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

const MatrixCandyMixer = () => {
  const [progress, setProgress] = useState(loadProgress);
  const [levelIndex, setLevelIndex] = useState(progress.level || 0);
  const [userMatrix, setUserMatrix] = useState(() => {
    const lvl = LEVELS[0];
    return makeEmptyMatrix(lvl.A.length, lvl.A[0].length);
  });
  const [feedback, setFeedback] = useState(() => {
    const lvl = LEVELS[0];
    return makeEmptyMatrix(lvl.A.length, lvl.A[0].length);
  }); // "", "correct", "wrong", "empty"
  const [focusedCell, setFocusedCell] = useState(null); // {row,col}
  const [attempts, setAttempts] = useState(0);
  const [view, setView] = useState("game"); // "game" | "win"
  const [message, setMessage] = useState(LEVELS[0].intro);
  const [shake, setShake] = useState(false);

  const currentLevel = LEVELS[levelIndex];
  const correctMatrix = useMemo(
    () => computeAnswer(currentLevel),
    [currentLevel]
  );

  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress.stars || {}).reduce(
    (a, b) => a + b,
    0
  );

  const rows = currentLevel.A.length;
  const cols = currentLevel.A[0].length;
  const opSymbol = currentLevel.op === "add" ? "+" : "−";

  // stars for this level
  const starsThisLevel = useMemo(() => {
    if (view !== "win") return 0;
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    return 1;
  }, [view, attempts]);

  // save progress when win
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
    const lvl = currentLevel;
    setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setAttempts(0);
    setFocusedCell(null);
    setView("game");
    setMessage(lvl.intro);
  };

  const goNextLevel = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      const lvl = LEVELS[nextIndex];
      setLevelIndex(nextIndex);
      setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
      setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
      setAttempts(0);
      setFocusedCell(null);
      setView("game");
      setMessage(lvl.intro);
    } else {
      // back to first
      const lvl = LEVELS[0];
      setLevelIndex(0);
      setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
      setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
      setAttempts(0);
      setFocusedCell(null);
      setView("game");
      setMessage(lvl.intro);
    }
  };

  const handleCellChange = (row, col, value) => {
    // allow empty or integer
    if (value === "" || value === "-" || /^-?\d+$/.test(value)) {
      setUserMatrix((prev) =>
        prev.map((r, i) =>
          r.map((cell, j) => (i === row && j === col ? value : cell))
        )
      );
    }
  };

  const nudgeCell = (row, col, delta) => {
    setUserMatrix((prev) =>
      prev.map((r, i) =>
        r.map((cell, j) => {
          if (i !== row || j !== col) return cell;
          const num = parseInt(cell || "0", 10);
          return String(num + delta);
        })
      )
    );
  };

  const checkAnswer = () => {
    let allFilled = true;
    let allCorrect = true;
    const newFeedback = [];

    for (let i = 0; i < rows; i++) {
      const fbRow = [];
      for (let j = 0; j < cols; j++) {
        const valStr = userMatrix[i][j];
        if (valStr === "" || valStr === "-") {
          fbRow.push("empty");
          allFilled = false;
          allCorrect = false;
        } else {
          const userVal = parseInt(valStr, 10);
          const correctVal = correctMatrix[i][j];
          if (userVal === correctVal) {
            fbRow.push("correct");
          } else {
            fbRow.push("wrong");
            allCorrect = false;
          }
        }
      }
      newFeedback.push(fbRow);
    }

    setFeedback(newFeedback);

    if (!allFilled) {
      setMessage(
        "Fill every candy box first. Empty boxes are marked with a light outline."
      );
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (allCorrect) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);
      setMessage(
        "Some boxes are wrong. Red boxes need fixing. Try changing those numbers and check again!"
      );
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const giveHint = () => {
    // fill first wrong or empty cell
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const correctVal = correctMatrix[i][j];
        const userStr = userMatrix[i][j];
        const isEmpty = userStr === "" || userStr === "-";
        const isWrong =
          !isEmpty && parseInt(userStr, 10) !== correctVal;

        if (isEmpty || isWrong) {
          setUserMatrix((prev) =>
            prev.map((r, ri) =>
              r.map((c, cj) =>
                ri === i && cj === j ? String(correctVal) : c
              )
            )
          );
          setFeedback((prev) =>
            prev.map((r, ri) =>
              r.map((c, cj) =>
                ri === i && cj === j ? "correct" : c
              )
            )
          );
          setFocusedCell({ row: i, col: j });
          setMessage(
            `Hint: for this box we did ${currentLevel.A[i][j]} ${opSymbol} ${currentLevel.B[i][j]} = ${correctVal}. Try to do the same pattern in the other boxes.`
          );
          return;
        }
      }
    }
    setMessage("All boxes are already correct. Great job!");
  };

  const focusedInfo = useMemo(() => {
    if (!focusedCell) return null;
    const { row, col } = focusedCell;
    const a = currentLevel.A[row][col];
    const b = currentLevel.B[row][col];
    const result = correctMatrix[row][col];
    return { row, col, a, b, result };
  }, [focusedCell, currentLevel, correctMatrix]);

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Lab
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1">
              <Grid3x3 size={18} className="text-pink-500" />
              Matrix Candy Mixer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={16} className="text-pink-400" />
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
          {/* LEFT: tutor + explanation */}
          <div className="w-full md:w-[380px] bg-white border-b md:border-b-0 md:border-r border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-pink-500 flex items-center justify-center text-pink-50 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🍬
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-pink-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-pink-900">
                  <p className="font-semibold mb-1">
                    How do we add or subtract matrices?
                  </p>
                  <p>
                    We only mix boxes that are in the{" "}
                    <span className="font-semibold">
                      same row and same column
                    </span>
                    . So top-left with top-left, top-right with top-right, and
                    so on. Each box is like a candy jar.
                  </p>
                  <p className="mt-1.5">
                    For each position (i, j):{" "}
                    <span className="font-mono font-semibold">
                      result[i][j] = A[i][j] {opSymbol} B[i][j]
                    </span>
                    .
                  </p>
                </div>

                {/* Focused cell helper */}
                {focusedInfo && (
                  <div className="bg-slate-900 text-slate-50 rounded-2xl p-3 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">
                      You are editing box (row {focusedInfo.row + 1}, column{" "}
                      {focusedInfo.col + 1})
                    </p>
                    <p>
                      A box has{" "}
                      <span className="font-mono">
                        {focusedInfo.a}
                      </span>{" "}
                      candies, B box has{" "}
                      <span className="font-mono">
                        {focusedInfo.b}
                      </span>
                      .
                    </p>
                    <p className="mt-1">
                      So we do:{" "}
                      <span className="font-mono font-semibold">
                        {focusedInfo.a} {opSymbol} {focusedInfo.b} ={" "}
                        {focusedInfo.result}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-pink-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Candy Grid
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={giveHint}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint (fill one box)
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

          {/* RIGHT: matrices board */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-pink-200 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md mx-auto">
                Fill the{" "}
                <span className="font-semibold">
                  RESULT = A {opSymbol} B
                </span>{" "}
                grid so that each box matches A and B box by box.
              </p>
            </div>

            <div
              className={`bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-xl overflow-x-auto ${
                shake ? "animate-shake" : ""
              }`}
            >
              <div className="min-w-[260px] flex flex-col gap-3 sm:gap-4 items-center">
                {/* Equation row: A op B = Result */}
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {/* Matrix A */}
                  <MatrixDisplay
                    label="A"
                    matrix={currentLevel.A}
                    color="from-sky-400 to-sky-500"
                  />
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {opSymbol}
                  </span>
                  {/* Matrix B */}
                  <MatrixDisplay
                    label="B"
                    matrix={currentLevel.B}
                    color="from-emerald-400 to-emerald-500"
                  />
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    =
                  </span>
                  {/* Result (editable) */}
                  <ResultMatrix
                    matrix={userMatrix}
                    feedback={feedback}
                    onCellChange={handleCellChange}
                    onNudge={nudgeCell}
                    onFocusCell={(r, c) => setFocusedCell({ row: r, col: c })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] sm:text-xs text-slate-300 text-center max-w-xs space-y-1">
              <p>
                Remember:{" "}
                <span className="font-semibold">
                  same place, same friends
                </span>
                . Top-left with top-left, bottom-right with bottom-right.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-pink-100">
            <div className="inline-flex bg-pink-100 p-3 sm:p-4 rounded-full mb-4 text-pink-500">
              <Grid3x3 size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Candy Grid Complete!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              Every result box matches{" "}
              <span className="font-semibold">
                A {opSymbol} B
              </span>
              . You just did matrix{" "}
              {currentLevel.op === "add" ? "addition" : "subtraction"} like a
              pro.
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
              className="w-full bg-pink-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-pink-600 transition-colors flex justify-center gap-2 items-center"
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
        @keyframes shake-candy {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake-candy 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// ---------- Presentational subcomponents ----------

const MatrixDisplay = ({ label, matrix, color }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">Matrix {label}</span>
      <div
        className={`inline-flex rounded-xl bg-gradient-to-br ${color} px-1.5 py-1 shadow-lg`}
      >
        <div className="border-2 border-white/40 rounded-lg px-2 py-1 text-xs sm:text-sm text-white font-mono grid gap-1"
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

const ResultMatrix = ({
  matrix,
  feedback,
  onCellChange,
  onNudge,
  onFocusCell,
}) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const cellClass = (fb) => {
    if (fb === "correct")
      return "border-emerald-400 bg-emerald-50 text-emerald-700";
    if (fb === "wrong") return "border-rose-400 bg-rose-50 text-rose-700";
    if (fb === "empty") return "border-slate-300 bg-slate-50 text-slate-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
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
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className={`flex flex-col items-center justify-center rounded-lg border px-1.5 py-1 ${cellClass(
                  feedback[i][j]
                )}`}
              >
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    onCellChange(i, j, e.target.value.trim())
                  }
                  onFocus={() => onFocusCell(i, j)}
                  className="w-10 sm:w-12 bg-transparent text-center text-xs sm:text-sm font-mono outline-none"
                />
                <div className="flex gap-1 mt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onFocusCell(i, j);
                      onNudge(i, j, -1);
                    }}
                    className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-white flex items-center justify-center active:scale-95"
                  >
                    <ChevronLeft size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFocusCell(i, j);
                      onNudge(i, j, +1);
                    }}
                    className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-white flex items-center justify-center active:scale-95"
                  >
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MatrixCandyMixer;
