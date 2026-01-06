import React, { useState, useRef, useEffect } from 'react';
import { Hammer, VolumeX, RotateCcw, ArrowRight, Star, CheckCircle, Maximize2 } from 'lucide-react';

const FractionSmashWeb = () => {
  // --- Game State ---
  const [stage, setStage] = useState('start'); 
  const [levelIndex, setLevelIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [tutorMessage, setTutorMessage] = useState("Welcome to Fraction Smash! I'm your Tutor.");
  
  // Inputs
  const [userNum, setUserNum] = useState('');
  const [userDenom, setUserDenom] = useState('');
  const [inputError, setInputError] = useState(false);
  const numInputRef = useRef(null);

  // --- UPDATED LEVEL DATABASE (With Varied Numerators) ---
  const levels = [
    { 
      id: 1, 
      targetNum: 1, targetDenom: 2, 
      cols: 2, rows: 1, 
      color: 'bg-blue-500',
      intro: "Let's warm up. Smash this block!" 
    },
    { 
      id: 2, 
      targetNum: 3, targetDenom: 4, // Answer is 3/4
      cols: 2, rows: 2, 
      color: 'bg-indigo-500',
      intro: "Getting harder! We need more than one piece now." 
    },
    { 
      id: 3, 
      targetNum: 2, targetDenom: 3, // Answer is 2/3
      cols: 3, rows: 1, 
      color: 'bg-emerald-500',
      intro: "Look closely at the purple columns." 
    },
    { 
      id: 4, 
      targetNum: 3, targetDenom: 5, // Answer is 3/5
      cols: 5, rows: 1, 
      color: 'bg-purple-600',
      intro: "A long bar. Count the purple ones first!" 
    },
    { 
      id: 5, 
      targetNum: 5, targetDenom: 8, // Answer is 5/8
      cols: 4, rows: 2, 
      color: 'bg-amber-600', 
      intro: "Chocolate bar time! How much is purple?" 
    },
    { 
      id: 6, 
      targetNum: 4, targetDenom: 9, // Answer is 4/9
      cols: 3, rows: 3, 
      color: 'bg-rose-500',
      intro: "A perfect square box. Count carefully." 
    },
    { 
      id: 7, 
      targetNum: 7, targetDenom: 10, // Answer is 7/10
      cols: 5, rows: 2, 
      color: 'bg-cyan-600',
      intro: "Final Boss! Big numbers incoming." 
    },
  ];

  const currentLevel = levels[levelIndex];

  // --- Actions ---

  const handleStart = () => {
    setStage('ready');
    setTutorMessage(currentLevel.intro);
    setUserNum('');
    setUserDenom('');
  };

  const handleSmash = () => {
    setShaking(true);
    setTutorMessage("SMASHING! 💥");
    
    setTimeout(() => {
      setShaking(false);
      setStage('input');
      setTutorMessage(`You broke it! Enter the fraction for the PURPLE part.`);
      setTimeout(() => numInputRef.current?.focus(), 100);
    }, 600);
  };

  const checkAnswer = () => {
    const num = parseInt(userNum);
    const den = parseInt(userDenom);
    
    if (!userNum || !userDenom) {
      setTutorMessage("⚠️ Please fill in both boxes!");
      return;
    }

    if (num === currentLevel.targetNum && den === currentLevel.targetDenom) {
      // CORRECT
      setStage('feedback');
      setTutorMessage(`🎉 YES! It is ${num}/${den}. Great counting!`);
      setInputError(false);
    } else {
      // INCORRECT - Advanced Scaffolding
      setInputError(true);
      setTimeout(() => setInputError(false), 500); 

      if (den !== currentLevel.targetDenom) {
        // Wrong Bottom Number
        setTutorMessage(`💡 Hint: The bottom number is the TOTAL pieces (Blue + Purple). Count them all!`);
      } else if (num !== currentLevel.targetNum) {
        // Wrong Top Number (e.g., User put 1/4 instead of 3/4)
        setTutorMessage(`💡 Your bottom number is right! But look at the top. We have more than 1 purple piece now.`);
      } else {
        setTutorMessage("Not quite. Try counting the pieces one by one.");
      }
    }
  };

  const nextLevel = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex(prev => prev + 1);
      setStage('ready');
      setUserNum('');
      setUserDenom('');
      setTutorMessage(levels[levelIndex + 1].intro);
    } else {
      setTutorMessage("🏆 YOU WON! You are a Certified Fraction Master!");
      setStage('finished');
    }
  };

  // --- Render Helpers ---

  const renderShape = () => {
    const isWhole = stage === 'start' || stage === 'ready' || stage === 'smashing';
    const parts = [];

    if (isWhole) {
      return (
        <div className={`w-full max-w-md aspect-square ${currentLevel.color} rounded-2xl shadow-2xl border-4 border-white/20 transition-transform ${shaking ? 'animate-bounce' : ''} flex items-center justify-center`}>
          <span className="text-white font-bold text-4xl opacity-50 tracking-widest">WHOLE</span>
        </div>
      );
    }

    // Render Grid Parts
    for (let i = 0; i < currentLevel.targetDenom; i++) {
      // Logic: Turn the first X items purple based on targetNum
      const isTarget = i < currentLevel.targetNum;
      
      parts.push(
        <div 
          key={i}
          className={`
            rounded-xl border-2 border-white/40 shadow-sm flex items-center justify-center text-white font-bold text-2xl
            transition-all duration-700 ease-out transform
            ${stage === 'input' || stage === 'feedback' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
            ${isTarget ? 'bg-purple-600 z-10 ring-4 ring-purple-300 ring-opacity-50' : currentLevel.color}
          `}
        >
          {isTarget ? '?' : ''}
        </div>
      );
    }

    // Dynamic Grid Layout
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)`,
      gridTemplateRows: `repeat(${currentLevel.rows}, 1fr)`,
      gap: '12px',
      width: '100%',
      maxWidth: '450px', // Bigger shape for web
      aspectRatio: '1/1',
    };

    return <div style={gridStyle}>{parts}</div>;
  };

  return (
    // FULL SCREEN CONTAINER
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* --- WEB HEADER --- */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-lg shadow-sm">
            <Star size={24} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-slate-800">TUTOR</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Web Edition • Level {levelIndex + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-500 items-center gap-2">
             <VolumeX size={14} /> NO SOUND
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* --- LEFT: GAME STAGE (THE SHAPE) --- */}
        <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 relative">
          
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

          <div className="relative z-10 w-full flex justify-center">
             {renderShape()}
             
             {/* Giant Hammer for Web */}
             {stage === 'ready' && (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse drop-shadow-2xl">
                 <Hammer size={120} className="text-white opacity-90 filter drop-shadow-lg" />
               </div>
             )}
          </div>
        </div>

        {/* --- RIGHT: INTERACTION PANEL --- */}
        <div className="w-full md:w-[450px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-20">
          
          <div className="flex-1 p-8 flex flex-col justify-center">
            
            {/* Tutor Message Bubble */}
            <div className="flex gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0 border-4 border-white">
                S
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl rounded-tl-none text-slate-700 text-lg font-medium leading-relaxed shadow-sm w-full relative">
                {tutorMessage}
              </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="mt-4">
              
              {/* START BUTTON */}
              {stage === 'start' && (
                <button onClick={handleStart} className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                  Start Game
                </button>
              )}

              {/* SMASH BUTTON */}
              {stage === 'ready' && (
                <button onClick={handleSmash} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:to-red-600 text-white py-6 rounded-2xl font-bold text-xl shadow-orange-200 shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                  <Hammer size={24} className="animate-bounce" /> SMASH IT!
                </button>
              )}

              {/* INPUT FORM */}
              {(stage === 'input' || stage === 'feedback') && stage !== 'finished' && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <div className={`flex flex-col items-center justify-center gap-3 transition-transform ${inputError ? 'animate-shake' : ''}`}>
                    {/* Numerator */}
                    <input
                      ref={numInputRef}
                      type="number"
                      disabled={stage === 'feedback'}
                      value={userNum}
                      onChange={(e) => setUserNum(e.target.value)}
                      placeholder="?"
                      className={`w-32 h-24 text-center text-5xl font-bold rounded-2xl border-4 outline-none transition-colors 
                        ${stage === 'feedback' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 focus:border-purple-500 text-slate-800 bg-slate-50'}
                      `}
                    />
                    
                    {/* Divider Line */}
                    <div className="w-24 h-2 bg-slate-800 rounded-full opacity-20"></div>
                    
                    {/* Denominator */}
                    <input
                      type="number"
                      disabled={stage === 'feedback'}
                      value={userDenom}
                      onChange={(e) => setUserDenom(e.target.value)}
                      placeholder="?"
                      className={`w-32 h-24 text-center text-5xl font-bold rounded-2xl border-4 outline-none transition-colors
                        ${stage === 'feedback' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 focus:border-purple-500 text-slate-800 bg-slate-50'}
                      `}
                    />
                  </div>

                  {/* Actions */}
                  {stage === 'input' && (
                    <button onClick={checkAnswer} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-xl shadow-lg mt-4 transition-all active:scale-95">
                      Check Answer
                    </button>
                  )}

                  {stage === 'feedback' && (
                    <button onClick={nextLevel} className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse">
                      Next Level <ArrowRight size={24} />
                    </button>
                  )}
                </div>
              )}

              {/* RESTART */}
              {stage === 'finished' && (
                <button onClick={() => { setLevelIndex(0); setStage('start'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-bold text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                  <RotateCcw size={24} /> Play Again
                </button>
              )}

            </div>
          </div>

          {/* Footer Info */}
          <div className="p-6 text-center text-slate-400 text-sm font-medium border-t border-slate-100">
             Interactive Learning v2.0
          </div>
        </div>
      </main>

      {/* Shake Animation Style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FractionSmashWeb;