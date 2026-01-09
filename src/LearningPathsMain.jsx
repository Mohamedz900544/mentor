import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, MapPin, Zap, ChevronRight, Star, Atom, GraduationCap } from "lucide-react";

/**
 * Routes configured to your application structure
 */
const ROUTES = {
  coordinatePlane: "/panelco",
  circuits: "/CircuitUnit-Map",
};

const CourseCard = ({ title, subtitle, Icon, badge, onClick, theme = "blue" }) => {
  // Theme definitions for distinct subject styling
  const themes = {
    blue: {
      bg: "group-hover:bg-blue-50/50",
      iconBg: "bg-blue-50 text-blue-600",
      iconGroupHover: "group-hover:bg-blue-600 group-hover:text-white",
      progress: "bg-blue-500",
      glow: "group-hover:shadow-blue-200/50",
    },
    amber: {
      bg: "group-hover:bg-amber-50/50",
      iconBg: "bg-amber-50 text-amber-600",
      iconGroupHover: "group-hover:bg-amber-600 group-hover:text-white",
      progress: "bg-amber-500",
      glow: "group-hover:shadow-amber-200/50",
    },
    emerald: {
      bg: "group-hover:bg-emerald-50/50",
      iconBg: "bg-emerald-50 text-emerald-600",
      iconGroupHover: "group-hover:bg-emerald-600 group-hover:text-white",
      progress: "bg-emerald-500",
      glow: "group-hover:shadow-emerald-200/50",
    },
  };

  const t = themes[theme] || themes.blue;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col text-left w-[200px] sm:w-[220px] shrink-0 outline-none"
    >
      <div
        className={`
          relative h-full flex flex-col bg-white rounded-[1.25rem] border border-slate-100
          shadow-[0_4px_20px_rgb(0,0,0,0.03)] 
          transition-all duration-500 ease-out
          hover:shadow-[0_12px_24px_rgb(0,0,0,0.06)] hover:-translate-y-1
          hover:border-transparent ${t.glow}
          overflow-hidden
        `}
      >
        {/* Subtle Background Wash */}
        <div className={`absolute inset-0 opacity-0 ${t.bg} transition-opacity duration-500`} />

        <div className="relative p-4 flex flex-col h-full z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className={`
              w-10 h-10 rounded-[0.8rem] flex items-center justify-center 
              ${t.iconBg} transition-colors duration-500 ease-out
              ${t.iconGroupHover}
            `}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            
            {badge && (
              <span className="
                px-2 py-0.5 rounded-full bg-slate-900/5 backdrop-blur-sm text-slate-700 
                text-[9px] font-bold uppercase tracking-wider
                group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500
              ">
                {badge}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-slate-800 transition-colors">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
              {subtitle}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                  Start Path
                </span>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full w-0 group-hover:w-full ${t.progress} transition-all duration-1000 ease-out rounded-full`} />
                </div>
              </div>
              
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center 
                bg-slate-50 text-slate-400 
                group-hover:bg-slate-900 group-hover:text-white
                transition-all duration-500 ease-out
              `}>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, theme }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50/80",
    amber: "text-amber-600 bg-amber-50/80",
  };
  
  const activeColor = colors[theme] || colors.blue;

  return (
    <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeColor} backdrop-blur-sm`}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

export default function LearningPathsMain() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Main Page Header */}
        <header className="mb-8 pl-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 text-[9px] font-bold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3 h-3 text-indigo-500" />
            Student Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
            Learning Paths
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            Select a module below to continue your interactive lessons in mathematics and science.
          </p>
        </header>

        {/* Content Container */}
        <div className="space-y-8">
          
          {/* Math Section */}
          <section>
            <SectionHeader
              icon={BookOpen}
              title="Mathematics"
              subtitle="Foundational algebra and geometry"
              theme="blue"
            />
            
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-4 sm:px-1 -mx-4 sm:mx-0 snap-x scrollbar-hide">
                <CourseCard
                  title="Coordinate Plane"
                  subtitle="Master points, quadrants, and plotting on the Cartesian grid."
                  Icon={MapPin}
                  badge="New"
                  theme="blue"
                  onClick={() => navigate(ROUTES.coordinatePlane)}
                />
                
                {/* Placeholder */}
                <div className="opacity-40 grayscale pointer-events-none select-none">
                   <CourseCard
                    title="Linear Equations"
                    subtitle="Understanding slope, intercepts, and graphing lines."
                    Icon={Star}
                    theme="blue"
                    onClick={() => {}}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Science Section */}
          <section>
            <SectionHeader
              icon={Atom}
              title="Physics & Engineering"
              subtitle="Explore the laws of the universe"
              theme="amber"
            />
            
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-4 sm:px-1 -mx-4 sm:mx-0 snap-x scrollbar-hide">
              <CourseCard
                title="Electrical Circuits"
                subtitle="Voltage, current, resistance, and building loops."
                Icon={Zap}
                badge="Popular"
                theme="amber"
                onClick={() => navigate(ROUTES.circuits)}
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}