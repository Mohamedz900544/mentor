// FindingHalfLesson.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  PaintBucket,
  Check,
  RotateCcw,
  HelpCircle,
  Trophy,
  ArrowRight,
  Info,
} from "lucide-react";

// -----------------------------------
// SOUNDS
// -----------------------------------
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/win.mp3",
  error: "/audio/matrix_intro.mp3",
};

const playSound = (key) => {
  try {
    const audio = new Audio(SOUNDS[key]);
    if (key === "win") audio.volume = 0.6;
    else audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

// -----------------------------------
// PUZZLE DATA
// -----------------------------------
const PUZZLES = [
  {
    id: "p1",
    title: "Finding Half – 1",
    prompt: "Color 1/2 of the shape.",
    helper:
      "The top big rectangle is exactly half, or you can color both small ones at the bottom.",
    targetFraction: { num: 1, denom: 2 },
    regions: [
      { id: "top", x: 0, y: 0, w: 1, h: 0.5 },
      { id: "bl", x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { id: "br", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "p2",
    title: "Finding Half – 2",
    prompt: "Color 1/2 of the shape.",
    helper: "You can think in sixths: 1/2 of the shape is 3 out of 6 equal parts.",
    targetFraction: { num: 1, denom: 2 },
    regions: [
      { id: "r1", x: 0, y: 0, w: 1, h: 1 / 3 },
      { id: "r2l", x: 0, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { id: "r2r", x: 0.5, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { id: "r3", x: 0, y: 2 / 3, w: 1, h: 1 / 3 },
    ],
  },
  {
    id: "p3",
    title: "Finding Half – 3",
    prompt: "Color 1/2 of the shape.",
    helper: "Now the pieces are tall and skinny. Each tall strip is the same area.",
    targetFraction: { num: 1, denom: 2 },
    regions: [
      { id: "c1", x: 0, y: 0, w: 0.25, h: 1 },
      { id: "c2t", x: 0.25, y: 0, w: 0.25, h: 0.5 },
      { id: "c2b", x: 0.25, y: 0.5, w: 0.25, h: 0.5 },
      { id: "c3", x: 0.5, y: 0, w: 0.25, h: 1 },
      { id: "c4t", x: 0.75, y: 0, w: 0.25, h: 0.5 },
      { id: "c4b", x: 0.75, y: 0.5, w: 0.25, h: 0.5 },
    ],
  },
  {
    id: "p4",
    title: "Finding Half – 4",
    prompt: "Color 1/2 of the shape.",
    helper:
      "Think in tenths: each strip is the same height. Half is 5 out of 10 equal pieces.",
    targetFraction: { num: 1, denom: 2 },
    regions: [
      { id: "row1", x: 0, y: 0, w: 1, h: 0.2 },
      { id: "row2l", x: 0, y: 0.2, w: 0.5, h: 0.2 },
      { id: "row2r", x: 0.5, y: 0.2, w: 0.5, h: 0.2 },
      { id: "row3", x: 0, y: 0.4, w: 1, h: 0.2 },
      { id: "row4l", x: 0, y: 0.6, w: 0.5, h: 0.2 },
      { id: "row4r", x: 0.5, y: 0.6, w: 0.5, h: 0.2 },
      { id: "row5", x: 0, y: 0.8, w: 1, h: 0.2 },
    ],
  },
];

// -----------------------------------
// CONFETTI
// -----------------------------------
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.1,
  }));

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none z-40">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-burst shadow-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: "#60a5fa",
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
            "--rot": `${p.rotation}deg`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// -----------------------------------
// END TIP VISUAL
// -----------------------------------
// -----------------------------------
// END TIP VISUAL – fancy "master" card
// -----------------------------------
// -----------------------------------
// END TIP VISUAL – purple "master" card
// -----------------------------------
const HalfTipVisual = () => {
  const size = 130;
  const rows = 5;
  const cols = 2;
  const rowH = size / rows;
  const colW = size / cols;

  const renderShape = (coloredIds) => {
    const colored = new Set(coloredIds);

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={12}
          ry={12}
          fill="#ffffff"
          stroke="#111827"
          strokeWidth={3}
        />
        {Array.from({ length: rows }).flatMap((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const id = `r${r}c${c}`;
            const x = c * colW;
            const y = r * rowH;
            const fill = colored.has(id) ? "#7c3aed" : "#ffffff"; // purple fill

            return (
              <rect
                key={id}
                x={x}
                y={y}
                width={colW}
                height={rowH}
                fill={fill}
                stroke="#111827"
                strokeWidth={1.5}
              />
            );
          })
        )}
      </svg>
    );
  };

  // “two and a half rows”
  const coloredRows = ["r0c0", "r0c1", "r1c0", "r2c0", "r2c1"];

  // “tenths” – 5 out of 10 equal pieces
  const coloredTenths = ["r0c0", "r0c1", "r1c0", "r1c1", "r2c0"];

  return (
    <div className="mt-12">
      <div
        className="
          rounded-[2.5rem]
          text-white
          px-6 py-8 md:px-10 md:py-10
          shadow-2xl shadow-violet-700/40
        "
        style={{
          // close match to your screenshot
          background:
            "linear-gradient(135deg, #5b3df5 0%, #6a3ff8 45%, #a855f7 100%)",
        }}
      >
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          {/* Icon circle */}
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/40 flex items-center justify-center shadow-lg shadow-black/20">
            <Trophy className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>

          {/* Title + text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Fraction Master
            </h2>
            <p className="text-sm md:text-base text-indigo-50 max-w-xl mx-auto">
              To color <span className="font-semibold">1/2</span> of the shape, we can
              think about breaking the shape into tenths or about coloring two and a
              half rows.
            </p>
            <p className="text-xs md:text-sm text-indigo-100/90 mt-2">
              In this course, we&apos;ll represent fractions visually.
            </p>
          </div>

          {/* White inner card with the two visuals */}
          <div className="bg-white rounded-[1.75rem] shadow-xl shadow-indigo-900/20 px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center">
              {renderShape(coloredRows)}
              {renderShape(coloredTenths)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------
// SINGLE PUZZLE COMPONENT
// -----------------------------------
const FractionShapePuzzle = ({ puzzle, stepIndex, isCompleted, onComplete }) => {
  const [filledIds, setFilledIds] = useState([]);
  const [feedback, setFeedback] = useState("idle"); // idle | low | high | correct
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setFeedback("correct");
    }
  }, [isCompleted]);

  const toggleRegion = (id) => {
    if (isCompleted) return;
    playSound("pop");
    setFilledIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setFeedback("idle");
  };

  const handleReset = () => {
    if (isCompleted) return;
    setFilledIds([]);
    setFeedback("idle");
  };

  const handleCheck = () => {
    const totalArea = puzzle.regions.reduce(
      (sum, r) => sum + r.w * r.h,
      0
    );
    const coloredArea = puzzle.regions
      .filter((r) => filledIds.includes(r.id))
      .reduce((sum, r) => sum + r.w * r.h, 0);

    const target = puzzle.targetFraction.num / puzzle.targetFraction.denom;
    const ratio = coloredArea / totalArea;
    const EPS = 0.001;

    if (Math.abs(ratio - target) < EPS) {
      playSound("win");
      setFeedback("correct");
      setShowConfetti(true);
      onComplete();
    } else {
      playSound("error");
      setFeedback(ratio < target ? "low" : "high");
    }
  };

  const renderShape = () => {
    const size = 260;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill="#fff"
          stroke="#111827"
          strokeWidth={3}
          rx={12}
          ry={12}
        />
        {puzzle.regions.map((r) => {
          const x = r.x * size;
          const y = r.y * size;
          const w = r.w * size;
          const h = r.h * size;
          const isFilled = filledIds.includes(r.id);
          const fillColor = isFilled ? "#60a5fa" : "#f9fafb";

          return (
            <g
              key={r.id}
              onClick={() => toggleRegion(r.id)}
              style={{ cursor: isCompleted ? "default" : "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={fillColor}
                stroke="#111827"
                strokeWidth={2}
                className="transition-colors duration-150"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const anySelected = filledIds.length > 0;

  const feedbackNode =
    feedback === "correct"
      ? {
          text: "Nice! You colored exactly half of the shape.",
          classes: "bg-green-50 text-green-700 border-green-200",
        }
      : feedback === "low"
      ? {
          text: "You colored less than half. Try adding a bit more.",
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        }
      : feedback === "high"
      ? {
          text: "You colored more than half. Try removing some.",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        }
      : null;

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        <div className="flex-1 space-y-4">
          <div
            className={`bg-white p-6 rounded-3xl border-2 shadow-sm transition-all duration-500 ${
              isCompleted
                ? "border-green-200 shadow-green-50"
                : "border-slate-100 shadow-slate-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Problem {stepIndex + 1}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {puzzle.title}
                </span>
              </div>
              <div
                className={`p-1.5 rounded-full ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={18} /> : <PaintBucket size={18} />}
              </div>
            </div>

            <div className="text-xl md:text-2xl font-medium text-slate-800 leading-snug mb-3">
              {puzzle.prompt}
            </div>

            <div className="flex gap-2 text-xs text-slate-500 items-start bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{puzzle.helper}</span>
            </div>

            {!isCompleted && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>

                  <button
                    onClick={handleCheck}
                    disabled={!anySelected}
                    className={`flex-1 px-4 py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                      anySelected
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    Check
                    {anySelected && <ArrowRight size={20} />}
                  </button>
                </div>

                {feedbackNode && (
                  <div
                    className={`text-sm p-3 rounded-2xl border ${feedbackNode.classes} flex gap-2 items-start`}
                  >
                    <HelpCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{feedbackNode.text}</span>
                  </div>
                )}
              </div>
            )}

            {isCompleted && (
              <div className="mt-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-2xl flex gap-2 items-center">
                <Trophy size={16} className="text-amber-500" />
                Great work! This one is done.
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white shadow-slate-200/60 mx-auto md:mx-0">
          {renderShape()}
          {showConfetti && <ConfettiBurst />}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------
// MAIN LESSON COMPONENT
// -----------------------------------
const FindingHalfLesson1 = () => {
  const [completedIds, setCompletedIds] = useState([]);
  const bottomRef = useRef(null);

  const handleComplete = (id) => {
    setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const activeCount = completedIds.length;
  const visiblePuzzles = PUZZLES.slice(0, activeCount + 1);

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 400);
    }
  }, [completedIds.length]);

  const totalProblems = PUZZLES.length;
  const solvedProblems = completedIds.length;
  const allDone = solvedProblems === totalProblems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-500 text-white p-2.5 rounded-xl shadow-lg shadow-sky-200">
              <PaintBucket size={22} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none">
                Finding Half
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Visual Fractions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
            <Trophy
              size={16}
              className={
                solvedProblems > 0
                  ? "text-amber-500 fill-amber-500 animate-bounce"
                  : "text-slate-300 fill-slate-300"
              }
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-700">
                {solvedProblems}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {totalProblems}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline feed */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visiblePuzzles.map((puzzle, index) => {
          const isLast = index === visiblePuzzles.length - 1;
          const isCompleted = completedIds.includes(puzzle.id);

          return (
            <div
              key={puzzle.id}
              className="relative animate-in slide-in-from-bottom-16 fade-in duration-700 fill-mode-backwards"
            >
              {/* Left indicator (desktop) */}
              <div className="hidden md:flex absolute -left-12 top-0 flex-col items-center h-full opacity-60 pointer-events-none">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                )}
              </div>

              <FractionShapePuzzle
                puzzle={puzzle}
                stepIndex={index}
                isCompleted={isCompleted}
                onComplete={() => handleComplete(puzzle.id)}
              />

              {!isLast && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full"></div>
              )}
              {isLast && <div ref={bottomRef} className="h-8" />}
            </div>
          );
        })}

        {/* tip at the very end */}
        {allDone && <HalfTipVisual />}
      </div>

      {/* animations styles */}
      <style>{`
        @keyframes particle-burst {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        .animate-particle-burst {
          animation: particle-burst 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FindingHalfLesson1;
