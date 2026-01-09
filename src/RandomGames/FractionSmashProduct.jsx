import React, { useState, useRef, useEffect } from "react";
import {
  Hammer,
  Play,
  RotateCcw,
  ArrowRight,
  Star,
  Lock,
  Heart,
  Trophy,
  Scissors,
  PaintBucket,
  Hand
} from "lucide-react";

// --- UTILS: Local Storage Manager ---
const STORAGE_KEY = "fraction_smash_data_v2";

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

// --- DATA: The Level World ---
const LEVELS = [
  {
    id: 1,
    num: 1,
    den: 2,
    cols: 2,
    rows: 1,
    color: "bg-blue-500",
    name: "The Half",
    intro: "Let's warm up! Break this block in half.",
  },
  {
    id: 2,
    num: 3,
    den: 4,
    cols: 2,
    rows: 2,
    color: "bg-indigo-500",
    name: "The Window",
    intro: "We need 3 parts out of 4. Smash it!",
  },
  {
    id: 3,
    num: 2,
    den: 3,
    cols: 3,
    rows: 1,
    color: "bg-emerald-500",
    name: "Emerald Bar",
    intro: "Watch out! We need 2 parts here.",
  },
  {
    id: 4,
    num: 3,
    den: 5,
    cols: 5,
    rows: 1,
    color: "bg-purple-600",
    name: "Long Strip",
    intro: "Count the purple ones carefully.",
  },
  {
    id: 5,
    num: 5,
    den: 8,
    cols: 4,
    rows: 2,
    color: "bg-amber-600",
    name: "Chocolate",
    intro: "Yum! How much chocolate is purple?",
  },
  {
    id: 6,
    num: 4,
    den: 9,
    cols: 3,
    rows: 3,
    color: "bg-rose-500",
    name: "Boxy",
    intro: "A perfect square. Count the grid!",
  },
  {
    id: 7,
    num: 7,
    den: 10,
    cols: 5,
    rows: 2,
    color: "bg-cyan-600",
    name: "The Big One",
    intro: "Final Boss! Don't let the big numbers scare you.",
  },
];

// --- AUDIO: Voice Lines (Placeholders) ---
// In a real app, you would add actual file paths here.
const VOICE_FILES = {
  pop: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.m4a",
  cut: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a", 
};

const FractionSmashProduct = () => {
  const [view, setView] = useState("menu"); // 'menu', 'game', 'win', 'gameover'
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  const [stage, setStage] = useState("start"); // start -> ready -> input
  const [hearts, setHearts] = useState(3);
  const [userNum, setUserNum] = useState("");
  const [userDenom, setUserDenom] = useState("");
  const [shaking, setShaking] = useState(false);
  const [tutorMessage, setTutorMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);

  // --- INTERACTIVE LESSON STATE (Level 1) ---
  const [l1Step, setL1Step] = useState(0);
  // 0: Initial (Touch Whole)
  // 1: Cut (Touch Line)
  // 2: Paint (Touch Box)
  // 3: Fraction (Explanation)

  // Visual states for animation
  const [hasTouchedWhole, setHasTouchedWhole] = useState(false);
  const [hasCut, setHasCut] = useState(false);
  const [paintedIndex, setPaintedIndex] = useState(null);

  const numInputRef = useRef(null);
  const audioRef = useRef(null);

  // -------- AUDIO HELPER ----------
  const playSound = (key) => {
    // Basic placeholder audio player
    try {
        const audio = new Audio(VOICE_FILES[key]);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first)"));
    } catch(e) {}
  };

  // -------- GAME LOGIC ----------
  const resetLevel = (idxOverride) => {
    const idx = typeof idxOverride === "number" ? idxOverride : currentLevelIdx;
    setStage("start");
    setHearts(3);
    setMistakes(0);
    setUserNum("");
    setUserDenom("");
    
    // Reset Lesson State
    setL1Step(0);
    setHasTouchedWhole(false);
    setHasCut(false);
    setPaintedIndex(null);

    setTutorMessage(LEVELS[idx].intro);
  };

  const startGame = (index) => {
    setCurrentLevelIdx(index);
    setView("game");
    resetLevel(index);
  };

  const handleSmash = () => {
    setShaking(true);
    playSound("cut");
    setTutorMessage("SMASHING! 💥");
    setTimeout(() => {
      setShaking(false);
      setStage("input");
      setTutorMessage("You broke it! Enter the PURPLE fraction.");
      setTimeout(() => numInputRef.current?.focus(), 100);
    }, 600);
  };

  const checkAnswer = () => {
    const level = LEVELS[currentLevelIdx];
    const n = parseInt(userNum);
    const d = parseInt(userDenom);
    if (!userNum || !userDenom) return;

    if (n === level.num && d === level.den) {
      playSound("success");
      handleWin();
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setMistakes((prev) => prev + 1);

      if (newHearts <= 0) {
        setView("gameover");
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 400);

        if (d !== level.den) {
          setTutorMessage("💔 Count ALL the pieces for the bottom number.");
        } else if (n !== level.num) {
          setTutorMessage("💔 Only count the colored pieces for the top number.");
        } else {
          setTutorMessage("💔 Not quite. Count slowly and try again.");
        }
      }
    }
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
      startGame(currentLevelIdx + 1);
    } else {
      setView("menu");
    }
  };

  // -------- LEVEL 1 INTERACTIVE LOGIC --------
  const handleL1Interaction = (action, payload) => {
    if (l1Step === 0 && action === "touch_whole") {
        setHasTouchedWhole(true);
        playSound("pop");
        setTutorMessage("Great! It's one solid block.");
        setTimeout(() => {
            setL1Step(1);
            setTutorMessage("Tap the scissors to CUT it in half!");
        }, 1000);
    }
    if (l1Step === 1 && action === "cut") {
        setHasCut(true);
        playSound("cut");
        setTutorMessage("Nice cut! Now we have 2 equal parts.");
        setTimeout(() => {
            setL1Step(2);
            setTutorMessage("Tap the first box to PAINT it purple!");
        }, 1500);
    }
    if (l1Step === 2 && action === "paint") {
        setPaintedIndex(payload);
        playSound("pop");
        setTutorMessage("Perfect! 1 Purple box.");
        setTimeout(() => {
            setL1Step(3);
            setTutorMessage("1 Purple Part... 2 Total Parts.");
        }, 1500);
    }
  };

  // -------- RENDERERS --------
  
  // 1. Menu Renderer
  const renderMenu = () => (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            World Map
          </h1>
          <div className="bg-white px-3 py-1 rounded-full shadow-sm border text-sm font-bold text-amber-500 flex items-center gap-1">
            <Star fill="currentColor" size={14} />
            {Object.values(progress.scores).reduce((a, b) => a + b, 0)} / {LEVELS.length * 3}
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {LEVELS.map((lvl, idx) => {
            const isUnlocked = idx <= progress.unlockedIndex;
            const stars = progress.scores[idx] || 0;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => startGame(idx)}
                className={`relative w-full p-4 rounded-2xl border-b-4 transition-all flex items-center gap-4 text-left group ${
                  isUnlocked
                    ? "bg-white border-slate-200 hover:border-purple-500 hover:-translate-y-1 shadow-sm"
                    : "bg-slate-100 border-transparent opacity-60 cursor-not-allowed"
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner ${isUnlocked ? lvl.color : "bg-slate-300"}`}>
                  {isUnlocked ? lvl.id : <Lock size={20} />}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{lvl.name}</h3>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} size={12} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                    ))}
                  </div>
                </div>

                {isUnlocked && (
                    <Play className="text-purple-200 group-hover:text-purple-600 transition-colors" fill="currentColor" size={24} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 2. Interactive Shape Renderer
  const renderShape = () => {
    const level = LEVELS[currentLevelIdx];
    const isLevelOne = level.id === 1;

    // --- LEVEL 1 INTERACTIVE VISUALS ---
    if (isLevelOne && stage === "start") {
      
      // STEP 0: THE WHOLE
      if (l1Step === 0) {
        return (
          <div className="relative group cursor-pointer" onClick={() => handleL1Interaction("touch_whole")}>
             <div className={`w-64 h-32 ${level.color} rounded-2xl shadow-xl border-4 border-white/40 flex items-center justify-center relative overflow-hidden transition-transform ${hasTouchedWhole ? "scale-105" : "hover:scale-105 active:scale-95"}`}>
                <span className="text-white font-black text-4xl tracking-widest opacity-90 drop-shadow-md">1 WHOLE</span>
                {/* Hand Hint */}
                <div className="absolute -bottom-8 right-1/2 translate-x-1/2 animate-bounce text-slate-400 flex flex-col items-center">
                    <Hand size={24} />
                    <span className="text-xs font-bold">Tap Me!</span>
                </div>
             </div>
          </div>
        );
      }

      // STEP 1: THE CUT
      if (l1Step === 1) {
        return (
            <div className="relative w-64 h-32">
                {/* Left Half */}
                <div className={`absolute top-0 left-0 w-1/2 h-full ${level.color} rounded-l-2xl border-4 border-r-0 border-white/40 transition-all duration-700 ease-out ${hasCut ? "-translate-x-2" : ""}`}></div>
                {/* Right Half */}
                <div className={`absolute top-0 right-0 w-1/2 h-full ${level.color} rounded-r-2xl border-4 border-l-0 border-white/40 transition-all duration-700 ease-out ${hasCut ? "translate-x-2" : ""}`}></div>
                
                {/* Scissor / Cut Line */}
                {!hasCut && (
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer group" onClick={() => handleL1Interaction("cut")}>
                        <div className="h-full w-1 border-r-4 border-dashed border-white/60 group-hover:border-white transition-colors"></div>
                        <div className="absolute bg-white p-3 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform text-pink-500">
                            <Scissors size={24} />
                        </div>
                    </div>
                )}
                {hasCut && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="bg-white/90 px-3 py-1 rounded-lg text-slate-800 font-bold text-sm shadow-sm animate-in zoom-in">
                            2 Parts!
                         </div>
                    </div>
                )}
            </div>
        );
      }

      // STEP 2 & 3: PAINT & FRACTION
      if (l1Step >= 2) {
          return (
              <div className="flex flex-col gap-6 items-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex gap-4">
                      {[0, 1].map(i => {
                          const isPainted = paintedIndex === i || (l1Step === 3 && i === 0);
                          return (
                            <button
                                key={i}
                                disabled={l1Step === 3 || paintedIndex !== null}
                                onClick={() => handleL1Interaction("paint", i)}
                                className={`
                                    w-28 h-28 rounded-2xl border-4 transition-all duration-500 relative overflow-hidden shadow-sm
                                    ${isPainted ? "bg-purple-600 border-purple-300 scale-105 ring-4 ring-purple-100" : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50"}
                                `}
                            >
                                {l1Step === 2 && paintedIndex === null && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <PaintBucket className="text-purple-400" size={32} />
                                    </div>
                                )}
                                {isPainted && (
                                    <div className="animate-in zoom-in spin-in-12 duration-500 absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-black text-4xl">1</span>
                                    </div>
                                )}
                            </button>
                          )
                      })}
                  </div>

                  {/* Fraction Explanation Overlay */}
                  {l1Step === 3 && (
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-100 animate-in slide-in-from-bottom-8 duration-700">
                          <div className="flex flex-col items-center">
                              <span className="text-4xl font-black text-purple-600">1</span>
                              <span className="text-xs font-bold text-purple-600 uppercase">Purple</span>
                          </div>
                          <div className="h-12 w-1 bg-slate-200 rotate-12"></div>
                          <div className="flex flex-col items-center">
                              <span className="text-4xl font-black text-slate-400">2</span>
                              <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                          </div>
                      </div>
                  )}
              </div>
          )
      }
    }

    // --- STANDARD GAME VISUALS ---
    const isWhole = stage === "start" || stage === "ready";

    if (isWhole) {
      return (
        <div className={`w-64 h-32 ${level.color} rounded-2xl shadow-xl border-4 border-white/20 transition-transform ${shaking ? "animate-bounce" : ""} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 skew-x-12"></div>
          <span className="text-white font-black text-4xl opacity-50 tracking-widest z-10">WHOLE</span>
        </div>
      );
    }

    // Broken fraction after smash
    const parts = [];
    for (let i = 0; i < level.den; i++) {
      const isTarget = i < level.num;
      parts.push(
        <div key={i} className={`rounded-xl border-2 border-white/30 shadow-sm flex items-center justify-center text-white font-bold text-2xl ${isTarget ? "bg-purple-600 ring-4 ring-purple-300 ring-opacity-50 z-10" : level.color}`}>
          {isTarget ? "?" : ""}
        </div>
      );
    }

    return (
      <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
          gridTemplateRows: `repeat(${level.rows}, 1fr)`,
          gap: "8px",
          width: "300px",
          aspectRatio: "2/1",
        }}>
        {parts}
      </div>
    );
  };

  const level = LEVELS[currentLevelIdx];
  const isLevelOne = level.id === 1;

  // -------- MAIN RETURN --------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden selection:bg-purple-100">
      
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("menu")}>
          <div className="bg-purple-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Trophy className="text-white" size={20} />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:block text-slate-700 group-hover:text-purple-600">FRACTION SMASH</span>
        </div>

        {view === "game" && (
          <div className="flex gap-1 bg-slate-100 p-2 rounded-2xl">
            {[1, 2, 3].map((h) => (
              <Heart key={h} size={24} className={`${h <= hearts ? "text-red-500 fill-red-500" : "text-slate-300 fill-slate-300"} transition-colors`} />
            ))}
          </div>
        )}
      </header>

      {/* MENU */}
      {view === "menu" && renderMenu()}

      {/* GAME AREA */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-5xl mx-auto w-full">
          
          {/* LEFT: VISUALS */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 relative min-h-[400px]">
            <div className="relative z-10 scale-110 sm:scale-125">
              {renderShape()}
            </div>
            
            {/* Visual Hammer for Ready Stage */}
            {stage === "ready" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                <Hammer size={80} className="text-white drop-shadow-2xl animate-bounce" fill="currentColor" />
              </div>
            )}
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="w-full md:w-[420px] bg-white border-t md:border-t-0 md:border-l border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none z-30 flex flex-col">
            <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
              
              {/* Tutor Bubble */}
              <div className="flex gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg shrink-0">
                  <span className="animate-pulse">?</span>
                </div>
                <div className="bg-slate-100 p-5 rounded-2xl rounded-tl-none text-slate-700 font-medium w-full text-base shadow-sm relative">
                   <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-100 rotate-45"></div>
                   <p className="relative z-10">{tutorMessage}</p>
                </div>
              </div>

              {/* ACTION AREA */}
              
              {/* LEVEL 1: INTRO BUTTONS */}
              {stage === "start" && isLevelOne && (
                 <div className="flex flex-col gap-3">
                    {l1Step === 3 && (
                        <button onClick={() => { setStage("ready"); setTutorMessage("Your turn! Smash the block!"); }} className="bg-purple-600 text-white py-4 rounded-2xl font-bold text-xl shadow-xl hover:bg-purple-700 hover:scale-105 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4">
                            Start Game <Play fill="currentColor" />
                        </button>
                    )}
                    {l1Step < 3 && (
                         <div className="text-center text-slate-400 text-sm font-bold uppercase tracking-wider animate-pulse">
                            Follow the instructions above
                         </div>
                    )}
                 </div>
              )}

              {/* OTHER LEVELS: START */}
              {stage === "start" && !isLevelOne && (
                <button
                  onClick={() => {
                    setStage("ready");
                    setTutorMessage("Tap SMASH to break it!");
                  }}
                  className="bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl shadow-xl active:scale-95 transition-transform w-full hover:bg-slate-800"
                >
                  Start Level {level.id}
                </button>
              )}

              {/* SMASH BUTTON */}
              {stage === "ready" && (
                <button
                  onClick={handleSmash}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-2xl font-black text-2xl shadow-orange-200 shadow-xl flex justify-center gap-3 items-center hover:scale-[1.02] active:scale-95 transition-all w-full"
                >
                  <Hammer className="animate-spin-slow" size={28} /> SMASH IT!
                </button>
              )}

              {/* INPUTS */}
              {stage === "input" && (
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                  <div className={`flex flex-col items-center gap-2 mb-6 ${shaking ? "animate-shake" : ""}`}>
                    
                    {/* Numerator */}
                    <div className="relative">
                        <input
                        ref={numInputRef}
                        type="number"
                        value={userNum}
                        onChange={(e) => setUserNum(e.target.value)}
                        placeholder="?"
                        className="w-32 h-24 text-center text-5xl font-black bg-purple-50 border-4 border-purple-200 focus:border-purple-600 focus:bg-white rounded-3xl outline-none transition-all placeholder:text-purple-200 text-purple-600"
                        />
                         <span className="absolute top-1/2 -right-12 -translate-y-1/2 text-sm font-bold text-purple-300 uppercase rotate-90 w-20 text-center">Purple</span>
                    </div>

                    {/* Divider */}
                    <div className="w-24 h-2 bg-slate-200 rounded-full my-1"></div>

                    {/* Denominator */}
                    <div className="relative">
                        <input
                        type="number"
                        value={userDenom}
                        onChange={(e) => setUserDenom(e.target.value)}
                        placeholder="?"
                        className="w-32 h-24 text-center text-5xl font-black bg-slate-50 border-4 border-slate-200 focus:border-slate-600 focus:bg-white rounded-3xl outline-none transition-all placeholder:text-slate-200 text-slate-700"
                        />
                         <span className="absolute top-1/2 -right-12 -translate-y-1/2 text-sm font-bold text-slate-300 uppercase rotate-90 w-20 text-center">Total</span>
                    </div>

                  </div>
                  <button
                    onClick={checkAnswer}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Check Answer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl text-center max-w-sm w-full border-8 border-green-400 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-50 -z-10"></div>
            
            <div className="inline-flex bg-white p-4 rounded-full mb-6 text-green-500 shadow-md">
              <Trophy size={48} fill="currentColor" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Level Cleared!</h2>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3].map((s) => {
                 let earned = 3;
                 if (mistakes === 1) earned = 2;
                 if (mistakes > 1) earned = 1;
                return (
                  <Star key={s} size={36} className={`${s <= earned ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-200 fill-slate-200"}`} />
                );
              })}
            </div>

            <button onClick={goNext} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-green-600 transition-transform active:scale-95 flex justify-center gap-2 items-center mb-4">
              Next Level <ArrowRight />
            </button>
            <button onClick={() => setView("menu")} className="text-slate-400 font-bold text-sm hover:text-slate-600">
              Back to Map
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {view === "gameover" && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl text-center max-w-sm w-full border-8 border-red-100 animate-in zoom-in duration-300">
            <div className="inline-flex bg-red-50 p-4 rounded-full mb-6 text-red-500">
              <Heart size={48} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Out of Hearts</h2>
            <p className="text-slate-500 mb-8 font-medium">Mistakes help us learn!</p>

            <button onClick={resetLevel} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex justify-center gap-2 items-center hover:bg-slate-800 transition-transform active:scale-95 mb-4">
              <RotateCcw /> Try Again
            </button>
            <button onClick={() => setView("menu")} className="text-slate-400 font-bold text-sm hover:text-slate-600">
              Back to Map
            </button>
          </div>
        </div>
      )}

      {/* CSS Utilities for Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FractionSmashProduct;