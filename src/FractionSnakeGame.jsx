// FractionSnakeGame.jsx
import React, { useState } from "react";
import {
  Apple,
  Star,
  RotateCcw,
  ArrowRight,
  Heart,
  Home,
} from "lucide-react";

const STORAGE_KEY = "fraction_snake_data_v1";

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

// Each level: one snake, a target fraction (purple part),
// and 3 answer options (fractions).
const LEVELS = [
  {
    id: 1,
    name: "Baby Snake",
    length: 8,
    num: 1,
    den: 2, // 1/2 of body purple
    color: "bg-lime-500",
    intro: "Look at the snake! What fraction of its body is PURPLE?",
    options: [
      { num: 1, den: 2 }, // correct
      { num: 1, den: 4 },
      { num: 3, den: 4 },
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    name: "Striped Snake",
    length: 9,
    num: 2,
    den: 3, // 2/3 of body purple
    color: "bg-emerald-500",
    intro: "More purple now! Which fraction shows the PURPLE part?",
    options: [
      { num: 2, den: 3 }, // correct
      { num: 3, den: 5 },
      { num: 4, den: 9 },
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    name: "Long Snake",
    length: 8,
    num: 3,
    den: 4, // 3/4 of body purple
    color: "bg-green-500",
    intro: "This snake is almost fully purple. Which fraction is it?",
    options: [
      { num: 3, den: 4 }, // correct
      { num: 1, den: 3 },
      { num: 5, den: 8 },
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    name: "Boss Snake",
    length: 10,
    num: 3,
    den: 5, // 3/5 of body purple
    color: "bg-teal-500",
    intro: "Final boss! Count carefully: which fraction is PURPLE?",
    options: [
      { num: 3, den: 5 }, // correct
      { num: 1, den: 2 },
      { num: 4, den: 5 },
    ],
    correctIndex: 0,
  },
];

const FractionSnakeGame = () => {
  const [view, setView] = useState("menu"); // menu | game | win | gameover
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [message, setMessage] = useState("");
  const [lastSelected, setLastSelected] = useState(null); // index of clicked option

  const currentLevel = LEVELS[currentLevelIdx];

  const startLevel = (index) => {
    const lvl = LEVELS[index];
    setCurrentLevelIdx(index);
    setMistakes(0);
    setHearts(3);
    setMessage(lvl.intro);
    setLastSelected(null);
    setView("game");
  };

  const resetLevel = () => {
    setMistakes(0);
    setHearts(3);
    setMessage(currentLevel.intro);
    setLastSelected(null);
  };

  const handleOptionClick = (optionIndex) => {
    if (view !== "game") return;
    setLastSelected(optionIndex);

    const level = currentLevel;

    if (optionIndex === level.correctIndex) {
      handleWin();
    } else {
      // Wrong
      setMistakes((m) => m + 1);
      const newHearts = hearts - 1;
      setHearts(newHearts);

      // Helpful hint message
      const totalSegments = level.length;
      const coloredSegments = (level.length * level.num) / level.den;

      setMessage(
        `Not quite. Remember: the bottom number is total pieces (${totalSegments}), and the top is the PURPLE pieces (${coloredSegments}). Try again!`
      );

      if (newHearts <= 0) {
        setView("gameover");
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

  // ---------- RENDERERS ----------

  const renderMenu = () => (
    <div className="flex-1 bg-gradient-to-b from-emerald-50 to-slate-50 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-lime-500 text-white p-2 rounded-xl shadow">
              🐍
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Fraction Snake Trail
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Read fractions from a wiggly snake body.
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

  const renderSnake = () => {
    const level = currentLevel;
    const total = level.length;
    const coloredSegments = (level.length * level.num) / level.den; // integer by design

    const segments = [];
    for (let i = 0; i < total; i++) {
      const isPurple = i < coloredSegments; // first N segments purple
      const isHead = i === 0;
      const isTail = i === total - 1;

      segments.push(
        <div
          key={i}
          className={`relative h-8 sm:h-9 md:h-10 flex-1 min-w-[16px] border-2 border-emerald-700/70
            ${
              isPurple
                ? "bg-purple-500"
                : `${level.color} bg-opacity-80`
            }
            ${isHead ? "rounded-l-full" : ""}
            ${isTail ? "rounded-r-full" : ""}
          `}
        >
          {isHead && (
            <span className="absolute -left-2 -top-2 text-lg sm:text-xl">
              👀
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-4">
        <div className="w-full flex items-center">{segments}</div>
        <p className="text-xs sm:text-sm text-slate-600 text-center max-w-xs">
          Count how many parts of the snake are PURPLE and compare to the whole
          snake.
        </p>
      </div>
    );
  };

  const renderHearts = () => (
    <div className="flex gap-1">
      {[1, 2, 3].map((h) => (
        <Heart
          key={h}
          size={20}
          className={
            h <= hearts
              ? "text-red-500 fill-red-500"
              : "text-slate-200 fill-slate-200"
          }
        />
      ))}
    </div>
  );

  // ---------- MAIN ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <button
          className="flex items-center gap-2"
          onClick={() => setView("menu")}
        >
          <div className="bg-lime-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight hidden sm:block">
            FRACTION SNAKE
          </span>
        </button>

        {view === "game" && renderHearts()}
      </header>

      {/* ROUTER */}
      {view === "menu" && renderMenu()}

      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: Snake visual */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-emerald-100/60 to-slate-50">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-700 font-medium">
                What fraction of the snake is{" "}
                <span className="font-bold text-purple-600">PURPLE</span>?
              </p>
            </div>

            {renderSnake()}
          </div>

          {/* RIGHT: Tutor + options */}
          <div className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🐍
                  </div>
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message || currentLevel.intro}
                  </div>
                </div>

                {/* Small help card */}
                <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-slate-600">
                  <p>
                    Bottom number = total pieces of the snake.
                    <br />
                    Top number = how many of those pieces are PURPLE.
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 sm:space-y-3">
                {currentLevel.options.map((opt, idx) => {
                  const isSelected = lastSelected === idx;
                  return (
                    <button
                      key={`${opt.num}/${opt.den}-${idx}`}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full py-3 sm:py-3.5 rounded-2xl font-bold text-base sm:text-lg border-2 flex items-center justify-between px-4 sm:px-5 transition-all
                        ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-lg scale-[0.99]"
                            : "bg-white text-slate-800 border-slate-200 hover:border-purple-400 hover:bg-purple-50"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <Apple size={18} className="text-emerald-500" />
                        <span>
                          {opt.num}/{opt.den}
                        </span>
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  );
                })}

                <button
                  onClick={resetLevel}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2"
                >
                  <RotateCcw size={18} />
                  Try This Snake Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-purple-100">
            <div className="inline-flex bg-purple-100 p-3 sm:p-4 rounded-full mb-4 text-purple-600">
              🐍
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Great Job!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              You picked the correct fraction of the snake.
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
              className="w-full bg-purple-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-purple-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Snake
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

      {/* GAME OVER */}
      {view === "gameover" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-red-50">
            <div className="inline-flex bg-red-100 p-3 sm:p-4 rounded-full mb-4 text-red-500">
              <Heart size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Snake Slipped Away
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              That&apos;s okay. Fractions get easier each time you try.
            </p>

            <button
              onClick={resetLevel}
              className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg flex justify-center gap-2 items-center mb-3"
            >
              <RotateCcw size={20} />
              Try Level Again
            </button>
            <button
              onClick={() => setView("menu")}
              className="text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractionSnakeGame;
