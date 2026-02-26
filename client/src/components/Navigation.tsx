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
    <nav className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 nav-bar w-full px-4 md:w-auto md:px-0">
      <div
        className="flex items-center gap-[5px] p-[10px] rounded-[20px] mx-auto w-fit nav-glass"
        style={{
          boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
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
                min-w-[52px] min-h-[52px] w-[52px] h-[52px]
                rounded-[14px]
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
              <Icon size={22} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
