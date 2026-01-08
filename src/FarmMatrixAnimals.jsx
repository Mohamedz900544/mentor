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

// Small helper visuals
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const animalBar = (val, max = 6) => {
  const v = clamp(Math.abs(val), 0, max);
  const blocks = Array.from({ length: max }, (_, i) => (i < v ? "█" : "░")).join("");
  return blocks;
};
const renderAnimals = (n, emoji) => {
  if (n <= 0) return "";
  if (n <= 4) return Array.from({ length: n }, () => emoji).join("");
  return `${emoji}×${n}`;
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
  const correctMatrix = useMemo(() => computeAnswer(currentLevel), [currentLevel]);

  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress.stars || {}).reduce((a, b) => a + b, 0);

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
      const next = { level: Math.max(prev.level || 0, levelIndex), stars };
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
    if (value === "" || value === "-" || /^-?\d+$/.test(value)) {
      setUserMatrix((prev) =>
        prev.map((r, i) => r.map((cell, j) => (i === row && j === col ? value : cell)))
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
          if (userVal === correctVal) fbRow.push("correct");
          else {
            fbRow.push("wrong");
            allCorrect = false;
          }
        }
      }
      newFeedback.push(fbRow);
    }

    setFeedback(newFeedback);

    if (!allFilled) {
      setMessage("Fill every pen first. Light-outline pens are still empty.");
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    if (allCorrect) {
      setView("win");
    } else {
      setAttempts((a) => a + 1);
      setMessage("Some pens are wrong. Red pens need fixing. Change those numbers and try again!");
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  };

  const giveHint = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const correctVal = correctMatrix[i][j];
        const userStr = userMatrix[i][j];
        const isEmpty = userStr === "" || userStr === "-";
        const isWrong = !isEmpty && parseInt(userStr, 10) !== correctVal;

        if (isEmpty || isWrong) {
          setUserMatrix((prev) =>
            prev.map((r, ri) => r.map((c, cj) => (ri === i && cj === j ? String(correctVal) : c)))
          );
          setFeedback((prev) =>
            prev.map((r, ri) => r.map((c, cj) => (ri === i && cj === j ? "correct" : c)))
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
    const typed = userMatrix[row][col];
    return { row, col, ducks, sheep, result, typed };
  }, [focusedCell, currentLevel, correctMatrix, userMatrix]);

  const goNextLevel = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex < LEVELS.length) setLevelIndex(nextIndex);
    else setLevelIndex(0);
  };

  // Progress mini stats (visualization)
  const progressStats = useMemo(() => {
    let filled = 0;
    let correct = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = userMatrix[i][j];
        const fb = feedback[i][j];
        if (v !== "" && v !== "-") filled++;
        if (fb === "correct") correct++;
      }
    }
    const total = rows * cols;
    return { filled, correct, total };
  }, [rows, cols, userMatrix, feedback]);

  const opTitle = currentLevel.op === "add" ? "Total animals" : "Duck lead";
  const opChip =
    currentLevel.op === "add" ? "🦆 + 🐑" : "🦆 − 🐑";

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Farm
            </p>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1">
              <Grid3x3 size={16} className="text-emerald-500" />
              Duck & Sheep Matrix Pens
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={14} className="text-emerald-400" />
            <span className="font-semibold">
              Level {currentLevel.id}/{LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white flex items-center gap-1 text-[11px]">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold">
              {totalStars}/{totalMaxStars}
            </span>
          </div>
        </div>
      </header>

      {/* GAME VIEW */}
      {view === "game" && (
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
          {/* TOP: MATRICES BOARD (simple UI + extra visuals) */}
          <div
            className={`bg-white rounded-2xl shadow p-4 sm:p-6 border border-slate-100 mb-4 ${
              shake ? "animate-shake" : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-500">
                  Level {currentLevel.id} · {currentLevel.name}
                </p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800">
                  {opTitle}: RESULT = {opChip}
                </p>
              </div>

              {/* mini progress bars */}
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
                  Filled: {progressStats.filled}/{progressStats.total}
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
                  Correct: {progressStats.correct}/{progressStats.total}
                </div>
              </div>
            </div>

            {/* equation row */}
            <div className="overflow-x-auto">
              <div className="min-w-[520px] flex items-center justify-center gap-4 sm:gap-6 py-2">
                <AnimalMatrixDisplay
                  label="Ducks A"
                  matrix={currentLevel.A}
                  animal="duck"
                  highlightCell={focusedCell}
                />

                <div className="text-2xl font-black text-slate-700">{opSymbol}</div>

                <AnimalMatrixDisplay
                  label="Sheep B"
                  matrix={currentLevel.B}
                  animal="sheep"
                  highlightCell={focusedCell}
                />

                <div className="text-2xl font-black text-slate-700">=</div>

                <ResultMatrix
                  matrix={userMatrix}
                  feedback={feedback}
                  onCellChange={handleCellChange}
                  onNudge={nudgeCell}
                  onFocusCell={(r, c) => setFocusedCell({ row: r, col: c })}
                  focusedCell={focusedCell}
                />
              </div>
            </div>

            {/* focused pen "visualization strip" */}
            {focusedInfo && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm">
                    <div className="font-extrabold text-slate-800">
                      Pen (row {focusedInfo.row + 1}, col {focusedInfo.col + 1})
                    </div>
                    <div className="text-slate-600">
                      A: {focusedInfo.ducks} ducks 🦆 · B: {focusedInfo.sheep} sheep 🐑
                    </div>
                    <div className="mt-1 font-mono font-bold text-slate-800">
                      {focusedInfo.ducks} {opSymbol} {focusedInfo.sheep} = {focusedInfo.result}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* tiny bars */}
                    <div className="text-[11px] font-bold text-slate-600">
                      Ducks
                      <div className="font-mono text-slate-800">
                        {animalBar(focusedInfo.ducks, 6)}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">
                      Sheep
                      <div className="font-mono text-slate-800">
                        {animalBar(focusedInfo.sheep, 6)}
                      </div>
                    </div>

                    {/* typed vs correct chip */}
                    <div
                      className={`px-3 py-2 rounded-xl border text-[11px] font-extrabold ${
                        focusedInfo.typed === "" || focusedInfo.typed === "-"
                          ? "bg-white border-slate-200 text-slate-500"
                          : parseInt(focusedInfo.typed, 10) === focusedInfo.result
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-rose-50 border-rose-200 text-rose-700"
                      }`}
                    >
                      You typed:{" "}
                      <span className="font-mono">
                        {focusedInfo.typed === "" ? "…" : focusedInfo.typed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Same place, same pen. Only mix animals in the same row and column.
            </p>
          </div>

          {/* BOTTOM: MESSAGE + RULE + ACTIONS (simple UI like before) */}
          <div className="bg-white rounded-2xl shadow p-4 sm:p-5 border border-slate-100">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg shrink-0">
                🐑
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm sm:text-base font-medium text-slate-700 w-full">
                {message}
              </div>
            </div>

            {/* simple rule card */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-bold text-slate-700">
                  Rule: RESULT[i][j] = ducks[i][j] {opSymbol} sheep[i][j]
                </div>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600">
                  {currentLevel.op === "add" ? "Add totals" : "Compare who is more"}
                </span>
              </div>
              {currentLevel.op === "sub" && (
                <div className="mt-2 text-[11px] text-slate-600">
                  Positive → more ducks 🦆 · Negative → more sheep 🐑
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={checkAnswer}
                  className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-extrabold shadow hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  Check
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={giveHint}
                  className="bg-amber-100 text-amber-800 px-4 py-2.5 rounded-xl font-extrabold border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-2"
                >
                  <Lightbulb size={18} />
                  Hint
                </button>

                <button
                  onClick={() => {
                    const lvl = currentLevel;
                    setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
                    setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
                    setAttempts(0);
                    setFocusedCell(null);
                    setView("game");
                    setMessage(lvl.intro);
                  }}
                  className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-extrabold hover:bg-slate-900 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                <span className="font-semibold">
                  Attempts: <span className="text-slate-800">{attempts}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex items-center justify-center p-6 bg-blue-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm w-full border-2 border-emerald-100">
            <div className="inline-flex bg-emerald-100 p-3 rounded-full mb-4 text-emerald-600">
              <Grid3x3 size={34} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Farm Pens Perfect!</h2>
            <p className="text-sm text-slate-600 mb-5">
              You finished{" "}
              <span className="font-semibold">
                ducks {opSymbol} sheep
              </span>{" "}
              for every pen.
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={28}
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
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-extrabold text-lg shadow hover:bg-emerald-600 transition-colors flex justify-center gap-2 items-center"
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
              className="mt-3 text-slate-400 font-bold text-xs hover:text-slate-600"
            >
              Replay Level
            </button>

            <p className="mt-4 text-[11px] text-slate-400">
              Stars this level: {starsThisLevel} / 3 · Total: {totalStars} / {totalMaxStars}
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
        .animate-shake { animation: shake-farm 0.35s ease-in-out; }
      `}</style>
    </div>
  );
};

// ---------- Presentational subcomponents ----------

const AnimalMatrixDisplay = ({ label, matrix, animal, highlightCell }) => {
  const emoji = animal === "duck" ? "🦆" : "🐑";
  const color = animal === "duck" ? "bg-sky-500" : "bg-violet-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-500 font-bold">{label}</span>

      <div className={`${color} rounded-xl p-3 shadow`}>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${matrix[0].length}, 44px)` }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => {
              const isFocused =
                highlightCell && highlightCell.row === i && highlightCell.col === j;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-mono text-sm
                    ${isFocused ? "bg-white text-slate-900 ring-2 ring-yellow-300" : "bg-white/20 text-white"}
                  `}
                >
                  <div className="leading-none font-bold">{val}</div>
                  <div className="text-[11px] leading-none">{renderAnimals(val, emoji)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ResultMatrix = ({ matrix, feedback, onCellChange, onNudge, onFocusCell, focusedCell }) => {
  const cols = matrix[0].length;

  const cellClass = (fb) => {
    if (fb === "correct") return "border-emerald-400 bg-emerald-50 text-emerald-700";
    if (fb === "wrong") return "border-rose-400 bg-rose-50 text-rose-700";
    if (fb === "empty") return "border-slate-300 bg-slate-50 text-slate-700";
    return "border-slate-200 bg-white text-slate-700";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-500 font-bold">RESULT</span>

      <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 64px)` }}>
          {matrix.map((row, i) =>
            row.map((val, j) => {
              const isFocused = focusedCell && focusedCell.row === i && focusedCell.col === j;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`rounded-xl border p-2 ${cellClass(feedback[i][j])} ${
                    isFocused ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onCellChange(i, j, e.target.value.trim())}
                    onFocus={() => onFocusCell(i, j)}
                    className="w-full bg-transparent text-center text-lg font-mono outline-none"
                  />

                  <div className="mt-1 flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onFocusCell(i, j);
                        onNudge(i, j, -1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFocusCell(i, j);
                        onNudge(i, j, +1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmMatrixAnimals;
