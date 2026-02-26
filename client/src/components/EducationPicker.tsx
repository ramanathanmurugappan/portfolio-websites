/**
 * EducationPicker — 8 live layout options for Academic Background
 * Pick your favourite, then we'll bake it into Education.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { useCountUp } from '../hooks/useCountUp';

// ── Education data ─────────────────────────────────────────────────────────────

const EDU = {
  degree: 'M.E. Mechatronics',
  university: 'Anna University',
  campus: 'M.I.T Campus, Chennai',
  period: '2018 – 2020',
  cgpa: 8.2,
  coursework: ['Machine Learning', 'Deep Learning', 'Control Systems', 'Robotics', 'Data Science', 'Signal Processing'],
  research: {
    org: 'Solarillion Foundation',
    role: 'Research & Teaching Assistant',
    period: 'Aug 2018 – May 2020',
    papers: 2,
    output: '2 published papers at IEEE & FICC on ML applications for financial inclusion',
  },
};

const ACCENT = '#1e6ef4';
const PURPLE = '#6366f1';

// ── Picker Label ───────────────────────────────────────────────────────────────

function PLabel({ id, title }: { id: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ background: ACCENT, color: '#fff', fontWeight: 800, fontSize: 12, padding: '3px 14px', borderRadius: 20 }}>{id}</span>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#888' }}>{title}</span>
    </div>
  );
}

// ── A: Flip Card Grid ─────────────────────────────────────────────────────────

function FlipCard({ front, back, color = ACCENT }: {
  front: React.ReactNode; back: React.ReactNode; color?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ perspective: 900 }} onClick={() => setFlipped(f => !f)} className="cursor-pointer select-none">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: 200 }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-[24px] flex flex-col items-center justify-center gap-[12px] p-[20px] bg-[#f7f7f7] dark:bg-[#1a1a1a]"
          style={{ backfaceVisibility: 'hidden', border: `1.5px solid ${color}28` }}>
          {front}
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full absolute bottom-[14px] right-[14px]"
            style={{ background: `${color}18`, color }}>Flip ↺</span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-[24px] flex flex-col items-center justify-center gap-[10px] p-[20px] text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: `linear-gradient(135deg, ${color} 0%, ${PURPLE} 100%)` }}>
          {back}
          <span className="text-[8px] font-bold text-white/60 uppercase tracking-[0.08em] absolute bottom-[14px]">Tap to flip back</span>
        </div>
      </motion.div>
    </div>
  );
}

function OptionA() {
  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
        <FlipCard
          color={ACCENT}
          front={<>
            <span className="text-[32px]">🎓</span>
            <p className="text-[14px] font-extrabold text-black dark:text-white text-center leading-tight">{EDU.degree}</p>
            <p className="text-[11px] text-black/50 dark:text-white/50 text-center">{EDU.university}</p>
          </>}
          back={<>
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.08em]">Graduation</p>
            <p className="text-[32px] font-extrabold text-white">{EDU.period}</p>
            <p className="text-[12px] text-white/70">{EDU.campus}</p>
          </>}
        />
        <FlipCard
          color="#8b5cf6"
          front={<>
            <span className="text-[32px]">📊</span>
            <p className="text-[14px] font-extrabold text-black dark:text-white">CGPA {EDU.cgpa} / 10</p>
            <div className="flex flex-wrap justify-center gap-[4px] mt-[4px]">
              {EDU.coursework.slice(0, 3).map(c => (
                <span key={c} className="text-[8px] font-semibold px-[6px] py-[2px] rounded-full"
                  style={{ background: '#8b5cf618', color: '#8b5cf6' }}>{c}</span>
              ))}
            </div>
          </>}
          back={<>
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.08em] mb-[4px]">Coursework</p>
            {EDU.coursework.map(c => (
              <span key={c} className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full bg-white/20 text-white">{c}</span>
            ))}
          </>}
        />
        <FlipCard
          color="#00b388"
          front={<>
            <span className="text-[32px]">🔬</span>
            <p className="text-[13px] font-extrabold text-black dark:text-white text-center">{EDU.research.org}</p>
            <p className="text-[10px] text-black/50 dark:text-white/50 text-center">{EDU.research.role}</p>
          </>}
          back={<>
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.08em]">Research Output</p>
            <p className="text-[28px] font-extrabold text-white">{EDU.research.papers} Papers</p>
            <p className="text-[10px] text-white/70 text-center">IEEE · FICC Conferences</p>
          </>}
        />
      </div>
      <p className="text-center text-[11px] text-black/25 dark:text-white/25">Tap any card to flip ↺</p>
    </div>
  );
}

// ── B: Vertical Timeline ──────────────────────────────────────────────────────

function OptionB() {
  const entries = [
    { icon: '🎓', title: EDU.degree, org: EDU.university, sub: EDU.campus, period: EDU.period, color: ACCENT, detail: `CGPA ${EDU.cgpa}/10 · ${EDU.coursework.join(' · ')}` },
    { icon: '🔬', title: EDU.research.role, org: EDU.research.org, sub: EDU.research.output, period: EDU.research.period, color: '#00b388', detail: `${EDU.research.papers} Papers published at IEEE & FICC` },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="relative flex flex-col">
        {/* Spine */}
        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-black/[0.07] dark:bg-white/[0.07]" />

        {entries.map((e, i) => (
          <motion.div key={i}
            className={`flex gap-[24px] py-[20px] ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.15, ease: 'easeOut' }}>
            {/* Card side */}
            <div className="flex-1 ml-[44px] md:ml-0">
              <div className="rounded-[20px] bg-[#f7f7f7] dark:bg-[#1a1a1a] overflow-hidden card-hover cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ border: `1.5px solid ${e.color}20` }}>
                <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${e.color}, ${PURPLE})` }} />
                <div className="p-[20px] flex flex-col gap-[6px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: e.color }}>{e.period}</span>
                    <span className="text-[11px]" style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', display: 'inline-block' }}>▾</span>
                  </div>
                  <p className="text-[15px] font-extrabold text-black dark:text-white">{e.title}</p>
                  <p className="text-[12px] font-semibold" style={{ color: e.color }}>{e.org}</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">{e.sub}</p>
                  <AnimatePresence>
                    {open === i && (
                      <motion.p className="text-[11px] text-black/60 dark:text-white/60 pt-[8px] border-t border-black/[0.06] dark:border-white/[0.06] mt-[4px]"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}>
                        {e.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {/* Centre dot */}
            <div className="absolute left-[13px] md:left-1/2 md:-translate-x-1/2 w-[14px] h-[14px] rounded-full flex-shrink-0 z-10 mt-[24px]"
              style={{ background: e.color, boxShadow: `0 0 0 4px ${e.color}25` }} />
            {/* Empty opposite side */}
            <div className="flex-1 hidden md:block" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── C: Sticky Chapter Split ────────────────────────────────────────────────────

function OptionC() {
  const [tab, setTab] = useState(0);
  const tabs = [
    {
      label: 'Degree', icon: '🎓', color: ACCENT,
      title: EDU.degree, sub: EDU.university, badge: EDU.period,
      body: (
        <div className="flex flex-col gap-[14px]">
          <p className="text-[13px] text-black/60 dark:text-white/60">{EDU.campus}</p>
          <div className="flex items-center gap-[10px]">
            <span className="text-[28px] font-extrabold text-black dark:text-white">{EDU.cgpa}</span>
            <span className="text-[12px] text-black/40 dark:text-white/40 font-semibold">/ 10 CGPA</span>
          </div>
          <div className="flex flex-col gap-[10px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/30 dark:text-white/30">Coursework</p>
            <div className="flex flex-wrap gap-[6px]">
              {EDU.coursework.map(c => (
                <span key={c} className="text-[10px] font-semibold px-[9px] py-[3px] rounded-full"
                  style={{ background: `${ACCENT}14`, color: ACCENT }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Research', icon: '🔬', color: '#00b388',
      title: EDU.research.org, sub: EDU.research.role, badge: EDU.research.period,
      body: (
        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {[
              `Published ${EDU.research.papers} research papers at IEEE & FICC international conferences`,
              'Focused on ML applications for financial inclusion and predictive analytics',
              'Served as Teaching Assistant alongside research responsibilities',
            ].map((h, j) => (
              <div key={j} className="flex gap-[12px] items-start py-[12px] first:pt-0 last:pb-0">
                <div className="w-[6px] h-[6px] rounded-full mt-[5px] flex-shrink-0" style={{ background: '#00b388' }} />
                <p className="text-[13px] text-black/65 dark:text-white/65 leading-[165%]">{h}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];
  const active = tabs[tab];

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="flex flex-col md:flex-row rounded-[24px] overflow-hidden card-hover">
        {/* Left panel */}
        <div className="md:w-[260px] flex-shrink-0 flex flex-col justify-between p-[24px] border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]"
          style={{ background: `linear-gradient(155deg, ${active.color}12 0%, ${active.color}04 100%)`, transition: 'background 0.4s ease' }}>
          <div className="flex flex-col gap-[14px]">
            <span className="text-[32px]">{active.icon}</span>
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-[20px] font-extrabold text-black dark:text-white leading-tight">{active.title}</p>
              <p className="text-[11px] text-black/50 dark:text-white/50 mt-[4px]">{active.sub}</p>
              <span className="inline-block mt-[8px] px-[9px] py-[3px] rounded-[7px] text-[10px] font-bold"
                style={{ background: `${active.color}18`, color: active.color }}>{active.badge}</span>
            </motion.div>
          </div>
          <div className="flex md:flex-col gap-[6px] mt-[20px]">
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setTab(i)}
                className="flex items-center gap-[10px] rounded-[12px] px-[12px] py-[10px] min-h-[44px] transition-all duration-200 text-left w-full"
                style={{ background: tab === i ? `${t.color}18` : 'transparent', border: `1.5px solid ${tab === i ? t.color + '35' : 'transparent'}` }}>
                <span className="text-[16px]">{t.icon}</span>
                <span className="text-[12px] font-bold text-black dark:text-white">{t.label}</span>
                {tab === i && <div className="ml-auto w-[5px] h-[5px] rounded-full" style={{ background: t.color }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 p-[24px] md:p-[32px] flex flex-col gap-[16px] bg-white dark:bg-[#111]">
          <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.1em]">Details</p>
          {active.body}
        </motion.div>
      </div>
    </div>
  );
}

// ── D: Animated Progress Bars ─────────────────────────────────────────────────

const SUBJECT_SCORES: { name: string; pct: number; color: string }[] = [
  { name: 'Machine Learning', pct: 94, color: ACCENT },
  { name: 'Deep Learning', pct: 88, color: '#6366f1' },
  { name: 'Data Science', pct: 90, color: '#8b5cf6' },
  { name: 'Control Systems', pct: 80, color: '#00b388' },
  { name: 'Signal Processing', pct: 76, color: '#f59e0b' },
  { name: 'Robotics', pct: 72, color: '#ef4444' },
];

function AnimBar({ name, pct, color, delay }: { name: string; pct: number; color: string; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      const dur = 900;
      const step = (now: number) => {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setWidth(Math.round(ease * pct));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, pct, delay]);

  return (
    <div ref={barRef} className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-black dark:text-white">{name}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{width}%</span>
      </div>
      <div className="h-[7px] rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full transition-none"
          style={{ width: `${width}%`, background: `linear-gradient(to right, ${color}, ${PURPLE})`, transition: 'none' }} />
      </div>
    </div>
  );
}

function OptionD() {
  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="flex flex-col md:flex-row gap-[16px]">
        {/* Left: degree info */}
        <div className="flex flex-col gap-[16px] md:w-[300px] flex-shrink-0 constellation-bg rounded-[24px] p-[28px]">
          <span className="text-[40px]">🎓</span>
          <div>
            <p className="text-[20px] font-extrabold text-black dark:text-white leading-tight">{EDU.degree}</p>
            <p className="text-[12px] font-semibold mt-[4px]" style={{ color: ACCENT }}>{EDU.university}</p>
            <p className="text-[11px] text-black/50 dark:text-white/50 mt-[2px]">{EDU.campus}</p>
          </div>
          <div className="flex gap-[16px]">
            <div className="flex flex-col">
              <span className="text-[28px] font-extrabold text-black dark:text-white">{EDU.cgpa}</span>
              <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold">CGPA / 10</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[28px] font-extrabold text-black dark:text-white">{EDU.research.papers}</span>
              <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold">Papers</span>
            </div>
          </div>
          <span className="inline-block px-[10px] py-[4px] rounded-[8px] text-[10px] font-bold w-fit"
            style={{ background: `${ACCENT}18`, color: ACCENT }}>{EDU.period}</span>
        </div>

        {/* Right: animated bars */}
        <div className="flex-1 rounded-[24px] constellation-bg p-[28px] flex flex-col gap-[18px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/40 dark:text-white/40">Coursework Proficiency</p>
          {SUBJECT_SCORES.map((s, i) => (
            <AnimBar key={s.name} {...s} delay={i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── E: Glassmorphic Card ──────────────────────────────────────────────────────

function OptionE() {
  return (
    <div className="flex flex-col gap-[32px]" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0e1528 100%)', borderRadius: 28, overflow: 'hidden', padding: '40px 0' }}>
      <div className="container">
        <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      </div>
      <div className="container flex flex-col md:flex-row gap-[16px]">
        {/* Main glass card */}
        <motion.div
          className="flex-1 rounded-[28px] p-[32px] flex flex-col gap-[20px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: `0 8px 40px ${ACCENT}20`,
          }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          {/* Glow dot */}
          <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[24px]"
            style={{ background: `${ACCENT}22`, boxShadow: `0 0 24px ${ACCENT}40` }}>🎓</div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-[8px]" style={{ color: ACCENT }}>{EDU.period} · {EDU.campus}</p>
            <h3 className="text-[26px] font-extrabold text-white leading-tight tracking-[-0.02em]">{EDU.degree}</h3>
            <p className="text-[14px] font-semibold mt-[4px]" style={{ color: ACCENT }}>{EDU.university}</p>
          </div>
          <div className="flex gap-[20px]">
            <div className="flex flex-col">
              <span className="text-[32px] font-extrabold text-white">{EDU.cgpa}</span>
              <span className="text-[10px] text-white/40 font-semibold">CGPA / 10</span>
            </div>
            <div className="w-[1px] bg-white/[0.08]" />
            <div className="flex flex-col">
              <span className="text-[32px] font-extrabold text-white">{EDU.research.papers}</span>
              <span className="text-[10px] text-white/40 font-semibold">Papers</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {EDU.coursework.map(c => (
              <span key={c} className="text-[9px] font-semibold px-[9px] py-[3px] rounded-full text-white/70"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${ACCENT}35` }}>{c}</span>
            ))}
          </div>
        </motion.div>

        {/* Research mini card */}
        <motion.div
          className="md:w-[240px] rounded-[24px] p-[24px] flex flex-col gap-[14px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,179,136,0.15)',
          }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
          <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[20px]"
            style={{ background: 'rgba(0,179,136,0.2)', boxShadow: '0 0 20px rgba(0,179,136,0.3)' }}>🔬</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b388]">Research</p>
          <p className="text-[14px] font-extrabold text-white leading-tight">{EDU.research.org}</p>
          <p className="text-[10px] text-white/50 leading-snug">{EDU.research.role}</p>
          <p className="text-[10px] text-white/40">{EDU.research.period}</p>
          <div className="mt-auto pt-[12px] border-t border-white/[0.07]">
            <p className="text-[10px] text-white/50 leading-relaxed">{EDU.research.output}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── F: Bento Grid ─────────────────────────────────────────────────────────────

function OptionF() {
  const tiles = [
    { span: 'md:col-span-2', content: (
      <div className="flex flex-col gap-[8px] h-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">University</p>
        <p className="text-[22px] font-extrabold text-black dark:text-white leading-tight">{EDU.university}</p>
        <p className="text-[12px] font-semibold" style={{ color: ACCENT }}>{EDU.campus}</p>
        <p className="text-[12px] text-black/50 dark:text-white/50 mt-auto">{EDU.period}</p>
      </div>
    )},
    { span: '', content: (
      <div className="flex flex-col items-center justify-center h-full gap-[4px]">
        <span className="text-[40px] font-extrabold text-black dark:text-white">{EDU.cgpa}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-40">CGPA / 10</span>
      </div>
    )},
    { span: '', content: (
      <div className="flex flex-col items-center justify-center h-full gap-[4px]">
        <span className="text-[40px]">🎓</span>
        <span className="text-[11px] font-bold text-black dark:text-white text-center leading-tight">{EDU.degree}</span>
      </div>
    )},
    { span: '', content: (
      <div className="flex flex-col items-center justify-center h-full gap-[4px]">
        <span className="text-[36px] font-extrabold text-black dark:text-white">{EDU.research.papers}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] opacity-40">Published Papers</span>
        <span className="text-[8px] font-semibold opacity-50">IEEE · FICC</span>
      </div>
    )},
    { span: 'md:col-span-2', content: (
      <div className="flex flex-col gap-[8px] h-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Research</p>
        <p className="text-[16px] font-extrabold text-black dark:text-white">{EDU.research.org}</p>
        <p className="text-[11px] text-black/50 dark:text-white/50">{EDU.research.role}</p>
        <p className="text-[10px] text-black/35 dark:text-white/35 mt-auto">{EDU.research.period}</p>
      </div>
    )},
    { span: 'md:col-span-3', content: (
      <div className="flex flex-col gap-[10px] h-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Coursework</p>
        <div className="flex flex-wrap gap-[6px]">
          {EDU.coursework.map(c => (
            <span key={c} className="text-[10px] font-semibold px-[10px] py-[4px] rounded-full"
              style={{ background: `${ACCENT}14`, color: ACCENT }}>{c}</span>
          ))}
        </div>
      </div>
    )},
  ];

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
        {tiles.map((tile, i) => (
          <motion.div key={i}
            className={`${tile.span} rounded-[20px] constellation-bg p-[24px] min-h-[120px] card-hover`}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}>
            {tile.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── G: Hexagonal Network (SVG) ────────────────────────────────────────────────

const HEX_R = 52;
const CX = 280, CY = 188;
const DIST = 128;

function hexPoints(cx: number, cy: number, r: number) {
  return [30, 90, 150, 210, 270, 330]
    .map(a => { const rad = (a * Math.PI) / 180; return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`; })
    .join(' ');
}

const SATELLITES = [
  { label: EDU.degree.split(' ').slice(0,2).join(' '), sub: 'Degree',   angle: 0   },
  { label: EDU.period,                                  sub: 'Period',   angle: 60  },
  { label: `${EDU.cgpa} / 10`,                          sub: 'CGPA',     angle: 120 },
  { label: 'Chennai, IN',                               sub: 'Location', angle: 180 },
  { label: EDU.research.org,                            sub: 'Research', angle: 240 },
  { label: `${EDU.research.papers} Papers`,             sub: 'Output',   angle: 300 },
];

function OptionG() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />
      <div className="constellation-bg rounded-[24px] overflow-hidden flex flex-col items-center">
        <svg width="100%" viewBox="0 0 560 376" style={{ display: 'block', maxHeight: 380 }}>
          {/* Connection lines */}
          {SATELLITES.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const sx = CX + DIST * Math.cos(rad), sy = CY + DIST * Math.sin(rad);
            return (
              <line key={i} x1={CX} y1={CY} x2={sx} y2={sy}
                stroke={ACCENT} strokeWidth={hov === i ? 1.8 : 0.8}
                strokeOpacity={hov === i ? 0.6 : 0.2} style={{ transition: 'all 0.2s' }} />
            );
          })}

          {/* Satellite hexes */}
          {SATELLITES.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const sx = CX + DIST * Math.cos(rad), sy = CY + DIST * Math.sin(rad);
            const isHov = hov === i;
            return (
              <g key={i} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
                <polygon points={hexPoints(sx, sy, HEX_R - 4)}
                  fill={isHov ? `${ACCENT}18` : 'var(--grey, #f7f7f7)'}
                  stroke={ACCENT} strokeWidth={isHov ? 2 : 1}
                  strokeOpacity={isHov ? 0.8 : 0.25}
                  style={{ transition: 'all 0.2s' }} />
                <text x={sx} y={sy - 6} textAnchor="middle" fontSize={9} fontWeight={700}
                  fill={ACCENT} style={{ pointerEvents: 'none' }}>{s.sub.toUpperCase()}</text>
                <text x={sx} y={sy + 7} textAnchor="middle" fontSize={8} fontWeight={600}
                  fill="currentColor" style={{ pointerEvents: 'none' }}>{s.label}</text>
              </g>
            );
          })}

          {/* Center hex */}
          <polygon points={hexPoints(CX, CY, HEX_R + 4)}
            fill={`${ACCENT}15`} stroke={ACCENT} strokeWidth={2} strokeOpacity={0.6} />
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize={10} fontWeight={800}
            fill={ACCENT} style={{ pointerEvents: 'none' }}>ANNA UNIVERSITY</text>
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize={8} fontWeight={600}
            fill="currentColor" opacity={0.6} style={{ pointerEvents: 'none' }}>M.I.T Campus</text>
        </svg>
        <p className="text-[10px] text-black/30 dark:text-white/30 pb-[16px]">Hover any node to highlight</p>
      </div>
    </div>
  );
}

// ── H: Scrollytelling ────────────────────────────────────────────────────────

function StatBadge({ target, label, suffix = '', color = ACCENT }: { target: number; label: string; suffix?: string; color?: string }) {
  const { count, ref } = useCountUp(target, 1200);
  return (
    <div ref={ref} className="flex flex-col items-center gap-[4px]">
      <span className="text-[36px] md:text-[48px] font-extrabold" style={{ color }}>{count}{suffix}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/40 dark:text-white/40">{label}</span>
    </div>
  );
}

function OptionH() {
  return (
    <div className="flex flex-col gap-[0px]">
      {/* Block 1 — Degree */}
      <motion.div
        className="container flex flex-col md:flex-row items-center gap-[40px] py-[40px]"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
        <motion.div className="flex-1"
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-[12px]" style={{ color: ACCENT }}>
            🎓 Education · {EDU.period}
          </p>
          <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-black dark:text-white leading-tight tracking-[-0.02em] mb-[10px]">
            {EDU.degree}
          </h2>
          <p className="text-[16px] font-semibold mb-[4px]" style={{ color: ACCENT }}>{EDU.university}</p>
          <p className="text-[13px] text-black/50 dark:text-white/50 mb-[24px]">{EDU.campus}</p>
          <div className="flex flex-wrap gap-[6px]">
            {EDU.coursework.map(c => (
              <span key={c} className="text-[10px] font-semibold px-[10px] py-[3px] rounded-full"
                style={{ background: `${ACCENT}14`, color: ACCENT }}>{c}</span>
            ))}
          </div>
        </motion.div>

        {/* Animated stats */}
        <motion.div
          className="flex gap-[32px] md:gap-[40px] constellation-bg rounded-[24px] p-[32px]"
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}>
          <StatBadge target={82} label="CGPA × 10" suffix="" color={ACCENT} />
          <StatBadge target={2} label="Years" color={PURPLE} />
        </motion.div>
      </motion.div>

      {/* Divider */}
      <div className="container"><div className="h-[1px] bg-black/[0.06] dark:bg-white/[0.06]" /></div>

      {/* Block 2 — Research */}
      <motion.div
        className="container flex flex-col md:flex-row-reverse items-center gap-[40px] py-[40px]"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
        <motion.div className="flex-1"
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-[12px]" style={{ color: '#00b388' }}>
            🔬 Research · {EDU.research.period}
          </p>
          <h2 className="text-[clamp(20px,3.5vw,34px)] font-extrabold text-black dark:text-white leading-tight tracking-[-0.02em] mb-[8px]">
            {EDU.research.org}
          </h2>
          <p className="text-[14px] font-semibold text-black/60 dark:text-white/60 mb-[16px]">{EDU.research.role}</p>
          <p className="text-[13px] text-black/55 dark:text-white/55 leading-relaxed">{EDU.research.output}</p>
        </motion.div>

        {/* Research stats */}
        <motion.div
          className="flex gap-[32px] md:gap-[40px] constellation-bg rounded-[24px] p-[32px]"
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}>
          <StatBadge target={EDU.research.papers} label="Papers" color="#00b388" />
          <StatBadge target={2} label="Conferences" color="#f59e0b" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Picker ────────────────────────────────────────────────────────────────────

const OPTIONS = [
  { id: 'A', title: 'Flip Card Grid — 3 interactive flip cards', Component: OptionA },
  { id: 'B', title: 'Vertical Timeline — expandable entries on a spine', Component: OptionB },
  { id: 'C', title: 'Sticky Chapter Split — sidebar tabs + detail panel', Component: OptionC },
  { id: 'D', title: 'Animated Progress Bars — coursework proficiency bars', Component: OptionD },
  { id: 'E', title: 'Glassmorphic — frosted glass on dark background', Component: OptionE },
  { id: 'F', title: 'Bento Grid — mixed-size info tiles', Component: OptionF },
  { id: 'G', title: 'Hexagonal Network — SVG hex constellation', Component: OptionG },
  { id: 'H', title: 'Scrollytelling — scroll-triggered reveals + counters', Component: OptionH },
];

export default function EducationPicker() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 120, paddingBottom: 80 }}>
      {OPTIONS.map(({ id, title, Component }) => (
        <div key={id}>
          <div style={{ padding: '0 max(20px, calc((100vw - 960px)/2))', marginBottom: 24 }}>
            <PLabel id={id} title={title} />
          </div>
          <Component />
        </div>
      ))}
    </div>
  );
}
