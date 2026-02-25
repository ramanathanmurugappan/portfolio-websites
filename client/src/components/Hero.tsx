/**
 * Hero Component - Main landing section
 * Features: 3D avatar with status indicator, headline, and infinite marquee badges
 */

import Marquee from './Marquee';
import { statsBadges, skillsBadges } from '../data/hero';

export default function Hero() {
  return (
    <div className="flex flex-col pt-[100px]">
      <div className="flex flex-col gap-[100px] relative">
        {/* Hero Offer - Avatar and Headline */}
        <div
          className="container flex flex-col items-center text-center gap-[32px]"
          style={{
            background: 'radial-gradient(ellipse 600px 400px at 50% 0%, rgba(30,110,244,0.06) 0%, transparent 70%)',
          }}
        >
          {/* Avatar with Status Indicator */}
          <div className="relative inline-block animate-fade-in">
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
            {/* Green Online Status */}
            <div 
              className="absolute -bottom-[2px] -right-[2px] bg-white rounded-full p-[3px]"
              style={{ boxShadow: '0 0 0 2px white' }}
            >
              <div className="w-[14px] h-[14px] rounded-full bg-[#35c759] status-online" />
            </div>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-[4px] animate-fade-in-up delay-200">
            <h1 className="text-[clamp(32px,5vw,48px)] leading-[116%] tracking-[-0.03em] font-semibold">
              Hi, I'm Ramanathan 👋
            </h1>
            <p className="text-[clamp(32px,5vw,48px)] leading-[116%] tracking-[-0.03em] font-semibold animate-gradient-text">
              I build enterprise-grade AI products
            </p>
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
