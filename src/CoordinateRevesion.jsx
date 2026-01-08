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

// --- LESSON DATA ---
const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    instruction: (
      <>
        Select the point with the coordinates <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700">(3, 0)</span>.
      </>
    ),
    hint: "The point (3, 0) is 3 steps right along the x-axis and 0 steps up.",
    gridSize: 8,
    gridLabel: "Select (3, 0)",
    mode: "select_single",
    targetPoint: { x: 3, y: 0 }
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    instruction: "Select all the points on the x-axis.",
    hint: "The x-axis is the horizontal line at the bottom where y = 0.",
    gridSize: 8,
    gridLabel: "Find X-Axis",
    mode: "select_multiple",
    targetAxis: 'y', // condition is y = 0
    targetValue: 0,
    options: [
      { id: 'A', x: 1, y: 0, correct: true },
      { id: 'B', x: 3, y: 0, correct: true },
      { id: 'C', x: 6, y: 0, correct: true },
      { id: 'D', x: 2, y: 2, correct: false },
      { id: 'E', x: 0, y: 3, correct: false },
      { id: 'F', x: 4, y: 4, correct: false }
    ]
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    instruction: (
      <>
        Select all points with a y-coordinate of <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mx-1 border border-blue-100">6</span>.
      </>
    ),
    hint: "Points with y-coordinate 6 are 6 steps up from the bottom.",
    gridSize: 8,
    gridLabel: "Y = 6",
    mode: "select_multiple",
    targetAxis: 'y',
    targetValue: 6,
    options: [
      { id: 'A', x: 1, y: 6, correct: true },
      { id: 'B', x: 4, y: 6, correct: true },
      { id: 'C', x: 7, y: 6, correct: true },
      { id: 'D', x: 6, y: 4, correct: false }, 
      { id: 'E', x: 2, y: 2, correct: false },
      { id: 'F', x: 6, y: 0, correct: false }
    ]
  },
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    instruction: (
      <>
        Select all points with an x-coordinate of <span className="font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md mx-1 border border-pink-100">3</span>.
      </>
    ),
    hint: "Points with x-coordinate 3 are 3 steps to the right.",
    gridSize: 8,
    gridLabel: "X = 3",
    mode: "select_multiple",
    targetAxis: 'x',
    targetValue: 3,
    options: [
      { id: 'A', x: 3, y: 1, correct: true },
      { id: 'B', x: 3, y: 4, correct: true },
      { id: 'C', x: 3, y: 7, correct: true },
      { id: 'D', x: 1, y: 3, correct: false },
      { id: 'E', x: 5, y: 3, correct: false },
      { id: 'F', x: 0, y: 0, correct: false }
    ]
  },
  {
    id: "final_visual",
    type: "visual_diagram",
    title: "Revision Complete",
    content: "You can now identify points by their x and y coordinates!",
    examplePoint: { x: 3, y: 6 } 
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

// --- VISUAL EXPLANATION DIAGRAM (Last Step) ---
const VisualExplanation = ({ point }) => {
    const size = 300;
    const gridSize = 8;
    const stepSize = size / gridSize;
    const px = point.x * stepSize;
    const py = size - (point.y * stepSize);
    
    return (
        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-slate-100 mx-auto w-full max-w-[350px]">
            <svg width={size} height={size} className="overflow-visible select-none">
                <defs>
                    <marker id="arrow_viz" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b" />
                    </marker>
                </defs>

                <line x1={0} y1={size} x2={size} y2={size} stroke="#1e293b" strokeWidth="4" markerEnd="url(#arrow_viz)" />
                <line x1={0} y1={size} x2={0} y2={0} stroke="#1e293b" strokeWidth="4" markerEnd="url(#arrow_viz)" />

                <line x1={px} y1={size} x2={px} y2={py} stroke="#ec4899" strokeWidth="2" strokeDasharray="6,4" />
                <line x1={0} y1={py} x2={px} y2={py} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" />

                <circle cx={px} cy={py} r={8} fill="#8b5cf6" stroke="white" strokeWidth="3" />
                
                <text x={px + 10} y={py - 10} className="font-mono text-lg font-bold" fill="#8b5cf6">({point.x}, {point.y})</text>
                
                <text x={px/2} y={size + 20} textAnchor="middle" fill="#ec4899" className="text-sm font-bold">x = {point.x}</text>
                <text x={-10} y={(size + py)/2} textAnchor="end" fill="#3b82f6" className="text-sm font-bold" transform={`rotate(-90, -15, ${(size+py)/2})`}>y = {point.y}</text>
            </svg>
        </div>
    );
};

// --- GRID COMPONENT ---
const InteractiveGrid = ({ step, isCompleted, onComplete }) => {
  // State for single selection (problem 1)
  const [selectedPoint, setSelectedPoint] = useState(null); 
  const [wrongAttempt, setWrongAttempt] = useState(null);

  // State for multiple selection (problems 2-4)
  const [selectedIds, setSelectedIds] = useState([]);

  const [feedback, setFeedback] = useState("idle");
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const svgRef = useRef(null);

  // Reset state on step change
  useEffect(() => {
    if (!isCompleted) {
        setSelectedPoint(null);
        setWrongAttempt(null);
        setSelectedIds([]);
        setFeedback("idle");
        setShowConfetti(false);
        setShowHint(false);
    } else {
        // Restore correct state visually if revisiting
        if (step.mode === 'select_single') {
            setSelectedPoint(step.targetPoint);
            setFeedback("success");
        } else if (step.mode === 'select_multiple') {
            const correctIds = step.options.filter(o => o.correct).map(o => o.id);
            setSelectedIds(correctIds);
            setFeedback("success");
        }
    }
  }, [step, isCompleted]);

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      if (key === 'win') audio.volume = 0.6;
      else if (key === 'snap') audio.volume = 0.2;
      else audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Handler for Single Selection (Prob 1) - Click anywhere on grid
  const handleGridClick = (x, y) => {
      if (isCompleted || step.mode !== 'select_single') return;

      if (x === step.targetPoint.x && y === step.targetPoint.y) {
          setSelectedPoint({ x, y });
          setWrongAttempt(null);
          playSound("win");
          setFeedback("success");
          setShowConfetti(true);
          onComplete();
      } else {
          setWrongAttempt({ x, y });
          playSound("error");
          setFeedback("error");
          setTimeout(() => setWrongAttempt(null), 1000);
      }
  };

  // Handler for Multiple Selection (Prob 2-4) - Click specific points
  const handleOptionClick = (option) => {
      if (isCompleted || step.mode !== 'select_multiple') return;
      
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
  const renderGridSVG = () => {
    const size = 300;
    const gridSize = step.gridSize || 8;
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

    // Hint Highlights (Rows/Cols)
    const hintVisuals = [];
    if (showHint && !isCompleted && step.mode === 'select_multiple') {
        if (step.targetAxis === 'x') {
            // Highlight specific X column
            const xPos = step.targetValue * stepSize;
            hintVisuals.push(<rect x={xPos - 2} y={0} width={4} height={size} fill="#ec4899" opacity="0.3" />);
        } else if (step.targetAxis === 'y') {
            // Highlight specific Y row
            const yPos = size - (step.targetValue * stepSize);
            hintVisuals.push(<rect x={0} y={yPos - 2} width={size} height={4} fill="#3b82f6" opacity="0.3" />);
        }
    }
    
    // Grid Intersections (For Single Select)
    const clickTargets = [];
    if (step.mode === 'select_single' && !isCompleted) {
        for (let x = 0; x <= gridSize; x++) {
            for (let y = 0; y <= gridSize; y++) {
                const cx = x * stepSize;
                const cy = size - (y * stepSize);
                
                // Visual state
                const isSelected = selectedPoint && selectedPoint.x === x && selectedPoint.y === y;
                const isWrong = wrongAttempt && wrongAttempt.x === x && wrongAttempt.y === y;
                
                let fillColor = "transparent";
                let radius = 8; // SMALLER CIRCLE DEFAULT
                let opacity = 0;

                if (isSelected) { fillColor = "#22c55e"; radius = 8; opacity = 1; }
                else if (isWrong) { fillColor = "#ef4444"; radius = 8; opacity = 1; }
                else { fillColor = "#3b82f6"; opacity = 0; } 

                clickTargets.push(
                    <g key={`${x}-${y}`} onClick={() => handleGridClick(x, y)} style={{cursor: 'pointer'}}>
                        <circle cx={cx} cy={cy} r={20} fill="transparent" />
                        {/* Interactive Circle with hover effect */}
                        <circle 
                            cx={cx} cy={cy} r={radius} 
                            fill={fillColor} 
                            stroke="white" 
                            strokeWidth={isSelected||isWrong ? 3 : 0} 
                            className={`transition-all duration-200 ${!isSelected && !isWrong ? "hover:opacity-40" : ""}`} 
                            style={{opacity: isSelected||isWrong ? 1 : undefined}} 
                        />
                        {isWrong && (
                             <g className="animate-bounce">
                                <rect x={cx - 30} y={cy - 35} width={60} height={24} rx={4} fill="#ef4444" />
                                <text x={cx} y={cy - 19} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">({x}, {y})</text>
                                <path d={`M ${cx} ${cy - 11} L ${cx - 6} ${cy - 11} L ${cx} ${cy - 5} L ${cx + 6} ${cy - 11} Z`} fill="#ef4444" />
                            </g>
                        )}
                    </g>
                );
            }
        }
    }
    // Render Selected Point if completed in single mode
    if (step.mode === 'select_single' && isCompleted) {
        const cx = step.targetPoint.x * stepSize;
        const cy = size - (step.targetPoint.y * stepSize);
        clickTargets.push(<circle key="winner" cx={cx} cy={cy} r={8} fill="#22c55e" stroke="white" strokeWidth={3} />);
    }

    return (
      <div className="relative pl-2">
        <svg ref={svgRef} width={size} height={size} className="overflow-visible touch-none select-none">
          {lines}
          {hintVisuals}
          {clickTargets}
          
          {/* MULTI SELECT POINTS */}
          {step.mode === 'select_multiple' && step.options.map((opt) => {
              const opx = opt.x * stepSize;
              const opy = size - (opt.y * stepSize);
              const isSelected = selectedIds.includes(opt.id);
              
              let fillColor = isSelected ? "#3b82f6" : "white"; 
              let strokeColor = isSelected ? "#3b82f6" : "#cbd5e1";
              
              if (isCompleted) {
                  if (opt.correct) { fillColor = "#22c55e"; strokeColor = "#22c55e"; }
                  else if (isSelected) { fillColor = "#ef4444"; strokeColor = "#ef4444"; }
              } else if (feedback === 'error' && isSelected) {
                   fillColor = "#ef4444"; strokeColor = "#ef4444";
              }

              return (
                  <g key={opt.id} onClick={() => handleOptionClick(opt)} style={{cursor: isCompleted ? 'default' : 'pointer'}}>
                      <circle cx={opx} cy={opy} r={24} fill="transparent" /> 
                      <circle cx={opx} cy={opy} r={8} fill={fillColor} stroke={strokeColor} strokeWidth="3" className="transition-all duration-200" />
                      {!isCompleted && !isSelected && <circle cx={opx} cy={opy} r={12} fill="#3b82f6" opacity="0" className="hover:opacity-20 transition-opacity" />}
                  </g>
              );
          })}
  
          {/* Axis Labels */}
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
                 <div className={`bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all duration-500 ${isCompleted ? "border-green-200 shadow-green-50" : "border-slate-100 shadow-slate-200"}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {step.title}
                             </span>
                        </div>
                        {isCompleted ? (
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
                        {step.instruction}
                    </div>

                 </div>

                 {/* ACTION BAR */}
                 {!isCompleted && (
                     <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in">
                        {feedback === "error" && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake border border-red-100">
                                <X size={20} /> Oops! Check the hint and try again.
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowHint(!showHint)}
                                className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95 flex-1"
                            >
                                <HelpCircle size={18} /> Need a Hint?
                            </button>
                            
                            {step.mode === 'select_multiple' && (
                                <button 
                                    onClick={() => { setSelectedIds([]); setFeedback("idle"); }}
                                    className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <RotateCcw size={18} /> Reset
                                </button>
                            )}

                            {step.mode === 'select_multiple' && (
                                <button 
                                    onClick={checkAnswerMultiple}
                                    className={`flex-1 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 
                                        ${selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                    disabled={selectedIds.length === 0}
                                >
                                    Check <ArrowRight size={20} />
                                </button>
                            )}
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
            <div className={`bg-white p-8 rounded-[2rem] shadow-xl border-4 mx-auto md:mx-0 transition-all duration-500 ${isCompleted ? "border-green-100 shadow-green-100/50" : "border-white shadow-slate-200/50"}`}>
                <div className="pl-4 pb-4">
                    <div className="absolute -mt-12 left-0 w-full text-center md:text-left md:pl-8">
                        <span className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                            {step.gridLabel}
                        </span>
                    </div>
                    {renderGridSVG()}
                </div>
            </div>
        </div>
    </div>
  );
};

// --- MAIN LESSON APP ---
const CoordinateSelectionLesson = () => {
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
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
                    <Grid size={20} strokeWidth={3} />
                </div>
                <div>
                    <h1 className="font-black text-base md:text-lg leading-none text-slate-800">Coordinates</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revision: Selection</span>
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

            // --- VISUAL DIAGRAM CARD (Final Step) ---
            if (step.type === "visual_diagram") {
                return (
                    <div key={step.id} className="animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards">
                        <div className="p-8 rounded-[2rem] shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center transform hover:scale-[1.01] transition-transform">
                            <div className="bg-white/20 p-4 rounded-full inline-block backdrop-blur-sm border border-white/20 mb-4">
                                <Trophy size={40} />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">{step.title}</h2>
                            <p className="text-white/90 text-xl leading-relaxed font-medium max-w-2xl mx-auto mb-8">{step.content}</p>
                            
                            <VisualExplanation point={step.examplePoint} />
                        </div>
                        {isLast && <div ref={bottomRef} className="h-4" />}
                    </div>
                );
            }

            // --- PROBLEM CARD ---
            return (
                <div key={step.id} className="relative animate-in slide-in-from-bottom-16 fade-in duration-700 fill-mode-backwards">
                    
                    {/* Step Number Timeline Visual */}
                    <div className="absolute -left-3 md:-left-12 top-0 flex flex-col items-center h-full opacity-50 pointer-events-none hidden md:flex">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500
                            ${completedSteps.includes(step.id) ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-300"}
                        `}>
                            {step.id.replace('prob', '')}
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>}
                    </div>

                    <InteractiveGrid 
                        step={step} 
                        isCompleted={completedSteps.includes(step.id)}
                        onComplete={() => handleStepComplete(step.id)}
                    />
                    
                    {/* Mobile Connector */}
                    {!isLast && (
                        <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full"></div>
                    )}
                    
                    {isLast && <div ref={bottomRef} className="h-10" />}
                </div>
            );
        })}

      </div>

      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        
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

export default CoordinateSelectionLesson;