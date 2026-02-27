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
  yellow: { bg: 'var(--badge-yellow-bg)', text: 'var(--badge-yellow-text)' },
  beige: { bg: 'var(--badge-beige-bg)', text: 'var(--badge-beige-text)' },
  blue: { bg: 'var(--badge-blue-bg)', text: 'var(--badge-blue-text)' },
  mint: { bg: 'var(--badge-mint-bg)', text: 'var(--badge-mint-text)' },
  fog: { bg: 'var(--badge-fog-bg)', text: 'var(--badge-fog-text)' },
  orchid: { bg: 'var(--badge-orchid-bg)', text: 'var(--badge-orchid-text)' },
  indigo: { bg: 'var(--badge-indigo-bg)', text: 'var(--badge-indigo-text)' },
  sage: { bg: 'var(--badge-sage-bg)', text: 'var(--badge-sage-text)' },
  pink: { bg: 'var(--badge-pink-bg)', text: 'var(--badge-pink-text)' },
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
    <div className="overflow-hidden w-full">
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
    </div>
  );
}
