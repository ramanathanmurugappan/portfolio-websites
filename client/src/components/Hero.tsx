/**
 * Hero Component — V4 Full-Bleed Avatar (Apple-style split)
 * Left: edge-to-edge photo with parallax scroll
 * Right: staggered name reveal, typewriter role rotator, bio, animated counters
 * Below: infinite marquee badges
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';

// ── Constants ────────────────────────────────────────────────────────────────

const HEADLINE_WORDS = ['Hi,', "I'm", 'Ramanathan', '👋'];
const BIO = 'Gen AI Architect with 6+ years of experience building robust, end-to-end, enterprise-grade cross-platform AI products with high proficiency in ML Modeling and agentic frameworks.';

const ROLES = ['Gen AI Architect', 'LLM Engineer', 'AI Product Builder', 'ML Researcher', 'Agentic Systems Expert'];
const TYPE_SPEED_MS   = 60;
const DELETE_SPEED_MS = 35;
const PAUSE_MS        = 1800;

const SKELETON_DELAY_MS   = 400;
const AVATAR_PARALLAX_PX  = -80;
const COUNTER_DURATION_MS = 2800;

const STATS = [
  { value: 6,  suffix: '+', label: 'Years Exp'   },
  { value: 3,  suffix: '+', label: 'Companies'   },
  { value: 2,  suffix: '',  label: 'Publications' },
  { value: 20, suffix: '+', label: 'AI Projects'  },
];

// ── TypewriterRole ────────────────────────────────────────────────────────────

function TypewriterRole() {
  const [idx, setIdx]           = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const target = ROLES[idx];

    if (!deleting && displayed.length < target.length) {
      const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), TYPE_SPEED_MS);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === target.length) {
      const t = setTimeout(() => setDeleting(true), PAUSE_MS);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), DELETE_SPEED_MS);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx(i => (i + 1) % ROLES.length);
    }
  }, [displayed, deleting, idx]);

  return (
    <div className="flex items-center gap-[10px] h-[36px]">
      <span className="text-[13px] text-black/40 dark:text-white/40 font-medium flex-shrink-0">I am a</span>
      <span className="text-[clamp(16px,2.2vw,20px)] font-bold text-[#1e6ef4] tracking-[-0.01em]">
        {displayed}
        <span className="inline-block w-[2px] h-[18px] bg-[#1e6ef4] ml-[2px] align-middle animate-pulse rounded-full" />
      </span>
    </div>
  );
}

// ── CounterStat ───────────────────────────────────────────────────────────────

function CounterStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, COUNTER_DURATION_MS);
  return (
    <div ref={ref} className="flex flex-col gap-[3px]">
      <span className="text-[26px] md:text-[30px] font-bold tracking-[-0.03em] text-black dark:text-white tabular-nums leading-none">
        {count}{suffix}
      </span>
      <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold uppercase tracking-[0.07em]">
        {label}
      </span>
    </div>
  );
}

// ── Marquee data ──────────────────────────────────────────────────────────────

const DOT = <span className="text-black/20 dark:text-white/20 text-[13px] font-bold">✦</span>;

const TICKER_ITEMS: React.ReactNode[] = [
  <span className="text-[14px] font-bold text-[#1e6ef4] whitespace-nowrap">Gen AI Architect</span>, DOT,
  <span className="text-[14px] font-bold text-black/65 dark:text-white/65 whitespace-nowrap">6+ Years Experience</span>, DOT,
  <span className="text-[14px] font-bold text-[#1e6ef4] whitespace-nowrap">LLM Engineer</span>, DOT,
  <span className="text-[14px] font-bold text-black/65 dark:text-white/65 whitespace-nowrap">20+ AI Projects</span>, DOT,
  <span className="text-[14px] font-bold text-[#1e6ef4] whitespace-nowrap">RAG Pipelines</span>, DOT,
  <span className="text-[14px] font-bold text-black/65 dark:text-white/65 whitespace-nowrap">Multi-Agent Systems</span>, DOT,
  <span className="text-[14px] font-bold text-[#1e6ef4] whitespace-nowrap">AI Product Builder</span>, DOT,
  <span className="text-[14px] font-bold text-black/65 dark:text-white/65 whitespace-nowrap">3 Companies · Bengaluru</span>, DOT,
  <span className="text-[14px] font-bold text-[#1e6ef4] whitespace-nowrap">Enterprise Grade AI</span>, DOT,
  <span className="text-[14px] font-bold text-black/65 dark:text-white/65 whitespace-nowrap">2 Research Publications</span>, DOT,
];

const LOGO_DATA = [
  { src: '/images/tech-logos/python.svg',      name: 'Python',      invert: false },
  { src: '/images/tech-logos/pytorch.svg',     name: 'PyTorch',     invert: false },
  { src: '/images/tech-logos/langchain.svg',   name: 'LangChain',   invert: true  },
  { src: '/images/tech-logos/openai.svg',      name: 'OpenAI',      invert: true  },
  { src: '/images/tech-logos/huggingface.svg', name: 'HuggingFace', invert: false },
  { src: '/images/tech-logos/anthropic.svg',   name: 'Anthropic',   invert: true  },
  { src: '/images/tech-logos/crewai.svg',      name: 'CrewAI',      invert: true  },
  { src: '/images/tech-logos/tensorflow.svg',  name: 'TensorFlow',  invert: false },
  { src: '/images/tech-logos/docker.svg',      name: 'Docker',      invert: false },
  { src: '/images/tech-logos/aws.svg',         name: 'AWS',         invert: true  },
  { src: '/images/tech-logos/fastapi.svg',     name: 'FastAPI',     invert: false },
  { src: '/images/tech-logos/mlflow.svg',      name: 'MLflow',      invert: false },
  { src: '/images/tech-logos/airflow.svg',     name: 'Airflow',     invert: true  },
  { src: '/images/tech-logos/pandas.svg',      name: 'Pandas',      invert: true  },
  { src: '/images/tech-logos/streamlit.svg',   name: 'Streamlit',   invert: false },
  { src: '/images/tech-logos/deepgram.svg',    name: 'Deepgram',    invert: true  },
];

const LOGO_CHIPS: React.ReactNode[] = LOGO_DATA.map(({ src, name, invert }) => (
  <div className="flex flex-col items-center gap-[5px] px-[12px] py-[8px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.06]">
    <img src={src} alt={name} className={`w-[24px] h-[24px] object-contain ${invert ? 'dark:invert' : ''}`} />
    <span className="text-[8px] font-semibold text-black/45 dark:text-white/45 uppercase tracking-[0.06em] whitespace-nowrap">{name}</span>
  </div>
));

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:min-h-[90vh]">
      {/* Mobile skeleton image */}
      <div className="md:hidden bg-[#e5e5e5] dark:bg-[#111] animate-pulse flex-shrink-0" style={{ height: '54vh', minHeight: 320 }} />
      {/* Desktop skeleton panel */}
      <div className="hidden md:block md:w-[44%] bg-[#e5e5e5] dark:bg-[#111] animate-pulse" />
      <div className="flex-1 flex items-center px-[28px] md:px-[64px] pt-[16px] md:pt-0">
        <div className="flex flex-col gap-[20px] w-full max-w-[520px]">
          <div className="h-[14px] w-[140px] rounded-full bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
          <div className="flex flex-col gap-[10px]">
            <div className="h-[48px] w-[320px] max-w-full rounded-[12px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
            <div className="h-[32px] w-[220px] max-w-full rounded-[8px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
          </div>
          <div className="h-[72px] w-full rounded-[12px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
          <div className="flex gap-[32px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-[6px]">
                <div className="h-[28px] w-[44px] rounded-[8px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
                <div className="h-[10px] w-[52px] rounded-full bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export default function Hero() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, AVATAR_PARALLAX_PX]);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (showSkeleton) return <HeroSkeleton />;

  return (
    <div ref={heroRef} className="flex flex-col">

      {/* ── Split hero ── */}
      <div className="flex flex-col md:flex-row md:min-h-[90vh]">

        {/* Mobile-only — full-width hero image */}
        <div className="md:hidden relative overflow-hidden flex-shrink-0" style={{ height: '54vh', minHeight: 320 }}>
          <img
            src="/images/avatar-hero.png"
            alt="Ramanathan"
            className="w-full h-full object-cover object-top"
          />
          {/* Bottom gradient fade into page */}
          <div
            className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--white) 100%)' }}
          />
          {/* Dark overlay at top for readability if needed */}
          <div
            className="absolute inset-x-0 top-0 h-[20%] pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 100%)' }}
          />
        </div>

        {/* Desktop-only — full-bleed avatar panel */}
        <div className="hidden md:block md:w-[44%] relative overflow-hidden flex-shrink-0">
          <motion.img
            src="/images/avatar-hero.png"
            alt="Ramanathan"
            style={{ y: avatarY }}
            className="absolute inset-0 w-full h-[110%] object-cover object-top"
          />
          {/* Right-edge gradient fade */}
          <div
            className="absolute inset-y-0 right-0 w-[55%] pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent 0%, var(--white) 100%)' }}
          />
          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-[20%] pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--white) 100%)' }}
          />
        </div>

        {/* Right — text content */}
        <div className="flex-1 flex items-start md:items-center px-[28px] md:px-[56px] lg:px-[80px] pt-[8px] md:pt-0 pb-[48px] md:pb-0">
          <div className="flex flex-col gap-[24px] md:gap-[28px] w-full max-w-[540px]">

            {/* Status pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-[8px] w-fit"
            >
              <div className="w-[8px] h-[8px] rounded-full bg-[#35c759] status-online" />
              <span className="text-[12px] font-semibold text-black/50 dark:text-white/50">
                Available to connect
              </span>
            </motion.div>

            {/* Headline — staggered word reveal */}
            <motion.div
              className="flex flex-col gap-[8px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <h1 className="text-[clamp(32px,4.5vw,52px)] leading-[1.1] tracking-[-0.03em] font-bold">
                {HEADLINE_WORDS.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.07, ease: 'easeOut' }}
                    className="inline-block mr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              {/* Typewriter role rotator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
              >
                <TypewriterRole />
              </motion.div>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              className="text-[14px] md:text-[15px] text-black/55 dark:text-white/55 leading-[165%] font-medium"
            >
              {BIO}
            </motion.p>

            {/* Animated counter stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.62, ease: 'easeOut' }}
              className="flex gap-[28px] md:gap-[36px] py-[4px] border-y border-black/[0.06] dark:border-white/[0.06]"
            >
              {STATS.map((stat) => (
                <CounterStat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
              ))}
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Marquee strip ── */}
      <div className="flex flex-col gap-[16px] relative overflow-hidden py-[12px]">

        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-[160px] z-10 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(90deg, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, black 50%, transparent 100%)',
            background: 'linear-gradient(90deg, var(--white) 0%, transparent 100%)',
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-[160px] z-10 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(270deg, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(270deg, black 50%, transparent 100%)',
            background: 'linear-gradient(270deg, var(--white) 0%, transparent 100%)',
          }}
        />

        {/* Row 1 — D: Bold news ticker (left) */}
        <div className="overflow-hidden border-y border-black/[0.05] dark:border-white/[0.05] py-[10px]">
          <div className="flex items-center gap-[20px] w-max animate-marquee-left">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex-shrink-0">{item}</span>
            ))}
          </div>
        </div>

        {/* Row 2 — B: Tech logo parade (right) */}
        <div className="overflow-hidden py-[4px]">
          <div className="flex items-center gap-[12px] w-max animate-marquee-right">
            {[...LOGO_CHIPS, ...LOGO_CHIPS, ...LOGO_CHIPS, ...LOGO_CHIPS].map((chip, i) => (
              <span key={i} className="flex-shrink-0">{chip}</span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
