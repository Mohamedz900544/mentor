import React, { useState, useEffect, useRef } from "react";
import {
  Move,
  RotateCcw,
  HelpCircle,
  Check,
  ArrowRight,
  Trophy,
  MapPin,
  X,
  Info,
  Sparkles,
  MousePointer2,
  Target,
  Grid,
  ArrowUp,
  ArrowRight as ArrowRightIcon
} from "lucide-react";

// --- SOUNDS ---
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/win.mp3",
  error: "/audio/matrix_intro.mp3",
  snap: "/audio/matrix_intro.mp3",
};

// --- LESSON DATA: AXES ---
const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    instruction: (
      <>
        Select <strong>all</strong> the points that can be reached by starting
        at the origin and moving <strong>only to the right</strong>.
      </>
    ),
    hint: "The points that can be reached by taking steps right from the origin are those along the bottom edge of the plot.",
    gridSize: 6,
    gridLabel: "Right Only",
    mode: "select_multiple",
    options: [
      { id: "A", x: 1, y: 0, correct: true },
      { id: "B", x: 3, y: 0, correct: true },
      { id: "C", x: 5, y: 0, correct: true },
      { id: "D", x: 2, y: 2, correct: false },
      { id: "E", x: 0, y: 4, correct: false },
      { id: "F", x: 4, y: 3, correct: false },
    ],
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    instruction: (
      <>
        Select <strong>all</strong> the points that can be reached by starting
        at the origin and moving <strong>only upward</strong>.
      </>
    ),
    hint: "The points that can be reached only taking steps up from the origin are those along the left edge of the plot.",
    gridSize: 6,
    gridLabel: "Up Only",
    mode: "select_multiple",
    options: [
      { id: "A", x: 0, y: 1, correct: true },
      { id: "B", x: 0, y: 3, correct: true },
      { id: "C", x: 0, y: 5, correct: true },
      { id: "D", x: 2, y: 0, correct: false },
      { id: "E", x: 3, y: 3, correct: false },
      { id: "F", x: 5, y: 1, correct: false },
    ],
  },
  {
    id: "info_axes",
    type: "interactive_info",
    title: "X-Axis and Y-Axis",
    content: (
      <div className="space-y-2">
        <p className="flex items-center gap-2">
          <ArrowRightIcon className="text-pink-500" size={16} strokeWidth={3} />{" "}
          The horizontal line pointing right is the <strong>x-axis</strong>.
        </p>
        <p className="flex items-center gap-2">
          <ArrowUp className="text-blue-500" size={16} strokeWidth={3} /> The
          vertical line pointing up is the <strong>y-axis</strong>.
        </p>
      </div>
    ),
    gridSize: 6,
    highlight: "axes",
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    instruction: "Select all the points on the x-axis.",
    hint: "The x-axis is the horizontal line from the origin, at the bottom of the plot.",
    gridSize: 6,
    gridLabel: "Find X-Axis",
    mode: "select_multiple",
    options: [
      { id: "A", x: 2, y: 0, correct: true },
      { id: "B", x: 4, y: 0, correct: true },
      { id: "C", x: 6, y: 0, correct: true },
      { id: "D", x: 0, y: 3, correct: false },
      { id: "E", x: 3, y: 3, correct: false },
      { id: "F", x: 1, y: 4, correct: false },
    ],
  },
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    instruction: "Select all the points on the y-axis.",
    hint: "The y-axis is the vertical line from the origin, along the left side of the plot. A point on the origin is on BOTH axes!",
    gridSize: 6,
    gridLabel: "Find Y-Axis",
    mode: "select_multiple",
    options: [
      { id: "A", x: 0, y: 2, correct: true },
      { id: "B", x: 0, y: 4, correct: true },
      { id: "C", x: 0, y: 0, correct: true },
      { id: "D", x: 3, y: 0, correct: false },
      { id: "E", x: 2, y: 2, correct: false },
      { id: "F", x: 5, y: 5, correct: false },
    ],
  },
  {
    id: "final_info",
    type: "info",
    title: "Lesson Complete",
    content:
      "The x-axis and y-axis meet at the origin. Together they help define all locations on the coordinate plane.",
    showFinalVisual: true, // 👈 tell the renderer to show the picture
  },
];

// --- CONFETTI COMPONENT ---
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    color: ["#ec4899", "#3b82f6", "#fbbf24", "#22c55e", "#8b5cf6"][
      Math.floor(Math.random() * 5)
    ],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.1,
  }));

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none z-50">
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

// --- FINAL AXES VISUAL (for the end of the lesson) ---
const FinalAxesVisual = () => {
  const size = 260;
  const gridSize = 8;
  const stepSize = size / gridSize;

  const points = [
    { x: 2, y: 2, label: "(2,2)" },
    { x: 7, y: 2, label: "(7,2)" },
    { x: 2, y: 7, label: "(2,7)" },
    { x: 7, y: 7, label: "(7,7)" },
  ];

  const toSvgX = (x) => x * stepSize;
  const toSvgY = (y) => size - y * stepSize;

  const axisColor = "#0f172a";
  const gridColor = "#e2e8f0";

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="text-sm md:text-base font-medium text-slate-700 text-center">
        The x-axis and y-axis meet at the origin. Together they help define all
        locations on the coordinate plane.
      </div>
      <svg width={size + 50} height={size + 50}>
        <g transform="translate(40,10)">
          {/* grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => {
            const p = i * stepSize;
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={p}
                  x2={size}
                  y2={p}
                  stroke={gridColor}
                  strokeWidth={1}
                />
                <line
                  x1={p}
                  y1={0}
                  x2={p}
                  y2={size}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* x-axis (bottom) */}
          <line
            x1={0}
            y1={size}
            x2={size}
            y2={size}
            stroke={axisColor}
            strokeWidth={3}
          />
          {/* y-axis (left) */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={size}
            stroke={axisColor}
            strokeWidth={3}
          />

          {/* x-axis arrow */}
          <polygon
            points={`${size},${size - 4} ${size + 10},${size} ${size},${
              size + 4
            }`}
            fill={axisColor}
          />
          {/* y-axis arrow */}
          <polygon
            points={`${-4},0 0,-10 ${4},0`}
            fill={axisColor}
          />

          {/* axis labels */}
          <text
            x={size + 14}
            y={size + 4}
            fontSize="12"
            fontWeight="bold"
            fill={axisColor}
          >
            x
          </text>
          <text
            x={-10}
            y={-12}
            fontSize="12"
            fontWeight="bold"
            fill={axisColor}
          >
            y
          </text>

          {/* tick labels on x */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <text
              key={`x-${i}`}
              x={toSvgX(i)}
              y={size + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {i}
            </text>
          ))}

          {/* tick labels on y */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <text
              key={`y-${i}`}
              x={-8}
              y={toSvgY(i) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {i}
            </text>
          ))}

          {/* points */}
          {points.map((p) => (
            <g key={p.label}>
              <circle
                cx={toSvgX(p.x)}
                cy={toSvgY(p.y)}
                r={5}
                fill="#14b8a6"
              />
              <text
                x={toSvgX(p.x) + 6}
                y={toSvgY(p.y) - 6}
                fontSize="11"
                fill="#0f172a"
              >
                {p.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

// --- GRID COMPONENT ---
const InteractiveGrid = ({ step, isCompleted, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("idle");
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (isCompleted && step.mode === "select_multiple") {
      const correctIds = step.options.filter((o) => o.correct).map((o) => o.id);
      setSelectedIds(correctIds);
      setFeedback("success");
    }
  }, [isCompleted, step.options, step.mode]);

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      if (key === "win") audio.volume = 0.6;
      else if (key === "snap") audio.volume = 0.2;
      else audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handlePointClick = (option) => {
    if (isCompleted) return;

    setSelectedIds((prev) => {
      const exists = prev.includes(option.id);
      playSound("pop");
      if (exists) return prev.filter((id) => id !== option.id);
      return [...prev, option.id];
    });
    setFeedback("idle");
  };

  const checkAnswerMultiple = () => {
    const selected = new Set(selectedIds);
    const correct = new Set(
      step.options.filter((o) => o.correct).map((o) => o.id)
    );

    if (
      selected.size === correct.size &&
      [...selected].every((id) => correct.has(id))
    ) {
      playSound("win");
      setFeedback("success");
      setShowConfetti(true);
      onComplete();
    } else {
      playSound("error");
      setFeedback("error");
    }
  };

  const renderGridSVG = (readOnly = false, highlightMode = null) => {
    const size = 300;
    const gridSize = step.gridSize || 6;
    const stepSize = size / gridSize;
    const lines = [];

    for (let i = 0; i <= gridSize; i++) {
      const p = i * stepSize;

      let vStroke = "#e2e8f0";
      let hStroke = "#e2e8f0";
      let vWidth = 1;
      let hWidth = 1;

      if (i === 0) {
        vStroke = "#1e293b";
        vWidth = 3;
      }
      if (i === gridSize) {
        hStroke = "#1e293b";
        hWidth = 3;
      }

      if (highlightMode === "axes") {
        if (i === 0) {
          vStroke = "#3b82f6";
          vWidth = 6;
        }
        if (i === gridSize) {
          hStroke = "#ec4899";
          hWidth = 6;
        }
      }

      lines.push(
        <line
          key={`v${i}`}
          x1={p}
          y1={0}
          x2={p}
          y2={size}
          stroke={vStroke}
          strokeWidth={vWidth}
        />
      );
      lines.push(
        <line
          key={`h${i}`}
          x1={0}
          y1={p}
          x2={size}
          y2={p}
          stroke={hStroke}
          strokeWidth={hWidth}
        />
      );
    }

    const guides = [];
    if (highlightMode === "axes") {
      guides.push(
        <text
          key="xlabel"
          x={size - 20}
          y={size - 10}
          fill="#ec4899"
          fontWeight="bold"
          fontSize="16"
        >
          x
        </text>
      );
      guides.push(
        <text
          key="ylabel"
          x={10}
          y={20}
          fill="#3b82f6"
          fontWeight="bold"
          fontSize="16"
        >
          y
        </text>
      );
    }

    const hintVisuals = [];
    if (!readOnly && showHint && !isCompleted) {
      if (step.id === "prob1" || step.id === "prob3") {
        hintVisuals.push(
          <rect
            key="xh"
            x={0}
            y={size - 4}
            width={size}
            height={8}
            fill="#ec4899"
            opacity="0.3"
          />
        );
      } else if (step.id === "prob2" || step.id === "prob4") {
        hintVisuals.push(
          <rect
            key="yh"
            x={-4}
            y={0}
            width={8}
            height={size}
            fill="#3b82f6"
            opacity="0.3"
          />
        );
      }
    }

    return (
      <div className="relative">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="overflow-visible touch-none select-none"
        >
          {lines}
          {guides}
          {hintVisuals}

          {step.mode === "select_multiple" &&
            !readOnly &&
            step.options.map((opt) => {
              const opx = opt.x * stepSize;
              const opy = size - opt.y * stepSize;
              const isSelected = selectedIds.includes(opt.id);

              let fillColor = isSelected ? "#3b82f6" : "white";
              let strokeColor = isSelected ? "#3b82f6" : "#cbd5e1";

              if (isCompleted) {
                if (opt.correct) {
                  fillColor = "#22c55e";
                  strokeColor = "#22c55e";
                } else if (isSelected && !opt.correct) {
                  fillColor = "#ef4444";
                  strokeColor = "#ef4444";
                }
              } else if (feedback === "error" && isSelected) {
                fillColor = "#ef4444";
                strokeColor = "#ef4444";
              }

              return (
                <g
                  key={opt.id}
                  onClick={() => handlePointClick(opt)}
                  style={{ cursor: isCompleted ? "default" : "pointer" }}
                >
                  <circle cx={opx} cy={opy} r={24} fill="transparent" />
                  <circle
                    cx={opx}
                    cy={opy}
                    r={8}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="3"
                    className="transition-all duration-200"
                  />
                  {!isCompleted && !isSelected && (
                    <circle
                      cx={opx}
                      cy={opy}
                      r={12}
                      fill="#3b82f6"
                      opacity="0"
                      className="hover:opacity-20 transition-opacity"
                    />
                  )}
                </g>
              );
            })}

          {/* Axis labels */}
          <g transform={`translate(0, ${size + 15})`}>
            {Array.from({ length: gridSize + 1 }).map((_, i) => (
              <text
                key={i}
                x={i * stepSize}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="bold"
              >
                {i}
              </text>
            ))}
          </g>
          <g transform="translate(-10, 0)">
            {Array.from({ length: gridSize + 1 }).map((_, i) => (
              <text
                key={i}
                y={size - i * stepSize + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="bold"
              >
                {i}
              </text>
            ))}
          </g>
        </svg>
        {showConfetti && <ConfettiBurst />}
      </div>
    );
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-90" : "opacity-100"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* INSTRUCTION CARD */}
        <div className="flex-1 space-y-4 w-full">
          <div
            className={`bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all duration-500 ${
              isCompleted && step.type !== "interactive_info"
                ? "border-green-200 shadow-green-50"
                : "border-slate-100 shadow-slate-200"
            }`}
          >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.title}
                </span>
              </div>
              {step.type === "interactive_info" ? (
                <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full">
                  <Target size={20} />
                </div>
              ) : isCompleted ? (
                <div className="bg-green-100 text-green-600 p-1.5 rounded-full animate-bounce-in">
                  <Check size={20} strokeWidth={4} />
                </div>
              ) : (
                <div className="bg-slate-100 text-slate-400 p-1.5 rounded-full">
                  <MousePointer2 size={20} />
                </div>
              )}
            </div>

            <div className="text-xl md:text-2xl font-medium text-slate-800 leading-snug">
              {step.type === "interactive_info"
                ? step.content
                : step.instruction}
            </div>

            {step.type === "interactive_info" && (
              <div className="mt-6">
                <button
                  onClick={onComplete}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  Got it! Continue <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* ACTION BAR (Only for problems) */}
          {step.type === "problem" && !isCompleted && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in">
              {feedback === "error" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake border border-red-100">
                  <X size={20} /> Oops! Make sure you select ALL correct
                  points.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <HelpCircle size={18} /> Why?
                </button>

                <button
                  onClick={() => {
                    setSelectedIds([]);
                    setFeedback("idle");
                  }}
                  className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <RotateCcw size={18} /> Reset
                </button>

                <button
                  onClick={checkAnswerMultiple}
                  className={`flex-1 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 
                  ${
                    selectedIds.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
                  disabled={selectedIds.length === 0}
                >
                  Check ({selectedIds.length}) <ArrowRight size={20} />
                </button>
              </div>

              {showHint && (
                <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-2xl border border-blue-100 animate-in fade-in flex gap-3 items-start">
                  <Info className="shrink-0 mt-0.5" size={16} />
                  {step.hint}
                </div>
              )}
            </div>
          )}
        </div>

        {/* GRID CONTAINER */}
        <div
          className={`bg-white p-8 rounded-[2rem] shadow-xl border-4 mx-auto md:mx-0 transition-all duration-500 ${
            isCompleted && step.type !== "interactive_info"
              ? "border-green-100 shadow-green-100/50"
              : "border-white shadow-slate-200/50"
          }`}
        >
          <div className="pl-4 pb-4">
            {step.type === "interactive_info" ? (
              renderGridSVG(true, step.highlight)
            ) : (
              <>
                <div className="absolute -mt-12 left-0 w-full text-center md:text-left md:pl-8">
                  <span className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                    {step.gridLabel}
                  </span>
                </div>
                {renderGridSVG()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LESSON APP ---
const AxesLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);

  const activeStepIndex = completedSteps.length;
  const visibleSteps = LESSON_STEPS.slice(0, activeStepIndex + 1);

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      {/* STICKY HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-2.5 rounded-xl shadow-lg shadow-teal-200">
              <Grid size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-800">
                Coordinates
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Level 3: Axes
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
                {completedSteps.filter((id) => id.includes("prob")).length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {LESSON_STEPS.filter((s) => s.type === "problem").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE FEED */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;

          if (step.type === "info") {
            return (
              <div
                key={step.id}
                className="animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
              >
                <div className="p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left transform hover:scale-[1.01] transition-transform duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <div className="bg-white/20 p-4 rounded-full shrink-0 backdrop-blur-sm border border-white/20">
                    <Trophy size={40} />
                  </div>
                  <div className="w-full">
                    <h2 className="text-2xl font-black mb-3 tracking-tight">
                      {step.title}
                    </h2>
                    <div className="text-white/95 text-lg md:text-xl leading-relaxed font-medium">
                      {step.content}
                    </div>

                    {step.showFinalVisual && (
                      <div className="mt-6 bg-white rounded-3xl p-4 md:p-6 shadow-lg text-slate-800">
                        <FinalAxesVisual />
                      </div>
                    )}
                  </div>
                </div>
                {isLast && <div ref={bottomRef} className="h-4" />}
              </div>
            );
          }

          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-16 fade-in duration-700 fill-mode-backwards"
            >
              {step.type === "problem" && (
                <div className="absolute -left-3 md:-left-12 top-0 flex flex-col items-center h-full opacity-50 pointer-events-none hidden md:flex">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500
                    ${
                      completedSteps.includes(step.id)
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-slate-200 text-slate-300"
                    }
                  `}
                  >
                    {step.id.replace("prob", "")}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                  )}
                </div>
              )}

              <InteractiveGrid
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

              {!isLast && step.type === "problem" && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full"></div>
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        .animate-particle-burst {
          animation: particle-burst 0.8s ease-out forwards;
        }

        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AxesLesson;
