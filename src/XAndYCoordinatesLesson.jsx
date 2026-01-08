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
  pop: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.m4a",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a",
  snap: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
};

// --- LESSON DATA: X & Y COORDS ---
const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    instruction: (
      <>
        Select all points that are <span className="font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md mx-1 border border-pink-100">2</span> steps to the right of the y-axis.
      </>
    ),
    hint: "The y-axis is the vertical line on the left. Count 2 steps right from it.",
    gridSize: 6,
    gridLabel: "Distance from Y-Axis",
    mode: "select_multiple",
    targetAxis: 'x', // Target X value
    targetValue: 2,
    options: [
      { id: 'A', x: 2, y: 1, correct: true },
      { id: 'B', x: 2, y: 3, correct: true },
      { id: 'C', x: 2, y: 5, correct: true },
      { id: 'D', x: 1, y: 2, correct: false },
      { id: 'E', x: 4, y: 4, correct: false },
      { id: 'F', x: 0, y: 2, correct: false }
    ]
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    instruction: (
      <>
        Select all points that are <span className="font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md mx-1 border border-pink-100">4</span> steps to the right of the y-axis.
      </>
    ),
    hint: "The correct points are 4 steps right of the left edge of the plot.",
    gridSize: 6,
    gridLabel: "Distance from Y-Axis",
    mode: "select_multiple",
    targetAxis: 'x',
    targetValue: 4,
    options: [
      { id: 'A', x: 4, y: 0, correct: true },
      { id: 'B', x: 4, y: 2, correct: true },
      { id: 'C', x: 4, y: 4, correct: true },
      { id: 'D', x: 2, y: 4, correct: false },
      { id: 'E', x: 5, y: 1, correct: false },
      { id: 'F', x: 3, y: 3, correct: false }
    ]
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    instruction: (
      <>
        Select all points that are <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mx-1 border border-blue-100">3</span> steps above the x-axis.
      </>
    ),
    hint: "The x-axis is the bottom line. Count 3 steps up from it.",
    gridSize: 6,
    gridLabel: "Distance from X-Axis",
    mode: "select_multiple",
    targetAxis: 'y', // Target Y value
    targetValue: 3,
    options: [
      { id: 'A', x: 1, y: 3, correct: true },
      { id: 'B', x: 3, y: 3, correct: true },
      { id: 'C', x: 5, y: 3, correct: true },
      { id: 'D', x: 3, y: 1, correct: false },
      { id: 'E', x: 2, y: 2, correct: false },
      { id: 'F', x: 4, y: 5, correct: false }
    ]
  },
  {
    id: "info_concept",
    type: "interactive_info",
    title: "X and Y Coordinates",
    content: (
        <div className="space-y-4">
            <p>The number of steps to the <strong>right</strong> (x-axis direction) is the <span className="text-pink-600 font-bold">x-coordinate</span>.</p>
            <p>The number of steps <strong>up</strong> (y-axis direction) is the <span className="text-blue-600 font-bold">y-coordinate</span>.</p>
        </div>
    ),
    gridSize: 6,
    highlight: "coords_concept"
  },
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    instruction: (
      <>
        Select all points with an x-coordinate of <span className="font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md mx-1 border border-pink-100">1</span>.
      </>
    ),
    hint: "Points with an x-coordinate of 1 are 1 step to the right of the y-axis.",
    gridSize: 6,
    gridLabel: "X-Coordinate = 1",
    mode: "select_multiple",
    targetAxis: 'x',
    targetValue: 1,
    options: [
      { id: 'A', x: 1, y: 1, correct: true },
      { id: 'B', x: 1, y: 3, correct: true },
      { id: 'C', x: 1, y: 5, correct: true },
      { id: 'D', x: 0, y: 1, correct: false },
      { id: 'E', x: 3, y: 1, correct: false },
      { id: 'F', x: 2, y: 2, correct: false }
    ]
  },
  {
    id: "prob5",
    type: "problem",
    title: "Problem 5",
    instruction: (
      <>
        Select all points with a y-coordinate of <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mx-1 border border-blue-100">2</span>.
      </>
    ),
    hint: "Points with a y-coordinate of 2 are 2 steps above the x-axis.",
    gridSize: 6,
    gridLabel: "Y-Coordinate = 2",
    mode: "select_multiple",
    targetAxis: 'y',
    targetValue: 2,
    options: [
      { id: 'A', x: 0, y: 2, correct: true },
      { id: 'B', x: 2, y: 2, correct: true },
      { id: 'C', x: 4, y: 2, correct: true },
      { id: 'D', x: 2, y: 0, correct: false },
      { id: 'E', x: 2, y: 4, correct: false },
      { id: 'F', x: 3, y: 3, correct: false }
    ]
  },
  {
    id: "prob6",
    type: "problem",
    title: "Problem 6",
    instruction: (
      <>
        Select all points with a y-coordinate of <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mx-1 border border-blue-100">5</span>.
      </>
    ),
    hint: "These points are 5 steps above the x-axis.",
    gridSize: 6,
    gridLabel: "Y-Coordinate = 5",
    mode: "select_multiple",
    targetAxis: 'y',
    targetValue: 5,
    options: [
      { id: 'A', x: 1, y: 5, correct: true },
      { id: 'B', x: 3, y: 5, correct: true },
      { id: 'C', x: 5, y: 5, correct: true },
      { id: 'D', x: 5, y: 1, correct: false },
      { id: 'E', x: 4, y: 4, correct: false },
      { id: 'F', x: 0, y: 0, correct: false }
    ]
  },
  {
    id: "final_info",
    type: "interactive_info",
    title: "Lesson Complete",
    content: "When giving a point’s coordinates, the x-coordinate (right) is always given before the y-coordinate (up).",
    gridSize: 6,
    highlight: "ordered_pair"
  }
];

// --- CONFETTI COMPONENT ---
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    color: ['#ec4899', '#3b82f6', '#fbbf24', '#22c55e', '#8b5cf6'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.1
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
            '--tx': `${p.x}px`,
            '--ty': `${p.y}px`,
            '--rot': `${p.rotation}deg`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
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
    if (isCompleted && step.mode === 'select_multiple') {
        const correctIds = step.options.filter(o => o.correct).map(o => o.id);
        setSelectedIds(correctIds);
        setFeedback("success");
    }
  }, [isCompleted, step.options, step.mode]);

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      if (key === 'win') audio.volume = 0.6;
      else if (key === 'snap') audio.volume = 0.2;
      else audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handlePointClick = (option) => {
      if (isCompleted) return;
      
      setSelectedIds(prev => {
          const exists = prev.includes(option.id);
          playSound("pop");
          if (exists) return prev.filter(id => id !== option.id);
          return [...prev, option.id];
      });
      setFeedback("idle");
  };

  const checkAnswerMultiple = () => {
      const selected = new Set(selectedIds);
      const correct = new Set(step.options.filter(o => o.correct).map(o => o.id));
      
      if (selected.size === correct.size && [...selected].every(id => correct.has(id))) {
          playSound("win");
          setFeedback("success");
          setShowConfetti(true);
          onComplete();
      } else {
          playSound("error");
          setFeedback("error");
      }
  };

  // --- SVG RENDER ---
  const renderGridSVG = (readOnly = false, highlightMode = null) => {
    const size = 300;
    const gridSize = step.gridSize || 6;
    const stepSize = size / gridSize;
    const lines = [];

    // Grid lines
    for (let i = 0; i <= gridSize; i++) {
      const p = i * stepSize;
      
      let vStroke = "#e2e8f0";
      let hStroke = "#e2e8f0";
      let vWidth = 1;
      let hWidth = 1;

      if (i === 0) { vStroke = "#1e293b"; vWidth = 3; }
      if (i === gridSize) { hStroke = "#1e293b"; hWidth = 3; }

      lines.push(<line key={`v${i}`} x1={p} y1={0} x2={p} y2={size} stroke={vStroke} strokeWidth={vWidth} />);
      lines.push(<line key={`h${i}`} x1={0} y1={p} x2={size} y2={p} stroke={hStroke} strokeWidth={hWidth} />);
    }

    // Guides & Labels
    const guides = [];
    guides.push(<text key="xlabel" x={size - 20} y={size - 10} fill="#94a3b8" fontWeight="bold" fontSize="16">x</text>);
    guides.push(<text key="ylabel" x={10} y={20} fill="#94a3b8" fontWeight="bold" fontSize="16">y</text>);

    // Concept Highlight: Show Coordinate Arrows
    if (highlightMode === 'coords_concept' || highlightMode === 'ordered_pair') {
        const cx = 3 * stepSize;
        const cy = size - (2 * stepSize);
        
        // Example point (3,2)
        guides.push(<circle key="ex_pt" cx={cx} cy={cy} r={8} fill="#8b5cf6" stroke="white" strokeWidth={2} />);
        
        // Arrows
        guides.push(
            <g key="arrows">
                <line x1={0} y1={size} x2={cx} y2={size} stroke="#ec4899" strokeWidth="4" markerEnd="url(#arrowhead_x)" />
                <line x1={cx} y1={size} x2={cx} y2={cy} stroke="#3b82f6" strokeWidth="4" markerEnd="url(#arrowhead_y)" strokeDasharray="4,4" />
                
                {/* Labels */}
                <text x={cx/2} y={size+25} fill="#ec4899" textAnchor="middle" fontWeight="bold">x-coordinate</text>
                <text x={cx+10} y={(size+cy)/2} fill="#3b82f6" textAnchor="start" fontWeight="bold">y-coordinate</text>
            </g>
        );
        
        if (highlightMode === 'ordered_pair') {
             guides.push(
                 <text key="pair" x={cx} y={cy - 20} textAnchor="middle" fontSize="24" fontWeight="black" fill="#1e293b">
                     (<tspan fill="#ec4899">x</tspan>, <tspan fill="#3b82f6">y</tspan>)
                 </text>
             );
        }
    }

    // Hint Path (Highlight the target row/column)
    const hintVisuals = [];
    if (!readOnly && showHint && !isCompleted && step.targetValue !== undefined) {
       if (step.targetAxis === 'x') {
           // Highlight specific X column
           const xPos = step.targetValue * stepSize;
           hintVisuals.push(<rect x={xPos - 2} y={0} width={4} height={size} fill="#ec4899" opacity="0.3" />);
           hintVisuals.push(<text x={xPos} y={size+20} fill="#ec4899" textAnchor="middle" fontWeight="bold">x={step.targetValue}</text>);
       } else if (step.targetAxis === 'y') {
           // Highlight specific Y row
           const yPos = size - (step.targetValue * stepSize);
           hintVisuals.push(<rect x={0} y={yPos - 2} width={size} height={4} fill="#3b82f6" opacity="0.3" />);
           hintVisuals.push(<text x={-10} y={yPos+5} fill="#3b82f6" textAnchor="end" fontWeight="bold">y={step.targetValue}</text>);
       }
    }

    return (
      <div className="relative">
        <svg ref={svgRef} width={size} height={size} className="overflow-visible touch-none select-none">
          <defs>
              <marker id="arrowhead_x" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" fill="#ec4899">
                  <polygon points="0 0, 6 3, 0 6" />
              </marker>
              <marker id="arrowhead_y" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" fill="#3b82f6">
                  <polygon points="0 0, 6 3, 0 6" />
              </marker>
          </defs>
          
          {lines}
          {guides}
          {hintVisuals}
          
          {/* SELECTION POINTS */}
          {step.mode === 'select_multiple' && !readOnly && step.options.map((opt) => {
              const opx = opt.x * stepSize;
              const opy = size - (opt.y * stepSize);
              const isSelected = selectedIds.includes(opt.id);
              
              // Color Logic
              let fillColor = isSelected ? "#3b82f6" : "white"; 
              let strokeColor = isSelected ? "#3b82f6" : "#cbd5e1";
              
              if (isCompleted) {
                  if (opt.correct) {
                      fillColor = "#22c55e"; strokeColor = "#22c55e";
                  } else if (isSelected && !opt.correct) {
                      fillColor = "#ef4444"; strokeColor = "#ef4444";
                  }
              } else if (feedback === 'error' && isSelected) {
                   fillColor = "#ef4444"; strokeColor = "#ef4444";
              }

              return (
                  <g key={opt.id} onClick={() => handlePointClick(opt)} style={{cursor: isCompleted ? 'default' : 'pointer'}}>
                      <circle cx={opx} cy={opy} r={24} fill="transparent" /> {/* Hitbox */}
                      <circle cx={opx} cy={opy} r={8} fill={fillColor} stroke={strokeColor} strokeWidth="3" className="transition-all duration-200" />
                      {/* Hover effect */}
                      {!isCompleted && !isSelected && <circle cx={opx} cy={opy} r={12} fill="#3b82f6" opacity="0" className="hover:opacity-20 transition-opacity" />}
                  </g>
              );
          })}
  
          {/* Axis Number Labels */}
          <g transform={`translate(0, ${size + 15})`}>
               {[...Array(gridSize + 1)].map((_, i) => <text key={i} x={i * stepSize} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">{i}</text>)}
          </g>
          <g transform={`translate(-10, 0)`}>
               {[...Array(gridSize + 1)].map((_, i) => <text key={i} y={size - (i * stepSize) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="bold">{i}</text>)}
          </g>
        </svg>
        {showConfetti && <ConfettiBurst />}
      </div>
    );
  };

  return (
    <div className={`transition-all duration-700 ${isCompleted ? "opacity-90" : "opacity-100"}`}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            
            {/* INSTRUCTION CARD */}
            <div className="flex-1 space-y-4 w-full">
                 <div className={`bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all duration-500 ${isCompleted && step.type !== 'interactive_info' ? "border-green-200 shadow-green-50" : "border-slate-100 shadow-slate-200"}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {step.title}
                             </span>
                        </div>
                        {step.type === 'interactive_info' ? (
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
                        {step.type === 'interactive_info' ? step.content : step.instruction}
                    </div>

                    {step.type === 'interactive_info' && (
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

                 {/* ACTION BAR */}
                 {step.type === 'problem' && !isCompleted && (
                     <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in">
                        {feedback === "error" && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake border border-red-100">
                                <X size={20} /> Oops! Make sure you select ALL correct points.
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
                                onClick={() => { setSelectedIds([]); setFeedback("idle"); }}
                                className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                            >
                                <RotateCcw size={18} /> Reset
                            </button>
                            
                            <button 
                                onClick={checkAnswerMultiple}
                                className={`flex-1 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 
                                    ${selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
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
            <div className={`bg-white p-8 rounded-[2rem] shadow-xl border-4 mx-auto md:mx-0 transition-all duration-500 ${isCompleted && step.type !== 'interactive_info' ? "border-green-100 shadow-green-100/50" : "border-white shadow-slate-200/50"}`}>
                <div className="pl-4 pb-4">
                    {step.type === 'interactive_info' ? (
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
const XAndYCoordinatesLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);

  const activeStepIndex = completedSteps.length;
  const visibleSteps = LESSON_STEPS.slice(0, activeStepIndex + 1);

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
        setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
        setTimeout(() => {
             bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500); 
    }
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      
      {/* STICKY HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 py-3 shadow-sm">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                    <Grid size={20} strokeWidth={3} />
                </div>
                <div>
                    <h1 className="font-black text-base md:text-lg leading-none text-slate-800">Coordinates</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 4: X & Y</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
                <Trophy size={16} className={completedSteps.length > 0 ? "text-amber-500 fill-amber-500 animate-bounce" : "text-slate-300 fill-slate-300"} />
                <div className="flex items-baseline gap-1">
                    <span className="font-black text-slate-700">{completedSteps.filter(id => id.includes('prob')).length}</span>
                    <span className="text-xs font-bold text-slate-400">/ {LESSON_STEPS.filter(s => s.type === 'problem').length}</span>
                </div>
            </div>
         </div>
      </div>

      {/* TIMELINE FEED */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        
        {visibleSteps.map((step, index) => {
            const isLast = index === visibleSteps.length - 1;

            // --- PROBLEM & INTERACTIVE INFO CARDS ---
            return (
                <div key={step.id} className="relative animate-in slide-in-from-bottom-16 fade-in duration-700 fill-mode-backwards">
                    
                    {/* Step Number Timeline Visual */}
                    {step.type === 'problem' && (
                        <div className="absolute -left-3 md:-left-12 top-0 flex flex-col items-center h-full opacity-50 pointer-events-none hidden md:flex">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500
                                ${completedSteps.includes(step.id) ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-300"}
                            `}>
                                {step.id.replace('prob', '')}
                            </div>
                            {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>}
                        </div>
                    )}

                    <InteractiveGrid 
                        step={step} 
                        isCompleted={completedSteps.includes(step.id)}
                        onComplete={() => handleStepComplete(step.id)}
                    />
                    
                    {/* Mobile Connector */}
                    {!isLast && step.type === 'problem' && (
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

export default XAndYCoordinatesLesson;