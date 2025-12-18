import React from 'react';

interface ThingSpeakChartProps {
  channelId: string;
  chartId: string;
  title: string;
}

export const ThingSpeakChart: React.FC<ThingSpeakChartProps> = ({ channelId, chartId, title }) => {
  // NOTE: These colors are manually synced with the theme in index.html
  // New "Abyssal Teal" theme colors
  const darkBgColor = '161B22'; // dark-card
  const darkTextColor = 'E6EDF3'; // dark-text
  const lightBgColor = 'FFFFFF'; // light-card
  const lightTextColor = '1C1E21'; // light-text

  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // ThingSpeak embed URL format: /channels/CHANNEL_ID/charts/FIELD_NUMBER
  // Note: chartId is actually the field number (1, 2, 3, etc.)
  const src = `https://thingspeak.com/channels/${channelId}/charts/${chartId}?bgcolor=%23${isDarkMode ? darkBgColor : lightBgColor}&color=%23${isDarkMode ? darkTextColor : lightTextColor}&dynamic=true&results=60&type=line&update=15`;

  console.log('ThingSpeak Chart URL:', src); // Debug log to check the URL

  return (
    <div className="w-full h-full">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        src={src}
        title={title}
        className="rounded-md"
      ></iframe>
    </div>
  );
};