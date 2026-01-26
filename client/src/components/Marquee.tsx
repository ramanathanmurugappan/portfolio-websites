/**
 * Marquee Component - Infinite horizontal scrolling badges
 * Features: Smooth animation, duplicated content for seamless loop
 */

interface Badge {
  emoji: string;
  text: string;
  variant: 'yellow' | 'beige' | 'blue' | 'mint' | 'fog' | 'orchid' | 'indigo' | 'sage' | 'pink';
}

interface MarqueeProps {
  badges: Badge[];
  direction: 'left' | 'right';
}

const variantStyles: Record<Badge['variant'], { bg: string; text: string }> = {
  yellow: { bg: '#fff0c6', text: '#845200' },
  beige: { bg: '#fde2d5', text: '#71391e' },
  blue: { bg: '#e4edf6', text: '#5a6570' },
  mint: { bg: '#d8f0dc', text: '#33683c' },
  fog: { bg: '#e9e9ea', text: '#5e5e5f' },
  orchid: { bg: '#f2ddf5', text: '#65326c' },
  indigo: { bg: '#e1e6fb', text: '#425088' },
  sage: { bg: '#dff0d9', text: '#406733' },
  pink: { bg: '#f6e0e0', text: '#854040' },
};

function BadgePill({ emoji, text, variant }: Badge) {
  const styles = variantStyles[variant];
  
  return (
    <div 
      className="flex items-center gap-[10px] px-[20px] py-[14px] rounded-[18px] flex-shrink-0 select-none"
      style={{ 
        backgroundColor: styles.bg, 
        color: styles.text 
      }}
    >
      <span className="text-[32px] leading-none">{emoji}</span>
      <span className="text-[32px] leading-[116%] tracking-[-0.03em] font-semibold whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

export default function Marquee({ badges, direction }: MarqueeProps) {
  // Duplicate badges for seamless infinite scroll
  const duplicatedBadges = [...badges, ...badges, ...badges, ...badges];
  
  return (
    <div 
      className={`flex items-center gap-[16px] ${
        direction === 'left' ? 'justify-start' : 'justify-end'
      }`}
    >
      <div 
        className={`flex items-center gap-[16px] ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
      >
        {duplicatedBadges.map((badge, index) => (
          <BadgePill key={`${badge.text}-${index}`} {...badge} />
        ))}
      </div>
    </div>
  );
}
