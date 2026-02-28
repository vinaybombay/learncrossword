const NAV_LINKS = ['Learn', 'Practice', 'Library', 'About'];

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A2A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    title: 'Identify the Definition',
    body: 'Every cryptic clue hides a real definition — usually sitting quietly at the very start or end. Your first move is to find it.',
    example: '"Confused artist paints backwards (4)"  →  The definition is "Confused"',
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A2A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
    title: 'Decode the Wordplay',
    body: 'The rest of the clue is a coded instruction. Anagrams, hidden words, containers, reversals — each type has a signature. We teach you to read them all.',
    example: '"paints backwards" is a reversal indicator  →  STNIAP → STRAP? No: TAPS',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A2A43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Build the Answer',
    body: 'When the definition and the wordplay both point to the same word, the answer reveals itself. No guessing. Pure, satisfying logic.',
    example: '"Confused" + wordplay both give DAZE  →  Answer: DAZE ✓',
  },
];

function LightbulbIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4C14.06 4 6 12.06 6 22C6 29.2 10.2 35.38 16.24 38.4V42C16.24 43.1 17.14 44 18.24 44H29.76C30.86 44 31.76 43.1 31.76 42V38.4C37.8 35.38 42 29.2 42 22C42 12.06 33.94 4 24 4Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.06"
      />
      <line x1="17" y1="47" x2="31" y2="47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="51" x2="29" y2="51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-navy">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="bg-navy sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 text-white">
            <LightbulbIcon size={26} />
            <span className="text-lg font-bold tracking-tight">LearnCrossword</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-150">
                  {link}
                </a>
              </li>
            ))}
            <li>
              <a href="#" className="bg-orange text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-150">
                Start Learning
              </a>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button className="md:hidden text-slate-300 hover:text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">

            {/* Left: Text */}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-orange mb-5">
                AI-powered cryptic crossword coaching
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-navy leading-tight mb-6">
                Learn Cryptic Crosswords<br />the Smart Way.
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-3 max-w-lg">
                Step-by-step AI coaching.
              </p>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
                Decode clues. Understand logic. Think like an expert.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="bg-orange text-white font-semibold px-7 py-3.5 rounded-md hover:opacity-90 transition-opacity duration-150"
                >
                  Start Learning
                </a>
                <a
                  href="#how-it-works"
                  className="text-navy font-medium text-sm underline underline-offset-4 hover:text-slate-600 transition-colors duration-150"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative text-navy">
                {/* Decorative crossword squares */}
                <div className="absolute -top-6 -left-8 grid grid-cols-3 gap-1 opacity-10">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-7 h-7 border border-navy rounded-sm ${[1, 5, 7].includes(i) ? 'bg-navy' : ''}`} />
                  ))}
                </div>
                <div className="absolute -bottom-4 -right-6 grid grid-cols-3 gap-1 opacity-10">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-7 h-7 border border-navy rounded-sm ${[0, 3, 8].includes(i) ? 'bg-navy' : ''}`} />
                  ))}
                </div>

                {/* Main lightbulb */}
                <div className="relative z-10 p-8">
                  <LightbulbIcon size={180} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section id="how-it-works" className="bg-neutral py-24 px-6">
          <div className="max-w-6xl mx-auto">

            <div className="mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-orange mb-3">The Method</p>
              <h2 className="text-3xl font-bold text-navy">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="bg-white border border-navy/10 rounded-lg p-8 hover:border-navy/30 transition-colors duration-200 group"
                >
                  {/* Step number + icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-navy/20 text-4xl font-bold leading-none select-none">{step.number}</div>
                    <div className="text-navy">{step.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-navy mb-3">{step.title}</h3>

                  {/* Body */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{step.body}</p>

                  {/* Example — faint rule + example line */}
                  <div className="border-t border-navy/8 pt-5">
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">{step.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-navy py-6 px-6 text-center">
        <p className="text-slate-500 text-sm">© 2026 LearnCrossword.in</p>
      </footer>

    </div>
  );
}
