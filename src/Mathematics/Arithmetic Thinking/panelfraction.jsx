import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Star,
  Lock,
  MapPin,
  Trophy,
  ChevronRight,
} from "lucide-react";

// 1. Lesson Data
const lessons = [
  {
    id: 1,
    title: "Finding Half",
    path: "/FindingHalfLesson-1",
    description: "Learn how to find one half of shapes and objects."
  },
  {
    id: 2,
    title: "Combining Parts",
    path: "/CombiningPartsLesson-1",
    description: "Combine parts to make a whole."
  },
  {
    id: 3,
    title: "Splitting Parts",
    path: "/SplittingPartsLesson-1",
    description: "Split shapes into equal parts."
  },
  {
    id: 4,
    title: "Split & Combine",
    path: "/SplittingAndCombiningLesson-1",
    description: "Practice splitting and combining fractions."
  },
  {
    id: 5,
    title: "Equal Parts Game",
    path: "/EqualPartsGame-1",
    description: "Choose shapes with equal parts."
  },
  {
    id: 6,
    title: "Fractions Revesion",
    path: "/MoreFractionColoringLesson-1",
    isReview: true,
    description: "Color fractions and review what you learned."
  }
];


/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

// SVG Curve connecting the dots
const PathConnector = ({ totalLessons }) => {
  // Increased height to fit text labels (128px spacing)
  const ITEM_HEIGHT = 128; 
  
  const pathData = lessons.map((_, i) => {
    if (i === lessons.length - 1) return "";
    
    // Zigzag logic: 0=center, 1=left, 2=center, 3=right
    const getX = (index) => {
        const cycle = index % 4;
        if (cycle === 0 || cycle === 2) return 50; // Center
        if (cycle === 1) return 25; // Left
        if (cycle === 3) return 75; // Right
        return 50;
    };

    const startX = getX(i);
    const startY = (i * ITEM_HEIGHT) + 40;
    const endX = getX(i + 1);
    const endY = ((i + 1) * ITEM_HEIGHT) + 40;

    const cp1Y = startY + 60;
    const cp2Y = endY - 60;

    return `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY}`;
  }).join(" ");

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke="#E2E8F0" // slate-200
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="20 10"
      />
    </svg>
  );
};

// Individual Lesson Node
const LessonNode = ({ lesson, index, status, onClick }) => {
  const isReview = !!lesson.isReview;
  
  // Zigzag positions
  const positionCycle = index % 4;
  let translateX = "0px";
  if (positionCycle === 1) translateX = "-80px";
  if (positionCycle === 3) translateX = "80px";

  const getStyles = () => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-yellow-400",
          border: "border-yellow-500",
          shadow: "shadow-yellow-600",
          icon: <Check className="text-white w-8 h-8 stroke-[4]" />,
          offsetBg: "bg-yellow-600",
        };
      case "current":
        return {
          bg: isReview ? "bg-emerald-500" : "bg-blue-500",
          border: isReview ? "border-emerald-600" : "border-blue-600",
          shadow: isReview ? "shadow-emerald-700" : "shadow-blue-700",
          icon: <Star className="text-white w-8 h-8 fill-white" />,
          offsetBg: isReview ? "bg-emerald-700" : "bg-blue-700",
          animate: "animate-bounce",
        };
      case "locked":
      default:
        return {
          bg: "bg-slate-200",
          border: "border-slate-300",
          shadow: "shadow-slate-400",
          icon: <Lock className="text-slate-400 w-6 h-6" />,
          offsetBg: "bg-slate-300",
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
        className="relative flex justify-center mb-6 z-10 w-full transition-transform duration-500"
        style={{ transform: `translateX(${translateX})` }}
    >
      <div className="relative group flex flex-col items-center">
        
        {/* Button */}
        <button
          onClick={() => status !== "locked" && onClick(lesson.id)}
          disabled={status === "locked"}
          className={`
            relative w-20 h-20 rounded-full transition-all duration-200 outline-none mb-3
            ${status !== "locked" ? "cursor-pointer active:scale-95 hover:-translate-y-1" : "cursor-not-allowed"}
          `}
        >
          {/* 3D Depth Layer */}
          <div className={`absolute inset-0 rounded-full translate-y-2 ${styles.offsetBg}`} />
          
          {/* Main Button Surface */}
          <div className={`
            absolute inset-0 rounded-full border-[4px] flex items-center justify-center
            ${styles.bg} ${styles.border}
          `}>
            <div className="w-16 h-16 rounded-full border-[3px] border-white/20 flex items-center justify-center">
                 {styles.icon}
            </div>
          </div>
          
          {/* Shine effect */}
          <div className="absolute top-2 left-4 w-6 h-3 bg-white/30 rounded-full rotate-[-20deg]" />
        </button>

        {/* --- TITLE LABEL UNDER THE BUTTON --- */}
        <div 
            onClick={() => status !== "locked" && onClick(lesson.id)}
            className={`
                text-center cursor-pointer transition-transform duration-200 
                ${status !== "locked" ? "hover:scale-105" : ""}
            `}
        >
            <span className="inline-block bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-100 shadow-sm text-xs font-bold text-slate-600">
                {lesson.title}
            </span>
        </div>

      </div>
    </div>
  );
};

// Floating Action Card
const FloatingAction = ({ lesson, onStart }) => {
  if (!lesson) return null;
  const isReview = !!lesson.isReview;

  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center z-50 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl p-5 transform transition-all hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-3">
            <div>
                <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isReview ? "text-emerald-500" : "text-blue-500"}`}>
                    {isReview ? "Unit Review" : "Selected Lesson"}
                </p>
                <h3 className="text-lg font-extrabold text-slate-800 leading-none">{lesson.title}</h3>
            </div>
            {isReview ? <Trophy className="text-emerald-500" /> : <MapPin className="text-blue-500" />}
        </div>
        
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{lesson.description}</p>

        <button
          onClick={() => onStart(lesson.path)}
          className={`
            w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg transition-transform active:scale-95
            ${isReview 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"}
          `}
        >
          START {isReview ? "REVIEW" : "PRACTICE"}
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                  */
/* -------------------------------------------------------------------------- */

const CoordinatePlaneLevel = () => {
  const navigate = useNavigate();
  
  // --- UNLOCKED MODE ---
  // Setting default state to (lessons.length + 1) makes everything behave as "completed" 
  // so you can test all buttons freely.
  const [currentLessonId, setCurrentLessonId] = useState(lessons.length + 1); 
  
  const [selectedLessonId, setSelectedLessonId] = useState(1);

  // Stats for the sidebar
  const progressPercent = 100; // Force 100% since everything is unlocked

  const handleLessonSelect = (id) => {
    setSelectedLessonId(id);
  };

  const getStatus = (lessonId) => {
    if (lessonId < currentLessonId) return "completed";
    if (lessonId === currentLessonId) return "current";
    return "locked";
  };
  
  const selectedLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
      }}></div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        
        {/* HEADER */}
        <header className="mb-10 text-center md:text-left md:flex justify-between items-end">
          <div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
  Level 1 • Fractions
</p>
<h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
  Fractions Basics
</h1>
          </div>
          
          <div className="hidden md:flex gap-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="bg-yellow-100 p-1.5 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">XP Earned</p>
                    <p className="text-sm font-bold text-slate-700">9,999</p>
                </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* SIDEBAR */}
          <aside className="hidden md:block w-72 sticky top-8">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <MapPin size={32} />
                    </div>
                    <div>
<h2 className="font-bold text-slate-800">Level 1</h2>
<p className="text-xs text-slate-500 font-medium">Fractions</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Unlocked</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
                
                {/* Debug Info */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-400 text-center">
                    Dev Mode: All Levels Unlocked
                </div>
            </div>
          </aside>

          {/* MAIN MAP */}
          <main className="flex-1 w-full flex justify-center relative pb-32">
             <div className="w-full max-w-md relative">
                
                <PathConnector totalLessons={lessons.length} />

                <div className="relative pt-10 flex flex-col items-center">
                    {lessons.map((lesson, idx) => (
                        <LessonNode 
                            key={lesson.id}
                            index={idx}
                            lesson={lesson}
                            status={getStatus(lesson.id)}
                            onClick={handleLessonSelect}
                        />
                    ))}
                    
                    <div className="mt-8 flex flex-col items-center opacity-50 grayscale">
                        <Trophy size={48} className="text-yellow-500 mb-2" />
                    </div>
                </div>
             </div>
          </main>
        </div>
      </div>

      <FloatingAction 
        lesson={selectedLesson} 
        onStart={(path) => navigate(path)} 
      />
    </div>
  );
};

export default CoordinatePlaneLevel;