// ThingSpeak Configuration
// Replace these values with your actual ThingSpeak channel details

export const THINGSPEAK_CONFIG = {
  // Your ThingSpeak Channel ID
  // Find this in your channel URL: https://thingspeak.com/channels/YOUR_CHANNEL_ID
  CHANNEL_ID: '2855680', // Replace with your actual channel ID
  
  // Your ThingSpeak Write API Key (for sending data TO ThingSpeak)
  // Find this in Channel Settings > API Keys > Write API Key
  WRITE_API_KEY: 'PXFVMQ63MWER609O', // Replace with your actual Write API Key
  
  // Field numbers for reading data (charts)
  FIELDS: {
    TEMPERATURE: '1',      // Field number for temperature data
    HUMIDITY: '2',         // Field number for humidity data
    LIGHT_LEVEL: '3',      // Field number for light level data
    RSSI: '4',            // Field number for RSSI data
  },
  
  // Field for writing setpoint data
  SETPOINT_FIELD: 'field5', // Field number where setpoint will be written (e.g., field5, field6, etc.)
};

// API Helper function to update ThingSpeak
export const updateThingSpeakField = async (field: string, value: number): Promise<boolean> => {
  try {
    const url = `https://api.thingspeak.com/update?api_key=${THINGSPEAK_CONFIG.WRITE_API_KEY}&${field}=${value}`;
    
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.text();
      // ThingSpeak returns the entry ID if successful, or 0 if failed
      return data !== '0';
    }
    return false;
  } catch (error) {
    console.error('Error updating ThingSpeak:', error);
    return false;
  }
};
