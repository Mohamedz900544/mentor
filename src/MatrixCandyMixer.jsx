// src/MatrixCandyMixer.jsx
// ✅ Same logic + guides + sounds
// ✅ UI simplified to kid-friendly like before (flat, bright, less panels)
// ✅ Kept: Start screen + Tour overlay + Guide stages + Audio unlock/intro once + Hint/Check/Reset + Focus highlight (Level 1)

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

  // remember if intro voice has played (localStorage)
  const [introPlayed, setIntroPlayed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("matrix_candy_intro_played") === "1";
    } catch {
      return false;
    }
  });

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

  // when level changes, reset guidance text but DON'T replay intro if it was already played
  useEffect(() => {
    if (!hasStarted) return;
    setGuideStage(0);
    setInfoTab("story");
    setMessage(currentLevel.intro);
    if (!introPlayed) {
      playVoice("intro");
    }
  }, [levelIndex, hasStarted, currentLevel.intro, introPlayed, playVoice]);

  // save stars when win screen appears
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

  // guide becomes more specific: it forces top-left cell and explains that operation concretely
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
        const a = currentLevel.A[0][0];
        const b = currentLevel.B[0][0];
        const res = correctMatrix[0][0];
        setFocusedCell({ row: 0, col: 0 });
        setMessage(
          `Start with the top-left box. In A it has ${a} candies, in B it has ${b}. So we do ${a} ${opSymbol} ${b} = ${res}, and we write ${res} in that RESULT box.`
        );
      } else if (next === 3) {
        handleChangeTab("rule");
        setMessage(
          "Now repeat this for every box: always match A and B in the same row and same column, then do A box " +
            opSymbol +
            " B box."
        );
      } else if (next === 4) {
        setMessage("Now you try! Fill all the RESULT boxes and then press Check Candy Grid.");
      }

      return next > 4 ? 4 : next;
    });
  };

  const TOUR_STEPS = [
    { title: "Welcome!", text: "Every number is candies in a box.", target: "header" },
    { title: "Matrix A", text: "This is tray A. Same positions matter.", target: "matrixA" },
    { title: "Matrix B", text: "This is tray B. Match with A cell by cell.", target: "matrixB" },
    { title: "Result Grid", text: "Fill RESULT using the same position.", target: "result" },
    { title: "Buttons", text: "Check your work or ask for a Hint.", target: "actions" },
  ];

  const currentTour = TOUR_STEPS[tourStep];

  // START SCREEN (simple)
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-pink-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center border-2 border-pink-100">
          <div className="inline-flex bg-pink-100 p-3 rounded-full mb-4 text-pink-600">
            <Grid3x3 size={36} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800">Matrix Candy Mixer</h1>
          <p className="mt-2 text-slate-600 text-sm">
            Press Start to enable sound and begin the guided intro.
          </p>

          <button
            onClick={async () => {
              const ok = await unlock();
              setHasStarted(true);
              setShowTour(true);
              setTourStep(0);

              // play intro ONLY once over the whole lifetime
              if (ok && !introPlayed) {
                playVoice("intro");
                setIntroPlayed(true);
                try {
                  localStorage.setItem("matrix_candy_intro_played", "1");
                } catch {}
              }

              setMessage(
                "Welcome to Matrix Candy Mixer! Every number you see is candies in a box. Matrix A is candy tray A, and Matrix B is candy tray B. Your job is to fill the result grid by combining the candies in the same position."
              );
            }}
            className="mt-6 w-full bg-pink-500 text-white py-3.5 rounded-xl font-bold text-lg shadow hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 size={20} />
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
    <div className="min-h-screen bg-blue-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER (simple) */}
      <header
        data-tour="header"
        className="bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-50 border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Math Lab
            </p>
            <h1 className="font-extrabold text-sm sm:text-base flex items-center gap-1">
              <Grid3x3 size={16} className="text-pink-500" />
              Matrix Candy Mixer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <Smile size={14} className="text-pink-400" />
            <span className="font-semibold">
              Level {currentLevel.id}/{LEVELS.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white flex items-center gap-1 text-[11px]">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold">
              {totalStars}/{totalMaxStars}
            </span>
          </div>
        </div>
      </header>

      {/* GAME VIEW */}
      {view === "game" && (
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
          {/* TOP: message bubble + actions (simple, not a big side panel) */}
          <div className="bg-white rounded-2xl shadow p-4 sm:p-5 border border-slate-100 mb-4">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center text-white font-black text-lg shrink-0">
                🍬
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm sm:text-base font-medium text-slate-700 w-full">
                {message}
              </div>
            </div>

            <div className="mt-3">
              <InfoTabs
                activeTab={infoTab}
                onChangeTab={handleChangeTab}
                opSymbol={opSymbol}
                currentLevel={currentLevel}
                focusedCell={focusedCell}
                correctMatrix={correctMatrix}
              />
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2" data-tour="actions">
                <button
                  onClick={checkAnswer}
                  className="bg-pink-500 text-white px-4 py-2.5 rounded-xl font-bold shadow hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  Check
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={giveHint}
                  className="bg-amber-100 text-amber-800 px-4 py-2.5 rounded-xl font-bold border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-2"
                >
                  <Lightbulb size={18} />
                  Hint
                </button>

                <button
                  onClick={resetLevel}
                  className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                <span className="font-semibold">
                  Attempts: <span className="text-slate-800">{attempts}</span>
                </span>
                {guideStage < 4 && (
                  <button
                    type="button"
                    onClick={handleNextGuide}
                    className="inline-flex items-center gap-1.5 bg-pink-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow active:scale-95"
                  >
                    Next tip
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {focusedInfo && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm">
                <span className="font-semibold">Focused box:</span>{" "}
                row {focusedInfo.row + 1}, col {focusedInfo.col + 1} ·{" "}
                <span className="font-mono font-semibold">
                  {focusedInfo.a} {opSymbol} {focusedInfo.b} = {focusedInfo.result}
                </span>
              </div>
            )}
          </div>

          {/* BOTTOM: matrices area (simple, bright) */}
          <div
            className={`bg-white rounded-2xl shadow p-4 sm:p-6 border border-slate-100 ${
              shake ? "animate-shake" : ""
            }`}
          >
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-500">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="text-sm sm:text-base font-semibold text-slate-800">
                RESULT = A {opSymbol} B (same position)
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[520px] flex items-center justify-center gap-4 sm:gap-6 py-2">
                <div data-tour="matrixA">
                  <MatrixDisplay
                    label="A"
                    matrix={currentLevel.A}
                    color="bg-sky-500"
                    highlightCell={currentLevel.id === 1 ? focusedCell : null}
                  />
                </div>

                <div className="text-2xl font-black text-slate-700">{opSymbol}</div>

                <div data-tour="matrixB">
                  <MatrixDisplay
                    label="B"
                    matrix={currentLevel.B}
                    color="bg-emerald-500"
                    highlightCell={currentLevel.id === 1 ? focusedCell : null}
                  />
                </div>

                <div className="text-2xl font-black text-slate-700">=</div>

                <div data-tour="result">
                  <ResultMatrix
                    matrix={userMatrix}
                    feedback={feedback}
                    onCellChange={handleCellChange}
                    onNudge={nudgeCell}
                    onFocusCell={(r, c) => setFocusedCell({ row: r, col: c })}
                    focusedCell={currentLevel.id === 1 ? focusedCell : null}
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Same place, same friends. Top-left with top-left, bottom-right with bottom-right.
            </p>
          </div>
        </div>
      )}

      {/* WIN SCREEN (simple) */}
      {view === "win" && (
        <div className="flex-1 flex items-center justify-center p-6 bg-blue-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm w-full border-2 border-pink-100">
            <div className="inline-flex bg-pink-100 p-3 rounded-full mb-4 text-pink-600">
              <Grid3x3 size={34} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Candy Grid Complete!</h2>
            <p className="text-sm text-slate-600 mb-5">
              Every result box matches{" "}
              <span className="font-semibold">
                A {opSymbol} B
              </span>
              .
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={28}
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
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold text-lg shadow hover:bg-pink-600 transition-colors flex justify-center gap-2 items-center"
            >
              Next Level
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* TOUR OVERLAY (unchanged) */}
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
const TourOverlay = ({ step, total, title, text, targetSelector, onClose, onNext, onPrev }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(targetSelector);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
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
      <div className="absolute inset-0 bg-black/60" />

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

      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[min(560px,calc(100%-24px))]">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-pink-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                Guided Intro {step + 1} / {total}
              </p>
              <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
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

          <p className="mt-2 text-slate-700 text-sm">{text}</p>

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
              className="px-4 py-2 rounded-xl font-extrabold text-sm bg-pink-500 text-white shadow hover:bg-pink-600 active:scale-95 flex items-center gap-2"
              type="button"
            >
              {step === total - 1 ? "Start Playing" : "Next"}
              <ArrowRight size={18} />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">Tip: You can close this anytime.</p>
        </div>
      </div>
    </div>
  );
};

// ---------- Presentational subcomponents (simplified look) ----------
const MatrixDisplay = ({ label, matrix, color, highlightCell }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-500 font-bold">Matrix {label}</span>
      <div className={`${color} rounded-xl p-3 shadow`}>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${matrix[0].length}, 44px)` }}
        >
          {matrix.map((row, i) =>
            row.map((val, j) => {
              const isHighlight =
                highlightCell && highlightCell.row === i && highlightCell.col === j;
              return (
                <div
                  key={`${i}-${j}`}
                  className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono text-lg
                    ${isHighlight ? "bg-white text-slate-900 ring-2 ring-yellow-300" : "bg-white/20 text-white"}
                  `}
                >
                  {val}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ResultMatrix = ({ matrix, feedback, onCellChange, onNudge, onFocusCell, focusedCell }) => {
  const cols = matrix[0].length;

  const cellClass = (fb) => {
    if (fb === "correct") return "border-emerald-400 bg-emerald-50";
    if (fb === "wrong") return "border-rose-400 bg-rose-50";
    if (fb === "empty") return "border-slate-300 bg-slate-50";
    return "border-slate-200 bg-white";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-slate-500 font-bold">RESULT</span>
      <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 64px)` }}>
          {matrix.map((row, i) =>
            row.map((val, j) => {
              const isFocused = focusedCell && focusedCell.row === i && focusedCell.col === j;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`rounded-xl border p-2 ${cellClass(feedback[i][j])} ${
                    isFocused ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onCellChange(i, j, e.target.value.trim())}
                    onFocus={() => onFocusCell(i, j)}
                    className="w-full bg-transparent text-center text-lg font-mono outline-none text-slate-800"
                  />
                  <div className="mt-1 flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onFocusCell(i, j);
                        onNudge(i, j, -1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onFocusCell(i, j);
                        onNudge(i, j, +1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const InfoTabs = ({ activeTab, onChangeTab, opSymbol, currentLevel, focusedCell, correctMatrix }) => {
  const row = focusedCell ? focusedCell.row : 0;
  const col = focusedCell ? focusedCell.col : 0;

  const aVal = currentLevel.A[row][col];
  const bVal = currentLevel.B[row][col];
  const example =
    correctMatrix && correctMatrix[row]
      ? correctMatrix[row][col]
      : currentLevel.op === "add"
      ? aVal + bVal
      : aVal - bVal;

  const tabLabel = (tab) => {
    if (tab === "story") return "Story";
    if (tab === "how") return "How";
    return "Rule";
  };

  return (
    <div className="bg-pink-50 rounded-xl p-3 text-xs sm:text-sm text-pink-900 border border-pink-100">
      <div className="flex gap-2 mb-2">
        {["story", "how", "rule"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChangeTab(tab)}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              activeTab === tab ? "bg-pink-500 text-white" : "bg-white text-pink-700 border border-pink-100"
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {activeTab === "story" && (
        <p>
          Two candy trays: A and B. We only mix candies that are in the{" "}
          <span className="font-bold">same position</span>.
        </p>
      )}

      {activeTab === "how" && (
        <ol className="list-decimal list-inside space-y-1">
          <li>Tap a RESULT box.</li>
          <li>
            Look at A and B in the same spot, then do{" "}
            <span className="font-mono font-bold">
              A {opSymbol} B
            </span>
            .
          </li>
          <li>Type the answer (or use arrows).</li>
          <li>Press Check.</li>
        </ol>
      )}

      {activeTab === "rule" && (
        <p>
          Rule:{" "}
          <span className="font-mono font-bold">
            result[i][j] = A[i][j] {opSymbol} B[i][j]
          </span>
        </p>
      )}

      <div className="mt-2 bg-white rounded-lg p-2 border border-pink-100 font-mono text-[11px]">
        Example (row {row + 1}, col {col + 1}):{" "}
        <span className="font-bold">
          {aVal} {opSymbol} {bVal} = {example}
        </span>
      </div>
    </div>
  );
};

export default MatrixCandyMixer;
