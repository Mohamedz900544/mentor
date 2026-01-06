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

const STORAGE_KEY = "farm_matrix_animals_progress_v1";

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
  A: ducks matrix
  B: sheep matrix
  op "add": result = ducks + sheep  (total animals)
  op "sub": result = ducks - sheep  ("how many more ducks than sheep?")
*/
const LEVELS = [
  {
    id: 1,
    name: "Baby Pens Sum",
    op: "add",
    intro:
      "Each box is a little pen. A shows ducks 🦆, B shows sheep 🐑. Add them to find the total animals in every pen.",
    A: [
      [1, 2],
      [0, 1],
    ],
    B: [
      [1, 0],
      [2, 1],
    ],
  },
  {
    id: 2,
    name: "Full Barn Rows",
    op: "add",
    intro:
      "Same rule: total animals = ducks + sheep in the same box. Fill the RESULT grid.",
    A: [
      [2, 1],
      [1, 0],
    ],
    B: [
      [0, 2],
      [1, 3],
    ],
  },
  {
    id: 3,
    name: "Wide Animal Field",
    op: "add",
    intro:
      "Now we have 2×3 pens. Still add box by box: RESULT[i][j] = ducks[i][j] + sheep[i][j].",
    A: [
      [1, 0, 2],
      [0, 1, 1],
    ],
    B: [
      [2, 1, 0],
      [1, 0, 2],
    ],
  },
  {
    id: 4,
    name: "Who Wins The Pen?",
    op: "sub",
    intro:
      "Now we compare ducks and sheep. RESULT = ducks − sheep. Positive means more ducks, negative means more sheep.",
    A: [
      [3, 2],
      [1, 0],
    ],
    B: [
      [1, 1],
      [0, 2],
    ],
  },
  {
    id: 5,
    name: "Duck Lead",
    op: "sub",
    intro:
      "Again ducks − sheep in every box. A lot of sheep means the answer can be negative!",
    A: [
      [2, 0],
      [1, 1],
    ],
    B: [
      [3, 1],
      [0, 2],
    ],
  },
  {
    id: 6,
    name: "Big Field Battle",
    op: "sub",
    intro:
      "Final challenge: a 2×3 field. For every pen do ducks − sheep and write the answer.",
    A: [
      [3, 2, 1],
      [1, 0, 2],
    ],
    B: [
      [1, 1, 0],
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
      const ducks = level.A[i][j];
      const sheep = level.B[i][j];
      row.push(level.op === "add" ? ducks + sheep : ducks - sheep);
    }
    result.push(row);
  }
  return result;
};

const FarmMatrixAnimals = () => {
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

  // reset when level changes
  useEffect(() => {
    const lvl = currentLevel;
    setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setAttempts(0);
    setFocusedCell(null);
    setView("game");
    setMessage(lvl.intro);
  }, [currentLevel]);

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
        "Fill every pen first. Light-outline pens are still empty."
      );
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    if (allCorrect) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);
      setMessage(
        "Some pens are wrong. Red pens need fixing. Change those numbers and try again!"
      );
      setShake(true);
      setTimeout(() => setShake(false), 350);
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

          const ducks = currentLevel.A[i][j];
          const sheep = currentLevel.B[i][j];
          setMessage(
            currentLevel.op === "add"
              ? `Hint: this pen has ${ducks} ducks 🦆 and ${sheep} sheep 🐑, so total animals = ${ducks} + ${sheep} = ${correctVal}.`
              : `Hint: this pen has ${ducks} ducks 🦆 and ${sheep} sheep 🐑, so ducks − sheep = ${ducks} − ${sheep} = ${correctVal}.`
          );
          return;
        }
      }
    }
    setMessage("All pens are already correct. Farm hero!");
  };

  const focusedInfo = useMemo(() => {
    if (!focusedCell) return null;
    const { row, col } = focusedCell;
    const ducks = currentLevel.A[row][col];
    const sheep = currentLevel.B[row][col];
    const result = correctMatrix[row][col];
    return { row, col, ducks, sheep, result };
  }, [focusedCell, currentLevel, correctMatrix]);

  const goNextLevel = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      setLevelIndex(nextIndex);
    } else {
      setLevelIndex(0);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Farm
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1">
              <Grid3x3 size={18} className="text-emerald-500" />
              Duck & Sheep Matrix Pens
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={16} className="text-emerald-400" />
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
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-emerald-50 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🐑
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-emerald-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-emerald-900">
                  <p className="font-semibold mb-1">
                    Rule for each little pen
                  </p>
                  <p>
                    We only mix animals that stand in the{" "}
                    <span className="font-semibold">
                      same row and same column
                    </span>
                    . So top-left ducks and sheep talk only to top-left, and so
                    on.
                  </p>
                  <p className="mt-1.5">
                    For each pen (i, j):{" "}
                    <span className="font-mono font-semibold">
                      RESULT[i][j] = ducks[i][j] {opSymbol} sheep[i][j]
                    </span>
                    .
                  </p>
                  {currentLevel.op === "sub" && (
                    <p className="mt-1">
                      Positive result → more ducks 🦆. Negative result → more
                      sheep 🐑.
                    </p>
                  )}
                </div>

                {/* Focused pen helper */}
                {focusedInfo && (
                  <div className="bg-slate-900 text-slate-50 rounded-2xl p-3 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">
                      You are editing pen (row {focusedInfo.row + 1}, column{" "}
                      {focusedInfo.col + 1})
                    </p>
                    <p>
                      Ducks:{" "}
                      <span className="font-mono">
                        {focusedInfo.ducks}
                      </span>{" "}
                      🦆 · Sheep:{" "}
                      <span className="font-mono">
                        {focusedInfo.sheep}
                      </span>{" "}
                      🐑
                    </p>
                    <p className="mt-1">
                      So we do:{" "}
                      <span className="font-mono font-semibold">
                        {focusedInfo.ducks} {opSymbol} {focusedInfo.sheep} ={" "}
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
                  className="w-full bg-emerald-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Pens
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={giveHint}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint (fix one pen)
                  </button>
                  <button
                    onClick={() => {
                      const lvl = currentLevel;
                      setUserMatrix(
                        makeEmptyMatrix(lvl.A.length, lvl.A[0].length)
                      );
                      setFeedback(
                        makeEmptyMatrix(lvl.A.length, lvl.A[0].length)
                      );
                      setAttempts(0);
                      setFocusedCell(null);
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

          {/* RIGHT: matrices board */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-emerald-200 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md mx-auto">
                Fill the{" "}
                <span className="font-semibold">
                  RESULT = ducks {opSymbol} sheep
                </span>{" "}
                grid for every pen.
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
                  {/* Ducks matrix A */}
                  <AnimalMatrixDisplay
                    label="Ducks A"
                    matrix={currentLevel.A}
                    animal="duck"
                  />
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {opSymbol}
                  </span>
                  {/* Sheep matrix B */}
                  <AnimalMatrixDisplay
                    label="Sheep B"
                    matrix={currentLevel.B}
                    animal="sheep"
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
                Ducks matrix shows 🦆. Sheep matrix shows 🐑. RESULT tells you
                the story of each pen using {opSymbol}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-emerald-100">
            <div className="inline-flex bg-emerald-100 p-3 sm:p-4 rounded-full mb-4 text-emerald-500">
              <Grid3x3 size={40} />
            </div>
            <h2 className="text-2xl sm:3xl font-black text-slate-800 mb-2">
              Farm Pens Perfect!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              Every pen follows{" "}
              <span className="font-semibold">
                ducks {opSymbol} sheep
              </span>
              . You just did matrix{" "}
              {currentLevel.op === "add" ? "addition" : "subtraction"} on a
              duck–sheep farm.
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
              className="w-full bg-emerald-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-emerald-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Field
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
        @keyframes shake-farm {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake-farm 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// ---------- Presentational subcomponents ----------

const AnimalMatrixDisplay = ({ label, matrix, animal }) => {
  const emoji = animal === "duck" ? "🦆" : "🐑";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">{label}</span>
      <div className="inline-flex rounded-xl bg-slate-900 px-1.5 py-1 shadow-lg">
        <div
          className="border-2 border-slate-600 rounded-lg px-2 py-1 grid gap-1 text-xs sm:text-sm text-white font-mono"
          style={{
            gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="flex flex-col items-center justify-center px-1 py-0.5 rounded-md bg-slate-800/60"
              >
                <span>{val}</span>
                <span className="text-[11px]">
                  {renderAnimals(val, emoji)}
                </span>
              </div>
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

// helper to show up to 4 animals nicely
const renderAnimals = (n, emoji) => {
  if (n <= 0) return "";
  if (n <= 4) return Array.from({ length: n }, () => emoji).join("");
  return `${emoji}×${n}`;
};

export default FarmMatrixAnimals;
