#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

// === WiFi Credentials ===
const char* ssid = "Abc";
const char* password = "jzoq7515";

// === ThingSpeak Settings ===
const char* thingSpeakServer = "http://api.thingspeak.com/update";
String apiKey = "PXFVMQ63MWER609O";

// === SENSOR PIN ===
#define TMP1 34

// === TEC H-BRIDGE PINS ===
#define TEC1_RPWM 25  // Heating
#define TEC1_LPWM 26  // Cooling

// === Timing ===
unsigned long lastUpload = 0;
const unsigned long uploadInterval = 15000; // Upload every 15 seconds (ThingSpeak free limit)

// === PWM Configuration ===
const int PWM_FREQUENCY = 5000;
const int PWM_RESOLUTION = 8;

// === Temperature Offset ===
const float TEMP_OFFSET = 6.0;

// --- PID VARIABLES ---
float Kp = 0.0;
float Ki = 0.0;
float Kd = 0.0;
float setpoint = 30.0;
float currentTemp = 0.0;

float prevError = 0;
float integral = 0;
unsigned long prevTime = 0;
const unsigned long sampleTime = 1000;

const float OUTPUT_MIN = -255.0;
const float OUTPUT_MAX = 255.0;

// --- Overshoot and undershoot thresholds ---
const float MAX_OVERSHOOT = 5.0;   // degrees Celsius above setpoint allowed
const float MAX_UNDERSHOOT = 5.0;  // degrees Celsius below setpoint allowed

// --- Tuning adjustment parameters ---
const float ADJUST_KP_STEP = 0.1;
const float ADJUST_KD_STEP = 0.01;

// --- Variables for tuning phase ---
bool tuningPhase = false;
unsigned long tuningStartTime = 0;
const unsigned long tuningDuration = 10000; // tune for 10 seconds

float maxTempDuringTune = -1000;
float minTempDuringTune = 1000;

// --- TUNING STATE ---
enum TuningState {
  FIND_KP,           // Ramp up Kp until we reach setpoint
  DETECT_OSCILLATION, // Watch for oscillations to find Ku
  CALCULATE_PID,     // Apply Ziegler-Nichols
  PID_CONTROL        // Normal operation
};

TuningState state = FIND_KP;

// --- Kp RAMPING ---
float Kp_test = 1.0;           // Start small
float Kp_increment = 2;      // Increase by 2 each step
unsigned long lastKpIncrease = 0;
const unsigned long KpIncreaseInterval = 5000; // Try every 5 seconds
float errorTolerance = 4;    // Within 0.5°C = reached setpoint

// --- OSCILLATION DETECTION ---
float peakValues[10];
unsigned long peakTimes[10];
int peakCount = 0;
float lastTemp = 0;
float lastSlope = 0;
float Ku = 0;  // Ultimate gain
float Pu = 0;  // Ultimate period

#define TEMP_SAMPLES 5
float tempHistory[TEMP_SAMPLES];
int tempIndex = 0;

void sendToThingSpeak(float temperature) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Create URL with temperature data
    String url = String(thingSpeakServer) + "?api_key=" + apiKey + "&field1=" + String(temperature, 2);
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      Serial.print("✅ Data sent to ThingSpeak! Response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("❌ Error sending data: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("⚠️ WiFi Disconnected!");
  }
}

void startTuningPhase() {
  tuningPhase = true;
  tuningStartTime = millis();
  maxTempDuringTune = -1000;
  minTempDuringTune = 1000;
  Serial.println("🔧 Starting PID tuning phase...");
}

void tuningPhaseCheck(float temp) {
  if (!tuningPhase) return;

  // Record peak temperatures observed during tuning window
  if (temp > maxTempDuringTune) maxTempDuringTune = temp;
  if (temp < minTempDuringTune) minTempDuringTune = temp;

  if (millis() - tuningStartTime > tuningDuration) {
    tuningPhase = false;
    Serial.println("🔧 PID tuning phase complete.");
    Serial.print("Max temp: "); Serial.println(maxTempDuringTune);
    Serial.print("Min temp: "); Serial.println(minTempDuringTune);

    // Check if overshoot too high
    if (maxTempDuringTune > setpoint + MAX_OVERSHOOT) {
      Serial.println("⚠️ Overshoot too high, reducing Kp and increasing Kd.");
      Kp -= ADJUST_KP_STEP;
      if (Kp < 0) Kp = 0;
      Kd += ADJUST_KD_STEP;
    }
    // Check if undershoot too low
    if (minTempDuringTune < setpoint - MAX_UNDERSHOOT) {
      Serial.println("⚠️ Undershoot too low, increasing Kp.");
      Kp += ADJUST_KP_STEP;
          }

    // Print new PID values
    Serial.print("New Kp: "); Serial.println(Kp, 3);
    Serial.print("New Ki: "); Serial.println(Ki, 3);
    Serial.print("New Kd: "); Serial.println(Kd, 3);

    // Reset integral and prevError after re-tuning
    integral = 0;
    prevError = 0;
  }
}

// --- HELPER FUNCTIONS ---
float readTemperature() {
  float t1 = analogRead(TMP1);
  float v1 = (t1 / 4095.0) * 3.3;
  float temp1 = (v1 - 0.5) * 100.0;
  float measured = -0.0104 * (temp1 * temp1) + 1.7907 * temp1 + 2.6407;
  return measured;
}

float getSmoothedTemp() {
  tempHistory[tempIndex] = readTemperature();
  tempIndex = (tempIndex + 1) % TEMP_SAMPLES;
  
  float sum = 0;
  for (int i = 0; i < TEMP_SAMPLES; i++) sum += tempHistory[i];
  return sum / TEMP_SAMPLES;
}
int flag=0;
void applyToTEC(float output) {
  int pwm = abs(output);  // Take absolute value first
  pwm = constrain(pwm, 0, 255);  // Then constrain the positive value

  Serial.println(pwm);
  
  digitalWrite(2, HIGH);
  
  if (output < 0) {
    // Cool
    if(flag==1) delay(100);
    flag=0;
    ledcWrite(TEC1_RPWM, pwm);
    ledcWrite(TEC1_LPWM, 0);
  } else {
    // Heat
    if(flag==0) delay(100);
    flag=1;
    ledcWrite(TEC1_RPWM, 0);
    ledcWrite(TEC1_LPWM, pwm);
  }
  
  digitalWrite(2, LOW);
}
void detectPeak() {
  float slope = currentTemp - lastTemp;
  
  // Detect sign change in slope (peak or valley)
  if ((lastSlope > 0 && slope < 0) || (lastSlope < 0 && slope > 0)) {
    if (peakCount < 10) {
      peakValues[peakCount] = currentTemp;
      peakTimes[peakCount] = millis();
      peakCount++;
      
      Serial.print("🔶 Peak #"); Serial.print(peakCount);
      Serial.print(" at "); Serial.print(currentTemp);
      Serial.println("°C");
    }
  }
  
  lastTemp = currentTemp;
  lastSlope = slope;
}

void calculatePIDFromOscillation() {
  if (peakCount < 4) {
    Serial.println("⚠️ Not enough peaks, using Ku directly");
    Ku = Kp_test;
    Pu = 10.0; // Guess
  } else {
    // Calculate average period between peaks
    float totalPeriod = 0;
    for (int i = 1; i < peakCount; i++) {
      totalPeriod += (peakTimes[i] - peakTimes[i-1]);
    }
    Pu = (totalPeriod / (peakCount - 1)) / 1000.0; // Convert to seconds
    Ku = Kp_test;
  }
  
  Serial.println("\n=== OSCILLATION DETECTED ===");
  Serial.print("Ultimate Gain (Ku): "); Serial.println(Ku);
  Serial.print("Ultimate Period (Pu): "); Serial.print(Pu); Serial.println(" seconds");
  
  // Ziegler-Nichols PID tuning
  Kp = 0.6 * Ku;
  Ki = 1.2 * Ku / Pu;
  Kd = 0.075 * Ku * Pu;
  
  Serial.println("\n=== CALCULATED PID VALUES ===");
  Serial.print("Kp: "); Serial.println(Kp, 3);
  Serial.print("Ki: "); Serial.println(Ki, 3);
  Serial.print("Kd: "); Serial.println(Kd, 3);
  Serial.println("==============================\n");
  
  integral = 0;
  prevError = 0;
  prevTime = millis();
  
  state = PID_CONTROL;
}

float computePID(float setpoint, float current) {
  unsigned long now = millis();
  float dt = (now - prevTime) / 1000.0;
  
  if (dt < (sampleTime / 1000.0)) return 0;

  float error = setpoint - current;
  
  float P = Kp * error;
  
  integral += error * dt;
  float integralContribution = Ki * integral;
  if (integralContribution > OUTPUT_MAX) integral = OUTPUT_MAX / Ki;
  if (integralContribution < OUTPUT_MIN) integral = OUTPUT_MIN / Ki;
  float I = Ki * integral;
  
  float derivative = (error - prevError) / dt;
  float D = Kd * derivative;

  float output = P + I + D;
  
  if (output > OUTPUT_MAX) output = OUTPUT_MAX;
  if (output < OUTPUT_MIN) output = OUTPUT_MIN;

  prevError = error;
  prevTime = now;

  return output;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(2, OUTPUT);
  Serial.println("\n==============================");
  Serial.println("TEC PID - Kp Ramp Auto-Tune");
  Serial.println("==============================");

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
  
  delay(100);
  for (int i = 0; i < TEMP_SAMPLES; i++) {
    tempHistory[i] = readTemperature();
    delay(50);
  }

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  lastUpload = millis();

  ledcAttach(TEC1_RPWM, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcAttach(TEC1_LPWM, PWM_FREQUENCY, PWM_RESOLUTION);
  
  ledcWrite(TEC1_RPWM, 0);
  ledcWrite(TEC1_LPWM, 0);

  prevTime = millis();
  lastKpIncrease = millis();
  
  float initialTemp = getSmoothedTemp();
  lastTemp = initialTemp;
  
  Serial.print("Initial Temperature: "); Serial.print(initialTemp); Serial.println("°C");
  Serial.print("Target Setpoint: "); Serial.print(setpoint); Serial.println("°C");
  Serial.println("\n🔍 TUNING PROCESS:");
  Serial.println("1. FIND_KP - Ramp Kp until we reach setpoint");
  Serial.println("2. DETECT_OSCILLATION - Find Ku from oscillations");
  Serial.println("3. CALCULATE_PID - Apply Ziegler-Nichols");
  Serial.println("4. PID_CONTROL - Normal operation");
  Serial.println("\nCommands: 'set25' | 'skip' | 'kp10' | 'reset'\n");
}

void loop() {
  // int cuurentTemp=0;
  currentTemp = getSmoothedTemp();
  float error = setpoint - currentTemp;

  // Send to ThingSpeak every uploadInterval
  if (millis() - lastUpload >= uploadInterval) {
    sendToThingSpeak(currentTemp);
    lastUpload = millis();
  }

  // Handle serial commands
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    if (input.startsWith("set")) {
      setpoint = input.substring(3).toFloat();
      Serial.print("New Setpoint: "); Serial.println(setpoint);
      state = FIND_KP;
      Kp_test = 1.0;
      peakCount = 0;
    } else if (input == "skip") {
      Serial.println("⏭️ Skipping to PID_CONTROL");
      if (Kp == 0) { Kp = 10; Ki = 0.5; Kd = 2; }
      state = PID_CONTROL;
    } else if (input.startsWith("kp")) {
      Kp = input.substring(2).toFloat();
      Serial.print("Manual Kp: "); Serial.println(Kp);
      state = PID_CONTROL;
    } else if (input == "reset") {
      integral = 0;
      prevError = 0;
      state = FIND_KP;
      Kp_test = 1.0;
      peakCount = 0;
      Serial.println("🔄 Reset to FIND_KP");
    }
  }

  float output = 0;
  
  switch(state) {
    case FIND_KP:
      // Use P-only control with current Kp_test
      output = Kp_test * error;
      // output = constrain(output, 0, 255);
      if(abs(error)<errorTolerance){
        ledcWrite(TEC1_RPWM, 0);
        ledcWrite(TEC1_LPWM, 0);
      }
      else
      applyToTEC(output);
      
      // Check if we've reached setpoint
      if (abs(error) < errorTolerance) {
        Serial.print("✅ Reached setpoint with Kp = "); Serial.println(Kp_test);
        Serial.println("Now monitoring for oscillations...");
        state = DETECT_OSCILLATION;
        peakCount = 0;
        lastTemp = currentTemp;
        break;
      }
      
      // Increase Kp if needed
      if (millis() - lastKpIncrease > KpIncreaseInterval) {
        Kp_test += Kp_increment;
        Serial.print("📈 Increasing Kp to: "); Serial.println(Kp_test);
        lastKpIncrease = millis();
      }
      break;
      
    case DETECT_OSCILLATION:
      // Keep using P-only control to induce oscillations
      output = Kp_test * error;
      // output = constrain(output, -255, 255);
      if(abs(error)<errorTolerance){
        ledcWrite(TEC1_RPWM, 0);
        ledcWrite(TEC1_LPWM, 0);
      }
      else
      applyToTEC(output);
      
      detectPeak();
      
      // Once we have 4 peaks, calculate PID
      if (peakCount >= 4) {
        state = CALCULATE_PID;
      }
      break;
      
    case CALCULATE_PID:
      calculatePIDFromOscillation();
      startTuningPhase();

      tuningPhaseCheck(currentTemp);
      break;
      
    case PID_CONTROL:
      output = computePID(setpoint, currentTemp);
      if(abs(error)<errorTolerance){
        ledcWrite(TEC1_RPWM, 0);
        ledcWrite(TEC1_LPWM, 0);
      }
      else
      applyToTEC(output);
      break;
  }

  // CSV output
  Serial.print("Time:"); Serial.print(millis()/1000);
  Serial.print(",Temp:"); Serial.print(currentTemp, 2);
  Serial.print(",Setpoint:"); Serial.print(setpoint);
  Serial.print(",Output:"); Serial.print(output, 1);
  Serial.print(",Error:"); Serial.print(error, 2);
  Serial.print(",State:");
  switch(state) {
    case FIND_KP: Serial.print("FIND_KP"); break;
    case DETECT_OSCILLATION: Serial.print("DETECT_OSC"); break;
    case CALCULATE_PID: Serial.print("CALCULATING"); break;
    case PID_CONTROL: Serial.print("PID_CONTROL"); break;
  }
  Serial.print(",Kp:");
  if (state == FIND_KP || state == DETECT_OSCILLATION) {
    Serial.print(Kp_test, 2);  // Show test value during tuning
  } else {
    Serial.print(Kp, 2);       // Show final value during PID control
  }
  Serial.print(",Ki:"); Serial.print(Ki, 3);
  Serial.print(",Kd:"); Serial.println(Kd, 2);

  delay(sampleTime);
}