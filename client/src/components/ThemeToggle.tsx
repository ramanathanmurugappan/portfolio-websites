/**
 * Theme Toggle Component - Top Right Corner
 * Allows switching between light and dark themes
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!toggleTheme) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-6 right-6 z-40
        w-[48px] h-[48px]
        rounded-[12px]
        flex items-center justify-center
        transition-all duration-200 ease-out
        active:scale-95 hover:scale-105
        bg-white dark:bg-[#1a1a1a]
        text-black/40 dark:text-white/40
        hover:text-black/60 dark:hover:text-white/60
        hover:bg-black/5 dark:hover:bg-white/5
        border border-black/7 dark:border-white/7
        shadow-sm hover:shadow-md
      `}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon size={20} strokeWidth={2} />
      ) : (
        <Sun size={20} strokeWidth={2} />
      )}
    </button>
  );
}
