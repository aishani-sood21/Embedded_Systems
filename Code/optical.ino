#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "DFRobot_AS7341.h"

// ==== WiFi Config ====
const char* ssid = "Abc";
const char* password = "jzoq7515";

// ==== Backend Server IP ====
String server = "http://10.36.175.240:5000/";

// ==== AS7341 Config ====
#define SDA_PIN 21
#define SCL_PIN 22
DFRobot_AS7341 as7341;

#define UV_PIN 34   // use ADC pin 32–39 ONLY

// ==== Notes ====
// - DHT code removed because DHT isn't working on this device for now.
// - Temperature will be provided by another ESP32. This device will NOT send temperature/humidity.
// - Payload JSON updated to the "latest" structured format expected by the UI/backend.
// - We keep a "temp_present" flag set to false so the backend/UI knows temperature comes from another device.
// - Do NOT remove comments in future edits (per request).

void setup() {
  Serial.begin(115200);

  // Start WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected, IP: " + WiFi.localIP().toString());

  // Start AS7341
  Wire.begin(SDA_PIN, SCL_PIN);
  as7341.begin(); 
  as7341.setAtime(100);   // Integration time
  as7341.setAstep(999);   // Step
  Serial.println("✅ AS7341 started");

  // Seed random for dummy light (if used)
  randomSeed(analogRead(35));
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // ===== Placeholders: this board will NOT send temp/humidity =====
    // temp and humidity removed completely as requested.
    // The other ESP32 will send the temperature reading separately.

    // Dummy light value (until real LDR connected)
    int light = random(200, 800);

    // === Read AS7341 Spectral Data ===
    as7341.startMeasure(as7341.eF1F4ClearNIR);
    DFRobot_AS7341::sModeOneData_t data1 = as7341.readSpectralDataOne();

    as7341.startMeasure(as7341.eF5F8ClearNIR);
    DFRobot_AS7341::sModeTwoData_t data2 = as7341.readSpectralDataTwo();

    // === Read UV sensor ===
    int uv_raw = analogRead(UV_PIN);
    float uv_voltage = uv_raw * (3.3f / 4095.0f);
    float uv_index = uv_voltage * 10.0f;  // approximate UV Index

    Serial.printf("UV raw=%d  V=%.3f  UVindex≈%.2f\n",
                  uv_raw, uv_voltage, uv_index);

    // === Build JSON payload (latest UI format) ===
    // New structured JSON:
    // {
    //   "device_id": "<mac>",
    //   "timestamp": 1234567890,
    //   "sensors": {
    //     "light": 512,
    //     "uv": { "raw": 123, "voltage": 0.123, "index": 1.23 },
    //     "spectral": [ADF1,ADF2,...,ADNIR],
    //     "temp_present": false
    //   }
    // }

    String deviceId = WiFi.macAddress(); // unique device identifier
    unsigned long ts = millis() / 1000;  // seconds since boot (no RTC)

    // Build the spectral array (ADF1-ADF8, ADCLEAR, ADNIR)
    String spectralArray = "";
    spectralArray += String(data1.ADF1) + ",";
    spectralArray += String(data1.ADF2) + ",";
    spectralArray += String(data1.ADF3) + ",";
    spectralArray += String(data1.ADF4) + ",";
    spectralArray += String(data2.ADF5) + ",";
    spectralArray += String(data2.ADF6) + ",";
    spectralArray += String(data2.ADF7) + ",";
    spectralArray += String(data2.ADF8) + ",";
    spectralArray += String(data2.ADCLEAR) + ",";
    spectralArray += String(data2.ADNIR);

    String payload = "{";
    payload += "\"device_id\":\"" + deviceId + "\",";
    payload += "\"timestamp\":" + String(ts) + ",";
    payload += "\"sensors\":{";
    payload += "\"light\":" + String(light) + ",";

    payload += "\"uv\":{";
    payload += "\"raw\":" + String(uv_raw) + ",";
    payload += "\"voltage\":" + String(uv_voltage, 3) + ",";
    payload += "\"index\":" + String(uv_index, 2);
    payload += "},";

    payload += "\"spectral\":[" + spectralArray + "],";

    // Explicit flag stating this unit does NOT supply temperature
    payload += "\"temp_present\":false";

    payload += "}}"; // close sensors & root

    // === POST telemetry ===
    String url = server + "/api/telemetry";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(payload);

    if (code > 0) {
      Serial.printf("✅ POST /api/telemetry [%d]\n", code);
      Serial.println("Sent: " + payload);
    } else {
      Serial.printf("❌ POST failed: %s\n", http.errorToString(code).c_str());
    }
    http.end();

    // === GET config from backend ===
    // Keep same /api/status GET to fetch configuration if backend uses it.
    url = server + "/api/status";
    http.begin(url);
    code = http.GET();
    if (code == 200) {
      String resp = http.getString();
      Serial.println("Config: " + resp);
    } else {
      Serial.printf("❌ GET /api/status failed: %d\n", code);
    }
    http.end();

  } else {
    Serial.println("WiFi disconnected, retrying...");
    WiFi.begin(ssid, password);
  }

  delay(2000); // send every 2 seconds
}

/*
  Legacy / example DHT code removed because DHT is not available on this device now.
  (Kept as a comment reference in earlier files; per request DHT logic and reads are removed.)
  When you are ready to add a temperature sensor on this board, you can either:
   - Re-enable a local temp sensor and set "temp_present" true and include "temp_c" in sensors,
   - Or continue to have the other ESP32 send temperature and leave this device's payload unchanged.
*/