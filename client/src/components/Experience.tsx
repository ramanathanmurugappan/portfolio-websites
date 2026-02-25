/**
 * Experience Component - Work history timeline
 * Desktop: horizontal 3-column with connecting line through dots
 * Mobile: clean vertical left-edge timeline
 */

import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experiences } from '../data/experience';

const COMPANY_COLORS: Record<string, string> = {
  'ITC Infotech': '#1e6ef4',
  'Accenture':    '#a100ff',
  'Kaleidofin':   '#00b388',
};

export default function Experience() {
  return (
    <div className="flex flex-col gap-[40px]">
      <div className="container">
        <SectionHeader eyebrow="💼 Experience" title="Work History" />
      </div>

      {/* ── Desktop: horizontal timeline ── */}
      <div className="container hidden md:block">
        <div className="relative">
          {/* Connecting line through the dots */}
          <div className="absolute top-[20px] left-[calc(16.67%+8px)] right-[calc(16.67%+8px)] h-[2px] bg-gradient-to-r from-[#1e6ef4]/40 via-[#1e6ef4] to-[#1e6ef4]/40" />

          <div className="grid grid-cols-3 gap-[20px]">
            {experiences.map((exp, index) => {
              const color = COMPANY_COLORS[exp.company] ?? '#1e6ef4';
              return (
                <motion.div
                  key={exp.company}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                  className="flex flex-col"
                >
                  {/* Dot */}
                  <div className="flex justify-center mb-[28px]">
                    <div
                      className="w-[16px] h-[16px] rounded-full border-[3px] border-white dark:border-black relative z-10 shadow-[0_0_0_2px_currentColor]"
                      style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}40` }}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[24px] subtle-border hover:shadow-md transition-shadow duration-200 flex flex-col gap-[16px]">
                    {/* Company header */}
                    <div className="flex items-center gap-[10px]">
                      <div
                        className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {exp.company[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-black dark:text-white leading-none">{exp.company}</p>
                        <p className="text-[11px] text-black/40 dark:text-white/40 mt-[2px]">{exp.location}</p>
                      </div>
                    </div>

                    {/* Role + period */}
                    <div>
                      <h3 className="text-[15px] font-semibold text-black dark:text-white leading-snug tracking-[-0.01em]">
                        {exp.role}
                      </h3>
                      <span
                        className="inline-block mt-[6px] px-[8px] py-[3px] rounded-[6px] text-[10px] font-semibold"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {exp.period}
                      </span>
                    </div>

                    {/* Highlights — no bullets, clean separator lines */}
                    <div className="flex flex-col divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                      {exp.highlights.map((hl, i) => (
                        <p key={i} className="text-[11px] text-black/50 dark:text-white/50 leading-[155%] py-[8px] first:pt-0 last:pb-0">
                          {hl}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile: vertical left-edge timeline ── */}
      <div className="container md:hidden">
        <div className="relative pl-[32px]">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-[8px] bottom-[8px] w-[2px] bg-gradient-to-b from-[#1e6ef4] via-[#1e6ef4]/60 to-[#1e6ef4]/20 rounded-full" />

          <div className="flex flex-col gap-[28px]">
            {experiences.map((exp, index) => {
              const color = COMPANY_COLORS[exp.company] ?? '#1e6ef4';
              return (
                <motion.div
                  key={exp.company}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
                  className="relative"
                >
                  {/* Dot on the line */}
                  <div
                    className="absolute -left-[29px] top-[20px] w-[14px] h-[14px] rounded-full border-[3px] border-white dark:border-black z-10"
                    style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}50` }}
                  />

                  {/* Card */}
                  <div className="rounded-[20px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[20px] subtle-border flex flex-col gap-[12px]">
                    {/* Company header */}
                    <div className="flex items-center justify-between gap-[8px]">
                      <div className="flex items-center gap-[8px]">
                        <div
                          className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {exp.company[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-black dark:text-white leading-none">{exp.company}</p>
                          <p className="text-[10px] text-black/40 dark:text-white/40 mt-[2px]">{exp.location}</p>
                        </div>
                      </div>
                      <span
                        className="flex-shrink-0 px-[8px] py-[3px] rounded-[6px] text-[10px] font-semibold whitespace-nowrap"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {exp.period}
                      </span>
                    </div>

                    {/* Role */}
                    <h3 className="text-[14px] font-semibold text-black dark:text-white leading-snug tracking-[-0.01em]">
                      {exp.role}
                    </h3>

                    {/* Highlights — clean separator lines */}
                    <div className="flex flex-col divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                      {exp.highlights.map((hl, i) => (
                        <p key={i} className="text-[11px] text-black/50 dark:text-white/50 leading-[155%] py-[7px] first:pt-0 last:pb-0">
                          {hl}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
