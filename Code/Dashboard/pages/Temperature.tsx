import React from 'react';
import { TemperatureCard } from '../components/TemperatureCard';
import { Layout } from '../components/Layout';

const Temperature: React.FC = () => {
  return (
    <Layout title="Temperature" subtitle="Live readings and trends">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TemperatureCard />
        </div>
      </div>
    </Layout>
  );
};

export default Temperature;