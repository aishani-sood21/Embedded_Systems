
import React from 'react';
import { Zap, AlertCircle, History, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md dark:border-b dark:border-dark-border p-4">
      <div className="flex items-center justify-between gap-3">
        <Zap className="w-8 h-8 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold text-light-text dark:text-white">
          Sensor Dashboard
        </h1>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Error</span>
        </div>
        <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            <select className="bg-transparent border border-light-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option>20</option>
                <option>50</option>
                <option>100</option>
            </select>
        </div>
        <button
          onClick={toggleTheme}
          className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-light-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        </div>
      </div>
    </header>
  );
};
