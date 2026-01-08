import React, { useState, useEffect } from "react";
import {
  Apple,
  Star,
  RotateCcw,
  ArrowRight,
  Heart,
  Home,
  Hand,
  Sparkles,
  Smile
} from "lucide-react";

// --- LOCAL STORAGE ---
const STORAGE_KEY = "fraction_snake_data_v2";

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

// --- LEVELS ---
const LEVELS = [
  {
    id: 1,
    name: "Baby Snake",
    length: 2,
    num: 1,
    den: 2,
    color: "bg-lime-500",
    intro: "Meet Sssam! He is 1 part purple and 1 part green.",
    options: [
      { num: 1, den: 2 },
      { num: 1, den: 4 },
      { num: 2, den: 2 },
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    name: "Striped Snake",
    length: 3,
    num: 2,
    den: 3,
    color: "bg-emerald-500",
    intro: "Count the PURPLE parts first, then count ALL parts.",
    options: [
      { num: 2, den: 3 },
      { num: 1, den: 3 },
      { num: 3, den: 2 },
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    name: "Long Snake",
    length: 5,
    num: 3,
    den: 5,
    color: "bg-green-500",
    intro: "Tap the segments to help you count!",
    options: [
      { num: 3, den: 5 },
      { num: 3, den: 8 },
      { num: 2, den: 5 },
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    name: "Boss Snake",
    length: 8,
    num: 5,
    den: 8,
    color: "bg-teal-500",
    intro: "A giant snake! 5 parts are purple. How many total?",
    options: [
      { num: 5, den: 8 },
      { num: 8, den: 5 },
      { num: 5, den: 10 },
    ],
    correctIndex: 0,
  },
];

// --- SOUNDS ---
const SOUNDS = {
  pop: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a",
  correct: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.m4a",
  hiss: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a", // placeholder click
};

const FractionSnakeGame = () => {
  const [view, setView] = useState("menu");
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());

  // Game State
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [message, setMessage] = useState("");
  const [lastSelected, setLastSelected] = useState(null);
  
  // Interactive State
  const [countedSegments, setCountedSegments] = useState([]); // indices of segments clicked
  const [tutorialStep, setTutorialStep] = useState(0); 
  // Level 1 Steps: 0=Intro, 1=TapPurple, 2=TapTotal, 3=SelectOption

  const currentLevel = LEVELS[currentLevelIdx];

  const playSound = (key) => {
    try {
      const audio = new Audio(SOUNDS[key]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const startLevel = (index) => {
    const lvl = LEVELS[index];
    setCurrentLevelIdx(index);
    setMistakes(0);
    setHearts(3);
    setMessage(lvl.intro);
    setLastSelected(null);
    setCountedSegments([]);
    setView("game");

    // Level 1 Tutorial Setup
    if (lvl.id === 1) {
      setTutorialStep(1);
      setMessage("Tap the PURPLE head to count it!");
    } else {
      setTutorialStep(0); // No tutorial for other levels
    }
  };

  const resetLevel = () => {
    setMistakes(0);
    setHearts(3);
    setLastSelected(null);
    setCountedSegments([]);
    if (currentLevel.id === 1) {
        setTutorialStep(1);
        setMessage("Tap the PURPLE head to count it!");
    } else {
        setMessage(currentLevel.intro);
    }
  };

  const handleSegmentClick = (index) => {
    playSound("pop");
    
    // Toggle counting visual
    setCountedSegments(prev => {
        if (prev.includes(index)) return prev.filter(i => i !== index);
        return [...prev, index];
    });

    // Level 1 Logic
    if (currentLevel.id === 1) {
        if (tutorialStep === 1 && index === 0) { // Clicked Head (Purple)
            setTutorialStep(2);
            setMessage("Good! That's 1 purple part. Now tap the GREEN part.");
        } else if (tutorialStep === 2 && index === 1) { // Clicked Body (Green)
            setTutorialStep(3);
            setMessage("Great! 1 purple part, 2 parts total. Which fraction is that?");
        }
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (view !== "game") return;
    
    // Block interaction if tutorial isn't done
    if (currentLevel.id === 1 && tutorialStep < 3) {
        setMessage("Tap the snake parts first!");
        return;
    }

    setLastSelected(optionIndex);
    const level = currentLevel;

    if (optionIndex === level.correctIndex) {
      playSound("correct");
      handleWin();
    } else {
      setMistakes((m) => m + 1);
      const newHearts = hearts - 1;
      setHearts(newHearts);
      playSound("hiss");

      // Helpful hints
      const total = level.length;
      const purple = (level.length * level.num) / level.den;

      if (level.options[optionIndex].den !== level.den) {
         setMessage(`Look at the bottom number. There are ${total} total pieces.`);
      } else {
         setMessage(`Look at the top number. There are only ${purple} PURPLE pieces.`);
      }

      if (newHearts <= 0) {
        setView("gameover");
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
      startLevel(currentLevelIdx + 1);
    } else {
      setView("menu");
    }
  };

  // --- RENDERERS ---

  const renderMenu = () => (
    <div className="flex-1 bg-gradient-to-b from-lime-50 to-emerald-50 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="bg-lime-500 text-white p-3 rounded-2xl shadow-lg rotate-3">
                 <span className="text-2xl">🐍</span>
              </div>
              <div>
                 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Fraction Snake</h1>
                 <p className="text-sm font-bold text-lime-600 opacity-80">Count the wiggly parts!</p>
              </div>
           </div>
           <div className="bg-white px-4 py-2 rounded-full border border-lime-200 text-amber-500 font-black text-sm flex items-center gap-1 shadow-sm">
              <Star size={16} fill="currentColor" />
              {Object.values(progress.scores).reduce((a, b) => a + b, 0)}
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
                    ? "bg-white border-lime-200 hover:border-lime-400 hover:-translate-y-1 active:translate-y-0 active:border-lime-200 shadow-sm" 
                    : "bg-slate-100 border-slate-200 opacity-60 grayscale cursor-not-allowed"
                  }
                `}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner ${isUnlocked ? lvl.color : 'bg-slate-300'}`}>
                   {isUnlocked ? lvl.id : "🔒"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">{lvl.name}</h3>
                  {isUnlocked && <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target: {lvl.num}/{lvl.den}</p>}
                </div>
                {isUnlocked && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                       <Star key={s} size={16} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSnake = () => {
    const level = currentLevel;
    const total = level.length;
    const coloredCount = (level.length * level.num) / level.den;

    const segments = [];
    for (let i = 0; i < total; i++) {
      const isPurple = i < coloredCount;
      const isHead = i === 0;
      const isTail = i === total - 1;
      const isCounted = countedSegments.includes(i);
      
      // Tutorial Highlight
      const isTutorialTarget = (currentLevel.id === 1 && tutorialStep === 1 && i === 0) || 
                               (currentLevel.id === 1 && tutorialStep === 2 && i === 1);

      segments.push(
        <div key={i} className="relative flex flex-col items-center group">
             {/* The Segment */}
            <button
                onClick={() => handleSegmentClick(i)}
                className={`
                    relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-10
                    ${isHead ? "rounded-l-full" : ""}
                    ${isTail ? "rounded-r-full" : ""}
                    ${!isHead && !isTail ? "rounded-md mx-0.5" : ""}
                    ${isPurple 
                        ? "bg-purple-500 border-b-4 border-purple-700 shadow-purple-200" 
                        : `${level.color} border-b-4 border-emerald-700 shadow-emerald-100`
                    }
                    ${isTutorialTarget ? "ring-4 ring-yellow-400 z-20" : ""}
                `}
            >
                {/* Face on Head */}
                {isHead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="flex gap-1 mb-1">
                             <div className="w-2 h-2 bg-white rounded-full animate-blink"></div>
                             <div className="w-2 h-2 bg-white rounded-full animate-blink" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        {/* Tongue */}
                        <div className="w-4 h-1 bg-red-500 rounded-full animate-pulse origin-right -ml-6"></div>
                    </div>
                )}

                {/* Count Number Overlay */}
                {isCounted && (
                    <span className="text-white font-black text-xl sm:text-2xl drop-shadow-md animate-in zoom-in spin-in-12">
                        {i + 1}
                    </span>
                )}
            </button>

            {/* Hand Pointer for Tutorial */}
            {isTutorialTarget && (
                <div className="absolute -bottom-10 animate-bounce pointer-events-none z-30">
                    <Hand fill="black" className="text-white" size={32} />
                </div>
            )}
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center gap-8 py-4">
        <div className="flex items-center justify-center drop-shadow-xl animate-float">
            {segments}
        </div>
        
        {/* Helper Text */}
        <p className={`text-sm font-bold transition-opacity duration-500 ${countedSegments.length > 0 ? "opacity-100 text-lime-700" : "opacity-0"}`}>
            {countedSegments.length} parts counted!
        </p>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-lime-50 flex flex-col font-sans text-slate-800 overflow-x-hidden selection:bg-purple-200">
      
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
         <button className="flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setView("menu")}>
             <div className="bg-lime-100 p-2 rounded-xl">
                 <Home size={22} className="text-lime-700" />
             </div>
             <span className="font-black text-lg text-slate-700 hidden sm:block">SNAKE</span>
         </button>
         
         {view === "game" && (
             <div className="flex gap-1 bg-white p-2 rounded-2xl border border-slate-100">
                 {[1, 2, 3].map(h => (
                     <Heart key={h} size={24} className={h <= hearts ? "text-red-500 fill-red-500 animate-pulse" : "text-slate-200 fill-slate-200"} />
                 ))}
             </div>
         )}
      </header>

      {/* VIEW: MENU */}
      {view === "menu" && renderMenu()}

      {/* VIEW: GAME */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
            
            {/* LEFT: Snake Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-lime-50 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-10 left-10 text-lime-200 opacity-50 rotate-12"><Apple size={80} /></div>
                <div className="absolute bottom-10 right-10 text-lime-200 opacity-50 -rotate-12"><Apple size={60} /></div>

                {renderSnake()}

            </div>

            {/* RIGHT: Controls */}
            <div className="w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none z-40 flex flex-col">
                <div className="flex-1 px-6 py-6 flex flex-col justify-center">
                    
                    {/* Tutor Bubble */}
                    <div className="flex gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl shadow-lg border-4 border-white shrink-0">
                            🧐
                        </div>
                        <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-none text-slate-700 font-medium relative animate-in slide-in-from-right-2">
                             {message}
                             <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-100 rotate-45"></div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentLevel.options.map((opt, idx) => {
                            const isSelected = lastSelected === idx;
                            const isDisabled = currentLevel.id === 1 && tutorialStep < 3;
                            
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={isDisabled}
                                    className={`
                                        w-full py-4 rounded-2xl font-bold text-xl border-2 flex items-center justify-between px-6 transition-all duration-300
                                        ${isDisabled 
                                            ? "opacity-50 grayscale cursor-not-allowed bg-slate-50 border-slate-100" 
                                            : isSelected 
                                                ? "bg-purple-600 text-white border-purple-600 shadow-lg scale-100" 
                                                : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-[1.02]"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                                            {["A", "B", "C"][idx]}
                                        </div>
                                        <span className="text-2xl tracking-wide">{opt.num}/{opt.den}</span>
                                    </div>
                                    {!isDisabled && <ArrowRight size={20} className={isSelected ? "text-white" : "text-slate-300"} />}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
      )}

      {/* VIEW: WIN */}
      {view === "win" && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-[6px] border-lime-200 animate-in zoom-in">
                  <div className="inline-flex bg-lime-100 p-4 rounded-full mb-6 text-lime-600 shadow-inner">
                      <Smile size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Awesome!</h2>
                  <p className="text-slate-500 font-medium mb-6">You are a Fraction Master.</p>
                  
                  <div className="flex justify-center gap-3 mb-8">
                     {[1, 2, 3].map(s => {
                         let earned = 3;
                         if (mistakes === 1) earned = 2;
                         if (mistakes > 1) earned = 1;
                         return <Star key={s} size={36} className={s <= earned ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-200 fill-slate-200"} style={{animationDelay: s*0.1 + 's'}} />
                     })}
                  </div>

                  <button onClick={goNext} className="w-full bg-lime-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-lime-600 active:scale-95 transition-all mb-3 flex justify-center gap-2 items-center">
                      Next Snake <ArrowRight />
                  </button>
                  <button onClick={() => setView("menu")} className="text-slate-400 font-bold hover:text-slate-600">Back to Map</button>
             </div>
        </div>
      )}

      {/* VIEW: GAME OVER */}
      {view === "gameover" && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm w-full border-[6px] border-red-100 animate-in zoom-in">
                  <div className="inline-flex bg-red-50 p-4 rounded-full mb-6 text-red-500 shadow-inner">
                      <Heart size={48} fill="currentColor" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Snake Escaped!</h2>
                  <p className="text-slate-500 font-medium mb-8">Mistakes help us learn. Try again?</p>
                  
                  <button onClick={resetLevel} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-slate-700 active:scale-95 transition-all mb-3 flex justify-center gap-2 items-center">
                      <RotateCcw /> Retry Level
                  </button>
                  <button onClick={() => setView("menu")} className="text-slate-400 font-bold hover:text-slate-600">Back to Map</button>
             </div>
        </div>
      )}

      <style>{`
        .animate-blink { animation: blink 3s infinite; }
        @keyframes blink { 0%, 95% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } 100% { transform: scaleY(1); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>

    </div>
  );
};

export default FractionSnakeGame;