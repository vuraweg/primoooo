import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      className="relative w-14 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-indigo-600 dark:to-indigo-800 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
    >
      <span
        className={`absolute top-1 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isDarkMode ? 'translate-x-[22px]' : 'translate-x-[4px]'
        }`}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-600" />
        )}
      </span>
    </button>
  );
};
