import React, { useState, useEffect } from 'react';
import {
  Book,
  ChevronRight,
  ChevronLeft,
  Battery,
  Zap,
  Lightbulb,
  Settings,
  Volume2,
  ShieldCheck,
  PenTool,
  Award,
  Star,
  Info,
  List,
  ClipboardList,
  CheckSquare
} from 'lucide-react';

const BilingualBook = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [printMode, setPrintMode] = useState(false);

  // 1. Enhanced Data with "Theme" for colors
  const lessonsData = [
    {
      num: 1,
      icon: <Battery size={40} />,
      titleEn: "The Secret of Energy",
      titleAr: "سر الطاقة",
      objectivesEn: [
        "Understand what electricity is.",
        "Identify the role of batteries.",
        "Learn about Positive (+) and Negative (-) sides."
      ],
      objectivesAr: [
        "فهم ماهي الكهرباء.",
        "التعرف على وظيفة البطارية.",
        "التمييز بين القطب الموجب (+) والسالب (-)."
      ],
      storyEn:
        "Meet WalkyBot, our robot friend! He is currently sleeping deeply and won't wake up. Just like you need breakfast to run and play, WalkyBot needs his own special food. It's not apples or sandwiches... it's Electricity! We keep this electricity inside magical cans called 'Batteries'. But be careful! Batteries have two sides, a bump (+) and a flat side (-). They must face the right way to work.",
      storyAr:
        "تعرفوا على صديقنا الروبوت 'واكي بوت'! إنه نائم في سبات عميق ولا يريد الاستيقاظ. تماماً كما تحتاج أنت إلى وجبة الإفطار لتجري وتلعب، يحتاج 'واكي بوت' إلى طعامه الخاص. طعامه ليس التفاح أو الشطائر... بل هو 'الكهرباء'! نحن نحفظ هذه الكهرباء داخل علب سحرية نسميها 'البطاريات'. لكن انتبه! البطارية لها وجهان، وجه بارز (+) ووجه مسطح (-). يجب أن نضعها في الاتجاه الصحيح لتعمل.",
      toolsEn: ["WalkyBot Robot", "2x AA Batteries", "Battery Holder"],
      toolsAr: ["روبوت 'واكي بوت'", "2 بطارية قلم (AA)", "بيت البطارية"],
      stepsEn: [
        "Find the battery holder on WalkyBot's back.",
        "Look for the (+) and (-) signs inside the holder.",
        "Match the bump on the battery to the (+) sign.",
        "Push the batteries in firmly.",
        "Switch the button to ON."
      ],
      stepsAr: [
        "ابحث عن مكان البطارية في ظهر 'واكي بوت'.",
        "فتش عن علامة الموجب (+) والسالب (-) داخل العلبة.",
        "اجعل الطرف البارز للبطارية يلامس علامة (+).",
        "اضغط البطاريات للداخل بإحكام.",
        "حرك زر التشغيل لوضع (ON)."
      ],
      observationEn: "Did WalkyBot move fast or slow? Did he make any sound?",
      observationAr: "هل تحرك 'واكي بوت' بسرعة أم ببطء؟ وهل أصدر أي صوت؟",
      funFactEn:
        "The first battery was invented by Alessandro Volta in 1800 using zinc and copper discs!",
      funFactAr:
        "أول بطارية في العالم اخترعها أليساندرو فولتا عام 1800 باستخدام أقراص من الزنك والنحاس!",
      challengeEn:
        "Try putting one battery backward. Does the robot still work? Why?",
      challengeAr:
        "جرب وضع بطارية واحدة بشكل معكوس. هل لا يزال الروبوت يعمل؟ لماذا؟",
      color: "bg-yellow-500",
      theme: "yellow"
    },
    {
      num: 2,
      icon: <Zap size={40} />,
      titleEn: "The Closed Loop",
      titleAr: "الدائرة المغلقة",
      objectivesEn: [
        "Understand the concept of a Circuit.",
        "Learn why connections must be tight.",
        "Make an LED light up."
      ],
      objectivesAr: [
        "فهم مفهوم الدائرة الكهربائية.",
        "تعلم أهمية التوصيلات المحكمة.",
        "جعل لمبة LED تضيء."
      ],
      storyEn:
        "Electricity is very shy; it only travels on a safe road called a 'Circuit'. Think of it like a race track for cars. If the track has a gap or is broken, the cars must stop immediately. We need to build a complete circle of wires so the electricity can run from the battery, through the light, and back home to the battery.",
      storyAr:
        "الكهرباء خجولة جداً؛ فهي تمشي فقط في طريق آمن نسميه 'الدائرة الكهربائية'. تخيلها مثل حلبة سباق السيارات. إذا كان الطريق مقطوعاً أو فيه حفرة، تتوقف السيارات فوراً. نحتاج لبناء دائرة كاملة متصلة من الأسلاك لكي تجري الكهرباء من البطارية، وتعبر خلال اللمبة، ثم تعود لبيتها في البطارية مرة أخرى.",
      toolsEn: ["Battery Holder", "Red LED", "Red & Black Wires"],
      toolsAr: ["حامل بطارية", "لمبة حمراء (LED)", "أسلاك حمراء وسوداء"],
      stepsEn: [
        "Take the red wire coming from the battery.",
        "Wrap it around the Long Leg of the LED.",
        "Take the black wire and wrap it around the Short Leg.",
        "Check if the light turns on.",
        "Try letting go of one wire."
      ],
      stepsAr: [
        "أمسك السلك الأحمر القادم من البطارية.",
        "لفه حول الرجل الطويلة للمبة (LED).",
        "أمسك السلك الأسود ولفه حول الرجل القصيرة.",
        "تأكد هل أضاءت اللمبة؟",
        "جرب إفلات سلك واحد ولاحظ ماذا يحدث."
      ],
      observationEn: "Draw the shape of your circuit. Mark where the energy starts.",
      observationAr:
        "ارسم شكل الدائرة التي صنعتها. ضع علامة X عند مكان خروج الطاقة.",
      funFactEn:
        "Electricity travels at the speed of light! It can go around the world 7 times in one second.",
      funFactAr:
        "الكهرباء تسافر بسرعة الضوء! يمكنها أن تدور حول كوكب الأرض 7 مرات في ثانية واحدة.",
      challengeEn:
        "Make the light blink by touching the wires together like a drum beat.",
      challengeAr:
        "اجعل الضوء يرمش (يفتح ويقفل) عن طريق لمس الأسلاك ببعضها كأنك تطبل.",
      color: "bg-green-500",
      theme: "green"
    },
    {
      num: 3,
      icon: <Settings size={40} spin />,
      titleEn: "Magic of Motion",
      titleAr: "سحر الحركة",
      objectivesEn: [
        "Distinguish between Light energy and Kinetic energy.",
        "Understand how a Motor works.",
        "Explore spinning directions."
      ],
      objectivesAr: [
        "التمييز بين الطاقة الضوئية والطاقة الحركية.",
        "فهم كيف يعمل الماتور.",
        "استكشاف اتجاهات الدوران."
      ],
      storyEn:
        "How do WalkyBot's wheels turn? Inside him, there is a strong muscle called a 'Motor'. Unlike the LED which glows, the motor spins! When electricity enters the motor, it creates invisible magnetic hands that push and spin the axle round and round. This is how we turn electric energy into Kinetic (movement) energy!",
      storyAr:
        "كيف تدور عجلات 'واكي بوت'؟ يوجد بداخله عضلة قوية نسميها 'الماتور'. عكس اللمبة التي تضيء، الماتور يدور! عندما تدخل الكهرباء إلى الماتور، تخلق أيادٍ مغناطيسية خفية تدفع المحور ليدور ويدور. هكذا نحول الطاقة الكهربائية إلى طاقة حركية وننطلق!",
      toolsEn: ["DC Motor with Fan", "Battery Pack", "Wires"],
      toolsAr: ["ماتور صغير بمروحة", "علبة البطارية", "أسلاك"],
      stepsEn: [
        "Connect the motor wires to the battery wires.",
        "Hold the motor tight, it will try to jump!",
        "Feel the air from the fan.",
        "Now, switch the red and black wires.",
        "Did the wind direction change?"
      ],
      stepsAr: [
        "وصل أسلاك الماتور بأسلاك البطارية.",
        "أمسك الماتور جيداً، سيحاول القفز من يدك!",
        "اشعر بهواء المروحة على وجهك.",
        "الآن، اعكس توصيل الأسلاك (الأحمر مكان الأسود).",
        "هل تغير اتجاه الهواء؟"
      ],
      observationEn:
        "When you swapped the wires, did the fan push air or pull air?",
      observationAr:
        "عندما عكست الأسلاك، هل قامت المروحة بدفع الهواء نحوك أم سحبه بعيداً؟",
      funFactEn:
        "Electric cars use huge motors just like this one to move without gasoline.",
      funFactAr:
        "السيارات الكهربائية تستخدم مواتير ضخمة تشبه هذا الماتور تماماً لتتحرك بدون بنزين.",
      challengeEn:
        "Can you make the fan spin slowly? Try using only one battery instead of two.",
      challengeAr:
        "هل يمكنك جعل المروحة تدور ببطء؟ جرب استخدام بطارية واحدة فقط بدلاً من اثنتين.",
      color: "bg-orange-500",
      theme: "orange"
    },
    {
      num: 4,
      icon: <Zap size={40} />,
      titleEn: "Power from My Hands",
      titleAr: "طاقة من يدي",
      objectivesEn: [
        "Learn about Generators.",
        "Convert muscle power to electricity.",
        "Understand reversible energy."
      ],
      objectivesAr: [
        "التعرف على المولدات.",
        "تحويل طاقة العضلات لكهرباء.",
        "فهم الطاقة العكسية."
      ],
      storyEn:
        "Did you know you can make electricity without buying batteries? With a device called a 'Generator', you can use your own muscles to make power! Inside the generator, coils of wire spin near magnets to create a flow of electricity. It's the opposite of a motor. Motor: Electricity -> Motion. Generator: Motion -> Electricity.",
      storyAr:
        "هل تعلم أنك تستطيع صنع الكهرباء دون شراء بطاريات؟ باستخدام جهاز يسمى 'المولد'، يمكنك استخدام عضلاتك القوية لإنتاج الطاقة! داخل المولد، تدور ملفات من الأسلاك قرب مغناطيسات لتخلق تياراً كهربائياً. إنه عكس الماتور تماماً. الماتور يحول الكهرباء لحركة، والمولد يحول الحركة لكهرباء.",
      toolsEn: ["Hand Crank Generator", "LED Light", "Motor"],
      toolsAr: ["المولد اليدوي", "لمبة LED", "ماتور"],
      stepsEn: [
        "Connect the Hand Generator wires to the LED.",
        "Turn the crank handle slowly.",
        "Now turn it very fast!",
        "Disconnect the LED and connect the Motor instead.",
        "Can you make the fan spin with your hand power?"
      ],
      stepsAr: [
        "وصل أسلاك المولد اليدوي باللمبة (LED).",
        "لف ذراع المولد ببطء.",
        "الآن لف الذراع بسرعة كبيرة!",
        "افصل اللمبة ووصل الماتور بدلاً منها.",
        "هل يمكنك جعل المروحة تدور بقوة يدك؟"
      ],
      observationEn:
        "Which was harder to turn: lighting the LED or spinning the fan?",
      observationAr:
        "أيهما كان أصعب في التدوير: إضاءة اللمبة أم تدوير المروحة؟",
      funFactEn:
        "Wind turbines are just giant hand generators that are pushed by the wind instead of hands.",
      funFactAr:
        "توربينات الرياح العملاقة هي مجرد مولدات كبيرة، لكن الهواء هو من يحركها بدلاً من يدك.",
      challengeEn:
        "How slowly can you turn the handle and still keep the light ON?",
      challengeAr:
        "ما هو أبطأ دوران يمكنك فعله مع الحفاظ على اللمبة مضاءة؟",
      color: "bg-purple-500",
      theme: "purple"
    },
    {
      num: 5,
      icon: <PenTool size={40} />,
      titleEn: "City of Dots (Breadboard)",
      titleAr: "مدينة النقاط (لوحة التجارب)",
      objectivesEn: [
        "Learn to use a Breadboard.",
        "Connect components without twisting wires.",
        "Understand columns and rows."
      ],
      objectivesAr: [
        "تعلم استخدام لوحة التجارب (Breadboard).",
        "توصيل المكونات بدون ربط الأسلاك.",
        "فهم الصفوف والأعمدة."
      ],
      storyEn:
        "Twisting wires together is messy and they can break. Engineers use a 'Breadboard' to build neat circuits. Imagine it as a Lego base for electronics! It has hidden metal strips underneath the holes that connect components together. All the holes in one vertical column are connected. It keeps everything organized.",
      storyAr:
        "ربط الأسلاك ببعضها قد يكون فوضوياً وقد تنقطع. المهندسون يستخدمون 'لوحة التجارب' (Breadboard) لبناء دوائر مرتبة. تخيلها مثل قاعدة الليجو للإلكترونيات! توجد شرائط معدنية مخفية تحت الثقوب توصل القطع ببعضها. كل الثقوب في عمود رأسي واحد متصلة ببعضها. إنها تبقي كل شيء منظماً.",
      toolsEn: ["Breadboard", "LED", "Jumper Wires", "Battery"],
      toolsAr: ["لوحة تجارب", "لمبة LED", "أسلاك توصيل (Jumpers)", "بطارية"],
      stepsEn: [
        "Insert the LED legs into two different columns (e.g., Col 10 and Col 15).",
        "Insert a red wire into the SAME column as the Long Leg.",
        "Insert a black wire into the SAME column as the Short Leg.",
        "Connect the other ends of wires to the battery.",
        "It glows without touching components!"
      ],
      stepsAr: [
        "أدخل أرجل اللمبة في عمودين مختلفين (مثلاً عمود 10 وعمود 15).",
        "أدخل سلكاً أحمر في نفس العمود الموجود به الرجل الطويلة.",
        "أدخل سلكاً أسود في نفس العمود الموجود به الرجل القصيرة.",
        "وصل أطراف الأسلاك الأخرى بالبطارية.",
        "إنها تضيء دون أن تمسك المكونات بيدك!"
      ],
      observationEn:
        "Draw a line showing how the electricity moved through the board.",
      observationAr:
        "ارسم خطاً يوضح كيف انتقلت الكهرباء عبر الثقوب داخل اللوحة.",
      funFactEn:
        "It's called a 'Breadboard' because long ago, inventors used actual wooden boards for cutting bread to hammer nails into!",
      funFactAr:
        "سميت بهذا الاسم لأن المخترعين قديماً كانوا يستخدمون ألواح تقطيع الخبز الخشبية ويدقون فيها المسامير لبناء الدوائر!",
      challengeEn:
        "Build a circuit where the LED is far away from the battery using the board tracks.",
      challengeAr:
        "ابنِ دائرة تكون فيها اللمبة بعيدة عن البطارية مستخدماً مسارات اللوحة.",
      color: "bg-blue-500",
      theme: "blue"
    },
    {
      num: 6,
      icon: <Volume2 size={40} />,
      titleEn: "Lights & Sounds",
      titleAr: "أضواء وأصوات",
      objectivesEn: [
        "Differentiate output devices.",
        "Learn how a Buzzer works.",
        "Build a noise-making circuit."
      ],
      objectivesAr: [
        "التمييز بين وحدات الإخراج.",
        "معرفة كيف يعمل الجرس.",
        "بناء دائرة تصدر صوتاً."
      ],
      storyEn:
        "Electricity speaks many languages. If we send it to an LED, it says 'Light'. If we send it to a Buzzer, it says 'BEEP!'. The Buzzer has a special plate inside called a piezo disc that vibrates very fast when electricity hits it, creating sound waves that tickle your ears. It is like an electronic drum.",
      storyAr:
        "الكهرباء تتحدث لغات كثيرة. إذا أرسلناها للمبة تقول 'نور'. وإذا أرسلناها للجرس تقول 'بيييب!'. الجرس يحتوي على صفيحة خاصة بداخلة تسمى (بيزو) تهتز بسرعة جداً عندما تلمسها الكهرباء، فتصنع موجات صوتية تدغدغ أذنيك. إنه مثل طبلة إلكترونية صغيرة.",
      toolsEn: ["Active Buzzer", "Breadboard", "Battery", "Wires"],
      toolsAr: ["جرس (Buzzer)", "لوحة تجارب", "بطارية", "أسلاك"],
      stepsEn: [
        "Remove the LED from your breadboard.",
        "Look at the Buzzer, find the Long Leg (+).",
        "Insert the buzzer into the board.",
        "Connect the Red wire to the Long Leg column.",
        "Connect Black wire to Short leg. BEEP!"
      ],
      stepsAr: [
        "انزع اللمبة من لوحة التجارب.",
        "انظر للجرس، ابحث عن الرجل الطويلة (+).",
        "ركب الجرس في اللوحة.",
        "وصل السلك الأحمر بعمود الرجل الطويلة.",
        "وصل السلك الأسود بعمود الرجل القصيرة. بييييب!"
      ],
      observationEn:
        "Touch the buzzer while it's beeping. Do you feel a tickle?",
      observationAr:
        "المس سطح الجرس بإصبعك وهو يصدر صوتاً. هل تشعر بدغدغة الاهتزاز؟",
      funFactEn:
        "The vibration in the buzzer moves thousands of times per second, similar to a bee's wings.",
      funFactAr:
        "الاهتزاز داخل الجرس يتحرك آلاف المرات في الثانية الواحدة، تماماً مثل أجنحة النحلة.",
      challengeEn: "Try to tap out a secret code rhythm. Beep-Beep-Long Beep!",
      challengeAr: "حاول عمل شفرة سرية بصوت الجرس. تيت-تيت-تيييييت!",
      color: "bg-pink-500",
      theme: "pink"
    },
    {
      num: 7,
      icon: <Settings size={40} />,
      titleEn: "The Traffic Officer (Switch)",
      titleAr: "شرطي المرور (المفتاح)",
      objectivesEn: [
        "Control the flow of electricity.",
        "Understand Open vs Closed circuits.",
        "Install a Push Button."
      ],
      objectivesAr: [
        "التحكم في تدفق الكهرباء.",
        "فهم الدائرة المفتوحة والمغلقة.",
        "تركيب مفتاح ضغط (زر)."
      ],
      storyEn:
        "We don't want to disconnect wires every time to stop the machine. We use a 'Switch'! It acts like a drawbridge. When the bridge is down (ON), cars pass. When the bridge is up (OFF), cars stop. You are now the master of the circuit, controlling when it works with a single click.",
      storyAr:
        "لا نريد فصل الأسلاك بأيدينا كل مرة لإيقاف الآلة. نستخدم 'المفتاح'! إنه يعمل مثل الجسر المتحرك. عندما ينزل الجسر (ON)، تمر السيارات. وعندما يرتفع (OFF)، تتوقف. أنت الآن سيد الدائرة، تتحكم متى تعمل ومتى تتوقف بضغطة واحدة.",
      toolsEn: ["Push Button Switch", "Buzzer/LED", "Breadboard"],
      toolsAr: ["مفتاح ضغط (Push Button)", "جرس أو لمبة", "لوحة تجارب"],
      stepsEn: [
        "Place the Switch on the breadboard (across the middle gap).",
        "Connect the Battery (+) to one leg of the switch.",
        "Connect the other leg of the switch to the LED (+).",
        "Connect the LED (-) back to Battery (-).",
        "Press the button to fire the laser!"
      ],
      stepsAr: [
        "ضع المفتاح على اللوحة (بحيث يعبر الفاصل في المنتصف).",
        "وصل موجب البطارية (+) برجل واحدة للمفتاح.",
        "وصل الرجل الأخرى للمفتاح بموجب اللمبة (+).",
        "وصل سالب اللمبة (-) بسالب البطارية.",
        "اضغط الزر لتطلق شعاع الليزر!"
      ],
      observationEn: "What happens when you let go of the button? Why?",
      observationAr: "ماذا يحدث عندما ترفع إصبعك عن الزر؟ ولماذا؟",
      funFactEn:
        "The light switch on your wall works exactly the same way, but it stays ON until you flip it back.",
      funFactAr:
        "مفتاح النور في غرفتك يعمل بنفس الطريقة، لكنه يبقى شغالاً (ON) حتى تقلبه مرة أخرى.",
      challengeEn:
        "Can you send Morse Code messages using your switch?",
      challengeAr:
        "هل يمكنك إرسال رسائل بشفرة مورس باستخدام مفتاحك؟",
      color: "bg-teal-500",
      theme: "teal"
    },
    {
      num: 8,
      icon: <Lightbulb size={40} />,
      titleEn: "My Big Invention",
      titleAr: "مشروعي الكبير",
      objectivesEn: [
        "Apply all learned concepts.",
        "Design a mixed circuit.",
        "Present an invention."
      ],
      objectivesAr: [
        "تطبيق كل المفاهيم السابقة.",
        "تصميم دائرة مختلطة.",
        "تقديم اختراع للنور."
      ],
      storyEn:
        "Congratulations! You have learned the alphabet of electronics. Now write your own story. Use the motor, the buzzer, the lights, and the switches to build something new. Maybe a fan that lights up? Or a robot alarm? The sky is the limit! Today you are the Chief Engineer.",
      storyAr:
        "مبروك! لقد تعلمت حروف أبجدية الإلكترونيات. الآن اكتب قصتك الخاصة. استخدم الماتور، والجرس، والأضواء، والمفاتيح لتبني شيئاً جديداً. ربما مروحة تضيء؟ أو منبه للروبوت؟ خيالك هو حدودك! اليوم أنت كبير المهندسين.",
      toolsEn: ["All Components", "Imagination", "Paper for planning"],
      toolsAr: ["كل المكونات السابقة", "الخيال", "ورقة للتخطيط"],
      stepsEn: [
        "Think: What do I want to build?",
        "Draw: Sketch your circuit on paper first.",
        "Build: Put components on the breadboard.",
        "Test: Does it work? If not, debug it!",
        "Show: Explain your invention to the class."
      ],
      stepsAr: [
        "فكر: ماذا أريد أن أصنع؟",
        "ارسم: خطط لدائرتك على الورق أولاً.",
        "ابنِ: ركب المكونات على اللوحة.",
        "جرب: هل تعمل؟ إذا لا، حاول إصلاحها!",
        "اعرض: اشرح اختراعك لأصدقائك."
      ],
      observationEn:
        "What was the hardest part of your invention?",
      observationAr:
        "ما هو أصعب جزء واجهك أثناء بناء اختراعك؟",
      funFactEn:
        "Thomas Edison failed 1,000 times before inventing the lightbulb. Keep trying!",
      funFactAr:
        "توماس إديسون فشل 1000 مرة قبل اختراع المصباح. المحاولة هي سر النجاح!",
      challengeEn:
        "Give your invention a cool name and explain how it works to a friend.",
      challengeAr:
        "أطلق اسماً رائعاً على اختراعك واشرح كيف يعمل لصديقك.",
      color: "bg-indigo-600",
      theme: "indigo"
    }
  ];

  // 2. Build Pages Data Structure (2 pages per lesson)
  const buildPages = (lang) => {
    const isAr = lang === 'ar';
    const base = [
      {
        type: "cover",
        lang,
        title: isAr ? "المكتشف الصغير للإلكترونيات" : "Little Electronics Explorer",
        subtitle: isAr ? "دليلك لتصبح مخترعاً عبقرياً" : "Your Guide to Becoming a Genius Inventor",
        color: "bg-blue-600"
      },
      {
        type: "safety",
        lang,
        title: isAr ? "قواعد السلامة أولاً!" : "Safety First!",
        content: isAr
          ? [
              "لا تضع البطاريات في فمك أبداً.",
              "إذا شعرت بحرارة البطارية، اتركها وأخبر المدرب.",
              "حافظ على نظافة مكان عملك.",
              "ساعد أصدقاءك وتعاون معهم."
            ]
          : [
              "Do not put batteries in your mouth.",
              "If a battery feels hot, drop it and tell the teacher.",
              "Keep your workspace clean.",
              "Help your friends."
            ],
        color: "bg-red-500"
      }
    ];

    const lessonsPages = [];
    lessonsData.forEach((l) => {
      lessonsPages.push({
        type: "lesson-p1",
        lang,
        lessonNum: l.num,
        icon: l.icon,
        title: isAr ? l.titleAr : l.titleEn,
        story: isAr ? l.storyAr : l.storyEn,
        tools: isAr ? l.toolsAr : l.toolsEn,
        objectives: isAr ? l.objectivesAr : l.objectivesEn,
        color: l.color,
        theme: l.theme
      });

      lessonsPages.push({
        type: "lesson-p2",
        lang,
        lessonNum: l.num,
        icon: l.icon,
        title: isAr ? l.titleAr : l.titleEn,
        steps: isAr ? l.stepsAr : l.stepsEn,
        observation: isAr ? l.observationAr : l.observationEn,
        funFact: isAr ? l.funFactAr : l.funFactEn,
        challenge: isAr ? l.challengeAr : l.challengeEn,
        color: l.color,
        theme: l.theme
      });
    });

    const cert = {
      type: "certificate",
      lang,
      title: isAr ? "شهادة إتمام" : "Certificate of Completion",
      content: isAr
        ? "تشهد الأكاديمية بأن المهندس العبقري قد أتم بنجاح كورس الإلكترونيات."
        : "This certifies that the Genius Engineer has successfully completed the Electronics Course.",
      color: "bg-yellow-600"
    };

    return [...base, ...lessonsPages, cert];
  };

  const pages = [...buildPages("en"), ...buildPages("ar")];

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Trigger printing when printMode = true
  useEffect(() => {
    if (printMode) {
      const timeout = setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [printMode]);

  const PageContent = ({ page }) => {
    const isAr = page.lang === "ar";
    const dir = isAr ? "rtl" : "ltr";
    const font = isAr ? "font-serif" : "font-sans";

    const getBgTint = (theme) => `bg-${theme}-50`;
    const getBorderColor = (theme) => `border-${theme}-200`;
    const getTextColor = (theme) => `text-${theme}-800`;

    // COVER
    if (page.type === "cover") {
      return (
        <div
          className={`h-full flex flex-col items-center justify-center text-white p-8 text-center ${page.color} rounded-lg shadow-2xl relative overflow-hidden`}
          dir={dir}
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-white/5 rounded-full" />

          <div className="mb-8 p-6 bg-white/20 rounded-full backdrop-blur-sm shadow-xl">
            <Book size={100} />
          </div>
          <h1 className={`text-5xl font-extrabold mb-6 leading-tight ${font}`}>
            {page.title}
          </h1>
          <div className="w-32 h-3 bg-yellow-400 rounded-full my-6 shadow-md" />
          <p className={`text-3xl font-medium mb-2 ${font}`}>
            {page.subtitle}
          </p>

          <div className="mt-16 p-8 border-4 border-white rounded-xl w-3/4 bg-white/10 backdrop-blur-sm shadow-inner">
            <p
              className={`text-xl opacity-90 mb-4 font-bold ${font}`}
            >
              {isAr ? "اسم الطالب المخترع" : "Inventor Student Name"}
            </p>
            <div className="h-12 bg-white/20 rounded-lg border-b-2 border-white" />
          </div>
          <div className="absolute bottom-8 text-sm opacity-60 bg-black/20 px-6 py-2 rounded-full font-bold uppercase tracking-widest border border-white/20">
            {isAr ? "النسخة العربية" : "English Version"}
          </div>
        </div>
      );
    }

    // SAFETY
    if (page.type === "safety") {
      return (
        <div
          className={`h-full flex flex-col p-8 ${page.color} text-white rounded-lg shadow-2xl relative`}
          dir={dir}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="flex items-center justify-center mb-6 bg-white/20 p-4 rounded-full w-fit mx-auto shadow-lg z-10">
            <ShieldCheck size={70} />
          </div>
          <h2
            className={`text-5xl font-black text-center mb-8 ${font} z-10 drop-shadow-md`}
          >
            {page.title}
          </h2>

          <div className="flex-1 bg-white rounded-2xl p-8 space-y-6 shadow-2xl text-gray-800 z-10 flex flex-col justify-center">
            {page.content.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center p-5 bg-red-50 rounded-xl border-l-8 border-red-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-4xl font-black text-red-500 mx-4 leading-none">
                  {idx + 1}
                </span>
                <p className={`text-2xl font-bold text-gray-800 ${font}`}>
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // CERTIFICATE
    if (page.type === "certificate") {
      return (
        <div
          className={`h-full flex flex-col p-10 bg-white border-[20px] ${
            page.color === "bg-yellow-600"
              ? "border-yellow-500"
              : "border-blue-500"
          } rounded-lg shadow-2xl relative overflow-hidden`}
          dir={dir}
        >
          <div className="absolute inset-0 bg-yellow-50 opacity-50" />
          <div
            className={`absolute top-0 ${
              isAr ? "left-0" : "right-0"
            } p-6 z-20`}
          >
            <Award
              size={100}
              className="text-yellow-500 drop-shadow-lg"
            />
          </div>

          <div className="absolute inset-6 border-4 border-gray-800 border-double rounded-lg pointer-events-none z-10" />

          <div className="flex-1 flex flex-col items-center justify-center text-center z-20 pt-10">
            <h2
              className={`text-6xl font-black text-gray-900 mb-12 uppercase tracking-widest ${font} drop-shadow-sm`}
            >
              {page.title}
            </h2>

            <p
              className={`text-gray-700 text-4xl mb-16 max-w-3xl leading-relaxed ${font} italic font-bold`}
            >
              {page.content}
            </p>

            <div className="w-full max-w-2xl border-b-4 border-gray-900 mb-4" />
            <p
              className={`text-gray-500 text-xl mb-16 font-black uppercase tracking-wider ${font}`}
            >
              {isAr ? "اسم الطالب" : "Student Name"}
            </p>

            <div className="flex w-full justify-between px-20 mt-8 gap-16">
              <div className="text-center flex-1">
                <div className="border-b-4 border-gray-400 mb-2" />
                <p className={`text-gray-500 text-lg font-bold ${font}`}>
                  {isAr ? "التاريخ" : "Date"}
                </p>
              </div>
              <div className="text-center flex-1">
                <div className="border-b-4 border-gray-400 mb-2" />
                <p className={`text-gray-500 text-lg font-bold ${font}`}>
                  {isAr ? "المدرب" : "Instructor"}
                </p>
              </div>
            </div>

            <div className="mt-8 transform rotate-12">
              <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl border-4 border-yellow-300 ring-4 ring-yellow-500 ring-opacity-50">
                {isAr ? "معتمد" : "CERTIFIED"}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // LESSON PAGE 1
    if (page.type === "lesson-p1") {
      const bgTint = getBgTint(page.theme);
      const borderColor = getBorderColor(page.theme);
      const textColor = getTextColor(page.theme);

      return (
        <div
          className={`h-full flex flex-col ${bgTint} rounded-lg shadow-2xl overflow-hidden`}
          dir={dir}
        >
          <div
            className={`${page.color} p-6 text-white flex justify-between items-center shadow-lg relative z-10`}
          >
            <div>
              <span className="bg-black/20 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-sm border border-white/20">
                {isAr
                  ? `حصة ${page.lessonNum} - الجزء ١`
                  : `Lesson ${page.lessonNum} - Part 1`}
              </span>
              <h3
                className={`text-4xl font-black mt-2 drop-shadow-md ${font}`}
              >
                {page.title}
              </h3>
            </div>
            <div className="bg-white text-gray-800 p-4 rounded-2xl shadow-xl transform rotate-3">
              {page.icon}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
            <div
              className={`bg-white p-5 rounded-2xl border-l-8 ${page.color.replace(
                "bg-",
                "border-"
              )} shadow-md`}
            >
              <h4
                className={`flex items-center gap-2 text-lg uppercase ${textColor} font-black mb-3 ${font}`}
              >
                <CheckSquare size={24} />
                {isAr ? "ماذا سنتعلم اليوم؟" : "What will we learn?"}
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {page.objectives.map((obj, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-3 text-gray-700 font-bold text-lg ${font} bg-gray-50 p-2 rounded-lg`}
                  >
                    <div
                      className={`w-3 h-3 ${page.color} rounded-full shrink-0 shadow-sm`}
                    />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex-1">
              <h4
                className={`flex items-center gap-2 text-xl uppercase text-gray-600 font-black mb-4 ${font}`}
              >
                <Book
                  size={28}
                  className={textColor.replace(
                    "text-",
                    "text-opacity-70 "
                  )}
                />
                {isAr ? "القصة" : "The Story"}
              </h4>
              <p
                className={`text-gray-800 text-2xl leading-10 ${font} text-justify font-medium`}
              >
                {page.story}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-t-4 border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <h4
                className={`flex items-center gap-2 text-lg uppercase text-gray-400 font-bold mb-4 ${font}`}
              >
                <Settings size={20} />
                {isAr ? "صندوق الأدوات" : "Toolbox"}
              </h4>
              <div className="flex flex-wrap gap-3">
                {page.tools.map((tool, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 ${bgTint} px-4 py-3 rounded-xl border ${borderColor} shadow-sm`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm bg-gray-900/60">
                      {i + 1}
                    </div>
                    <span
                      className={`text-gray-800 font-bold text-xl ${font}`}
                    >
                      {tool}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`${bgTint} p-2 text-center text-gray-400 text-xs border-t ${borderColor} ${font}`}
          >
            {isAr
              ? `صفحة ${currentPage + 1} - نظرية`
              : `Page ${currentPage + 1} - Theory`}
          </div>
        </div>
      );
    }

    // LESSON PAGE 2
    if (page.type === "lesson-p2") {
      const bgTint = getBgTint(page.theme);

      return (
        <div
          className={`h-full flex flex-col ${bgTint} rounded-lg shadow-2xl overflow-hidden`}
          dir={dir}
        >
          <div className={`${page.color} h-6 w-full shadow-md`} />

          <div className="flex-1 p-6 flex flex-col space-y-6">
            <div className="flex justify-between items-end border-b-2 border-gray-200 pb-4">
              <h3
                className={`text-4xl font-black text-gray-800 ${font}`}
              >
                {page.title}
              </h3>
              <span
                className={`bg-gray-800 text-white px-3 py-1 rounded-lg font-bold text-lg uppercase ${font} shadow-lg`}
              >
                {isAr ? "عملي" : "Practice"}
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-white flex-1">
              <h4
                className={`flex items-center gap-3 text-2xl uppercase ${page.color.replace(
                  "bg-",
                  "text-"
                )} font-black mb-6 ${font}`}
              >
                <List size={32} />
                {isAr ? "خطوات التجربة" : "Experiment Steps"}
              </h4>
              <div className="space-y-4">
                {page.steps.map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${page.color} text-white text-xl font-black shrink-0 shadow-md`}
                    >
                      {i + 1}
                    </div>
                    <p
                      className={`text-2xl text-gray-700 font-bold pt-1 ${font}`}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-[#fffdf0] border-2 border-dashed border-gray-400 rounded-2xl p-6 shadow-inner">
              <div className="absolute -top-3 left-6 bg-gray-200 px-2 rounded-full border border-gray-400">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
              </div>

              <h4
                className={`flex items-center gap-2 text-md uppercase text-gray-500 font-black mb-3 ${font}`}
              >
                <ClipboardList size={20} />
                {isAr ? "سجل المهندس" : "Engineer's Log"}
              </h4>
              <p
                className={`text-2xl font-bold text-gray-800 mb-4 ${font}`}
              >
                {page.observation}
              </p>
              <div className="bg-gray-200/50 p-4 rounded-xl h-24 border-b-2 border-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-100 p-5 rounded-2xl border-2 border-yellow-200 shadow-sm hover:scale-105 transition-transform">
                <h4
                  className={`flex items-center gap-2 text-sm uppercase text-yellow-700 font-black mb-2 ${font}`}
                >
                  <Info size={18} />
                  {isAr ? "هل تعلم؟" : "Fun Fact"}
                </h4>
                <p
                  className={`text-gray-800 text-lg font-bold leading-tight ${font}`}
                >
                  {page.funFact}
                </p>
              </div>
              <div className="bg-gray-800 text-white p-5 rounded-2xl shadow-xl hover:scale-105 transition-transform border-2 border-gray-600">
                <h4
                  className={`flex items-center gap-2 text-sm uppercase text-yellow-400 font-black mb-2 ${font}`}
                >
                  <Star size={18} />
                  {isAr ? "تحدي البطل" : "Hero Challenge"}
                </h4>
                <p
                  className={`text-xl font-bold leading-tight ${font}`}
                >
                  {page.challenge}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${bgTint} p-2 text-center text-gray-400 text-xs border-t border-gray-200 ${font}`}
          >
            {isAr
              ? `صفحة ${currentPage + 1} - عملي`
              : `Page ${currentPage + 1} - Practice`}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4 font-sans book-root">
      {/* PRINT CSS */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            background: #ffffff !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .book-root {
            background: #ffffff !important;
            min-height: auto !important;
            padding: 0 !important;
          }
          .a4-page {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .a4-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Top bar (hidden in print) */}
      <div className="w-full max-w-[800px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 no-print">
        <h1 className="text-white font-bold text-xl opacity-80">
          Full Color A4 Book
        </h1>

        <div className="flex gap-3 items-center justify-between md:justify-end w-full">
          <div className="flex gap-3">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-3 rounded-full ${
                currentPage === 0
                  ? "bg-gray-600 text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/50"
              } transition-all`}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 bg-gray-700 rounded-full shadow-inner font-black text-white border border-gray-600 text-sm">
              {currentPage + 1} / {pages.length}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className={`p-3 rounded-full ${
                currentPage === pages.length - 1
                  ? "bg-gray-600 text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/50"
              } transition-all`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPrintMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 shadow-md shadow-emerald-500/40 transition-all"
          >
            <Book size={18} />
            <span>Generate A4 Book</span>
          </button>
        </div>
      </div>

      {/* A4 Containers */}
      {printMode ? (
        <div className="w-full flex flex-col items-center">
          {pages.map((p, idx) => (
            <div
              key={idx}
              className="a4-page bg-white overflow-hidden"
            >
              <PageContent page={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-[800px] aspect-[1/1.414] relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border-8 border-gray-700">
          <PageContent page={pages[currentPage]} />
        </div>
      )}

      <p className="mt-6 text-gray-400 text-sm font-medium no-print">
        Preview mode: A4 Portrait (Full Color Edition)
      </p>
    </div>
  );
};

export default BilingualBook;
