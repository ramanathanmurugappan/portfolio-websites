/**
 * Theme Toggle + Resume Download — Top Right Corner
 * Groups the resume download pill and theme toggle in a fixed top-right cluster
 */

import { Moon, Sun, Download } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import MagneticButton from './MagneticButton';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!toggleTheme) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-40 flex items-center gap-[6px] md:gap-[8px]">
      {/* Resume Download */}
      <MagneticButton>
        <a
          href="/Ramanathan_6_Yrs_Gen_AI_Architect.pdf"
          download
          className="flex items-center gap-[6px] px-[10px] md:px-[14px] h-[40px] md:h-[48px] rounded-[10px] md:rounded-[12px] bg-white dark:bg-[#1a1a1a] text-black/55 dark:text-white/55 hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] border border-black/[0.07] dark:border-white/[0.07] shadow-sm hover:shadow-md transition-all duration-200 ease-out active:scale-95 text-[12px] md:text-[13px] font-semibold select-none"
          aria-label="Download Resume"
          title="Download Resume PDF"
        >
          <Download size={14} strokeWidth={2.2} />
          <span className="hidden sm:inline">Resume</span>
        </a>
      </MagneticButton>

      {/* Theme Toggle */}
      <MagneticButton>
        <button
          onClick={toggleTheme}
          className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-[10px] md:rounded-[12px] flex items-center justify-center transition-all duration-200 ease-out active:scale-95 bg-white dark:bg-[#1a1a1a] text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.07] dark:border-white/[0.07] shadow-sm hover:shadow-md"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <Moon size={20} strokeWidth={2} />
          ) : (
            <Sun size={20} strokeWidth={2} />
          )}
        </button>
      </MagneticButton>
    </div>
  );
}
