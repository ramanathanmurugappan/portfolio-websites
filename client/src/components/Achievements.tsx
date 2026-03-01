import { motion } from 'framer-motion';
import { Trophy, FileText } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { achievements, publications } from '../data/achievements';

// ── AvatarBox ─────────────────────────────────────────────────────────────────

function AvatarBox({ src, position }: { src: string; position: 'left' | 'right' }) {
  const edge = position === 'left' ? '-ml-[4px] md:-ml-[10px]' : '-mr-[4px] md:-mr-[10px]';
  return (
    <div className={`avatar-bg w-[90px] h-[90px] md:w-[140px] md:h-[140px] flex-shrink-0 ${edge} rounded-[16px] md:rounded-[20px] overflow-hidden`}>
      <img src={src} alt="Ramanathan" loading="lazy" decoding="async"
        className="w-full h-full object-contain img-transition" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Achievements() {
  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader icon={<Trophy size={12} />} eyebrow="Achievements" title="Highlights & Publications" centered />

      {/* Achievement Cards */}
      <div className="flex flex-col gap-[14px]">
        {achievements.map((a, idx) => {
          const isLeft = a.memojiPosition === 'left';
          const textAlign = isLeft ? 'text-right' : 'text-left';
          const padding   = isLeft ? 'pr-[40px]'  : 'pl-[40px]';
          const ml        = isLeft ? 'auto'        : '0';

          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.07 }}
              className="card-bg rounded-[32px] p-[20px] md:p-[40px] flex items-center justify-between min-h-[120px] md:min-h-[160px] relative overflow-hidden achievement-card subtle-border"
            >
              {isLeft && <AvatarBox src={a.memojiImage} position="left" />}

              <div className={`flex flex-col gap-[6px] flex-1 ${textAlign} ${padding}`}>
                {a.highlight && (
                  <span
                    className="inner-bg inline-flex px-[10px] py-[4px] rounded-[8px] text-[10px] tracking-[0.02em] font-semibold w-fit mb-[4px] subtle-border"
                    style={{ marginLeft: ml }}
                  >
                    {a.highlight}
                  </span>
                )}
                <span className="text-[24px] md:text-[36px] leading-[100%] tracking-[-0.03em] font-semibold">
                  {a.title}
                </span>
                <span
                  className="text-[13px] text-black/50 font-semibold max-w-[400px]"
                  style={{ marginLeft: ml }}
                >
                  {a.description}
                </span>
                {a.link && (
                  <a
                    href={a.link} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#1e6ef4] font-semibold mt-[4px] hover:underline"
                    style={{ marginLeft: ml }}
                  >
                    View LinkedIn Post →
                  </a>
                )}
              </div>

              {!isLeft && <AvatarBox src={a.memojiImage} position="right" />}
            </motion.div>
          );
        })}
      </div>

      {/* Publications */}
      <div className="flex flex-col gap-[20px] mt-[20px]">
        <h3 className="inline-flex items-center justify-center gap-[8px] text-[20px] md:text-[24px] leading-[116%] tracking-[-0.02em] font-semibold text-center">
          <FileText size={20} />
          Research Publications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {publications.map((pub, i) => (
            <motion.a
              key={i}
              href={pub.link} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
              className="card-bg rounded-[24px] p-[28px] flex flex-col gap-[12px] card-hover group"
            >
              <span className="inline-flex items-center gap-[5px] agent-label text-[#1e6ef4]">
                <FileText size={11} />
                Published Paper
              </span>
              <h4 className="text-[14px] leading-[140%] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200">
                {pub.title}
              </h4>
              <span className="text-[12px] text-black/35 font-semibold">{pub.venue}</span>
              <span className="text-[11px] text-[#1e6ef4] font-semibold mt-auto">Read Paper →</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
