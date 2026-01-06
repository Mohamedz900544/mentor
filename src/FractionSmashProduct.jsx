import React, { useState, useRef, useEffect } from 'react';
import { Hammer, Play, RotateCcw, ArrowRight, Star, Lock, Heart, Home, Trophy, Settings } from 'lucide-react';

// --- UTILS: Local Storage Manager ---
const STORAGE_KEY = 'fraction_smash_data';

const getProgress = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { unlockedIndex: 0, scores: {} };
};

const saveProgress = (index, stars) => {
  const current = getProgress();
  const newScores = { ...current.scores };
  // Only overwrite score if new score is better or doesn't exist
  if (!newScores[index] || stars > newScores[index]) {
    newScores[index] = stars;
  }
  
  const data = {
    unlockedIndex: Math.max(current.unlockedIndex, index + 1),
    scores: newScores
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

// --- DATA: The Level World ---
const LEVELS = [
  { id: 1, num: 1, den: 2, cols: 2, rows: 1, color: 'bg-blue-500', name: "The Half", intro: "Let's warm up! Break this block in half." },
  { id: 2, num: 3, den: 4, cols: 2, rows: 2, color: 'bg-indigo-500', name: "The Window", intro: "We need 3 parts out of 4. Smash it!" },
  { id: 3, num: 2, den: 3, cols: 3, rows: 1, color: 'bg-emerald-500', name: "Emerald Bar", intro: "Watch out! We need 2 parts here." },
  { id: 4, num: 3, den: 5, cols: 5, rows: 1, color: 'bg-purple-600', name: "Long Strip", intro: "Count the purple ones carefully." },
  { id: 5, num: 5, den: 8, cols: 4, rows: 2, color: 'bg-amber-600', name: "Chocolate", intro: "Yum! How much chocolate is purple?" },
  { id: 6, num: 4, den: 9, cols: 3, rows: 3, color: 'bg-rose-500', name: "Boxy", intro: "A perfect square. Count the grid!" },
  { id: 7, num: 7, den: 10, cols: 5, rows: 2, color: 'bg-cyan-600', name: "The Big One", intro: "Final Boss! Don't let the big numbers scare you." },
];

const FractionSmashProduct = () => {
  // --- STATE ---
  const [view, setView] = useState('menu'); // 'menu', 'game', 'win', 'gameover'
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [progress, setProgress] = useState(getProgress());
  
  // Game Session State
  const [stage, setStage] = useState('start'); // start -> ready -> smashing -> input
  const [hearts, setHearts] = useState(3);
  const [userNum, setUserNum] = useState('');
  const [userDenom, setUserDenom] = useState('');
  const [shaking, setShaking] = useState(false);
  const [tutorMessage, setTutorMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);
  
  // Refs
  const numInputRef = useRef(null);

  // --- ACTIONS ---

  const startGame = (index) => {
    setCurrentLevelIdx(index);
    setView('game');
    resetLevel();
  };

  const resetLevel = () => {
    setStage('start');
    setHearts(3);
    setMistakes(0);
    setUserNum('');
    setUserDenom('');
    setTutorMessage(LEVELS[currentLevelIdx].intro);
  };

  const handleSmash = () => {
    setShaking(true);
    setTutorMessage("SMASHING! 💥");
    setTimeout(() => {
      setShaking(false);
      setStage('input');
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
      // WIN
      handleWin();
    } else {
      // LOSE HEART
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setMistakes(prev => prev + 1);
      
      if (newHearts <= 0) {
        setView('gameover');
      } else {
        // Scaffolding Feedback
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
        
        if (d !== level.den) {
           setTutorMessage(`💔 Ouch! The bottom number is the TOTAL pieces. Count all squares!`);
        } else if (n !== level.num) {
           setTutorMessage(`💔 Close! Bottom is right, but count the PURPLE pieces again.`);
        } else {
           setTutorMessage(`💔 Not quite. Try counting one by one.`);
        }
      }
    }
  };

  const handleWin = () => {
    // Calculate Stars: 0 mistakes = 3 stars, 1 mistake = 2 stars, >1 = 1 star
    let stars = 3;
    if (mistakes === 1) stars = 2;
    if (mistakes > 1) stars = 1;

    // Save
    const newProgress = saveProgress(currentLevelIdx, stars);
    setProgress(newProgress);
    setView('win');
  };

  const goNext = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      startGame(currentLevelIdx + 1);
    } else {
      setView('menu'); // Or a 'Certificate' screen
    }
  };

  // --- RENDERERS ---

  // 1. MENU SCREEN
  const renderMenu = () => (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
           <h1 className="text-xl sm:text-2xl font-black text-slate-800">World Map</h1>
           <div className="bg-white px-2.5 sm:px-3 py-1 rounded-full shadow-sm border text-xs sm:text-sm font-bold text-amber-500 flex items-center gap-1">
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
                className={`
                  relative w-full p-3 sm:p-4 rounded-2xl border-b-4 transition-all flex items-center gap-3 sm:gap-4 text-left group
                  ${isUnlocked 
                    ? 'bg-white border-slate-200 hover:border-purple-500 hover:-translate-y-1 shadow-sm' 
                    : 'bg-slate-100 border-transparent opacity-60 cursor-not-allowed'}
                `}
              >
                {/* Icon Box */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-inner
                  ${isUnlocked ? lvl.color : 'bg-slate-300'}
                `}>
                  {isUnlocked ? lvl.id : <Lock size={20} />}
                </div>

                {/* Text Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{lvl.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Level {lvl.id}</p>
                </div>

                {/* Stars */}
                {isUnlocked && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                      <Star key={s} size={14} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                    ))}
                  </div>
                )}
                
                {/* Play Arrow (Only on hover on larger screens, always visible on mobile) */}
                {isUnlocked && (
                  <div className="text-purple-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Play fill="currentColor" size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 2. GAME SCREEN HELPERS
  const renderShape = () => {
    const level = LEVELS[currentLevelIdx];
    const isWhole = stage === 'start' || stage === 'ready';
    
    if (isWhole) {
      return (
        <div className={`w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px] aspect-square ${level.color} rounded-2xl shadow-2xl border-4 border-white/20 transition-transform ${shaking ? 'animate-bounce' : ''} flex items-center justify-center relative overflow-hidden`}>
           <div className="absolute inset-0 bg-white/10 skew-x-12"></div>
           <span className="text-white font-black text-3xl sm:text-4xl opacity-40 tracking-widest relative z-10">WHOLE</span>
        </div>
      );
    }

    // Broken Grid
    const parts = [];
    for (let i = 0; i < level.den; i++) {
      const isTarget = i < level.num;
      parts.push(
        <div key={i} className={`
            rounded-xl border-2 border-white/30 shadow-sm flex items-center justify-center text-white font-bold text-xl
            animate-in zoom-in duration-500
            ${isTarget ? 'bg-purple-600 ring-4 ring-purple-400 ring-opacity-50 z-10' : level.color}
        `}>
          {isTarget ? '?' : ''}
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
          gridTemplateRows: `repeat(${level.rows}, 1fr)`,
          gap: '8px',
          width: '100%',
          maxWidth: '280px',
          aspectRatio: '1/1'
        }}
      >
        {parts}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
          <div className="bg-purple-600 p-2 rounded-lg">
            <Trophy className="text-white" size={20} />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight hidden sm:block">FRACTION SMASH</span>
        </div>
        
        {view === 'game' && (
           <div className="flex gap-1">
             {[1, 2, 3].map(h => (
               <Heart
                 key={h}
                 size={22}
                 className={`${h <= hearts ? 'text-red-500 fill-red-500' : 'text-slate-200 fill-slate-200'} transition-colors`}
               />
             ))}
           </div>
        )}
      </header>

      {/* VIEW ROUTER */}
      
      {/* 1. MENU */}
      {view === 'menu' && renderMenu()}

      {/* 2. GAMEPLAY */}
      {(view === 'game') && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-5xl mx-auto w-full">
          
          {/* LEFT: VISUALS */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative">
             {renderShape()}
             {stage === 'ready' && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                 <Hammer size={80} className="text-white drop-shadow-lg animate-bounce" />
               </div>
             )}
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none z-20 flex flex-col">
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
              
              {/* TUTOR BUBBLE */}
              <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-4 border-white shadow-lg shrink-0">S</div>
                <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 font-medium w-full text-sm sm:text-base animate-in fade-in slide-in-from-left-2">
                  {tutorMessage}
                </div>
              </div>

              {/* CONTROLS */}
              {stage === 'start' && (
                 <button
                   onClick={() => {setStage('ready'); setTutorMessage("Tap SMASH to break it!");}}
                   className="btn-primary bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-xl active:scale-95 transition-transform w-full"
                 >
                   Start Level
                 </button>
              )}

              {stage === 'ready' && (
                <button
                  onClick={handleSmash}
                  className="btn-action bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-orange-200 shadow-xl flex justify-center gap-2 items-center active:scale-95 transition-transform w-full"
                >
                  <Hammer className="animate-pulse" /> SMASH IT!
                </button>
              )}

              {stage === 'input' && (
                <div className="animate-in slide-in-from-bottom-5">
                   <div className={`flex flex-col items-center gap-3 mb-5 sm:mb-6 ${shaking ? 'animate-shake' : ''}`}>
                      <input
                        ref={numInputRef}
                        type="number"
                        value={userNum}
                        onChange={e => setUserNum(e.target.value)}
                        placeholder="?"
                        className="w-24 sm:w-28 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-bold bg-slate-50 border-4 border-slate-200 focus:border-purple-500 rounded-2xl outline-none transition-colors"
                      />
                      <div className="w-16 sm:w-20 h-1.5 bg-slate-300 rounded-full"></div>
                      <input
                        type="number"
                        value={userDenom}
                        onChange={e => setUserDenom(e.target.value)}
                        placeholder="?"
                        className="w-24 sm:w-28 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-bold bg-slate-50 border-4 border-slate-200 focus:border-purple-500 rounded-2xl outline-none transition-colors"
                      />
                   </div>
                   <button
                     onClick={checkAnswer}
                     className="w-full bg-indigo-600 text-white py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform"
                   >
                     Check Answer
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. VICTORY SCREEN */}
      {view === 'win' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 animate-in zoom-in duration-300">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-green-100">
              <div className="inline-flex bg-green-100 p-3 sm:p-4 rounded-full mb-4 text-green-600">
                <Trophy size={40} sm={48} fill="currentColor" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">LEVEL CLEARED!</h2>
              <div className="flex justify-center gap-2 mb-6 sm:mb-8">
                 {[1, 2, 3].map(s => {
                    // Logic to determine stars based on mistakes
                    let earned = 3;
                    if(mistakes === 1) earned = 2;
                    if(mistakes > 1) earned = 1;
                    return (
                      <Star
                        key={s}
                        size={30}
                        className={s <= earned ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-200 fill-slate-200"}
                      />
                    );
                 })}
              </div>
              <button
                onClick={goNext}
                className="w-full bg-green-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-green-600 transition-colors flex justify-center gap-2 items-center"
              >
                 Next Level <ArrowRight />
              </button>
              <button
                onClick={() => setView('menu')}
                className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
              >
                Back to Map
              </button>
           </div>
           {/* Simple CSS Confetti (dots) */}
           <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random()}s`,
                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]
                  }}
                ></div>
              ))}
           </div>
        </div>
      )}

      {/* 4. GAME OVER SCREEN */}
      {view === 'gameover' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 animate-in zoom-in duration-300">
           <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-red-50">
              <div className="inline-flex bg-red-100 p-3 sm:p-4 rounded-full mb-4 text-red-500">
                <Heart size={40} sm={48} fill="currentColor" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">OUT OF HEARTS</h2>
              <p className="text-slate-500 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Don't give up! Learning takes practice.</p>
              
              <button
                onClick={resetLevel}
                className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg flex justify-center gap-2 items-center"
              >
                 <RotateCcw /> Try Again
              </button>
              <button
                onClick={() => setView('menu')}
                className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
              >
                Back to Map
              </button>
           </div>
        </div>
      )}

      {/* CSS Styles injection for specific animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default FractionSmashProduct;
