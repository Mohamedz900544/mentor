// EighthsAndSixteenthsLesson.jsx
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
// SHAPE: Yellow Square (Radial Grid)
// --------------------------------------------------
const YellowShape = ({ mode = "eighths", size = 260 }) => {
  const s = size;
  const c = s / 2; // center
  const fillColor = "#facc15"; // Yellow-400
  const lineColor = "#0f172a"; // Slate-900

  // Coloring pattern: 6 yellow, 2 white
  const wedgeYellow = [true, true, false, true, true, true, false, true];

  const getPerimeterPoint = (idx) => {
    const points = [
      [0, 0], [c, 0], [s, 0], [s, c], 
      [s, s], [c, s], [0, s], [0, c],
    ];
    return points[idx % 8];
  };

  const renderFills = () => {
    const fills = [];
    for (let i = 0; i < 8; i++) {
      if (wedgeYellow[i]) {
        const p1 = getPerimeterPoint(i);
        const p2 = getPerimeterPoint(i + 1);
        fills.push(
          <path
            key={`fill-${i}`}
            d={`M ${c},${c} L ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} Z`}
            fill={fillColor}
            stroke="none"
          />
        );
      }
    }
    return fills;
  };

  // Unique ID for clipping to prevent overlap bugs between sizes
  const clipId = `clip-yellow-${mode}-${size}`;

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
        {renderFills()}

        {/* Major Grid Lines */}
        <line x1={0} y1={0} x2={s} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={s} y1={0} x2={0} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={c} y1={0} x2={c} y2={s} stroke={lineColor} strokeWidth={2} />
        <line x1={0} y1={c} x2={s} y2={c} stroke={lineColor} strokeWidth={2} />

        {/* Sixteenths split lines */}
        {mode === "sixteenths" && (
            <>
                <line x1={s*0.25} y1={0} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={s*0.75} y1={0} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={s*0.25} y1={s} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={s*0.75} y1={s} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={0} y1={s*0.25} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={0} y1={s*0.75} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={s} y1={s*0.25} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
                <line x1={s} y1={s*0.75} x2={c} y2={c} stroke={lineColor} strokeWidth={1.5} />
            </>
        )}
      </g>

      <rect
        x={0}
        y={0}
        width={s}
        height={s}
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
// SHAPE: Pink Arrow
// --------------------------------------------------
const PinkArrowShape = ({
  variant = "fine", // fine = 16, coarse = 8
  size = 260,
}) => {
  const s = size;
  const col = s / 4;
  const row = s / 4;
  const color = "#fb7185"; // Pink-400
  const lineColor = "#0f172a"; // Slate-900
  
  // Unique IDs for clipping (Critical Fix for artifacting)
  const arrowClipId = `clip-arrow-fill-${variant}-${size}`;
  const frameClipId = `clip-frame-${size}`;

  const arrowPath = `
    M 0,${row} 
    L ${2*col},${row} 
    L ${2*col},${row} 
    L ${s},${2*row} 
    L ${2*col},${3*row} 
    L 0,${3*row} 
    Z
  `;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="overflow-visible touch-none select-none drop-shadow-xl"
    >
      <defs>
        <clipPath id={arrowClipId}>
            <path d={arrowPath} />
        </clipPath>
        <clipPath id={frameClipId}>
             <rect x={0} y={0} width={s} height={s} rx={16} ry={16} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={s} height={s} rx={16} ry={16} fill="white" />

      <g clipPath={`url(#${frameClipId})`}>
         {/* Pink Fill */}
         <rect x={0} y={0} width={s} height={s} fill={color} clipPath={`url(#${arrowClipId})`} />

         {/* Grid Lines */}
         <line x1={col} y1={0} x2={col} y2={s} stroke={lineColor} strokeWidth={variant === 'fine' ? 1.5 : 0} opacity={variant === 'fine' ? 1 : 0} />
         <line x1={2*col} y1={0} x2={2*col} y2={s} stroke={lineColor} strokeWidth={2} />
         <line x1={3*col} y1={0} x2={3*col} y2={s} stroke={lineColor} strokeWidth={variant === 'fine' ? 1.5 : 0} opacity={variant === 'fine' ? 1 : 0} />
         
         <line x1={0} y1={row} x2={s} y2={row} stroke={lineColor} strokeWidth={2} />
         <line x1={0} y1={2*row} x2={s} y2={2*row} stroke={lineColor} strokeWidth={2} />
         <line x1={0} y1={3*row} x2={s} y2={3*row} stroke={lineColor} strokeWidth={2} />

         {/* Arrow Outline */}
         <path d={arrowPath} fill="none" stroke={lineColor} strokeWidth={2} />
      </g>

      <rect
        x={0}
        y={0}
        width={s}
        height={s}
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

const FractionEquality = ({ parts }) => (
  <div className="flex items-center gap-3">
    {parts.map((p, i) => (
        <React.Fragment key={i}>
            <InlineFraction num={p.num} den={p.den} />
            {i < parts.length - 1 && <span className="text-lg md:text-xl font-bold">=</span>}
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
// Steps config
// --------------------------------------------------
const STEPS = [
  {
    id: "yellow_6of8",
    label: "Step 1",
    title: "Eighths and Sixteenths",
    prompt: "Drag numbers to form the fraction of the shape that is yellow.",
    helper:
      "Count all equal parts (denominator). Count yellow parts (numerator).",
    correct: { num: 6, den: 8 },
    choices: [4, 5, 6, 8],
    shape: { kind: "yellow", mode: "eighths" },
    whyText: "There are 8 equal triangles. 6 are yellow. The fraction is 6/8."
  },
  {
    id: "yellow_12of16",
    label: "Step 2",
    title: "Eighths and Sixteenths",
    prompt: "What fraction of the shape is yellow?",
    helper:
      "The shape is now cut into sixteenths. Drag correct numbers to the boxes.",
    correct: { num: 12, den: 16 },
    choices: [10, 12, 14, 16],
    shape: { kind: "yellow", mode: "sixteenths" },
    whyText: "The shape is divided into 16 smaller pieces. 12 are yellow. The fraction is 12/16."
  },
  {
    id: "yellow_equiv_3over4",
    label: "Step 3",
    title: "Same fraction, different numbers",
    prompt:
      "The numbers 6/8 and 12/16 are both equal to what fraction of the shape?",
    helper:
      "Look at the big quarters. How many are filled?",
    correct: { num: 3, den: 4 },
    choices: [1, 2, 3, 4],
    shape: { kind: "yellowPair" },
    whyText: "If you divide the square into 4 big squares, 3 of them are filled with color. So 3/4 is equal to 6/8 and 12/16."
  },
  {
    id: "arrow_6of16",
    label: "Step 4",
    title: "More with eighths and sixteenths",
    prompt: "What fraction of the shape is pink?",
    helper:
      "Count the small grid squares covered by the arrow.",
    correct: { num: 6, den: 16 },
    choices: [4, 6, 8, 16],
    shape: { kind: "arrow", mode: "fine" },
    whyText: "The whole grid has 16 squares. The arrow covers exactly 6 of them. The fraction is 6/16."
  },
  {
    id: "arrow_equiv_3over8",
    label: "Step 5",
    title: "Equivalent fractions",
    prompt: "What fraction of the shape is equal to 6/16?",
    helper:
      "Group the small squares into pairs. How many pairs are filled?",
    correct: { num: 3, den: 8 },
    choices: [2, 3, 4, 8],
    shape: { kind: "arrow", mode: "coarse" },
    given: { num: 6, den: 16 },
    whyText: "6 small squares can be grouped into 3 pairs. The total grid is 8 pairs. So 3/8 is equal to 6/16."
  },
];

// --------------------------------------------------
// Step component
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

  const renderShape = () => {
    const { kind, mode } = step.shape;
    if (kind === "yellow")
      return <YellowShape mode={mode} size={260} />;
    
    if (kind === "yellowPair") {
        return (
            <div className="flex flex-col md:flex-row gap-6 items-center">
                 <YellowShape mode="eighths" size={180} />
                 <YellowShape mode="sixteenths" size={180} />
            </div>
        )
    }

    if (kind === "arrow")
      return (
        <PinkArrowShape
          variant={mode === "coarse" ? "coarse" : "fine"}
          size={260}
        />
      );
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
                  <Info size={18} className="mt-0.5 text-slate-400 shrink-0" />
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
            {renderShape()}
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
                            <div className="flex flex-col items-center opacity-50">
                                <span className="text-2xl font-black text-slate-800">{step.given.num}</span>
                                <div className="w-10 h-1 bg-slate-800 rounded-full my-1"></div>
                                <span className="text-2xl font-black text-slate-800">{step.given.den}</span>
                            </div>
                            <span className="text-2xl font-black text-slate-400">=</span>
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

// --------------------------------------------------
// Tip cards
// --------------------------------------------------
const YellowTipCard = ({ onContinue, hasContinued }) => (
  <div className="max-w-4xl mx-auto mt-6">
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col items-center gap-8">
      <div className="text-center space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          Equivalent Fractions
        </h3>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl">
          These numbers are different, but they represent the <span className="font-bold text-amber-500">same amount</span> of yellow.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
         <YellowShape mode="eighths" size={160} />
         <YellowShape mode="sixteenths" size={160} />
      </div>
      
      <div className="flex justify-center text-slate-900">
         <FractionEquality parts={[{num:3, den:4}, {num:6, den:8}, {num:12, den:16}]} />
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

const PinkArrowTipCard = () => (
  <div className="max-w-4xl mx-auto mt-6">
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col items-center gap-8">
      <div className="text-center space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          One Shape, Two Ways
        </h3>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl">
           The pink arrow always covers 6 grid squares, whether we call it 6/16 or simplify it to 3/8.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
         <PinkArrowShape variant="fine" size={180} />
         <PinkArrowShape variant="coarse" size={180} />
      </div>

      <div className="flex justify-center text-slate-900">
         <FractionEquality parts={[{num:6, den:16}, {num:3, den:8}]} />
      </div>
    </div>
  </div>
);

// --------------------------------------------------
// Main lesson
// --------------------------------------------------
const EighthsAndSixteenthsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasContinuedFromTip, setHasContinuedFromTip] = useState(false);
  const bottomRef = useRef(null);

  // Steps logic: Show steps 1-3, then tip, then 4-5.
  const step3Id = "yellow_equiv_3over4";
  const showMidTip = completedSteps.includes(step3Id);

  let visibleLimit = completedSteps.length + 1;
  if (showMidTip && !hasContinuedFromTip) {
      const step3Index = STEPS.findIndex(s => s.id === step3Id);
      visibleLimit = step3Index + 1;
  }
  
  const visibleSteps = STEPS.slice(0, visibleLimit);
  const allDone = completedSteps.length === STEPS.length;
  // Use correct ID for last step
  const arrowTipShown = completedSteps.includes("arrow_equiv_3over8");

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
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Eighths and Sixteenths
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
          const isStep3 = step.id === step3Id;

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

              <FractionStep
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

               {/* Mid tip */}
               {isStep3 && showMidTip && (
                <div className="mt-6 animate-in fade-in zoom-in duration-500">
                  <YellowTipCard 
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
        {allDone && arrowTipShown && <PinkArrowTipCard />}
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

export default EighthsAndSixteenthsLesson;