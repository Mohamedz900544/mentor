// SplittingAndCombiningLesson.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HelpCircle,
  RotateCcw,
  Check,
  Trophy,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
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
    color: ["#f97316", "#facc15", "#fb7185", "#a855f7", "#22c55e"][
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
// Geometry (normalized 0–1)
// --------------------------------------------------
const BASE_POINTS = {
  p0: [0, 0],
  p1: [0.5, 0],
  p2: [1, 0],
  p3: [0, 0.5],
  p4: [0.5, 0.5],
  p5: [1, 0.5],
  p6: [0, 1],
  p7: [0.5, 1],
  p8: [1, 1],
  p9: [0.75, 0.5],
  p10: [0.75, 0.75],
  p11: [0.5, 0.75],
  p12: [1, 0.75],
  p13: [0.25, 0.75],
  p14: [0.75, 1],
};

// pieces with “units” that sum to 16
const BASE_PIECES = [
  { id: "tl_big_1", units: 2, points: [BASE_POINTS.p0, BASE_POINTS.p1, BASE_POINTS.p3] },
  { id: "tl_big_2", units: 2, points: [BASE_POINTS.p1, BASE_POINTS.p4, BASE_POINTS.p3] },
  { id: "top_right_rect", units: 4, points: [BASE_POINTS.p1, BASE_POINTS.p2, BASE_POINTS.p5, BASE_POINTS.p4] },
  { id: "bl_quad", units: 2, points: [BASE_POINTS.p3, BASE_POINTS.p4, BASE_POINTS.p7, BASE_POINTS.p13] },
  { id: "bl_small_tri", units: 1, points: [BASE_POINTS.p3, BASE_POINTS.p13, BASE_POINTS.p6] },
  { id: "bl_big_tri", units: 1, points: [BASE_POINTS.p13, BASE_POINTS.p7, BASE_POINTS.p6] },
  { id: "br_tl_rect", units: 1, points: [BASE_POINTS.p4, BASE_POINTS.p9, BASE_POINTS.p10, BASE_POINTS.p11] },
  { id: "br_tr_rect", units: 1, points: [BASE_POINTS.p9, BASE_POINTS.p5, BASE_POINTS.p12, BASE_POINTS.p10] },
  { id: "br_bl_rect", units: 1, points: [BASE_POINTS.p11, BASE_POINTS.p10, BASE_POINTS.p14, BASE_POINTS.p7] },
  { id: "br_br_rect", units: 1, points: [BASE_POINTS.p10, BASE_POINTS.p12, BASE_POINTS.p8, BASE_POINTS.p14] },
];

const TOTAL_UNITS = BASE_PIECES.reduce((s, p) => s + p.units, 0); // 16

const scalePoint = ([x, y], size) => [x * size, y * size];

const buildPieces = (size) =>
  BASE_PIECES.map((p) => ({
    ...p,
    points: p.points.map((pt) => scalePoint(pt, size)),
  }));

// --------------------------------------------------
// SVG shape component
// --------------------------------------------------
const SplittingCombiningShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const pieces = useMemo(() => buildPieces(size), [size]);
  const isSelected = (id) => selectedIds.includes(id);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  const mid = size * 0.5;
  const mid2 = size * 0.75;
  const smallX = size * 0.25;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {/* fill pieces */}
      {pieces.map((p) => {
        const selected = isSelected(p.id);
        const pointsStr = p.points.map(([x, y]) => `${x},${y}`).join(" ");
        return (
          <polygon
            key={p.id}
            points={pointsStr}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline + grid (no pointer events) */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={12}
        ry={12}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />
      <line
        x1={mid}
        y1={0}
        x2={mid}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={mid}
        x2={size}
        y2={mid}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={mid2}
        y1={mid}
        x2={mid2}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={mid}
        y1={mid2}
        x2={size}
        y2={mid2}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={mid}
        x2={mid}
        y2={0}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={mid}
        x2={mid}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={size}
        x2={smallX}
        y2={mid2}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
    </svg>
  );
};

// --------------------------------------------------
// Fraction tracker card 0/16 style
// --------------------------------------------------
const FractionTrackerCard = ({ selectedUnits }) => {
  return (
    <div className="mt-4 max-w-xs w-full">
      <div className="bg-pink-50 border border-pink-200 rounded-3xl px-6 py-4 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center leading-tight text-pink-700">
          <span className="text-2xl font-black">{selectedUnits}</span>
          <span className="border-t-2 border-pink-400 px-6 mt-1 text-lg font-bold">
            16
          </span>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Steps + answers
// --------------------------------------------------
const STEPS = [
  {
    id: "eighth_1",
    label: "Step 1",
    title: "Splitting and Combining",
    prompt: "Color 1/8 of the shape.",
    target: { num: 1, den: 8 },
    stage: "eighths",
    helper:
      "The shape is built out of 16 equal pieces. 1/8 is the same as 2/16, so you need to color 2 of the pieces.",
  },
  {
    id: "eighth_4",
    label: "Step 2",
    title: "Splitting and Combining",
    prompt: "Color 4/8 of the shape.",
    target: { num: 4, den: 8 },
    stage: "eighths",
    helper:
      "4/8 is the same as 1/2 of the shape. That means 8 of the 16 equal pieces.",
  },
  {
    id: "sixteenth_3",
    label: "Step 3",
    title: "Let’s color some sixteenths.",
    prompt: "Color 3/16 of the shape.",
    target: { num: 3, den: 16 },
    stage: "sixteenths",
    helper:
      "Now every single piece counts as 1/16. Start by coloring any 3 pieces.",
  },
  {
    id: "sixteenth_5",
    label: "Step 4",
    title: "Let’s color some sixteenths.",
    prompt: "Color 5/16 of the shape.",
    target: { num: 5, den: 16 },
    stage: "sixteenths",
    helper: "To make 5/16, color 5 of the equal pieces.",
  },
  {
    id: "sixteenth_7",
    label: "Step 5",
    title: "Let’s color some sixteenths.",
    prompt: "Color 7/16 of the shape.",
    target: { num: 7, den: 16 },
    stage: "sixteenths",
    helper: "7/16 is just 7 of the equal pieces. You can choose any 7.",
  },
];

// حلول جاهزة لزرار See the answer
const STEP_ANSWERS = {
  // 1/8 = 2/16
  eighth_1: ["tl_big_1"],
  // 4/8 = 8/16 (نلوّن النصف الأيسر كله)
  eighth_4: ["tl_big_1", "tl_big_2", "bl_quad", "bl_small_tri", "bl_big_tri"],
  // 3/16
  sixteenth_3: ["bl_small_tri", "br_bl_rect", "br_br_rect"],
  // 5/16
  sixteenth_5: ["tl_big_1", "bl_small_tri", "br_bl_rect", "br_br_rect"],
  // 7/16
  sixteenth_7: [
    "tl_big_1",
    "tl_big_2",
    "bl_small_tri",
    "br_bl_rect",
    "br_br_rect",
  ],
};

// --------------------------------------------------
// Single step
// --------------------------------------------------
const SplittingCombiningStep = ({ step, isCompleted, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const unitsMap = useMemo(() => {
    const m = new Map();
    BASE_PIECES.forEach((p) => m.set(p.id, p.units));
    return m;
  }, []);

  const selectedUnits = useMemo(
    () => selectedIds.reduce((s, id) => s + (unitsMap.get(id) || 0), 0),
    [selectedIds, unitsMap]
  );

  const targetFraction = step.target.num / step.target.den;
  const currentFraction = selectedUnits / TOTAL_UNITS;

  const handleTogglePiece = (id) => {
    if (isCompleted) return;
    playSound("pop");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setFeedback("idle");
    setShowConfetti(false);
  };

  const handleReset = () => {
    if (isCompleted) return;
    setSelectedIds([]);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (Math.abs(currentFraction - targetFraction) < 1e-6) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else if (currentFraction < targetFraction) {
      setFeedback("low");
      playSound("error");
      setShowConfetti(false);
    } else {
      setFeedback("high");
      playSound("error");
      setShowConfetti(false);
    }
  };

  const handleShowAnswer = () => {
    const answerIds = STEP_ANSWERS[step.id];
    if (!answerIds) return;
    setSelectedIds(answerIds);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-green-100">
          <Check size={18} className="shrink-0" />
          Nice! You colored exactly {step.target.num}/{step.target.den} of the
          shape.
        </div>
      );
    }
    if (feedback === "low") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-amber-100">
          <Info size={18} className="shrink-0" />
          You colored less than {step.target.num}/{step.target.den}. Try
          coloring a bit more.
        </div>
      );
    }
    if (feedback === "high") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
          <Info size={18} className="shrink-0" />
          You colored more than {step.target.num}/{step.target.den}. Try
          un-coloring some pieces.
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
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* LEFT: instructions */}
        <div className="flex-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-1.5 rounded-full ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={18} />
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-800 mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500">{step.helper}</p>

            <div className="mt-5 space-y-3">
              {renderFeedback()}

              {/* controls row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Check */}
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-5 py-3 rounded-2xl font-black text-sm md:text-base bg-slate-900 text-white shadow-lg shadow-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                {/* Why */}
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-4 py-3 rounded-full text-sm font-semibold shadow-sm border border-slate-200 transition-all"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </button>

                {/* See answer */}
                <button
                  type="button"
                  onClick={handleShowAnswer}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 active:scale-95 transition-all"
                >
                  See the answer
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p>
                    The whole shape is made from 16 equal pieces. The fraction
                    tells you how many of those pieces to color. For example,{" "}
                    <span className="font-semibold">
                      {step.target.num}/{step.target.den}
                    </span>{" "}
                    means color{" "}
                    <span className="font-semibold">
                      {step.target.num}/{step.target.den} of the total area
                    </span>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: shape + fraction card */}
        <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
          <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white shadow-slate-200/60">
            <SplittingCombiningShape
              selectedIds={selectedIds}
              onToggle={handleTogglePiece}
              readOnly={isCompleted}
              size={320}
            />
            {showConfetti && <ConfettiBurst />}
          </div>

          {step.stage === "sixteenths" && (
            <FractionTrackerCard selectedUnits={selectedUnits} />
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Final tip card (pink pieces 1/16)
// --------------------------------------------------
const FinalTipCard = () => {
  const pinkPieces = ["bl_small_tri", "br_bl_rect"];

  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-3">
          <h3 className="text-lg md:text-xl font-semibold text-slate-900">
            To make fractions, it matters that shapes are chopped into
            equal-sized pieces. But it doesn&apos;t matter{" "}
            <span className="italic">how</span>.
          </h3>
          <p className="text-sm md:text-base text-slate-600">
            These two pink pieces look different, but each one is exactly{" "}
            <span className="font-semibold">1/16</span> of the whole shape. As
            long as the pieces are equal in area, we can use them to represent
            fractions.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[1.5rem] p-4 shadow-inner border border-slate-200">
          <SplittingCombiningShape
            selectedIds={pinkPieces}
            readOnly
            size={260}
            highlightColor="#f9a8d4"
          />
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-slate-600">
        The pink pieces are each{" "}
        <span className="font-semibold">1/16</span> of the shape.
      </p>
    </div>
  );
};

// --------------------------------------------------
// Main lesson component
// --------------------------------------------------
const SplittingAndCombiningLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);

  const activeStepIndex = completedSteps.length;
  const visibleSteps = STEPS.slice(0, activeStepIndex + 1);
  const allDone = completedSteps.length === STEPS.length;

  const handleStepComplete = (stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
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
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-sky-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Splitting and Combining
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
                  ? "text-sky-500 fill-sky-500 animate-bounce"
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

      {/* Steps timeline */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              {/* timeline dots desktop */}
              <div className="hidden md:flex absolute -left-10 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    completedSteps.includes(step.id)
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                )}
              </div>

              <SplittingCombiningStep
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

              {!isLast && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full" />
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}

        {allDone && <FinalTipCard />}
      </div>

      {/* local animations */}
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

export default SplittingAndCombiningLesson;
