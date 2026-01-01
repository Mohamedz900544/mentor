import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  X, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  MapPin, 
  Box, 
  Briefcase,
  Brain,
  Award,
  Zap,
  Clock,
  Share2,
  DollarSign,
  Target,
  ShieldAlert,
  Search,
  Flame,
  Unlock,
  Globe,
  Coins,
  Layers,
  Flag
} from 'lucide-react';

// --- Data & Content ---

const bookData = {
  title: "The Entrepreneur's Blueprint",
  subtitle: "Roadmap & Strategies",
  author: "Course Notes",
  chapters: [
    {
      id: "intro",
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Preface</h2>
          <p className="text-lg leading-relaxed text-gray-700 font-serif">
            This digital book compiles the essential notes from the Entrepreneurship & Business Fundamentals course. 
            It is designed to serve as a quick reference guide for the journey from idea to execution.
          </p>
          <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-600 rounded-r-lg">
            <h3 className="font-bold text-amber-800 uppercase tracking-wide text-sm mb-2">Key Theme</h3>
            <p className="italic text-gray-700 font-serif text-xl">
              "It's not just a small business—it's an ecosystem."
            </p>
          </div>
        </div>
      )
    },
    {
      id: "roadmap",
      title: "Chapter 1: The Roadmap",
      content: (
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">The 20-Step Journey</h2>
          <p className="text-gray-600 font-serif italic mb-6">
            A comprehensive path from the initial motive to long-term sustainability.
          </p>
          
          {/* Phase 1 */}
          <div className="relative border-l-4 border-blue-200 pl-6 pb-2">
            <h3 className="text-xl font-bold text-blue-800 mb-4 uppercase tracking-wider">Phase 1: Discovery & Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "1. The Motive", "2. The Exploration", "3. The Bigger Picture / Market", 
                "4. The Options: Big Roads", "5. The Options: Narrow Path", 
                "6. The Assessment", "7. Testing The Waters", "8. The Set Up"
              ].map((step, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm border border-blue-100 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">{i+1}</div>
                  <span className="text-gray-700 font-medium text-sm">{step.split('. ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative border-l-4 border-purple-200 pl-6 pb-2">
            <h3 className="text-xl font-bold text-purple-800 mb-4 uppercase tracking-wider">Phase 2: Execution & Launch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                 "9. The Iterative Game", "10. Dimensions Planning", "11. The Options: Format",
                 "12. The Alliances", "13. Risks & Mitigation", "14. Money Matters",
                 "15. The Birth (Launch)", "16. Challenges"
              ].map((step, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm border border-purple-100 flex items-center">
                   <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-3">{i+9}</div>
                  <span className="text-gray-700 font-medium text-sm">{step.split('. ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative border-l-4 border-amber-200 pl-6 pb-2">
            <h3 className="text-xl font-bold text-amber-800 mb-4 uppercase tracking-wider">Phase 3: Growth & Evolution</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                 "17. Turning Points", "18. The Second Wind", 
                 "19. The Sustainability", "20. The Options: Big Roads"
              ].map((step, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm border border-amber-100 flex items-center">
                   <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold mr-3">{i+17}</div>
                  <span className="text-gray-700 font-medium text-sm">{step.split('. ')[1]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-400 italic">
              * Note: Step 20 returns to "Big Roads", implying expansion or exit strategies.
            </div>
          </div>
        </div>
      )
    },
    {
      id: "motive",
      title: "Chapter 2: The Motive",
      content: (
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <Target size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-800">The "Why"</h2>
              <p className="text-gray-500">Deep dive into Step 1 of the Roadmap.</p>
            </div>
          </div>

          <p className="text-lg text-gray-700 font-serif">
            A successful venture starts with a powerful driver. There are 6 primary motives that push an entrepreneur to break barriers.
          </p>

          <div className="space-y-4">
            {/* 1. Burning Fire */}
            <div className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border border-red-100 transform hover:scale-[1.02] transition-transform">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
                  <Flame size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">1. Burning Fire</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  Passion, obsession, or an urgent problem that you personally need to solve. This is the internal fuel.
                </p>
              </div>
            </div>

            {/* 2. Untapped Potential */}
            <div className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Unlock size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">2. Untapped Potential</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  Realizing there are skills, talents, or capabilities currently being wasted that could be monetized.
                </p>
              </div>
            </div>

            {/* 3. Open Market */}
            <div className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Globe size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">3. Open Market</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  Finding a "Blue Ocean"—a gap in the market with high demand and low/zero competition.
                </p>
              </div>
            </div>

             {/* 4. Abundance of Funding */}
             <div className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <Coins size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">4. Abundance of Funding</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  Starting because capital is readily available (investors, grants, family) to back the idea.
                </p>
              </div>
            </div>

            {/* 5. Unused Resources */}
             <div className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Layers size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">5. Unused Resources</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  Leveraging assets that are sitting idle (e.g., empty real estate, patents, machinery).
                </p>
              </div>
            </div>

             {/* 6. Time of Local Power */}
             <div className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  <Flag size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">6. Time of Local Power</h3>
                <p className="text-gray-600 font-serif text-sm mt-1">
                  A favorable climate for local businesses to thrive over global giants (e.g., "Buy Local" trends).
                </p>
              </div>
            </div>

          </div>
        </div>
      )
    },
    {
      id: "strategy",
      title: "Chapter 3: Strategy & Mindset",
      content: (
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-gray-800">The Golden Rule</h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center py-6">
            <div className="bg-white shadow-md p-6 rounded-lg text-center border border-gray-100 flex-1 w-full transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <span className="text-5xl mb-4 block">🌱</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Start Small</h3>
              <p className="text-gray-600">Don't overcommit resources early.</p>
            </div>
            <div className="text-gray-400 font-bold text-xl">vs</div>
            <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-200 flex-1 w-full opacity-70">
              <span className="text-5xl mb-4 block grayscale">🏢</span>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Start Big</h3>
              <p className="text-gray-500">"Big projects have bigger problems."</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8">Psychological Traps</h3>
            <p className="text-gray-700 font-serif">Entering a new market is like entering unknown territory. Be aware of:</p>
            
            <ul className="space-y-4 mt-4">
              <li className="flex items-start bg-red-50 p-4 rounded-lg">
                <div className="bg-red-100 text-red-600 p-2 rounded-full mr-4 mt-1">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-red-900">1. Deceiving Starts</h4>
                  <p className="text-gray-700 text-sm">Excessive enthusiasm can blind you to risks. (Arabic: <em>حماس زائد</em>)</p>
                </div>
              </li>
              <li className="flex items-start bg-green-50 p-4 rounded-lg">
                <div className="bg-green-100 text-green-600 p-2 rounded-full mr-4 mt-1">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">2. Beginner's Luck</h4>
                  <p className="text-gray-700 text-sm">Early success doesn't guarantee future stability. (Arabic: <em>حظ المبتدئين</em>)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "pillars",
      title: "Chapter 4: The 15 Pillars",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">The Business Ecosystem</h2>
          <p className="text-gray-700 font-serif mb-6">
            A comprehensive checklist of the 15 components required to run a successful operation.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { num: 1, name: "Marketing", icon: <TrendingUp size={18} /> },
              { num: 2, name: "Sales", icon: <Briefcase size={18} /> },
              { num: 3, name: "Service", icon: <Users size={18} /> },
              { num: 4, name: "Customers", icon: <Users size={18} /> },
              { num: 5, name: "Competitors", icon: <Award size={18} /> },
              { num: 6, name: "The Place", icon: <MapPin size={18} /> },
              { num: 7, name: "Licenses", icon: <Award size={18} /> },
              { num: 8, name: "Supplier", icon: <Box size={18} /> },
              { num: 9, name: "Distribution", icon: <MapPin size={18} /> },
              { num: 10, name: "Storage", icon: <Box size={18} /> },
              { num: 11, name: "People", icon: <Users size={18} /> },
              { num: 12, name: "Taxes", icon: <Briefcase size={18} /> },
              { num: 13, name: "Resources", icon: <Box size={18} /> },
              { num: 14, name: "Money", icon: <Briefcase size={18} /> },
              { num: 15, name: "Production", icon: <Box size={18} /> }
            ].map((pillar) => (
              <div key={pillar.num} className="flex items-center p-3 bg-white border border-stone-200 rounded shadow-sm hover:shadow-md transition-shadow">
                <span className="font-mono text-stone-400 text-sm mr-3">#{pillar.num}</span>
                <span className="text-stone-500 mr-2">{pillar.icon}</span>
                <span className="font-semibold text-gray-800">{pillar.name}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "traits",
      title: "Chapter 5: The Mindset",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Traits of Successful Entrepreneurs</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-stone-50 p-5 rounded-lg border-l-4 border-stone-400">
               <h3 className="font-bold text-stone-800 flex items-center gap-2">
                 <Brain size={20} /> Cognitive Skills
               </h3>
               <ul className="mt-3 space-y-2 text-stone-700 font-serif">
                 <li>• <strong>Focus:</strong> Ability to concentrate on the goal.</li>
                 <li>• <strong>Analysis:</strong> Breaking down complex problems.</li>
                 <li>• <strong>Creativity:</strong> Thinking outside the box.</li>
                 <li>• <strong>Learning Agility:</strong> Fast adaptation.</li>
               </ul>
             </div>

             <div className="bg-stone-50 p-5 rounded-lg border-l-4 border-stone-400">
               <h3 className="font-bold text-stone-800 flex items-center gap-2">
                 <Briefcase size={20} /> Operational Skills
               </h3>
               <ul className="mt-3 space-y-2 text-stone-700 font-serif">
                 <li>• <strong>Multitasking:</strong> Flexibility.</li>
                 <li>• <strong>Project Management:</strong> Scope, Cost, Time.</li>
                 <li>• <strong>Business Acumen:</strong> Knowing how money is made.</li>
               </ul>
             </div>
          </div>
        </div>
      )
    },
    {
      id: "learning",
      title: "Chapter 6: Learning Model",
      content: (
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-gray-800">The 70:20:10 Model</h2>
          
          <div className="relative pt-6 pb-2">
            <div className="flex mb-2 items-center justify-between font-bold text-sm text-gray-600">
              <span>Experiential (70%)</span>
              <span>Social (20%)</span>
              <span>Formal (10%)</span>
            </div>
            <div className="h-6 flex rounded-full overflow-hidden shadow-inner">
              <div className="w-[70%] bg-amber-500 flex items-center justify-center text-white text-xs font-bold">70%</div>
              <div className="w-[20%] bg-amber-300 flex items-center justify-center text-amber-900 text-xs font-bold">20%</div>
              <div className="w-[10%] bg-amber-100 flex items-center justify-center text-amber-900 text-xs font-bold">10%</div>
            </div>
          </div>
          
           <div className="mt-4 p-4 bg-stone-100 rounded text-center italic font-serif text-stone-600">
            "The inquisitive mind searches for facts and learns."
          </div>
        </div>
      )
    },
    {
      id: "skills",
      title: "Chapter 7: Essential Skills",
      content: (
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Core Competencies</h2>

          {/* Project Management */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-amber-600" /> 1. Project Management
            </h3>
            <p className="text-stone-600 mb-4 font-serif">The "Iron Triangle": Scope, Cost, and Time determining Quality.</p>
          </div>

          {/* Business Acumen */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" /> 2. Business Acumen
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
               <div className="p-3 bg-stone-50 rounded">
                 <span className="block text-xs font-bold text-stone-400 uppercase">Revenue</span>
                 <span className="font-serif font-bold text-stone-800">Vanity</span>
               </div>
               <div className="p-3 bg-amber-50 rounded">
                 <span className="block text-xs font-bold text-amber-600 uppercase">Profit</span>
                 <span className="font-serif font-bold text-amber-900">Sanity</span>
               </div>
               <div className="p-3 bg-green-50 rounded col-span-2">
                 <span className="block text-xs font-bold text-green-600 uppercase">Cash Flow</span>
                 <span className="font-serif font-bold text-green-900">Reality</span>
               </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "analysis",
      title: "Chapter 8: Strategic Analysis",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6">Planning Tools</h2>

          {/* SWOT */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-red-600" /> SWOT Analysis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h4 className="font-bold text-green-800 mb-2">Strengths (Internal)</h4>
              </div>
              <div className="bg-red-50 p-4 rounded border border-red-100">
                <h4 className="font-bold text-red-800 mb-2">Weaknesses (Internal)</h4>
              </div>
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2">Opportunities (External)</h4>
              </div>
              <div className="bg-amber-50 p-4 rounded border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2">Threats (External)</h4>
              </div>
            </div>
          </div>
           {/* Risk */}
           <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="text-orange-600" /> Risk Management
            </h3>
             <p className="text-stone-600 font-serif bg-stone-50 p-4 rounded border-l-4 border-stone-400">
               Categorize risks by <span className="font-bold">Probability</span> vs <span className="font-bold">Impact</span>.
             </p>
           </div>
        </div>
      )
    }
  ]
};

// --- Components ---

const Cover = ({ onOpen }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 bg-[#2c3e50] text-white rounded-r-lg shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
       <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
    </div>
    <div className="border-4 border-double border-amber-500/30 p-8 w-full h-full flex flex-col items-center justify-center rounded">
        <div className="mb-8 text-amber-500 opacity-80">
          <Book size={64} strokeWidth={1} />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-center mb-4 tracking-wider">
          {bookData.title}
        </h1>
        <div className="w-24 h-1 bg-amber-500 mb-6"></div>
        <p className="text-xl md:text-2xl font-light text-gray-300 text-center uppercase tracking-widest mb-12">
          {bookData.subtitle}
        </p>
        <p className="mt-auto text-gray-400 font-mono text-sm">Est. 2025</p>
        
        <button 
          onClick={onOpen}
          className="mt-12 group flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-amber-500/20"
        >
          <span>Open Book</span>
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
    </div>
  </div>
);

const PageNumber = ({ current, total }) => (
  <div className="absolute bottom-6 w-full text-center text-xs font-mono text-gray-400 pointer-events-none">
    Page {current} of {total}
  </div>
);

const TableOfContents = ({ chapters, onSelect, onClose }) => (
  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-8 flex flex-col animate-fadeIn">
    <div className="flex justify-between items-center mb-8 border-b pb-4">
      <h2 className="text-2xl font-serif font-bold text-gray-800">Table of Contents</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X size={24} />
      </button>
    </div>
    <div className="space-y-4 overflow-y-auto max-h-[70vh]">
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          onClick={() => onSelect(index + 1)} // +1 because 0 is cover
          className="w-full text-left group p-4 hover:bg-amber-50 rounded-lg transition-all flex items-baseline justify-between border-b border-gray-100 hover:border-amber-200"
        >
          <span className="text-lg font-serif text-gray-700 group-hover:text-amber-900 font-medium">
            {chapter.title}
          </span>
          <span className="text-sm font-mono text-gray-400 group-hover:text-amber-600">
            pg. {index + 1}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState(0); // 0 = Cover
  const [showTOC, setShowTOC] = useState(false);
  const totalPages = bookData.chapters.length; 

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(c => c + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(c => c - 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Current Content Logic
  // Page 0 = Cover
  // Page 1...N = Chapters
  const currentChapter = currentPage > 0 ? bookData.chapters[currentPage - 1] : null;

  return (
    <div className="min-h-screen bg-[#f3f2ea] flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Book Container */}
      <div className="relative w-full max-w-4xl h-[85vh] md:h-[800px] bg-white rounded-lg shadow-2xl flex overflow-hidden perspective-1000">
        
        {/* Spine visual for large screens */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-300 to-white z-10 opacity-50"></div>

        {currentPage === 0 ? (
          <div className="w-full h-full animate-fadeIn">
            <Cover onOpen={() => setCurrentPage(1)} />
          </div>
        ) : (
          <>
            {/* Header / Nav Bar inside book */}
            <div className="absolute top-0 left-0 right-0 h-16 px-6 md:px-12 flex items-center justify-between z-10 bg-white/80 backdrop-blur border-b border-stone-100">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                {bookData.title}
              </span>
              <button 
                onClick={() => setShowTOC(true)}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors px-3 py-1 rounded hover:bg-stone-100"
              >
                <Menu size={18} />
                <span className="text-xs font-bold uppercase tracking-wide">Index</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="w-full h-full pt-20 pb-20 px-6 md:px-16 overflow-y-auto custom-scrollbar bg-[#fffbf7]">
              <div className="max-w-2xl mx-auto animate-slideUp">
                {currentChapter && (
                  <>
                      <div className="mb-8 pb-4 border-b-2 border-amber-100">
                         <span className="text-amber-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                           Chapter {currentPage}
                         </span>
                      </div>
                      <div className="prose prose-stone prose-lg max-w-none">
                        {currentChapter.content}
                      </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer / Navigation Controls */}
            <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-stone-100 bg-white px-6 md:px-12 flex items-center justify-between text-stone-600">
               <button 
                 onClick={prevPage}
                 className="flex items-center gap-2 hover:text-amber-700 transition-colors disabled:opacity-30"
                 disabled={currentPage === 0}
               >
                 <ChevronLeft size={20} />
                 <span className="text-sm font-semibold hidden md:inline">Previous</span>
               </button>

               <span className="font-mono text-xs text-stone-400">
                 {currentPage} / {totalPages}
               </span>

               <button 
                 onClick={nextPage}
                 className="flex items-center gap-2 hover:text-amber-700 transition-colors disabled:opacity-30"
                 disabled={currentPage === totalPages}
               >
                 <span className="text-sm font-semibold hidden md:inline">Next</span>
                 <ChevronRight size={20} />
               </button>
            </div>
          </>
        )}

        {/* Overlays */}
        {showTOC && (
          <TableOfContents 
            chapters={bookData.chapters} 
            onSelect={(page) => {
              setCurrentPage(page);
              setShowTOC(false);
            }} 
            onClose={() => setShowTOC(false)} 
          />
        )}
      </div>

      {/* Styles for scrollbar and animations */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6d3d1; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a29e; 
        }
      `}</style>
    </div>
  );
}