import React from 'react';
import { TemperatureCard } from '../components/TemperatureCard';
import { LightLevelCard } from '../components/LightLevelCard';
import { RssiSweepCard } from '../components/RssiSweepCard';
import { StatBox } from '../components/StatBox';
import { Layout } from '../components/Layout';
// Single-page mode: no router, so use simple links/buttons.
import { useLatestTelemetry } from '../hooks/useLatest';

const Home: React.FC = () => {
  const { data, loading } = useLatestTelemetry();
  const latestLight = data?.sensors.light;
  const latestTemp = data?.sensors.temp_c; // may come from another device
  const latestRssi = data?.sensors.rssi;
  return (
    <Layout title="Overview" subtitle="Quick look at key sensors and trends">
      <div className="flex flex-wrap gap-4 mb-6">
        <StatBox label="Temp (latest)" value={
          loading ? '...' : (latestTemp != null ? `${latestTemp.toFixed(1)} °C` : 'n/a')
        } />
        <StatBox label="Light (latest)" value={
          loading ? '...' : (latestLight != null ? `${latestLight} lux` : 'n/a')
        } />
        <StatBox label="RSSI (latest)" value={
          loading ? '...' : (latestRssi != null ? `${latestRssi} dBm` : 'n/a')
        } />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Temperature: take 2 columns on larger screens */}
        <section id="temperature" className="md:col-span-2 lg:col-span-2 flex flex-col">
          <div className="h-full">
            <TemperatureCard />
          </div>
        </section>

        {/* Light: single column aligned with Temperature height */}
        <section id="light" className="md:col-span-1 lg:col-span-1 flex flex-col">
          <div className="h-full">
            <LightLevelCard />
          </div>
        </section>

        {/* RSSI: full width below on all larger screens */}
        <section id="rssi" className="md:col-span-2 lg:col-span-3 flex flex-col">
          <div className="h-full">
            <RssiSweepCard />
          </div>
        </section>
      </div>
      <div className="mt-4 flex justify-end">
        <a id="top" href="#top" className="text-accent underline">Back to top</a>
      </div>
    </Layout>
  );
};

export default Home;