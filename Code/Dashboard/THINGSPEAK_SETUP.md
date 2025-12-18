# ThingSpeak Integration Setup Guide

## 🎯 Overview
Your dashboard now supports:
1. **Reading data** from ThingSpeak (charts display automatically)
2. **Writing data** to ThingSpeak (temperature setpoint control)

## 📋 Setup Steps

### 1. Get Your ThingSpeak Channel Information

1. Go to [ThingSpeak](https://thingspeak.com)
2. Open your channel
3. Note your **Channel ID** from the URL:
   ```
   https://thingspeak.com/channels/YOUR_CHANNEL_ID
   ```

### 2. Get Your Write API Key (for Temperature Setpoint)

1. In your ThingSpeak channel, go to **API Keys** tab
2. Copy your **Write API Key** (it looks like: `XXXXXXXXXXXXXXXX`)

### 3. Identify Your Field Numbers

In your ThingSpeak channel, note which field corresponds to which sensor:
- **Field 1**: (e.g., RSSI)
- **Field 2**: (e.g., Light Level)
- **Field 3**: (e.g., Humidity)
- **Field 4**: (e.g., Temperature)
- **Field 5**: (for Temperature Setpoint - this is where the dashboard will write)

### 4. Update the Configuration File

Open `config/thingspeak.ts` and update the following:

```typescript
export const THINGSPEAK_CONFIG = {
  // Replace with YOUR channel ID
  CHANNEL_ID: 'YOUR_CHANNEL_ID', // e.g., '2758621'
  
  // Replace with YOUR Write API Key
  WRITE_API_KEY: 'YOUR_WRITE_API_KEY', // e.g., 'ABCD1234EFGH5678'
  
  // Update field numbers to match your channel setup
  FIELDS: {
    TEMPERATURE: '4',      // Field number for temperature data
    HUMIDITY: '3',         // Field number for humidity data
    LIGHT_LEVEL: '2',      // Field number for light level data
    RSSI: '1',            // Field number for RSSI data
  },
  
  // Field where temperature setpoint will be written
  SETPOINT_FIELD: 'field5', // e.g., 'field5', 'field6', etc.
};
```

## 🚀 How It Works

### Reading Data (Charts)
- The dashboard automatically embeds ThingSpeak charts
- Charts update every 15 seconds automatically
- No API key needed for reading public channels
- Charts show the last 60 data points

### Writing Data (Temperature Setpoint)
1. Enter a temperature value in the Temperature card
2. Click **Apply**
3. The dashboard sends the value to ThingSpeak
4. Your TEC circuit reads this setpoint from ThingSpeak
5. The circuit adjusts temperature in a closed-loop feedback system

## 📊 Data Flow

```
Dashboard → ThingSpeak (Setpoint) → Your Circuit → ThingSpeak (Sensor Data) → Dashboard Charts
```

### For Your TEC Circuit:
Your circuit should:
1. **Read** the setpoint from ThingSpeak Field 5 (or whichever field you configured)
2. **Compare** it with the current temperature
3. **Adjust** the TEC to reach the setpoint
4. **Write** the current temperature back to ThingSpeak Field 4

## 🔧 ThingSpeak API Limits

- **Free accounts**: 1 update every 15 seconds
- **Licensed accounts**: Up to 1 update per second

The dashboard respects these limits and won't spam the API.

## 🐛 Troubleshooting

### Charts not showing?
- Check if your Channel ID is correct
- Make sure your channel is public (or add Read API Key if private)
- Verify field numbers match your data

### Setpoint not sending?
- Verify your Write API Key is correct
- Check browser console for errors (F12)
- Ensure you're not exceeding ThingSpeak's rate limit (15 seconds between updates)
- Check if the field number is correct (`field5`, not `5`)

### Success/Error Messages
- ✓ **"Sent to ThingSpeak"** = Success! Value was written
- ✗ **"Failed to send"** = Check API key and field number

## 📝 Example Configuration

Here's an example with actual values:

```typescript
export const THINGSPEAK_CONFIG = {
  CHANNEL_ID: '2758621',
  WRITE_API_KEY: 'ABCDEFGH12345678',
  
  FIELDS: {
    TEMPERATURE: '1',
    HUMIDITY: '2',
    LIGHT_LEVEL: '3',
    RSSI: '4',
  },
  
  SETPOINT_FIELD: 'field5',
};
```

## 🎨 Chart Customization

Charts automatically adapt to your light/dark theme. The `ThingSpeakChart` component handles:
- Background colors
- Text colors
- Auto-refresh every 15 seconds
- Last 60 data points
- Line chart type

## 🔐 Security Note

⚠️ **Never commit your Write API Key to public repositories!**

For production, consider:
- Using environment variables
- Creating a backend proxy
- Using ThingSpeak's device API keys

## 📚 Additional Resources

- [ThingSpeak Documentation](https://www.mathworks.com/help/thingspeak/)
- [ThingSpeak API Reference](https://www.mathworks.com/help/thingspeak/rest-api.html)
- [Channel Settings Guide](https://www.mathworks.com/help/thingspeak/channel-settings.html)
