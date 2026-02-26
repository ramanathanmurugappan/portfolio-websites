/**
 * Achievements Component - Stats and accomplishments showcase
 * Features: Stacked cards with avatar characters and achievements
 * Modernized: Framer Motion whileInView stagger reveals
 */

import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { achievements, publications } from '../data/achievements';

export default function Achievements() {
  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader eyebrow="🏅 Achievements" title="Highlights & Publications" centered />

      {/* Achievement Cards */}
      <div className="flex flex-col gap-[14px]">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.07 }}
            className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[40px] flex items-center justify-between min-h-[160px] relative overflow-hidden achievement-card subtle-border"
          >
            {/* Avatar on Left */}
            {achievement.memojiPosition === 'left' && (
              <div className="w-[140px] h-[140px] flex-shrink-0 -ml-[10px] rounded-[20px] overflow-hidden bg-[#E8E0F0] dark:bg-[#2D1F45]">
                <img
                  src={achievement.memojiImage}
                  alt="Ramanathan"
                  className="w-full h-full object-contain img-transition"
                />
              </div>
            )}

            {/* Stats */}
            <div className={`flex flex-col gap-[6px] flex-1 ${
              achievement.memojiPosition === 'left' ? 'text-right pr-[40px]' : 'text-left pl-[40px]'
            }`}>
              {achievement.highlight && (
                <span
                  className="inline-flex px-[10px] py-[4px] rounded-[8px] bg-white dark:bg-[#0f0f0f] text-[10px] tracking-[0.02em] font-semibold w-fit mb-[4px] subtle-border"
                  style={{
                    marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0'
                  }}
                >
                  {achievement.highlight}
                </span>
              )}
              <span className="text-[36px] leading-[100%] tracking-[-0.03em] font-semibold text-black dark:text-white">
                {achievement.title}
              </span>
              <span
                className="text-[13px] text-black/50 dark:text-white/50 font-semibold max-w-[400px]"
                style={{ marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0' }}
              >
                {achievement.description}
              </span>
              {achievement.link && (
                <a
                  href={achievement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#1e6ef4] font-semibold mt-[4px] hover:underline"
                  style={{ marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0' }}
                >
                  View LinkedIn Post →
                </a>
              )}
            </div>

            {/* Avatar on Right */}
            {achievement.memojiPosition === 'right' && (
              <div className="w-[140px] h-[140px] flex-shrink-0 -mr-[10px] rounded-[20px] overflow-hidden bg-[#E8E0F0] dark:bg-[#2D1F45]">
                <img
                  src={achievement.memojiImage}
                  alt="Ramanathan"
                  className="w-full h-full object-contain img-transition"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Publications Section */}
      <div className="flex flex-col gap-[20px] mt-[20px]">
        <h3 className="text-[24px] leading-[116%] tracking-[-0.02em] font-semibold text-center text-black dark:text-white">
          📄 Research Publications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {publications.map((pub, index) => (
            <motion.a
              key={index}
              href={pub.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              className="rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex flex-col gap-[12px] card-hover group"
            >
              <span className="text-[11px] tracking-[0.08em] text-[#1e6ef4] uppercase font-semibold">
                📄 Published Paper
              </span>
              <h4 className="text-[14px] leading-[140%] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
                {pub.title}
              </h4>
              <span className="text-[12px] text-black/35 dark:text-white/35 font-semibold">
                {pub.venue}
              </span>
              <span className="text-[11px] text-[#1e6ef4] font-semibold mt-auto">
                Read Paper →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
