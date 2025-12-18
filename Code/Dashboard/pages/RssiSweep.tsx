import React from 'react';
import { RssiSweepCard } from '../components/RssiSweepCard';
import { Layout } from '../components/Layout';

const RssiSweep: React.FC = () => {
  return (
    <Layout title="RSSI Sweep" subtitle="Signal strength visualization">
      <div className="grid grid-cols-1">
        <div className="md:col-span-2 lg:col-span-3">
          <RssiSweepCard />
        </div>
      </div>
    </Layout>
  );
};

export default RssiSweep;