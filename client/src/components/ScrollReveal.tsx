import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * ScrollReveal — fade-in-up wrapper driven by IntersectionObserver.
 * Replaces the repeated motion.div initial/whileInView/transition boilerplate.
 */
export default function ScrollReveal({
  children,
  className,
  delay   = 0,
  duration = 0.5,
  y        = 20,
  margin   = '-40px',
}: {
  children:  ReactNode;
  className?: string;
  delay?:    number;
  duration?: number;
  y?:        number;
  margin?:   string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
