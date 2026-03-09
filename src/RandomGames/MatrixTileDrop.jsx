import React, { useEffect, useRef, useState } from 'react';
import { 
  Code, Cpu, Layout, Gamepad2, Sparkles, Download, 
  Loader2, Type, Layers, Palette, Brain, Smartphone, 
  Monitor, Database, Cloud, BookOpen, Calculator, PenTool, 
  Lightbulb, Compass, Globe, Beaker, Atom, Rocket, Star, 
  Trophy, Target, Puzzle, Paintbrush, Music, Video, Camera, 
  Mic, Headphones, Heart, Zap, Shield, Key, Lock, Briefcase, 
  GraduationCap, Users, Code2, Terminal, Bot
} from 'lucide-react';

// قاموس الأيقونات المتاحة للاختيار
const AVAILABLE_ICONS = {
  Code, Code2, Terminal, Cpu, Brain, Bot, Layout, Smartphone, 
  Monitor, Gamepad2, Database, Cloud, BookOpen, Calculator, 
  PenTool, Paintbrush, Lightbulb, Compass, Globe, Beaker, 
  Atom, Rocket, Star, Trophy, Target, Puzzle, Music, Video, 
  Camera, Mic, Headphones, Heart, Zap, Shield, Key, Lock, 
  Briefcase, GraduationCap, Users, Sparkles
};

const Post = () => {
  const postRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'cards'
  
  const [content, setContent] = useState({
    subtitle: 'من 6 ل 18 سنه',
    title: 'ابنك ممكن يتعلم ايه ؟',
    cta: 'احجز حصة مجانية وخليه يجرب بنفسه',
    cards: [
      {
        title: 'برمجه',
        desc: 'يكتب أول كود ويفكر بطريقة صحيحة',
        titleSize: 24,
        descSize: 22,
        iconName: 'Code'
      },
      {
        title: 'ذكاء\nاصطناعي',
        desc: 'يفهم إزاي التكنولوجيا الذكية بتشتغل مش بس يستخدمها',
        titleSize: 24,
        descSize: 22,
        iconName: 'Brain'
      },
      {
        title: 'تصميم\nالتطبيقات',
        desc: 'يحوّل أفكاره لتصميمات وتطبيقات حقيقية',
        titleSize: 24,
        descSize: 22,
        iconName: 'Smartphone'
      },
      {
        title: 'تطوير\nالعاب',
        desc: 'يبني لعبته بنفسه مش بس يلعبها',
        titleSize: 24,
        descSize: 22,
        iconName: 'Gamepad2'
      }
    ]
  });
  
  const [sizes, setSizes] = useState({
    subtitle: 32,
    title: 56,
    cta: 32
  });

  // Smart Scaling
  useEffect(() => {
    const updateScale = () => {
      const isDesktop = window.innerWidth >= 1024;
      const availableWidth = isDesktop ? window.innerWidth - 400 - 64 : window.innerWidth - 32;
      const availableHeight = isDesktop ? window.innerHeight - 100 : window.innerHeight - 350; 
      
      const scaleW = availableWidth / 1080;
      const scaleH = availableHeight / 1080;
      const minScale = Math.min(scaleW, scaleH, 1);
      
      setScale(minScale > 0.1 ? minScale : 0.1); 
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Inject Google Font properly for html-to-image
  useEffect(() => {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';

    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(preconnect1)) document.head.removeChild(preconnect1);
      if (document.head.contains(preconnect2)) document.head.removeChild(preconnect2);
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // --- EXPORT LOGIC ---
  const handleExport = async () => {
    if (!postRef.current || !window.htmlToImage) {
      alert("يرجى الانتظار حتى يتم تحميل أدوات التصدير...");
      return;
    }
    
    setIsExporting(true);
    
    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 800));

      const dataUrl = await window.htmlToImage.toPng(postRef.current, {
        quality: 1.0,
        pixelRatio: 2, 
        cacheBust: true,
        style: {
          transform: 'none', 
          margin: 0
        }
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = 'iSchool-Instagram-HQ.png';
      downloadLink.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("حدث خطأ أثناء تصدير الصورة.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateCard = (index, patch) => {
    setContent((prev) => {
      const nextCards = prev.cards.map((card, idx) => {
        if (idx !== index) return card;
        return { ...card, ...patch };
      });
      return { ...prev, cards: nextCards };
    });
  };

  const renderLines = (text) =>
    text.split('\n').map((line, index) => (
      <span key={`${line}-${index}`}>
        {line}
        {index < text.split('\n').length - 1 ? <br /> : null}
      </span>
    ));

  const ControlField = ({ label, value, onChange, isTextarea = false, sizeLabel, sizeValue, onSizeChange, minSize, maxSize }) => (
    <div className="mb-5 bg-[#1E293B] p-4 rounded-xl border border-white/5 shadow-sm">
      <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      {isTextarea ? (
        <textarea
          rows={2}
          className="w-full rounded-lg bg-[#0F172A] border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-slate-500"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full rounded-lg bg-[#0F172A] border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
          value={value}
          onChange={onChange}
        />
      )}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
        <label className="text-xs font-medium text-slate-400 whitespace-nowrap min-w-[90px]">{sizeLabel}</label>
        <input
          type="range"
          min={minSize}
          max={maxSize}
          className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          value={sizeValue}
          onChange={onSizeChange}
        />
        <span className="text-xs font-mono bg-[#0F172A] px-2 py-1 rounded text-blue-400 min-w-[36px] text-center border border-slate-700">{sizeValue}</span>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#0F172A] text-slate-200 flex flex-col lg:flex-row font-cairo overflow-hidden selection:bg-blue-500/30">
      
      {/* 1. SIDEBAR EDITOR PANEL */}
      <aside className="w-full lg:w-[400px] h-[40vh] lg:h-screen bg-[#141E33] border-l border-slate-800 flex flex-col z-20 shadow-2xl shrink-0 order-2 lg:order-1" dir="rtl">
        <div className="p-5 border-b border-slate-800 bg-[#1E293B]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">استوديو iSchool</h1>
            <p className="text-xs text-slate-400">محرر منشورات انستجرام</p>
          </div>
        </div>

        <div className="flex p-3 gap-2 border-b border-slate-800 bg-[#141E33]">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'}`}
          >
            <Type className="w-4 h-4" />
            النصوص الأساسية
          </button>
          <button 
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'}`}
          >
            <Layers className="w-4 h-4" />
            محتوى الكروت
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'general' ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ControlField
                label="السطر العلوي (الافتتاحي)"
                value={content.subtitle}
                onChange={(e) => setContent(p => ({ ...p, subtitle: e.target.value }))}
                sizeLabel="حجم السطر العلوي"
                sizeValue={sizes.subtitle}
                onSizeChange={(e) => setSizes(p => ({ ...p, subtitle: Number(e.target.value) }))}
                minSize={16} maxSize={60}
              />
              <ControlField
                label="العنوان الرئيسي"
                isTextarea={true}
                value={content.title}
                onChange={(e) => setContent(p => ({ ...p, title: e.target.value }))}
                sizeLabel="حجم العنوان الرئيسي"
                sizeValue={sizes.title}
                onSizeChange={(e) => setSizes(p => ({ ...p, title: Number(e.target.value) }))}
                minSize={24} maxSize={80}
              />
              <ControlField
                label="زر الدعوة للإجراء (CTA)"
                value={content.cta}
                onChange={(e) => setContent(p => ({ ...p, cta: e.target.value }))}
                sizeLabel="حجم نص الزر"
                sizeValue={sizes.cta}
                onSizeChange={(e) => setSizes(p => ({ ...p, cta: Number(e.target.value) }))}
                minSize={18} maxSize={50}
              />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {content.cards.map((card, index) => (
                <div key={`card-editor-${index}`} className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden shadow-sm">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-white/5 flex items-center gap-2 text-sm font-bold text-white">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs">{index + 1}</span>
                    الكارت رقم {index + 1}
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Icon Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">اختر الأيقونة</label>
                      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar bg-[#0F172A] p-2 rounded-lg border border-slate-700">
                        {Object.keys(AVAILABLE_ICONS).map(iconKey => {
                          const IconCmp = AVAILABLE_ICONS[iconKey];
                          return (
                            <button
                              key={iconKey}
                              onClick={() => updateCard(index, { iconName: iconKey })}
                              title={iconKey}
                              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                                card.iconName === iconKey 
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                                  : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                              }`}
                            >
                              <IconCmp className="w-[18px] h-[18px]" />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الكارت</label>
                      <input
                        className="w-full rounded-lg bg-[#0F172A] border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={card.title}
                        onChange={(e) => updateCard(index, { title: e.target.value })}
                      />
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">الحجم</span>
                        <input type="range" min={16} max={40} className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" value={card.titleSize} onChange={(e) => updateCard(index, { titleSize: Number(e.target.value) })} />
                        <span className="text-xs text-blue-400 w-6 text-center">{card.titleSize}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">وصف الكارت</label>
                      <textarea
                        rows={2}
                        className="w-full rounded-lg bg-[#0F172A] border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                        value={card.desc}
                        onChange={(e) => updateCard(index, { desc: e.target.value })}
                      />
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">الحجم</span>
                        <input type="range" min={14} max={36} className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" value={card.descSize} onChange={(e) => updateCard(index, { descSize: Number(e.target.value) })} />
                        <span className="text-xs text-blue-400 w-6 text-center">{card.descSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN CANVAS AREA */}
      <main className="flex-1 h-[60vh] lg:h-screen flex flex-col relative order-1 lg:order-2 bg-[#0B1120]">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="h-16 border-b border-slate-800/60 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            معاينة حية (1080x1080)
          </div>
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
            dir="rtl"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'جاري التحضير...' : 'تصدير التصميم'}</span>
          </button>
        </div>

        <div className="flex-1 w-full overflow-hidden flex items-center justify-center relative z-0 p-4 lg:p-8">
          
          {isExporting && (
            <div className="absolute inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold font-cairo" dir="rtl">جاري استخراج الصورة بدقة عالية...</h3>
              <p className="text-slate-400 mt-2 font-cairo" dir="rtl">يرجى الانتظار لحظات</p>
            </div>
          )}

          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="w-[1080px] h-[1080px] flex-shrink-0 relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out">
            <div 
              ref={postRef}
              dir="rtl"
              className="relative w-[1080px] h-[1080px] bg-gradient-to-b from-[#0047E1] via-[#0A5CF0] to-[#043CB7] rounded-[3rem] overflow-hidden flex flex-col border border-white/10 shrink-0"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <div className="absolute top-32 left-12 grid grid-cols-4 gap-3 opacity-30">
                {[...Array(24)].map((_, i) => (
                  <div key={`dot-tl-${i}`} className="w-2.5 h-2.5 bg-white rounded-full"></div>
                ))}
              </div>
              <div className="absolute bottom-40 right-12 grid grid-cols-4 gap-3 opacity-30">
                {[...Array(24)].map((_, i) => (
                  <div key={`dot-br-${i}`} className="w-2.5 h-2.5 bg-white rounded-full"></div>
                ))}
              </div>

              <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-[radial-gradient(ellipse_at_center,_rgba(77,144,255,0.4)_0%,_rgba(77,144,255,0)_70%)] pointer-events-none z-0"></div>

              <div className="relative z-10 flex flex-col items-center pt-10 pb-12 px-12 h-full">
                
                <div className="w-full flex justify-start mb-10 px-6 mt-4">
                  <div dir="ltr" className="flex items-center text-white text-[44px] font-black italic tracking-tighter drop-shadow-md">
                    <span className="text-orange-500 mr-1 text-[56px]">i</span>School
                    <span className="text-white text-xl align-top ml-1 relative -top-6">®</span>
                  </div>
                </div>

                <div className="text-center mb-14 relative w-full">
                  <h2 className="text-white font-bold mb-3 tracking-wide drop-shadow-sm" style={{ fontSize: sizes.subtitle }}>
                    {content.subtitle}
                  </h2>
                  <div className="relative inline-block">
                    <h1 className="text-[#FFD700] font-black drop-shadow-md pb-2 leading-tight" style={{ fontSize: sizes.title }}>
                      {renderLines(content.title)}
                    </h1>
                    <Sparkles className="absolute -top-6 -left-12 w-12 h-12 text-[#FFD700] fill-[#FFD700] opacity-80 animate-pulse" />
                    <div className="absolute top-2 -right-6 w-4 h-4 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700] animate-pulse"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-8 w-full mx-auto flex-grow justify-center pb-6">
                  {content.cards.map((card, index) => {
                    const iconBgs = [
                      "bg-gradient-to-br from-purple-400 to-indigo-600",
                      "bg-gradient-to-br from-blue-700 to-blue-900",
                      "bg-white",
                      "bg-gradient-to-br from-blue-500 to-blue-700"
                    ];
                    const iconBorders = [
                      "",
                      "border-[1.5px] border-yellow-400/50",
                      "",
                      ""
                    ];
                    
                    // Render the dynamically selected icon
                    const DynamicIcon = AVAILABLE_ICONS[card.iconName] || AVAILABLE_ICONS.Sparkles;
                    // Fix color for the white background card
                    const iconColorClass = iconBgs[index] === "bg-white" ? "text-[#0047E1]" : "text-white";

                    return (
                      <FeatureCard
                        key={`card-${index}`}
                        title={card.title}
                        desc={card.desc}
                        icon={<DynamicIcon className={`w-12 h-12 ${iconColorClass}`} />}
                        iconBg={iconBgs[index]}
                        iconBorder={iconBorders[index]}
                        titleSize={card.titleSize}
                        descSize={card.descSize}
                      />
                    );
                  })}
                </div>

                <button className="relative group w-[850px] mt-auto mb-4">
                  <div className="absolute inset-0 bg-[#FF6B00] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_35px_rgba(255,107,0,0.6)]"></div>
                  <div className="relative w-full bg-[#FF6B00] hover:bg-[#FF7A1A] text-white font-bold py-6 px-8 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-colors duration-300 flex items-center justify-center leading-none" style={{ fontSize: sizes.cta }}>
                    {content.cta}
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #141E33;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon, iconBg, iconBorder = "", titleSize = 24, descSize = 22 }) => {
  return (
    <div className="relative w-[850px] mx-auto bg-gradient-to-l from-[#196BFF]/60 to-[#438BFF]/30 rounded-full border border-blue-400/30 shadow-lg h-[110px]">
      
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[140px] h-[140px] bg-[#102D82] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] border-[3px] border-blue-500/30 z-10">
        <span className="text-white font-bold text-center leading-tight drop-shadow-md px-2" style={{ fontSize: titleSize }}>
          {title.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < title.split('\n').length - 1 ? <br /> : null}
            </span>
          ))}
        </span>
      </div>

      <div className="w-full h-full flex items-center pr-[160px] pl-[100px]">
        <p className="text-white font-semibold leading-relaxed drop-shadow-sm text-right w-full" style={{ fontSize: descSize }}>
          {desc}
        </p>
      </div>

      <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10">
        <div className={`w-[90px] h-[90px] rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 ${iconBg} ${iconBorder}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Post;