import React from 'react';
import { TemperatureCard } from '../components/TemperatureCard';
import { LightLevelCard } from '../components/LightLevelCard';

const Sensors: React.FC = () => {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold mb-4">Sensors Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TemperatureCard />
        <LightLevelCard />
      </div>
    </main>
  );
};

export default Sensors;