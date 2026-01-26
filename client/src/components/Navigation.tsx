/**
 * Navigation Component - Fixed Bottom iOS-style Navigation Bar
 * Design: Rounded pill container with icon buttons
 * Mobile-friendly: Larger touch targets, active state styling instead of hover
 */

import { Home, Folder, FileText, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  activeSection: string;
  isChatOpen?: boolean;
  onChatToggle?: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'works', icon: Folder, label: 'Works' },
  { id: 'tech-stack', icon: FileText, label: 'Tech Stack' },
  { id: 'contact', icon: Mail, label: 'Say Hi' },
  { id: 'chat', icon: MessageCircle, label: 'Chat', isChat: true },
];

export default function Navigation({ activeSection, isChatOpen = false, onChatToggle }: NavigationProps) {
  const [pressed, setPressed] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTouchStart = (id: string) => {
    setPressed(id);
  };

  const handleTouchEnd = () => {
    setPressed(null);
  };

  const handleNavItemClick = (item: typeof navItems[0]) => {
    if (item.isChat) {
      onChatToggle?.(!isChatOpen);
    } else {
      scrollToSection(item.id);
    }
  };

  return (
    <nav className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 nav-bar w-full px-4 md:w-auto md:px-0">
      <div 
        className="flex items-center gap-[5px] p-[10px] rounded-[20px] bg-white dark:bg-[#1a1a1a] mx-auto w-fit"
        style={{ 
          boxShadow: '0 0 0 1px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.08)',
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
              onTouchStart={() => handleTouchStart(item.id)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(item.id)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              className={`
                flex items-center justify-center
                min-w-[56px] min-h-[56px] w-[56px] h-[56px]
                rounded-[16px]
                transition-all duration-200 ease-out
                active:scale-95
                ${isActive 
                  ? 'bg-[#1e6ef4] text-white scale-105' 
                  : isPressed
                  ? 'bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 scale-95'
                  : 'bg-transparent text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black/60 dark:hover:text-white/60 active:bg-black/10 dark:active:bg-white/10'
                }
              `}
              aria-label={item.label}
              title={item.label}
            >
              <Icon 
                size={24} 
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
