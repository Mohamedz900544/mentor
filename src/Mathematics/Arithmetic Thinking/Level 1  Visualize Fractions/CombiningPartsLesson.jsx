// CombiningPartsLesson.jsx
import React, { useState, useEffect, useRef } from "react";
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
// Confetti
// ----------------------------
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    color: ["#facc15", "#fde047", "#fbbf24", "#a855f7", "#22c55e"][
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

// ----------------------------
// Base geometry: 3 columns × 2 rows
// ----------------------------
const ROWS = 2;
const COLS = 3;

// UPDATED: Column 2 is now split into 4 distinct triangles (2 per cell)
const CELLS = [
  { id: "c0r0", col: 0, row: 0, type: "rect" }, // top-left
  { id: "c1r0", col: 1, row: 0, type: "rect" }, // top-middle
  { id: "c0r1", col: 0, row: 1, type: "rect" }, // bottom-left
  { id: "c1r1", col: 1, row: 1, type: "rect" }, // bottom-middle
  
  // Top-Right Cell (Split into 2 triangles)
  { id: "c2r0_tr", col: 2, row: 0, type: "tri_tr" }, // Top-Right Triangle
  { id: "c2r0_bl", col: 2, row: 0, type: "tri_bl" }, // Bottom-Left Triangle
  
  // Bottom-Right Cell (Split into 2 triangles)
  { id: "c2r1_br", col: 2, row: 1, type: "tri_br" }, // Bottom-Right Triangle
  { id: "c2r1_tl", col: 2, row: 1, type: "tri_tl" }, // Top-Left Triangle
];

// ----------------------------
// Static / interactive shape
// ----------------------------
const CombiningShape = ({
  coloredIds = [],
  size = 260,
  readOnly = false,
  onToggle,
}) => {
  const cellWidth = size / COLS;
  const cellHeight = size / ROWS;

  const isColored = (id) => coloredIds.includes(id);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {/* outer border */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={0}
        ry={0}
        fill="#ffffff"
        stroke="#111827"
        strokeWidth={3}
      />

      {/* pieces */}
      {CELLS.map((cell) => {
        const selected = isColored(cell.id);
        const fill = selected ? "#facc15" : "#ffffff";
        const commonStyle = {
          cursor: readOnly ? "default" : "pointer",
          transition: "fill 150ms ease-out",
        };

        const x = cell.col * cellWidth;
        const y = cell.row * cellHeight;

        // Render Triangles for the last column
        if (cell.type.startsWith("tri")) {
          let points = "";
          
          if (cell.type === "tri_tr") { // Top Right Cell -> Top-Right Triangle
             // Points: Top-Left, Top-Right, Bottom-Right
             points = `${x},${y} ${x + cellWidth},${y} ${x + cellWidth},${y + cellHeight}`;
          } else if (cell.type === "tri_bl") { // Top Right Cell -> Bottom-Left Triangle
             // Points: Top-Left, Bottom-Left, Bottom-Right
             points = `${x},${y} ${x},${y + cellHeight} ${x + cellWidth},${y + cellHeight}`;
          } else if (cell.type === "tri_br") { // Bottom Right Cell -> Bottom-Right Triangle
             // Points: Bottom-Left, Bottom-Right, Top-Right (relative to cell)
             // Actually, diagonal is from Bottom-Left to Top-Right of the cell
             // Triangle is Bottom-Right corner: Bottom-Left, Bottom-Right, Top-Right
             points = `${x},${y + cellHeight} ${x + cellWidth},${y + cellHeight} ${x + cellWidth},${y}`;
          } else if (cell.type === "tri_tl") { // Bottom Right Cell -> Top-Left Triangle
             // Triangle is Top-Left corner: Bottom-Left, Top-Left, Top-Right
             points = `${x},${y + cellHeight} ${x},${y} ${x + cellWidth},${y}`;
          }

          return (
            <polygon
              key={cell.id}
              points={points}
              fill={fill}
              stroke="transparent"
              onClick={() => handleClick(cell.id)}
              style={commonStyle}
            />
          );
        }

        // Render Rectangles for other columns
        return (
          <rect
            key={cell.id}
            x={x}
            y={y}
            width={cellWidth}
            height={cellHeight}
            fill={fill}
            stroke="transparent"
            onClick={() => handleClick(cell.id)}
            style={commonStyle}
          />
        );
      })}

      {/* grid lines */}
      {/* vertical lines (at 1/3 and 2/3) */}
      <line
        x1={cellWidth}
        y1={0}
        x2={cellWidth}
        y2={size}
        stroke="#e5e7eb"
        strokeWidth={1.5}
      />
      <line
        x1={2 * cellWidth}
        y1={0}
        x2={2 * cellWidth}
        y2={size}
        stroke="#111827" // Darker border for the shape edge
        strokeWidth={2}
      />
      {/* horizontal middle */}
      <line
        x1={0}
        y1={cellHeight}
        x2={size}
        y2={cellHeight}
        stroke="#e5e7eb"
        strokeWidth={1.5}
      />
      
      {/* Diagonals for the triangles in last column */}
      {/* Top Cell Diagonal: Top-Left to Bottom-Right */}
      <line
        x1={2 * cellWidth}
        y1={0}
        x2={size} // rightX
        y2={cellHeight} // middleY
        stroke="#111827"
        strokeWidth={2}
      />
      {/* Bottom Cell Diagonal: Bottom-Left to Top-Right */}
      <line
        x1={2 * cellWidth}
        y1={size} // bottomY
        x2={size} // rightX
        y2={cellHeight} // middleY
        stroke="#111827"
        strokeWidth={2}
      />
    </svg>
  );
};

// ----------------------------
// Why visuals (thirds)
// ----------------------------
const ThirdsWhyVisual = () => {
  // 2/3 = First two columns (4 pieces)
  const leftColored = ["c0r0", "c1r0", "c0r1", "c1r1"];
  const rightColored = ["col0", "col1"]; // simplified 3-column model
  const size = 130;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-700">
        Combining each column into one piece helps us see why{" "}
        <span className="font-semibold">2/3</span> means{" "}
        <span className="italic">&quot;take 2 of 3 equal parts.&quot;</span>
      </p>

      <div className="flex flex-wrap gap-6">
        {/* original shape */}
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <CombiningShape coloredIds={leftColored} size={size} readOnly />
        </div>

        {/* simplified vertical 3-part bar */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="bg-white rounded-2xl shadow-sm p-3"
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
          <line
            x1={size / 3}
            y1={0}
            x2={size / 3}
            y2={size}
            stroke="#111827"
            strokeWidth={2}
          />
          <line
            x1={(2 * size) / 3}
            y1={0}
            x2={(2 * size) / 3}
            y2={size}
            stroke="#111827"
            strokeWidth={2}
          />

          {[0, 1, 2].map((col) => {
            const x = (col * size) / 3;
            const fill = rightColored.includes(`col${col}`)
              ? "#facc15"
              : "#ffffff";
            return (
              <rect
                key={col}
                x={x}
                y={0}
                width={size / 3}
                height={size}
                fill={fill}
                stroke="transparent"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ----------------------------
// Why visuals (sixths)
// ----------------------------
const SixthsWhyVisual = () => {
  // 5 of 6 pieces (4 rects + 2 triangles = 5 units)
  const leftColored = ["c0r0", "c1r0", "c0r1", "c1r1", "c2r1_br", "c2r1_tl"];
  const size = 140;

  return (
    <div className="mt-12">
      <div className="
        relative max-w-4xl mx-auto
        rounded-[40px]
        text-white
        px-6 py-10 md:px-16 md:py-12
        shadow-[0_32px_80px_rgba(15,23,42,0.45)]
        bg-[radial-gradient(circle_at_top,_#ffffff33,_transparent_55%),linear-gradient(135deg,#5b3ff7,#7c3aed,#5b3ff7)]
        overflow-hidden
      ">
        <div className="pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full border border-white/40 bg-white/15 flex items-center justify-center mb-1">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            Fractions Master
          </h2>
          <p className="text-sm md:text-base text-violet-100 max-w-2xl">
            Fractions are built out of equal-sized parts.
            We can use pictures to see what{" "}
            <span className="font-semibold text-white">5/6</span> really means.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div
            className="
              bg-white rounded-[32px] shadow-lg
              px-6 py-6 md:px-10 md:py-8
              flex flex-col md:flex-row items-center justify-center
              gap-6 md:gap-10
              text-slate-800
            "
          >
            {/* Original shape */}
            <div className="flex flex-col items-center gap-2">
              <CombiningShape
                coloredIds={leftColored}
                size={size}
                readOnly
              />
              <span className="text-xs font-semibold text-slate-500">
                Original shape
              </span>
            </div>

            {/* Exploded View */}
            <div className="flex flex-col items-center gap-2">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
              >
                {/* Outer border */}
                <rect
                  x={0}
                  y={0}
                  width={size}
                  height={size}
                  rx={0}
                  ry={0}
                  fill="#ffffff"
                  stroke="#111827"
                  strokeWidth={3}
                />
                {/* Grid lines: 3 cols x 2 rows */}
                <line
                  x1={size / 3}
                  y1={0}
                  x2={size / 3}
                  y2={size}
                  stroke="#111827"
                  strokeWidth={2}
                />
                <line
                  x1={(2 * size) / 3}
                  y1={0}
                  x2={(2 * size) / 3}
                  y2={size}
                  stroke="#111827"
                  strokeWidth={2}
                />
                <line
                  x1={0}
                  y1={size / 2}
                  x2={size}
                  y2={size / 2}
                  stroke="#111827"
                  strokeWidth={2}
                />

                {/* Coloring 5 of 6 pieces (4 rects + 2 triangles) */}
                {/* Rects */}
                {["c0r0", "c1r0", "c0r1", "c1r1"].map((id) => {
                  const col = Number(id[1]);
                  const row = Number(id[3]);
                  const x = (col * size) / 3;
                  const y = (row * size) / 2;
                  return (
                    <rect
                      key={id}
                      x={x}
                      y={y}
                      width={size / 3}
                      height={size / 2}
                      fill="#facc15"
                      stroke="transparent"
                    />
                  );
                })}
                {/* 5th piece: Bottom-Right Square made of 2 triangles */}
                {/* Tri 1: Bottom-Right of Bottom Cell */}
                 <polygon 
                   points={`${(2*size)/3},${size} ${size},${size} ${size},${size/2}`} 
                   fill="#facc15" stroke="transparent" 
                 />
                 {/* Tri 2: Top-Left of Bottom Cell */}
                 <polygon 
                   points={`${(2*size)/3},${size} ${(2*size)/3},${size/2} ${size},${size/2}`} 
                   fill="#facc15" stroke="transparent" 
                 />

              </svg>
              <span className="text-xs font-semibold text-slate-500">
                5 of 6 equal parts
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm md:text-base text-violet-100 text-center max-w-xl mx-auto">
          By combining pieces, we see that{" "}
          <span className="font-semibold text-white">5/6</span> of the shape is{" "}
          <span className="font-semibold text-white">
            5 of 6 equal parts.
          </span>
        </p>
      </div>
    </div>
  );
};

// ----------------------------
// Lesson steps
// ----------------------------
const COMBINING_STEPS = [
  {
    id: "third_1",
    title: "Combining Parts",
    label: "Step 1",
    prompt: "Color 1/3 of the shape.",
    target: { num: 1, den: 3 },
    whyKind: "short_thirds",
    helper:
      "1/3 means one of three equal parts. Our shape can be broken into 3 equal-sized columns.",
  },
  {
    id: "third_2",
    title: "Combining Parts",
    label: "Step 2",
    prompt: "Color 2/3 of the shape.",
    target: { num: 2, den: 3 },
    whyKind: "thirds",
    helper:
      "2/3 means two of three equal parts. Try shading two whole columns.",
  },
  {
    id: "sixth_1",
    title: "Equal Pieces",
    label: "Step 3",
    prompt: "Color 1/6 of the shape.",
    target: { num: 1, den: 6 },
    whyKind: "short_sixths",
    helper:
      "The shape is made of 6 equal pieces. 1/6 is just one of these pieces.",
  },
  {
    id: "sixth_2",
    title: "Equal Pieces",
    label: "Step 4",
    prompt: "Color 5/6 of the shape.",
    target: { num: 5, den: 6 },
    whyKind: "sixths",
    helper: "5/6 means 5 of 6 equal pieces. Leave just one piece white.",
  },
];

// ----------------------------
// Single step component
// ----------------------------
const CombiningShapeStep = ({ step, isCompleted, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("idle"); // idle | low | high | correct
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const targetFraction = step.target.num / step.target.den;

  const handleCheck = () => {
    // UPDATED CHECK LOGIC:
    // Rectangles count as 1 unit.
    // Triangles count as 0.5 units.
    // Total area is 6 units.
    
    let score = 0;
    selectedIds.forEach(id => {
       const cell = CELLS.find(c => c.id === id);
       if (cell && cell.type.startsWith('tri')) {
         score += 0.5;
       } else {
         score += 1;
       }
    });

    const ratio = score / 6.0;

    if (Math.abs(ratio - targetFraction) < 1e-6) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else if (ratio < targetFraction) {
      setFeedback("low");
      setShowConfetti(false);
      playSound("error");
    } else {
      setFeedback("high");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const toggleCell = (cellId) => {
    playSound("pop");
    setSelectedIds((prev) =>
      prev.includes(cellId)
        ? prev.filter((id) => id !== cellId)
        : [...prev, cellId]
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
          a bit more.
        </div>
      );
    }
    if (feedback === "high") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
          <Info size={18} className="shrink-0" />
          You colored more than {step.target.num}/{step.target.den}. Try
          un–coloring some pieces.
        </div>
      );
    }
    return null;
  };

  const renderWhyContent = () => {
    if (!showWhy) return null;

    if (step.whyKind === "thirds") return <ThirdsWhyVisual />;
    if (step.whyKind === "sixths") return <SixthsWhyVisual />;

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
        {/* LEFT: text + controls */}
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

            <p className="text-base md:text-lg text-slate-800 mb-3">
              {step.prompt}
            </p>

            <p className="text-sm text-slate-500">{step.helper}</p>

            <div className="mt-5 space-y-3">
              {renderFeedback()}

              {/* controls row – CHECK FIRST */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* CHECK */}
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-5 py-3 rounded-2xl font-black text-sm md:text-base bg-slate-900 text-white shadow-lg shadow-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                {/* WHY */}
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

                {/* RESET */}
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

        {/* RIGHT: shape */}
        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 mx-auto md:mx-0 border-white shadow-slate-200/60">
          <CombiningShape coloredIds={selectedIds} onToggle={toggleCell} />
          {showConfetti && <ConfettiBurst />}
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// Main lesson component
// ----------------------------
const CombiningPartsLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);
  const totalProblems = COMBINING_STEPS.length;
  const allDone = completedSteps.length === totalProblems;

  const activeStepIndex = completedSteps.length;
  const visibleSteps = COMBINING_STEPS.slice(0, activeStepIndex + 1);

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
      {/* sticky header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Combining Parts
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
                / {totalProblems}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* steps timeline */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              {/* timeline dots on desktop */}
              <div className="hidden md:flex absolute -left-10 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    completedSteps.includes(step.id)
                      ? "bg-amber-400 border-amber-400 text-white"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                )}
              </div>

              <CombiningShapeStep
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

              {/* mobile connector */}
              {!isLast && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full"></div>
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}

        {/* TIP at the end */}
        {allDone && (
          <div className="mt-4 md:mt-8">
            <SixthsWhyVisual />
          </div>
        )}
      </div>

      {/* local styles for animations */}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default CombiningPartsLesson;