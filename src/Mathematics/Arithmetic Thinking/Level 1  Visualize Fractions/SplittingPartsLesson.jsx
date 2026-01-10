// SplittingPartsLesson.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HelpCircle,
  RotateCcw,
  Check,
  Trophy,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from "lucide-react";

// ----------------------------
// Simple sound system
// ----------------------------
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

// ----------------------------
// Helper: pieces for each stage
// stage "sixths"  : 1 big left + 4 small rectangles
// stage "twelfths": same but right column split إلى 4 مثلثات
// ----------------------------
const getPiecesForStage = (stage, size) => {
  const cw = size / 3; // column width
  const ch = size / 2; // row height

  if (stage === "sixths") {
    // وحدة القياس هنا = 1/6
    return [
      {
        id: "left",
        type: "rect",
        x: 0,
        y: 0,
        w: cw,
        h: size,
        units: 2, // يمثل 2/6
      },
      {
        id: "midTop",
        type: "rect",
        x: cw,
        y: 0,
        w: cw,
        h: ch,
        units: 1,
      },
      {
        id: "midBot",
        type: "rect",
        x: cw,
        y: ch,
        w: cw,
        h: ch,
        units: 1,
      },
      {
        id: "rightTop",
        type: "rect",
        x: 2 * cw,
        y: 0,
        w: cw,
        h: ch,
        units: 1,
      },
      {
        id: "rightBot",
        type: "rect",
        x: 2 * cw,
        y: ch,
        w: cw,
        h: ch,
        units: 1,
      },
    ];
  }

  // stage: "twelfths"
  const x0 = 2 * cw;
  const x1 = size;
  const y0 = 0;
  const y1 = ch;
  const y2 = size;

  // وحدة القياس هنا = 1/12
  return [
    {
      id: "left",
      type: "rect",
      x: 0,
      y: 0,
      w: cw,
      h: size,
      units: 4, // 4/12
    },
    {
      id: "midTop",
      type: "rect",
      x: cw,
      y: 0,
      w: cw,
      h: ch,
      units: 2, // 2/12
    },
    {
      id: "midBot",
      type: "rect",
      x: cw,
      y: ch,
      w: cw,
      h: ch,
      units: 2, // 2/12
    },
    // أربعة مثلثات في العمود اليمين، كل واحد = 1/12
    {
      id: "rtTopA",
      type: "tri",
      points: [
        [x0, y0],
        [x1, y0],
        [x1, y1],
      ],
      units: 1,
    },
    {
      id: "rtTopB",
      type: "tri",
      points: [
        [x0, y0],
        [x0, y1],
        [x1, y1],
      ],
      units: 1,
    },
    {
      id: "rtBotA",
      type: "tri",
      points: [
        [x0, y1],
        [x1, y1],
        [x0, y2],
      ],
      units: 1,
    },
    {
      id: "rtBotB",
      type: "tri",
      points: [
        [x1, y1],
        [x1, y2],
        [x0, y2],
      ],
      units: 1,
    },
  ];
};

// ----------------------------
// Interactive shape
// ----------------------------
const SplittingShape = ({
  stage,
  pieces,
  selectedIds,
  onToggle,
  readOnly = false,
  size = 260,
}) => {
  const cw = size / 3;
  const ch = size / 2;
  const isSelected = (id) => selectedIds.includes(id);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  const fillColor = "#2dd4bf"; // لون القطع الملوّنة

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {/* القطع (مستطيلات + مثلثات) */}
      {pieces.map((p) => {
        const selected = isSelected(p.id);
        const common = {
          onClick: () => handleClick(p.id),
          style: {
            cursor: readOnly ? "default" : "pointer",
            transition: "fill 150ms ease-out",
          },
          fill: selected ? fillColor : "#ffffff",
          stroke: "transparent",
        };

        if (p.type === "rect") {
          return (
            <rect
              key={p.id}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              {...common}
            />
          );
        }

        if (p.type === "tri") {
          const pts = p.points.map(([x, y]) => `${x},${y}`).join(" ");
          return <polygon key={p.id} points={pts} {...common} />;
        }

        return null;
      })}

      {/* خطوط الشبكة الرأسية (3 أعمدة) */}
      <line
        x1={cw}
        y1={0}
        x2={cw}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={2 * cw}
        y1={0}
        x2={2 * cw}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />

      {/* الخط الأفقي في النص */}
      <line
        x1={stage === "sixths" ? cw : 0}
        y1={ch}
        x2={size}
        y2={ch}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />

      {/* 👇 هنا الإضافة الجديدة: خطوط الأقطار لما يكون في مثلثات */}
      {stage === "twelfths" && (
        <>
          <line
            x1={2 * cw}
            y1={0}
            x2={size}
            y2={ch}
            stroke="#111827"
            strokeWidth={2}
            pointerEvents="none"
          />
          <line
            x1={2 * cw}
            y1={size}
            x2={size}
            y2={ch}
            stroke="#111827"
            strokeWidth={2}
            pointerEvents="none"
          />
        </>
      )}

      {/* الإطار الخارجي */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        rx={0}
        ry={0}
        pointerEvents="none"
      />
    </svg>
  );
};

// ----------------------------
// Final explanation card 7/12
// ----------------------------
// استبدل الكومبوننت القديمة دي بالكامل بنفس الاسم
const SplitTwelfthsTip = () => {
  const size = 130;
  const piecesLeft = getPiecesForStage("twelfths", size);

  // نلوّن 7/12 على الشكل الأصلي:
  // 4 وحدات في العمود الأوسط (2 + 2) + 3 مثلثات
  const selectedLeft = ["midTop", "midBot", "rtTopA", "rtTopB", "rtBotA"];

  // --- نبني شكل 12 مثلث متساويين (3 أعمدة × صفين) ---
  const buildAllTriangles = () => {
    const tris = [];
    const cw = size / 3;
    const ch = size / 2;

    for (let col = 0; col < 3; col++) {
      const x0 = col * cw;
      const x1 = (col + 1) * cw;

      // صف علوي
      tris.push(
        {
          id: `t${col}a`,
          points: [
            [x0, 0],
            [x1, 0],
            [x1, ch],
          ],
        },
        {
          id: `t${col}b`,
          points: [
            [x0, 0],
            [x0, ch],
            [x1, ch],
          ],
        }
      );

      // صف سفلي
      tris.push(
        {
          id: `t${col}c`,
          points: [
            [x0, ch],
            [x1, ch],
            [x0, size],
          ],
        },
        {
          id: `t${col}d`,
          points: [
            [x1, ch],
            [x1, size],
            [x0, size],
          ],
        }
      );
    }

    return tris;
  };

  const tris = buildAllTriangles();
  const teal = "#2dd4bf";

  // أي 7 مثلثات لتمثيل 7/12
  const selectedRightIds = tris.slice(0, 7).map((t) => t.id);

  return (
    <div className="mt-10 mb-4">
      <div className="relative rounded-[2rem] bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-400 text-white shadow-2xl px-6 py-8 md:px-10 md:py-10 overflow-hidden">
        {/* لمسات إضاءة خفيفة */}
        <div className="pointer-events-none absolute -top-10 -left-16 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />

        {/* الرأس */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 shadow-lg shadow-teal-900/20">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Splitting into Twelfths
          </h2>
          <p className="mt-2 text-sm md:text-base text-teal-50/90 max-w-xl">
            When we split pieces into twelfths,{" "}
            <span className="font-semibold">7/12</span> means{" "}
            <span className="font-semibold">7 of 12 equal parts</span>. Both
            drawings below show the same amount of the shape.
          </p>
        </div>

        {/* المحتوى */}
        <div className="mt-4 flex flex-wrap gap-6 md:gap-10 justify-center items-center">
          {/* الشكل الأصلي */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-3">
            <SplittingShape
              stage="twelfths"
              pieces={piecesLeft}
              selectedIds={selectedLeft}
              onToggle={null}
              readOnly
              size={size}
            />
          </div>

          {/* شكل 12 مثلث متساوي */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-3">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible"
            >
              {tris.map((t) => {
                const points = t.points
                  .map(([x, y]) => `${x},${y}`)
                  .join(" ");
                const selected = selectedRightIds.includes(t.id);
                return (
                  <polygon
                    key={t.id}
                    points={points}
                    fill={selected ? teal : "#ffffff"}
                    stroke="#111827"
                    strokeWidth={1}
                  />
                );
              })}

              <rect
                x={0}
                y={0}
                width={size}
                height={size}
                fill="none"
                stroke="#111827"
                strokeWidth={3}
                rx={0}
                ry={0}
              />
            </svg>
          </div>
        </div>

        {/* جملة ختامية */}
        <p className="mt-6 text-xs md:text-sm text-teal-50/90 text-center">
          By splitting and rearranging equal-sized pieces, we can see that{" "}
          <span className="font-semibold">7/12</span> of the shape is exactly{" "}
          <span className="font-semibold">7 of 12 equal parts</span>.
        </p>
      </div>
    </div>
  );
};

// ----------------------------
// Steps definition
// ----------------------------
const SPLITTING_STEPS = [
  {
    id: "s1",
    title: "Splitting Parts",
    label: "Step 1",
    prompt: "Color 1/6 of the shape.",
    stage: "sixths",
    target: { num: 1, den: 6, units: 1 }, // وحدة = 1/6
    helper:
      "Each small rectangle on the right is 1/6 of the shape. Shade exactly one of them.",
  },
  {
    id: "s2",
    title: "Splitting Parts",
    label: "Step 2",
    prompt: "Color 5/6 of the shape.",
    stage: "sixths",
    target: { num: 5, den: 6, units: 5 },
    helper:
      "5/6 means five of those sixth-sized pieces. Leave just one sixth uncolored.",
  },
  {
    id: "s3",
    title: "Splitting More",
    label: "Step 3",
    prompt: "Color 1/12 of the shape.",
    stage: "twelfths",
    target: { num: 1, den: 12, units: 1 },
    helper:
      "When we split the right column in half, each small triangle is 1/12 of the shape.",
  },
  {
    id: "s4",
    title: "Splitting More",
    label: "Step 4",
    prompt: "Color 5/12 of the shape.",
    stage: "twelfths",
    target: { num: 5, den: 12, units: 5 },
    helper:
      "5/12 means five of those twelfth-sized pieces. Mix rectangles and triangles to make 5/12.",
  },
];

// ----------------------------
// Single step
// ----------------------------
const SplittingStep = ({ step, isCompleted, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("idle"); // idle | low | high | correct
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const size = 260;
  const pieces = useMemo(
    () => getPiecesForStage(step.stage, size),
    [step.stage]
  );

  const unitsSelected = useMemo(
    () =>
      selectedIds.reduce((sum, id) => {
        const p = pieces.find((pp) => pp.id === id);
        return sum + (p ? p.units : 0);
      }, 0),
    [selectedIds, pieces]
  );

  const handleCheck = () => {
    if (unitsSelected === step.target.units) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else if (unitsSelected < step.target.units) {
      setFeedback("low");
      setShowConfetti(false);
      playSound("error");
    } else {
      setFeedback("high");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const togglePiece = (id) => {
    playSound("pop");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setFeedback("idle");
    setShowConfetti(false);
  };

  const handleReset = () => {
    setSelectedIds([]);
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
          You colored less than {step.target.num}/{step.target.den}. Try adding
          more pieces.
        </div>
      );
    }
    if (feedback === "high") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
          <Info size={18} className="shrink-0" />
          You colored more than {step.target.num}/{step.target.den}. Try
          removing some pieces.
        </div>
      );
    }
    return null;
  };

  const renderWhyContent = () => {
    if (!showWhy) return null;
    return (
      <div className="mt-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
        <Info size={18} className="mt-0.5 text-slate-400 shrink-0" />
        <p>{step.helper}</p>
      </div>
    );
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* LEFT: instructions + buttons */}
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
                    ? "bg-emerald-100 text-emerald-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={18} />
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-800 mb-3">
              {step.prompt}
            </p>

            <p className="text-sm text-slate-500">{step.helper}</p>

            <div className="mt-5 space-y-3">
              {renderFeedback()}

              <div className="flex flex-wrap gap-3 items-center">
                {/* Check أول زرار */}
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

              {renderWhyContent()}
            </div>
          </div>
        </div>

        {/* RIGHT: الشكل */}
        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 mx-auto md:mx-0 border-white shadow-slate-200/60">
          <SplittingShape
            stage={step.stage}
            pieces={pieces}
            selectedIds={selectedIds}
            onToggle={togglePiece}
          />
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* ممكن تضيف ConfettiBurst لو حابب نفس اللي في الألعاب التانية */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// Main lesson component
// ----------------------------
const SplittingPartsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);
  const totalSteps = SPLITTING_STEPS.length;
  const allDone = completedSteps.length === totalSteps;

  const activeStepIndex = completedSteps.length;
  const visibleSteps = SPLITTING_STEPS.slice(0, activeStepIndex + 1);

  const handleStepComplete = (stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  };

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(
        () =>
          bottomRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        400
      );
    }
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      {/* Sticky header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white p-2.5 rounded-xl shadow-lg shadow-teal-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Splitting Parts
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
                  ? "text-teal-500 fill-teal-500 animate-bounce"
                  : "text-slate-300 fill-slate-300"
              }
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-700">
                {completedSteps.length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps timeline */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          const isDone = completedSteps.includes(step.id);

          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              {/* timeline dots */}
              <div className="hidden md:flex absolute -left-10 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    isDone
                      ? "bg-teal-400 border-teal-400 text-white"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                )}
              </div>

              <SplittingStep
                step={step}
                isCompleted={isDone}
                onComplete={() => handleStepComplete(step.id)}
              />

              {!isLast && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full"></div>
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}

        {allDone && <SplitTwelfthsTip />}
      </div>
    </div>
  );
};

export default SplittingPartsLesson;
