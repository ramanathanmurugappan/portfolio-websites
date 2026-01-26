/**
 * Navigation Component - Fixed Bottom iOS-style Navigation Bar
 * Design: Rounded pill container with icon buttons
 */

import { Home, Folder, FileText, Mail } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'works', icon: Folder, label: 'Works' },
  { id: 'about', icon: FileText, label: 'About' },
  { id: 'contact', icon: Mail, label: 'Say Hi' },
];

export default function Navigation({ activeSection }: NavigationProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 nav-bar">
      <div 
        className="flex items-center gap-[5px] p-[10px] rounded-[20px] bg-white"
        style={{ 
          boxShadow: '0 0 0 1px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.08)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                flex items-center justify-center
                w-[56px] h-[56px]
                rounded-[16px]
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-[#1e6ef4] text-white scale-105' 
                  : 'bg-transparent text-black/40 hover:bg-black/5 hover:text-black/60'
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
