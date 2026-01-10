// MakingEquivalentFractionsLesson.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  RotateCcw,
  Check,
  Trophy,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

// --------------------------------------------------
// Sounds
// --------------------------------------------------
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/win.mp3",
  error: "/audio/matrix_intro.mp3",
  snap: "/audio/matrix_intro.mp3",
};

const playSound = (key) => {
  try {
    const audio = new Audio(SOUNDS[key]);
    if (key === "win") audio.volume = 0.6;
    else if (key === "snap") audio.volume = 0.2;
    else audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
};

// --------------------------------------------------
// Confetti
// --------------------------------------------------
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    color: ["#fbbf24", "#fb7185", "#22c55e", "#38bdf8", "#a855f7"][
      Math.floor(Math.random() * 5)
    ],
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
            backgroundColor: p.color,
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

// --------------------------------------------------
// SHAPES
// Uses Unique IDs for clipPaths to prevent visual bleeding
// --------------------------------------------------
const purple = "#a855f7";
const teal = "#2dd4bf";
const lineColor = "#0f172a";

// Helper hook for unique IDs
const useUniqueId = (prefix) => {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
};

const ThirdsStripShape = ({ size = 260 }) => {
  const s = size;
  const w = s / 3;
  const h = s / 2;
  const clipId = useUniqueId("clip-thirds-strip");

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${clipId})`}>
        {/* Fill */}
        <rect x={w} y={0} width={w} height={s} fill={purple} stroke="none" />
        
        {/* Lines */}
        <line x1={w} y1={0} x2={w} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={2 * w} y1={0} x2={2 * w} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={h} x2={s} y2={h} stroke={lineColor} strokeWidth={2} />
      </g>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="none" stroke={lineColor} strokeWidth={4} />
    </svg>
  );
};

const ThirdsTrianglesShape = ({ size = 260 }) => {
  const s = size;
  const w = s / 3;
  const h = s / 2;
  const clipId = useUniqueId("clip-thirds-tri");

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${clipId})`}>
        {/* Fills */}
        <rect x={w} y={0} width={w} height={h} fill={purple} stroke="none" />
        <rect x={w} y={h} width={w} height={h} fill={purple} stroke="none" />

        {/* Grid Lines */}
        <line x1={w} y1={0} x2={w} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={2 * w} y1={0} x2={2 * w} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={h} x2={s} y2={h} stroke={lineColor} strokeWidth={2} />

        {/* Diagonals */}
        <line x1={0}   y1={h}   x2={w}   y2={0}   stroke={lineColor} strokeWidth={1.5} />
        <line x1={w}   y1={0}   x2={2 * w} y2={h} stroke={lineColor} strokeWidth={1.5} />
        <line x1={2 * w} y1={h} x2={s}   y2={0}   stroke={lineColor} strokeWidth={1.5} />

        {/* bottom row */}
        <line x1={0}   y1={s}   x2={w}   y2={h}   stroke={lineColor} strokeWidth={1.5} />
        <line x1={w}   y1={h}   x2={2 * w} y2={s} stroke={lineColor} strokeWidth={1.5} />
        <line x1={2 * w} y1={s} x2={s}   y2={h}   stroke={lineColor} strokeWidth={1.5} />
      </g>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="none" stroke={lineColor} strokeWidth={4} />
    </svg>
  );
};

const HalfDiamondsShape = ({ size = 260 }) => {
  const s = size;
  const c = s / 2;
  const q = s / 4;
  const t = (3 * s) / 4;
  const clipId = useUniqueId("clip-diamonds");

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${clipId})`}>
        <path d={`M ${c},0 L ${s},${q} L ${c},${c} L 0,${q} Z`} fill={teal} stroke="none" />
        <path d={`M 0,${t} L ${c},${c} L ${s},${t} L ${c},${s} Z`} fill={teal} stroke="none" />

        <line x1={c} y1={0} x2={c} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={q} x2={s} y2={q} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={c} x2={s} y2={c} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={t} x2={s} y2={t} stroke={lineColor} strokeWidth={2} />
      </g>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="none" stroke={lineColor} strokeWidth={4} />
    </svg>
  );
};

const ThreeEighthsRectShape = ({ size = 260 }) => {
  const s = size;
  const cols = 2;
  const rows = 4;
  const cellW = s / cols;
  const cellH = s / rows;
  const clipId = useUniqueId("clip-38-rect");

  const filled = [[0, 0], [0, 1], [1, 0]];
  const isFilled = (r, c) => filled.some(([rr, cc]) => rr === r && cc === c);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) =>
            isFilled(r, c) ? (
              <rect key={`${r}-${c}`} x={c * cellW} y={r * cellH} width={cellW} height={cellH} fill={teal} stroke="none" />
            ) : null
          )
        )}
        <line x1={cellW} y1={0} x2={cellW} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={cellH} x2={s} y2={cellH} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={2 * cellH} x2={s} y2={2 * cellH} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={3 * cellH} x2={s} y2={3 * cellH} stroke={lineColor} strokeWidth={2} />
      </g>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="none" stroke={lineColor} strokeWidth={4} />
    </svg>
  );
};

const ThreeEighthsSplitShape = ({ size = 260 }) => {
  const s = size;
  const cols = 2;
  const rows = 4;
  const cellW = s / cols;
  const cellH = s / rows;
  const c = s / 2;
  const clipId = useUniqueId("clip-38-split");
  
  const filled = [[0, 0], [0, 1], [1, 0]];
  const isFilled = (r, c) => filled.some(([rr, cc]) => rr === r && cc === c);

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, cIdx) =>
            isFilled(r, cIdx) ? (
              <rect key={`${r}-${cIdx}`} x={cIdx * cellW} y={r * cellH} width={cellW} height={cellH} fill={teal} stroke="none" />
            ) : null
          )
        )}

        {/* Main Grid */}
        <line x1={cellW} y1={0} x2={cellW} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={cellH} x2={s} y2={cellH} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={2 * cellH} x2={s} y2={2 * cellH} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={3 * cellH} x2={s} y2={3 * cellH} stroke={lineColor} strokeWidth={2} />

        {/* Diagonal Splits */}
        <line x1={0} y1={cellH} x2={c} y2={0} stroke={lineColor} strokeWidth={1.5} />
        <line x1={s} y1={cellH} x2={c} y2={0} stroke={lineColor} strokeWidth={1.5} />
        <line x1={0} y1={2*cellH} x2={c} y2={cellH} stroke={lineColor} strokeWidth={1.5} />
        <line x1={s} y1={2*cellH} x2={c} y2={cellH} stroke={lineColor} strokeWidth={1.5} />
        <line x1={0} y1={2*cellH} x2={c} y2={3*cellH} stroke={lineColor} strokeWidth={1.5} />
        <line x1={s} y1={2*cellH} x2={c} y2={3*cellH} stroke={lineColor} strokeWidth={1.5} />
        <line x1={0} y1={s} x2={c} y2={3*cellH} stroke={lineColor} strokeWidth={1.5} />
        <line x1={s} y1={s} x2={c} y2={3*cellH} stroke={lineColor} strokeWidth={1.5} />
      </g>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="none" stroke={lineColor} strokeWidth={4} />
    </svg>
  );
};

const ShapeRenderer = ({ shape, size = 260 }) => {
  if (!shape) return null;
  switch (shape.kind) {
    case "thirdsStrip":
      return <ThirdsStripShape size={size} />;
    case "thirdsTriangles":
      return <ThirdsTrianglesShape size={size} />;
    case "halfDiamonds":
      return <HalfDiamondsShape size={size} />;
    case "threeEighthsRect":
      return <ThreeEighthsRectShape size={size} />;
    case "threeEighthsSplit":
      return <ThreeEighthsSplitShape size={size} />;
    default:
      return null;
  }
};

// --------------------------------------------------
// Fraction display helpers
// --------------------------------------------------
const InlineFraction = ({ num, den }) => (
  <span className="inline-flex flex-col items-center mx-1 text-lg md:text-xl align-middle font-bold text-slate-800">
    <span className="px-1 border-b-2 border-slate-900 leading-tight block">
      {num}
    </span>
    <span className="text-sm leading-tight block pt-0.5">{den}</span>
  </span>
);

const FractionEquality = ({ parts }) => (
  <div className="flex items-center gap-3">
    {parts.map((p, i) => (
      <React.Fragment key={i}>
        <InlineFraction num={p.num} den={p.den} />
        {i < parts.length - 1 && (
          <span className="text-lg md:text-xl font-bold">=</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

// --------------------------------------------------
// Drag and Drop Components
// --------------------------------------------------
const DraggableChoice = ({ value, isUsed }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", value.toString());
    e.dataTransfer.effectAllowed = "copy";
    playSound("pop");
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      className={`
        w-14 h-14 flex items-center justify-center rounded-xl border-b-4 text-xl font-black cursor-grab active:cursor-grabbing select-none transition-all duration-200
        ${
          isUsed
            ? "bg-slate-100 border-slate-200 text-slate-300 pointer-events-none"
            : "bg-white border-slate-200 text-slate-700 shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-md active:border-b-0 active:translate-y-1"
        }
      `}
    >
      {value}
    </div>
  );
};

const FractionDropZone = ({
  value,
  onDrop,
  placeholder,
  isCompleted,
  size = "lg",
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isCompleted) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (isCompleted) return;

    const droppedValue = e.dataTransfer.getData("text/plain");
    if (droppedValue) {
      onDrop(parseInt(droppedValue, 10));
      playSound("pop");
    }
  };

  const sizeClasses =
    size === "sm" ? "w-12 h-12 text-xl" : "w-16 h-16 text-3xl";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        ${sizeClasses}
        rounded-xl flex items-center justify-center font-black transition-all duration-200
        ${
          value !== null
            ? "bg-white border-2 border-slate-900 text-slate-900 shadow-sm"
            : "bg-slate-100 border-2 border-dashed border-slate-300 text-slate-300 shadow-inner"
        }
        ${isOver ? "scale-105 bg-sky-50 border-sky-400 text-sky-400" : ""}
      `}
    >
      {value !== null ? (
        value
      ) : (
        <span className="text-sm font-bold opacity-40">{placeholder}</span>
      )}
    </div>
  );
};

// --------------------------------------------------
// Steps config
// --------------------------------------------------
const STEPS = [
  {
    id: "thirds_2of6",
    label: "Step 1",
    title: "Making equivalent fractions",
    prompt: "Write a different fraction that is equal to 1/3.",
    helper:
      "Count all equal parts in the whole. Then count how many parts are purple.",
    correct: { num: 2, den: 6 },
    given: { num: 1, den: 3 },
    choices: [2, 4, 6, 8],
    shape: { kind: "thirdsStrip" },
    whyText:
      "The square is split into 6 equal rectangles. 2 of them are purple, so 2/6 is equal to 1/3.",
  },
  {
    id: "thirds_4of12",
    label: "Step 2",
    title: "Making equivalent fractions",
    prompt: "Write a different fraction that is equal to 1/3.",
    helper:
      "Now the same square is cut into 12 smaller pieces. How many of them are purple?",
    correct: { num: 4, den: 12 },
    given: { num: 1, den: 3 },
    choices: [3, 4, 9, 12],
    shape: { kind: "thirdsTriangles" },
    whyText:
      "There are 12 equal small pieces in the square. 4 of them are purple, so 4/12 is equal to 1/3.",
  },
  {
    id: "half_8of16",
    label: "Step 3",
    title: "Another example with 1/2",
    prompt: "Write a different fraction that is equal to 1/2.",
    helper:
      "Half of the shape is shaded. Count the total number of small pieces and how many are shaded.",
    correct: { num: 8, den: 16 },
    given: { num: 1, den: 2 },
    choices: [2, 8, 12, 16],
    shape: { kind: "halfDiamonds" },
    whyText:
      "The square is cut into 16 equal pieces. 8 of them are shaded, so 8/16 is equal to 1/2.",
  },
  {
    id: "half_factor_8",
    label: "Step 4",
    title: "Using multiplication for 1/2",
    prompt: "What can we multiply 1 and 2 by to make 8/16?",
    helper:
      "Think about what number you multiply 1 by to get 8, and 2 by to get 16.",
    correct: { factor: 8 },
    target: { num: 8, den: 16 },
    choices: [2, 4, 8, 16],
    shape: { kind: "halfDiamonds" },
    whyText:
      "To go from 1 to 8 and from 2 to 16, we multiply both by 8. Multiplying top and bottom by the same number keeps the fraction equal.",
  },
  {
    id: "threeEighths_build",
    label: "Step 5",
    title: "Make an equivalent fraction for 3/8",
    prompt: "Make a fraction that is equal to 3/8.",
    helper:
      "Use the same factor on the top and bottom, then write the new numerator and denominator.",
    correct: { factor: 2, num: 6, den: 16 },
    base: { num: 3, den: 8 },
    choices: [2, 6, 8, 16],
    shape: { kind: "threeEighthsSplit" },
    whyText:
      "Multiplying both 3 and 8 by 2 gives 6/16. So 3/8 and 6/16 are equivalent fractions.",
  },
];

// --------------------------------------------------
// Step components
// --------------------------------------------------
const FractionStep = ({ step, isCompleted, onComplete }) => {
  const [top, setTop] = useState(null);
  const [bottom, setBottom] = useState(null);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleReset = () => {
    if (isCompleted) return;
    setTop(null);
    setBottom(null);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (top === null || bottom === null) {
      setFeedback("incomplete");
      playSound("error");
      setShowConfetti(false);
      return;
    }

    if (top === step.correct.num && bottom === step.correct.den) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else {
      setFeedback("wrong");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Check size={20} className="shrink-0" />
          Nice! That fraction matches the picture.
        </div>
      );
    }
    if (feedback === "incomplete") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Drag numbers to both the top and bottom boxes.
        </div>
      );
    }
    if (feedback === "wrong") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Not quite. Check your count for the numerator and denominator.
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: instructions + controls */}
        <div className="flex-1 space-y-4 w-full">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-2 rounded-full transition-colors duration-500 ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={20} />
              </div>
            </div>

            <p className="text-lg text-slate-800 font-medium leading-relaxed mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500 mb-6">{step.helper}</p>

            <div className="space-y-4">
              {renderFeedback()}

              {/* Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-black text-base bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 transition-all active:scale-95"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 animate-in slide-in-from-top-2">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p className="leading-relaxed">{step.whyText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: picture + drop zones */}
        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 w-full lg:w-auto">
          {/* Visual Shape Container */}
          <div className="relative bg-white/80 p-6 rounded-[2.5rem] shadow-xl border-4 border-white shadow-slate-200 backdrop-blur-sm">
            <ShapeRenderer shape={step.shape} size={260} />
            {showConfetti && <ConfettiBurst />}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full justify-center">
            {/* Answer Area (Vertical Fraction) */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-3xl p-6 min-w-[160px] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                Answer
              </p>
              <div className="flex items-center gap-4">
                {step.given && (
                  <>
                    <div className="flex flex-col items-center opacity-60">
                      <span className="text-2xl font-black text-slate-800">
                        {step.given.num}
                      </span>
                      <div className="w-10 h-1 bg-slate-800 rounded-full my-1"></div>
                      <span className="text-2xl font-black text-slate-800">
                        {step.given.den}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-400">
                      =
                    </span>
                  </>
                )}
                <div className="flex flex-col items-center w-20">
                  <FractionDropZone
                    value={top}
                    onDrop={setTop}
                    placeholder="?"
                    isCompleted={isCompleted}
                  />
                  <div className="w-full h-1.5 bg-slate-900 rounded-full my-2"></div>
                  <FractionDropZone
                    value={bottom}
                    onDrop={setBottom}
                    placeholder="?"
                    isCompleted={isCompleted}
                  />
                </div>
              </div>
            </div>

            {/* Choices */}
            <div className="flex-1 bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 items-center justify-center border-2 border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Choices
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {step.choices.map((c) => (
                  <DraggableChoice
                    key={c}
                    value={c}
                    isUsed={c === top || c === bottom}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HalfFactorStep = ({ step, isCompleted, onComplete }) => {
  const [factor, setFactor] = useState(null);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleReset = () => {
    if (isCompleted) return;
    setFactor(null);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (factor === null) {
      setFeedback("incomplete");
      playSound("error");
      setShowConfetti(false);
      return;
    }

    if (factor === step.correct.factor) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else {
      setFeedback("wrong");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Check size={20} className="shrink-0" />
          Yes! Multiplying by {step.correct.factor} makes 8/16.
        </div>
      );
    }
    if (feedback === "incomplete") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Drag a number into the boxes to show the factor.
        </div>
      );
    }
    if (feedback === "wrong") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Try again. Think about how to get from 1 to 8 and 2 to 16.
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: instructions + controls */}
        <div className="flex-1 space-y-4 w-full">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-2 rounded-full transition-colors duration-500 ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={20} />
              </div>
            </div>

            <p className="text-lg text-slate-800 font-medium leading-relaxed mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500 mb-6">{step.helper}</p>

            <div className="space-y-4">
              {renderFeedback()}

              {/* Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-black text-base bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 transition-all active:scale-95"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 animate-in slide-in-from-top-2">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p className="leading-relaxed">{step.whyText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: picture + factor layout */}
        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 w-full lg:w-auto">
          <div className="relative bg-white/80 p-6 rounded-[2.5rem] shadow-xl border-4 border-white shadow-slate-200 backdrop-blur-sm">
            <ShapeRenderer shape={step.shape} size={260} />
            {showConfetti && <ConfettiBurst />}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full justify-center">
            {/* Answer Area */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-3xl p-6 min-w-[220px] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                Multiply 1/2
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-800">
                      1 ×
                    </span>
                    <FractionDropZone
                      value={factor}
                      onDrop={setFactor}
                      placeholder="?"
                      isCompleted={isCompleted}
                      size="sm"
                    />
                  </div>
                  <div className="w-16 h-1 bg-slate-900 rounded-full my-2"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-800">
                      2 ×
                    </span>
                    <FractionDropZone
                      value={factor}
                      onDrop={setFactor}
                      placeholder="?"
                      isCompleted={isCompleted}
                      size="sm"
                    />
                  </div>
                </div>

                <span className="text-2xl font-black text-slate-700">=</span>

                <InlineFraction
                  num={step.target.num}
                  den={step.target.den}
                />
              </div>
            </div>

            {/* Choices */}
            <div className="flex-1 bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 items-center justify-center border-2 border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Choices
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {step.choices.map((c) => (
                  <DraggableChoice key={c} value={c} isUsed={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreeEighthsStep = ({ step, isCompleted, onComplete }) => {
  const [factorTop, setFactorTop] = useState(null);
  const [factorBottom, setFactorBottom] = useState(null);
  const [numResult, setNumResult] = useState(null);
  const [denResult, setDenResult] = useState(null);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleReset = () => {
    if (isCompleted) return;
    setFactorTop(null);
    setFactorBottom(null);
    setNumResult(null);
    setDenResult(null);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (
      factorTop === null ||
      factorBottom === null ||
      numResult === null ||
      denResult === null
    ) {
      setFeedback("incomplete");
      playSound("error");
      setShowConfetti(false);
      return;
    }

    if (
      factorTop === step.correct.factor &&
      factorBottom === step.correct.factor &&
      numResult === step.correct.num &&
      denResult === step.correct.den
    ) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else {
      setFeedback("wrong");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Check size={20} className="shrink-0" />
          Great! You made an equivalent fraction to 3/8.
        </div>
      );
    }
    if (feedback === "incomplete") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Fill in all four boxes to show the factor and the new fraction.
        </div>
      );
    }
    if (feedback === "wrong") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Info size={20} className="shrink-0" />
          Not quite. Remember to use the same factor on the top and the bottom.
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: instructions + controls */}
        <div className="flex-1 space-y-4 w-full">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-2 rounded-full transition-colors duration-500 ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={20} />
              </div>
            </div>

            <p className="text-lg text-slate-800 font-medium leading-relaxed mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500 mb-6">{step.helper}</p>

            <div className="space-y-4">
              {renderFeedback()}

              {/* Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-black text-base bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 transition-all active:scale-95"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 animate-in slide-in-from-top-2">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p className="leading-relaxed">{step.whyText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: picture + advanced layout */}
        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 w-full lg:w-auto">
          <div className="relative bg-white/80 p-6 rounded-[2.5rem] shadow-xl border-4 border-white shadow-slate-200 backdrop-blur-sm">
            <ShapeRenderer shape={step.shape} size={260} />
            {showConfetti && <ConfettiBurst />}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full justify-center">
            {/* Answer Area */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-3xl p-6 min-w-[260px] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                Build an equivalent fraction
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-800">
                      3 ×
                    </span>
                    <FractionDropZone
                      value={factorTop}
                      onDrop={setFactorTop}
                      placeholder="?"
                      isCompleted={isCompleted}
                      size="sm"
                    />
                  </div>
                  <div className="w-20 h-1 bg-slate-900 rounded-full my-2"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-800">
                      8 ×
                    </span>
                    <FractionDropZone
                      value={factorBottom}
                      onDrop={setFactorBottom}
                      placeholder="?"
                      isCompleted={isCompleted}
                      size="sm"
                    />
                  </div>
                </div>

                <span className="text-2xl font-black text-slate-700">=</span>

                <div className="flex flex-col items-center">
                  <FractionDropZone
                    value={numResult}
                    onDrop={setNumResult}
                    placeholder="?"
                    isCompleted={isCompleted}
                    size="sm"
                  />
                  <div className="w-20 h-1 bg-slate-900 rounded-full my-2"></div>
                  <FractionDropZone
                    value={denResult}
                    onDrop={setDenResult}
                    placeholder="?"
                    isCompleted={isCompleted}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Choices */}
            <div className="flex-1 bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 items-center justify-center border-2 border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Choices
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {step.choices.map((c) => (
                  <DraggableChoice key={c} value={c} isUsed={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Tip cards
// --------------------------------------------------
const ThirdsTipCard = ({ onContinue, hasContinued }) => (
  <div className="max-w-4xl mx-auto mt-6">
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col items-center gap-8">
      <div className="text-center space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          Same amount, more pieces
        </h3>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl">
          If we have <span className="font-bold">4 times as many</span> equal
          parts, we need to color <span className="font-bold">4 times as many</span>{" "}
          pieces to keep the same fraction of the square.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        <ShapeRenderer shape={{ kind: "thirdsStrip" }} size={160} />
        <ShapeRenderer shape={{ kind: "thirdsTriangles" }} size={160} />
      </div>

      <div className="flex justify-center text-slate-900">
        <FractionEquality
          parts={[
            { num: <>1 × 4</>, den: <>3 × 4</> },
            { num: 4, den: 12 },
          ]}
        />
      </div>

      {/* Continue Button */}
      {!hasContinued && (
        <div className="pt-2">
          <button
            onClick={onContinue}
            className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-105 transition-all duration-300"
          >
            Continue to next Question
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  </div>
);

const EquivalentFractionsTipCard = () => (
  <div className="max-w-4xl mx-auto mt-6">
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          Multiplying makes equivalent fractions
        </h3>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl">
          Multiplying both the top and bottom of a fraction by the{" "}
          <span className="font-bold">same factor</span> makes an{" "}
          <span className="font-bold">equivalent fraction</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        <ThreeEighthsRectShape size={160} />
        <ThreeEighthsSplitShape size={160} />
      </div>

      <div className="flex justify-center text-slate-900">
        <FractionEquality
          parts={[
            { num: <>3 × 2</>, den: <>8 × 2</> },
            { num: 6, den: 16 },
          ]}
        />
      </div>
    </div>
  </div>
);

// --------------------------------------------------
// Main lesson
// --------------------------------------------------
const MakingEquivalentFractionsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasContinuedFromTip, setHasContinuedFromTip] = useState(false);
  const bottomRef = useRef(null);

  // Steps logic:
  // Show steps 1 & 2.
  // Pause for tip.
  // Then show steps 3, 4, 5.
  const step2Id = "thirds_4of12";
  const showMidTip = completedSteps.includes(step2Id);

  let visibleLimit = completedSteps.length + 1;
  if (showMidTip && !hasContinuedFromTip) {
      // Find index of step 2
      const step2Index = STEPS.findIndex(s => s.id === step2Id);
      // Show up to step 2 (index + 1 = 2 items), but don't show step 3 yet.
      visibleLimit = step2Index + 1;
  }

  const visibleSteps = STEPS.slice(0, visibleLimit);
  const allDone = completedSteps.length === STEPS.length;

  const handleStepComplete = (stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  };

  const handleContinue = () => {
    setHasContinuedFromTip(true);
    playSound("pop");
  };

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 400);
    }
  }, [completedSteps.length, hasContinuedFromTip]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white p-2.5 rounded-xl shadow-lg shadow-violet-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Making Equivalent Fractions
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
                completedSteps.length > 0
                  ? "text-amber-500 fill-amber-500 animate-bounce"
                  : "text-slate-300 fill-slate-300"
              }
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-700">
                {completedSteps.length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {STEPS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-10 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          const isStep2 = step.id === step2Id;

          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              {/* timeline */}
              <div className="hidden lg:flex absolute -left-12 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    completedSteps.includes(step.id)
                      ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2 rounded-full" />
                )}
              </div>

              {step.id === "half_factor_8" ? (
                <HalfFactorStep
                  step={step}
                  isCompleted={completedSteps.includes(step.id)}
                  onComplete={() => handleStepComplete(step.id)}
                />
              ) : step.id === "threeEighths_build" ? (
                <ThreeEighthsStep
                  step={step}
                  isCompleted={completedSteps.includes(step.id)}
                  onComplete={() => handleStepComplete(step.id)}
                />
              ) : (
                <FractionStep
                  step={step}
                  isCompleted={completedSteps.includes(step.id)}
                  onComplete={() => handleStepComplete(step.id)}
                />
              )}

              {/* Tip after step 2 */}
              {isStep2 && showMidTip && (
                <div className="mt-6 animate-in fade-in zoom-in duration-500">
                  <ThirdsTipCard 
                    onContinue={handleContinue} 
                    hasContinued={hasContinuedFromTip}
                  />
                </div>
              )}

              {!isLast && (
                <div className="lg:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full" />
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}

        {/* Final Tip */}
        {allDone && <EquivalentFractionsTipCard />}
      </div>

      <style>{`
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        .animate-particle-burst {
          animation: particle-burst 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MakingEquivalentFractionsLesson;