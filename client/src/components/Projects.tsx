/**
 * Projects — Magazine Layout (Option D)
 * Top: large hero card (featured project).
 * Below: responsive 3-col grid for remaining projects.
 * Each card: company badge · name · skills tagline · tech pills.
 */

import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import SectionHeader from './SectionHeader';
import ScrollReveal from './ScrollReveal';
import { projects } from '../data/projects';
import { companyColor } from '../data/brandColors';

// ── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({ p }: { p: typeof projects[0] }) {
  const color = companyColor(p.company);
  return (
    <motion.div
      className="rounded-[28px] overflow-hidden relative cursor-pointer"
      style={{ minHeight: 340 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={p.image} alt={p.name} loading="lazy" decoding="async"
        className="w-full h-full object-cover absolute inset-0"
        style={{ minHeight: 340 }}
      />
      {/* gradient overlay — darker on left for text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.18) 100%)' }}
      />

      {/* content */}
      <div className="absolute inset-0 flex flex-col justify-center p-[28px] md:p-[44px] max-w-[600px]">
        {/* company · period */}
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em] mb-[10px]"
          style={{ color }}
        >
          {p.company} · {p.period}
        </span>

        {/* title */}
        <h3 className="text-[22px] md:text-[30px] font-extrabold text-white leading-tight tracking-[-0.02em] mb-[10px]">
          {p.name}
        </h3>

        {/* description */}
        <p className="text-[12px] md:text-[13px] text-white/65 leading-relaxed mb-[10px]">
          {p.description}
        </p>

        {/* skills tagline */}
        <p className="text-[10px] md:text-[11px] font-semibold mb-[16px]" style={{ color, opacity: 0.9 }}>
          {p.skills}
        </p>

        {/* tech pills */}
        <div className="flex flex-wrap gap-[5px]">
          {p.techStack.map(t => (
            <span key={t} className="text-[9px] font-semibold px-[9px] py-[3px] rounded-full bg-white/15 text-white">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────────────────────

function GridCard({ p, index }: { p: typeof projects[0]; index: number }) {
  const color = companyColor(p.company);
  return (
    <ScrollReveal
      className="rounded-[20px] overflow-hidden bg-[#f7f7f7] dark:bg-[#1a1a1a] card-hover flex flex-col"
      duration={0.4} delay={index * 0.05} margin="-30px"
    >
      {/* image */}
      <div className="relative h-[130px] flex-shrink-0 overflow-hidden">
        <img
          src={p.image} alt={p.name} loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
        />
      </div>

      {/* body */}
      <div className="p-[14px] flex flex-col gap-[4px] flex-1">
        {/* company */}
        <span className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color }}>
          {p.company}
        </span>

        {/* name */}
        <h4 className="text-[12px] font-bold text-black dark:text-white leading-tight">
          {p.name}
        </h4>

        {/* skills tagline */}
        <p className="text-[9px] font-semibold leading-snug mt-[2px]" style={{ color, opacity: 0.8 }}>
          {p.skills}
        </p>

        {/* tech pills */}
        <div className="flex flex-wrap gap-[3px] mt-[6px]">
          {p.techStack.map(t => (
            <span key={t}
              className="text-[8px] font-semibold px-[6px] py-[2px] rounded-full bg-white dark:bg-[#222] subtle-border text-black/45 dark:text-white/45">
              {t}
            </span>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Projects() {
  const hero = projects[0];
  const rest  = projects.slice(1);

  return (
    <div className="container flex flex-col gap-[24px]">
      <SectionHeader icon={<FolderOpen size={12} />} eyebrow="Projects" title="Featured Work" />

      {/* Hero */}
      <ScrollReveal y={24}>
        <HeroCard p={hero} />
      </ScrollReveal>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[12px]">
        {rest.map((p, i) => (
          <GridCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </div>
  );
}
