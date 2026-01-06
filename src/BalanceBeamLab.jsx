// BalanceBeamLab.jsx
import React, { useState, useMemo } from "react";
import { Scale, Circle, ArrowRight, RotateCcw, Star, Home } from "lucide-react";

const LEVELS = [
  {
    id: 1,
    name: "Perfect Balance",
    intro: "Place the blue weight so the beam is perfectly balanced.",
    goal: "balanced", // "balanced" | "tilt-left" | "tilt-right"
    positions: [-3, -2, -1, 0, 1, 2, 3],
    fixed: [
      // slotIndex in positions[], weight
      { slotIndex: 4, weight: 2 }, // +1
    ],
    movableWeight: 2,
  },
  {
    id: 2,
    name: "Heavy Side, Short Arm",
    intro: "A big weight close to the middle can balance a small one far away.",
    goal: "balanced",
    positions: [-3, -2, -1, 0, 1, 2, 3],
    fixed: [{ slotIndex: 6, weight: 1 }], // 1 kg at +3
    movableWeight: 3, // 3 kg needs to go at -1
  },

  // Level 3 – balanced puzzle with multiple fixed weights
  {
    id: 3,
    name: "Crowded Beam",
    intro:
      "Lots of weights at once! Find the one spot for the blue weight that balances everything.",
    goal: "balanced",
    positions: [-3, -2, -1, 0, 1, 2, 3],
    fixed: [
      { slotIndex: 0, weight: 1 }, // -3  → torque -3
      { slotIndex: 2, weight: 2 }, // -1  → torque -2
      { slotIndex: 5, weight: 1 }, // +2 → torque +2
    ],
    // total fixed torque = -3 -2 + 2 = -3
    // movableWeight = 1 → need position +3 (slotIndex 6) to make net 0
    movableWeight: 1,
  },

  // ✅ Level 4 – fixed so it is NOT already solved
  {
    id: 4,
    name: "Tip It Right",
    intro: "Make the right side sink down (right torque bigger).",
    goal: "tilt-right",
    positions: [-3, -2, -1, 0, 1, 2, 3],
    fixed: [
      // Left heavier at start:
      { slotIndex: 1, weight: 2 }, // -2 → torque -4
      { slotIndex: 4, weight: 1 }, // +1 → torque +1
      // Net fixed torque = -3 (beam starts tilted LEFT)
    ],
    movableWeight: 2,
    // kid must put the blue 2kg somewhere on the RIGHT (e.g. +2 or +3)
    // to make net torque > 0 and tip right
  },
];

const BalanceBeamLab = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null); // index in positions[]
  const [view, setView] = useState("game"); // "game" | "win"
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState(LEVELS[0].intro);

  const currentLevel = LEVELS[levelIndex];

  // --- Physics calculation: left torque, right torque, net torque ---
  const torqueInfo = useMemo(() => {
    const { positions, fixed, movableWeight } = currentLevel;
    let net = 0;
    let left = 0; // sum |w * x| for x < 0
    let right = 0; // sum |w * x| for x > 0

    const addWeight = (slotIndex, weight) => {
      const pos = positions[slotIndex];
      const moment = weight * pos;
      net += moment;
      if (pos < 0) left += Math.abs(moment);
      if (pos > 0) right += Math.abs(moment);
    };

    // fixed weights
    fixed.forEach((f) => addWeight(f.slotIndex, f.weight));

    // movable weight (if placed)
    if (selectedSlot != null) {
      addWeight(selectedSlot, movableWeight);
    }

    return { netTorque: net, leftTorque: left, rightTorque: right };
  }, [currentLevel, selectedSlot]);

  const { netTorque, leftTorque, rightTorque } = torqueInfo;

  const beamAngle = useMemo(() => {
    // small angle in degrees: positive = right side down
    const raw = netTorque * 4; // scale factor for visual
    if (raw > 15) return 15;
    if (raw < -15) return -15;
    return raw;
  }, [netTorque]);

  const resetLevel = () => {
    setSelectedSlot(null);
    setMistakes(0);
    setMessage(currentLevel.intro);
    setView("game");
  };

  const goNext = () => {
    if (levelIndex < LEVELS.length - 1) {
      const next = levelIndex + 1;
      setLevelIndex(next);
      setSelectedSlot(null);
      setMistakes(0);
      setMessage(LEVELS[next].intro);
      setView("game");
    } else {
      // finished all → loop back to level 1
      setLevelIndex(0);
      setSelectedSlot(null);
      setMistakes(0);
      setMessage(LEVELS[0].intro);
      setView("game");
    }
  };

  const checkAnswer = () => {
    if (selectedSlot == null) {
      setMessage("Tap a spot on the beam to place the blue weight.");
      return;
    }

    const goal = currentLevel.goal;
    let success = false;

    if (goal === "balanced") {
      success = netTorque === 0;
    } else if (goal === "tilt-right") {
      success = netTorque > 0; // right side down
    } else if (goal === "tilt-left") {
      success = netTorque < 0;
    }

    if (success) {
      setView("win");
      return;
    }

    // wrong answer
    setMistakes((m) => m + 1);

    if (goal === "balanced") {
      if (netTorque > 0) {
        setMessage(
          "Right side is stronger. Move the blue weight closer to the left or farther from the pivot."
        );
      } else if (netTorque < 0) {
        setMessage(
          "Left side is stronger. Move the blue weight closer to the right or nearer the pivot."
        );
      } else {
        setMessage("Almost there, try adjusting one more step.");
      }
    } else if (goal === "tilt-right") {
      if (netTorque < 0) {
        setMessage(
          "The left side is winning. Put the blue weight on the right or farther from the pivot."
        );
      } else {
        setMessage(
          "Not enough right-side strength yet. Try a position farther to the right."
        );
      }
    } else if (goal === "tilt-left") {
      if (netTorque > 0) {
        setMessage(
          "The right side is winning. Put the blue weight on the left or farther from the pivot."
        );
      } else {
        setMessage(
          "You need more power on the left. Try a position farther to the left."
        );
      }
    }
  };

  const starsEarned = useMemo(() => {
    if (mistakes === 0) return 3;
    if (mistakes === 1) return 2;
    return 1;
  }, [mistakes]);

  const totalStarsPossible = LEVELS.length * 3;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sparvi Physics Lab
            </p>
            <h1 className="font-black text-base sm:text-lg tracking-tight">
              Balance Beam Lab
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Scale size={18} className="text-indigo-500" />
          <span className="font-semibold">
            Level {currentLevel.id} / {LEVELS.length}
          </span>
        </div>
      </header>

      {/* MAIN VIEW */}
      {view === "game" && (
        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
          {/* LEFT: Beam visual */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Level {currentLevel.id} · {currentLevel.name}
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-100 font-medium max-w-md">
                Heavier weight or bigger distance makes a stronger turning
                force. That turning force is called{" "}
                <span className="font-semibold">torque</span>.
              </p>
            </div>

            {/* Pivot + Beam */}
            <div className="relative w-full max-w-xl flex flex-col items-center">
              {/* Pivot */}
              <div className="w-4 h-10 bg-slate-700 rounded-full mb-1" />
              {/* Beam */}
              <div
                className="w-full max-w-xl h-3 bg-amber-400 rounded-full shadow-lg relative"
                style={{
                  transform: `rotate(${beamAngle}deg)`,
                  transformOrigin: "50% 50%",
                  transition: "transform 0.3s ease-out",
                }}
              >
                {/* Weights on top of beam */}
                <div className="absolute inset-x-4 -top-10 flex justify-between pointer-events-none">
                  {currentLevel.positions.map((pos, index) => {
                    const isPivot = pos === 0;
                    const fixed = currentLevel.fixed.find(
                      (f) => f.slotIndex === index
                    );
                    const isSelected = selectedSlot === index;

                    if (isPivot) {
                      return (
                        <div
                          key={index}
                          className="w-10 flex flex-col items-center justify-center text-xs text-slate-300 font-bold"
                        >
                          <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                          <span className="mt-1 opacity-70">PIVOT</span>
                        </div>
                      );
                    }

                    if (fixed) {
                      return (
                        <div
                          key={index}
                          className="w-10 flex flex-col items-center justify-center gap-1"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-100 shadow-md">
                            {fixed.weight}kg
                          </div>
                        </div>
                      );
                    }

                    if (isSelected) {
                      return (
                        <div
                          key={index}
                          className="w-10 flex flex-col items-center justify-center gap-1"
                        >
                          <div className="w-8 h-8 rounded-full bg-sky-400 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-900 shadow-md">
                            {currentLevel.movableWeight}kg
                          </div>
                        </div>
                      );
                    }

                    // empty slot visual
                    return (
                      <div
                        key={index}
                        className="w-10 flex flex-col items-center justify-center gap-1"
                      >
                        <div className="w-7 h-7 rounded-full border-2 border-slate-600/60 bg-slate-900/40" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clickable slots row */}
              <div className="mt-6 w-full max-w-xl flex justify-between">
                {currentLevel.positions.map((pos, index) => {
                  const isPivot = pos === 0;
                  const fixed = currentLevel.fixed.find(
                    (f) => f.slotIndex === index
                  );
                  const isSelected = selectedSlot === index;

                  const disabled = isPivot || fixed;

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setSelectedSlot((prev) =>
                          prev === index ? null : index
                        )
                      }
                      className={`flex flex-col items-center text-xs font-semibold ${
                        disabled
                          ? "text-slate-500 cursor-default"
                          : "text-slate-100 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 transition-all ${
                          isPivot
                            ? "border-transparent"
                            : fixed
                            ? "border-transparent"
                            : isSelected
                            ? "border-sky-300 bg-sky-500/40"
                            : "border-slate-500 bg-slate-900/40 hover:border-sky-300"
                        }`}
                      >
                        {!isPivot && !fixed && isSelected && (
                          <Circle
                            size={14}
                            className="text-sky-100"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span className="text-[10px] opacity-80">
                        {pos < 0 ? `${pos}` : pos > 0 ? `+${pos}` : "0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Torque breakdown (advanced view) */}
            <p className="mt-4 text-[11px] sm:text-xs text-slate-300 text-center max-w-xs">
              Left torque:{" "}
              <span className="font-semibold text-rose-200">
                {leftTorque}
              </span>{" "}
              · Right torque:{" "}
              <span className="font-semibold text-sky-200">
                {rightTorque}
              </span>{" "}
              · Net:{" "}
              <span
                className={
                  netTorque === 0
                    ? "text-emerald-300 font-semibold"
                    : netTorque > 0
                    ? "text-sky-300 font-semibold"
                    : "text-rose-300 font-semibold"
                }
              >
                {netTorque}
              </span>
            </p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 text-center max-w-xs">
              To balance the beam, left torque and right torque must be equal.
            </p>
          </div>

          {/* RIGHT: Tutor + Controls */}
          <div className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none flex flex-col">
            <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
              <div>
                {/* Tutor bubble */}
                <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-600 flex items-center justify-center text-amber-200 font-bold text-xl border-4 border-white shadow-lg shrink-0">
                    ⚖️
                  </div>
                  <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm sm:text-base font-medium w-full">
                    {message}
                  </div>
                </div>

                {/* Concept card */}
                <div className="bg-indigo-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-indigo-900">
                  <p className="font-semibold mb-1">
                    Physics idea: Torque and balance
                  </p>
                  <p>
                    Each weight pushes the beam down. The farther it is from the
                    pivot, the stronger its{" "}
                    <span className="font-bold">turning force</span> (torque).
                    The beam is balanced when left and right torques are equal.
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={checkAnswer}
                  className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Check Beam
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={resetLevel}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset Level
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIN SCREEN */}
      {view === "win" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-indigo-100">
            <div className="inline-flex bg-indigo-100 p-3 sm:p-4 rounded-full mb-4 text-indigo-500">
              <Scale size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Beam Solved!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
              You used distance and weight to control the torque. That’s how
              real seesaws, wrenches, and many tools work.
            </p>

            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={30}
                  className={
                    s <= starsEarned
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-indigo-700 transition-colors flex justify-center gap-2 items-center"
            >
              Next Level
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => {
                setView("game");
                setSelectedSlot(null);
                setMistakes(0);
                setMessage(currentLevel.intro);
              }}
              className="mt-3 sm:mt-4 text-slate-400 font-bold text-xs sm:text-sm hover:text-slate-600"
            >
              Replay Level
            </button>

            <p className="mt-4 text-[11px] text-slate-400">
              Stars this level: {starsEarned} / 3 · Game total:{" "}
              {totalStarsPossible} stars.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceBeamLab;
