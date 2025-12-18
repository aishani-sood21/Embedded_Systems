import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
// Backend-driven: remove ThingSpeak embed; show latest RSSI if provided
import { Info } from 'lucide-react';
import { THINGSPEAK_CONFIG } from '../config/thingspeak';
import { useLatestTelemetry } from '../hooks/useLatest';

export const RssiSweepCard: React.FC = () => {
    const [isSweeping, setIsSweeping] = useState(false);
    const { data, loading } = useLatestTelemetry();
    const latestRssi = data?.sensors.rssi;

    const handleSweep = () => {
        setIsSweeping(true);
        setTimeout(() => setIsSweeping(false), 5000);
    };

    return (
        <DashboardCard title="RSSI Sweep" className="!p-0">
             <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-1/3 md:border-r border-light-border dark:border-dark-border">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        Graphs RSSI (dBm) measured by the CC2500 receiver module across the 2.4 GHz ISM band.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <button
                            onClick={handleSweep}
                            disabled={isSweeping}
                            className="px-6 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isSweeping ? 'Sweeping...' : 'Sweep Now'}
                        </button>
                        <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                           <span>Range: 2400 — 2483.5 MHz (updates every 30s)</span>
                           <Info className="w-4 h-4 cursor-pointer" />
                        </div>
                    </div>
                </div>
                                <div className="flex-grow p-6">
                                        <div className="mb-2">
                                                <p className="text-2xl font-semibold text-light-text dark:text-white">
                                                    RSSI: {loading ? '...' : (latestRssi != null ? `${latestRssi} dBm` : 'n/a')}
                                                </p>
                                            </div>
                                            <div className="h-64 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
                                                <span>Chart to be shown from backend history (not ThingSpeak).</span>
                                            </div>
                                </div>
             </div>
        </DashboardCard>
    );
};
