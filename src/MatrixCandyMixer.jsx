// ✅ Drop-in upgrade: adds a visual guided tour + plays the intro voice line on Start
// Put this whole file as src/MatrixCandyMixer.jsx (it includes everything)

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Grid3x3,
  Star,
  Home,
  Smile,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Volume2,
  X,
} from "lucide-react";

const STORAGE_KEY = "matrix_candy_mixer_progress_v1";

/**
 * AUDIO FILES in: public/audio/
 */
const VOICE_FILES = {
  intro: "/audio/matrix_intro.mp3",
  fillAll: "/audio/matrix_fill_all.mp3",
  wrong: "/audio/matrix_wrong.mp3",
  correct: "/audio/matrix_correct.mp3",
  hint: "/audio/matrix_hint.mp3",
  win: "/audio/matrix_win.mp3",
  tab_story: "/audio/matrix_tab_story.mp3",
  tab_how: "/audio/matrix_tab_how.mp3",
  tab_rule: "/audio/matrix_tab_rule.mp3",
};

/**
 * Safe audio: explicit unlock() must be called from user click.
 */
const useVoicePlayer = () => {
  const audioMapRef = useRef({});
  const unlockedRef = useRef(false);

  const getAudio = useCallback((key) => {
    const src = VOICE_FILES[key];
    if (!src) return null;

    if (!audioMapRef.current[key]) {
      const a = new Audio(src);
      a.preload = "auto";
      audioMapRef.current[key] = a;
    }
    return audioMapRef.current[key];
  }, []);

  const unlock = useCallback(async () => {
    if (unlockedRef.current) return true;
    const a = getAudio("intro");
    if (!a) return false;

    try {
      a.muted = true;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.muted = false;
      unlockedRef.current = true;
      return true;
    } catch (e) {
      console.warn("Audio unlock failed:", e);
      return false;
    }
  }, [getAudio]);

  const play = useCallback(
    async (key) => {
      if (!unlockedRef.current) return;
      const audio = getAudio(key);
      if (!audio) return;

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        await audio.play();
      } catch (e) {
        console.warn(`Play failed for "${key}":`, e);
      }
    },
    [getAudio]
  );

  return { play, unlock };
};

// ---------- Progress helpers ----------
const loadProgress = () => {
  if (typeof window === "undefined") return { level: 0, stars: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { level: 0, stars: {} };
  } catch {
    return { level: 0, stars: {} };
  }
};

const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

// ---------- Levels ----------
const LEVELS = [
  {
    id: 1,
    name: "Tiny Candy Sum",
    op: "add",
    intro:
      "Each number is candies in a box. Add the candies from tray A and tray B to fill the result grid.",
    A: [
      [1, 2],
      [0, 3],
    ],
    B: [
      [2, 1],
      [4, 0],
    ],
  },
  {
    id: 2,
    name: "Zero Boxes",
    op: "add",
    intro:
      "Zero means an empty box. Add box by box: result = A + B (top-left with top-left, and so on).",
    A: [
      [3, 0],
      [1, 2],
    ],
    B: [
      [1, 1],
      [0, 4],
    ],
  },
  {
    id: 3,
    name: "Take Some Away",
    op: "sub",
    intro:
      "Now we are TAKING candies away: result = A − B. Subtract the matching boxes.",
    A: [
      [5, 3],
      [4, 2],
    ],
    B: [
      [2, 1],
      [1, 0],
    ],
  },
  {
    id: 4,
    name: "Going Negative",
    op: "sub",
    intro:
      "Sometimes we owe candies! If A has less than B in a box, the result can be negative.",
    A: [
      [2, 0],
      [1, -1],
    ],
    B: [
      [3, 1],
      [0, 2],
    ],
  },
  {
    id: 5,
    name: "Wide Candy Trays",
    op: "add",
    intro:
      "Bigger trays! Add A and B cell by cell. Same position, same friends, then write the total.",
    A: [
      [1, 2, 0],
      [0, 1, 3],
    ],
    B: [
      [2, 0, 1],
      [1, 1, 0],
    ],
  },
  {
    id: 6,
    name: "Mixed Candy Change",
    op: "sub",
    intro:
      "Last challenge: subtract B from A in a 2×3 grid. Some boxes will give negative answers.",
    A: [
      [4, 1, 2],
      [0, 3, 1],
    ],
    B: [
      [1, 2, 0],
      [2, 1, 1],
    ],
  },
];

// ---------- Helpers ----------
const makeEmptyMatrix = (rows, cols) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

const computeAnswer = (level) => {
  const rows = level.A.length;
  const cols = level.A[0].length;
  const result = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const a = level.A[i][j];
      const b = level.B[i][j];
      row.push(level.op === "add" ? a + b : a - b);
    }
    result.push(row);
  }
  return result;
};

const MatrixCandyMixer = () => {
  // ✅ Start screen + audio unlock + guided intro
  const [hasStarted, setHasStarted] = useState(false);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);

  const [progress, setProgress] = useState(loadProgress);
  const [levelIndex, setLevelIndex] = useState(progress.level || 0);
  const [userMatrix, setUserMatrix] = useState(() => {
    const lvl = LEVELS[0];
    return makeEmptyMatrix(lvl.A.length, lvl.A[0].length);
  });
  const [feedback, setFeedback] = useState(() => {
    const lvl = LEVELS[0];
    return makeEmptyMatrix(lvl.A.length, lvl.A[0].length);
  });
  const [focusedCell, setFocusedCell] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [view, setView] = useState("game");
  const [message, setMessage] = useState(
    `Welcome to Matrix Candy Mixer! Every number you see is candies in a box. Matrix A is candy tray A, and Matrix B is candy tray B. Your job is to fill the result grid by combining the candies in the same position. Let’s see how many candies we get in each box!`
  );
  const [shake, setShake] = useState(false);
  const [infoTab, setInfoTab] = useState("story");
  const [guideStage, setGuideStage] = useState(0);

  const { play: playVoice, unlock } = useVoicePlayer();

  const currentLevel = LEVELS[levelIndex];
  const correctMatrix = useMemo(() => computeAnswer(currentLevel), [currentLevel]);

  const totalMaxStars = LEVELS.length * 3;
  const totalStars = Object.values(progress.stars || {}).reduce((a, b) => a + b, 0);

  const rows = currentLevel.A.length;
  const cols = currentLevel.A[0].length;
  const opSymbol = currentLevel.op === "add" ? "+" : "−";

  const starsThisLevel = useMemo(() => {
    if (view !== "win") return 0;
    if (attempts === 0) return 3;
    if (attempts === 1) return 2;
    return 1;
  }, [view, attempts]);

  const handleChangeTab = useCallback(
    (tab) => {
      setInfoTab(tab);
      playVoice(`tab_${tab}`);
    },
    [playVoice]
  );

  // Reset when level changes (only after start)
  useEffect(() => {
    if (!hasStarted) return;
    setGuideStage(0);
    setInfoTab("story");
    setMessage(currentLevel.intro);
    playVoice("intro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, hasStarted]);

  // Save progress when win
  useEffect(() => {
    if (view !== "win") return;
    setProgress((prev) => {
      const stars = { ...(prev.stars || {}) };
      const existing = stars[currentLevel.id] || 0;
      stars[currentLevel.id] = Math.max(existing, starsThisLevel);
      const next = {
        level: Math.max(prev.level || 0, levelIndex),
        stars,
      };
      saveProgress(next);
      return next;
    });
  }, [view, currentLevel.id, levelIndex, starsThisLevel]);

  const resetLevel = () => {
    const lvl = currentLevel;
    setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setAttempts(0);
    setFocusedCell(null);
    setView("game");
    setGuideStage(0);
    setInfoTab("story");
    setMessage(lvl.intro);
    playVoice("intro");
  };

  const goNextLevel = () => {
    playVoice("win");
    const nextIndex = levelIndex + 1;
    const idx = nextIndex < LEVELS.length ? nextIndex : 0;

    const lvl = LEVELS[idx];
    setLevelIndex(idx);
    setUserMatrix(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setFeedback(makeEmptyMatrix(lvl.A.length, lvl.A[0].length));
    setAttempts(0);
    setFocusedCell(null);
    setView("game");
    setGuideStage(0);
    setInfoTab("story");
    setMessage(lvl.intro);

    // show tour again only when returning to level 1 (optional)
    if (idx === 0) {
      setShowTour(true);
      setTourStep(0);
    }
  };

  const handleCellChange = (row, col, value) => {
    if (value === "" || value === "-" || /^-?\d+$/.test(value)) {
      setUserMatrix((prev) =>
        prev.map((r, i) => r.map((cell, j) => (i === row && j === col ? value : cell)))
      );
      setFocusedCell({ row, col });
    }
  };

  const nudgeCell = (row, col, delta) => {
    setUserMatrix((prev) =>
      prev.map((r, i) =>
        r.map((cell, j) => {
          if (i !== row || j !== col) return cell;
          const num = parseInt(cell || "0", 10);
          return String(num + delta);
        })
      )
    );
    setFocusedCell({ row, col });
  };

  const checkAnswer = () => {
    let allFilled = true;
    let allCorrect = true;
    const newFeedback = [];

    for (let i = 0; i < rows; i++) {
      const fbRow = [];
      for (let j = 0; j < cols; j++) {
        const valStr = userMatrix[i][j];
        if (valStr === "" || valStr === "-") {
          fbRow.push("empty");
          allFilled = false;
          allCorrect = false;
        } else {
          const userVal = parseInt(valStr, 10);
          const correctVal = correctMatrix[i][j];
          if (userVal === correctVal) fbRow.push("correct");
          else {
            fbRow.push("wrong");
            allCorrect = false;
          }
        }
      }
      newFeedback.push(fbRow);
    }

    setFeedback(newFeedback);

    if (!allFilled) {
      setMessage("Fill every candy box first. Empty boxes are marked with a light outline.");
      playVoice("fillAll");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (allCorrect) {
      setView("win");
      playVoice("correct");
    } else {
      setAttempts((a) => a + 1);
      setMessage(
        "Some boxes are wrong. Red boxes need fixing. Check A and B for those positions and try again!"
      );
      playVoice("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const giveHint = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const correctVal = correctMatrix[i][j];
        const userStr = userMatrix[i][j];
        const isEmpty = userStr === "" || userStr === "-";
        const isWrong = !isEmpty && parseInt(userStr, 10) !== correctVal;

        if (isEmpty || isWrong) {
          setUserMatrix((prev) =>
            prev.map((r, ri) => r.map((c, cj) => (ri === i && cj === j ? String(correctVal) : c)))
          );
          setFeedback((prev) =>
            prev.map((r, ri) => r.map((c, cj) => (ri === i && cj === j ? "correct" : c)))
          );
          setFocusedCell({ row: i, col: j });
          setMessage(
            `Hint: for this box we did ${currentLevel.A[i][j]} ${opSymbol} ${currentLevel.B[i][j]} = ${correctVal}. Use the same idea for the other boxes.`
          );
          playVoice("hint");
          return;
        }
      }
    }
    setMessage("All boxes are already correct. Great job!");
  };

  const focusedInfo = useMemo(() => {
    if (!focusedCell) return null;
    const { row, col } = focusedCell;
    const a = currentLevel.A[row][col];
    const b = currentLevel.B[row][col];
    const result = correctMatrix[row][col];
    return { row, col, a, b, result };
  }, [focusedCell, currentLevel, correctMatrix]);

  const handleNextGuide = () => {
    setGuideStage((prev) => {
      const next = prev + 1;

      if (next === 1) {
        handleChangeTab("story");
        setMessage(
          "Think of matrix A and B as two candy trays. Each position is a candy box in the same place on both trays."
        );
      } else if (next === 2) {
        handleChangeTab("how");
        setMessage(
          "Tap a result box, look at the same box in A and B, then do A box " +
            opSymbol +
            " B box. Type the answer or use the arrows."
        );
      } else if (next === 3) {
        handleChangeTab("rule");
        setMessage(
          "The math rule is: result[i][j] = A[i][j] " +
            opSymbol +
            " B[i][j]. Same row, same column, same friends."
        );
      } else if (next === 4) {
        setMessage("Now you try! Fill all the RESULT boxes and then press Check Candy Grid.");
      }

      return next > 4 ? 4 : next;
    });
  };

  // ✅ Guided Tour steps (visual overlay + highlight)
  const TOUR_STEPS = [
    {
      title: "Welcome!",
      text:
        "Welcome to Matrix Candy Mixer! Every number you see is candies in a box.",
      target: "header",
      bubblePos: "bottom",
    },
    {
      title: "Matrix A",
      text: "This is Matrix A (candy tray A). Each number is candies in that box.",
      target: "matrixA",
      bubblePos: "bottom",
    },
    {
      title: "Matrix B",
      text: "This is Matrix B (candy tray B). Same positions match with A.",
      target: "matrixB",
      bubblePos: "bottom",
    },
    {
      title: "Result Grid",
      text:
        "Fill the RESULT grid by combining candies in the SAME position: top-left with top-left, etc.",
      target: "result",
      bubblePos: "top",
    },
    {
      title: "Check Your Answer",
      text:
        "When you finish, press “Check Candy Grid”. If you need help, press Hint.",
      target: "actions",
      bubblePos: "top",
    },
  ];

  const currentTour = TOUR_STEPS[tourStep];

  // START SCREEN
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border-4 border-pink-100">
          <div className="inline-flex bg-pink-100 p-4 rounded-full mb-4 text-pink-500">
            <Grid3x3 size={44} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Matrix Candy Mixer
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Press Start to enable sound and begin the guided intro.
          </p>

          <button
            onClick={async () => {
              const ok = await unlock();
              setHasStarted(true);

              // Start the guided tour
              setShowTour(true);
              setTourStep(0);

              // Play intro voice after unlocking
              if (ok) playVoice("intro");

              // Put your text intro in the tutor bubble too
              setMessage(
                "Welcome to Matrix Candy Mixer! Every number you see is candies in a box. Matrix A is candy tray A, and Matrix B is candy tray B. Your job is to fill the result grid by combining the candies in the same position. Let’s see how many candies we get in each box!"
              );
            }}
            className="mt-6 w-full bg-pink-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 size={22} />
            Start
          </button>

          <p className="mt-3 text-[11px] text-slate-400">
            (Browsers require a tap/click before playing audio.)
          </p>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header
        data-tour="header"
        className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0"
      >
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Lab
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1">
              <Grid3x3 size={18} className="text-pink-500" />
              Matrix Candy Mixer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={16} className="text-pink-400" />
            <span className="font-semibold">
              Level {currentLevel.id} / {LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white flex items-center gap-1 text-[11px] sm:text-xs">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold">
              {totalStars} / {totalMaxStars} stars
            </span>
          </div>
        </div>
      </header>

      {/* GAME VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT */}
<div className="order-2 md:order-1 w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-r border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-pink-500 flex items-center justify-center text-pink-50 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    🍬
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                <InfoTabs
                  activeTab={infoTab}
                  onChangeTab={handleChangeTab}
                  opSymbol={opSymbol}
                  currentLevel={currentLevel}
                />

                {guideStage < 4 && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextGuide}
                      className="inline-flex items-center gap-1.5 bg-pink-500 text-white px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shadow-md active:scale-95"
                    >
                      Next tip
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {focusedInfo && (
                  <div className="bg-slate-900 text-slate-50 rounded-2xl p-3 text-xs sm:text-sm mt-4">
                    <p className="font-semibold mb-1">
                      You are editing box (row {focusedInfo.row + 1}, column{" "}
                      {focusedInfo.col + 1})
                    </p>
                    <p>
                      A box has <span className="font-mono">{focusedInfo.a}</span>{" "}
                      candies, B box has{" "}
                      <span className="font-mono">{focusedInfo.b}</span>.
                    </p>
                    <p className="mt-1">
                      So we do:{" "}
                      <span className="font-mono font-semibold">
                        {focusedInfo.a} {opSymbol} {focusedInfo.b} ={" "}
                        {focusedInfo.result}
                      </span>
                      .
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Use the arrows under the box to gently move the number up or down.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div data-tour="actions" className="mt-4 space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-pink-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Candy Grid
                  <ArrowRight size={20} />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={giveHint}
                    className="flex-1 bg-amber-50 text-amber-700 py-2.5 sm:py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-sm border border-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb size={16} />
                    Hint (fill one box)
                  </button>
                  <button
                    onClick={resetLevel}
                    className="flex-1 bg-slate-900 text-white py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Attempts this level: <span className="font-semibold">{attempts}</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
<div className="order-1 md:order-2 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-pink-200 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md mx-auto">
                Fill the{" "}
                <span className="font-semibold">
                  RESULT = A {opSymbol} B
                </span>{" "}
                grid so that each box matches A and B box by box.
              </p>
            </div>

            <div
              className={`bg-slate-900/70 rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-xl overflow-x-auto ${
                shake ? "animate-shake" : ""
              }`}
            >
              <div className="min-w-[260px] flex flex-col gap-3 sm:gap-4 items-center">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <div data-tour="matrixA">
                    <MatrixDisplay
                      label="A"
                      matrix={currentLevel.A}
                      color="from-sky-400 to-sky-500"
                    />
                  </div>

                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {opSymbol}
                  </span>

                  <div data-tour="matrixB">
                    <MatrixDisplay
                      label="B"
                      matrix={currentLevel.B}
                      color="from-emerald-400 to-emerald-500"
                    />
                  </div>

                  <span className="text-white font-bold text-xl sm:text-2xl">=</span>

                  <div data-tour="result">
                    <ResultMatrix
                      matrix={userMatrix}
                      feedback={feedback}
                      onCellChange={handleCellChange}
                      onNudge={nudgeCell}
                      onFocusCell={(r, c) => setFocusedCell({ row: r, col: c })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] sm:text-xs text-slate-300 text-center max-w-xs space-y-1">
              <p>
                Remember: <span className="font-semibold">same place, same friends</span>. Top-left with top-left,
                bottom-right with bottom-right.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-pink-100">
            <div className="inline-flex bg-pink-100 p-3 sm:p-4 rounded-full mb-4 text-pink-500">
              <Grid3x3 size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Candy Grid Complete!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              Every result box matches{" "}
              <span className="font-semibold">
                A {opSymbol} B
              </span>
              .
            </p>

            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={30}
                  className={
                    s <= starsThisLevel
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>

            <button
              onClick={goNextLevel}
              className="w-full bg-pink-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-pink-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Level
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ✅ TOUR OVERLAY */}
      {showTour && view === "game" && (
        <TourOverlay
          step={tourStep}
          total={TOUR_STEPS.length}
          title={currentTour.title}
          text={currentTour.text}
          targetSelector={`[data-tour="${currentTour.target}"]`}
          onClose={() => setShowTour(false)}
          onNext={() => {
            if (tourStep < TOUR_STEPS.length - 1) setTourStep((s) => s + 1);
            else setShowTour(false);
          }}
          onPrev={() => setTourStep((s) => Math.max(0, s - 1))}
        />
      )}

      {/* shake animation */}
      <style>{`
        @keyframes shake-candy {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake-candy 0.35s ease-in-out; }
      `}</style>
    </div>
  );
};

// ---------- TOUR OVERLAY COMPONENT ----------
const TourOverlay = ({
  step,
  total,
  title,
  text,
  targetSelector,
  onClose,
  onNext,
  onPrev,
}) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(targetSelector);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [targetSelector]);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* dark layer */}
      <div className="absolute inset-0 bg-black/60" />

      {/* spotlight */}
      {rect && (
        <div
          className="absolute rounded-2xl border-4 border-pink-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          style={{
            top: Math.max(8, rect.top - 8),
            left: Math.max(8, rect.left - 8),
            width: Math.min(window.innerWidth - 16, rect.width + 16),
            height: rect.height + 16,
          }}
        />
      )}

      {/* bubble */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[min(560px,calc(100%-24px))]">
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-pink-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                Guided Intro {step + 1} / {total}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-800">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-2 text-slate-700 text-sm sm:text-base">{text}</p>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={step === 0}
              className={`px-3 py-2 rounded-xl font-bold text-sm active:scale-95 ${
                step === 0
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-slate-900 text-white"
              }`}
              type="button"
            >
              Back
            </button>

            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl font-black text-sm bg-pink-500 text-white shadow-lg hover:bg-pink-600 active:scale-95 flex items-center gap-2"
              type="button"
            >
              {step === total - 1 ? "Start Playing" : "Next"}
              <ArrowRight size={18} />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Tip: You can close this anytime and keep playing.
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------- Presentational subcomponents ----------
const MatrixDisplay = ({ label, matrix, color }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">Matrix {label}</span>
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${color} px-1.5 py-1 shadow-lg`}>
        <div
          className="border-2 border-white/40 rounded-lg px-2 py-1 text-xs sm:text-sm text-white font-mono grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <span key={`${i}-${j}`} className="text-center">
                {val}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ResultMatrix = ({ matrix, feedback, onCellChange, onNudge, onFocusCell }) => {
  const cols = matrix[0].length;

  const cellClass = (fb) => {
    if (fb === "correct") return "border-emerald-400 bg-emerald-50 text-emerald-700";
    if (fb === "wrong") return "border-rose-400 bg-rose-50 text-rose-700";
    if (fb === "empty") return "border-slate-300 bg-slate-50 text-slate-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-300 mb-0.5">RESULT</span>
      <div className="inline-flex rounded-xl bg-slate-900 px-1.5 py-1 shadow-lg">
        <div
          className="border-2 border-slate-600 rounded-lg px-2 py-1 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className={`flex flex-col items-center justify-center rounded-lg border px-1.5 py-1 ${cellClass(
                  feedback[i][j]
                )}`}
              >
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onCellChange(i, j, e.target.value.trim())}
                  onFocus={() => onFocusCell(i, j)}
                  className="w-10 sm:w-12 bg-transparent text-center text-xs sm:text-sm font-mono outline-none"
                />
                <div className="flex gap-1 mt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onFocusCell(i, j);
                      onNudge(i, j, -1);
                    }}
                    className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-white flex items-center justify-center active:scale-95"
                  >
                    <ChevronLeft size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFocusCell(i, j);
                      onNudge(i, j, +1);
                    }}
                    className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-white flex items-center justify-center active:scale-95"
                  >
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const InfoTabs = ({ activeTab, onChangeTab, opSymbol, currentLevel }) => {
  const firstA = currentLevel.A[0][0];
  const firstB = currentLevel.B[0][0];
  const example = currentLevel.op === "add" ? firstA + firstB : firstA - firstB;

  const tabLabel = (tab) => {
    if (tab === "story") return "Story";
    if (tab === "how") return "How to Play";
    return "Matrix Rule";
  };

  return (
    <div className="bg-pink-50 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 text-xs sm:text-sm text-pink-900">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="inline-flex bg-white/70 rounded-full p-0.5">
          {["story", "how", "rule"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeTab(tab)}
              className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-colors ${
                activeTab === tab ? "bg-pink-500 text-white shadow-sm" : "text-pink-700 hover:bg-pink-100"
              }`}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "story" && (
        <div className="space-y-1.5">
          <p className="font-semibold">Imagine each matrix is a candy tray 🍬</p>
          <p>
            Matrix A shows how many candies are in each box of tray A. Matrix B shows candies in tray B. The result
            matrix tells us how many candies are in each box after we{" "}
            {opSymbol === "+" ? "put them together" : "take some away"}.
          </p>
          <p>
            We never move candies between boxes. We only mix candies that live in the{" "}
            <span className="font-semibold">same position</span>.
          </p>
        </div>
      )}

      {activeTab === "how" && (
        <div className="space-y-1.5">
          <p className="font-semibold">Step-by-step:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Tap a box in the RESULT grid.</li>
            <li>
              Look at the matching box in A and in B. Think:{" "}
              <span className="font-mono">
                A box {opSymbol} B box = ?
              </span>
            </li>
            <li>Type the answer or use the arrows to nudge the number.</li>
            <li>Fill all boxes, then press “Check Candy Grid”.</li>
          </ol>
          <p className="mt-1">
            If you are stuck, press <span className="font-semibold">Hint</span> to see one box solved.
          </p>
        </div>
      )}

      {activeTab === "rule" && (
        <div className="space-y-1.5">
          <p className="font-semibold">The matrix rule:</p>
          <p>For each position (i, j) we only look at the numbers that sit in that same position in A and B.</p>
          <p>
            We use the rule:{" "}
            <span className="font-mono font-semibold">
              result[i][j] = A[i][j] {opSymbol} B[i][j]
            </span>
            .
          </p>
          <p>
            This is called <span className="font-semibold">element-wise</span> addition or subtraction, because we work
            box by box.
          </p>
        </div>
      )}

      <div className="mt-2 border-t border-pink-100 pt-2 bg-pink-100/60 rounded-xl px-2 py-1 font-mono text-[11px] sm:text-xs">
        Example with the first box:{" "}
        <span className="font-semibold">
          {firstA} {opSymbol} {firstB} = {example}
        </span>{" "}
        👉 so result[1][1] = {example}
      </div>
    </div>
  );
};

export default MatrixCandyMixer;
