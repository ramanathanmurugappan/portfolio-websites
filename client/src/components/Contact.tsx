/**
 * Contact Component - Contact information and CTA
 * Features: Centered CTA with contact cards
 * Modernized: Framer Motion whileInView reveals + shimmer buttons
 */

import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { socialLinks } from '../data/socialLinks';
import MagneticButton from './MagneticButton';

// ── ContactCard ──────────────────────────────────────────────────────────────

interface ContactCardProps {
  iconElement: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  delay: number;
}

function ContactCard({ iconElement, label, value, href, delay }: ContactCardProps) {
  const motionProps = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.5, ease: 'easeOut' as const, delay },
    className: 'group flex flex-col items-center gap-[6px] p-[20px] md:p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-center card-hover',
  };

  const inner = (
    <>
      <span className="mb-[4px] flex items-center justify-center w-[32px] h-[32px]">{iconElement}</span>
      <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
        {label}
      </span>
      <span className={`text-[14px] font-semibold text-black dark:text-white break-all ${href ? 'group-hover:text-[#1e6ef4] transition-colors duration-200' : ''}`}>
        {value}
      </span>
    </>
  );

  if (href) {
    return <motion.a href={href} {...motionProps}>{inner}</motion.a>;
  }
  return <motion.div {...motionProps}>{inner}</motion.div>;
}

// ── Contact data ─────────────────────────────────────────────────────────────

const CONTACT_CARDS: ContactCardProps[] = [
  {
    iconElement: <img src="/images/tech-logos/gmail.svg" alt="Gmail" className="w-[28px] h-[28px] object-contain dark:invert" />,
    label: 'Email', value: 'ramanathanmurugappan29@gmail.com', href: 'mailto:ramanathanmurugappan29@gmail.com', delay: 0,
  },
  {
    iconElement: <Smartphone size={28} strokeWidth={1.5} className="text-black/70 dark:text-white/70" />,
    label: 'Phone', value: '+91 99 444 66 701', href: 'tel:+919944466701', delay: 0.07,
  },
  {
    iconElement: <img src="/images/tech-logos/googlemaps.svg" alt="Google Maps" className="w-[28px] h-[28px] object-contain dark:invert" />,
    label: 'Location', value: 'Bengaluru, India', delay: 0.14,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Contact() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header */}
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
        {CONTACT_CARDS.map((card) => (
          <ContactCard key={card.label} {...card} />
        ))}
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
          <MagneticButton key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-black/70 dark:text-white/70 text-[13px] font-semibold hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] transition-all duration-200 card-hover"
            >
              {link.label}
            </a>
          </MagneticButton>
        ))}
      </motion.div>
    </div>
  );
}
