/**
 * Contact Component - Contact information and CTA
 * Features: Centered CTA with contact cards
 * Modernized: Framer Motion whileInView reveals + shimmer buttons
 */

import { motion } from 'framer-motion';
import { socialLinks } from '../data/socialLinks';

export default function Contact() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header - Centered */}
      <motion.div
        className="flex flex-col items-center text-center gap-[20px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-[clamp(20px,3vw,24px)] leading-[116%] tracking-[-0.02em] font-semibold">
          📬 Get In Touch
        </h2>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {/* Email Card */}
        <motion.a
          href="mailto:ramanathanmurugappan29@gmail.com"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0 }}
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-center card-hover"
        >
          <span className="text-[24px] mb-[4px]">📧</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Email
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 break-all text-black dark:text-white">
            ramanathanmurugappan29@gmail.com
          </span>
        </motion.a>

        {/* Phone Card */}
        <motion.a
          href="tel:+919944466701"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.07 }}
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-center card-hover"
        >
          <span className="text-[24px] mb-[4px]">📱</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Phone
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
            +91 99 444 66 701
          </span>
        </motion.a>

        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.14 }}
          className="flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-center card-hover"
        >
          <span className="text-[24px] mb-[4px]">📍</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Location
          </span>
          <span className="text-[14px] font-semibold text-black dark:text-white">
            Bengaluru, India
          </span>
        </motion.div>
      </div>

      {/* Social Links */}
      <motion.div
        className="flex justify-center gap-[12px] flex-wrap"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      >
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-black/70 dark:text-white/70 text-[13px] font-semibold hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] transition-all duration-200 card-hover"
          >
            {link.label}
          </a>
        ))}
      </motion.div>
    </div>
  );
}
