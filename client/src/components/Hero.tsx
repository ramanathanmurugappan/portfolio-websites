/**
 * Hero Component - Main landing section
 * Features: 3D avatar with status indicator, headline, and infinite marquee badges
 */

import Marquee from './Marquee';

// Stats badges for the first marquee row - Ramanathan's stats
const statsBadges = [
  { emoji: '🚀', text: '6+ Years Experience', variant: 'yellow' as const },
  { emoji: '🤖', text: 'AI/ML Engineer', variant: 'mint' as const },
  { emoji: '🏢', text: '3+ Companies', variant: 'fog' as const },
  { emoji: '📄', text: '2 Publications', variant: 'blue' as const },
  { emoji: '🎯', text: 'Enterprise AI', variant: 'yellow' as const },
];

// Skills badges for the second marquee row - Ramanathan's skills
const skillsBadges = [
  { emoji: '🦜', text: 'Gen AI Architect', variant: 'orchid' as const },
  { emoji: '🔗', text: 'LangChain', variant: 'sage' as const },
  { emoji: '🤖', text: 'Multi-Agent Systems', variant: 'beige' as const },
  { emoji: '📊', text: 'Data Scientist', variant: 'pink' as const },
  { emoji: '☁️', text: 'Cloud & MLOps', variant: 'blue' as const },
];

export default function Hero() {
  return (
    <div className="flex flex-col pt-[100px]">
      <div className="flex flex-col gap-[100px] relative">
        {/* Hero Offer - Avatar and Headline */}
        <div className="container flex flex-col items-center text-center gap-[32px]">
          {/* Avatar with Status Indicator */}
          <div className="relative inline-block animate-fade-in">
            <div 
              className="w-[100px] h-[100px] rounded-[28px] flex items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: '#E8E0F0',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
            <h1 className="text-[48px] leading-[116%] tracking-[-0.03em] font-semibold">
              Hi, I'm Ramanathan 👋
            </h1>
            <p className="text-[48px] leading-[116%] tracking-[-0.03em] font-semibold text-black/35">
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
              background: 'linear-gradient(90deg, white 0%, transparent 100%)' 
            }}
          />
          
          {/* Right Gradient Overlay */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[300px] z-10 pointer-events-none"
            style={{ 
              background: 'linear-gradient(270deg, white 0%, transparent 100%)' 
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
