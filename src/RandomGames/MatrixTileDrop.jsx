import React, { useEffect, useRef, useState } from 'react';
import { Code, Cpu, Layout, Gamepad2, Sparkles, Download, Loader2 } from 'lucide-react';

const Post = () => {
  const postRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);

  // Smart Scaling: Calculates how much to visually scale down the 1080x1080 canvas to fit the user's screen
  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const scaleW = (screenWidth - 40) / 1080;
      const scaleH = (screenHeight - 150) / 1080;
      const minScale = Math.min(scaleW, scaleH, 1);
      setScale(minScale > 0.1 ? minScale : 0.1); 
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Inject Google Font and the superior html-to-image library
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Swapped html2canvas for html-to-image which perfectly supports RTL, SVGs, and absolute layouts
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleExport = async () => {
    if (!postRef.current || !window.htmlToImage) {
      alert("يرجى الانتظار حتى يتم تحميل أدوات التصدير...");
      return;
    }
    
    setIsExporting(true);
    
    try {
      await document.fonts.ready;
      
      // Add a tiny delay to guarantee layout is perfectly painted before snapshot
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use html-to-image to generate a flawless 2x pixel ratio export
      const dataUrl = await window.htmlToImage.toPng(postRef.current, {
        quality: 1.0,
        pixelRatio: 2, // 2160x2160 output
        cacheBust: true,
        style: {
          transform: 'none', // Prevents CSS scaling bugs in the final image
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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Action Bar */}
      <div className="w-full flex justify-center mb-6" dir="rtl">
        <div style={{ width: `${1080 * scale}px` }} className="flex justify-end">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExporting ? 'جاري تصدير الصورة...' : 'تصدير بجودة عالية'}</span>
          </button>
        </div>
      </div>

      {/* Scaled Wrapper */}
      <div className="w-full flex justify-center" style={{ height: `${1080 * scale}px` }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} className="w-[1080px]">
          
          {/* Main Post Container - FIXED 1080x1080 SIZE */}
          <div 
            ref={postRef}
            dir="rtl"
            className="relative w-[1080px] h-[1080px] bg-gradient-to-b from-[#0047E1] via-[#0A5CF0] to-[#043CB7] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/10 shrink-0"
          >
            {/* Background Decorative Dots */}
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

            {/* Bottom glowing light */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-[radial-gradient(ellipse_at_center,_rgba(77,144,255,0.4)_0%,_rgba(77,144,255,0)_70%)] pointer-events-none z-0"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center pt-10 pb-12 px-12 h-full">
              
              {/* Logo */}
              <div className="w-full flex justify-start mb-10 px-6 mt-4">
                <div dir="ltr" className="flex items-center text-white text-[44px] font-black italic tracking-tighter drop-shadow-md">
                  <span className="text-orange-500 mr-1 text-[56px]">i</span>School
                  <span className="text-white text-xl align-top ml-1 relative -top-6">®</span>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center mb-14 relative w-full">
                <h2 className="text-white text-[32px] font-bold mb-3 tracking-wide drop-shadow-sm">
                  من 6 ل 18 سنه
                </h2>
                <div className="relative inline-block">
                  <h1 className="text-[#FFD700] text-[56px] font-black drop-shadow-md pb-2">
                    ابنك ممكن يتعلم ايه ؟
                  </h1>
                  <Sparkles className="absolute -top-6 -left-12 w-12 h-12 text-[#FFD700] fill-[#FFD700] opacity-80 animate-pulse" />
                  <div className="absolute top-2 -right-6 w-4 h-4 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700] animate-pulse"></div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-8 w-full mx-auto flex-grow justify-center pb-6">
                <FeatureCard 
                  title="برمجه" 
                  desc="يكتب أول كود ويفكر بطريقة صحيحة" 
                  icon={<Code className="w-12 h-12 text-white" />} 
                  iconBg="bg-gradient-to-br from-purple-400 to-indigo-600"
                />
                
                <FeatureCard 
                  title={<>ذكاء<br/>اصطناعي</>} 
                  desc="يفهم إزاي التكنولوجيا الذكية بتشتغل مش بس يستخدمها" 
                  icon={<Cpu className="w-12 h-12 text-white" />} 
                  iconBg="bg-gradient-to-br from-blue-700 to-blue-900"
                  iconBorder="border-[1.5px] border-yellow-400/50"
                />
                
                <FeatureCard 
                  title={<>تصميم<br/>التطبيقات</>} 
                  desc="يحوّل أفكاره لتصميمات وتطبيقات حقيقية" 
                  icon={<Layout className="w-12 h-12 text-[#0047E1]" />} 
                  iconBg="bg-white"
                />
                
                <FeatureCard 
                  title={<>تطوير<br/>العاب</>} 
                  desc="يبني لعبته بنفسه مش بس يلعبها" 
                  icon={<Gamepad2 className="w-12 h-12 text-white" />} 
                  iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
                />
              </div>

              {/* CTA Button */}
              <button className="relative group w-[850px] mt-auto mb-4">
                <div className="absolute inset-0 bg-[#FF6B00] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_35px_rgba(255,107,0,0.6)]"></div>
                <div className="relative w-full bg-[#FF6B00] hover:bg-[#FF7A1A] text-white text-[32px] font-bold py-6 px-8 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-colors duration-300 flex items-center justify-center">
                  احجز حصة مجانية وخليه يجرب بنفسه
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rebuilt Card Component: Uses absolute positioning instead of negative margins to prevent export bugs
const FeatureCard = ({ title, desc, icon, iconBg, iconBorder = "" }) => {
  return (
    <div className="relative w-[850px] mx-auto bg-gradient-to-l from-[#196BFF]/60 to-[#438BFF]/30 rounded-full border border-blue-400/30 shadow-lg h-[110px]">
      
      {/* Right dark circle (Absolutely Positioned) */}
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[140px] h-[140px] bg-[#102D82] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] border-[3px] border-blue-500/30 z-10">
        <span className="text-white font-bold text-[24px] text-center leading-tight drop-shadow-md px-2">
          {title}
        </span>
      </div>

      {/* Text Box Container */}
      <div className="w-full h-full flex items-center pr-[160px] pl-[100px]">
        <p className="text-white text-[22px] font-semibold leading-relaxed drop-shadow-sm text-right w-full">
          {desc}
        </p>
      </div>

      {/* Left Icon (Absolutely Positioned) */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10">
        <div className={`w-[90px] h-[90px] rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 ${iconBg} ${iconBorder}`}>
          {icon}
        </div>
      </div>
      
    </div>
  );
};

export default Post;