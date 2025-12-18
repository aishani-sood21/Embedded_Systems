import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { ThingSpeakChart } from './ThingSpeakChart';
import { StatBox } from './StatBox';
import { THINGSPEAK_CONFIG } from '../config/thingspeak';

export const HumidityCard: React.FC = () => {
  const [currentHumidity, setCurrentHumidity] = useState(45.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHumidity(prev => parseFloat((prev + (Math.random() - 0.5) * 1.5).toFixed(1)));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardCard title="Humidity" subtitle="% RH">
      <div className="mb-4">
        <p className="text-4xl font-bold text-light-text dark:text-white">
          {currentHumidity.toFixed(1)}<span className="text-2xl align-top">%</span>
        </p>
      </div>
      <div className="flex-grow mb-4">
         <ThingSpeakChart channelId={THINGSPEAK_CONFIG.CHANNEL_ID} chartId={THINGSPEAK_CONFIG.FIELDS.HUMIDITY} title="Humidity Chart" />
      </div>
      <div className="flex gap-4">
        <StatBox label="Min" value="35.2%" />
        <StatBox label="Avg" value="46.1%" />
        <StatBox label="Max" value="55.8%" />
      </div>
    </DashboardCard>
  );
};
