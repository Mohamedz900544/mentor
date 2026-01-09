// CircuitUnitMap.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Star, Trophy, ChevronRight, Zap } from "lucide-react";

/**
 * This page is a "unit map" that navigates to your existing routes:
 *  - /cyrrebr                <CurrentLoopsLesson/>
 *  - /ShortCircuits-Lesson   <ShortCircuitsLesson/>
 *  - /ChoosingBulbs-Lesson   <ChoosingBulbsLesson/>
 *  - /ss-Lesson              <SplittingCurrentLesson/>
 *
 * If you want to unlock progressively, keep DEV_ALL_UNLOCKED = false
 * If you want to test everything unlocked, set DEV_ALL_UNLOCKED = true
 */
const DEV_ALL_UNLOCKED = true;

// 1) Lesson Data (UPDATED PATHS)
const lessons = [
  {
    id: 1,
    title: "Current Loops",
    path: "/cyrrebr",
    description: "Explore how current flows in a complete loop.",
  },
  {
    id: 2,
    title: "Short Circuits",
    path: "/ShortCircuits-Lesson",
    description: "Learn why current takes the easiest path.",
  },
  {
    id: 3,
    title: "Choosing Bulbs",
    path: "/ChoosingBulbs-Lesson",
    description: "Pick the right bulbs and see brightness changes.",
  },
  {
    id: 4,
    title: "Splitting Current",
    path: "/ss-Lesson",
    description: "Understand how current splits in branches.",
  },
  {
    id: 5,
    title: "Unit Review",
    path: "/ShortCircuits-Lesson",
    isReview: true,
    description: "Quick recap and mastery check.",
  },
];

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

const PathConnector = ({ count }) => {
  const ITEM_HEIGHT = 132;

  const pathData = useMemo(() => {
    const getX = (index) => {
      // 0=center, 1=left, 2=center, 3=right (repeat)
      const cycle = index % 4;
      if (cycle === 0 || cycle === 2) return 50; // center
      if (cycle === 1) return 24; // left
      if (cycle === 3) return 76; // right
      return 50;
    };

    let d = "";
    for (let i = 0; i < count - 1; i++) {
      const startX = getX(i);
      const startY = i * ITEM_HEIGHT + 46;
      const endX = getX(i + 1);
      const endY = (i + 1) * ITEM_HEIGHT + 46;

      const cp1Y = startY + 66;
      const cp2Y = endY - 66;

      d += `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY} `;
    }
    return d.trim();
  }, [count]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke="#FED7AA" // orange-200
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="18 10"
      />
    </svg>
  );
};

const LessonNode = ({ lesson, index, status, onSelect }) => {
  const isReview = !!lesson.isReview;

  // Zigzag positions
  const positionCycle = index % 4;
  let translateX = "0px";
  if (positionCycle === 1) translateX = "-84px";
  if (positionCycle === 3) translateX = "84px";

  const styles = useMemo(() => {
    if (status === "completed") {
      return {
        bg: "bg-orange-400",
        border: "border-orange-500",
        offsetBg: "bg-orange-600",
        icon: <Check className="text-white w-8 h-8 stroke-[4]" />,
        pulse: "",
      };
    }

    if (status === "current") {
      return {
        bg: isReview ? "bg-amber-500" : "bg-orange-500",
        border: isReview ? "border-amber-600" : "border-orange-600",
        offsetBg: isReview ? "bg-amber-700" : "bg-orange-700",
        icon: <Star className="text-white w-8 h-8 fill-white" />,
        pulse: "animate-bounce",
      };
    }

    return {
      bg: "bg-slate-200",
      border: "border-slate-300",
      offsetBg: "bg-slate-300",
      icon: <Lock className="text-slate-400 w-6 h-6" />,
      pulse: "",
    };
  }, [status, isReview]);

  const clickable = status !== "locked";

  return (
    <div
      className="relative flex justify-center mb-6 z-10 w-full transition-transform duration-500"
      style={{ transform: `translateX(${translateX})` }}
    >
      <div className="relative flex flex-col items-center">
        <button
          onClick={() => clickable && onSelect(lesson.id)}
          disabled={!clickable}
          className={[
            "relative w-20 h-20 rounded-full transition-all duration-200 outline-none mb-3",
            clickable
              ? "cursor-pointer active:scale-95 hover:-translate-y-1"
              : "cursor-not-allowed",
            styles.pulse,
          ].join(" ")}
          aria-label={lesson.title}
        >
          {/* 3D Depth Layer */}
          <div className={`absolute inset-0 rounded-full translate-y-2 ${styles.offsetBg}`} />

          {/* Main Surface */}
          <div
            className={[
              "absolute inset-0 rounded-full border-[4px] flex items-center justify-center",
              styles.bg,
              styles.border,
            ].join(" ")}
          >
            <div className="w-16 h-16 rounded-full border-[3px] border-white/25 flex items-center justify-center">
              {styles.icon}
            </div>
          </div>

          {/* Shine */}
          <div className="absolute top-2 left-4 w-6 h-3 bg-white/35 rounded-full rotate-[-20deg]" />

          {/* Soft glow for current */}
          {status === "current" && (
            <div className="absolute -inset-3 rounded-full bg-orange-300/40 blur-xl -z-10" />
          )}
        </button>

        {/* Title pill */}
        <div
          onClick={() => clickable && onSelect(lesson.id)}
          className={[
            "text-center transition-transform duration-200",
            clickable ? "cursor-pointer hover:scale-105" : "cursor-default opacity-70",
          ].join(" ")}
        >
          <span className="inline-block bg-white/85 backdrop-blur-sm px-3 py-1 rounded-lg border border-orange-50 shadow-sm text-xs font-extrabold text-slate-700">
            {lesson.title}
          </span>
        </div>
      </div>
    </div>
  );
};

const FloatingAction = ({ lesson, onStart }) => {
  if (!lesson) return null;
  const isReview = !!lesson.isReview;

  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center z-50 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-white/90 backdrop-blur-md border border-orange-100 shadow-2xl rounded-3xl p-5 transform transition-all hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p
              className={[
                "text-[10px] font-black tracking-widest uppercase mb-1",
                isReview ? "text-amber-600" : "text-orange-600",
              ].join(" ")}
            >
              {isReview ? "Unit Review" : "Selected Lesson"}
            </p>
            <h3 className="text-lg font-black text-slate-900 leading-none">
              {lesson.title}
            </h3>
          </div>

          {isReview ? (
            <Trophy className="text-amber-600" />
          ) : (
            <Zap className="text-orange-600" />
          )}
        </div>

        <p className="text-xs text-slate-600 mb-4 line-clamp-2">
          {lesson.description}
        </p>

        <button
          onClick={() => onStart(lesson.path)}
          className={[
            "w-full h-12 rounded-xl flex items-center justify-center gap-2 font-black text-sm shadow-lg transition-transform active:scale-95",
            isReview
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
              : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200",
          ].join(" ")}
        >
          START {isReview ? "REVIEW" : "LESSON"}
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

const CircuitUnitMap = () => {
  const navigate = useNavigate();

  // Unlock logic:
  // - if DEV_ALL_UNLOCKED: everything becomes completed (clickable)
  // - else: currentLessonId = 1 means only lesson 1 is current, others locked
  const [currentLessonId] = useState(
    DEV_ALL_UNLOCKED ? lessons.length + 1 : 1
  );

  const [selectedLessonId, setSelectedLessonId] = useState(1);

  const progressPercent = useMemo(() => {
    if (DEV_ALL_UNLOCKED) return 100;
    const unlockedCount = Math.max(1, Math.min(currentLessonId, lessons.length));
    return Math.round((unlockedCount / lessons.length) * 100);
  }, [currentLessonId]);

  const getStatus = (lessonId) => {
    if (lessonId < currentLessonId) return "completed";
    if (lessonId === currentLessonId) return "current";
    return "locked";
  };

  const selectedLesson =
    lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  return (
    <div className="min-h-screen bg-orange-50/40 font-sans selection:bg-orange-100">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#FDBA74 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <header className="mb-10 text-center md:text-left md:flex justify-between items-end">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Unit • Electricity
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Electric Circuits
            </h1>
          </div>

          <div className="hidden md:flex gap-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-xl border border-orange-100 shadow-sm flex items-center gap-2">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-orange-700" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">
                  Progress
                </p>
                <p className="text-sm font-black text-slate-700">
                  {progressPercent}%
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden md:block w-72 sticky top-8">
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-700">
                  <Zap size={32} />
                </div>
                <div>
                  <h2 className="font-black text-slate-800">Level 1</h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Current & Circuits
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-black text-slate-500 mb-2">
                  <span>Unlocked</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-3 bg-orange-50 rounded-full overflow-hidden border border-orange-100">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg text-xs text-slate-500 text-center border border-orange-100">
                {DEV_ALL_UNLOCKED ? "Dev Mode: All Lessons Unlocked" : "Progressive Unlock Mode"}
              </div>
            </div>
          </aside>

          {/* Map */}
          <main className="flex-1 w-full flex justify-center relative pb-32">
            <div className="w-full max-w-md relative">
              <PathConnector count={lessons.length} />

              <div className="relative pt-10 flex flex-col items-center">
                {lessons.map((lesson, idx) => (
                  <LessonNode
                    key={lesson.id}
                    index={idx}
                    lesson={lesson}
                    status={getStatus(lesson.id)}
                    onSelect={(id) => setSelectedLessonId(id)}
                  />
                ))}

                <div className="mt-8 flex flex-col items-center opacity-60 grayscale">
                  <Trophy size={48} className="text-orange-500 mb-2" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingAction lesson={selectedLesson} onStart={(path) => navigate(path)} />
    </div>
  );
};

export default CircuitUnitMap;
