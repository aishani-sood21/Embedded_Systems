import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import Home from './pages/Home';
import Temperature from './pages/Temperature';
import LightLevel from './pages/LightLevel';
import RssiSweep from './pages/RssiSweep';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Home />
    </div>
  );
};

export default App;