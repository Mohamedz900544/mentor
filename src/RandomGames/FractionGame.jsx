import React, { useState } from "react";
import { Star, Trophy, ArrowRight, RotateCcw } from "lucide-react";

const FractionGame = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedParts, setSelectedParts] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const levels = {
    1: {
      title: "Level 1: Color the Fraction",
      instruction: "Click to color 1/2 of the circle",
      fraction: { num: 1, den: 2 },
      shape: "circle",
      parts: 2,
      example: "1/2 means 1 out of 2 equal parts",
    },
    2: {
      title: "Level 2: More Fractions",
      instruction: "Click to color 2/4 of the rectangle",
      fraction: { num: 2, den: 4 },
      shape: "rectangle",
      parts: 4,
      example: "2/4 means 2 out of 4 equal parts",
    },
    3: {
      title: "Level 3: Pizza Slices",
      instruction: "Click to color 3/6 of the pizza",
      fraction: { num: 3, den: 6 },
      shape: "pizza",
      parts: 6,
      example: "3/6 means 3 out of 6 equal slices",
    },
    4: {
      title: "Level 4: Bigger Fractions",
      instruction: "Click to color 5/8 of the bar",
      fraction: { num: 5, den: 8 },
      shape: "bar",
      parts: 8,
      example: "5/8 means 5 out of 8 equal sections",
    },
    5: {
      title: "Level 5: Challenge!",
      instruction: "Click to color 4/10 of the hexagon",
      fraction: { num: 4, den: 10 },
      shape: "hexagon",
      parts: 10,
      example: "4/10 means 4 out of 10 equal parts",
    },
  };

  const currentLevel = levels[level];

  // ✅ Styling-only: award points in a nicer way (same scoring, better feel)
  const addPoints = (pts) => {
    setScore((prev) => prev + pts);
  };

  const handlePartClick = (index) => {
    if (showFeedback) return;

    const newSelected = selectedParts.includes(index)
      ? selectedParts.filter((i) => i !== index)
      : [...selectedParts, index];

    setSelectedParts(newSelected);
  };

  const checkAnswer = () => {
    const correct = selectedParts.length === currentLevel.fraction.num;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      // ✅ same points, just via helper for clean + safe state update
      addPoints(20);
    }
  };

  const nextLevel = () => {
    if (level < 5) {
      setLevel(level + 1);
      setSelectedParts([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
    }
  };

  const resetLevel = () => {
    setSelectedParts([]);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setSelectedParts([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setCompleted(false);
  };

  const renderShape = () => {
    const parts = currentLevel.parts;

    if (currentLevel.shape === "circle") {
      return (
        <svg
          width="280"
          height="280"
          viewBox="0 0 200 200"
          className="mx-auto drop-shadow-sm"
        >
          {/* soft background ring */}
          <circle cx="100" cy="100" r="96" fill="white" opacity="0.7" />
          {Array.from({ length: parts }).map((_, i) => {
            const angle = (360 / parts) * i - 90;
            const nextAngle = (360 / parts) * (i + 1) - 90;
            const rad1 = (angle * Math.PI) / 180;
            const rad2 = (nextAngle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(rad1);
            const y1 = 100 + 90 * Math.sin(rad1);
            const x2 = 100 + 90 * Math.cos(rad2);
            const y2 = 100 + 90 * Math.sin(rad2);

            const active = selectedParts.includes(i);

            return (
              <path
                key={i}
                d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                fill={active ? "#3b82f6" : "#eef2ff"}
                stroke={active ? "#1d4ed8" : "#334155"}
                strokeWidth={active ? "2.4" : "2"}
                onClick={() => handlePartClick(i)}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: active ? "drop-shadow(0 6px 10px rgba(59,130,246,.25))" : "none",
                }}
              />
            );
          })}
        </svg>
      );
    }

    if (currentLevel.shape === "rectangle") {
      const width = 260 / parts;
      return (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: parts }).map((_, i) => {
            const active = selectedParts.includes(i);
            return (
              <div
                key={i}
                className="cursor-pointer transition-all duration-200 border-2"
                style={{
                  width: `${width}px`,
                  height: "130px",
                  backgroundColor: active ? "#3b82f6" : "#eef2ff",
                  borderColor: active ? "#1d4ed8" : "#334155",
                  borderRadius: "14px",
                  boxShadow: active
                    ? "0 12px 20px rgba(59,130,246,.22)"
                    : "0 8px 14px rgba(15,23,42,.08)",
                  transform: active ? "translateY(-2px)" : "translateY(0px)",
                }}
                onClick={() => handlePartClick(i)}
              />
            );
          })}
        </div>
      );
    }

    if (currentLevel.shape === "pizza") {
      return (
        <svg
          width="280"
          height="280"
          viewBox="0 0 200 200"
          className="mx-auto drop-shadow-sm"
        >
          <circle cx="100" cy="100" r="96" fill="white" opacity="0.65" />
          <circle cx="100" cy="100" r="95" fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
          <circle cx="100" cy="100" r="86" fill="transparent" stroke="#b45309" strokeWidth="2" opacity="0.35" />
          {Array.from({ length: parts }).map((_, i) => {
            const angle = (360 / parts) * i - 90;
            const nextAngle = (360 / parts) * (i + 1) - 90;
            const rad1 = (angle * Math.PI) / 180;
            const rad2 = (nextAngle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(rad1);
            const y1 = 100 + 90 * Math.sin(rad1);
            const x2 = 100 + 90 * Math.cos(rad2);
            const y2 = 100 + 90 * Math.sin(rad2);

            const active = selectedParts.includes(i);

            return (
              <g key={i}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                  fill={active ? "#dc2626" : "transparent"}
                  stroke={active ? "#7f1d1d" : "#92400e"}
                  strokeWidth={active ? "2.4" : "2"}
                  onClick={() => handlePartClick(i)}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: active ? "drop-shadow(0 6px 10px rgba(220,38,38,.22))" : "none",
                  }}
                />
              </g>
            );
          })}
        </svg>
      );
    }

    if (currentLevel.shape === "bar") {
      const width = 320 / parts;
      return (
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: parts }).map((_, i) => {
            const active = selectedParts.includes(i);
            return (
              <div
                key={i}
                className="cursor-pointer transition-all duration-200 border-2"
                style={{
                  width: `${width}px`,
                  height: "90px",
                  backgroundColor: active ? "#10b981" : "#ecfeff",
                  borderColor: active ? "#047857" : "#334155",
                  borderRadius: "12px",
                  boxShadow: active
                    ? "0 12px 20px rgba(16,185,129,.22)"
                    : "0 8px 14px rgba(15,23,42,.08)",
                  transform: active ? "translateY(-2px)" : "translateY(0px)",
                }}
                onClick={() => handlePartClick(i)}
              />
            );
          })}
        </div>
      );
    }

    if (currentLevel.shape === "hexagon") {
      const rows = 2;
      const cols = 5;
      const size = 46;
      return (
        <div className="flex flex-col gap-2 items-center">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex gap-2">
              {Array.from({ length: cols }).map((_, col) => {
                const i = row * cols + col;
                const active = selectedParts.includes(i);
                return (
                  <div
                    key={i}
                    className="cursor-pointer transition-all duration-200 border-2"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: active ? "#8b5cf6" : "#f5f3ff",
                      borderColor: active ? "#6d28d9" : "#334155",
                      borderRadius: "14px",
                      boxShadow: active
                        ? "0 12px 20px rgba(139,92,246,.22)"
                        : "0 8px 14px rgba(15,23,42,.08)",
                      transform: active ? "translateY(-2px)" : "translateY(0px)",
                    }}
                    onClick={() => handlePartClick(i)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      );
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100 via-orange-100 to-rose-100 p-6 md:p-10 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-12 max-w-md text-center border border-white">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-yellow-50 flex items-center justify-center shadow-sm mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Congratulations!
          </h1>
          <p className="text-lg text-slate-600 mb-1">You completed all levels!</p>

          <div className="mt-5 mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-slate-600 font-semibold">Final Score</span>
              <span className="text-3xl font-extrabold text-blue-600">
                {score}/100
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            ))}
          </div>

          <button
            onClick={resetGame}
            className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all text-lg font-bold shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ small styling helper (no logic change)
  const scorePct = Math.min(100, Math.round((score / 100) * 100));

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-purple-100 to-pink-100 p-5 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 border border-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            {/* Level stars */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < level
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-semibold text-slate-500">
                Level {level}/5
              </span>
            </div>

            {/* Score card + mini bar */}
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-slate-600">Score</div>
              <div className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100">
                <span className="text-2xl font-extrabold text-blue-600">{score}</span>
                <span className="text-slate-400 font-semibold"> / 100</span>
              </div>
              <div className="hidden md:block w-36 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${scorePct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {currentLevel.title}
            </h1>
            <p className="text-base md:text-lg text-slate-600 mt-2">
              <span className="italic">{currentLevel.example}</span>
            </p>
          </div>

          {/* Instruction card */}
          <div className="relative overflow-hidden rounded-2xl p-5 mb-8 border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-200/40 blur-2xl" />
            <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-indigo-200/40 blur-2xl" />

            <p className="text-xl md:text-2xl text-center font-extrabold text-slate-900 relative">
              {currentLevel.instruction}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 relative">
              <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
                Selected: {selectedParts.length}/{currentLevel.parts}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
                Target: {currentLevel.fraction.num}/{currentLevel.fraction.den}
              </span>
            </div>
          </div>

          {/* Shape area */}
          <div className="mb-8 py-6 md:py-8">
            <div className="mx-auto w-full max-w-[520px] rounded-3xl bg-white/60 border border-white shadow-sm p-5">
              {renderShape()}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`p-4 rounded-2xl mb-5 text-center text-lg font-bold border shadow-sm ${
                isCorrect
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {isCorrect
                ? `🎉 Perfect! You colored ${currentLevel.fraction.num}/${currentLevel.fraction.den} correctly!`
                : `Try again! You need to color exactly ${currentLevel.fraction.num} parts.`}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!showFeedback ? (
              <>
                <button
                  onClick={checkAnswer}
                  disabled={selectedParts.length === 0}
                  className="px-7 py-3.5 rounded-2xl font-extrabold text-lg transition-all shadow-lg active:scale-[0.98]
                             bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                             hover:from-blue-700 hover:to-indigo-700
                             disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>

                <button
                  onClick={resetLevel}
                  className="px-7 py-3.5 rounded-2xl font-extrabold text-lg transition-all shadow-sm active:scale-[0.98]
                             bg-white text-slate-800 border border-slate-200 hover:bg-slate-50
                             flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </>
            ) : (
              <>
                {!isCorrect && (
                  <button
                    onClick={resetLevel}
                    className="px-7 py-3.5 rounded-2xl font-extrabold text-lg transition-all shadow-lg active:scale-[0.98]
                               bg-gradient-to-r from-orange-500 to-amber-500 text-white
                               hover:from-orange-600 hover:to-amber-600"
                  >
                    Try Again
                  </button>
                )}

                {isCorrect && (
                  <button
                    onClick={nextLevel}
                    className="px-7 py-3.5 rounded-2xl font-extrabold text-lg transition-all shadow-lg active:scale-[0.98]
                               bg-gradient-to-r from-emerald-600 to-green-600 text-white
                               hover:from-emerald-700 hover:to-green-700
                               flex items-center justify-center gap-2"
                  >
                    Next Level
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* tiny footer tip */}
          <div className="mt-7 text-center text-sm text-slate-500">
            Tip: You can click again to un-color a part.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionGame;
