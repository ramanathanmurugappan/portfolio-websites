/**
 * Education Component - Educational background
 * Original layout restored with enhanced left-side animations.
 */

import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';

const COURSEWORK = [
  'Machine Learning', 'Deep Learning', 'Control Systems',
  'Robotics', 'Data Science', 'Signal Processing',
];

export default function Education() {
  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />

      <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[24px] md:p-[40px]
                      flex flex-col md:flex-row items-start justify-between gap-[28px] card-hover">

        {/* ── Left: Degree — enhanced ── */}
        <div className="flex flex-col gap-[20px] flex-1">

          {/* Period badge */}
          <motion.span
            className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[10px]
                       bg-white dark:bg-[#0f0f0f] text-[11px] font-semibold w-fit subtle-border
                       text-black dark:text-white"
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            🎓 2018 – 2020
          </motion.span>

          {/* Degree title — animated gradient shimmer */}
          <motion.div
            className="flex flex-col gap-[4px]"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          >
            <h3 className="text-[26px] md:text-[30px] leading-[115%] tracking-[-0.025em]
                           font-extrabold text-black dark:text-white animate-gradient-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #1e6ef4 0%, #6366f1 50%, #1e6ef4 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              M.E. Mechatronics
            </h3>
            <p className="text-[14px] text-black/60 dark:text-white/60 font-semibold">
              Anna University
            </p>
            <p className="text-[12px] text-black/40 dark:text-white/40">
              M.I.T Campus, Chennai
            </p>
          </motion.div>

          {/* Coursework — staggered pill pop-in */}
          <motion.div
            className="flex flex-col gap-[10px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/30 dark:text-white/30">
              Coursework
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {COURSEWORK.map((c, i) => (
                <motion.span
                  key={c}
                  className="text-[10px] font-semibold px-[10px] py-[4px] rounded-full
                             bg-white dark:bg-[#0f0f0f] text-black/60 dark:text-white/60 subtle-border"
                  initial={{ opacity: 0, scale: 0.7, y: 8 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.25 + i * 0.07, ease: 'easeOut' }}
                  whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right: Research card — original style ── */}
        <motion.div
          className="rounded-[24px] bg-white dark:bg-[#0f0f0f] p-[20px] md:p-[24px]
                     flex flex-col gap-[8px] w-full md:max-w-[400px] flex-shrink-0 card-hover"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <span className="text-[11px] tracking-[0.08em] text-[#1e6ef4] uppercase font-semibold">
            🔬 Research Experience
          </span>
          <h4 className="text-[16px] font-semibold text-black dark:text-white">
            Solarillion Foundation (SF)
          </h4>
          <p className="text-[12px] text-black/50 dark:text-white/50 font-semibold">
            Research Assistant + Teaching Assistant (Aug'18 – May'20)
          </p>
          <p className="text-[12px] text-black/60 dark:text-white/60">
            Published 2 papers at IEEE and FICC conferences on ML applications
          </p>
        </motion.div>

      </div>
    </div>
  );
}
