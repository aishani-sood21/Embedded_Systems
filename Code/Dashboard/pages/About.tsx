import React from 'react';

const About: React.FC = () => {
  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">About This Dashboard</h2>
      <p className="mb-4">This IoT Sensor Dashboard visualizes data from connected sensors and provides insights with charts and trends.</p>
      <p className="mb-4">It is built with React and Vite, and integrates ThingSpeak for charting historical data. Use the navigation to explore live sensors and analytics.</p>
    </main>
  );
};

export default About;