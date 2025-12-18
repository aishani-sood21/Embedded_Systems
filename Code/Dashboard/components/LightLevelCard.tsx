import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
// Backend-driven: remove ThingSpeak embed and show latest from API
import { StatBox } from './StatBox';
import { THINGSPEAK_CONFIG } from '../config/thingspeak';
import { useLatestTelemetry } from '../hooks/useLatest';

export const LightLevelCard: React.FC = () => {
  const { data, loading } = useLatestTelemetry();
  const clearChannelValue = data?.sensors.light ?? null;

  return (
    <DashboardCard title="Light Level" subtitle="AS7341 Clear Channel (backend)">
      <div className="mb-4">
        <p className="text-4xl font-bold text-light-text dark:text-white">
          {loading ? '...' : (clearChannelValue != null ? clearChannelValue : 'n/a')}
        </p>
      </div>
      <div className="flex-grow mb-4 h-64 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
        <span>Chart to be shown from backend history (not ThingSpeak).</span>
      </div>
      <div className="flex gap-4">
        <StatBox label="Min" value="210" />
        <StatBox label="Avg" value="465" />
        <StatBox label="Max" value="890" />
      </div>
    </DashboardCard>
  );
};