// MoreFractionColoringLesson.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HelpCircle,
  RotateCcw,
  Check,
  Trophy,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// --------------------------------------------------
// Sounds
// --------------------------------------------------
const SOUNDS = {
  pop: "/audio/pop.mp3",
  win: "/audio/win.mp3",
  error: "/audio/matrix_intro.mp3",
  snap: "/audio/matrix_intro.mp3",
};

const playSound = (key) => {
  try {
    const audio = new Audio(SOUNDS[key]);
    if (key === "win") audio.volume = 0.6;
    else if (key === "snap") audio.volume = 0.2;
    else audio.volume = 0.4;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
};

// --------------------------------------------------
// Confetti
// --------------------------------------------------
const ConfettiBurst = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 1) * 300 - 50,
    color: ["#f97316", "#facc15", "#fb7185", "#a855f7", "#22c55e"][
      Math.floor(Math.random() * 5)
    ],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.1,
  }));

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none z-40">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-burst shadow-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
            "--rot": `${p.rotation}deg`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// --------------------------------------------------
// Shape meta: units per piece for each shape
// --------------------------------------------------
const HEXAGON_PIECES_META = Array.from({ length: 6 }, (_, i) => ({
  id: `hex_${i}`,
  units: 1,
}));

const CIRCLE_PIECES_META = Array.from({ length: 8 }, (_, i) => ({
  id: `circle_${i}`,
  units: 1,
}));

const TRIANGLE12_PIECES_META = Array.from({ length: 12 }, (_, i) => ({
  id: `tri12_${i}`,
  units: 1,
}));

// square with diagonals – 8 units total
const SQUARE_DIAG_PIECES_META = [
  { id: "sq_tl", units: 2 },
  { id: "tri_tr_top", units: 1 },
  { id: "tri_tr_bottom", units: 1 },
  { id: "tri_bl_left", units: 1 },
  { id: "tri_bl_right", units: 1 },
  { id: "tri_br_top", units: 1 },
  { id: "tri_br_bottom", units: 1 },
];

// square for 7/8 – 8 units total
const SQUARE7_PIECES_META = [
  { id: "sq7_left", units: 4 },
  { id: "sq7_top", units: 1 },
  { id: "sq7_mid1", units: 1 },
  { id: "sq7_mid2", units: 1 },
  { id: "sq7_bottom", units: 1 },
];

const SHAPE_META = {
  hexagon: { pieces: HEXAGON_PIECES_META },
  circle: { pieces: CIRCLE_PIECES_META },
  squareDiag: { pieces: SQUARE_DIAG_PIECES_META },
  triangle12: { pieces: TRIANGLE12_PIECES_META },
  square7_8: { pieces: SQUARE7_PIECES_META },
};

const SHAPE_TOTAL_UNITS = Object.fromEntries(
  Object.entries(SHAPE_META).map(([key, value]) => [
    key,
    value.pieces.reduce((sum, p) => sum + p.units, 0),
  ])
);

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const scalePoint = ([x, y], size) => [x * size, y * size];
const isSelectedId = (selectedIds, id) => selectedIds.includes(id);

// --------------------------------------------------
// Hexagon shape (6 equal triangles)
// --------------------------------------------------
const HexagonShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;

  const vertices = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI / 2 + i * (Math.PI / 3); // start at top
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    });
  }, [cx, cy, r]);

  const pieces = useMemo(() => {
    return HEXAGON_PIECES_META.map((meta, index) => {
      const a = vertices[index];
      const b = vertices[(index + 1) % vertices.length];
      return {
        id: meta.id,
        points: [
          [cx, cy],
          a,
          b,
        ],
      };
    });
  }, [vertices, cx, cy]);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {pieces.map((p) => {
        const pointsStr = p.points.map(([x, y]) => `${x},${y}`).join(" ");
        const selected = isSelectedId(selectedIds, p.id);
        return (
          <polygon
            key={p.id}
            points={pointsStr}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline */}
      <polygon
        points={vertices.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />
      {/* radial lines */}
      {vertices.map(([x, y], idx) => (
        <line
          key={idx}
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="#111827"
          strokeWidth={2}
          pointerEvents="none"
        />
      ))}
    </svg>
  );
};

// --------------------------------------------------
// Circle shape (8 slices)
// --------------------------------------------------
const CircleShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;
  const segments = 8;

  const pieces = useMemo(() => {
    const arr = [];
    for (let i = 0; i < segments; i++) {
      const start = (i / segments) * Math.PI * 2;
      const end = ((i + 1) / segments) * Math.PI * 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArcFlag = 0;
      const sweepFlag = 1;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2} Z`;
      arr.push({ id: `circle_${i}`, d });
    }
    return arr;
  }, [cx, cy, r]);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {pieces.map((p) => {
        const selected = isSelectedId(selectedIds, p.id);
        return (
          <path
            key={p.id}
            d={p.d}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />
      {/* radial lines */}
      {Array.from({ length: segments }, (_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#111827"
            strokeWidth={2}
            pointerEvents="none"
          />
        );
      })}
    </svg>
  );
};

// --------------------------------------------------
// Square with diagonals (for 1/4, 2/4, 3/4)
// --------------------------------------------------
const buildSquareDiagPieces = (size) => {
  const pts = {
    tl: [0, 0],
    tm: [0.5, 0],
    tr: [1, 0],
    ml: [0, 0.5],
    mm: [0.5, 0.5],
    mr: [1, 0.5],
    bl: [0, 1],
    bm: [0.5, 1],
    br: [1, 1],
  };

  const s = (p) => scalePoint(p, size);

  return [
    {
      id: "sq_tl",
      points: [pts.tl, pts.tm, pts.mm, pts.ml].map(s),
    },
    {
      id: "tri_tr_top",
      points: [pts.tm, pts.tr, pts.mm].map(s),
    },
    {
      id: "tri_tr_bottom",
      points: [pts.mm, pts.tr, pts.mr].map(s),
    },
    {
      id: "tri_bl_left",
      points: [pts.ml, pts.mm, pts.bl].map(s),
    },
    {
      id: "tri_bl_right",
      points: [pts.mm, pts.bm, pts.bl].map(s),
    },
    {
      id: "tri_br_top",
      points: [pts.mm, pts.mr, pts.bm].map(s),
    },
    {
      id: "tri_br_bottom",
      points: [pts.bm, pts.mr, pts.br].map(s),
    },
  ];
};

const SquareDiagShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const pieces = useMemo(() => buildSquareDiagPieces(size), [size]);
  const mid = size * 0.5;

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {pieces.map((p) => {
        const pointsStr = p.points.map(([x, y]) => `${x},${y}`).join(" ");
        const selected = isSelectedId(selectedIds, p.id);
        return (
          <polygon
            key={p.id}
            points={pointsStr}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline + grid lines */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={12}
        ry={12}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />
      <line
        x1={mid}
        y1={0}
        x2={mid}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={mid}
        x2={size}
        y2={mid}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      {/* diagonals */}
      <line
        x1={mid}
        y1={mid}
        x2={size}
        y2={0}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={0}
        y1={size}
        x2={mid}
        y2={mid}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      <line
        x1={mid}
        y1={size}
        x2={size}
        y2={mid}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
    </svg>
  );
};

// --------------------------------------------------
// Triangle with 12 skinny slices
// --------------------------------------------------
const TriangleSlicesShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const apex = [0.5, 0];
  const baseY = 1;

  const pieces = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const b1 = [i / 12, baseY];
      const b2 = [(i + 1) / 12, baseY];
      arr.push({
        id: `tri12_${i}`,
        points: [apex, b1, b2].map((p) => scalePoint(p, size)),
      });
    }
    return arr;
  }, [size]);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  const apexScaled = scalePoint(apex, size);
  const leftBase = scalePoint([0, baseY], size);
  const rightBase = scalePoint([1, baseY], size);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {pieces.map((p) => {
        const selected = isSelectedId(selectedIds, p.id);
        const pointsStr = p.points.map(([x, y]) => `${x},${y}`).join(" ");
        return (
          <polygon
            key={p.id}
            points={pointsStr}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline */}
      <polygon
        points={[
          apexScaled,
          leftBase,
          rightBase,
        ]
          .map(([x, y]) => `${x},${y}`)
          .join(" ")}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />

      {/* slice lines */}
      {Array.from({ length: 11 }, (_, i) => {
        const pt = scalePoint([(i + 1) / 12, baseY], size);
        return (
          <line
            key={i}
            x1={apexScaled[0]}
            y1={apexScaled[1]}
            x2={pt[0]}
            y2={pt[1]}
            stroke="#111827"
            strokeWidth={2}
            pointerEvents="none"
          />
        );
      })}
    </svg>
  );
};

// --------------------------------------------------
// Square for 7/8
// --------------------------------------------------
const buildSquareSevenPieces = (size) => {
  const s = (p) => scalePoint(p, size);
  return [
    {
      id: "sq7_left",
      points: [
        [0, 0],
        [0.5, 0],
        [0.5, 1],
        [0, 1],
      ].map(s),
    },
    {
      id: "sq7_top",
      points: [
        [0.5, 0],
        [1, 0],
        [1, 0.25],
        [0.5, 0.25],
      ].map(s),
    },
    {
      id: "sq7_mid1",
      points: [
        [0.5, 0.25],
        [1, 0.25],
        [1, 0.5],
        [0.5, 0.5],
      ].map(s),
    },
    {
      id: "sq7_mid2",
      points: [
        [0.5, 0.5],
        [1, 0.5],
        [1, 0.75],
        [0.5, 0.75],
      ].map(s),
    },
    {
      id: "sq7_bottom",
      points: [
        [0.5, 0.75],
        [1, 0.75],
        [1, 1],
        [0.5, 1],
      ].map(s),
    },
  ];
};

const SquareSevenShape = ({
  selectedIds,
  onToggle,
  readOnly = false,
  size = 320,
  highlightColor = "#60a5fa",
}) => {
  const pieces = useMemo(() => buildSquareSevenPieces(size), [size]);

  const handleClick = (id) => {
    if (readOnly || !onToggle) return;
    onToggle(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible touch-none select-none"
    >
      {pieces.map((p) => {
        const selected = isSelectedId(selectedIds, p.id);
        const pointsStr = p.points.map(([x, y]) => `${x},${y}`).join(" ");
        return (
          <polygon
            key={p.id}
            points={pointsStr}
            fill={selected ? highlightColor : "#ffffff"}
            stroke="transparent"
            onClick={() => handleClick(p.id)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              transition: "fill 150ms ease-out",
            }}
          />
        );
      })}

      {/* outline + split lines */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={12}
        ry={12}
        fill="none"
        stroke="#111827"
        strokeWidth={3}
        pointerEvents="none"
      />
      {/* vertical split */}
      <line
        x1={size * 0.5}
        y1={0}
        x2={size * 0.5}
        y2={size}
        stroke="#111827"
        strokeWidth={2}
        pointerEvents="none"
      />
      {/* horizontal splits */}
      {[0.25, 0.5, 0.75].map((t, idx) => (
        <line
          key={idx}
          x1={size * 0.5}
          y1={size * t}
          x2={size}
          y2={size * t}
          stroke="#111827"
          strokeWidth={2}
          pointerEvents="none"
        />
      ))}
    </svg>
  );
};

// --------------------------------------------------
// Generic shape router
// --------------------------------------------------
const FractionShape = (props) => {
  const { shapeId, ...rest } = props;
  if (shapeId === "hexagon") return <HexagonShape {...rest} />;
  if (shapeId === "circle") return <CircleShape {...rest} />;
  if (shapeId === "squareDiag") return <SquareDiagShape {...rest} />;
  if (shapeId === "triangle12") return <TriangleSlicesShape {...rest} />;
  if (shapeId === "square7_8") return <SquareSevenShape {...rest} />;
  return null;
};

// --------------------------------------------------
// Fraction tracker card
// --------------------------------------------------
const FractionTrackerCard = ({ selectedUnits, totalUnits }) => {
  return (
    <div className="mt-4 max-w-xs w-full">
      <div className="bg-pink-50 border border-pink-200 rounded-3xl px-6 py-4 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center leading-tight text-pink-700">
          <span className="text-2xl font-black">{selectedUnits}</span>
          <span className="border-t-2 border-pink-400 px-6 mt-1 text-lg font-bold">
            {totalUnits}
          </span>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Steps + answers
// --------------------------------------------------
const STEPS = [
  {
    id: "hex_half",
    kind: "color",
    label: "Step 1",
    title: "Color half of the hexagon",
    prompt: "Color 1/2 of the hexagon.",
    target: { num: 1, den: 2 },
    shape: "hexagon",
    helper:
      "The hexagon is split into 6 equal triangular pieces. 1/2 of 6 is 3, so you need to color 3 of the pieces.",
  },
  {
    id: "circle_half",
    kind: "color",
    label: "Step 2",
    title: "Color half of the circle",
    prompt: "Color 1/2 of the circle.",
    target: { num: 1, den: 2 },
    shape: "circle",
    helper:
      "The circle is split into 8 equal slices. 1/2 of 8 is 4, so color 4 slices.",
  },
  {
    id: "square_quarter",
    kind: "color",
    label: "Step 3",
    title: "Color a quarter of the square",
    prompt: "Color 1/4 of the square.",
    target: { num: 1, den: 4 },
    shape: "squareDiag",
    helper:
      "The square is made of 8 equal-sized pieces. 1/4 of the whole is the same as 2/8, so color 2 units worth of area.",
  },
  {
    id: "square_two_quarters",
    kind: "color",
    label: "Step 4",
    title: "Color 2/4 of the square",
    prompt: "Color 2/4 of the square.",
    target: { num: 2, den: 4 },
    shape: "squareDiag",
    helper:
      "2/4 is the same as 1/2. That means you need to color half of the square.",
  },
  {
    id: "square_three_quarters",
    kind: "color",
    label: "Step 5",
    title: "Color 3/4 of the square",
    prompt: "Color 3/4 of the square.",
    target: { num: 3, den: 4 },
    shape: "squareDiag",
    helper:
      "3/4 of the square means leaving only 1/4 uncolored. Think about which part you want to leave white.",
  },
  {
    id: "triangle_two_twelve",
    kind: "color",
    label: "Step 6",
    title: "Tiny slices of a triangle",
    prompt: "Color 2/12 of the triangle.",
    target: { num: 2, den: 12 },
    shape: "triangle12",
    helper:
      "The triangle is sliced into 12 equal skinny pieces. To show 2/12, color exactly two of them.",
  },
  {
    id: "triangle_seven_twelve",
    kind: "color",
    label: "Step 7",
    title: "More triangle slices",
    prompt: "Color 7/12 of the triangle.",
    target: { num: 7, den: 12 },
    shape: "triangle12",
    helper:
      "To make 7/12, color 7 of the 12 equal slices. You can choose any 7 pieces.",
  },
  {
    id: "square_seven_eighths",
    kind: "color",
    label: "Step 8",
    title: "Almost the whole square",
    prompt: "Color 7/8 of the square.",
    target: { num: 7, den: 8 },
    shape: "square7_8",
    helper:
      "The big square is broken into 8 equal units of area. To make 7/8, color everything except 1/8.",
  },
  // --- New challenge: which shape does NOT have 1/2 colored? ---
  {
    id: "hex_not_half",
    kind: "whichNot",
    label: "Challenge 1",
    title: "Which hexagon is not half colored?",
    prompt: "Which shape does not have 1/2 of it colored?",
    fraction: { num: 1, den: 2 },
    shape: "hexagon",
    // each option is a list of colored slice ids
    options: [
      ["hex_0", "hex_1", "hex_2"], // 3/6 = 1/2
      ["hex_0", "hex_1"], // 2/6 = 1/3  (this is NOT 1/2)
      ["hex_2", "hex_3", "hex_4"], // 3/6 = 1/2
      ["hex_0", "hex_2", "hex_4"], // 3/6 = 1/2
    ],
    correctIndex: 1,
    helper:
      "Each hexagon is built from 6 equal triangles. A shape has 1/2 colored if 3 out of 6 triangles are shaded.",
  },
  // --- New challenge: which shape does NOT have 1/3 colored? ---
  {
    id: "tri_not_third",
    kind: "whichNot",
    label: "Challenge 2",
    title: "Which triangle is not one third colored?",
    prompt: "Which shape does not have 1/3 of it colored?",
    fraction: { num: 1, den: 3 },
    shape: "triangle12",
    options: [
      ["tri12_0", "tri12_1", "tri12_2", "tri12_3"], // 4/12 = 1/3
      ["tri12_4", "tri12_5", "tri12_6", "tri12_7"], // 4/12 = 1/3
      ["tri12_0", "tri12_1", "tri12_2", "tri12_3", "tri12_4"], // 5/12  (NOT 1/3)
      ["tri12_0", "tri12_3", "tri12_6", "tri12_9"], // 4/12 = 1/3
    ],
    correctIndex: 2,
    helper:
      "The triangle is cut into 12 equal slices. 1/3 of the triangle means 4 out of 12 slices are shaded.",
  },
];

// ready-made answers for the coloring steps (not for the MCQ)
const STEP_ANSWERS = {
  hex_half: ["hex_0", "hex_1", "hex_2"],
  circle_half: ["circle_0", "circle_1", "circle_2", "circle_3"],
  square_quarter: ["tri_tr_top", "tri_tr_bottom"],
  square_two_quarters: [
    "tri_tr_top",
    "tri_tr_bottom",
    "tri_br_top",
    "tri_br_bottom",
  ],
  square_three_quarters: [
    "tri_tr_top",
    "tri_tr_bottom",
    "tri_bl_left",
    "tri_bl_right",
    "tri_br_top",
    "tri_br_bottom",
  ],
  triangle_two_twelve: ["tri12_0", "tri12_1"],
  triangle_seven_twelve: [
    "tri12_2",
    "tri12_3",
    "tri12_4",
    "tri12_5",
    "tri12_6",
    "tri12_7",
    "tri12_8",
  ],
  square_seven_eighths: ["sq7_left", "sq7_top", "sq7_mid1", "sq7_mid2"],
};

// --------------------------------------------------
// Single coloring step
// --------------------------------------------------
const FractionShapeStep = ({ step, isCompleted, onComplete }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const basePieces = SHAPE_META[step.shape].pieces;
  const totalUnits = SHAPE_TOTAL_UNITS[step.shape];

  const unitsMap = useMemo(() => {
    const m = new Map();
    basePieces.forEach((p) => m.set(p.id, p.units));
    return m;
  }, [basePieces]);

  const selectedUnits = useMemo(
    () => selectedIds.reduce((sum, id) => sum + (unitsMap.get(id) || 0), 0),
    [selectedIds, unitsMap]
  );

  const targetFraction = step.target.num / step.target.den;
  const currentFraction = totalUnits ? selectedUnits / totalUnits : 0;

  const handleTogglePiece = (id) => {
    if (isCompleted) return;
    playSound("pop");
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setFeedback("idle");
    setShowConfetti(false);
  };

  const handleReset = () => {
    if (isCompleted) return;
    setSelectedIds([]);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (Math.abs(currentFraction - targetFraction) < 1e-6) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else if (currentFraction < targetFraction) {
      setFeedback("low");
      setShowConfetti(false);
      playSound("error");
    } else {
      setFeedback("high");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const handleShowAnswer = () => {
    const answerIds = STEP_ANSWERS[step.id];
    if (!answerIds) return;
    setSelectedIds(answerIds);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-green-100">
          <Check size={18} className="shrink-0" />
          Nice! You colored exactly {step.target.num}/{step.target.den} of the
          shape.
        </div>
      );
    }
    if (feedback === "low") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-amber-100">
          <Info size={18} className="shrink-0" />
          You colored less than {step.target.num}/{step.target.den}. Try
          coloring a bit more.
        </div>
      );
    }
    if (feedback === "high") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
          <Info size={18} className="shrink-0" />
          You colored more than {step.target.num}/{step.target.den}. Try
          un-coloring some pieces.
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* LEFT: instructions */}
        <div className="flex-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-1.5 rounded-full ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={18} />
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-800 mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500">{step.helper}</p>

            <div className="mt-5 space-y-3">
              {renderFeedback()}

              {/* controls row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Check */}
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-5 py-3 rounded-2xl font-black text-sm md:text-base bg-slate-900 text-white shadow-lg shadow-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                {/* Why */}
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-4 py-3 rounded-full text-sm font-semibold shadow-sm border border-slate-200 transition-all"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </button>

                {/* See answer */}
                <button
                  type="button"
                  onClick={handleShowAnswer}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 active:scale-95 transition-all"
                >
                  See the answer
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p>
                    Each shape is split into equal{" "}
                    <span className="font-semibold">units of area</span>. The
                    fraction tells you how many of those equal pieces you should
                    color. For example,{" "}
                    <span className="font-semibold">
                      {step.target.num}/{step.target.den}
                    </span>{" "}
                    means color{" "}
                    <span className="font-semibold">
                      {step.target.num}/{step.target.den} of the whole shape
                    </span>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: shape + fraction card */}
        <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
          <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white shadow-slate-200/60">
            <FractionShape
              shapeId={step.shape}
              selectedIds={selectedIds}
              onToggle={handleTogglePiece}
              readOnly={isCompleted}
              size={320}
            />
            {showConfetti && <ConfettiBurst />}
          </div>

          <FractionTrackerCard
            selectedUnits={selectedUnits}
            totalUnits={totalUnits}
          />
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Multiple-choice step: "Which shape does NOT have …?"
// --------------------------------------------------
const WhichShapeNotFractionStep = ({ step, isCompleted, onComplete }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState("idle");
  const [showWhy, setShowWhy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const letters = ["A", "B", "C", "D"];

  const handleSelect = (idx) => {
    if (isCompleted) return;
    setSelectedIndex(idx);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("pop");
  };

  const handleReset = () => {
    if (isCompleted) return;
    setSelectedIndex(null);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const handleCheck = () => {
    if (isCompleted) return;

    if (selectedIndex === null) {
      setFeedback("noChoice");
      playSound("error");
      return;
    }

    if (selectedIndex === step.correctIndex) {
      setFeedback("correct");
      setShowConfetti(true);
      playSound("win");
      onComplete();
    } else {
      setFeedback("wrong");
      setShowConfetti(false);
      playSound("error");
    }
  };

  const handleShowAnswer = () => {
    setSelectedIndex(step.correctIndex);
    setFeedback("idle");
    setShowConfetti(false);
    playSound("snap");
  };

  const renderFeedback = () => {
    if (feedback === "correct") {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-green-100">
          <Check size={18} className="shrink-0" />
          Yes! This shape does <span className="font-semibold">not</span> have{" "}
          {step.fraction.num}/{step.fraction.den} of it colored.
        </div>
      );
    }
    if (feedback === "wrong") {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100">
          <Info size={18} className="shrink-0" />
          That shape actually does have {step.fraction.num}/
          {step.fraction.den} colored. Try another one.
        </div>
      );
    }
    if (feedback === "noChoice") {
      return (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-amber-100">
          <Info size={18} className="shrink-0" />
          Tap a shape first, then press <span className="font-bold">Check</span>
          .
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`transition-all duration-700 ${
        isCompleted ? "opacity-95" : "opacity-100"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* LEFT: instructions */}
        <div className="flex-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {step.label}
                </span>
                <h2 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
                  {step.title}
                </h2>
              </div>
              <div
                className={`p-1.5 rounded-full ${
                  isCompleted
                    ? "bg-amber-100 text-amber-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Sparkles size={18} />
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-800 mb-2">
              {step.prompt}
            </p>
            <p className="text-sm text-slate-500">{step.helper}</p>

            <div className="mt-5 space-y-3">
              {renderFeedback()}

              {/* controls row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Check */}
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 px-5 py-3 rounded-2xl font-black text-sm md:text-base bg-slate-900 text-white shadow-lg shadow-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Check
                </button>

                {/* Why */}
                <button
                  type="button"
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-4 py-3 rounded-full text-sm font-semibold shadow-sm border border-slate-200 transition-all"
                >
                  <HelpCircle size={18} />
                  <span>Why?</span>
                  {showWhy ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </button>

                {/* See answer */}
                <button
                  type="button"
                  onClick={handleShowAnswer}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 active:scale-95 transition-all"
                >
                  See the answer
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>

              {showWhy && (
                <div className="mt-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 text-slate-400 shrink-0"
                  />
                  <p>
                    Three of the shapes have exactly{" "}
                    <span className="font-semibold">
                      {step.fraction.num}/{step.fraction.den}
                    </span>{" "}
                    of their area colored in. One of them is different – that is
                    the one you are looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: 2×2 grid of shapes */}
        <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
          <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white shadow-slate-200/60">
            <div className="grid grid-cols-2 gap-4">
              {step.options.map((optIds, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = step.correctIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`relative rounded-3xl border-2 p-3 md:p-4 transition-all text-left ${
                      isSelected
                        ? "border-sky-400 bg-sky-50 shadow-lg shadow-sky-100"
                        : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200">
                        {letters[idx]}
                      </span>
                      {isCompleted && isCorrect && (
                        <span className="text-[10px] font-semibold text-emerald-500">
                          correct
                        </span>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl p-2 md:p-3 shadow-inner border border-slate-100">
                      <FractionShape
                        shapeId={step.shape}
                        selectedIds={optIds}
                        readOnly
                        size={150}
                        highlightColor="#facc15"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            {showConfetti && <ConfettiBurst />}
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Final tip card
// --------------------------------------------------
const FinalTipCard = () => {
  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-3">
          <h3 className="text-lg md:text-xl font-semibold text-slate-900">
            Fractions work the same way on any shape.
          </h3>
          <p className="text-sm md:text-base text-slate-600">
            Whether you are looking at a hexagon, a circle, a triangle, or a
            square, the denominator tells you how many equal parts the whole is
            split into, and the numerator tells you how many of those parts are
            colored. Different shapes, same fraction ideas.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[1.5rem] p-4 shadow-inner border border-slate-200 text-sm text-slate-700 max-w-xs">
          <p className="font-semibold mb-1">Quick fraction recap</p>
          <ul className="list-disc list-inside space-y-1">
            <li>1/2 means half of the equal pieces.</li>
            <li>1/4, 2/4, 3/4 compare how much of the same whole is colored.</li>
            <li>2/12 and 7/12 use the same idea with 12 equal slices.</li>
            <li>7/8 means “all but one” when the whole is split into 8 units.</li>
          </ul>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-slate-600">
        The shape can change, but fractions always describe{" "}
        <span className="font-semibold">part of one whole</span>.
      </p>
    </div>
  );
};

// --------------------------------------------------
// Main lesson component
// --------------------------------------------------
const MoreFractionColoringLesson = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const bottomRef = useRef(null);

  const activeStepIndex = completedSteps.length;
  const visibleSteps = STEPS.slice(0, activeStepIndex + 1);
  const allDone = completedSteps.length === STEPS.length;

  const handleStepComplete = (stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  };

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 400);
    }
  }, [completedSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-sky-200">
              <Sparkles size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg leading-none text-slate-900">
                Fraction Coloring – Shapes
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Visual Fractions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
            <Trophy
              size={16}
              className={
                completedSteps.length > 0
                  ? "text-sky-500 fill-sky-500 animate-bounce"
                  : "text-slate-300 fill-slate-300"
              }
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-700">
                {completedSteps.length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {STEPS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps timeline */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-16 mt-8">
        {visibleSteps.map((step, index) => {
          const isLast = index === visibleSteps.length - 1;
          const StepComponent =
            step.kind === "whichNot"
              ? WhichShapeNotFractionStep
              : FractionShapeStep;

          return (
            <div
              key={step.id}
              className="relative animate-in slide-in-from-bottom-12 fade-in duration-700 fill-mode-backwards"
            >
              {/* timeline dots desktop */}
              <div className="hidden md:flex absolute -left-10 top-0 flex-col items-center h-full opacity-50 pointer-events-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-colors duration-500 ${
                    completedSteps.includes(step.id)
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                )}
              </div>

              <StepComponent
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                onComplete={() => handleStepComplete(step.id)}
              />

              {!isLast && (
                <div className="md:hidden h-16 w-0.5 bg-slate-200 mx-auto my-6 rounded-full" />
              )}

              {isLast && <div ref={bottomRef} className="h-10" />}
            </div>
          );
        })}

        {allDone && <FinalTipCard />}
      </div>

      {/* local animations */}
      <style>{`
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        .animate-particle-burst {
          animation: particle-burst 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MoreFractionColoringLesson;
