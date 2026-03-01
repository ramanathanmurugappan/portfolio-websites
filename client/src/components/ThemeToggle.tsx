/**
 * Theme Toggle + Resume Download — Top Right Corner
 * Groups the resume download pill and theme toggle in a fixed top-right cluster.
 * Both buttons use the shared .btn-glass frosted treatment.
 */

import { Moon, Sun, Download } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import MagneticButton from './MagneticButton';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!toggleTheme) return null;

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-40 flex items-center gap-[6px] md:gap-[8px]">

      {/* Resume Download */}
      <MagneticButton>
        <a
          href="/Ramanathan_6_Yrs_Gen_AI_Architect.pdf"
          download
          className="btn-glass flex items-center gap-[6px] md:gap-[7px] px-[10px] md:px-[14px] h-[40px] md:h-[48px] rounded-[12px] text-black/55 dark:text-white/55 hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] hover:shadow-md transition-all duration-200 ease-out active:scale-95 text-[12px] md:text-[13px] font-semibold select-none"
          aria-label="Download Resume"
          title="Download Resume PDF"
        >
          <Download size={14} className="md:hidden" strokeWidth={2.2} />
          <Download size={15} className="hidden md:block" strokeWidth={2.2} />
          <span>Resume</span>
        </a>
      </MagneticButton>

      {/* Theme Toggle */}
      <MagneticButton>
        <button
          onClick={toggleTheme}
          className="btn-glass w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-[12px] flex items-center justify-center transition-all duration-200 ease-out active:scale-95 text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 hover:shadow-md"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light'
            ? <Moon size={18} className="md:hidden" strokeWidth={2} />
            : <Sun  size={18} className="md:hidden" strokeWidth={2} />
          }
          {theme === 'light'
            ? <Moon size={20} className="hidden md:block" strokeWidth={2} />
            : <Sun  size={20} className="hidden md:block" strokeWidth={2} />
          }
        </button>
      </MagneticButton>

    </div>
  );
}
