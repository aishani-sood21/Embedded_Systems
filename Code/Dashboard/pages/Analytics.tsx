import React from 'react';
// Some browsers or ThingSpeak settings refuse iframe embedding.
// Use PNG charts or external links as a fallback to avoid "refused to connect".
import { ThingSpeakChart } from '../components/ThingSpeakChart';

const Analytics: React.FC = () => {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
      <p className="mb-6">Historical trends and charts.</p>
      {/* If iframe is blocked, we can show an image fallback and a link to open charts on ThingSpeak. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-64">
            <ThingSpeakChart channelId="123456" chartId="1" title="Temperature Trend" />
          </div>
          <a
            className="text-accent underline"
            href="https://thingspeak.com/channels/123456/charts/1"
            target="_blank"
            rel="noreferrer"
          >
            Open Temperature chart on ThingSpeak
          </a>
        </div>
        <div className="space-y-2">
          <div className="h-64">
            <ThingSpeakChart channelId="123456" chartId="2" title="Light Level Trend" />
          </div>
          <a
            className="text-accent underline"
            href="https://thingspeak.com/channels/123456/charts/2"
            target="_blank"
            rel="noreferrer"
          >
            Open Light Level chart on ThingSpeak
          </a>
        </div>
      </div>
    </main>
  );
};

export default Analytics;