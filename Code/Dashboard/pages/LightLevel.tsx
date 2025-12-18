import React from 'react';
import { LightLevelCard } from '../components/LightLevelCard';
import { Layout } from '../components/Layout';
import { useLatestTelemetry } from '../hooks/useLatest';

const LightLevel: React.FC = () => {
  const { data, loading } = useLatestTelemetry();
  const latestLight = data?.sensors.light;
  return (
    <Layout title="Light Level" subtitle="Ambient light measurements">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <LightLevelCard />
          <div className="mt-4">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Latest: {loading ? '...' : (latestLight != null ? `${latestLight} lux` : 'n/a')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LightLevel;