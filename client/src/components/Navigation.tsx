/**
 * Navigation Component - Fixed Bottom iOS-style Navigation Bar
 * Design: Rounded pill container with icon buttons
 * Mobile-friendly: Larger touch targets, active state styling instead of hover
 */

import { Milestone, Layers, Terminal, AtSign, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  activeSection: string;
  isChatOpen?: boolean;
  onChatToggle?: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'home',       icon: Milestone, label: 'Home',       isChat: false },
  { id: 'works',      icon: Layers,    label: 'Works',      isChat: false },
  { id: 'tech-stack', icon: Terminal,  label: 'Tech Stack', isChat: false },
  { id: 'contact',    icon: AtSign,    label: 'Say Hi',     isChat: false },
  { id: 'chat',       icon: Sparkles,  label: 'Chat',       isChat: true  },
];

export default function Navigation({ activeSection, isChatOpen = false, onChatToggle }: NavigationProps) {
  const [pressed, setPressed] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavItemClick = (item: typeof navItems[0]) => {
    if (item.isChat) onChatToggle?.(!isChatOpen);
    else scrollToSection(item.id);
  };

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-40 nav-bar w-full px-4 md:w-auto md:px-0"
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center gap-[4px] md:gap-[5px] p-[8px] md:p-[10px] rounded-[18px] md:rounded-[20px] mx-auto w-fit nav-glass">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isChat ? isChatOpen : activeSection === item.id;
          const isPressed = pressed === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item)}
              onTouchStart={() => setPressed(item.id)}
              onTouchEnd={() => setPressed(null)}
              onMouseDown={() => setPressed(item.id)}
              onMouseUp={() => setPressed(null)}
              onMouseLeave={() => setPressed(null)}
              aria-label={item.label}
              title={item.label}
              className={`
                flex items-center justify-center
                w-[44px] h-[44px] md:w-[52px] md:h-[52px]
                rounded-[12px] md:rounded-[14px]
                transition-all duration-200 ease-out
                active:scale-95
                ${isActive
                  ? 'bg-[#1e6ef4] text-white scale-105'
                  : isPressed
                  ? 'bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 scale-95'
                  : 'bg-transparent text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black/70 dark:hover:text-white/70'
                }
              `}
            >
              <Icon size={20} className="md:hidden" strokeWidth={1.75} />
              <Icon size={22} className="hidden md:block" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
