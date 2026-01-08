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
  Coffee,
  Cake,
  Eye
} from "lucide-react";

// --- SOUNDS ---
const SOUNDS = {
  pop: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.m4a",
  error: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a",
  snap: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
};

// --- DATASET: CAFE SALES ---
const CAFE_DATA = [
  { day: "Mon", x: 10, y: 25 },
  { day: "Tue", x: 20, y: 18 },
  { day: "Wed", x: 50, y: 40 }, 
  { day: "Thu", x: 35, y: 25 },
  { day: "Fri", x: 55, y: 20 },
  { day: "Sat", x: 42, y: 50 },
  // Sunday (40, 50) is the target for Problem 4
];

// --- LESSON DATA ---
const LESSON_STEPS = [
  {
    id: "prob1",
    type: "problem",
    title: "Problem 1",
    instruction: "The plot shows coffee and cake sales by day in a cafe. Select the day when the most cakes were sold.",
    hint: "Cake sales are on the y-axis (vertical). Look for the point highest up.",
    explanation: "Cake sales are on the y-axis, so the point furthest up the plot has the most sales. This point is Saturday.",
    targetDay: "Sat",
    mode: "select_point"
  },
  {
    id: "prob2",
    type: "problem",
    title: "Problem 2",
    instruction: "Select the day when the most coffees were sold.",
    hint: "Coffee sales are on the x-axis (horizontal). Look for the point furthest to the right.",
    explanation: "Coffee sales are on the x-axis, so the point furthest to the right has the most sales. This point is Friday.",
    targetDay: "Fri",
    mode: "select_point"
  },
  {
    id: "prob3",
    type: "problem",
    title: "Problem 3",
    instruction: "Select the day when more cakes were sold than coffees.",
    hint: "Look for a point where the vertical height (cakes) is bigger than the horizontal distance (coffee).",
    explanation: "The plot tells us that on Monday more than 20 cakes were sold, compared to fewer than 20 coffees.",
    targetDay: "Mon",
    mode: "select_point"
  },
  {
    id: "info1",
    type: "interactive_info",
    title: "Real World Data",
    content: "We can represent any pairs of values on the coordinate plane.",
    highlight: "all"
  },
  {
    id: "prob4",
    type: "problem",
    title: "Problem 4",
    instruction: (
        <>
            Plot a point for <strong>Sunday</strong>, when 40 coffees and 50 cakes were sold.
        </>
    ),
    hint: "Find 40 on the x-axis (Coffee) and 50 on the y-axis (Cake). Click where they meet.",
    explanation: "To plot 40 coffees and 50 cakes we should move along the x-axis to 40 and then up the y-axis to 50.",
    targetData: { x: 40, y: 50 },
    mode: "plot_point"
  },
  {
    id: "prob5",
    type: "problem",
    title: "Problem 5",
    instruction: "Give the (coffee, cakes) coordinates for Wednesday.",
    hint: "Find Wednesday on the chart. Read down for coffee (x) and across for cake (y).",
    explanation: "Wednesday is on the 50 line coming up from the x-axis and on the 40 line coming across from the y-axis, so its coordinates are (50, 40).",
    targetCoords: "(50, 40)",
    mode: "identify_coords",
    options: [
        { id: "A", label: "(40, 50)", correct: false },
        { id: "B", label: "(50, 40)", correct: true },
        { id: "C", label: "(50, 50)", correct: false },
        { id: "D", label: "(40, 40)", correct: false },
    ],
    highlightDay: "Wed"
  },
  {
    id: "prob6",
    type: "problem",
    title: "Problem 6",
    instruction: "Give the (coffee, cakes) coordinates for Thursday.",
    hint: "Find Thursday. It's between lines. Look closely at the values.",
    explanation: "Thursday is between the 30 and 40 lines (coffee) and between the 20 and 30 lines (cake), so its coordinates are (35, 25).",
    targetCoords: "(35, 25)",
    mode: "identify_coords",
    options: [
        { id: "A", label: "(30, 20)", correct: false },
        { id: "B", label: "(35, 30)", correct: false },
        { id: "C", label: "(35, 25)", correct: true },
        { id: "D", label: "(30, 25)", correct: false },
    ],
    highlightDay: "Thu"
  },
  {
    id: "final_visual",
    type: "visual_diagram",
    title: "Lesson Complete",
    content: "Coordinate pairs can represent real quantities, not just numbers."
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
const VisualExplanation = () => {
    const size = 300;
    const padding = 40;
    const graphSize = size - padding * 2;
    const maxVal = 60;

    const scaleX = (val) => padding + (val / maxVal) * graphSize;
    const scaleY = (val) => (size - padding) - (val / maxVal) * graphSize;
    
    // Grid lines logic
    const gridElements = [];
    for (let i = 0; i <= 6; i++) {
        const val = i * 10;
        const pos = (val / maxVal) * graphSize;
        gridElements.push(<line key={`v${i}`} x1={padding + pos} y1={padding} x2={padding + pos} y2={size - padding} stroke="#f1f5f9" strokeWidth="1" />);
        gridElements.push(<line key={`h${i}`} x1={padding} y1={size - padding - pos} x2={size - padding} y2={size - padding - pos} stroke="#f1f5f9" strokeWidth="1" />);
        
        gridElements.push(
            <text key={`nx${i}`} x={padding + pos} y={size - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">{val}</text>
        );
        if (val > 0) {
            gridElements.push(
                <text key={`ny${i}`} x={padding - 8} y={size - padding - pos + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="bold">{val}</text>
            );
        }
    }

    return (
        <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-slate-100 mx-auto w-full max-w-[350px]">
            <svg width={size} height={size} className="overflow-visible select-none">
                <defs>
                    <marker id="arrow_viz" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                </defs>

                {/* Grid */}
                {gridElements}

                {/* Axes */}
                <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow_viz)" />
                <line x1={padding} y1={size - padding} x2={padding} y2={padding} stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow_viz)" />

                {/* Labels */}
                <text x={size/2} y={size - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b">Coffee Sold</text>
                <text x={10} y={size/2} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b" transform={`rotate(-90, 10, ${size/2})`}>Cakes Sold</text>
                
                {/* Example Points */}
                <circle cx={scaleX(10)} cy={scaleY(25)} r={6} fill="#ec4899" stroke="white" strokeWidth="2" />
                <text x={scaleX(10)+10} y={scaleY(25)} fontSize="10" fontWeight="bold" fill="#ec4899">Mon</text>
                
                <circle cx={scaleX(55)} cy={scaleY(20)} r={6} fill="#3b82f6" stroke="white" strokeWidth="2" />
                <text x={scaleX(55)} y={scaleY(20)-10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">Fri</text>
            </svg>
        </div>
    );
};

// --- SCATTER PLOT COMPONENT ---
const InteractiveScatterPlot = ({ step, isCompleted, onComplete, completedSteps }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [userPlot, setUserPlot] = useState(null); 
  const [feedback, setFeedback] = useState("idle");
  const [revealed, setRevealed] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  const svgRef = useRef(null);

  useEffect(() => {
      if (!isCompleted) {
          setSelectedDay(null);
          setUserPlot(null);
          setSelectedOptionId(null);
          setFeedback("idle");
          setRevealed(false);
      }
  }, [step.id, isCompleted]);

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handlePointClick = (day) => {
      if (isCompleted || revealed || step.mode !== 'select_point') return;
      
      setSelectedDay(day);
      
      if (day === step.targetDay) {
          playSound("win");
          setFeedback("success");
          onComplete();
      } else {
          playSound("error");
          setFeedback("error");
      }
  };

  const handleGridClick = (e) => {
      if (isCompleted || revealed || step.mode !== 'plot_point') return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const size = 320;
      const padding = 40;
      const graphSize = size - padding * 2;
      const maxVal = 60;

      const xRaw = e.clientX - rect.left;
      const yRaw = e.clientY - rect.top;

      let valX = ((xRaw - padding) / graphSize) * maxVal;
      let valY = ((size - padding - yRaw) / graphSize) * maxVal;

      valX = Math.round(valX / 5) * 5;
      valY = Math.round(valY / 5) * 5;

      valX = Math.max(0, Math.min(maxVal, valX));
      valY = Math.max(0, Math.min(maxVal, valY));

      setUserPlot({ x: valX, y: valY });

      if (valX === step.targetData.x && valY === step.targetData.y) {
          playSound("win");
          setFeedback("success");
          onComplete();
      } else {
          playSound("error");
          setFeedback("error");
      }
  };

  const handleOptionClick = (option) => {
      if (isCompleted || revealed) return;
      
      setSelectedOptionId(option.id);
      
      if (option.correct) {
          playSound("win");
          setFeedback("success");
          onComplete();
      } else {
          playSound("error");
          setFeedback("error");
      }
  };

  const handleSeeAnswer = () => {
      setRevealed(true);
      setFeedback("revealed");
      if (step.mode === 'select_point') setSelectedDay(step.targetDay);
      if (step.mode === 'plot_point') setUserPlot(step.targetData);
      if (step.mode === 'identify_coords') {
          const correctOpt = step.options.find(o => o.correct);
          setSelectedOptionId(correctOpt.id);
      }
  };

  const renderPlot = () => {
    const size = 320;
    const padding = 40;
    const graphSize = size - padding * 2;
    const maxVal = 60; 

    const scaleX = (val) => padding + (val / maxVal) * graphSize;
    const scaleY = (val) => (size - padding) - (val / maxVal) * graphSize;

    const gridElements = [];
    for (let i = 0; i <= 6; i++) {
        const val = i * 10;
        const pos = (val / maxVal) * graphSize;
        gridElements.push(<line key={`v${i}`} x1={padding + pos} y1={padding} x2={padding + pos} y2={size - padding} stroke="#f1f5f9" strokeWidth="1" />);
        gridElements.push(<text key={`xl${i}`} x={padding + pos} y={size - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">{val}</text>);
        gridElements.push(<line key={`h${i}`} x1={padding} y1={size - padding - pos} x2={size - padding} y2={size - padding - pos} stroke="#f1f5f9" strokeWidth="1" />);
        if (val > 0) gridElements.push(<text key={`yl${i}`} x={padding - 8} y={size - padding - pos + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="bold">{val}</text>);
    }

    return (
      <div className="relative">
        <svg 
            ref={svgRef} 
            width={size} 
            height={size} 
            className="overflow-visible select-none"
            onClick={step.mode === 'plot_point' ? handleGridClick : undefined}
            style={{cursor: step.mode === 'plot_point' && !isCompleted && !revealed ? 'crosshair' : 'default'}}
        >
          {gridElements}
          
          <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1={padding} y1={size - padding} x2={padding} y2={padding} stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>

          <text x={size/2} y={size - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b">Coffee Sold</text>
          <text x={10} y={size/2} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b" transform={`rotate(-90, 10, ${size/2})`}>Cakes Sold</text>

          {CAFE_DATA.map((pt) => {
              const px = scaleX(pt.x);
              const py = scaleY(pt.y);
              const isTarget = step.mode === 'select_point' && pt.day === step.targetDay;
              const isHighlight = step.mode === 'identify_coords' && pt.day === step.highlightDay;
              const isSelected = selectedDay === pt.day;
              
              let fill = "#3b82f6";
              let r = 6;
              let opacity = 1;

              if (step.mode === 'identify_coords') {
                  if (isHighlight) {
                      fill = "#8b5cf6"; 
                      r = 8;
                  } else {
                      fill = "#cbd5e1"; 
                      opacity = 0.5;
                  }
              } else if (step.mode === 'select_point') {
                  if (revealed && isTarget) { fill = "#22c55e"; r = 8; }
                  else if (isCompleted && isTarget) { fill = "#22c55e"; r = 8; }
                  else if (isSelected && feedback === 'error') { fill = "#ef4444"; }
                  else if (revealed) { fill = "#cbd5e1"; opacity = 0.5; }
              } else {
                  fill = "#cbd5e1"; opacity = 0.5;
              }

              return (
                  <g key={pt.day} onClick={() => step.mode === 'select_point' ? handlePointClick(pt.day) : null} style={{cursor: step.mode === 'select_point' && !isCompleted && !revealed ? 'pointer' : 'default'}}>
                      <circle cx={px} cy={py} r={20} fill="transparent" />
                      <circle cx={px} cy={py} r={r} fill={fill} stroke="white" strokeWidth="2" opacity={opacity} className="transition-all duration-300" />
                      {(isTarget || isHighlight || isSelected) && (
                          <text x={px} y={py - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">{pt.day}</text>
                      )}
                  </g>
              );
          })}

          {(userPlot || (revealed && step.mode === 'plot_point')) && (
              <g>
                  {(() => {
                      const pt = userPlot || step.targetData || {x: 40, y: 50}; 
                      const px = scaleX(pt.x);
                      const py = scaleY(pt.y);
                      const isCorrect = step.targetData && pt.x === step.targetData.x && pt.y === step.targetData.y;
                      const color = (isCorrect || revealed) ? "#22c55e" : "#ef4444";
                      
                      return (
                          <>
                            <circle cx={px} cy={py} r={8} fill={color} stroke="white" strokeWidth="2" />
                            <text x={px} y={py - 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>Sun</text>
                          </>
                      );
                  })()}
              </g>
          )}

        </svg>
        {feedback === "success" && <ConfettiBurst />}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mx-auto">
            {renderPlot()}
        </div>

        {!isCompleted && !revealed && feedback === 'error' && (
            <div className="animate-in slide-in-from-top-2 fade-in">
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center justify-between gap-2 border border-red-100 mb-2">
                    <div className="flex items-center gap-2">
                        <X size={18} /> <span>Incorrect.</span>
                    </div>
                    <button onClick={handleSeeAnswer} className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide hover:bg-red-50 shadow-sm transition-all">
                        See Answer
                    </button>
                </div>
            </div>
        )}

        {step.mode === 'identify_coords' && !isCompleted && !revealed && (
            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2">
                {step.options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleOptionClick(opt)}
                        className={`
                            py-3 rounded-xl font-mono text-sm font-bold border-2 transition-all shadow-sm
                            ${selectedOptionId === opt.id 
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                            }
                        `}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        )}

        {revealed && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-100 animate-in zoom-in-95">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                        <Eye size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold mb-1">Here is the answer:</h4>
                        <p className="text-sm leading-relaxed">{step.explanation}</p>
                    </div>
                </div>
                <button onClick={onComplete} className="w-full mt-3 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                    Got it, continue <ArrowRight size={16} />
                </button>
            </div>
        )}
    </div>
  );
};

// --- MAIN LESSON APP ---
const AppliedCoordinatesLesson = () => {
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
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200">
                    <Coffee size={20} strokeWidth={3} />
                </div>
                <div>
                    <h1 className="font-black text-base md:text-lg leading-none text-slate-800">Coordinates</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied: Cafe Sales</span>
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
                            <VisualExplanation />
                        </div>
                        {isLast && <div ref={bottomRef} className="h-4" />}
                    </div>
                );
            }

            // --- INFO CARD ---
            if (step.type === "interactive_info") {
                return (
                    <div key={step.id} className="animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards">
                        <div className="p-8 rounded-[2rem] shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center transform hover:scale-[1.01] transition-transform">
                            <div className="bg-white/20 p-4 rounded-full inline-block backdrop-blur-sm border border-white/20 mb-4">
                                <Info size={40} />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">{step.title}</h2>
                            <p className="text-white/90 text-xl leading-relaxed font-medium max-w-2xl mx-auto mb-8">{step.content}</p>

                            <button 
                                onClick={() => handleStepComplete(step.id)}
                                className="mt-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 mx-auto"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                        {isLast && <div ref={bottomRef} className="h-4" />}
                    </div>
                );
            }

            // --- PROBLEM CARD ---
            return (
                <div key={step.id} className="relative animate-in slide-in-from-bottom-16 fade-in duration-700 fill-mode-backwards">
                    
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                        {/* INSTRUCTION */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className={`bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all duration-500 ${completedSteps.includes(step.id) ? "border-green-200 shadow-green-50" : "border-slate-100 shadow-slate-200"}`}>
                                
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{step.title}</span>
                                    {completedSteps.includes(step.id) && (
                                        <div className="bg-green-100 text-green-600 p-1.5 rounded-full animate-bounce-in">
                                            <Check size={20} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-xl md:text-2xl font-medium text-slate-800 leading-snug">
                                    {step.instruction}
                                </p>

                                {/* Success Explanation */}
                                {completedSteps.includes(step.id) && (
                                    <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-xl text-sm border border-green-100 animate-in fade-in">
                                        <p className="font-bold flex items-center gap-2 mb-1">
                                            <Check size={14} /> Explanation:
                                        </p>
                                        {step.explanation}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INTERACTIVE CHART */}
                        <div className="w-full md:w-auto">
                            <InteractiveScatterPlot 
                                step={step} 
                                isCompleted={completedSteps.includes(step.id)}
                                onComplete={() => handleStepComplete(step.id)}
                                setCanProceed={() => {}} 
                                completedSteps={completedSteps}
                            />
                        </div>
                    </div>
                    
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
      `}</style>
    </div>
  );
};

export default AppliedCoordinatesLesson;