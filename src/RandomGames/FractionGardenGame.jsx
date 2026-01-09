import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  Droplets,
  ArrowRight,
  RotateCcw,
  Star,
  Home,
  Hand,
  CloudRain,
  Sprout,
  Flower2
} from "lucide-react";

// --- LOCAL STORAGE ---
const STORAGE_KEY = "fraction_garden_data_v2";

const getProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { unlockedIndex: 0, scores: {} };
  } catch (e) {
    return { unlockedIndex: 0, scores: {} };
  }
};

const saveProgress = (index, stars) => {
  const current = getProgress();
  const newScores = { ...current.scores };
  if (!newScores[index] || stars > newScores[index]) {
    newScores[index] = stars;
  }

  const data = {
    unlockedIndex: Math.max(current.unlockedIndex, index + 1),
    scores: newScores,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

// --- LEVEL DATA ---
const LEVELS = [
  {
    id: 1,
    name: "Tiny Garden",
    num: 1,
    den: 2,
    rows: 2,
    cols: 2, // 4 total, target 2 watered (2/4 = 1/2)
    intro: "Let's learn! Water exactly HALF (1/2) of the garden.",
  },
  {
    id: 2,
    name: "Strip Garden",
    num: 2,
    den: 3,
    rows: 3,
    cols: 3, // 9 total, target 6 watered (6/9 = 2/3)
    intro: "Water two-thirds (2/3). Think: 2 rows out of 3!",
  },
  {
    id: 3,
    name: "Checker Garden",
    num: 3,
    den: 4,
    rows: 2,
    cols: 4, // 8 total, target 6 watered (6/8 = 3/4)
    intro: "Water three-quarters (3/4). Leave 1 quarter dry.",
  },
  {
    id: 4,
    name: "Big Patch",
    num: 5,
    den: 8,
    rows: 4,
    cols: 4, // 16 total, target 10 watered (10/16 = 5/8)
    intro: "A big field! Water 5/8 of the patches.",
  },
];

// --- AUDIO PLACEHOLDERS ---
const SOUNDS = {
    water: "https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.m4a", // Liquid splash
    success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.m4a", // Win chime
    click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a", // Click
};

const FractionGardenGame = () => {
  const [view, setView] = useState("menu"); // menu | game | win
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  const [selectedCells, setSelectedCells] = useState([]);
  const [message, setMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // --- TUTORIAL STATE (Level 1) ---
  const [tutorialStep, setTutorialStep] = useState(0); 
  // 0: Intro, 1: First Water, 2: Second Water, 3: Explanation/Ready

  // ---------- AUDIO ----------
  const playSound = (key) => {
    try {
        const audio = new Audio(SOUNDS[key]);
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch (e) {}
  };

  // ---------- HELPERS ----------
  const currentLevel = LEVELS[currentLevelIdx];
  const totalCells = currentLevel.rows * currentLevel.cols;
  const selectedCount = selectedCells.filter(Boolean).length;

  const initGridForLevel = (level) => {
    const total = level.rows * level.cols;
    setSelectedCells(Array(total).fill(false));
  };

  const startLevel = (index) => {
    setCurrentLevelIdx(index);
    const lvl = LEVELS[index];
    initGridForLevel(lvl);
    setMistakes(0);
    setMessage(lvl.intro);
    setView("game");
    
    // Reset Tutorial for Level 1
    if (lvl.id === 1) {
        setTutorialStep(0);
        setMessage("Welcome to your garden! It's dry and needs water.");
        setTimeout(() => {
            setTutorialStep(1);
            setMessage("We need 1/2 watered. Tap the first patch!");
        }, 2000);
    } else {
        setTutorialStep(-1); // Disable tutorial
    }
  };

  const resetLevel = () => {
    initGridForLevel(currentLevel);
    setMistakes(0);
    setMessage(currentLevel.intro);
    setIsChecking(false);
    if (currentLevel.id === 1) {
        setTutorialStep(1); // Restart from step 1
    }
  };

  const toggleCell = (cellIndex) => {
    // Tutorial Logic Blocking
    if (currentLevel.id === 1) {
        if (tutorialStep === 1 && cellIndex !== 0) return; // Only allow first cell
        if (tutorialStep === 2 && cellIndex !== 3) return; // Only allow specific cell (e.g. last one)
        if (tutorialStep === 3) return; // Frozen while explaining
    }

    playSound("water");
    
    const newState = [...selectedCells];
    newState[cellIndex] = !newState[cellIndex];
    setSelectedCells(newState);

    // Tutorial Progression
    if (currentLevel.id === 1) {
        if (tutorialStep === 1 && !selectedCells[cellIndex]) {
            // Just watered first cell
            setMessage("Good job! That's 1 patch watered.");
            setTimeout(() => {
                setTutorialStep(2);
                setMessage("1 out of 4 is not half yet. Water one more!");
            }, 1000);
        }
        if (tutorialStep === 2 && !selectedCells[cellIndex]) {
            // Just watered second cell
            setMessage("Perfect! 2 patches watered.");
            setTimeout(() => {
                setTutorialStep(3);
                setMessage("2 out of 4 is exactly HALF (1/2)! Tap Check!");
            }, 1000);
        }
    }
  };

  const checkAnswer = () => {
    setIsChecking(true);
    const level = currentLevel;
    
    // Compare fractions: selected / total ?= target num / target den
    const left = selectedCount * level.den;
    const right = level.num * totalCells;
    const correct = left === right;

    setTimeout(() => {
        setIsChecking(false);
        if (correct) {
          playSound("success");
          handleWin();
        } else {
          setMistakes((m) => m + 1);
          playSound("click"); // using click as generic error sound for now
    
          if (selectedCount === 0) {
            setMessage("The garden is bone dry! Tap squares to water them.");
          } else if (left < right) {
            setMessage("Not enough water! The plants are thirsty.");
          } else {
            setMessage("Too much water! It's a swamp! Uncheck some squares.");
          }
        }
    }, 600); // Small delay for suspense
  };

  const handleWin = () => {
    let stars = 3;
    if (mistakes === 1) stars = 2;
    if (mistakes > 1) stars = 1;

    const newProgress = saveProgress(currentLevelIdx, stars);
    setProgress(newProgress);
    setView("win");
  };

  const goNext = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      startLevel(currentLevelIdx + 1);
    } else {
      setView("menu");
    }
  };

  // ---------- RENDERERS ----------
  
  const renderMenu = () => (
    <div className="flex-1 bg-gradient-to-b from-sky-50 to-emerald-50 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg transform -rotate-6">
              <Leaf size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-900 tracking-tight">
                Fraction Garden
              </h1>
              <p className="text-sm text-emerald-600 font-bold opacity-80">
                Grow your knowledge!
              </p>
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100 text-sm font-black text-amber-500 flex items-center gap-2">
            <Star size={16} fill="currentColor" />
            {Object.values(progress.scores).reduce((a, b) => a + b, 0)} / {LEVELS.length * 3}
          </div>
        </div>

        <div className="grid gap-4">
          {LEVELS.map((lvl, idx) => {
            const isUnlocked = idx <= progress.unlockedIndex;
            const stars = progress.scores[idx] || 0;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => startLevel(idx)}
                className={`relative w-full p-4 rounded-3xl border-b-[6px] transition-all flex items-center gap-4 text-left group
                  ${isUnlocked 
                    ? "bg-white border-emerald-200 hover:border-emerald-400 hover:-translate-y-1 active:translate-y-0 active:border-emerald-200 shadow-sm" 
                    : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed grayscale"
                  }
                `}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner ${isUnlocked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  {isUnlocked ? lvl.id : "🔒"}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {lvl.name}
                  </h3>
                  <div className="flex gap-2 items-center mt-1">
                     <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                        Target: {lvl.num}/{lvl.den}
                     </span>
                  </div>
                </div>

                {isUnlocked && (
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} size={14} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGrid = () => {
    const level = currentLevel;
    const cells = [];
    const total = level.rows * level.cols;

    for (let i = 0; i < total; i++) {
      const active = selectedCells[i];
      // Highlight logic for tutorial
      const isTarget = (level.id === 1) && 
                       ((tutorialStep === 1 && i === 0) || 
                        (tutorialStep === 2 && i === 3));

      cells.push(
        <button
          key={i}
          type="button"
          onClick={() => toggleCell(i)}
          className={`
            relative rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden
            ${active 
                ? "bg-cyan-500 border-b-4 border-cyan-700 shadow-cyan-200" 
                : "bg-amber-700 border-b-4 border-amber-900 shadow-sm hover:bg-amber-600"
            }
            ${isTarget ? "ring-4 ring-yellow-400 ring-offset-2 z-10 scale-105" : ""}
          `}
          style={{ minHeight: '60px' }}
        >
          {/* Soil Texture Pattern */}
          {!active && (
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px'}}></div>
          )}

          {/* Water Content */}
          {active && (
            <div className="animate-in zoom-in duration-300 flex items-center justify-center w-full h-full">
                <div className="absolute inset-0 bg-blue-400 opacity-50 animate-pulse"></div>
                <div className="relative z-10 text-white drop-shadow-md">
                     <div className="absolute -top-3 -right-3">
                         <Flower2 size={16} className="text-pink-300 animate-bounce" style={{animationDelay: `${i * 0.1}s`}} />
                     </div>
                     <Sprout size={32} fill="currentColor" className="text-lime-300" />
                </div>
            </div>
          )}

          {/* Tutorial Finger Hint */}
          {isTarget && !active && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce flex flex-col items-center">
                  <Hand className="text-white drop-shadow-md" fill="black" size={32} />
                  <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TAP</span>
              </div>
          )}
        </button>
      );
    }

    return (
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          gap: "12px",
        }}
        className="w-full max-w-[320px] aspect-square p-4 bg-emerald-900/10 rounded-3xl border-4 border-emerald-900/5"
      >
        {cells}
      </div>
    );
  };

  // ---------- MAIN RETURN ----------
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-sans text-slate-800 overflow-x-hidden selection:bg-emerald-200">
      
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <button className="flex items-center gap-3 group transition-transform active:scale-95" onClick={() => setView("menu")}>
          <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <Home size={22} className="text-emerald-700" />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:block text-slate-700">GARDEN</span>
        </button>

        <div className="flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-2xl border border-sky-200">
          <Droplets size={18} className="text-sky-600 animate-pulse" fill="currentColor" />
          <span className="font-bold text-sky-800 text-sm">
            {selectedCount} / {totalCells}
          </span>
        </div>
      </header>

      {/* VIEW: MENU */}
      {view === "menu" && renderMenu()}

      {/* VIEW: GAME */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          
          {/* LEFT: VISUALS */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">
            {/* Background Decor */}
            <div className="absolute top-10 left-10 text-emerald-200/50 -z-10"><CloudRain size={120} /></div>
            <div className="absolute bottom-10 right-10 text-emerald-200/50 -z-10"><CloudRain size={90} /></div>

            <div className="mb-6 text-center animate-in slide-in-from-top-5">
              <span className="inline-block bg-white/80 backdrop-blur border border-emerald-100 px-4 py-1 rounded-full text-xs font-black text-emerald-600 uppercase tracking-widest shadow-sm mb-2">
                Level {currentLevel.id}
              </span>
              <h2 className="text-2xl font-bold text-slate-800">
                Water <span className="text-emerald-600 text-3xl font-black mx-1">{currentLevel.num}/{currentLevel.den}</span> of the garden
              </h2>
            </div>

            {renderGrid()}

            {/* Visual Fraction Representation Below Grid */}
            <div className="mt-8 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                 <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold text-blue-500">{selectedCount}</span>
                     <span className="text-[10px] uppercase font-bold text-blue-400">Watered</span>
                 </div>
                 <div className="h-8 w-px bg-slate-300 rotate-12"></div>
                 <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold text-slate-500">{totalCells}</span>
                     <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                 </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none z-40 flex flex-col">
            <div className="flex-1 px-6 py-6 flex flex-col justify-center">
              
              {/* TUTOR MESSAGE */}
              <div className="flex gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200 shrink-0 transform rotate-3">
                  🌱
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl rounded-tl-none text-slate-700 font-medium text-base w-full shadow-sm relative animate-in fade-in slide-in-from-left-2">
                  <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 border-l border-b border-slate-100 transform rotate-45"></div>
                  {message}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-4">
                <button
                  onClick={checkAnswer}
                  disabled={isChecking || (currentLevel.id === 1 && tutorialStep < 3)}
                  className={`
                    w-full py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all
                    ${isChecking || (currentLevel.id === 1 && tutorialStep < 3)
                        ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed" 
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02] active:scale-95 shadow-emerald-200"
                    }
                  `}
                >
                  {isChecking ? "Checking..." : "Check Garden"}
                  {!isChecking && <ArrowRight size={24} />}
                </button>

                <button
                  onClick={resetLevel}
                  className="w-full bg-white border-2 border-slate-100 text-slate-400 py-3 rounded-2xl font-bold text-sm hover:text-slate-600 hover:border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW: WIN SCREEN */}
      {view === "win" && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-[6px] border-emerald-100 animate-in zoom-in duration-300">
            
            <div className="inline-flex bg-emerald-50 p-6 rounded-full mb-6 text-emerald-500 shadow-inner">
              <Flower2 size={48} className="animate-spin-slow" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-2">Beautiful!</h2>
            <p className="text-slate-500 font-medium mb-8">The garden is happy.</p>

            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3].map((s) => {
                let earned = 3;
                if (mistakes === 1) earned = 2;
                if (mistakes > 1) earned = 1;
                return (
                  <Star
                    key={s}
                    size={36}
                    className={`${
                      s <= earned
                        ? "text-amber-400 fill-amber-400 animate-bounce"
                        : "text-slate-200 fill-slate-200"
                    }`}
                    style={{ animationDelay: `${s * 0.1}s` }}
                  />
                );
              })}
            </div>

            <button
              onClick={goNext}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex justify-center gap-2 items-center mb-3"
            >
              Next Garden <ArrowRight />
            </button>
            <button
              onClick={() => setView("menu")}
              className="text-slate-400 font-bold text-sm hover:text-slate-600 p-2"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FractionGardenGame;