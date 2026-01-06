// FractionGardenGame.jsx
import React, { useState } from "react";
import {
  Leaf,
  Droplets,
  ArrowRight,
  RotateCcw,
  Star,
  Home,
} from "lucide-react";

// Local storage so progress stays saved
const STORAGE_KEY = "fraction_garden_data_v1";

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

// Levels: target fraction + grid size
const LEVELS = [
  {
    id: 1,
    name: "Tiny Garden",
    num: 1,
    den: 2,
    rows: 2,
    cols: 2, // total = 4 (child learns 2/4 = 1/2)
    color: "bg-green-500",
    intro: "Water half the garden. 1/2 of the whole!",
  },
  {
    id: 2,
    name: "Strip Garden",
    num: 2,
    den: 3,
    rows: 3,
    cols: 3, // total = 9 (6 watered squares is correct)
    color: "bg-emerald-500",
    intro: "Water two thirds of the garden. 2/3 of all squares!",
  },
  {
    id: 3,
    name: "Checker Garden",
    num: 3,
    den: 4,
    rows: 2,
    cols: 4, // total = 8 (6 watered = 3/4)
    color: "bg-lime-500",
    intro: "Water three quarters of the garden. 3/4 of the whole!",
  },
  {
    id: 4,
    name: "Big Patch",
    num: 5,
    den: 8,
    rows: 2,
    cols: 4, // total = 8 (5 watered = 5/8)
    color: "bg-teal-500",
    intro: "Water exactly five out of eight little patches.",
  },
];

const FractionGardenGame = () => {
  const [view, setView] = useState("menu"); // menu | game | win
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  const [selectedCells, setSelectedCells] = useState([]);
  const [message, setMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);

  // ---------- HELPERS ----------
  const currentLevel = LEVELS[currentLevelIdx];

  const initGridForLevel = (level) => {
    const total = level.rows * level.cols;
    setSelectedCells(Array(total).fill(false));
  };

  const startLevel = (index) => {
    setCurrentLevelIdx(index);
    const lvl = LEVELS[index];
    initGridForLevel(lvl);
    setMistakes(0);
    setMessage(lvl.intro);
    setView("game");
  };

  const resetLevel = () => {
    initGridForLevel(currentLevel);
    setMistakes(0);
    setMessage(currentLevel.intro);
  };

  const toggleCell = (cellIndex) => {
    setSelectedCells((prev) =>
      prev.map((val, idx) => (idx === cellIndex ? !val : val))
    );
  };

  const checkAnswer = () => {
    const level = currentLevel;
    const totalCells = level.rows * level.cols;
    const selectedCount = selectedCells.filter(Boolean).length;

    // Compare fractions: selected / total ?= target num / target den
    const left = selectedCount * level.den;
    const right = level.num * totalCells;
    const correct = left === right;

    if (correct) {
      handleWin();
    } else {
      setMistakes((m) => m + 1);

      // Helpful hints
      if (selectedCount === 0) {
        setMessage(
          "Nothing is watered yet. Tap some squares to water the garden."
        );
      } else if (selectedCount * level.den < level.num * totalCells) {
        setMessage(
          "Too little water! You need a bigger part of the garden watered."
        );
      } else {
        setMessage(
          "Too much water! You watered more than the target fraction. Turn some off."
        );
      }
    }
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
      startLevel(currentLevelIdx + 1);
    } else {
      setView("menu");
    }
  };

  const totalCells = currentLevel.rows * currentLevel.cols;
  const selectedCount = selectedCells.filter(Boolean).length;

  // ---------- RENDERERS ----------
  const renderMenu = () => (
    <div className="flex-1 bg-gradient-to-b from-emerald-50 to-slate-50 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-white p-2 rounded-xl shadow">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Fraction Garden
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Water the right fraction of each garden.
              </p>
            </div>
          </div>

          <div className="bg-white px-3 py-1 rounded-full shadow-sm border text-xs sm:text-sm font-bold text-emerald-500 flex items-center gap-1">
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
                onClick={() => startLevel(idx)}
                className={`relative w-full p-3 sm:p-4 rounded-2xl border-b-4 transition-all flex items-center gap-3 sm:gap-4 text-left group
                  ${
                    isUnlocked
                      ? "bg-white border-emerald-200 hover:border-emerald-500 hover:-translate-y-1 shadow-sm"
                      : "bg-slate-100 border-transparent opacity-60 cursor-not-allowed"
                  }
                `}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-inner ${lvl.color}`}
                >
                  {lvl.id}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {lvl.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    Target: {lvl.num}/{lvl.den}
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
                  <div className="text-emerald-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

  const renderGrid = () => {
    const level = currentLevel;
    const cells = [];
    const total = level.rows * level.cols;

    for (let i = 0; i < total; i++) {
      const active = selectedCells[i];
      cells.push(
        <button
          key={i}
          type="button"
          onClick={() => toggleCell(i)}
          className={`border-2 rounded-xl flex items-center justify-center transition-all ${
            active
              ? "bg-emerald-500 border-emerald-600 shadow-inner"
              : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          {active && <Droplets size={20} className="text-sky-100" />}
        </button>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          gap: "8px",
        }}
        className="w-full max-w-[260px] sm:max-w-[320px] aspect-square"
      >
        {cells}
      </div>
    );
  };

  // ---------- MAIN ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <button
          className="flex items-center gap-2"
          onClick={() => setView("menu")}
        >
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight hidden sm:block">
            FRACTION GARDEN
          </span>
        </button>

        <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
          <Droplets size={16} className="text-sky-500" />
          <span className="font-semibold">
            {selectedCount}/{totalCells} watered
          </span>
        </div>
      </header>

      {/* ROUTER */}
      {view === "menu" && renderMenu()}

      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: Garden */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-emerald-100/60 to-slate-50">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-700 font-medium">
                Water{" "}
                <span className="font-bold text-emerald-700">
                  {currentLevel.num}/{currentLevel.den}
                </span>{" "}
                of the garden.
              </p>
            </div>

            {renderGrid()}

            <div className="mt-4 text-xs sm:text-sm text-slate-600 text-center max-w-xs">
              <p>
                Top number = watered squares. Bottom number = total garden
                squares.
              </p>
            </div>
          </div>

          {/* RIGHT: Tutor + Controls */}
          <div className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor Bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🌱
                  </div>
                  <div className="bg-emerald-50 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Fraction Status */}
                <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <p className="font-semibold text-slate-700">
                      Your watered fraction
                    </p>
                    <p className="mt-1 text-slate-600">
                      {selectedCount}/{totalCells}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">Target</p>
                    <p className="mt-1 text-emerald-600 font-bold">
                      {currentLevel.num}/{currentLevel.den}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-emerald-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Garden
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={resetLevel}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset Garden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-emerald-100">
            <div className="inline-flex bg-emerald-100 p-3 sm:p-4 rounded-full mb-4 text-emerald-600">
              <Leaf size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Garden Complete!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              You watered the correct fraction of the garden.
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
              className="w-full bg-emerald-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-emerald-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Garden
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setView("menu")}
              className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractionGardenGame;
