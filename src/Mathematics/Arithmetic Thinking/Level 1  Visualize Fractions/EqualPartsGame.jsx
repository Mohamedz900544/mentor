// EqualPartsGame.jsx
import React, { useState, useEffect, useRef } from "react";
import { Check, X, RotateCcw, Trophy, Sparkles } from "lucide-react";

// ----------------------------
// Simple sound system
// ----------------------------
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/pop.mp3",
  error: "/audio/matrix_intro.mp3",
};

const playSound = (key) => {
  try {
    const audio = new Audio(SOUNDS[key]);
    if (key === "win") audio.volume = 0.6;
    else audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
};

// ----------------------------
// SVG helpers
// ----------------------------
const SquareFrame = ({ children }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
    {/* 1. Background Fill */}
    <rect
      x={4}
      y={4}
      width={92}
      height={92}
      rx={2}
      ry={2}
      fill="#ffffff"
      stroke="none"
    />
    
    {/* 2. Content (Shapes & Internal Lines) */}
    {children}

    {/* 3. Outer Border (Always on top) */}
    <rect
      x={4}
      y={4}
      width={92}
      height={92}
      rx={2}
      ry={2}
      fill="none"
      stroke="#111827"
      strokeWidth={2}
    />
  </svg>
);

// ---- Q1 shapes (1/2, purple) ----
const ShapeQ1A = ({ color }) => (
  <SquareFrame>
    <polygon points="4,4 96,4 50,96" fill={color} stroke="none" />
  </SquareFrame>
);

const ShapeQ1B = ({ color }) => (
  <SquareFrame>
    <rect x={4} y={4} width={46} height={92} fill={color} />
  </SquareFrame>
);

const ShapeQ1C = ({ color }) => (
  <SquareFrame>
    <polygon points="4,96 96,96 96,4" fill={color} stroke="none" />
  </SquareFrame>
);

// The Wrong Shape – NOT 1/2
const ShapeQ1D = ({ color }) => (
  <SquareFrame>
    <polygon points="4,4 70,4 30,96 4,96" fill={color} stroke="none" />
  </SquareFrame>
);

// ---- Q2 shapes (1/4, yellow) ----
const QuarterGridBase = ({ children }) => (
  <SquareFrame>
    {/* Colored areas first */}
    {children}
    {/* Lines on top */}
    <line x1={50} y1={4} x2={50} y2={96} stroke="#111827" strokeWidth={1.4} />
    <line x1={4} y1={50} x2={96} y2={50} stroke="#111827" strokeWidth={1.4} />
  </SquareFrame>
);

// The Wrong Shape (NOT 1/4) - Clearly smaller
const ShapeQ2A = ({ color }) => (
  <QuarterGridBase>
    <rect x={4} y={50} width={23} height={46} fill={color} />
  </QuarterGridBase>
);

// Correct 1/4
const ShapeQ2B = ({ color }) => (
  <QuarterGridBase>
    <rect x={50} y={4} width={46} height={46} fill={color} />
  </QuarterGridBase>
);

const ShapeQ2C = ({ color }) => (
  <QuarterGridBase>
    <rect x={50} y={50} width={46} height={46} fill={color} />
  </QuarterGridBase>
);

const ShapeQ2D = ({ color }) => (
  <QuarterGridBase>
    <rect x={4} y={50} width={46} height={46} fill={color} />
  </QuarterGridBase>
);

// ---- Q3 shapes (1/3, teal) ----
const ThirdsGridBase = ({ children }) => (
  <SquareFrame>
    {/* Colored areas first */}
    {children}
    {/* Lines on top */}
    <line x1={36} y1={4} x2={36} y2={96} stroke="#111827" strokeWidth={1.2} />
    <line x1={68} y1={4} x2={68} y2={96} stroke="#111827" strokeWidth={1.2} />
    <line x1={4} y1={36} x2={96} y2={36} stroke="#111827" strokeWidth={1.2} />
    <line x1={4} y1={68} x2={96} y2={68} stroke="#111827" strokeWidth={1.2} />
  </SquareFrame>
);

const ThirdsVerticalBase = ({ children }) => (
  <SquareFrame>
    {/* Colored areas first */}
    {children}
    {/* Lines on top */}
    <line x1={34.6} y1={4} x2={34.6} y2={96} stroke="#111827" strokeWidth={1.2} />
    <line x1={65.3} y1={4} x2={65.3} y2={96} stroke="#111827" strokeWidth={1.2} />
  </SquareFrame>
);

const ShapeQ3A = ({ color }) => (
  <ThirdsGridBase>
    <rect x={4} y={4} width={32} height={32} fill={color} />
    <rect x={36} y={36} width={32} height={32} fill={color} />
    <rect x={68} y={68} width={32} height={32} fill={color} />
  </ThirdsGridBase>
);

const ShapeQ3B = ({ color }) => (
  <ThirdsGridBase>
    <rect x={68} y={4} width={32} height={32} fill={color} />
    <rect x={36} y={36} width={32} height={32} fill={color} />
    <rect x={4} y={68} width={32} height={32} fill={color} />
  </ThirdsGridBase>
);

const ShapeQ3C = ({ color }) => (
  <ThirdsVerticalBase>
    <rect x={4} y={4} width={30.6} height={92} fill={color} />
  </ThirdsVerticalBase>
);

const ShapeQ3D = ({ color }) => (
  <SquareFrame>
    {/* Fill first */}
    <polygon points="4,96 50,50 96,96" fill={color} />
    {/* Lines on top */}
    <line x1={4} y1={4} x2={4} y2={96} stroke="#111827" strokeWidth={1.4} />
    <line x1={4} y1={96} x2={96} y2={96} stroke="#111827" strokeWidth={1.4} />
  </SquareFrame>
);

// ---- Q4 shapes (1/2, pink) ----
const ShapeQ4A = ({ color }) => (
  <SquareFrame>
    <polygon points="50,4 96,50 50,96 4,50" fill={color} />
  </SquareFrame>
);

const ShapeQ4B = ({ color }) => (
  <SquareFrame>
    {/* Colors first */}
    <rect x={4} y={4} width={46} height={46} fill={color} />
    <rect x={50} y={4} width={46} height={46} fill={color} />
    <rect x={4} y={50} width={46} height={46} fill={color} />
    {/* Lines on top */}
    <line x1={50} y1={4} x2={50} y2={96} stroke="#6b7280" strokeWidth={1.2} />
    <line x1={4} y1={50} x2={96} y2={50} stroke="#6b7280" strokeWidth={1.2} />
  </SquareFrame>
);

const ShapeQ4C = ({ color }) => (
  <SquareFrame>
    <rect x={4} y={4} width={92} height={46} fill={color} />
  </SquareFrame>
);

const ShapeQ4D = ({ color }) => (
  <SquareFrame>
    {/* Colors first (Checkerboard triangles) */}
    <polygon points="4,4 50,50 4,50" fill={color} />
    <polygon points="50,4 96,4 50,50" fill={color} />
    <polygon points="96,50 96,96 50,50" fill={color} />
    <polygon points="50,96 4,96 50,50" fill={color} />

    {/* Lines on top */}
    <line x1={4} y1={50} x2={96} y2={50} stroke="#6b7280" strokeWidth={1.2} />
    <line x1={50} y1={4} x2={50} y2={96} stroke="#6b7280" strokeWidth={1.2} />
    <line x1={4} y1={4} x2={96} y2={96} stroke="#6b7280" strokeWidth={1.2} />
    <line x1={96} y1={4} x2={4} y2={96} stroke="#6b7280" strokeWidth={1.2} />
  </SquareFrame>
);

// ----------------------------
// Questions config
// ----------------------------
const QUESTIONS = [
  {
    id: "q1",
    color: "#a855f7",
    fractionText: "1/2",
    prompt: "Which shape does NOT have 1/2 colored?",
    options: [
      { id: "q1a", Shape: ShapeQ1A, isAnswer: false },
      { id: "q1b", Shape: ShapeQ1B, isAnswer: false },
      { id: "q1c", Shape: ShapeQ1C, isAnswer: false },
      { id: "q1d", Shape: ShapeQ1D, isAnswer: true },
    ],
  },
  {
    id: "q2",
    color: "#facc15",
    fractionText: "1/4",
    prompt: "Which shape does NOT have 1/4 colored?",
    options: [
      { id: "q2a", Shape: ShapeQ2A, isAnswer: true },
      { id: "q2b", Shape: ShapeQ2B, isAnswer: false },
      { id: "q2c", Shape: ShapeQ2C, isAnswer: false },
      { id: "q2d", Shape: ShapeQ2D, isAnswer: false },
    ],
  },
  {
    id: "q3",
    color: "#14b8a6",
    fractionText: "1/3",
    prompt: "Which shape does NOT have 1/3 colored?",
    options: [
      { id: "q3a", Shape: ShapeQ3A, isAnswer: false },
      { id: "q3b", Shape: ShapeQ3B, isAnswer: false },
      { id: "q3c", Shape: ShapeQ3C, isAnswer: false },
      { id: "q3d", Shape: ShapeQ3D, isAnswer: true },
    ],
  },
  {
    id: "q4",
    color: "#f472b6",
    fractionText: "1/2",
    prompt: "Which shape does NOT have 1/2 colored?",
    options: [
      { id: "q4a", Shape: ShapeQ4A, isAnswer: false },
      { id: "q4b", Shape: ShapeQ4B, isAnswer: true },
      { id: "q4c", Shape: ShapeQ4C, isAnswer: false },
      { id: "q4d", Shape: ShapeQ4D, isAnswer: false },
    ],
  },
];

// ----------------------------
// Option card
// ----------------------------
const OptionCard = ({ question, option, isSelected, status, onClick }) => {
  const { Shape } = option;

  const isCorrectSelected = isSelected && status === "correct";
  const isWrongSelected = isSelected && status === "wrong";

  let border =
    "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50";
  let ring = "";
  let shadow = "shadow-sm";

  if (isCorrectSelected) {
    border = "border-emerald-500 bg-emerald-50";
    ring = "ring-2 ring-emerald-300";
    shadow = "shadow-md";
  } else if (isWrongSelected) {
    border = "border-rose-500 bg-rose-50";
    ring = "ring-2 ring-rose-200";
    shadow = "shadow-md";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-[1.75rem] border-2 ${border} ${ring} ${shadow} p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        status === "correct" ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <div className="w-36 h-36 md:w-40 md:h-40">
        <Shape color={question.color} />
      </div>

      {isCorrectSelected && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
          <Check size={16} />
        </div>
      )}
      {isWrongSelected && (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md">
          <X size={16} />
        </div>
      )}
    </button>
  );
};

// ----------------------------
// Question card
// ----------------------------
const QuestionCard = ({ index, question, state, onOptionClick }) => {
  const { selectedId, status } = state;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-slate-100 text-slate-500">
            Question {index + 1}
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: question.color }}
            ></span>
          </span>
          <h2 className="mt-3 text-lg md:text-xl font-semibold text-slate-900">
            {question.prompt}
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Exactly <span className="font-semibold">one</span> of these shapes
            is NOT colored with{" "}
            <span className="font-semibold">{question.fractionText}</span> of
            its area.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-2">
        {question.options.map((option) => (
          <OptionCard
            key={option.id}
            question={question}
            option={option}
            isSelected={selectedId === option.id}
            status={status}
            onClick={() => onOptionClick(index, option)}
          />
        ))}
      </div>

      <div className="mt-2 text-sm text-slate-500">
        {status === "correct" && (
          <span className="font-semibold text-emerald-600">
            Correct! That shape does NOT show {question.fractionText}.
          </span>
        )}
        {status === "wrong" && (
          <span className="font-semibold text-rose-500">
            Incorrect. That shape DOES show {question.fractionText}. Try finding the one that doesn't.
          </span>
        )}
        {status === "idle" && <span>Tap a shape to choose your answer.</span>}
      </div>
    </div>
  );
};

// ----------------------------
// Main component
// ----------------------------
const EqualPartsGame = () => {
  const [questionStates, setQuestionStates] = useState(
    QUESTIONS.map(() => ({ selectedId: null, status: "idle" }))
  );

  const bottomRef = useRef(null);

  const correctCount = questionStates.filter((s) => s.status === "correct")
    .length;
  const totalQuestions = QUESTIONS.length;

  const visibleCount = Math.min(correctCount + 1, totalQuestions);
  const visibleQuestions = QUESTIONS.slice(0, visibleCount);

  useEffect(() => {
    if (!bottomRef.current) return;
    setTimeout(() => {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 350);
  }, [visibleCount]);

  const handleOptionClick = (qIndex, option) => {
    setQuestionStates((prev) => {
      const current = prev[qIndex];
      if (current.status === "correct") return prev;

      const nextStates = [...prev];
      const updated = { ...current, selectedId: option.id };

      playSound("pop");

      if (option.isAnswer) {
        updated.status = "correct";
        playSound("win");
      } else {
        updated.status = "wrong";
        playSound("error");
      }

      nextStates[qIndex] = updated;
      return nextStates;
    });
  };

  const handleResetAll = () => {
    setQuestionStates(QUESTIONS.map(() => ({ selectedId: null, status: "idle" })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* sticky header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Equal Parts
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                Visual Fractions Quiz
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <RotateCcw size={14} />
              Start over
            </button>

            <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
              <Trophy
                size={16}
                className={
                  correctCount > 0
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-300 fill-slate-300"
                }
              />
              <div className="flex items-baseline gap-1">
                <span className="font-black text-slate-700">
                  {correctCount}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* stacked questions */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-8 space-y-8 md:space-y-10">
        {visibleQuestions.map((q, index) => {
          const isLast = index === visibleQuestions.length - 1;
          return (
            <div
              key={q.id}
              ref={isLast ? bottomRef : null}
              className="animate-in slide-in-from-bottom-6 fade-in duration-500"
            >
              <QuestionCard
                index={index}
                question={q}
                state={questionStates[index]}
                onOptionClick={handleOptionClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EqualPartsGame;