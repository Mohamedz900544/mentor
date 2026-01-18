import React, { useState, useEffect, useMemo } from 'react';
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
  Edit3
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
    shadow: 'shadow-indigo-200/50'
  },
  blue: {
    gradient: 'from-blue-600 to-cyan-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    subText: 'text-blue-600',
    shadow: 'shadow-blue-200/50'
  },
  yellow: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    subText: 'text-amber-600',
    shadow: 'shadow-amber-200/50'
  },
  amber: {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    subText: 'text-orange-600',
    shadow: 'shadow-amber-200/50'
  },
  red: {
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    subText: 'text-rose-600',
    shadow: 'shadow-rose-200/50'
  },
  green: {
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    subText: 'text-emerald-600',
    shadow: 'shadow-emerald-200/50'
  },
  teal: {
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-900',
    subText: 'text-teal-600',
    shadow: 'shadow-teal-200/50'
  },
  purple: {
    gradient: 'from-purple-600 to-fuchsia-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    subText: 'text-purple-600',
    shadow: 'shadow-purple-200/50'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-900',
    subText: 'text-pink-600',
    shadow: 'shadow-pink-200/50'
  },
  default: {
    gradient: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    subText: 'text-slate-600',
    shadow: 'shadow-slate-200/50'
  }
};

// --- COURSE BOOK PAGES (same content, with iconKey) ---
const defaultPages = [
  {
    id: 1,
    tone: 'indigo',
    iconKey: 'star',
    title: 'مخترع الإلكترونيات الصغير',
    subtitle: 'مرحبًا بك في المستوى الأول',
    paragraphs: [
      'أهلاً يا مخترع في مغامرة الإلكترونيات مع Sparvi Lab',
      'في المستوى ده هنتعلم إزاي نخلي اللمبة تنور والجرس يرن والموتور يتحرك باستخدام دوائر بسيطة',
      'كل حصة من الكورس ليها صفحات خاصة في الكتاب تساعدك تفتكر اللي اتعلمته وتطبقه',
      'في آخر المستوى هتكون بنيت مشروع إلكتروني بسيط من تصميمك انت'
    ],
    images: ['أطفال يجلسون حول طاولة يلعبون بروبوتات صغيرة وأسلاك ولمبات ملونة في معمل ممتع']
  },
  {
    id: 2,
    tone: 'blue',
    iconKey: 'list',
    title: 'خريطة المستوى الأول',
    sectionTitle: '8 وحدات',
    paragraphs: [
      'الوحده 1: ليه الإلكترونيات مهمة في حياتنا وقواعد السلامة',
      'الوحده 2: ما هي الدائرة الكهربائية وتجربة الليد الأولى',
      'الوحده 3: الصوت والصفارة وتجارب الجرس الصغير',
      'الوحده 4: الحركة والموتور وتجارب المروحة والعربية اللعبة',
      'الوحده 5: المقاومة المتغيّرة والتحكم في النور والصوت والحركة',
      'الوحده 6: تصميم دوائر تحكم مختلفة باستخدام نفس المكوّنات',
      'الوحده 7: التخطيط لمشروعك الإلكتروني الأول',
      'الوحده 8: عرض المشروع ومراجعة المستوى الأول'
    ],
    images: ['لوح كرتوني كبير مرسوم عليه ثماني محطات على شكل خطوات مرقمة من 1 إلى 8 مع أسهم تربط بينهم']
  },
  {
    id: 3,
    tone: 'yellow',
    iconKey: 'chip',
    title: 'ما هي الإلكترونيات؟',
    sectionTitle: 'الوحده 1 – بداية المغامرة',
    question: 'بص حواليك… كام جهاز إلكتروني تقدر تعده في أوضتك؟',
    questionNote: 'اكتب أو ارسم خمسة أجهزة تشوفها كل يوم',
    paragraphs: [
      'الإلكترونيات هي علم الأجهزة اللي بتستخدم الكهرباء علشان تشتغل',
      'الموبايل والتابلت والتلفزيون واللابتوب وألعابك الإلكترونية كلها فيها دوائر إلكترونية جوّاها',
      'من غير إلكترونيات مش هيبقى في إنترنت ولا ألعاب كمبيوتر ولا شاشات ذكية',
      'في المستوى الأول هنتعلم أساسيات الإلكترونيات علشان تفهم الأجهزة دي بتشتغل من جوّه إزاي'
    ],
    images: [
      'غرفة طفل فيها موبايل وتلفزيون ولابتوب وألعاب إلكترونية مضيئة متوصلة بدوائر كرتونية بسيطة'
    ]
  },
  {
    id: 4,
    tone: 'green',
    iconKey: 'box',
    title: 'أدوات المستوى الأول',
    sectionTitle: 'صندوق عدة المخترع الصغير',
    paragraphs: [
      'كل مهندس إلكترونيات عنده صندوق عدة يشتغل بيه',
      'في الكيت بتاعك هتلاقي المكوّنات اللي هنستخدمها في كل الوحدات'
    ],
    bullets: [
      'بطاريات وحامل بطارية مزدوج',
      'أسلاك توصيل قصيرة وطويلة',
      'ليد – لمبات إلكترونية صغيرة',
      'صفارة Buzzer لعمل الأصوات',
      'موتور صغير ومروحة للموتور',
      'مفتاح تحكم Switch',
      'مقاومة متغيّرة Potentiometer'
    ],
    images: ['رسوم كرتونية لكل عنصر من عناصر الكيت داخل صناديق صغيرة على خلفية هندسية']
  },
  {
    id: 5,
    tone: 'red',
    iconKey: 'alert',
    title: 'قواعد السلامة مع الإلكترونيات',
    sectionTitle: 'الوحده 1 – سلامة أولًا',
    paragraphs: [
      'احنا في المستوى ده بنستخدم بطاريات صغيرة آمنة لكن برضه لازم نلتزم بقواعد السلامة',
      'ما نوصلش طرف البطارية الموجب بالموجب أو السالب بالسالب مباشرة من غير مكوّن في النص',
      'ما نقربش الأسلاك من الفم أو العينين وما نستخدمش كهربا البيت نهائي في التجارب',
      'نشتغل دايمًا في مكان منظم وفاضي ونرجع كل مكوّن لمكانه بعد ما نخلص'
    ],
    images: [
      'طفل يعمل تجارب إلكترونيات على مكتب مرتب وبجواره علامات تحذير لطيفة تذكّر بقواعد السلامة'
    ]
  },
  {
    id: 6,
    tone: 'teal',
    iconKey: 'branch',
    title: 'ما هي الدائرة الكهربائية؟',
    sectionTitle: 'الوحده 2 – طريق الطاقة',
    paragraphs: [
      'علشان أي جهاز يشتغل محتاج ثلاث حاجات مع بعض',
      'مصدر طاقة زي البطارية وطريق تمشي فيه الطاقة زي الأسلاك وجهاز يشتغل بالطاقة زي الليد أو الصفارة أو الموتور',
      'لما نوصل التلاتة مع بعض صح بيتكوّن عندنا طريق كامل اسمه الدائرة الكهربائية',
      'لو الطريق كامل بنسميها دائرة مغلقة والجهاز يشتغل ولو الطريق مقطوع بنسميها دائرة مفتوحة والجهاز يطفي'
    ],
    images: [
      'رسمة لدائرة بسيطة فيها بطارية وأسلاك ولمبة صغيرة مع سهم يوضح أن الطريق المغلق يشغل اللمبة والطريق المفتوح يطفيها'
    ]
  },
  {
    id: 7,
    tone: 'purple',
    iconKey: 'lightbulb',
    title: 'تجربة الليد الأولى',
    sectionTitle: 'الوحده 2 – خلي اللمبة تنور',
    paragraphs: [
      'الليد لمبة إلكترونية صغيرة تقدر تنور بطاقة قليلة من البطارية',
      'لليد طرف طويل وطرف قصير والطرف الطويل بيتوصل غالبًا مع الموجب في البطارية',
      'لما توصل البطارية مع الليد عن طريق سلكين صح اللمبة هتنور ولما تفك سلك واحد الدائرة هتفتح واللمبة هتطفي',
      'جرّب ترسم في كشكولك الدائرة اللي عملتها وحط سهم صغير يوضّح اتجاه سريان التيار'
    ],
    images: [
      'لوح تجارب فيه بطارية متصلة بليد عن طريق سلكين مع سهم يوضح اتجاه الشحنات داخل الدائرة'
    ]
  },
  {
    id: 8,
    tone: 'yellow',
    iconKey: 'zap',
    title: 'التيار الكهربائي مثل الماء',
    sectionTitle: 'الوحده 2 – فهم حركة الشحنات',
    paragraphs: [
      'تخيّل إن جوّا السلك في نقط صغيرة تتحرك زي المية في الأنبوبة',
      'لما النقط دي تتحرك من البطارية وتلف وترجع لها بنسمي الحركة دي تيار كهربائي',
      'البطارية زي خزان المية والأسلاك زي المواسير والجهاز زي مروحة بتشتغل لما المية تعدي فيها',
      'في الدائرة بتاعتنا بنفكر إن التيار ماشي من الطرف الموجب للبطارية يعدي في المكوّنات ويرجع للطرف السالب'
    ],
    images: [
      'أنبوبة مية مرسومة بجانب سلك كهربا وكل واحدة فيها سهم يوضح اتجاه الحركة مع بطارية ولمبة في البداية والنهاية'
    ]
  },
  {
    id: 9,
    tone: 'blue',
    iconKey: 'pen',
    title: 'نشاط بيت للوحده 2',
    sectionTitle: 'ارسم واكتب زي المهندسين',
    paragraphs: [
      'النشاط 1: ارسم دائرة الليد اللي عملناها في الوحده واكتب تحتها دائرة مغلقة',
      'النشاط 2: ارسم نفس الدائرة لكن فك سلك واحد واكتب تحتها دائرة مفتوحة',
      'النشاط 3: بجانب كل رسمة اكتب ماذا يحدث لللمبة تنور أو تطفي',
      'النشاط 4: عدّد ثلاث أجهزة في البيت تفتكر إنها تحتوي على دائرة كهربائية تشبه تجربتك'
    ],
    images: [
      'صفحة كشكول فيها رسمتين لدائرة لمبة واحدة مرة كاملة ومرة بسلك مفصول مع كلمات دائرة مغلقة ودائرة مفتوحة تحت كل رسمة'
    ]
  },
  {
    id: 10,
    tone: 'green',
    iconKey: 'speaker',
    title: 'ما هو الصوت؟',
    sectionTitle: 'الوحده 3 – من الاهتزاز للصوت',
    question: 'إيه هو الصوت اللي بنسمعه؟',
    questionNote: 'جرّب تخبط على سطح المكتب واسمع كويس',
    paragraphs: [
      'الصوت عبارة عن اهتزازات تنتشر في الهواء وفي المية وفي الأجسام الصلبة',
      'لما نخبط على الخشب أو الحديد بيهتز الجسم وبعدها الأذن تسمع الصوت',
      'في الإلكترونيات بنستخدم عناصر تغير الطاقة الكهربية لطاقة صوتية نقدر نسمعها',
      'واحد من أهم العناصر دي هو الصفارة الإلكترونية Buzzer'
    ],
    images: [
      'طفل يضع أذنه على سطح خشبي بينما يد أخرى تخبط خبطات خفيفة وتخرج موجات صوتية مرسومة'
    ]
  },
  {
    id: 11,
    tone: 'red',
    iconKey: 'alert',
    title: 'الصفارة الإلكترونية',
    sectionTitle: 'الوحده 3 – من الكهرباء للصوت',
    paragraphs: [
      'الصفارة عنصر إلكتروني يحول الطاقة الكهربية إلى طاقة صوتية',
      'لما نوصل الصفارة في دائرة مع البطارية والسويتش نقدر نشغل ونطفي الصوت وقت ما نحب',
      'جرس البيت بيستخدم فكرة قريبة جدًا من الدائرة اللي بنعملها بالصفارة',
      'كل مرة تضغط على الزرار الدائرة تكتمل فيمر التيار ونسمع صوت الجرس أو الصفارة'
    ],
    images: [
      'جرس باب كرتوني يخرج منه موجات صوتية مع دائرة بسيطة فيها بطارية وسويتش وصفارة متوصلة بالتوالي'
    ]
  },
  {
    id: 12,
    tone: 'teal',
    iconKey: 'settings',
    title: 'نشاط بيت للوحده 3',
    sectionTitle: 'جرس غرفتي السري',
    paragraphs: [
      'النشاط 1: صمّم دائرة صفارة بسيطة فيها بطارية وسويتش وصفارة وارسمها في كشكولك',
      'النشاط 2: فكّر مكان مناسب في البيت لو عملنا فيه جرس صغير باستخدام نفس الفكرة',
      'النشاط 3: اكتب جملة تشرح فيها متى يشتغل الجرس ومتى يطفي باستخدام كلمة دائرة مغلقة ومفتوحة',
      'النشاط 4: لو قدرت تثبت الدائرة على كرتونة صغيرة اعمل صورة أو رسمة لشكل الجرس بعد التركيب'
    ],
    images: ['لوح كرتوني عليه دائرة صفارة مثبتة في ركن الغرفة بجانب باب كرتوني مكتوب عليه غرفة المخترع']
  },
  {
    id: 13,
    tone: 'amber',
    iconKey: 'motor',
    title: 'الحركة والطاقة الحركية',
    sectionTitle: 'الوحده 4 – من السكون للحركة',
    paragraphs: [
      'من أشكال الطاقة المهمة في حياتنا الطاقة الحركية',
      'السيارات والطائرات والعجل والمراوح كلها أمثلة على أشياء تتحرك بالطاقة الحركية',
      'في الإلكترونيات نستخدم الموتور علشان نحول الطاقة الكهربية لطاقة حركية',
      'الموتور بيخلي حاجات تلف زي المروحة أو تتزق لقدام زي العربية اللعبة'
    ],
    images: ['رسمة لمروحة سقف وعربية لعبة وطائرة صغيرة وكلهم عليهم أسهم توضح اتجاه الحركة']
  },
  {
    id: 14,
    tone: 'green',
    iconKey: 'chip',
    title: 'الموتور في دائرتنا',
    sectionTitle: 'الوحده 4 – خلي الحاجة تتحرك',
    paragraphs: [
      'الموتور عنصر إلكتروني يحول الطاقة الكهربية إلى حركة دائرية',
      'لما نوصل الموتور بالبطارية عن طريق الأسلاك يبدأ محور الموتور يلف',
      'ممكن نركب على الموتور مروحة بلاستيك فنشوف الهواء يتحرك حوالينا',
      'أو نركبه على عجلة لعبة صغيرة فنشوف العربية تتحرك على الأرض'
    ],
    images: [
      'موتور صغير موصل ببطارية ويحرك مروحة بلاستيكية فوقه مع طفل يحاول يلمس الهواء الخارج من المروحة'
    ]
  },
  {
    id: 15,
    tone: 'purple',
    iconKey: 'pen',
    title: 'نشاط بيت للوحده 4',
    sectionTitle: 'مروحة مكتب أو عربية سباق',
    paragraphs: [
      'النشاط 1: اختر فكرة واحدة مروحة مكتب صغيرة أو عربية سباق بسيطة',
      'النشاط 2: ارسم في كشكولك شكل المشروع من بره ثم ارسم تحته الدائرة الكهربية اللي جوّاه',
      'النشاط 3: عدّد المكوّنات اللي هتحتاجها بطارية أسلاك موتور سويتش وربما مروحة بلاستيك',
      'النشاط 4: اكتب جملة توضّح نوع الطاقة اللي خارجة من مشروعك طاقة حركية بتحرك الهوا أو العجل'
    ],
    images: [
      'طفل يرسم في كشكوله شكل مروحة مكتب صغيرة وعربية سباق مع دوائر كهربية بسيطة تحت كل رسمة'
    ]
  },
  {
    id: 16,
    tone: 'red',
    iconKey: 'settings',
    title: 'المتحكم الذكي – المقاومة المتغيّرة',
    sectionTitle: 'الوحده 5 – زرار التحكم',
    paragraphs: [
      'المقاومة جزء في الدائرة بيصعّب حركة التيار زي كأن الطريق بقى أضيق والزحمة زادت',
      'المقاومة المتغيّرة نقدر نلفّها علشان نزوّد أو نقلل المقاومة بايدينا',
      'لما نزود المقاومة التيار يقل فيضعف النور أو يقل الصوت أو تبطأ الحركة',
      'لما نقلل المقاومة التيار يزيد فيقوى النور أو يعلى الصوت أو تزيد سرعة الحركة'
    ],
    images: [
      'نوب مقاومة متغيّرة كبيرة حولها رسمة لليد وهي تلف النوب مع لمبة يضعف ويشتد نورها في جانبين مختلفين'
    ]
  },
  {
    id: 17,
    tone: 'yellow',
    iconKey: 'lightbulb',
    title: 'تجارب التحكم في النور والصوت والحركة',
    sectionTitle: 'الوحده 5 – ثلاث تجارب',
    paragraphs: [
      'تجربة 1: بطارية سويتش مقاومة متغيّرة ليد وشوف كيف يتغير سطوع الضوء',
      'تجربة 2: بطارية سويتش مقاومة متغيّرة صفارة وشوف كيف يتغير حجم الصوت',
      'تجربة 3: بطارية سويتش مقاومة متغيّرة موتور وشوف كيف تتغير سرعة الدوران',
      'كل مرة لفّ النوب ببطء وسجّل في كشكولك ماذا يحدث عند كل وضع مختلف'
    ],
    images: [
      'ثلاث رسومات صغيرة متجاورة تمثل دائرة ليد ودائرة صفارة ودائرة موتور وكل واحدة عليها نوب مقاومة متغيّرة'
    ]
  },
  {
    id: 18,
    tone: 'blue',
    iconKey: 'list',
    title: 'نشاط بيت للوحده 5',
    sectionTitle: 'ثلاث مستويات تحكم',
    paragraphs: [
      'النشاط 1: اختر واحدة من الدوائر الثلاثة مصباح صفارة أو مروحة',
      'النشاط 2: حدّد ثلاث مستويات تحب تسميهم مثلا هادي متوسط قوي',
      'النشاط 3: لفّ المقاومة المتغيّرة وابحث عن وضع يناسب كل مستوى وسجّل مكان النوب لكل مستوى في كشكولك',
      'النشاط 4: اكتب جملة تشرح فيها كيف تساعدك المقاومة المتغيّرة على التحكم في مشروعك بسهولة'
    ],
    images: [
      'قرص مقاومة متغيّرة عليه ثلاث علامات ملونة مكتوب عندها هادي متوسط قوي بجانب دائرة إلكترونية صغيرة'
    ]
  },
  {
    id: 19,
    tone: 'teal',
    iconKey: 'component',
    title: 'تصميم دوائر تحكم مختلفة',
    sectionTitle: 'الوحده 6 – نفس المكوّنات أفكار مختلفة',
    paragraphs: [
      'دلوقتي عندنا نفس المكوّنات لكن نقدر نستخدمها بطرق مختلفة',
      'ممكن نصمّم دائرة مصباح يمكن التحكم في شدته باستخدام السويتش والمقاومة المتغيّرة والليد',
      'أو دائرة إنذار نتحكم في قوته باستخدام السويتش والمقاومة المتغيّرة والصفارة',
      'أو دائرة مروحة بسرعات متعددة باستخدام السويتش والمقاومة المتغيّرة والموتور'
    ],
    images: [
      'ثلاث دوائر مرسومة جنب بعض لمصباح وإنذار ومروحة كلهم متصلين ببطارية وسويتش ومقاومة متغيّرة'
    ]
  },
  {
    id: 20,
    tone: 'purple',
    iconKey: 'sparkles',
    title: 'تحدي الوحده 6',
    sectionTitle: 'أي دائرة هتكون فكرتك المفضلة؟',
    paragraphs: [
      'التحدي 1: اختر واحدة من الدوائر الثلاثة واعتبرها فكرتك الأساسية',
      'التحدي 2: اكتب سبب اختيارك للدائرة دي وهل هي مفيدة في غرفتك أو بيتك',
      'التحدي 3: حاول تضيف فكرة صغيرة للتطوير مثلا إضافة ليد مع الصفارة أو مروحة مع مصباح',
      'التحدي 4: ارسم النسخة المطورة من الدائرة في كشكولك مع توضيح مكان كل مكوّن'
    ],
    images: [
      'طفل يفكر أمام ثلاث لوحات دوائر مختلفة ويحمل في يده قلم يرسم دائرة رابعة مطورة على سبورة صغيرة'
    ]
  },
  {
    id: 21,
    tone: 'green',
    iconKey: 'branch',
    title: 'مشروعي الإلكتروني الأول',
    sectionTitle: 'الوحده 7 – خطة الاختراع',
    paragraphs: [
      'الخطوة 1: اختر فكرة مشروع من اللي جربناها أو ابتكر فكرة قريبة منها',
      'الخطوة 2: اكتب اسم المشروع في أعلى الصفحة زي مصباح سريري أو مروحة مكتبي أو إنذار غرفتي',
      'الخطوة 3: عدّد المكوّنات اللي هتحتاجها من الكيت بطارية سويتش مقاومة متغيّرة ليد صفارة موتور أسلاك توصيل',
      'الخطوة 4: ارسم الدائرة الكهربية اللي تخلي المشروع يشتغل وحدد مكان كل مكوّن بوضوح'
    ],
    images: [
      'لوحة مشروع كرتونية عليها رسم دائرة كاملة ومكتوب تحتها اسم الطالب واسم المشروع مع نجوم صغيرة حول اللوحة'
    ]
  },
  {
    id: 22,
    tone: 'yellow',
    iconKey: 'pen',
    title: 'قصة اختراعي',
    sectionTitle: 'الوحده 7 – احكي حكاية فكرتك',
    paragraphs: [
      'اكتب في كلمتين لمين عملت المشروع لنفسك أو لأخوك أو لحد من العيلة',
      'اشرح في سطرين إمتى نستخدم المشروع مثلا قبل النوم أو عند فتح باب الغرفة',
      'اكتب نوع الطاقة اللي بتخرج من مشروعك نور أو صوت أو حركة أو أكثر من نوع',
      'اكتب فكرة تطوير تحب تضيفها للمشروع في المستقبل لو كان عندك مكوّنات زيادة'
    ],
    images: [
      'طفل يكتب في كراسة بعنوان قصة اختراعي وإلى جانبه مشروع إلكتروني صغير موصل ببطارية'
    ]
  },
  {
    id: 23,
    tone: 'blue',
    iconKey: 'check',
    title: 'أسئلة مراجعة المستوى',
    sectionTitle: 'الوحده 8 – اختبر نفسك',
    paragraphs: [
      'س1: ما الفرق بين الدائرة المفتوحة والدائرة المغلقة؟',
      'س2: ما وظيفة البطارية في الدائرة وما نوع الطاقة اللي جوّاها؟',
      'س3: كيف يشبه التيار الكهربائي الماء في المواسير؟',
      'س4: ما وظيفة السويتش ومتى نحتاجه في الدائرة؟',
      'س5: ماذا تفعل المقاومة المتغيّرة في الدائرة وماذا يحدث للنور أو للصوت عندما نزيد المقاومة؟',
      'س6: اذكر مثالًا لجهاز يخرج طاقة ضوئية وآخر يخرج طاقة صوتية وثالث يخرج طاقة حركية',
      'س7: اكتب سلسلة تحوّل الطاقة في دائرة مصباح وفي دائرة صفارة وفي دائرة موتور'
    ],
    images: [
      'ورقة اختبار لطيفة بأسئلة قصيرة حول الإلكترونيات وبجانبها طفل يفكر وعلى رأسه لمبة مضيئة'
    ]
  },
  {
    id: 24,
    tone: 'pink',
    iconKey: 'star',
    title: 'أنا الآن مخترع مستوى 1',
    sectionTitle: 'الوحده 8 – لحظة الإنجاز',
    paragraphs: [
      'مبروك عليك إنهاء مغامرة مخترع الإلكترونيات الصغير المستوى الأول',
      'دلوقتي تقدر تفهم معنى الدائرة الكهربائية والتيار والطاقة وتعرف تستخدم الليد والصفارة والموتور والسويتش والمقاومة المتغيّرة',
      'اكتب هنا جملة عن أكتر حاجة حبيتها في المستوى الأول وجملة عن حاجة نفسك تتعلمها في المستوى اللي بعده',
      'وقّع باسمك وتاريخ اليوم في آخر الصفحة واعتبر دي شهادة إنك بدأت طريقك في عالم الإلكترونيات'
    ],
    images: [
      'أطفال يرتدون قبعات تخرج STEM ويحملون شهادات إنجاز أمام لافتة مكتوب عليها مخترع إلكترونيات مستوى 1'
    ]
  },
  {
    id: 25,
    tone: 'indigo',
    iconKey: 'book',
    title: 'قاموس الكلمات المهمة',
    sectionTitle: 'لو نسيت كلمة ارجع للصفحة دي',
    paragraphs: [
      'الإلكترونيات: علم الأجهزة اللي بتستخدم الكهرباء علشان تعمل شغل زي النور والصوت والحركة',
      'الدائرة الكهربائية: طريق مغلق تمشي فيه الطاقة من البطارية للجهاز وترجع تاني',
      'الدائرة المفتوحة: طريق مقطوع لا يمر فيه التيار فيتوقف الجهاز عن العمل',
      'التيار الكهربائي: حركة الشحنات في السلك مثل حركة الماء في المواسير',
      'البطارية: مصدر طاقة كيميائية تتحول لطاقة كهربية في الدائرة',
      'السويتش: مفتاح يفتح ويقفل الطريق في الدائرة علشان نشغل ونطفي بسهولة',
      'المقاومة المتغيّرة: جزء نقدر نلفّه علشان نزوّد ونقلّل التيار اللي رايح للجهاز',
      'الليد: لمبة إلكترونية صغيرة تحول الطاقة الكهربية إلى طاقة ضوئية',
      'الصفارة: عنصر يحوّل الطاقة الكهربية إلى طاقة صوتية',
      'الموتور: عنصر يحوّل الطاقة الكهربية إلى طاقة حركية',
      'طاقة كيميائية / كهربية / ضوئية / صوتية / حركية: أشكال مختلفة للطاقة شفناها في تجاربنا',
      'مشروع إلكتروني: دائرة مكوّنة من بطارية وأسلاك ومكوّنات أخرى تخدم فكرة مفيدة أو ممتعة'
    ],
    images: [
      'لوحة كرتونية عليها بطارية ولمبة وصفارة وموتور وسويتش ومقاومة متغيّرة وكل مكون مكتوب تحته اسمه كنشرة مصغرة'
    ]
  }
];

// --- Sub Components ---

const QuestionCard = ({ question, note, theme }) => (
  <div className="relative mt-8 mb-10 group">
    <div className="absolute -top-4 right-6 z-10 text-slate-400 drop-shadow-md transform -rotate-12 group-hover:rotate-0 transition-transform">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
      </svg>
    </div>

    <div className={`bg-white border-2 border-dashed ${theme.border} rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${theme.gradient} opacity-[0.04] rounded-bl-full`} />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-100 opacity-[0.4] rounded-tr-full" />

      <div className="flex gap-5 relative z-10">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl ${theme.bg} ${theme.subText} flex items-center justify-center shadow-inner border ${theme.border}`}
        >
          <HelpCircle size={26} />
        </div>
        <div className="space-y-2 flex-1 py-1">
          <h3 className="font-bold text-xl text-slate-800 leading-snug">{question}</h3>
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

const getIconForText = (text, defaultIcon) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('بطارية') || lowerText.includes('شحنات')) return <BatteryCharging size={18} />;
  if (lowerText.includes('ليد') || lowerText.includes('ضوء') || lowerText.includes('مصباح') || lowerText.includes('لمبة'))
    return <Lightbulb size={18} />;
  if (lowerText.includes('موتور') || lowerText.includes('حركة') || lowerText.includes('مروحة')) return <Fan size={18} />;
  if (lowerText.includes('مفتاح') || lowerText.includes('تحكم')) return <ToggleLeft size={18} />;
  if (lowerText.includes('صوت') || lowerText.includes('صفارة') || lowerText.includes('جرس')) return <Speaker size={18} />;
  if (lowerText.includes('توصيل') || lowerText.includes('دائرة')) return <GitBranch size={18} />;
  if (lowerText.includes('كهرباء') || lowerText.includes('طاقة')) return <Zap size={18} />;
  if (lowerText.includes('تجربة') || lowerText.includes('خطوة')) return <ClipboardList size={18} />;
  if (lowerText.includes('تحذير')) return <AlertTriangle size={18} />;
  return defaultIcon;
};

const EnhancedParagraph = ({ text, theme, iconKey }) => {
  const IconElement = useMemo(() => {
    const DefaultBullet = () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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

    // لو فيه iconKey مختار يدويًا
    if (iconKey && iconRegistry[iconKey]) {
      const Comp = iconRegistry[iconKey];
      return <Comp size={18} />;
    }

    // لو مفيش → استخدم النظام الأوتوماتيك
    return getIconForText(text, <DefaultBullet />);
  }, [text, iconKey]);

  return (
    <div className="flex gap-4 group items-start">
      <div
        className={`mt-1.5 shrink-0 p-1.5 rounded-lg transition-colors ${theme.bg} border ${theme.border} ${theme.subText} group-hover:scale-110 transition-transform`}
      >
        {IconElement}
      </div>
      <p className="text-[19px] text-slate-700 leading-8 font-medium flex-1">{text}</p>
    </div>
  );
};

const EnhancedTechList = ({ items, theme }) => {
  const getComponentIcon = (item) => {
    const lowerItem = item.toLowerCase();
    if (lowerItem.includes('بطارية')) return <Battery size={18} />;
    if (lowerItem.includes('موتور')) return <Fan size={18} />;
    if (lowerItem.includes('مراوح')) return <Fan size={18} />;
    if (lowerItem.includes('صافرة') || lowerItem.includes('صفارة')) return <Speaker size={18} />;
    if (lowerItem.includes('مفتاح')) return <ToggleLeft size={18} />;
    if (lowerItem.includes('لوح') || lowerItem.includes('توصيل')) return <Component size={18} />;
    if (lowerItem.includes('أسلاك')) return <GitBranch size={18} />;
    return <Boxes size={18} />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div
            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${theme.bg} border ${theme.border} ${theme.subText} group-hover:scale-105 transition-transform shadow-sm`}
          >
            {getComponentIcon(item)}
          </div>
          <span className="text-slate-700 font-bold text-base">{item}</span>
          <CheckCircle2 size={16} className={`mr-auto opacity-0 group-hover:opacity-100 transition-opacity ${theme.subText}`} />
        </div>
      ))}
    </div>
  );
};

// --- BLOCKS EDITOR (paragraphs + space blocks + icon per paragraph) ---

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
      height: type === 'space' ? 32 : undefined,
      iconKey: undefined
    };
    onChange([...safeBlocks, newBlock]);
  };

  const addBlockAfter = (index, type) => {
    const newBlock = {
      id: `b-${Date.now()}-${Math.random()}`,
      type,
      text: '',
      height: type === 'space' ? 32 : undefined,
      iconKey: undefined
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

  return (
    <div>
      <label className="block text-slate-400 mb-1 font-medium">
        محتوى الصفحة (بلوكات)
      </label>
      <p className="text-[10px] text-slate-500 mb-2">
        كل عنصر هنا يا إما فقرة نص أو بلوك مسافة تقدر تتحكم في ارتفاعه، وكمان تقدر تختار أيقونة كل فقرة.
      </p>

      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {safeBlocks.length === 0 && (
          <div className="text-[11px] text-slate-500 mb-1">
            لا يوجد محتوى بعد. أضف فقرة أو مسافة من الأزرار بالأسفل.
          </div>
        )}

        {safeBlocks.map((block, index) => {
          const isParagraph = block.type !== 'space';
          const height = typeof block.height === 'number' ? block.height : 32;
          const currentIconKey = block.iconKey || 'auto';

          if (isParagraph) {
            return (
              <div
                key={block.id || `p-${index}`}
                className="rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold">
                    فقرة #{index + 1}
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
                      title="إضافة مسافة بعد هذه الفقرة"
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

                {/* Icon selector for this paragraph */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="whitespace-nowrap">أيقونة الفقرة:</span>
                  <select
                    value={currentIconKey}
                    onChange={(e) =>
                      updateBlock(index, {
                        iconKey: e.target.value === 'auto' ? undefined : e.target.value
                      })
                    }
                    className="flex-1 rounded-lg bg-slate-900/80 border border-slate-700 px-2 py-1 text-[10px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="auto">تلقائي حسب النص</option>
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

          // Space block
          return (
            <div
              key={block.id || `s-${index}`}
              className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sparkles size={12} className="text-sky-400" />
                  مسافة فاصلة #{index + 1}
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

              <div className="space-y-1">
                <div className="flex items-center justify_between text-[11px] text-slate-400">
                  <span>ارتفاع المسافة: {height}px</span>
                  <span className="text-slate-500">
                    تقريبًا&nbsp;
                    {Math.max(1, Math.round(height / 24))} سطر
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={160}
                  step={4}
                  value={height}
                  onChange={(e) => updateBlock(index, { height: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={240}
                    value={height}
                    onChange={(e) =>
                      updateBlock(index, { height: Number(e.target.value) || 0 })
                    }
                    className="w-16 rounded-lg bg-slate-900/70 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-sky-500"
                      style={{ width: `${Math.min(100, (height / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={12} />
          إضافة فقرة
        </button>
        <button
          type="button"
          onClick={() => addBlock('space')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={12} />
          إضافة مسافة فاصلة
        </button>
      </div>
    </div>
  );
};

// --- BULLETS EDITOR ---

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
  onReset
}) => {
  return (
    <div className="no-print w-full lg:w-[260px] bg-slate-900/70 border border-slate-700/60 rounded-3xl p-4 flex flex-col gap-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify_between mb-1">
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
                  <p className="text-[10px] text-slate-400 truncate">
                    {p.sectionTitle || p.subtitle || 'صفحة عادية'}
                  </p>
                </div>
                <span
                  className={`w-2 h-2 rounded-full border ${theme.border} ${
                    active ? theme.bg : 'bg-slate-800'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Page Editor Panel ---

const PageEditorPanel = ({
  page,
  onFieldChange,
  onToneChange,
  onBulletsChange,
  onBlocksChange
}) => {
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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Question</label>
            <input
              value={page.question || ''}
              onChange={(e) => onFieldChange('question', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Question note</label>
            <input
              value={page.questionNote || ''}
              onChange={(e) => onFieldChange('questionNote', e.target.value)}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
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

        {/* Blocks (paragraphs + spaces + icons) */}
        <BlocksEditor blocks={page.blocks || []} onChange={onBlocksChange} />

        {/* Bullets */}
        <BulletsEditor bullets={page.bullets || []} onChange={onBulletsChange} />

        <p className="text-[10px] text-slate-500 mt-2">
          عدل عنوان الصفحة والألوان والأيقونة والنصوص، واستخدم بلوكات المسافة والتحكم في أيقونة كل فقرة لعمل تصميم مرتب.
        </p>
      </div>
    </div>
  );
};

// --- Normalization helper (ensure blocks exist) ---

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

  blocks = blocks.map((b, idx) => ({
    id: b.id || `b-${idx}-${Date.now()}`,
    type: b.type === 'space' ? 'space' : 'paragraph',
    text: b.text || '',
    height:
      b.type === 'space'
        ? typeof b.height === 'number'
          ? b.height
          : 32
        : undefined,
    iconKey: b.iconKey || undefined
  }));

  const paragraphs = blocks
    .filter((b) => b.type === 'paragraph' && b.text && b.text.trim().length > 0)
    .map((b) => b.text);

  return { ...p, blocks, paragraphs };
};

// --- Page Renderer ---

const PageContent = ({ page, pageNumber, totalPages, bookMeta, printMode = false }) => {
  const theme = toneStyles[page.tone] || toneStyles.default;
  const levelTag = bookMeta?.levelTag || 'Sparvi Lab · Level 1';
  const IconComp = iconRegistry[page.iconKey] || Book;

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
          printMode ? 'rounded-none shadow-none' : 'rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]'
        }`}
        style={{
          width: printMode ? '210mm' : '794px',
          height: printMode ? '297mm' : '1123px'
        }}
      >
        <CircuitPattern colorClass={theme.subText} opacity="0.05" />
        <PageDecorations theme={theme} />

        <div className={`relative px-8 pt-12 pb-16 bg-gradient-to-bl ${theme.gradient} text-white overflow-hidden`}>
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

              <h1 className="text-5xl md:text-6xl font-black leading-tight drop-shadow-lg tracking-tight">{page.title}</h1>

              {page.sectionTitle && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                  <p className="text-xl text-white font-bold">{page.sectionTitle}</p>
                </div>
              )}
            </div>

            <div className="shrink-0 relative -mt-4 -mr-4">
              <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-110" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border-[3px] border-white/40 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] transform rotate-6 group hover:rotate-0 transition-transform duration-500">
                <div className="text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)] scale-125">
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

        <div className="flex-1 px-10 md:px-14 py-10 relative z-10">
          {(page.subtitle || page.subheading) && (
            <div className="mb-10 relative">
              <div className={`absolute right-0 top-0 bottom-0 w-2 rounded-full bg-gradient-to-b ${theme.gradient} opacity-80`} />
              <div className="pr-8 py-2">
                {page.subtitle && (
                  <p className={`text-sm font-black uppercase tracking-widest ${theme.subText} mb-1 flex items-center gap-2`}>
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

          {page.question && <QuestionCard question={page.question} note={page.questionNote} theme={theme} />}

          {blocks && blocks.length > 0 && (
            <div className="space-y-6 mb-10">
              {blocks.map((block, idx) => {
                if (block.type === 'space') {
                  const height = typeof block.height === 'number' ? block.height : 32;
                  return (
                    <div key={block.id || `space-${idx}`} style={{ height }} />
                  );
                }
                return (
                  <EnhancedParagraph
                    key={block.id || `p-${idx}`}
                    text={block.text || ''}
                    theme={theme}
                    iconKey={block.iconKey}
                  />
                );
              })}
            </div>
          )}

          {page.bullets && page.bullets.length > 0 && (
            <div
              className={`bg-slate-50/60 rounded-3xl p-8 border-2 border-dashed ${theme.border} relative overflow-hidden mb-10 shadow-sm`}
            >
              <CircuitPattern colorClass={theme.subText} opacity="0.03" />
              <div className="relative z-10">
                <h3 className={`text-lg font-black ${theme.subText} mb-4 flex.items-center gap-3 uppercase tracking-wider`}>
                  <div className={`p-2 rounded-lg ${theme.bg} border ${theme.border}`}>
                    <List size={20} />
                  </div>
                  المكونات والأدوات المطلوبة
                </h3>
                <EnhancedTechList items={page.bullets} theme={theme} />
              </div>
            </div>
          )}

          {/* Images placeholder (disabled for now, عشان هتحط <img src> بنفسك بعدين) */}
          {/* {page.images && page.images.length > 0 && (
            <div className="grid grid-cols-1 gap-8 mt-10">
              {page.images.map((img, idx) => (
                <EnhancedBlueprintImage key={idx} desc={img} index={idx} theme={theme} />
              ))}
            </div>
          )} */}
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

// --- Main Wrapper (platform) ---

const STORAGE_KEY = 'sparviBookDesigner';

const BilingualBook = () => {
  const [pages, setPages] = useState(() => defaultPages.map((p) => normalizePage(p)));
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [printMode, setPrintMode] = useState(false);

  const [bookMeta, setBookMeta] = useState({
    brandName: 'Sparvi Lab',
    levelTag: 'Sparvi Lab · Level 1',
    tagline: 'Digital Lab Manual',
    ageRange: '8–11 years'
  });

  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex];

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.pages && Array.isArray(parsed.pages)) {
        setPages(parsed.pages.map((p) => normalizePage(p)));
      }
      if (parsed.bookMeta) {
        setBookMeta(parsed.bookMeta);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pages, bookMeta })
      );
    } catch {
      // ignore
    }
  }, [pages, bookMeta]);

  const nextPage = () => {
    setCurrentPageIndex((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
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
        return { ...p, blocks, paragraphs };
      })
    );
  };

  const updateCurrentPageBullets = (bullets) => {
    updateCurrentPageField('bullets', bullets);
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
      images: []
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
    setPages(defaultPages.map((p) => normalizePage(p)));
    setBookMeta({
      brandName: 'Sparvi Lab',
      levelTag: 'Sparvi Lab · Level 1',
      tagline: 'Digital Lab Manual',
      ageRange: '8–11 years'
    });
    setCurrentPageIndex(0);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
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
        <div className="absolute.top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full.blur-[150px]" />
        <div className="absolute.bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-sky-600/20 rounded-full.blur-[150px]" />
        <CircuitPattern colorClass="text-white" opacity="0.02" />
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 mt-4 relative z-20 no-print">
        <div className="text-white flex items-center gap-4">
          <div className="bg-sky-500/20 p-2.5 rounded-2xl backdrop-blur-md border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Book className="text-sky-400" size={24} />
          </div>
          <div>
            <span className="font-black text-2xl tracking-wide block.leading-none">
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
              disabled={currentPageIndex === 0}
              className="w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white.disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-slate-700"
            >
              <ChevronRight size={20} />
            </button>

            <div className="px-4 text-center">
              <span className="text-white font-mono font-bold text-xl">{currentPageIndex + 1}</span>
              <span className="text-slate-600 font-mono text-sm mx-2">of</span>
              <span className="text-slate-500 font-mono text-sm">{totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="w-11 h-11 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-500.disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-600/30 transition-all border border-sky-500/50"
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
                printMode={true}
              />
            </div>
          ))}
        </div>
      ) : (
        // NORMAL MODE: full platform layout (sidebar + preview + editor)
        <div className="relative w-full max-w-6xl flex-1 flex flex-col lg:flex-row gap-4 z-10 pb-8">
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
          />

          <div className="flex-1 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex justify-center overflow-y-auto px-2 pb-4">
              {currentPage && (
                <PageContent
                  page={currentPage}
                  pageNumber={currentPageIndex + 1}
                  totalPages={totalPages}
                  bookMeta={bookMeta}
                />
              )}
            </div>

            <PageEditorPanel
              page={currentPage}
              onFieldChange={updateCurrentPageField}
              onToneChange={(tone) => updateCurrentPageField('tone', tone)}
              onBulletsChange={updateCurrentPageBullets}
              onBlocksChange={updateCurrentPageBlocks}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BilingualBook;
