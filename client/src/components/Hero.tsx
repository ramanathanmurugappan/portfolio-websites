/**
 * Hero Component - Main landing section
 * Features: Skeleton shimmer → real content, staggered word reveal, parallax scroll,
 *           animated counter stats, resume download button, infinite marquee badges
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Marquee from './Marquee';
import { statsBadges, skillsBadges } from '../data/hero';
import { useCountUp } from '../hooks/useCountUp';

const HEADLINE_WORDS = ["Hi,", "I'm", "Ramanathan", "👋"];
const SUBLINE_WORDS = ["I", "build", "enterprise-grade", "AI", "products"];

const STATS = [
  { value: 6, suffix: '+', label: 'Years Exp' },
  { value: 3, suffix: '+', label: 'Companies' },
  { value: 2, suffix: '', label: 'Publications' },
  { value: 20, suffix: '+', label: 'AI Projects' },
];

function CounterStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 1400);
  return (
    <div ref={ref} className="flex flex-col items-center gap-[4px]">
      <span className="text-[28px] md:text-[32px] font-bold tracking-[-0.03em] text-black dark:text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-[10px] text-black/40 dark:text-white/40 font-semibold uppercase tracking-[0.06em]">
        {label}
      </span>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="flex flex-col pt-[100px]">
      <div className="flex flex-col gap-[100px]">
        <div className="container flex flex-col items-center text-center gap-[32px]">
          <div className="w-[100px] h-[100px] rounded-[28px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
          <div className="flex flex-col gap-[10px] items-center">
            <div className="h-[44px] w-[340px] max-w-[80vw] rounded-[12px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
            <div className="h-[44px] w-[420px] max-w-[85vw] rounded-[12px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-[32px] md:gap-[48px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-[6px]">
                <div className="h-[32px] w-[56px] rounded-[8px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
                <div className="h-[12px] w-[60px] rounded-[6px] bg-[#e5e5e5] dark:bg-[#1a1a1a] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (showSkeleton) return <HeroSkeleton />;

  return (
    <div ref={heroRef} className="flex flex-col pt-[100px]">
      <div className="flex flex-col gap-[100px] relative">
        {/* Hero Offer — Avatar and Headline */}
        <div
          className="container flex flex-col items-center text-center gap-[32px]"
          style={{
            background: 'radial-gradient(ellipse 600px 400px at 50% 0%, rgba(30,110,244,0.06) 0%, transparent 70%)',
          }}
        >
          {/* Avatar with parallax + status indicator */}
          <motion.div className="relative inline-block" style={{ y: avatarY }}>
            <div
              className="w-[100px] h-[100px] rounded-[28px] flex items-center justify-center overflow-hidden bg-[#E8E0F0] dark:bg-[#2D1F45] subtle-border"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 4px rgba(30,110,244,0.08)',
              }}
            >
              <img
                src="/images/avatar-hero.png"
                alt="Ramanathan Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-[2px] -right-[2px] bg-white rounded-full p-[3px]"
              style={{ boxShadow: '0 0 0 2px white' }}
            >
              <div className="w-[14px] h-[14px] rounded-full bg-[#35c759] status-online" />
            </div>
          </motion.div>

          {/* Headline with staggered word reveal + parallax */}
          <motion.div className="flex flex-col gap-[4px]" style={{ y: headlineY }}>
            <h1 className="text-[clamp(32px,5vw,48px)] leading-[116%] tracking-[-0.03em] font-semibold">
              {HEADLINE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <p className="text-[clamp(32px,5vw,48px)] leading-[116%] tracking-[-0.03em] font-semibold animate-gradient-text">
              {SUBLINE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: (HEADLINE_WORDS.length + i) * 0.07,
                    ease: 'easeOut',
                  }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </motion.div>

          {/* Animated Counter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[28px] md:gap-[48px] py-[8px]">
            {STATS.map((stat) => (
              <CounterStat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>

        {/* Marquee Section */}
        <div className="flex flex-col gap-[20px] relative overflow-hidden animate-fade-in delay-400">
          {/* Left Gradient Overlay */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[300px] z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, var(--white) 0%, transparent 100%)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              maskImage: 'linear-gradient(90deg, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(90deg, black 60%, transparent 100%)',
            }}
          />
          {/* Right Gradient Overlay */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[300px] z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(270deg, var(--white) 0%, transparent 100%)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              maskImage: 'linear-gradient(270deg, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(270deg, black 60%, transparent 100%)',
            }}
          />

          {/* Stats Marquee - Moving Left */}
          <Marquee badges={statsBadges} direction="left" />

          {/* Skills Marquee - Moving Right */}
          <Marquee badges={skillsBadges} direction="right" />
        </div>
      </div>
    </div>
  );
}
