import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Book,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Battery,
  Lightbulb,
  Settings,
  ShieldCheck,
  Star,
  Info,
  List,
  ClipboardList,
  AlertTriangle,
  Sun,
  GitBranch,
  GitFork,
  PenTool,
  Zap,
  Cpu,
  HelpCircle,
  CheckCircle2,
  BatteryCharging,
  Fan,
  ToggleLeft,
  Speaker,
  Component,
  Wrench,
  Boxes,
  CornerUpRight,
  CornerDownLeft,
  Sparkles,
  FileDown,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Image as ImageIcon
} from 'lucide-react';

// -------- ICONS REGISTRY FOR SELECTION --------

const ICON_OPTIONS = [
  { key: 'star', label: 'نجمة', icon: Star },
  { key: 'book', label: 'كتاب', icon: Book },
  { key: 'lightbulb', label: 'ضوء', icon: Lightbulb },
  { key: 'battery', label: 'بطارية', icon: Battery },
  { key: 'speaker', label: 'صوت', icon: Speaker },
  { key: 'motor', label: 'حركة', icon: Fan },
  { key: 'alert', label: 'تحذير', icon: AlertTriangle },
  { key: 'chip', label: 'دائرة', icon: Cpu },
  { key: 'branch', label: 'توصيل', icon: GitBranch },
  { key: 'list', label: 'قائمة', icon: ClipboardList },
  { key: 'pen', label: 'قلم', icon: PenTool },
  { key: 'settings', label: 'تحكم', icon: Settings },
  { key: 'sparkles', label: 'نجوم', icon: Sparkles },
  { key: 'component', label: 'مكوّن', icon: Component },
  { key: 'box', label: 'كيت', icon: Boxes }
];

const iconRegistry = ICON_OPTIONS.reduce((acc, opt) => {
  acc[opt.key] = opt.icon;
  return acc;
}, {});

// --- Visual Assets (SVGs & Helpers) ---

const CircuitPattern = ({ colorClass, opacity = '0.05' }) => (
  <div className={`absolute inset-0 pointer-events-none ${colorClass}`} style={{ opacity }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M10 10 h20 v20 h-20 z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
        <path d="M50 50 l20 20 h20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 90 h80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="90" cy="10" r="2" fill="none" stroke="currentColor" />
        <path d="M90 12 v20" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  </div>
);

const BlueprintGrid = () => (
  <div
    className="absolute inset-0 opacity-[0.1]"
    style={{
      backgroundImage:
        'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}
  />
);

const PageDecorations = ({ theme }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" dir="ltr">
    <div className={`absolute top-[15%] -right-[5%] opacity-[0.03] ${theme.subText} animate-spin-slow`}>
      <Settings size={120} />
    </div>
    <div className={`absolute bottom-[10%] -left-[5%] opacity-[0.04] ${theme.subText}`}>
      <Cpu size={150} />
    </div>
    <div className={`absolute top-[40%] left-[10%] opacity-[0.05] ${theme.subText}`}>
      <Zap size={40} className="rotate-12" />
    </div>
    <div className={`absolute bottom-[30%] right-[15%] opacity-[0.05] ${theme.subText}`}>
      <Sparkles size={50} className="-rotate-12" />
    </div>
  </div>
);

// --- Theme Configuration ---

const toneStyles = {
  indigo: {
    gradient: 'from-indigo-600 to-violet-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    subText: 'text-indigo-600',
    shadow: 'shadow-indigo-200/50',
        headerBg: 'bg-indigo-600' // 👈 جديد

  },
  blue: {
    gradient: 'from-blue-600 to-cyan-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    subText: 'text-blue-600',
    shadow: 'shadow-blue-200/50',
    headerBg: 'bg-blue-600' // 👈 جديد

  },
  yellow: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    subText: 'text-amber-600',
    shadow: 'shadow-amber-200/50',
            headerBg: 'bg-yellow-600' // 👈 جديد

  },
  amber: {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    subText: 'text-orange-600',
    shadow: 'shadow-amber-200/50',
            headerBg: 'bg-amber-600' // 👈 جديد

  },
  red: {
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    subText: 'text-rose-600',
    shadow: 'shadow-rose-200/50',
            headerBg: 'bg-red-600' // 👈 جديد

  },
  green: {
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    subText: 'text-emerald-600',
    shadow: 'shadow-emerald-200/50',
            headerBg: 'bg-green-600' // 👈 جديد

  },
  teal: {
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-900',
    subText: 'text-teal-600',
    shadow: 'shadow-teal-200/50',
            headerBg: 'bg-teal-600' // 👈 جديد

  },
  purple: {
    gradient: 'from-purple-600 to-fuchsia-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    subText: 'text-purple-600',
    shadow: 'shadow-purple-200/50',
            headerBg: 'bg-purple-600' // 👈 جديد

  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-900',
    subText: 'text-pink-600',
    shadow: 'shadow-pink-200/50',
            headerBg: 'bg-pink-600' // 👈 جديد

  },
  default: {
    gradient: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    subText: 'text-slate-600',
    shadow: 'shadow-slate-200/50',
            headerBg: 'bg-default-600' // 👈 جديد

  }
};

// --- COURSE BOOK PAGES (Cleaned: No default images) ---
const defaultPages = [
  // keep empty, we'll auto-create one page if needed
];

// --- Sub Components ---

const QuestionCard = ({ question, note, theme, uiSettings }) => (
  <div className="relative group">
    <div className="absolute -top-4 right-6 z-10 text-slate-400 drop-shadow-md transform -rotate-12 group-hover:rotate-0 transition-transform">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
      </svg>
    </div>

    <div className={`bg-white border-2 border-dashed ${theme.border} rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent opacity-[0.04] rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-100 opacity-[0.4] rounded-tr-full" />

      <div className="flex gap-5 relative z-10">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl ${theme.bg} ${theme.subText} flex items-center justify-center shadow-inner border ${theme.border}`}
        >
          <HelpCircle size={26} />
        </div>
        <div className="space-y-2 flex-1 py-1">
          <h3
            className="font-bold text-slate-800 leading-snug"
            style={{
              fontSize: `${Math.max(18, (uiSettings?.bodyFontPx ?? 19) + 3)}px`
            }}
          >
            {question}
          </h3>
          {note && (
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 py-1 px-3 rounded-lg inline-block border border-slate-100">
              <PenTool size={14} className={theme.subText} />
              <span>{note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const EnhancedBlueprintImage = ({ desc, theme, index }) => (
  <div className="relative my-8 group perspective-1000">
    <div className="absolute inset-0 bg-slate-900 rounded-xl transform translate-x-1 translate-y-2 group-hover:translate-x-2 group-hover:translate-y-3 transition-transform duration-300 -z-10 opacity-5" />

    <div className="relative bg-[#f4f7fa] border-[3px] border-slate-200 rounded-xl overflow-hidden min-h-[240px] flex flex-col items-center justify-center p-8 text-center shadow-inner">
      <BlueprintGrid />

      <CornerUpRight className={`absolute top-2 right-2 ${theme.subText} opacity-30`} size={20} />
      <CornerDownLeft className={`absolute bottom-2 left-2 ${theme.subText} opacity-30`} size={20} />
      <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-400 border border-slate-300 px-1 rounded">
        FIG-{index + 1}
      </div>

      <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-slate-300/60 pointer-events-none" />
      <div className="absolute left-1/2 top-4 bottom-4 w-px border-l border-dashed border-slate-300/60 pointer-events-none" />

      <div className="relative z-10 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div
          className={`w-24 h-24 mx-auto mb-4 rounded-2xl ${theme.bg} border-2 ${theme.border} flex items-center justify-center text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] group-hover:scale-105 transition-transform`}
        >
          {desc.includes('روبوت') ? (
            <Boxes size={48} className={theme.subText} />
          ) : desc.includes('بطارية') ? (
            <BatteryCharging size={48} className={theme.subText} />
          ) : desc.includes('مصباح') || desc.includes('ليد') || desc.includes('لمبة') ? (
            <Lightbulb size={48} className={theme.subText} />
          ) : desc.includes('موتور') || desc.includes('مروحة') || desc.includes('سيارة') ? (
            <Fan size={48} className={theme.subText} />
          ) : (
            <Cpu size={48} className={theme.subText} />
          )}
        </div>
        <p className="text-base font-bold text-slate-700 font-mono leading-relaxed mx-auto max-w-md">{desc}</p>
      </div>

      <div
        className={`absolute bottom-0 right-0 px-4 py-1.5 ${theme.bg} ${theme.subText} text-[11px] font-bold rounded-tl-lg border-t border-l ${theme.border} flex items-center gap-2`}
      >
        <Wrench size={12} />
        توضيح فني
      </div>
    </div>
  </div>
);

const getIconForText = (text, defaultIcon, iconSize = 18) => {
  const lowerText = (text || '').toLowerCase();

  if (lowerText.includes('بطارية') || lowerText.includes('شحنات'))
    return <BatteryCharging size={iconSize} />;

  if (lowerText.includes('ليد') || lowerText.includes('ضوء') || lowerText.includes('مصباح') || lowerText.includes('لمبة'))
    return <Lightbulb size={iconSize} />;

  if (lowerText.includes('موتور') || lowerText.includes('حركة') || lowerText.includes('مروحة'))
    return <Fan size={iconSize} />;

  if (lowerText.includes('مفتاح') || lowerText.includes('تحكم'))
    return <ToggleLeft size={iconSize} />;

  if (lowerText.includes('صوت') || lowerText.includes('صفارة') || lowerText.includes('جرس'))
    return <Speaker size={iconSize} />;

  if (lowerText.includes('توصيل') || lowerText.includes('دائرة'))
    return <GitBranch size={iconSize} />;

  if (lowerText.includes('كهرباء') || lowerText.includes('طاقة'))
    return <Zap size={iconSize} />;

  if (lowerText.includes('تجربة') || lowerText.includes('خطوة'))
    return <ClipboardList size={iconSize} />;

  if (lowerText.includes('تحذير'))
    return <AlertTriangle size={iconSize} />;

  return defaultIcon;
};

const DefaultBullet = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="4"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="8" r="3" fill="currentColor" />
  </svg>
);

const EnhancedParagraph = ({ text, theme, iconKey, uiSettings }) => {
  const fontSize = uiSettings?.bodyFontPx ?? 19;
  const iconSize = Math.round(fontSize * 0.9);

  const IconElement = useMemo(() => {
    if (iconKey && iconRegistry[iconKey]) {
      const Comp = iconRegistry[iconKey];
      return <Comp size={iconSize} />;
    }

    return getIconForText(text, <DefaultBullet size={iconSize} />, iconSize);
  }, [text, iconKey, iconSize]);

  return (
    <div className="flex gap-4 group items-center">
      <div
        className={`shrink-0 p-1.5 rounded-lg transition-colors ${theme.bg} border ${theme.border} ${theme.subText} group-hover:scale-110 transition-transform flex items-center justify-center`}
      >
        {IconElement}
      </div>
      <p
        className="text-slate-700 font-medium flex-1"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${uiSettings?.bodyLinePx ?? 32}px`
        }}
      >
        {text}
      </p>
    </div>
  );
};



const EnhancedTechList = ({ items, theme, uiSettings }) => {
  const fontSize = uiSettings?.bodyFontPx ?? 19;
  const iconSize = Math.round(fontSize * 0.85);

  const getComponentIcon = (item) => {
    const lowerItem = (item || '').toLowerCase();
    if (lowerItem.includes('بطارية')) return <Battery size={iconSize} />;
    if (lowerItem.includes('موتور')) return <Fan size={iconSize} />;
    if (lowerItem.includes('مراوح')) return <Fan size={iconSize} />;
    if (lowerItem.includes('صافرة') || lowerItem.includes('صفارة')) return <Speaker size={iconSize} />;
    if (lowerItem.includes('مفتاح')) return <ToggleLeft size={iconSize} />;
    if (lowerItem.includes('لوح') || lowerItem.includes('توصيل')) return <Component size={iconSize} />;
    if (lowerItem.includes('أسلاك')) return <GitBranch size={iconSize} />;
    return <Boxes size={iconSize} />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl ...">
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${theme.bg} border ${theme.border} ${theme.subText} group-hover:scale-105 transition-transform shadow-sm`}>
            {getComponentIcon(item)}
          </div>
          <span
            className="text-slate-700 font-bold"
            style={{
              fontSize: `${Math.max(12, fontSize - 3)}px`,
              lineHeight: `${Math.max(16, (uiSettings?.bodyLinePx ?? 32) - 10)}px`
            }}
          >
            {item}
          </span>
          ...
        </div>
      ))}
    </div>
  );
};

// --- BLOCKS EDITOR (Paragraphs, Spaces, Images, Bullets, Questions as blocks) ---

const BlocksEditor = ({ blocks = [], onChange }) => {
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const updateBlock = (index, patch) => {
    const next = safeBlocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `b-${Date.now()}-${Math.random()}`,
      type,
      text: '',
      note: type === 'question' ? '' : undefined,
      height: type === 'space' ? 32 : undefined,
      iconKey: undefined,
      // Image defaults
      src: type === 'image' ? '' : undefined,
      width: type === 'image' ? 70 : undefined,
      borderRadius: type === 'image' ? 24 : undefined,
      caption: type === 'image' ? '' : undefined,
      // Bullets defaults
      items: type === 'bullets' ? [''] : undefined,
      title: type === 'bullets' ? '' : undefined
    };
    onChange([...safeBlocks, newBlock]);
  };

  const addBlockAfter = (index, type) => {
    const newBlock = {
      id: `b-${Date.now()}-${Math.random()}`,
      type,
      text: '',
      note: type === 'question' ? '' : undefined,
      height: type === 'space' ? 32 : undefined,
      iconKey: undefined,
      src: type === 'image' ? '' : undefined,
      width: type === 'image' ? 70 : undefined,
      borderRadius: type === 'image' ? 24 : undefined,
      caption: type === 'image' ? '' : undefined,
      items: type === 'bullets' ? [''] : undefined,
      title: type === 'bullets' ? '' : undefined
    };
    const next = [...safeBlocks];
    next.splice(index + 1, 0, newBlock);
    onChange(next);
  };

  const removeBlock = (index) => {
    const next = safeBlocks.filter((_, i) => i !== index);
    onChange(next);
  };

  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= safeBlocks.length) return;
    const next = [...safeBlocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target && evt.target.result;
      if (typeof src === 'string') {
        updateBlock(index, { src });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-slate-400 mb-1 font-medium">محتوى الصفحة</label>
      <p className="text-[10px] text-slate-500 mb-2">
        رتب المحتوى (سؤال، نصوص، صور، قوائم نقطية، مسافات) بالطريقة التي تفضلها.
      </p>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {safeBlocks.length === 0 && (
          <div className="text-[11px] text-slate-500 mb-1">
            لا يوجد محتوى بعد. أضف عناصر من الأزرار بالأسفل.
          </div>
        )}

        {safeBlocks.map((block, index) => {
          // --- QUESTION BLOCK ---
          if (block.type === 'question') {
            return (
              <div
                key={block.id || `q-${index}`}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                    <HelpCircle size={12} className="text-amber-300" />
                    سؤال #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === safeBlocks.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <input
                  value={block.text || ''}
                  onChange={(e) => updateBlock(index, { text: e.target.value })}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="اكتب السؤال هنا..."
                />

                <input
                  value={block.note || ''}
                  onChange={(e) => updateBlock(index, { note: e.target.value })}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="ملاحظة تحت السؤال (اختياري)"
                />
              </div>
            );
          }

          // --- PARAGRAPH BLOCK ---
          if (block.type === 'paragraph') {
            const currentIconKey = block.iconKey || 'auto';
            return (
              <div
                key={block.id || `p-${index}`}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold">نص #{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === safeBlocks.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlockAfter(index, 'space')}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/70 transition-colors"
                      title="إضافة مسافة بعد"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="whitespace-nowrap">أيقونة:</span>
                  <select
                    value={currentIconKey}
                    onChange={(e) =>
                      updateBlock(index, {
                        iconKey: e.target.value === 'auto' ? undefined : e.target.value
                      })
                    }
                    className="flex-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-1 text-[10px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="auto">تلقائي</option>
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={block.text || ''}
                  onChange={(e) => updateBlock(index, { text: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  placeholder="اكتب نص الفقرة هنا..."
                />
              </div>
            );
          }

          // --- IMAGE BLOCK ---
          if (block.type === 'image') {
            const width = typeof block.width === 'number' ? block.width : 70;
            const radius = typeof block.borderRadius === 'number' ? block.borderRadius : 24;

            return (
              <div
                key={block.id || `img-${index}`}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                    <ImageIcon size={12} className="text-emerald-400" />
                    صورة #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === safeBlocks.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {block.src ? (
                      <img src={block.src} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-block px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-[10px] text-slate-200 cursor-pointer hover:border-sky-500/70 transition-colors">
                      {block.src ? 'تغيير الصورة' : 'رفع صورة'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                    </label>
                    <input
                      value={block.caption || ''}
                      onChange={(e) => updateBlock(index, { caption: e.target.value })}
                      className="w-full rounded-lg bg-slate-900/60 border border-slate-700 px-2 py-1 text-[10px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="الكابشن (اختياري)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">العرض: {width}%</span>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={width}
                      onChange={(e) => updateBlock(index, { width: Number(e.target.value) })}
                      className="w-full h-1"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">الحواف: {radius}px</span>
                    <input
                      type="range"
                      min={0}
                      max={48}
                      value={radius}
                      onChange={(e) => updateBlock(index, { borderRadius: Number(e.target.value) })}
                      className="w-full h-1"
                    />
                  </div>
                </div>
              </div>
            );
          }

          // --- SPACE BLOCK ---
          if (block.type === 'space') {
            const height = typeof block.height === 'number' ? block.height : 32;
            return (
              <div
                key={block.id || `s-${index}`}
                className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles size={12} className="text-sky-400" />
                    مسافة #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === safeBlocks.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={8}
                    max={160}
                    step={4}
                    value={height}
                    onChange={(e) => updateBlock(index, { height: Number(e.target.value) })}
                    className="flex-1 h-1"
                  />
                  <span className="text-[9px] text-slate-400 w-8 text-left">{height}px</span>
                </div>
              </div>
            );
          }

          // --- BULLETS BLOCK ---
          if (block.type === 'bullets') {
            const items = Array.isArray(block.items) ? block.items : [];

            const handleItemChange = (i, value) => {
              const nextItems = [...items];
              nextItems[i] = value;
              updateBlock(index, { items: nextItems });
            };

            const handleAddItem = () => {
              updateBlock(index, { items: [...items, ''] });
            };

            const handleRemoveItem = (i) => {
              const nextItems = items.filter((_, idx) => idx !== i);
              updateBlock(index, { items: nextItems });
            };

            return (
              <div
                key={block.id || `bul-${index}`}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                    <List size={12} className="text-sky-400" />
                    قائمة نقطية #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 transition-colors disabled:opacity-40"
                      disabled={index === safeBlocks.length - 1}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlockAfter(index, 'space')}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/70 transition-colors"
                      title="إضافة مسافة بعد"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">عنوان القائمة</label>
                  <input
                    value={block.title || ''}
                    onChange={(e) => updateBlock(index, { title: e.target.value })}
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="مثلاً: المكونات والأدوات المطلوبة"
                  />
                </div>

                <div className="space-y-1.5 mt-1">
                  {items.map((item, idxItem) => (
                    <div key={idxItem} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-4 text-center">•</span>
                      <input
                        value={item}
                        onChange={(e) => handleItemChange(idxItem, e.target.value)}
                        className="flex-1 rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idxItem)}
                        className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Plus size={12} />
                  إضافة سطر
                </button>
              </div>
            );
          }

          // fallback
          return null;
        })}
      </div>

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => addBlock('question')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <HelpCircle size={12} />
          سؤال
        </button>

        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={12} />
          فقرة
        </button>

        <button
          type="button"
          onClick={() => addBlock('image')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ImageIcon size={12} />
          صورة
        </button>

        <button
          type="button"
          onClick={() => addBlock('bullets')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <List size={12} />
          قائمة نقطية
        </button>

        <button
          type="button"
          onClick={() => addBlock('space')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Sparkles size={12} />
          مسافة
        </button>
      </div>
    </div>
  );
};

// --- BULLETS EDITOR (legacy, unused but kept) ---

const BulletsEditor = ({ bullets = [], onChange }) => {
  const handleChange = (index, value) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next.filter((b) => b && b.trim().length > 0));
  };

  const handleAdd = () => {
    onChange([...(bullets || []), '']);
  };

  const handleRemove = (index) => {
    const next = [...bullets];
    next.splice(index, 1);
    onChange(next);
  };

  const list = bullets.length ? bullets : [];

  return (
    <div>
      <label className="block text-slate-400 mb-1 font-medium">
        Bullets
        <span className="text-[10px] text-slate-500 ml-1">اختياري</span>
      </label>
      <div className="space-y-1.5">
        {list.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-4 text-center">•</span>
            <input
              value={b}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="flex-1 rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
      >
        <Plus size={12} />
        إضافة سطر
      </button>
    </div>
  );
};

// --- IMAGES EDITOR (legacy, unused standalone) ---

const ImagesEditor = ({ images = [], onChange }) => {
  const safeImages = Array.isArray(images) ? images : [];

  const updateImage = (index, patch) => {
    const next = safeImages.map((img, i) => (i === index ? { ...img, ...patch } : img));
    onChange(next);
  };

  const removeImage = (index) => {
    const next = safeImages.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleFileChange = (event, index = null) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target && e.target.result;
      if (typeof src !== 'string') return;

      if (index === null) {
        const newImg = {
          id: `img-${Date.now()}-${Math.random()}`,
          src,
          caption: '',
          width: 70,
          borderRadius: 24
        };
        onChange([...safeImages, newImg]);
      } else {
        updateImage(index, { src });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="mt-3">
      <label className="block text-slate-400 mb-1 font-medium">الصور داخل الصفحة</label>
      <p className="text-[10px] text-slate-500 mb-2">
        ارفع صورة من جهازك (بدون لينك). تقدر تتحكم في الكابشن، عرض الصورة، واستدارة الحواف.
      </p>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {safeImages.map((img, idx) => {
          const width = typeof img.width === 'number' ? img.width : 70;
          const radius = typeof img.borderRadius === 'number' ? img.borderRadius : 24;
          return (
            <div
              key={img.id || `img-${idx}`}
              className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-sky-400" />
                  صورة #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[10px] text-slate-200 cursor-pointer hover:border-sky-500/70 hover:text-sky-200 transition-colors">
                    تغيير الصورة
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, idx)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.caption || `صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: radius }}
                    />
                  ) : (
                    <ImageIcon size={20} className="text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-[10px] text-slate-400 mb-0.5">الكابشن تحت الصورة</label>
                  <input
                    value={img.caption || ''}
                    onChange={(e) => updateImage(idx, { caption: e.target.value })}
                    className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-2 py-1.5 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="مثلاً: دائرة الليد الأولى"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>عرض الصورة داخل الصفحة: {width}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={width}
                  onChange={(e) => updateImage(idx, { width: Number(e.target.value) })}
                  className="w-full"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>استدارة الحواف: {radius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={48}
                  value={radius}
                  onChange={(e) => updateImage(idx, { borderRadius: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          );
        })}

        {safeImages.length === 0 && (
          <div className="text-[11px] text-slate-500">
            لا توجد صور في هذه الصفحة بعد. أضف صورة من الأسفل.
          </div>
        )}
      </div>

      <div className="mt-2">
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors">
          <ImageIcon size={12} />
          رفع صورة جديدة
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, null)}
          />
        </label>
      </div>
    </div>
  );
};

// --- Book Sidebar ---

const BookSidebar = ({
  pages,
  currentIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  canDelete,
  bookMeta,
  onBookMetaChange,
  onReset,
  onMovePage
}) => {
  return (
    <div className="no-print w-full lg:w-[260px] bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 flex flex-col gap-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-slate-200">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">Book settings</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/70 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Book meta */}
      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Brand / Publisher</label>
          <input
            value={bookMeta.brandName}
            onChange={(e) => onBookMetaChange('brandName', e.target.value)}
            className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Level tag (top of page)</label>
          <input
            value={bookMeta.levelTag}
            onChange={(e) => onBookMetaChange('levelTag', e.target.value)}
            className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Tagline</label>
            <input
              value={bookMeta.tagline}
              onChange={(e) => onBookMetaChange('tagline', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Age range</label>
            <input
              value={bookMeta.ageRange}
              onChange={(e) => onBookMetaChange('ageRange', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Pages list */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 tracking-[0.16em] uppercase">
            Pages ({pages.length})
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onAddPage}
              className="p-1.5 rounded-full bg-emerald-500/80 text-white hover:bg-emerald-400 transition-colors"
              title="Add page"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={onDuplicatePage}
              className="p-1.5 rounded-full bg-sky-500/80 text-white hover:bg-sky-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={pages.length === 0}
              title="Duplicate page"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={onDeletePage}
              className="p-1.5 rounded-full bg-rose-600/80 text-white hover:bg-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canDelete}
              title="Delete page"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="max-h-[260px] overflow-y-auto pr-1 space-y-1">
          {pages.map((p, idx) => {
            const theme = toneStyles[p.tone] || toneStyles.default;
            const active = idx === currentIndex;
            const description = p.noHeader ? 'صفحة بدون ترويسة' : p.sectionTitle || p.subtitle || 'صفحة عادية';

            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => onSelectPage(idx)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-2xl border text-left text-xs transition-all ${
                  active
                    ? 'bg-slate-800 border-sky-500/70 shadow-md'
                    : 'bg-slate-900/40 border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-mono ${
                    active ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-100 truncate">
                      {p.title || 'بدون عنوان'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full border ${theme.border} ${
                      active ? theme.bg : 'bg-slate-800'
                    }`}
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(idx, idx - 1);
                      }}
                      disabled={idx === 0}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(idx, idx + 1);
                      }}
                      disabled={idx === pages.length - 1}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500/70 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown size={9} />
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Page Editor Panel ---

const PageEditorPanel = ({ page, onFieldChange, onToneChange, onBlocksChange }) => {
  if (!page) return null;

  const toneOptions = Object.keys(toneStyles).filter((k) => k !== 'default');

  return (
    <div className="no-print w-full lg:w-[320px] bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-200">
          <Edit3 size={18} className="text-sky-400" />
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">Page editor</span>
        </div>
        <span className="text-[11px] text-slate-500">ID {page.id}</span>
      </div>

      <div className="space-y-3 text-xs overflow-y-auto max-h-[520px] pr-1">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Title</label>
            <input
              value={page.title || ''}
              onChange={(e) => onFieldChange('title', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Section title</label>
            <input
              value={page.sectionTitle || ''}
              onChange={(e) => onFieldChange('sectionTitle', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Subtitle</label>
          <input
            value={page.subtitle || ''}
            onChange={(e) => onFieldChange('subtitle', e.target.value)}
            className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Tone selector */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Tone (colors)</label>
          <select
            value={page.tone || 'default'}
            onChange={(e) => onToneChange(e.target.value)}
            className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Headerless toggle */}
        <div className="flex items-center gap-2">
          <input
            id={`noHeader-${page.id}`}
            type="checkbox"
            checked={!!page.noHeader}
            onChange={(e) => onFieldChange('noHeader', e.target.checked)}
            className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
          />
          <label htmlFor={`noHeader-${page.id}`} className="text-[11px] text-slate-300">
            صفحة بدون ترويسة علوية (بدون البانر الملون والعنوان في الأعلى)
          </label>
        </div>

        {/* Icon selector for page header */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Page icon</label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const selected = page.iconKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onFieldChange('iconKey', opt.key)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border text-[10px] ${
                    selected
                      ? 'bg-sky-600/80 border-sky-400 text-white'
                      : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <IconComp size={16} />
                  <span className="truncate w-full text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blocks */}
        <BlocksEditor blocks={page.blocks || []} onChange={onBlocksChange} />

        <p className="text-[10px] text-slate-500 mt-2">
          عدل عنوان الصفحة والألوان والأيقونة والنصوص، واستخدم بلوكات السؤال والمسافة والقوائم النقطية والصور
          المرفوعة لعمل تصميم مرتب.
        </p>
      </div>
    </div>
  );
};

// --- Normalization helper (ensure blocks exist + migrate bullets + migrate question into blocks) ---

const normalizePage = (raw) => {
  const p = { ...raw };
  let blocks = Array.isArray(p.blocks) ? p.blocks : null;

  if (!blocks || !blocks.length) {
    if (Array.isArray(p.paragraphs) && p.paragraphs.length) {
      blocks = p.paragraphs.map((txt, idx) => ({
        id: `p-${idx}-${Date.now()}`,
        type: 'paragraph',
        text: txt,
        iconKey: undefined
      }));
    } else {
      blocks = [];
    }
  }

  // Normalize shapes & types (include question)
  blocks = blocks.map((b, idx) => {
    const rawType = b.type;
    const type =
      rawType === 'space' || rawType === 'image' || rawType === 'bullets' || rawType === 'question'
        ? rawType
        : 'paragraph';

    return {
      id: b.id || `b-${idx}-${Date.now()}`,
      type,
      text: type === 'paragraph' || type === 'question' ? (b.text || '') : '',
      note: type === 'question' ? (b.note || '') : undefined,
      height:
        type === 'space'
          ? typeof b.height === 'number'
            ? b.height
            : 32
          : undefined,
      iconKey: b.iconKey || undefined,
      // Image fields
      src: type === 'image' ? b.src : undefined,
      width:
        type === 'image'
          ? typeof b.width === 'number'
            ? b.width
            : 70
          : undefined,
      borderRadius:
        type === 'image'
          ? typeof b.borderRadius === 'number'
            ? b.borderRadius
            : 24
          : undefined,
      caption: type === 'image' ? (b.caption || '') : undefined,
      // Bullets fields
      items:
        type === 'bullets'
          ? Array.isArray(b.items)
            ? b.items
            : Array.isArray(p.bullets)
            ? p.bullets
            : []
          : undefined,
      title:
        type === 'bullets'
          ? b.title || p.bulletsTitle || 'المكونات والأدوات المطلوبة'
          : undefined
    };
  });

  // If no bullets-block exists but page.bullets is present, add one at the end
  const hasBulletBlock = blocks.some((b) => b.type === 'bullets');
  if (!hasBulletBlock && Array.isArray(p.bullets) && p.bullets.length) {
    blocks.push({
      id: `bul-${Date.now()}`,
      type: 'bullets',
      items: [...p.bullets],
      title: p.bulletsTitle || 'المكونات والأدوات المطلوبة'
    });
  }

  // If no question-block exists but old page.question is present, add it at the top
  const hasQuestionBlock = blocks.some((b) => b.type === 'question');
  if (!hasQuestionBlock && p.question && String(p.question).trim().length > 0) {
    blocks.unshift({
      id: `q-${Date.now()}`,
      type: 'question',
      text: String(p.question),
      note: p.questionNote ? String(p.questionNote) : ''
    });
  }

  const paragraphs = blocks
    .filter((b) => b.type === 'paragraph' && b.text && b.text.trim().length > 0)
    .map((b) => b.text);

  const bulletsFromBlocks = blocks
    .filter((b) => b.type === 'bullets' && Array.isArray(b.items))
    .flatMap((b) => b.items || [])
    .filter((item) => item && item.trim().length > 0);

  return { ...p, blocks, paragraphs, bullets: bulletsFromBlocks, images: [] };
};

// --- Page Renderer ---

const PageContent = ({ page, pageNumber, totalPages, bookMeta, uiSettings, printMode = false }) => {
  const theme = toneStyles[page.tone] || toneStyles.default;
  const levelTag = bookMeta?.levelTag || 'Sparvi Lab · Level 1';
  const IconComp = iconRegistry[page.iconKey] || Book;
  const showHeader = !page.noHeader;

  const blocks =
    page.blocks && Array.isArray(page.blocks) && page.blocks.length
      ? page.blocks
      : (page.paragraphs || []).map((txt, idx) => ({
          id: `p-${idx}`,
          type: 'paragraph',
          text: txt,
          iconKey: undefined
        }));

  return (
    <div className={`relative flex justify-center ${printMode ? 'py-0' : 'py-6'}`} dir="rtl">
      <div
        className={`relative bg-white flex flex-col overflow-hidden ${
          printMode ? '' : 'rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]'
        }`}
        style={{
          width: printMode ? '210mm' : '794px',
          height: printMode ? '297mm' : '1123px'
        }}
      >
        <CircuitPattern colorClass={theme.subText} opacity="0.05" />
        <PageDecorations theme={theme} />

        {showHeader && (
<div className={`relative px-8 pt-12 pb-16 ${theme.headerBg || 'bg-slate-800'} text-white overflow-hidden`}>
            <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[80%] bg-white opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-black opacity-[0.1] rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <div className="flex-1 pl-6">
                <div className="flex items-center gap-3 mb-4 opacity-90">
                  <span className="text-[11px] font-black tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full text-white border border-white/30 uppercase backdrop-blur-md shadow-sm">
                    {levelTag}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-white/50 to-transparent" />
                </div>

                <h1 className="text-5xl md:text-6xl font-black leading-tight drop-shadow-lg tracking-tight">
                  {page.title}
                </h1>

                {page.sectionTitle && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                    <p className="text-xl text-white font-bold">{page.sectionTitle}</p>
                  </div>
                )}
              </div>

              <div className="shrink-0 relative -mt-4 -mr-4">
                <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-110" />
<div className="relative w-28 h-28 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border-[3px] border-white/40 rounded-3xl flex items-center justify-center transform rotate-6 group hover:rotate-0 transition-transform duration-500">
  <div className="text-white scale-125">
    <IconComp size={40} />
  </div>
  <Zap size={20} className="absolute -top-2 -left-2 text-white opacity-80 rotate-45" />
</div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 translate-y-[1px]">
              <svg viewBox="0 0 1440 100" className="fill-white w-full h-auto">
                <path d="M0,40 C320,120 420,0 840,30 C1100,60 1300,10 1440,40 L1440,100 L0,100 Z" opacity="0.2" />
                <path d="M0,60 C320,140 500,20 1000,50 C1200,70 1300,30 1440,60 L1440,100 L0,100 Z" opacity="0.4" />
                <path d="M0,80 C320,150 550,50 1100,80 C1300,90 1400,60 1440,80 L1440,100 L0,100 Z" />
              </svg>
            </div>
          </div>
        )}

        {/* INNER CONTENT PADDING (global control) */}
        <div
          className="flex-1 relative z-10"
          style={{
            paddingLeft: uiSettings?.contentPadX ?? 56,
            paddingRight: uiSettings?.contentPadX ?? 56,
            paddingTop: showHeader ? (uiSettings?.contentPadYWithHeader ?? 40) : (uiSettings?.contentPadYNoHeader ?? 48),
            paddingBottom: showHeader ? (uiSettings?.contentPadYWithHeader ?? 40) : (uiSettings?.contentPadYNoHeader ?? 48)
          }}
        >
          {(page.subtitle || page.subheading) && (
            <div className="mb-10 relative">
              <div
                className={`absolute right-0 top-0 bottom-0 w-2 rounded-full bg-gradient-to-b ${theme.gradient} opacity-80`}
              />
              <div className="pr-8 py-2">
                {page.subtitle && (
                  <p
                    className={`text-sm font-black uppercase tracking-widest ${theme.subText} mb-1 flex items-center gap-2`}
                  >
                    <Sparkles size={14} /> {page.subtitle}
                  </p>
                )}
                {page.subheading && (
                  <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
                    {page.subheading}
                    <Component size={28} className={`${theme.subText} opacity-50`} />
                  </h2>
                )}
              </div>
            </div>
          )}

          {blocks && blocks.length > 0 && (

             <div
    className="flex flex-col mb-10"
    style={{ rowGap: uiSettings?.contentGapPx ?? 24 }} // 👈 كله من السلايدر
  >
              {blocks.map((block, idx) => {
                // QUESTION BLOCK
                if (block.type === 'question') {
                  if (!block.text || !block.text.trim()) return null;
                  return (
                    <QuestionCard
                      key={block.id || `q-${idx}`}
                      question={block.text}
                      note={block.note || ''}
                      theme={theme}
                      uiSettings={uiSettings}
                    />
                  );
                }

                // IMAGE BLOCK
                if (block.type === 'image') {
                  const width = typeof block.width === 'number' ? block.width : 70;
                  const radius = typeof block.borderRadius === 'number' ? block.borderRadius : 24;
                  if (!block.src) return null;
                  return (
                    <div key={block.id || `img-b-${idx}`} className="flex flex-col items-center gap-3 my-4">
                      <div className="w-full flex justify-center">
                        <img
                          src={block.src}
                          alt={block.caption || `صورة ${idx + 1}`}
                          className="border border-slate-300 object-contain"
                          style={{
                            maxWidth: `${width}%`,
                            borderRadius: radius,
                            boxShadow: 'none'
                          }}
                        />
                      </div>
                      {block.caption && (
                        <p
                          className="text-slate-500 text-center max-w-md"
                          style={{ fontSize: `${Math.max(11, (uiSettings?.bodyFontPx ?? 19) - 6)}px` }}
                        >
                          {block.caption}
                        </p>
                      )}
                    </div>
                  );
                }

                // SPACE BLOCK
                if (block.type === 'space') {
                  const height = typeof block.height === 'number' ? block.height : 32;
                  return <div key={block.id || `space-${idx}`} style={{ height }} />;
                }

                // BULLETS BLOCK
                if (block.type === 'bullets') {
                  const items = Array.isArray(block.items)
                    ? block.items.filter((item) => item && item.trim().length > 0)
                    : [];
                  if (!items.length) return null;
                  const title = block.title || 'المكونات والأدوات المطلوبة';

                  return (
                    <div
                      key={block.id || `bul-${idx}`}
                      className={`bg-slate-50/60 rounded-3xl p-8 border-2 border-dashed ${theme.border} relative overflow-hidden mb-2 shadow-sm`}
                    >
                      <CircuitPattern colorClass={theme.subText} opacity="0.03" />
                      <div className="relative z-10">
                        <h3
                          className={`text-lg font-black ${theme.subText} mb-4 flex items-center gap-3 uppercase tracking-wider`}
                        >
                          <div className={`p-2 rounded-lg ${theme.bg} border ${theme.border}`}>
                            <List size={20} />
                          </div>
                          {title}
                        </h3>
                        <EnhancedTechList items={items} theme={theme} uiSettings={uiSettings} />
                      </div>
                    </div>
                  );
                }

                // TEXT BLOCK
                return (
                  <EnhancedParagraph
                    key={block.id || `p-${idx}`}
                    text={block.text || ''}
                    theme={theme}
                    iconKey={block.iconKey}
                    uiSettings={uiSettings}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="h-16 mt-auto border-t-2 border-slate-100 bg-slate-50/80 backdrop-blur flex items-center justify-between px-10 text-slate-500 relative">
          <div className="flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase font-mono">
            <div className={`p-1.5 rounded-md ${theme.bg} border ${theme.border}`}>
              <Cpu size={14} className={theme.subText} />
            </div>
            {bookMeta?.brandName || 'Sparvi Electronics Lab'}
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PAGE</span>
            <span className="font-mono text-xl font-black text-slate-700 flex items-baseline gap-1">
              {pageNumber}{' '}
              <span className="text-slate-300 text-sm font-medium">/ {totalPages}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Book Schema Panel (new) ---

const BookSchemaPanel = ({
  schemaText,
  onChangeSchemaText,
  onGenerateFromPages,
  onApplyToPages,
  error
}) => {
  return (
    <div className="no-print w-full max-w-6xl mt-4 bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-200">
          <ClipboardList size={18} className="text-sky-400" />
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">
            Book schema (quick data entry)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerateFromPages}
            className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-[11px] font-medium border border-sky-500/40 hover:bg-slate-700 hover:text-white flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            توليد المخطط من الصفحات
          </button>
          <button
            type="button"
            onClick={onApplyToPages}
            className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-medium border border-emerald-300/60 hover:bg-emerald-400 flex items-center gap-1.5"
          >
            <GitBranch size={12} />
            تطبيق المخطط على الصفحات
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-2">
        هذا الجزء يعطيك مخطط كامل للكتاب في شكل Array من الصفحات (id, tone, iconKey, title, sectionTitle, blocks...).
        يمكنك تعديله بسرعة أو لصقه من ملف، ثم تطبيقه على المصمم.
      </p>

      <textarea
        value={schemaText}
        onChange={(e) => onChangeSchemaText(e.target.value)}
        rows={10}
        className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-[11px] text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
        placeholder={`// مثال سريع (يمكنك لصق JSON أو كود يشبه JavaScript)\n[\n  {\n    "id": 5,\n    "tone": "orange",\n    "iconKey": "book",\n    "title": "صفحة جديدة",\n    "sectionTitle": "عنوان القسم",\n    "blocks": [\n      { "type": "question", "text": "سؤال بسيط", "note": "اختياري" },\n      { "type": "paragraph", "text": "نص الشرح..." },\n      { "type": "bullets", "title": "الأدوات", "items": ["بطارية", "ليد"] }\n    ]\n  }\n]`}
      />

      {error && <p className="mt-2 text-[11px] text-rose-400">{error}</p>}

      <p className="mt-2 text-[10px] text-slate-500">
        ملاحظة: عند تطبيق المخطط، يتم إنشاء الصفحات من الـ Array فقط (id, tone, iconKey, title, sectionTitle, subtitle, blocks, noHeader).
      </p>
    </div>
  );
};

// --- Main Wrapper (platform) ---

const STORAGE_KEY = 'sparviBookDesigner';

const BilingualBook = () => {
  // Initialize pages (if no defaultPages, create one empty page)
  const [pages, setPages] = useState(() => {
    const base = defaultPages.map((p) => normalizePage(p));
    if (base.length) return base;
    return [
      normalizePage({
        id: Date.now(),
        tone: 'blue',
        iconKey: 'book',
        title: 'صفحة جديدة',
        sectionTitle: '',
        subtitle: '',
        paragraphs: ['اكتب هنا محتوى الصفحة الجديدة'],
        bullets: [],
        question: '',
        questionNote: '',
        images: [],
        noHeader: false
      })
    ];
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [printMode, setPrintMode] = useState(false);

  // --- Global UI settings (Font + Padding) ---
  const [uiSettings, setUiSettings] = useState({
    bodyFontPx: 19,
    bodyLinePx: 32,
    contentPadX: 56,
    contentPadYWithHeader: 40,
    contentPadYNoHeader: 48,
    contentGapPx: 24   // 👈 المسافة بين البلوكات
  });

  const [bookMeta, setBookMeta] = useState({
    brandName: 'Sparvi Lab',
    levelTag: 'Sparvi Lab · Level 1',
    tagline: 'Digital Lab Manual',
    ageRange: '8–11 years'
  });

  const [schemaText, setSchemaText] = useState('');
  const [schemaError, setSchemaError] = useState('');

  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex];

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length) {
        setPages(parsed.pages.map((p) => normalizePage(p)));
        if (typeof parsed.currentPageIndex === 'number') {
          const maxIndex = parsed.pages.length - 1;
          setCurrentPageIndex(Math.max(0, Math.min(parsed.currentPageIndex, maxIndex)));
        }
      }
      if (parsed.bookMeta) {
        setBookMeta(parsed.bookMeta);
      }
      if (parsed.uiSettings) {
        setUiSettings((prev) => ({ ...prev, ...parsed.uiSettings }));
      }
    } catch {
      // ignore
    }
  }, []);

  // --- Autosave every 5 seconds (only if changed) ---
  const pagesRef = useRef(pages);
  const metaRef = useRef(bookMeta);
  const indexRef = useRef(currentPageIndex);
  const uiRef = useRef(uiSettings);
  const dirtyRef = useRef(false);

  useEffect(() => {
    pagesRef.current = pages;
    dirtyRef.current = true;
  }, [pages]);

  useEffect(() => {
    metaRef.current = bookMeta;
    dirtyRef.current = true;
  }, [bookMeta]);

  useEffect(() => {
    indexRef.current = currentPageIndex;
    dirtyRef.current = true;
  }, [currentPageIndex]);

  useEffect(() => {
    uiRef.current = uiSettings;
    dirtyRef.current = true;
  }, [uiSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const id = setInterval(() => {
      if (!dirtyRef.current) return;

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            pages: pagesRef.current,
            bookMeta: metaRef.current,
            currentPageIndex: indexRef.current,
            uiSettings: uiRef.current
          })
        );
        dirtyRef.current = false;
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const nextPage = () => {
    if (totalPages === 0) return;
    setCurrentPageIndex((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    if (totalPages === 0) return;
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleBookMetaChange = (field, value) => {
    setBookMeta((prev) => ({ ...prev, [field]: value }));
  };

  const updateCurrentPageField = (field, value) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === currentPageIndex ? { ...p, [field]: value } : p))
    );
  };

  const updateCurrentPageBlocks = (blocks) => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        const paragraphs = blocks
          .filter((b) => b.type === 'paragraph' && b.text && b.text.trim().length > 0)
          .map((b) => b.text);
        const bullets = blocks
          .filter((b) => b.type === 'bullets' && Array.isArray(b.items))
          .flatMap((b) => b.items || [])
          .filter((item) => item && item.trim().length > 0);
        return { ...p, blocks, paragraphs, bullets };
      })
    );
  };

  const addPage = () => {
    const newPage = normalizePage({
      id: Date.now(),
      tone: 'blue',
      iconKey: 'book',
      title: 'صفحة جديدة',
      sectionTitle: '',
      subtitle: '',
      paragraphs: ['اكتب هنا محتوى الصفحة الجديدة'],
      bullets: [],
      question: '',
      questionNote: '',
      images: [],
      noHeader: false
    });
    setPages((prev) => {
      const newPages = [...prev, newPage];
      setCurrentPageIndex(newPages.length - 1);
      return newPages;
    });
  };

  const duplicatePage = () => {
    setPages((prev) => {
      const current = prev[currentPageIndex];
      if (!current) return prev;
      const copy = normalizePage({
        ...current,
        id: Date.now()
      });
      const newPages = [...prev];
      newPages.splice(currentPageIndex + 1, 0, copy);
      setCurrentPageIndex(currentPageIndex + 1);
      return newPages;
    });
  };

  const deletePage = () => {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      const newPages = prev.filter((_, idx) => idx !== currentPageIndex);
      const newIndex = Math.max(0, currentPageIndex - 1);
      setCurrentPageIndex(newIndex);
      return newPages;
    });
  };

  const resetBook = () => {
    const base = defaultPages.map((p) => normalizePage(p));
    const nextPages =
      base.length > 0
        ? base
        : [
            normalizePage({
              id: Date.now(),
              tone: 'blue',
              iconKey: 'book',
              title: 'صفحة جديدة',
              sectionTitle: '',
              subtitle: '',
              paragraphs: ['اكتب هنا محتوى الصفحة الجديدة'],
              bullets: [],
              question: '',
              questionNote: '',
              images: [],
              noHeader: false
            })
          ];
    setPages(nextPages);
    setBookMeta({
      brandName: 'Sparvi Lab',
      levelTag: 'Sparvi Lab · Level 1',
      tagline: 'Digital Lab Manual',
      ageRange: '8–11 years'
    });
    setUiSettings({
  bodyFontPx: 19,
  bodyLinePx: 32,
  contentPadX: 56,
  contentPadYWithHeader: 40,
  contentPadYNoHeader: 48,
  contentGapPx: 24
    });
    setCurrentPageIndex(0);
    setSchemaText('');
    setSchemaError('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Manual save button
  const handleManualSave = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pages, bookMeta, currentPageIndex, uiSettings })
      );
      alert('تم حفظ الكتاب في هذا المتصفح (localStorage).');
    } catch {
      alert('حدث خطأ أثناء الحفظ في المتصفح.');
    }
  };

  // Move page (reorder in sidebar)
  const movePage = (fromIndex, toIndex) => {
    setPages((prevPages) => {
      if (
        !Array.isArray(prevPages) ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prevPages.length ||
        toIndex >= prevPages.length
      ) {
        return prevPages;
      }
      const arr = [...prevPages];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });

    setCurrentPageIndex((prevIndex) => {
      if (prevIndex === fromIndex) return toIndex;
      if (fromIndex < toIndex) {
        if (prevIndex > fromIndex && prevIndex <= toIndex) return prevIndex - 1;
      } else if (fromIndex > toIndex) {
        if (prevIndex >= toIndex && prevIndex < fromIndex) return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  // Book schema helpers
  const buildSchemaFromPages = () => {
    return pages.map((p) => {
      const blocks = Array.isArray(p.blocks) ? p.blocks : [];

      const paragraphs = blocks
        .filter((b) => b.type === 'paragraph' && b.text && b.text.trim().length > 0)
        .map((b) => b.text);

      const bullets = blocks
        .filter((b) => b.type === 'bullets' && Array.isArray(b.items))
        .flatMap((b) => b.items || [])
        .filter((item) => item && item.trim().length > 0);

      const blocksSchema = blocks.map((b) => {
        if (b.type === 'image') {
          return {
            type: 'image',
            src: b.src ? '' : '',
            caption: b.caption || '',
            width: typeof b.width === 'number' ? b.width : 70,
            borderRadius: typeof b.borderRadius === 'number' ? b.borderRadius : 24
          };
        }

        if (b.type === 'space') {
          return {
            type: 'space',
            height: typeof b.height === 'number' ? b.height : 32
          };
        }

        if (b.type === 'bullets') {
          return {
            type: 'bullets',
            title: b.title || p.bulletsTitle || 'المكونات والأدوات المطلوبة',
            items: Array.isArray(b.items) ? b.items : []
          };
        }

        if (b.type === 'question') {
          return {
            type: 'question',
            text: b.text || '',
            note: b.note || ''
          };
        }

        return {
          type: 'paragraph',
          text: b.text || '',
          iconKey: b.iconKey || undefined
        };
      });

      return {
        id: p.id,
        tone: p.tone,
        iconKey: p.iconKey,
        title: p.title,
        sectionTitle: p.sectionTitle,
        subtitle: p.subtitle,
        noHeader: !!p.noHeader,
        paragraphs,
        bullets,
        blocks: blocksSchema
      };
    });
  };

  const handleGenerateSchemaFromPages = () => {
    try {
      const schema = buildSchemaFromPages();
      const text = 'const bookPages = ' + JSON.stringify(schema, null, 2) + ';\n';
      setSchemaText(text);
      setSchemaError('');
    } catch {
      setSchemaError('تعذر توليد المخطط من الصفحات.');
    }
  };

  const handleApplySchemaToPages = () => {
    try {
      let text = (schemaText || '').trim();
      if (!text) {
        setSchemaError('المخطط فارغ.');
        return;
      }

      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start >= 0 && end > start) {
        text = text.slice(start, end + 1);
      }

      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('المخطط يجب أن يكون Array من الصفحات.');
      }

      const newPages = parsed.map((obj) =>
        normalizePage({
          ...obj,
          id: obj.id ?? Date.now(),
          tone: obj.tone || 'blue',
          iconKey: obj.iconKey || 'book',
          title: obj.title || 'صفحة جديدة',
          sectionTitle: obj.sectionTitle || '',
          subtitle: obj.subtitle || '',
          paragraphs: Array.isArray(obj.paragraphs) ? obj.paragraphs : [],
          bullets: Array.isArray(obj.bullets) ? obj.bullets : [],
          noHeader: !!obj.noHeader,
          blocks: Array.isArray(obj.blocks) ? obj.blocks : []
        })
      );

      if (!newPages.length) {
        throw new Error('المخطط لا يحتوي على صفحات.');
      }

      setPages(newPages);
      setCurrentPageIndex(0);
      setSchemaError('');
    } catch (err) {
      setSchemaError(err?.message || 'خطأ في قراءة المخطط. تأكد أنه JSON صحيح.');
    }
  };

  // Print when printMode becomes true
  useEffect(() => {
    if (!printMode) return;

    const handleAfterPrint = () => setPrintMode(false);
    window.addEventListener('afterprint', handleAfterPrint);

    const t = setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      clearTimeout(t);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printMode]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans relative overflow-hidden book-root">
      {/* Print CSS: A4, no white spacing */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            background: #ffffff !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .book-root {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          .print-wrapper {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .a4-sheet {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always;
            break-after: page;
          }

          .a4-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>

      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-sky-600/20 rounded-full blur-[150px]" />
        <CircuitPattern colorClass="text-white" opacity="0.02" />
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 mt-4 relative z-20 no-print">
        <div className="text-white flex items-center gap-4">
          <div className="bg-sky-500/20 p-2.5 rounded-2xl backdrop-blur-md border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Book className="text-sky-400" size={24} />
          </div>
          <div>
            <span className="font-black text-2xl tracking-wide block leading-none">
              {bookMeta.brandName || 'Sparvi Lab'}
            </span>
            <span className="text-sky-400/80 text-sm font-mono tracking-wider block">
              {bookMeta.tagline || 'Digital Lab Manual'}
            </span>
            {bookMeta.ageRange && (
              <span className="text-slate-400 text-xs font-mono">
                Age {bookMeta.ageRange}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Font + Padding Controls */}
       <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl rounded-full p-2 border border-slate-700/50 shadow-2xl">
  {/* Font slider */}
  <div className="flex items-center gap-2 px-2">
    <span className="text-[10px] text-slate-300 font-mono whitespace-nowrap">
      Font {uiSettings.bodyFontPx}px
    </span>
    <input
      type="range"
      min={14}
      max={26}
      value={uiSettings.bodyFontPx}
      onChange={(e) =>
        setUiSettings((p) => ({
          ...p,
          bodyFontPx: Number(e.target.value),
          bodyLinePx: Math.round(Number(e.target.value) * 1.7)
        }))
      }
      className="w-24"
    />
  </div>

  <div className="w-px h-7 bg-slate-700/60" />

  {/* X padding slider */}
  <div className="flex items-center gap-2 px-2">
    <span className="text-[10px] text-slate-300 font-mono whitespace-nowrap">
      Padding {uiSettings.contentPadX}px
    </span>
    <input
      type="range"
      min={32}
      max={90}
      value={uiSettings.contentPadX}
      onChange={(e) =>
        setUiSettings((p) => ({
          ...p,
          contentPadX: Number(e.target.value)
        }))
      }
      className="w-24"
    />
  </div>

  <div className="w-px h-7 bg-slate-700/60" />

  {/* 👇 NEW: gap slider */}
  <div className="flex items-center gap-2 px-2">
    <span className="text-[10px] text-slate-300 font-mono whitespace-nowrap">
      Gap {uiSettings.contentGapPx}px
    </span>
    <input
      type="range"
      min={8}
      max={60}
      value={uiSettings.contentGapPx}
      onChange={(e) =>
        setUiSettings((p) => ({
          ...p,
          contentGapPx: Number(e.target.value)
        }))
      }
      className="w-24"
    />
  </div>
</div>

          {/* Save Button */}
          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-100 font-black shadow-lg shadow-slate-900/40 hover:bg-slate-700 transition-all border border-slate-600/70 text-xs"
          >
            <Sparkles size={16} />
            Save
          </button>

          {/* PDF Button */}
          <button
            onClick={() => setPrintMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all border border-emerald-300/40"
          >
            <FileDown size={18} />
            Generate A4 PDF
          </button>

          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl rounded-full p-2 border border-slate-700/50 shadow-2xl">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0 || totalPages === 0}
              className="w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-700"
            >
              <ChevronRight size={20} />
            </button>

            <div className="px-4 text-center">
              <span className="text-white font-mono font-bold text-xl">
                {totalPages === 0 ? 0 : currentPageIndex + 1}
              </span>
              <span className="text-slate-600 font-mono text-sm mx-2">of</span>
              <span className="text-slate-500 font-mono text-sm">{totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={totalPages === 0 || currentPageIndex === totalPages - 1}
              className="w-11 h-11 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-600/30 transition-all border border-sky-500/50"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* PRINT MODE: render all pages only */}
      {printMode ? (
        <div className="print-wrapper">
          {pages.map((p, idx) => (
            <div key={p.id || idx} className="a4-sheet">
              <PageContent
                page={p}
                pageNumber={idx + 1}
                totalPages={totalPages}
                bookMeta={bookMeta}
                uiSettings={uiSettings}
                printMode={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* NORMAL MODE: full platform layout (sidebar + preview + editor) */}
          <div className="relative w-full max-w-6xl flex-1 flex flex-col lg:flex-row gap-4 z-10 pb-4">
            <BookSidebar
              pages={pages}
              currentIndex={currentPageIndex}
              onSelectPage={setCurrentPageIndex}
              onAddPage={addPage}
              onDuplicatePage={duplicatePage}
              onDeletePage={deletePage}
              canDelete={pages.length > 1}
              bookMeta={bookMeta}
              onBookMetaChange={handleBookMetaChange}
              onReset={resetBook}
              onMovePage={movePage}
            />

            <div className="flex-1 flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex justify-center overflow-y-auto px-2 pb-4">
                {currentPage && (
                  <PageContent
                    page={currentPage}
                    pageNumber={currentPageIndex + 1}
                    totalPages={totalPages}
                    bookMeta={bookMeta}
                    uiSettings={uiSettings}
                  />
                )}
              </div>

              <PageEditorPanel
                page={currentPage}
                onFieldChange={updateCurrentPageField}
                onToneChange={(tone) => updateCurrentPageField('tone', tone)}
                onBlocksChange={updateCurrentPageBlocks}
              />
            </div>
          </div>

          {/* Book Schema Panel */}
          <BookSchemaPanel
            schemaText={schemaText}
            onChangeSchemaText={(val) => {
              setSchemaText(val);
              setSchemaError('');
            }}
            onGenerateFromPages={handleGenerateSchemaFromPages}
            onApplyToPages={handleApplySchemaToPages}
            error={schemaError}
          />
        </>
      )}
    </div>
  );
};

export default BilingualBook;
