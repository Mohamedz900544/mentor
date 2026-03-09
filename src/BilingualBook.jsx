import { useEffect, useMemo, useState } from "react";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "Why Sparvi", href: "#whySparviSection" },
  { label: "Our Heroes", href: "#sparvi-heroes-section" },
  { label: "FAQ", href: "#faqSection" },
  { label: "Register", href: "#signup" },
];

const heroCards = [
  {
    name: "Omar – Grade 5",
    meta: "Built his first alarm system in Week 3",
    thumbnail:
      "https://images.pexels.com/photos/4144093/pexels-photo-4144093.jpeg?auto=compress&cs=tinysrgb&w=800",
    video:
      "https://www.youtube.com/embed/_9VUPq3SxOc?autoplay=1&playsinline=1&rel=0&modestbranding=1",
  },
  {
    name: "Lina – Grade 4",
    meta: "Turned curiosity into weekly “lab time”",
    thumbnail:
      "https://images.pexels.com/photos/4144094/pexels-photo-4144094.jpeg?auto=compress&cs=tinysrgb&w=800",
    video:
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1&rel=0&modestbranding=1",
  },
  {
    name: "Yusuf – Grade 6",
    meta: "Now teaching his younger brother circuits",
    thumbnail:
      "https://images.pexels.com/photos/4144097/pexels-photo-4144097.jpeg?auto=compress&cs=tinysrgb&w=800",
    video:
      "https://www.youtube.com/embed/ysz5P8B3a9k?autoplay=1&playsinline=1&rel=0&modestbranding=1",
  },
];

const whyCards = [
  {
    icon: "fa-chalkboard-teacher",
    title: "Live Instructor-Led Missions",
    description:
      "Kids don’t learn alone. A Sparvi coach leads each online session, explains every step, and answers questions in real time so no one gets lost.",
  },
  {
    icon: "fa-microchip",
    title: "Real Electronics Kit at Home",
    description:
      "Every student receives a Sparvi Lab kit with safe low-voltage components. They connect wires, LEDs, switches, sensors, and motors to see how real circuits behave.",
  },
  {
    icon: "fa-children",
    title: "Designed for Ages 8–14",
    description:
      "Lessons use clear language, big visuals, and age-appropriate challenges so both beginners and curious tinkerers can follow along and feel successful.",
  },
  {
    icon: "fa-display",
    title: "Screen Time With a Purpose",
    description:
      "Sessions are online, but hands are always busy building. Kids look at the screen to follow the mentor, then look down to wire, test, and tweak their own circuit.",
  },
  {
    icon: "fa-layer-group",
    title: "Structured Levels, Clear Progress",
    description:
      "Level 1 is an 8-session foundation course. After finishing it, kids can unlock higher levels with more advanced projects in sensors, robotics, and coding.",
  },
  {
    icon: "fa-shield-heart",
    title: "Parent Peace of Mind",
    description:
      "Safe parts, guided sessions, and small groups. You’ll know the schedule, what your child is building each week, and get simple summaries after every session.",
  },
];

const faqs = [
  {
    question: "What comes in the Sparvi Lab electronics kit?",
    answer:
      "The kit includes everything your child needs for the course: a breadboard, jumper wires, LEDs, resistors, a buzzer, switches, and a battery pack. Everything is low-voltage (safe for kids) and reusable for endless projects!",
  },
  {
    question: "What age group is this suitable for?",
    answer:
      "Our Level 1 curriculum is specifically designed for children ages 8 to 14. We use simplified terms and visual guides so younger kids can follow along, while the projects are complex enough to keep older kids engaged.",
  },
  {
    question: "Do parents need to help during the sessions?",
    answer:
      "Very minimally! Our instructors guide the students step-by-step. For children under 9, we recommend a parent stays nearby for the first session just to help them get comfortable with the call and the kit pieces.",
  },
  {
    question: "What happens if we miss a live class?",
    answer:
      "Don't worry! Every live session is recorded. We share the recording so your child can watch it and build the project at their own pace before the next class.",
  },
  {
    question: "Is prior coding or robotics experience required?",
    answer:
      "None at all! We start from zero. We teach what a circuit is, how electricity flows, and how to connect the very first wire. It's the perfect entry point for beginners.",
  },
];

const footerLinks = [
  {
    title: "Programs",
    links: [
      { label: "Electronics Level 1", href: "#top" },
      { label: "STEM Clubs", href: "#whySparviSection" },
      { label: "Success Stories", href: "#sparvi-heroes-section" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "#signup" },
      { label: "FAQ", href: "#faqSection" },
      { label: "Privacy & Terms", href: "#top" },
    ],
  },
];

function Header({ isScrolled, isDrawerOpen, onToggleDrawer, onCloseDrawer }) {
  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 shadow-lg backdrop-blur-md border-b border-slate-200/50 supports-[backdrop-filter]:bg-white/60"
            : "bg-transparent py-2"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:py-5">
          <a href="#top" className="group flex items-center gap-2 transition-transform hover:scale-105">
            <span
              className={`text-2xl font-black tracking-tighter transition-colors ${
                isScrolled ? "text-blue-600" : "text-white drop-shadow-md"
              }`}
            >
              Sparvi Lab
            </span>
          </a>
  
 
          <nav className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-8 text-sm font-bold tracking-wide">
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`relative px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 ${
                      index === 0
                        ? isScrolled
                          ? "text-amber-500 hover:text-amber-600"
                          : "text-amber-300 hover:text-amber-200 drop-shadow-sm"
                        : isScrolled
                        ? "text-slate-600 hover:text-blue-600"
                        : "text-white/90 hover:text-white drop-shadow-sm"
                    }`}
                  >
                    {item.label}
                    {index !== 0 && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-current transition-all duration-300 group-hover:w-2/3"></span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#top"
              aria-label="Language selector"
              className={`hidden h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 lg:inline-flex ${
                isScrolled
                  ? "border-slate-200 bg-slate-50 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              <i className="fa-solid fa-globe text-sm"></i>
            </a>
            <a
              href="#signup"
              aria-label="Register"
              className={`hidden h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 lg:inline-flex ${
                isScrolled
                  ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:border-amber-300"
                  : "border-white/20 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 backdrop-blur-sm"
              }`}
            >
              <i className="fa-solid fa-bolt-lightning text-sm"></i>
            </a>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isDrawerOpen}
              onClick={onToggleDrawer}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 lg:hidden ${
                isScrolled
                  ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                  : "border-white/20 bg-white/10 text-white backdrop-blur-sm"
              }`}
            >
              <i
                className={`fa-solid ${
                  isDrawerOpen ? "fa-xmark" : "fa-bars"
                }`}
              ></i>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition ${
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          role="presentation"
          onClick={onCloseDrawer}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        ></div>
        <div
          className={`absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white px-6 pb-8 pt-20 shadow-2xl transition-transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={onCloseDrawer}
              className="text-2xl text-slate-500 transition hover:text-slate-800"
            >
              &times;
            </button>
          </div>
          <ul className="space-y-8 text-lg font-semibold text-slate-900">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={onCloseDrawer}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-[5%] pb-12 pt-32"
      data-aos="fade-in"
      data-aos-duration="1000"
      style={{
        background:
          "radial-gradient(circle at top right, #1a4da1 0%, transparent 40%), radial-gradient(circle at bottom left, #0754a7 0%, transparent 40%), #000f2e",
      }}
    >
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:gap-20 lg:text-left">
        <div className="flex-1">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-200 backdrop-blur-sm">
            <span className="mr-2 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New Cohort Starting Soon
          </div>
          <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            Engaging live sessions and
            <br />
            <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
              kits to Learn Electronics
            </span>
            <span className="ml-4 inline-block -rotate-2 rounded-lg border-2 border-white/20 bg-amber-400 px-4 py-1 text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-transform hover:rotate-0 hover:scale-105">
              For kids
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed text-blue-100/90">
            Hands-on learning that sparks creativity. Build robots, learn
            circuits, and code your future with Sparvi Lab.
          </p>
          <div className="mt-10 flex w-full flex-col gap-5 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#signup"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-xl shadow-amber-400/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-400/40 focus:ring-4 focus:ring-amber-400/30"
            >
              Secure your seat!
              <i className="fa-solid fa-bolt-lightning transition-transform group-hover:scale-125 group-hover:text-amber-900"></i>
            </a>
            <a
              href="#sparvi-heroes-section"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/10 hover:border-white/40 focus:ring-4 focus:ring-white/20"
            >
              Hear from families
              <i className="fa-solid fa-circle-play transition-transform group-hover:scale-125"></i>
            </a>
          </div>
        </div>
        <div className="flex w-full flex-1 items-center justify-center lg:justify-end">
          <div 
            className="w-full max-w-lg"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-3xl filter"></div>
              <img
                src="https://cdn.shopify.com/s/files/1/0636/7084/5509/files/Robot.webp?v=1768269282"
                alt="Sparvi Lab Robot"
                className="relative w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroesSection({ activeVideoIndex, onPlayVideo }) {
  return (
    <section className="bg-slate-50 px-6 py-24" id="sparvi-heroes-section" data-aos="fade-up">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-blue-700">
            Success Stories
          </span>
          <h2 className="section-title text-4xl md:text-5xl pb-1">
            Hear from Our Heroes
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
            Real kids, real stories – how Sparvi Lab made STEM fun, hands-on, and
            confidence-boosting.
          </p>
        </div>
        
        <div className="mt-16 flex gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory">
          {heroCards.map((card, index) => {
            const isActive = activeVideoIndex === index;
            return (
              <article
                key={card.name}
                className="group relative min-w-[300px] max-w-[300px] flex-1 snap-center rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 pt-[140%]">
                  {!isActive && (
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <img
                        src={card.thumbnail}
                        alt={card.name}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 transition-opacity group-hover:opacity-70"></div>
                      
                      <button
                        type="button"
                        onClick={() => onPlayVideo(index)}
                        aria-label="Play video"
                        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-2xl text-slate-900 shadow-xl shadow-amber-400/30 transition-all duration-300 hover:scale-110 hover:bg-amber-300 active:scale-95 group-hover:shadow-amber-400/50"
                      >
                        <i className="fas fa-play ml-1"></i>
                      </button>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h3 className="text-2xl font-bold leading-tight">{card.name}</h3>
                        <p className="mt-2 text-sm font-medium text-white/90">{card.meta}</p>
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-black">
                      <iframe
                        src={card.video}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        title={card.name}
                      ></iframe>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhySparvi() {
  return (
    <section className="bg-white px-6 py-24" id="whySparviSection" data-aos="fade-up">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 md:text-4xl">
            Why Choose Sparvi Lab?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
             We combine the best of online learning with real-world hands-on building.
          </p>
        </div>
        
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-1 flex-col items-center gap-6">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-6 rounded-full bg-blue-100/80 blur-3xl filter"></div>
              <dotlottie-wc
                src="https://lottie.host/da2dc79c-aa3e-46dc-8bca-9aa5787b1625/7CWJv1tJxv.lottie"
                autoplay
                loop
                className="relative w-full drop-shadow-xl"
              ></dotlottie-wc>
            </div>
            
            <a
              href="#signup"
              className="group inline-flex items-center gap-3 rounded-full bg-amber-400 px-7 py-3.5 text-base font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-1 hover:bg-amber-300 hover:shadow-xl"
            >
              Secure your Seat!
              <i className="fa-solid fa-bolt text-slate-900 transition-transform group-hover:scale-125"></i>
            </a>
          </div>
          
          <div className="flex-1">
            <div className="grid gap-5 sm:grid-cols-2">
              {whyCards.map((card, index) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div
                    className="relative mb-4 flex shrink-0 items-center justify-center text-white"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #2563eb, #22d3ee)",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  
                  <h3 className="relative text-base font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ openIndex, onToggle }) {
  return (
    <section
      className="relative mx-auto max-w-4xl px-6 py-24"
      id="faqSection"
      data-aos="fade-up"
    >
      <div className="text-center mb-16">
        <h2 className="section-title text-4xl md:text-5xl pb-1">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Everything you need to know about the course and kit.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-amber-400 bg-white shadow-lg shadow-amber-100 ring-1 ring-amber-400"
                  : "border-slate-200 bg-white hover:border-amber-200 hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(index)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <span className={`text-lg font-bold transition-colors ${isOpen ? "text-slate-900" : "text-slate-700"}`}>
                  {item.question}
                </span>
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen ? "rotate-180 bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-500 group-hover:bg-amber-100"
                  }`}
                >
                  <i className="fa-solid fa-chevron-down text-sm"></i>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-0">
                  <p className="border-t border-slate-100 pt-4 text-base leading-relaxed text-slate-600">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SignupSection({ onSubmit }) {
  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-12" id="signup" data-aos="zoom-in">
      <div className="rounded-[2.5rem] bg-slate-900 px-6 py-16 text-center shadow-2xl shadow-slate-900/20 sm:px-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-amber-400/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-amber-400">
            Limited Spots Available
          </span>
          <h2 className="text-3xl font-black text-white md:text-5xl">
            Join the next <span className="text-amber-400">Sparvi Lab</span> cohort
          </h2>
          <p className="mt-6 text-lg text-slate-300">
            Leave your name and email and we’ll send you the upcoming start dates,
            kit details, and pricing options.
          </p>
          
          <form
            onSubmit={onSubmit}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <input
              type="text"
              required
              placeholder="Parent name"
              className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800 px-6 py-4 text-base text-white placeholder-slate-400 transition focus:border-amber-400 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-400/20"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800 px-6 py-4 text-base text-white placeholder-slate-400 transition focus:border-amber-400 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-400/20"
            />
            <button
              type="submit"
              className="group whitespace-nowrap rounded-2xl bg-amber-400 px-8 py-4 text-base font-bold text-slate-900 shadow-lg shadow-amber-400/20 transition-all hover:-translate-y-1 hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/40 focus:ring-4 focus:ring-amber-400/50"
            >
              Get Schedule
              <i className="fa-solid fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400">
            <i className="fa-solid fa-lock mr-2"></i>
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="relative bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e3a8a_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#1e3a8a_0%,transparent_40%)] opacity-40"></div>
      
      <div className="absolute -top-1 h-24 w-full overflow-hidden">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="h-full w-full fill-slate-50"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
      
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-12 pt-32 lg:flex-row">
        <div className="flex-1">
          <h2 className="text-3xl font-black tracking-tight text-white">Sparvi Lab</h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-400">
            Hands-on learning that sparks creativity. Build robots, learn
            circuits, and code your future – from the comfort of home.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/20 hover:scale-110">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/20 hover:scale-110">
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="#" aria-label="TikTok" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/20 hover:scale-110">
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>
        
        {footerLinks.map((group) => (
          <div key={group.title} className="lg:min-w-[160px]">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-500">{group.title}</div>
            <ul className="mt-6 space-y-4">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-slate-300 transition hover:text-white hover:underline hover:underline-offset-4">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        <div className="flex-1 lg:max-w-sm">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500">Join the Club</div>
          <p className="mt-6 text-base text-slate-400">
            Get the latest kit drops, free experiments, and early-bird
            discounts for young inventors.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              alert("Subscribed!");
            }}
            className="mt-6 space-y-3"
          >
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="relative mx-auto mt-12 flex max-w-7xl flex-col items-center gap-6 border-t border-white/5 px-6 py-8 text-center text-sm text-slate-500 md:flex-row md:justify-between md:text-left">
        <div>
          © {year} Sparvi Lab. All rights reserved.
          <span className="hidden md:inline"> • </span>
          <br className="md:hidden" />
          Designed for future innovators.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["Visa", "Mastercard", "Apple Pay", "Google Pay"].map((label) => (
            <span
              key={label}
              className="rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    // 0. Load Plus Jakarta Sans Font
    if (!document.querySelector('link[href*="Plus+Jakarta+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap";
      document.head.appendChild(link);
    }

    // 1. Load Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(link);
    }

    // 2. Load Tailwind CSS (via CDN for standalone usage)
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    // 3. Load DotLottie Player
    if (!document.querySelector('script[src*="dotlottie-wc"]')) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@lottiefiles/dotlottie-wc@latest/dist/dotlottie-wc.js";
      script.type = "module";
      document.head.appendChild(script);
    }

    // 4. Load AOS (Animate On Scroll) Styles
    if (!document.querySelector('link[href*="aos.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/aos@2.3.1/dist/aos.css";
      document.head.appendChild(link);
    }

    // 5. Load AOS Script and Initialize
    if (!document.querySelector('script[src*="aos.js"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/aos@2.3.1/dist/aos.js";
      script.onload = () => {
        if (window.AOS) {
          window.AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: "ease-out-cubic",
          });
        }
      };
      document.head.appendChild(script);
    } else if (window.AOS) {
      // If already loaded, just refresh
      window.AOS.refresh();
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isDrawerOpen]);

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    alert("Thank you! We will be in touch soon.");
  };

  return (
    <div className="bg-slate-50 text-slate-700">
      <style>{`
        .section-title {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
        }
      `}</style>
      <Header
        isScrolled={isScrolled}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        onCloseDrawer={() => setIsDrawerOpen(false)}
      />
      <main>
        <Hero />
        <HeroesSection
          activeVideoIndex={activeVideoIndex}
          onPlayVideo={(index) => setActiveVideoIndex(index)}
        />
        <WhySparvi />
        <FaqSection
          openIndex={openFaqIndex}
          onToggle={(index) =>
            setOpenFaqIndex((prev) => (prev === index ? -1 : index))
          }
        />
        <SignupSection onSubmit={handleSignupSubmit} />
      </main>
      <Footer />
    </div>
  );
}
