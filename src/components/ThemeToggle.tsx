import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      className="p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
    >
      {isDarkMode ? (
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg">
          <Moon className="w-8 h-8 text-white" />
        </div>
      ) : (
        <Sun className="w-8 h-8 text-yellow-500" />
      )}
    </button>
  );
};
