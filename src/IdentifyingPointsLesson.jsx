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

// --- LESSON DATA: IDENTIFYING POINTS ---
const LESSON_STEPS = [
  // --- PROBLEMS 1-3: MULTIPLE CHOICE (Identify Coords) ---
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    instruction: "Give the coordinates of the blue point.",
    hint: "This point is 3 steps right and 4 steps up from the origin.",
    gridSize: 8,
    gridLabel: "Identify Point",
    mode: "identify_coords", // MCQ Mode
    targetPoint: { x: 3, y: 4 },
    options: [
      { id: 'A', label: "(3, 4)", correct: true },
      { id: 'B', label: "(4, 3)", correct: false },
      { id: 'C', label: "(3, 0)", correct: false },
      { id: 'D', label: "(0, 4)", correct: false }
    ]
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    instruction: "Give the coordinates of the blue point.",
    hint: "This point is 3 steps right and 1 step up from the origin.",
    gridSize: 8,
    gridLabel: "Identify Point",
    mode: "identify_coords", // MCQ Mode
    targetPoint: { x: 3, y: 1 },
    options: [
      { id: 'A', label: "(1, 3)", correct: false },
      { id: 'B', label: "(3, 1)", correct: true },
      { id: 'C', label: "(3, 3)", correct: false },
      { id: 'D', label: "(1, 1)", correct: false }
    ]
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    instruction: "Give the coordinates of the blue point.",
    hint: "This point is 6 steps right and 0 steps up. It's on the x-axis!",
    gridSize: 8,
    gridLabel: "Identify Point",
    mode: "identify_coords", // MCQ Mode
    targetPoint: { x: 6, y: 0 },
    options: [
      { id: 'A', label: "(0, 6)", correct: false },
      { id: 'B', label: "(6, 6)", correct: false },
      { id: 'C', label: "(6, 0)", correct: true },
      { id: 'D', label: "(0, 0)", correct: false }
    ]
  },

  // --- PROBLEMS 4-6: DRAG TO PLOT ---
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    instruction: (
        <>
            Drag the point to coordinates <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">(4, 6)</span>.
        </>
    ),
    hint: "Move the point 4 steps to the right, then 6 steps up.",
    gridSize: 8,
    gridLabel: "Drag to Plot",
    mode: "drag_plot", // Drag Mode
    start: { x: 0, y: 0 },
    target: { x: 4, y: 6 }
  },
  {
    id: "prob5",
    type: "problem",
    title: "Problem 5",
    instruction: (
        <>
            Drag the point to coordinates <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">(0, 3)</span>.
        </>
    ),
    hint: "0 steps right means stay on the y-axis. Then go 3 steps up.",
    gridSize: 8,
    gridLabel: "Drag to Plot",
    mode: "drag_plot", // Drag Mode
    start: { x: 0, y: 0 },
    target: { x: 0, y: 3 }
  },
  {
    id: "prob6",
    type: "problem",
    title: "Problem 6",
    instruction: (
        <>
            Drag the point to the origin <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">(0, 0)</span>.
        </>
    ),
    hint: "The origin is the starting corner at the bottom left.",
    gridSize: 8,
    gridLabel: "Drag to Plot",
    mode: "drag_plot", // Drag Mode
    start: { x: 4, y: 4 }, // Start somewhere else to make them drag it
    target: { x: 0, y: 0 }
  },
  
  {
    id: "final_visual",
    type: "interactive_info",
    title: "Lesson Complete",
    content: "Coordinates let us specify exact locations of points in the plane.",
    gridSize: 8,
    highlight: "any_point"
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
  // State for MCQ
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  // State for Dragging
  const [pos, setPos] = useState(step.start || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Shared State
  const [feedback, setFeedback] = useState("idle");
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const svgRef = useRef(null);

  // Sync drag position if step changes or resets
  useEffect(() => {
      if (step.mode === 'drag_plot' && !isCompleted) {
          setPos(step.start || {x: 0, y: 0});
      }
  }, [step.id]);

  useEffect(() => {
    if (isCompleted) {
        if (step.mode === 'identify_coords') {
            const correctOpt = step.options?.find(o => o.correct);
            if (correctOpt) setSelectedOptionId(correctOpt.id);
        } else if (step.mode === 'drag_plot') {
            setPos(step.target);
        }
        setFeedback("success");
    }
  }, [isCompleted, step]);

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      if (key === 'win') audio.volume = 0.6;
      else if (key === 'snap') audio.volume = 0.2;
      else audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // --- MCQ HANDLER ---
  const handleOptionClick = (option) => {
      if (isCompleted) return;
      
      setSelectedOptionId(option.id);
      
      if (option.correct) {
          playSound("win");
          setFeedback("success");
          setShowConfetti(true);
          onComplete();
      } else {
          playSound("error");
          setFeedback("error");
      }
  };

  // --- DRAG HANDLERS ---
  const getGridCoordinates = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const size = 300;
    const stepSize = size / step.gridSize;
    const xRaw = clientX - rect.left;
    const yRaw = clientY - rect.top;
    let gridX = Math.round(xRaw / stepSize);
    let gridY = Math.round((size - yRaw) / stepSize);
    gridX = Math.max(0, Math.min(step.gridSize, gridX));
    gridY = Math.max(0, Math.min(step.gridSize, gridY));
    return { x: gridX, y: gridY };
  };

  const handlePointerDown = (e) => {
    if (isCompleted || step.mode !== 'drag_plot') return;
    e.preventDefault();
    setIsDragging(true);
    setFeedback("idle");
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const coords = getGridCoordinates(e.clientX, e.clientY);
      if (coords && (coords.x !== pos.x || coords.y !== pos.y)) {
         setPos(coords);
         playSound("snap");
      }
    };
    const handleGlobalUp = () => {
      if (isDragging) {
        setIsDragging(false);
        playSound("pop");
      }
    };
    if (isDragging) {
      window.addEventListener("pointermove", handleGlobalMove);
      window.addEventListener("pointerup", handleGlobalUp);
    }
    return () => {
      window.removeEventListener("pointermove", handleGlobalMove);
      window.removeEventListener("pointerup", handleGlobalUp);
    };
  }, [isDragging, pos, step]);

  const checkDragAnswer = () => {
      if (pos.x === step.target.x && pos.y === step.target.y) {
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

    // Guides & Labels
    const guides = [];
    guides.push(<text key="xlabel" x={size - 20} y={size - 10} fill="#94a3b8" fontWeight="bold" fontSize="16">x</text>);
    guides.push(<text key="ylabel" x={10} y={20} fill="#94a3b8" fontWeight="bold" fontSize="16">y</text>);

    // "Any Point" Visual
    if (highlightMode === 'any_point') {
        const points = [
            { x: 2, y: 6, color: '#ec4899' },
            { x: 6, y: 2, color: '#3b82f6' },
            { x: 4, y: 4, color: '#8b5cf6' }
        ];
        points.forEach((pt, i) => {
            const px = pt.x * stepSize;
            const py = size - (pt.y * stepSize);
            guides.push(<circle key={`demo_${i}`} cx={px} cy={py} r={6} fill={pt.color} stroke="white" strokeWidth="2" />);
            guides.push(<text key={`lbl_${i}`} x={px+8} y={py-8} fontSize="10" fontWeight="bold" fill={pt.color}>({pt.x}, {pt.y})</text>);
        });
    }

    // Hint Path
    const hintVisuals = [];
    // Show hint path for Drag Mode or Identify Mode (static)
    const target = step.mode === 'drag_plot' ? step.target : step.targetPoint;
    
    if (!readOnly && showHint && !isCompleted && target) {
       const startX = 0;
       const startY = size;
       const targetX = target.x * stepSize;
       const targetY = size - (target.y * stepSize);
       const cornerX = targetX; 
       const cornerY = size; 

       hintVisuals.push(
         <path 
            key="path"
            d={`M ${startX} ${startY} L ${cornerX} ${cornerY} L ${targetX} ${targetY}`}
            fill="none"
            stroke="#3b82f6" 
            strokeWidth="3" 
            strokeDasharray="6,4" 
            className="opacity-50"
         />
       );
    }

    // Point Rendering
    let pointVisuals = null;

    if (step.mode === 'identify_coords') {
        // Static Target Point
        const px = step.targetPoint.x * stepSize;
        const py = size - (step.targetPoint.y * stepSize);
        pointVisuals = (
            <circle cx={px} cy={py} r={8} fill="#3b82f6" stroke="white" strokeWidth="3" />
        );
    } else if (step.mode === 'drag_plot') {
        // Draggable Point
        const px = pos.x * stepSize;
        const py = size - (pos.y * stepSize);
        pointVisuals = (
            <g 
                transform={`translate(${px}, ${py})`} 
                style={{ 
                    transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                    cursor: isCompleted ? 'default' : 'grab' 
                }}
                onPointerDown={handlePointerDown}
            >
                {!isCompleted && <circle r={35} fill="transparent" />} 
                <circle 
                    r={isDragging ? 10 : 8} 
                    fill={isCompleted ? "#22c55e" : "#ec4899"} 
                    stroke="white" 
                    strokeWidth={3} 
                    className="shadow-sm drop-shadow-md" 
                />
                {isDragging && <circle r={20} stroke="#ec4899" strokeWidth="2" fill="transparent" strokeDasharray="4,2" className="animate-spin-slow" />}
            </g>
        );
    }

    return (
      <div className="relative pl-2">
        <svg ref={svgRef} width={size} height={size} className="overflow-visible touch-none select-none">
          {lines}
          {guides}
          {hintVisuals}
          {pointVisuals}
  
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

                    {step.mode === 'drag_plot' && !isCompleted && (
                        <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-inner">
                            <MapPin size={16} className="text-pink-500" />
                            <span className="font-bold text-xs uppercase tracking-wider">Position:</span>
                            <span className="font-mono font-black text-lg text-slate-800">({pos.x}, {pos.y})</span>
                        </div>
                    )}

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
                                <X size={20} /> Oops! Try again.
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowHint(!showHint)}
                                className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95 flex-1"
                            >
                                <HelpCircle size={18} /> Need a Hint?
                            </button>
                            {step.mode === 'drag_plot' && (
                                <button 
                                    onClick={() => { setPos(step.start); setFeedback("idle"); }}
                                    className="px-5 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-sm flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <RotateCcw size={18} /> Reset
                                </button>
                            )}
                            {step.mode === 'drag_plot' && (
                                <button 
                                    onClick={checkDragAnswer}
                                    className="flex-1 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2"
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

                        {/* MCQ Options */}
                        {step.mode === 'identify_coords' && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {step.options?.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionClick(opt)}
                                        className={`
                                            py-4 rounded-xl font-mono text-lg font-bold border-2 transition-all shadow-sm
                                            ${selectedOptionId === opt.id 
                                                ? (opt.correct ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white")
                                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
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
const IdentifyingPointsLesson = () => {
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
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-violet-200">
                    <Target size={20} strokeWidth={3} />
                </div>
                <div>
                    <h1 className="font-black text-base md:text-lg leading-none text-slate-800">Coordinates</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level 6: Identifying</span>
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

export default IdentifyingPointsLesson;