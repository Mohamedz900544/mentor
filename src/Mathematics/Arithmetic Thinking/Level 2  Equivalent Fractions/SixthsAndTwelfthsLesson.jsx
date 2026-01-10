// SixthsAndTwelfthsLesson.jsx
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
  ArrowRight, // Added ArrowRight
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
// IMPROVED SHAPE: Rectangular Grid
// --------------------------------------------------
const RectGrid = ({ rows, cols, fillFromRow = 1, size = 260 }) => {
  const width = size;
  const height = size;
  const cellW = width / cols;
  const cellH = height / rows;
  
  const fillColor = "#2dd4bf"; // Teal-400
  const lineColor = "#0f172a"; // Slate-900

  // Generate fill rectangles
  const fills = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r >= fillFromRow) {
        fills.push(
          <rect
            key={`fill-${r}-${c}`}
            x={c * cellW}
            y={r * cellH}
            width={cellW}
            height={cellH}
            fill={fillColor}
            stroke="none"
          />
        );
      }
    }
  }

  // Generate internal grid lines (Horizontal)
  const hLines = [];
  for (let i = 1; i < rows; i++) {
    const y = i * cellH;
    hLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  }

  // Generate internal grid lines (Vertical)
  const vLines = [];
  for (let i = 1; i < cols; i++) {
    const x = i * cellW;
    vLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={`clip-${rows}-${cols}`}>
          <rect x={0} y={0} width={width} height={height} rx={16} ry={16} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={16}
        ry={16}
        fill="white"
      />

      {/* Content Group (clipped) */}
      <g clipPath={`url(#clip-${rows}-${cols})`}>
        {fills}
        {hLines}
        {vLines}
      </g>

      {/* Outer Border */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={16}
        ry={16}
        fill="none"
        stroke={lineColor}
        strokeWidth={4}
      />
    </svg>
  );
};

// --------------------------------------------------
// IMPROVED SHAPE: Triangles / Twelfths
// --------------------------------------------------
const TrianglesTwelfthsShape = ({
  variant = "fourTwelfths", // "fourTwelfths" | "oneThird"
  size = 260,
}) => {
  const width = size;
  const height = size;
  
  const x0 = 0;
  const x1 = width / 3;
  const x2 = (2 * width) / 3;
  const x3 = width;

  const y0 = 0;
  const y1 = height / 2;
  const y2 = height;

  const fillColor = "#60a5fa"; // Blue-400
  const lineColor = "#0f172a"; // Slate-900

  const renderFills = () => {
    if (variant === "oneThird") {
      return <rect x={x0} y={y0} width={x1} height={height} fill={fillColor} />;
    }
    // fourTwelfths
    return (
      <>
        <polygon points={`${x0},${y0} ${x1},${y0} ${x1},${y1}`} fill={fillColor} />
        <polygon points={`${x0},${y2} ${x1},${y2} ${x1},${y1}`} fill={fillColor} />
        <polygon points={`${x3},${y0} ${x3},${y1} ${x2},${y0}`} fill={fillColor} />
        <polygon points={`${x3},${y2} ${x3},${y1} ${x2},${y2}`} fill={fillColor} />
      </>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
       {/* Base Background */}
       <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={16}
        ry={16}
        fill="white"
      />

      <defs>
        <clipPath id={`clip-tri-${variant}`}>
          <rect x={0} y={0} width={width} height={height} rx={16} ry={16} />
        </clipPath>
      </defs>

      {/* Content Group */}
      <g clipPath={`url(#clip-tri-${variant})`}>
        {renderFills()}
        <line x1={x1} y1={0} x2={x1} y2={height} stroke={lineColor} strokeWidth={2} />
        <line x1={x2} y1={0} x2={x2} y2={height} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={y1} x2={width} y2={y1} stroke={lineColor} strokeWidth={2} />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={lineColor} strokeWidth={2} />
        <line x1={x0} y1={y2} x2={x1} y2={y1} stroke={lineColor} strokeWidth={2} />
        <line x1={x2} y1={y0} x2={x3} y2={y1} stroke={lineColor} strokeWidth={2} />
        <line x1={x2} y1={y2} x2={x3} y2={y1} stroke={lineColor} strokeWidth={2} />
      </g>

       {/* Outer Border */}
       <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={16}
        ry={16}
        fill="none"
        stroke={lineColor}
        strokeWidth={4}
      />
    </svg>
  );
};

// --------------------------------------------------
// Fraction display helpers
// --------------------------------------------------
const InlineFraction = ({ num, den }) => (
  <span className="inline-flex flex-col items-center mx-2 text-lg md:text-xl align-middle font-bold text-slate-800">
    <span className="px-1 border-b-2 border-slate-900 leading-tight block">
      {num}
    </span>
    <span className="text-sm leading-tight block pt-0.5">{den}</span>
  </span>
);

const FractionEquality = () => (
  <div className="flex items-center gap-3">
    <InlineFraction num={2} den={3} />
    <span className="text-lg md:text-xl font-bold">=</span>
    <InlineFraction num={4} den={6} />
    <span className="text-lg md:text-xl font-bold">=</span>
    <InlineFraction num={8} den={12} />
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

const FractionDropZone = ({ value, onDrop, placeholder, isCompleted }) => {
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-200
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
// Steps data
// --------------------------------------------------
const STEPS = [
  {
    id: "sixths_4of6",
    label: "Step 1",
    title: "Sixths and Twelfths",
    prompt: "Drag numbers to form the fraction of the shape that is green.",
    helper:
      "Count all squares (denominator) and place it at the bottom. Count green squares (numerator) and place it at the top.",
    shape: "rectGrid",
    grids: [{ rows: 3, cols: 2, fillFromRow: 1 }],
    choices: [2, 4, 6, 8],
    correct: { num: 4, den: 6 },
    whyText:
      "There are 6 equal squares in total. 4 of them are green, so the fraction of the shape that is green is 4/6.",
  },
  {
    id: "twelfths_8of12",
    label: "Step 2",
    title: "Sixths and Twelfths",
    prompt: "What fraction of the shape is green?",
    helper:
      "The shape is now cut into twelfths. Drag the correct numbers to the top and bottom boxes.",
    shape: "rectGrid",
    grids: [{ rows: 3, cols: 4, fillFromRow: 1 }],
    choices: [4, 8, 12, 16],
    correct: { num: 8, den: 12 },
    whyText:
      "There are 12 equal squares in total. 8 of them are green, so the fraction is 8/12.",
  },
  {
    id: "equivalent_2of3",
    label: "Step 3",
    title: "Same fraction, different numbers",
    prompt:
      "The numbers 4/6 and 8/12 are both equal to what fraction of the shape?",
    helper:
      "Look at how much of each shape is green. Drag the simplest numbers here.",
    shape: "rectGrid",
    grids: [
      { rows: 3, cols: 2, fillFromRow: 1 },
      { rows: 3, cols: 4, fillFromRow: 1 },
    ],
    choices: [2, 3, 4, 5],
    correct: { num: 2, den: 3 },
    whyText:
      "In each picture, 2 out of every 3 equal rows are green. That is the fraction 2/3. Fractions that cover the same amount of a shape are equal, even if they use different numbers.",
  },
  {
    id: "triangles_4of12",
    label: "Step 4",
    title: "Triangles and Twelfths",
    prompt: "What fraction of the shape is blue?",
    helper:
      "Imagine the whole shape is cut into twelfths. Drag numbers to show how many pieces are blue.",
    shape: "triangles",
    triangleVariant: "fourTwelfths",
    choices: [4, 6, 9, 12],
    correct: { num: 4, den: 12 },
    whyText:
      "There are 12 equal pieces making up the whole shape. 4 of those pieces are blue, so the fraction is 4/12.",
  },
  {
    id: "equivalent_4over12",
    label: "Step 5",
    title: "Equivalent fractions",
    prompt: "What fraction is equal to 4/12?",
    helper:
      "Use the picture to shrink 4/12 to a simpler fraction. Think about how many equal big strips of the shape there are.",
    shape: "triangles",
    triangleVariant: "fourTwelfths",
    choices: [1, 2, 3, 4],
    correct: { num: 1, den: 3 },
    whyText:
      "If you group the blue pieces together, they cover one out of the three equal vertical strips of the whole shape. That is 1/3. So 4/12 and 1/3 are equal fractions.",
  },
];

// --------------------------------------------------
// Single step component
// --------------------------------------------------
const GridFractionStep = ({ step, isCompleted, onComplete }) => {
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
      playSound("error");
      setShowConfetti(false);
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

  const renderShapes = () => {
    if (step.shape === "triangles") {
      const variant = step.triangleVariant || "fourTwelfths";
      return (
        <div className="flex items-center justify-center gap-8 py-4">
          <TrianglesTwelfthsShape variant={variant} size={240} />
        </div>
      );
    }

    const grids = step.grids || [];
    const multiple = grids.length > 1;

    return (
      <div
        className={`flex items-center justify-center gap-6 py-4 ${
          multiple ? "flex-col md:flex-row" : "flex-col"
        }`}
      >
        {grids.map((g, idx) => (
          <RectGrid
            key={idx}
            rows={g.rows}
            cols={g.cols}
            fillFromRow={g.fillFromRow}
            size={multiple ? 200 : 260}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
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
                    ? "bg-emerald-100 text-emerald-500"
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

        <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0 w-full lg:w-auto">
          <div className="relative bg-white/80 p-6 rounded-[2.5rem] shadow-xl border-4 border-white shadow-slate-200 backdrop-blur-sm">
            {renderShapes()}
            {showConfetti && <ConfettiBurst />}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full justify-center">
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-3xl p-6 min-w-[160px] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                Answer
              </p>
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

            <div className="flex-1 bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 items-center justify-center border-2 border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Choices
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {step.choices.map((choice) => (
                  <DraggableChoice
                    key={choice}
                    value={choice}
                    isUsed={choice === top || choice === bottom}
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

// --------------------------------------------------
// First tip card (2/3 = 4/6 = 8/12)
// ADDED: onContinue Prop
// --------------------------------------------------
const SixthsTwelfthsMidTipCard = ({ onContinue, hasContinued }) => {
  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 space-y-6">
        <p className="text-base md:text-lg text-slate-700 font-medium text-center">
          These numbers are equal because they represent the <span className="text-emerald-500 font-bold">same amount</span> of the shape.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <RectGrid rows={3} cols={2} fillFromRow={1} size={180} />
          <RectGrid rows={3} cols={4} fillFromRow={1} size={180} />
        </div>

        <div className="mt-4 flex justify-center text-slate-900">
          <FractionEquality />
        </div>

        {/* Continue Button logic */}
        {!hasContinued && (
          <div className="pt-4 flex justify-center">
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
};

// --------------------------------------------------
// Final tip card
// --------------------------------------------------
const TrianglesTwelfthsFinalTipCard = () => {
  return (
    <div className="max-w-4xl mx-auto mt-6 md:mt-10">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 space-y-6">
        <p className="text-base md:text-lg text-slate-700 font-medium text-center">
          The same fraction of a shape can be written in different ways,
          depending on how many pieces the shape is divided into.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <TrianglesTwelfthsShape variant="fourTwelfths" size={200} />
          <TrianglesTwelfthsShape variant="oneThird" size={200} />
        </div>

        <div className="mt-4 flex justify-center items-center gap-3 text-slate-900">
          <InlineFraction num={4} den={12} />
          <span className="text-xl md:text-2xl font-bold">=</span>
          <InlineFraction num={1} den={3} />
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Main lesson component
// --------------------------------------------------
const SixthsAndTwelfthsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasContinuedFromTip, setHasContinuedFromTip] = useState(false); // New state to control flow
  const bottomRef = useRef(null);

  // Logic: normally show all completed + 1.
  // BUT if we finished step 3 (index 2) and haven't clicked continue, cap the visible list.
  const step3Id = "equivalent_2of3";
  const showMidTip = completedSteps.includes(step3Id);

  // Calculate how many steps to show
  let visibleLimit = completedSteps.length + 1;
  if (showMidTip && !hasContinuedFromTip) {
     // If Tip is showing but user hasn't continued, don't show step 4 yet.
     // Find index of step 3, show up to that index + 1
     const step3Index = STEPS.findIndex(s => s.id === step3Id);
     visibleLimit = step3Index + 1;
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
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-sky-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Sixths and Twelfths
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
                  ? "text-emerald-500 fill-emerald-500 animate-bounce"
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

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          // If we are showing the mid tip, it appears after step 3 (index 2)
          const isStep3 = step.id === step3Id;
          const isLast = index === visibleSteps.length - 1;

          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              <div className="hidden lg:flex absolute -left-12 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    completedSteps.includes(step.id)
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2 rounded-full"></div>
                )}
              </div>

              <GridFractionStep
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

              {/* Show mid tip ONLY after Step 3 is rendered */}
              {isStep3 && showMidTip && (
                <div className="mt-6 animate-in fade-in zoom-in duration-500">
                  <SixthsTwelfthsMidTipCard 
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

        {allDone && <TrianglesTwelfthsFinalTipCard />}
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

export default SixthsAndTwelfthsLesson;