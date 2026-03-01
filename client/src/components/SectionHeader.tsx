import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, icon, title, centered }: SectionHeaderProps) {
  return (
    <motion.div
      className={`flex flex-col gap-[8px] ${centered ? 'items-center text-center' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      {(eyebrow || icon) && (
        <span className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
          {icon}
          {eyebrow}
        </span>
      )}
      <h2 className="text-[clamp(28px,4vw,40px)] leading-[116%] tracking-[-0.02em] font-semibold">
        {title}
      </h2>
    </motion.div>
  );
}
