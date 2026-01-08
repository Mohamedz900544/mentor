// CoordinatePlaneLevel.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  RefreshCw,
  BookOpen,
  Dumbbell,
  ChevronDown,
  Play,
} from "lucide-react";

const lessons = [
  { id: 1, title: "Coordinates", path: "/Coordinates-Lesson" },
  { id: 2, title: "Coordinate Pairs", path: "/pair-Lesson" },
  { id: 3, title: "Axes", path: "/axes-Lesson" },
  { id: 4, title: "x and y Coordinates", path: "/xys-Lesson" },
  { id: 5, title: "Plotting Points", path: "/ploting-Lesson" },
  { id: 6, title: "Identifying Points", path: "/Identifying-Lesson" },
  { id: 7, title: "Applied Coordinates", path: "/Applied-Lesson" },
  { id: 8, title: "Level Review", path: "/Applied-revesion", isReview: true },
];

const getLessonTag = (lesson) =>
  lesson.isReview ? "REVIEW" : "CORE CONCEPT";

const getLessonText = (lesson) =>
  lesson.isReview
    ? "Revisit all skills from this level and make sure everything feels solid."
    : "Explore this idea step by step with guided practice on the coordinate plane.";

/* -------------------- TIMELINE ITEM -------------------- */

const LessonItem = ({ lesson, index, isActive, onClick }) => {
  const isReview = !!lesson.isReview;

  return (
    <div className="relative w-full flex justify-center mb-20 last:mb-0 z-10">
      {/* Circle node */}
      <button
        onClick={() => onClick(lesson.id)}
        className={`
          group relative w-24 h-24 outline-none transition-all duration-500 ease-out
          ${isActive ? "scale-110 -translate-y-1" : "hover:scale-105 hover:-translate-y-1"}
        `}
        aria-pressed={isActive}
      >
        {/* depth / side */}
        <div
          className={`
            absolute top-2.5 left-0 right-0 h-20 rounded-full transition-colors duration-300
            ${
              isActive
                ? "bg-blue-600/80"
                : isReview
                ? "bg-emerald-300/70 group-hover:bg-emerald-400"
                : "bg-[#93C5FD] group-hover:bg-[#60A5FA]"
            }
          `}
        />

        {/* top face */}
        <div
          className={`
            absolute top-0 left-0 right-0 h-20 rounded-full flex flex-col items-center justify-center border-[4px]
            transition-all duration-300 bg-white
            ${
              isActive
                ? "border-blue-600 shadow-[0_6px_26px_rgba(37,99,235,0.45)]"
                : isReview
                ? "border-emerald-300 group-hover:border-emerald-400"
                : "border-blue-200 group-hover:border-blue-300"
            }
          `}
        >
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-1">
            Lesson {index + 1}
          </span>

          <div
            className={`transition-transform duration-300 ${
              isActive ? "scale-110" : "scale-100"
            }`}
          >
            {isActive ? (
              <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.7)] animate-pulse" />
            ) : (
              <Check className="text-blue-200 group-hover:text-blue-400 w-7 h-7 stroke-[3.5]" />
            )}
          </div>
        </div>
      </button>

      {/* Title label (right) */}
      {!isActive && (
        <>
          <div
            onClick={() => onClick(lesson.id)}
            className="hidden sm:block absolute left-[65%] top-7 text-slate-500 font-semibold text-sm cursor-pointer hover:text-slate-700 transition-colors whitespace-nowrap"
          >
            {lesson.title}
          </div>
          <div
            onClick={() => onClick(lesson.id)}
            className="sm:hidden absolute top-[105%] left-1/2 -translate-x-1/2 text-slate-500 font-medium text-xs cursor-pointer hover:text-slate-700 transition-colors text-center max-w-[220px]"
          >
            {lesson.title}
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------- FLOATING BOTTOM CARD -------------------- */

const FloatingLessonCard = ({ lesson, index, onStart }) => {
  if (!lesson) return null;
  const isReview = !!lesson.isReview;

  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-8 flex justify-center pointer-events-none z-40">
      <div className="pointer-events-auto w-[min(28rem,calc(100vw-2rem))] relative">
        {/* soft glow */}
        <div className="absolute inset-x-6 -bottom-6 h-10 rounded-full bg-blue-400/20 blur-2" />

        <div className="relative bg-white rounded-[28px] border border-slate-100 shadow-[0_18px_60px_rgba(15,23,42,0.25)] px-6 py-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/40 via-transparent to-transparent pointer-events-none" />

          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.26em] uppercase text-blue-500 text-center mb-1">
              {getLessonTag(lesson)}
            </p>
            <h4 className="text-center font-bold text-slate-900 text-lg mb-1">
              {lesson.title}
            </h4>
            <p className="text-[11px] text-slate-500 text-center mb-4">
              {getLessonText(lesson)}
            </p>

            <div className="flex items-center gap-3 mt-1">
              {/* expand placeholder */}
              <button
                type="button"
                className="h-11 w-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
              >
                <ChevronDown size={18} strokeWidth={2.5} />
              </button>

              {/* main action */}
              <button
                type="button"
                onClick={() => onStart(lesson.path)}
                className={`
                  flex-1 h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2
                  shadow-md transition-all
                  ${
                    isReview
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                  }
                `}
              >
                {isReview ? "Start Review" : "Practice"}
                <Play size={16} fill="currentColor" />
              </button>

              {/* restart */}
              <button
                type="button"
                className="h-11 w-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300 hover:text-blue-500 transition-colors"
              >
                <RefreshCw size={18} strokeWidth={2.5} />
              </button>
            </div>

            <p className="mt-3 text-[10px] text-slate-400 text-center uppercase tracking-[0.18em]">
              Lesson {index + 1} of {lessons.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- PAGE -------------------- */

const CoordinatePlaneLevel = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(1);

  const activeIndex = Math.max(
    0,
    lessons.findIndex((l) => l.id === activeId)
  );
  const progressPercent = ((activeIndex + 1) / lessons.length) * 100;
  const activeLesson = lessons[activeIndex] ?? lessons[0];

  return (
    <div className="min-h-screen bg-white py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 font-sans text-slate-900">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">
              Geometry · Module 1
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
              Coordinate Plane – Level 1
            </h1>
            <p className="text-sm md:text-[15px] text-slate-500 max-w-xl leading-relaxed">
              Build a solid foundation in coordinates before moving on to lines,
              shapes, and graphs. Follow the lessons in order for the best
              experience.
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-center items-start gap-10 md:gap-14">
          {/* LEFT CARD */}
          <aside className="w-full md:w-[360px] flex-shrink-0">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-40 bg-blue-50 flex items-center justify-center">
                {/* icon placeholder (swap with your SVG if you want) */}
                <div className="w-24 h-24 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/30 flex items-center justify-center">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl border-[3px] border-white/60 relative">
                    <div className="absolute inset-2 border border-white/50 rounded-xl" />
                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[2px] bg-white/70" />
                    <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-white/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 border border-white/60 absolute bottom-3 left-3" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white/60 absolute top-3 right-3" />
                  </div>
                </div>
              </div>

              <div className="p-7">
                <h2 className="text-xl font-extrabold mb-2">
                  Coordinate Plane
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Understand the coordinate plane to visualize the mathematical
                  world.
                </p>

                <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-[14px] h-[14px] rounded-full border border-slate-400" />
                    <span>28 Lessons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-[14px] h-[14px] rounded-full border border-slate-400" />
                    <span>308 Exercises</span>
                  </div>
                </div>

                {/* progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">
                      Level progress
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: LEVEL HEADER + TIMELINE */}
          <main className="w-full max-w-[480px] flex flex-col items-center pt-1 md:pt-3 pb-28">
            {/* level banner */}
            <div className="w-full bg-white rounded-[24px] border border-blue-200/80 shadow-[0_8px_24px_rgba(59,130,246,0.08)] px-6 py-4 mb-14">
              <p className="text-[10px] font-bold tracking-[0.26em] text-blue-500 uppercase mb-1 text-center">
                LEVEL 1
              </p>
              <p className="text-center font-semibold text-slate-900 text-lg">
                Points and Coordinates
              </p>
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                Move from basic points to applied coordinate problems.
              </p>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* timeline */}
            <div className="relative w-full flex flex-col items-center">
              <div className="absolute top-6 bottom-0 w-[3px] bg-slate-100 rounded-full z-0" />
              {lessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isActive={activeId === lesson.id}
                  onClick={setActiveId}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* floating bottom card */}
      <FloatingLessonCard
        lesson={activeLesson}
        index={activeIndex}
        onStart={(path) => navigate(path)}
      />
    </div>
  );
};

export default CoordinatePlaneLevel;
