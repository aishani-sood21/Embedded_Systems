import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
          />
          <span>Enable dark mode</span>
        </label>
      </div>
    </main>
  );
};

export default Settings;