import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
// Backend-driven: remove ThingSpeak embed; show latest temp if provided
import { StatBox } from './StatBox';
import { THINGSPEAK_CONFIG, updateThingSpeakField } from '../config/thingspeak';
import { useLatestTelemetry } from '../hooks/useLatest';

export const TemperatureCard: React.FC = () => {
  const [currentTemp, setCurrentTemp] = useState(24.5);
  const [setpoint, setSetpoint] = useState(25.0);
  const { data } = useLatestTelemetry();
  const latestTemp = data?.sensors.temp_c;
  const [inputValue, setInputValue] = useState('25.0');
  const [updated, setUpdated] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1)));
      setUpdated(true);
      setTimeout(() => setUpdated(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = async () => {
    const newSetpoint = parseFloat(inputValue);
    if (!isNaN(newSetpoint)) {
      setSetpoint(newSetpoint);
      
      // Send the setpoint to ThingSpeak
      setIsSending(true);
      setSendStatus(null);
      
      const success = await updateThingSpeakField(THINGSPEAK_CONFIG.SETPOINT_FIELD, newSetpoint);
      
      setSendStatus(success ? 'success' : 'error');
      setIsSending(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setSendStatus(null), 3000);
    }
  };

  return (
    <DashboardCard title="Temperature" subtitle={updated ? "Updated live" : ""}>
      <div className="mb-4">
        <p className="text-4xl font-bold text-light-text dark:text-white">
          {(latestTemp ?? currentTemp).toFixed(1)}<span className="text-2xl align-top">°C</span>
        </p>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Setpoint: {setpoint.toFixed(1)}°C
        </p>
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <label htmlFor="temp-set" className="font-medium">Set</label>
        <input
          id="temp-set"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-24 p-2 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={isSending}
        />
        <button
          onClick={handleApply}
          disabled={isSending}
          className="px-6 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Apply'}
        </button>
        {sendStatus === 'success' && (
          <span className="text-green-500 text-sm font-medium">✓ Sent to ThingSpeak</span>
        )}
        {sendStatus === 'error' && (
          <span className="text-red-500 text-sm font-medium">✗ Failed to send</span>
        )}
      </div>
      <div className="mb-4 h-64 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
        <span>Chart to be shown from backend history (not ThingSpeak).</span>
      </div>
      <div className="flex gap-4">
        <StatBox label="Min" value="22.1°C" />
        <StatBox label="Avg" value="24.8°C" />
        <StatBox label="Max" value="27.3°C" />
      </div>
    </DashboardCard>
  );
};
