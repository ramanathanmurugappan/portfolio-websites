/**
 * Experience — Sticky Chapter Split (Option K)
 * Left: company tabs with logo. Right: plain highlight list, no card boxes.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { experiences } from '../data/experience';
import { companyColor, COMPANY_LOGOS } from '../data/brandColors';

function CompanyLogo({ company, size = 40 }: { company: string; size?: number }) {
  const color = companyColor(company);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: '#fff', border: `1.5px solid ${color}28`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0, boxShadow: `0 2px 8px ${color}18`,
    }}>
      <img src={COMPANY_LOGOS[company]} alt={company}
        style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
    </div>
  );
}

export default function Experience() {
  const [active, setActive] = useState(0);
  const exp = experiences[active];
  const color = companyColor(exp.company);

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="container">
        <SectionHeader eyebrow="💼 Experience" title="Work History" />
      </div>

      <div className="container">
        <div className="flex flex-col md:flex-row rounded-[24px] overflow-hidden card-hover">

          {/* ── Left: company tab panel ── */}
          <div className="md:w-[280px] flex-shrink-0 flex flex-col justify-between p-[16px] md:p-[24px]
                          border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]"
            style={{
              background: `linear-gradient(155deg, ${color}12 0%, ${color}04 100%)`,
              transition: 'background 0.4s ease',
            }}>

            {/* Active company info */}
            <div className="flex flex-col gap-[18px]">
              <CompanyLogo company={exp.company} size={52} />
              <motion.div key={exp.company}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}>
                <p className="text-[24px] font-extrabold text-black dark:text-white
                               leading-none tracking-[-0.02em]">
                  {exp.company}
                </p>
                <p className="text-[12px] text-black/50 dark:text-white/50 mt-[6px] leading-snug">
                  {exp.role}
                </p>
                <span className="inline-block mt-[10px] px-[9px] py-[3px] rounded-[7px]
                                 text-[10px] font-bold"
                  style={{ background: `${color}18`, color }}>
                  {exp.period}
                </span>
              </motion.div>
            </div>

            {/* Company selector tabs */}
            <div className="flex md:flex-col gap-[6px] mt-[24px]">
              {experiences.map((e, i) => {
                const c = companyColor(e.company);
                const isAct = active === i;
                return (
                  <button key={e.company} onClick={() => setActive(i)}
                    className="flex items-center gap-[10px] rounded-[12px] px-[12px] py-[10px] min-h-[44px]
                               transition-all duration-200 cursor-pointer text-left w-full"
                    style={{
                      background: isAct ? `${c}18` : 'transparent',
                      border: `1.5px solid ${isAct ? c + '35' : 'transparent'}`,
                    }}>
                    <CompanyLogo company={e.company} size={26} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-black dark:text-white leading-none truncate">
                        {e.company}
                      </p>
                    </div>
                    {isAct && (
                      <div className="ml-auto w-[5px] h-[5px] rounded-full flex-shrink-0"
                        style={{ background: c }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: highlights (plain, no box backgrounds) ── */}
          <motion.div key={exp.company + '-detail'}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 p-[16px] md:p-[32px] flex flex-col gap-[20px]
                       bg-white dark:bg-[#1a1a1a]">

            <p className="text-[10px] font-bold text-black/30 dark:text-white/30
                          uppercase tracking-[0.1em]">
              Key Achievements
            </p>

            <div className="flex flex-col divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {exp.highlights.map((hl, j) => (
                <motion.div key={j}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: j * 0.07, ease: 'easeOut' }}
                  className="flex gap-[12px] items-start py-[14px] first:pt-0 last:pb-0">
                  <div className="w-[6px] h-[6px] rounded-full mt-[5px] flex-shrink-0"
                    style={{ background: color }} />
                  <p className="text-[13px] text-black/65 dark:text-white/65 leading-[165%]">
                    {hl}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
