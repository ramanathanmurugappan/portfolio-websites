/**
 * ProjectsPicker — 8 layout options for Featured Work
 * Pick your favourite, then we'll bake it into Projects.tsx
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { projects } from '../data/projects';

const COMPANY_COLORS: Record<string, string> = {
  'ITC Infotech': '#1e6ef4',
  'Accenture':    '#a100ff',
  'Kaleidofin':   '#00b388',
};

function PLabel({ id, title }: { id: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ background: '#1e6ef4', color: '#fff', fontWeight: 800, fontSize: 12, padding: '3px 14px', borderRadius: 20 }}>{id}</span>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#888' }}>{title}</span>
    </div>
  );
}

// ── A: Bento Grid ─────────────────────────────────────────────────────────────
function OptionA() {
  const [hovered, setHovered] = useState<number | null>(null);
  const featured = projects[0];
  const side = projects.slice(1, 4);
  const bottom = projects.slice(4, 7);

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      <div className="grid grid-cols-3 gap-[12px]">
        {/* Featured big card */}
        <motion.div
          className="col-span-2 row-span-2 rounded-[24px] overflow-hidden relative cursor-pointer"
          style={{ minHeight: 320, background: '#f7f7f7' }}
          whileHover={{ scale: 1.01 }}
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
        >
          <img src={featured.image} alt={featured.name} className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />
          <div className="absolute bottom-0 left-0 p-[28px] flex flex-col gap-[8px]">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full w-fit"
              style={{ background: `${COMPANY_COLORS[featured.company]}30`, color: COMPANY_COLORS[featured.company] }}>
              {featured.company}
            </span>
            <h3 className="text-[22px] font-bold text-white leading-tight">{featured.name}</h3>
            <p className="text-[12px] text-white/65 leading-relaxed">{featured.description}</p>
            <div className="flex flex-wrap gap-[5px] mt-[4px]">
              {featured.techStack.slice(0, 4).map(t => (
                <span key={t} className="text-[9px] font-semibold px-[7px] py-[2px] rounded-full bg-white/15 text-white">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Side small cards */}
        {side.map((p, i) => (
          <motion.div key={p.id}
            className="rounded-[20px] overflow-hidden relative cursor-pointer"
            style={{ minHeight: 140, background: '#f7f7f7' }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={p.image} alt={p.name} className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 p-[14px]">
              <p className="text-[11px] font-bold text-white leading-tight">{p.name}</p>
              <p className="text-[9px] text-white/55 mt-[2px]">{p.company}</p>
            </div>
          </motion.div>
        ))}

        {/* Bottom row */}
        {bottom.map(p => (
          <motion.div key={p.id}
            className="rounded-[20px] overflow-hidden relative cursor-pointer"
            style={{ minHeight: 110, background: '#f7f7f7' }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={p.image} alt={p.name} className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 p-[12px]">
              <p className="text-[10px] font-bold text-white leading-tight">{p.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── B: Company Tabs + 2-col Grid ──────────────────────────────────────────────
function OptionB() {
  const companies = ['All', 'ITC Infotech', 'Accenture', 'Kaleidofin'];
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? projects : projects.filter(p => p.company === active);
  const color = active === 'All' ? '#1e6ef4' : COMPANY_COLORS[active];

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      {/* Tabs */}
      <div className="flex gap-[8px] flex-wrap">
        {companies.map(c => (
          <button key={c} onClick={() => setActive(c)}
            className="px-[16px] py-[8px] rounded-full text-[12px] font-bold transition-all duration-200"
            style={{
              background: active === c ? (COMPANY_COLORS[c] ?? '#1e6ef4') : 'var(--grey)',
              color: active === c ? '#fff' : 'inherit',
            }}>
            {c}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        <AnimatePresence mode="popLayout">
          {filtered.map(p => (
            <motion.div key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="rounded-[20px] bg-[#f7f7f7] dark:bg-[#1a1a1a] overflow-hidden card-hover flex flex-col">
              <div className="relative h-[160px] overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                <span className="absolute top-[10px] left-[10px] text-[9px] font-bold px-[8px] py-[3px] rounded-full"
                  style={{ background: `${COMPANY_COLORS[p.company]}22`, color: COMPANY_COLORS[p.company] }}>
                  {p.company}
                </span>
              </div>
              <div className="p-[18px] flex flex-col gap-[8px]">
                <h3 className="text-[15px] font-bold text-black dark:text-white">{p.name}</h3>
                <p className="text-[11px] text-black/50 dark:text-white/50 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-[4px] mt-[4px]">
                  {p.techStack.slice(0, 3).map(t => (
                    <span key={t} className="text-[9px] font-semibold px-[7px] py-[2px] rounded-full bg-white dark:bg-[#222] text-black/50 dark:text-white/50 subtle-border">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── C: Horizontal Snap Scroll ─────────────────────────────────────────────────
function OptionC() {
  return (
    <div className="flex flex-col gap-[32px]">
      <div className="container">
        <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      </div>
      <div className="overflow-x-auto pb-[12px] pl-[max(20px,calc((100vw-960px)/2))]"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', display: 'flex', gap: 14 }}>
        {projects.map((p, i) => (
          <motion.div key={p.id}
            className="flex-shrink-0 rounded-[24px] overflow-hidden bg-[#f7f7f7] dark:bg-[#1a1a1a] card-hover flex flex-col"
            style={{ width: 280, scrollSnapAlign: 'start' }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}>
            <div className="relative h-[180px] overflow-hidden flex-shrink-0">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
              <span className="absolute bottom-[10px] left-[12px] text-[9px] font-bold px-[8px] py-[3px] rounded-full"
                style={{ background: `${COMPANY_COLORS[p.company]}30`, color: COMPANY_COLORS[p.company] }}>
                {p.company}
              </span>
            </div>
            <div className="p-[18px] flex flex-col gap-[8px]">
              <h3 className="text-[14px] font-bold text-black dark:text-white leading-tight">{p.name}</h3>
              <p className="text-[11px] text-black/45 dark:text-white/45 leading-relaxed line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-[4px] mt-auto pt-[8px]">
                {p.techStack.slice(0, 3).map(t => (
                  <span key={t} className="text-[9px] font-semibold px-[7px] py-[2px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/50 dark:text-white/50">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {/* Spacer */}
        <div className="flex-shrink-0 w-[max(20px,calc((100vw-960px)/2))]" />
      </div>
      <div className="container">
        <p className="text-[10px] text-black/30 dark:text-white/30 text-center">Scroll or swipe →</p>
      </div>
    </div>
  );
}

// ── D: Magazine Hero + 3-col grid ─────────────────────────────────────────────
function OptionD() {
  const [expanded, setExpanded] = useState(false);
  const hero = projects[0];
  const rest = projects.slice(1);

  return (
    <div className="container flex flex-col gap-[24px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />

      {/* Hero */}
      <motion.div className="rounded-[28px] overflow-hidden relative cursor-pointer"
        style={{ minHeight: 340 }}
        whileHover={{ scale: 1.005 }}>
        <img src={hero.image} alt={hero.name} className="w-full h-full object-cover absolute inset-0" style={{ minHeight: 340 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-center p-[40px] max-w-[560px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] mb-[12px]"
            style={{ color: COMPANY_COLORS[hero.company] }}>{hero.company} · {hero.period}</span>
          <h3 className="text-[28px] font-extrabold text-white leading-tight tracking-[-0.02em] mb-[12px]">{hero.name}</h3>
          <p className="text-[13px] text-white/65 leading-relaxed mb-[20px]">{hero.description}</p>
          <div className="flex flex-wrap gap-[6px]">
            {hero.techStack.map(t => (
              <span key={t} className="text-[10px] font-semibold px-[10px] py-[4px] rounded-full bg-white/15 text-white">{t}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
        {rest.map(p => (
          <motion.div key={p.id}
            className="rounded-[20px] overflow-hidden bg-[#f7f7f7] dark:bg-[#1a1a1a] card-hover flex flex-col"
            whileHover={{ y: -4 }}>
            <div className="relative h-[130px] flex-shrink-0 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
            </div>
            <div className="p-[14px] flex flex-col gap-[5px]">
              <span className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: COMPANY_COLORS[p.company] }}>{p.company}</span>
              <h4 className="text-[12px] font-bold text-black dark:text-white leading-tight">{p.name}</h4>
              <div className="flex flex-wrap gap-[3px] mt-[4px]">
                {p.techStack.slice(0, 2).map(t => (
                  <span key={t} className="text-[8px] font-semibold px-[6px] py-[2px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/45 dark:text-white/45">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── E: Vertical Timeline ──────────────────────────────────────────────────────
function OptionE() {
  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      <div className="relative flex flex-col gap-0">
        {/* Centre line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.07] dark:bg-white/[0.07] hidden md:block" />

        {projects.slice(0, 6).map((p, i) => {
          const isLeft = i % 2 === 0;
          const color = COMPANY_COLORS[p.company] ?? '#1e6ef4';
          return (
            <motion.div key={p.id}
              className={`flex md:items-center gap-[24px] py-[20px] ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}>
              {/* Card */}
              <div className="flex-1 rounded-[20px] bg-[#f7f7f7] dark:bg-[#1a1a1a] overflow-hidden card-hover flex flex-col md:flex-row">
                <div className="relative md:w-[200px] h-[120px] md:h-auto flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-[18px] flex flex-col gap-[6px]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color }}>{p.company} · {p.period}</span>
                  <h3 className="text-[14px] font-bold text-black dark:text-white">{p.name}</h3>
                  <p className="text-[11px] text-black/50 dark:text-white/50 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-[4px] mt-[4px]">
                    {p.techStack.slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] font-semibold px-[7px] py-[2px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/45 dark:text-white/45">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Centre dot */}
              <div className="hidden md:flex w-[14px] h-[14px] rounded-full flex-shrink-0 z-10"
                style={{ background: color, boxShadow: `0 0 0 4px ${color}25` }} />
              {/* Empty side */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── F: Kanban Company Columns ──────────────────────────────────────────────────
function OptionF() {
  const companies = ['ITC Infotech', 'Accenture', 'Kaleidofin'];
  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {companies.map(company => {
          const color = COMPANY_COLORS[company];
          const compProjects = projects.filter(p => p.company === company);
          return (
            <div key={company} className="flex flex-col gap-[10px]">
              {/* Column header */}
              <div className="flex items-center gap-[8px] px-[4px] py-[8px]">
                <div className="w-[8px] h-[8px] rounded-full" style={{ background: color }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color }}>{company}</span>
                <span className="ml-auto text-[10px] text-black/30 dark:text-white/30 font-semibold">{compProjects.length}</span>
              </div>
              {/* Cards */}
              {compProjects.map((p, i) => (
                <motion.div key={p.id}
                  className="rounded-[18px] bg-[#f7f7f7] dark:bg-[#1a1a1a] overflow-hidden card-hover"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}>
                  <div className="relative h-[130px] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
                  </div>
                  <div className="p-[14px] flex flex-col gap-[5px]">
                    <h3 className="text-[12px] font-bold text-black dark:text-white leading-tight">{p.name}</h3>
                    <p className="text-[10px] text-black/45 dark:text-white/45 leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-[3px] mt-[6px]">
                      {p.techStack.slice(0, 3).map(t => (
                        <span key={t} className="text-[8px] font-semibold px-[6px] py-[2px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/45 dark:text-white/45">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── G: Spotlight / Dark Stage ─────────────────────────────────────────────────
function OptionG() {
  const [idx, setIdx] = useState(0);
  const p = projects[idx];
  const color = COMPANY_COLORS[p.company] ?? '#1e6ef4';

  return (
    <div className="flex flex-col gap-[32px]">
      <div className="container">
        <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      </div>
      <div className="relative overflow-hidden" style={{ background: '#08090f', minHeight: 420 }}>
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 60% at 70% 50%, ${color}18, transparent)`,
          transition: 'background 0.6s ease',
        }} />
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col md:flex-row items-center gap-[40px] px-[40px] py-[40px]">
            {/* Left text */}
            <div className="flex-1 flex flex-col gap-[16px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color }}>{p.company} · {p.period}</span>
              <h3 className="text-[32px] font-extrabold text-white leading-tight tracking-[-0.02em]">{p.name}</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">{p.description}</p>
              <ul className="flex flex-col gap-[6px]">
                {p.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} className="flex gap-[8px] text-[11px] text-white/45">
                    <span style={{ color }}>›</span>{h.slice(0, 80)}…
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-[5px] mt-[4px]">
                {p.techStack.map(t => (
                  <span key={t} className="text-[9px] font-semibold px-[8px] py-[3px] rounded-full text-white/70"
                    style={{ border: `1px solid ${color}40`, background: `${color}12` }}>{t}</span>
                ))}
              </div>
            </div>
            {/* Right image */}
            <div className="md:w-[420px] h-[260px] rounded-[20px] overflow-hidden flex-shrink-0"
              style={{ boxShadow: `0 0 60px ${color}30` }}>
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot nav */}
        <div className="absolute bottom-[20px] left-0 right-0 flex justify-center gap-[6px]">
          {projects.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 6, height: 6,
                background: i === idx ? color : 'rgba(255,255,255,0.2)',
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── H: Accordion List ─────────────────────────────────────────────────────────
function OptionH() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader eyebrow="💻 Projects" title="Featured Work" />
      <div className="flex flex-col gap-[6px]">
        {projects.map((p, i) => {
          const color = COMPANY_COLORS[p.company] ?? '#1e6ef4';
          const isOpen = open === i;
          return (
            <div key={p.id} className="rounded-[18px] overflow-hidden subtle-border"
              style={{ background: isOpen ? 'var(--grey)' : 'transparent', transition: 'background 0.25s' }}>
              {/* Header row */}
              <button className="w-full flex items-center gap-[14px] px-[20px] py-[16px] text-left min-h-[56px]"
                onClick={() => setOpen(i)}>
                <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[8px] font-bold uppercase tracking-[0.1em] w-[90px] flex-shrink-0" style={{ color }}>{p.company}</span>
                <span className="text-[13px] font-bold text-black dark:text-white flex-1">{p.name}</span>
                <span className="text-[10px] text-black/30 dark:text-white/30">{p.period}</span>
                <span className="text-[16px] text-black/30 dark:text-white/30 ml-[8px] transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}>
                    <div className="flex flex-col md:flex-row gap-[20px] px-[20px] pb-[20px]">
                      <img src={p.image} alt={p.name}
                        className="w-full md:w-[220px] h-[140px] object-cover rounded-[14px] flex-shrink-0" />
                      <div className="flex flex-col gap-[8px]">
                        <p className="text-[12px] text-black/55 dark:text-white/55 leading-relaxed">{p.description}</p>
                        <ul className="flex flex-col gap-[4px]">
                          {p.highlights.slice(0, 2).map((h, j) => (
                            <li key={j} className="flex gap-[6px] text-[11px] text-black/45 dark:text-white/45">
                              <span style={{ color }}>›</span>{h.slice(0, 90)}{h.length > 90 ? '…' : ''}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-[4px] mt-[6px]">
                          {p.techStack.map(t => (
                            <span key={t} className="text-[9px] font-semibold px-[8px] py-[3px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/45 dark:text-white/45">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Picker ────────────────────────────────────────────────────────────────────
const OPTIONS = [
  { id: 'A', title: 'Bento Grid — variable sizes, all visible at once',        Component: OptionA },
  { id: 'B', title: 'Company Filter Tabs — filter by employer + 2-col grid',   Component: OptionB },
  { id: 'C', title: 'Horizontal Snap Scroll — swipe cards, mobile-first',      Component: OptionC },
  { id: 'D', title: 'Magazine — hero card + 3-col grid below',                 Component: OptionD },
  { id: 'E', title: 'Vertical Timeline — alternating left/right with spine',   Component: OptionE },
  { id: 'F', title: 'Kanban Columns — one column per company',                 Component: OptionF },
  { id: 'G', title: 'Spotlight Dark Stage — cinematic, one at a time',         Component: OptionG },
  { id: 'H', title: 'Accordion List — compact, expands on click',              Component: OptionH },
];

export default function ProjectsPicker() {
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
