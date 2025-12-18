# Faraday Cage with Active Temperature Control and Light/UV Monitoring

## Overview

This project presents a precision-engineered **electromagnetic isolation chamber** designed for experiments requiring complete freedom from electromagnetic interference (EMI), radio-frequency (RF) noise, and optical disturbances. The system combines Faraday cage principles with active thermal management and environmental monitoring to create a scientifically reliable controlled experimentation environment.

## Key Features

- **Complete EM/RF Shielding**: Blocks external electromagnetic and radio-frequency waves while preventing internal radiation escape
- **Active Temperature Control**: TEC-based PID control system maintains user-defined temperatures with high precision
- **Optical Isolation**: UV and visible light blocking with integrated monitoring to ensure zero optical interference
- **Real-time Monitoring**: Web-based dashboard for temperature, humidity, and light intensity tracking
- **Experimentally Validated**: Uses Ziegler-Nichols tuning for robust performance in real-world nonlinear conditions

## Applications

This chamber is ideal for:
- Precision measurement experiments
- Sensor calibration procedures
- Noise-sensitive electronics testing
- Optical experiments requiring complete darkness
- RF-sensitive component characterization

## System Architecture

### Mechanical Design

- **Enclosure**: 20×20×20 cm aluminum box (inherent Faraday cage properties)
- **Thermal Insulation**: PIR foam lining for temperature stability
- **RF Enhancement**: Copper sheet lining for additional electromagnetic shielding
- **Cable Management**: Single wire port with gasket seal to prevent RF leakage
- **TEC Configuration**: Four TEC1-12706 modules mounted on vertical sides with external heatsinks

### Electronics Components

- **Microcontroller**: ESP32 (Wi-Fi enabled for web interface)
- **Power Control**: BTS7960 H-bridge module
- **Cooling/Heating**: 4× TEC1-12706 Peltier modules
- **Temperature Sensing**: TMP36 sensor with polynomial calibration
- **Light Detection**: BH1750/LDR for visible light + dedicated UV sensor module
- **Signal Conditioning**: RC low-pass filter for PWM smoothing
- **Power Supply**: 12V 10A regulated supply
- **EMI Protection**: Ferrite beads on all wire connections

### Control System

**PID Temperature Control**
- Ziegler-Nichols auto-tuning for optimal Kp, Ki, Kd values
- Adaptive control for nonlinear TEC thermal response
- Safe polarity switching to prevent TEC damage
- RC filtering to eliminate PWM current spikes

**Sensor Calibration**
- TMP36 polynomial calibration: `T = -0.0104x² + 1.7907x + 2.6407`
- Accurate temperature readings below 40°C
- Real-time light and UV intensity monitoring

**Web Interface**
- Live temperature, humidity, and light level display
- Setpoint adjustment capability
- Historical data visualization via ThingSpeak integration

## Project Evolution

### Evaluation 1: Theoretical Foundation
- Studied Faraday cage principles and EM field behavior
- Analyzed surface charge redistribution and magnetic shielding
- Identified cable routing challenges for maintaining shielding integrity

### Evaluation 2: Mathematical Modeling
- Developed TEC thermal models through step-response experiments
- Performed PID auto-tuning using MATLAB/Simulink
- **Key Discovery**: Mathematical models failed in practice due to:
  - TEC system nonlinearity
  - Multiple parallel TECs invalidating single-TEC models
  - Dynamic heat capacity changes
  - PWM-induced current spikes and waveform distortion
  - Sensor nonlinearities

### Evaluation 3: Practical Implementation
- **Pivoted to Ziegler-Nichols tuning** - experiment-driven approach ideal for nonlinear systems
- Characterized H-bridge behavior (PWM vs. current relationship)
- Validated TEC performance with water-cooled heatsinks
- Implemented sensor calibration and EMI protection measures
- Achieved stable, experimentally validated temperature control

## Technical Challenges Solved

1. **TEC Overheating**: Water-cooled heatsinks + thermal limit protection
2. **PWM Current Spikes**: RC low-pass filtering before H-bridge
3. **Sensor Non-linearity**: Polynomial regression calibration
4. **EM Leakage**: Copper lining + ferrite beads + single gasket-sealed port
5. **Control Instability**: ZN tuning replacing failed mathematical models
6. **Polarity Switching Stress**: Direction-only H-bridge control (no high-frequency switching)

## Repository Structure

```
├── Code/
│   ├── Dashboard/          # Web dashboard files
│   ├── optical.ino         # Optical sensor code
│   ├── pid.ino             # PID control implementation
│   └── README.md
├── Demos/
│   ├── *.jpeg              # Setup and system photos
│   ├── *.mp4               # Demonstration videos
│   └── README.md
├── Presentation/
│   ├── final-eval.pdf      # Final evaluation presentation
│   └── README.md
├── Report/
│   └── README.md
└── README.md               # This file
```

## Getting Started

### Hardware Requirements
- ESP32 development board
- 4× TEC1-12706 Peltier modules
- BTS7960 H-bridge motor driver
- TMP36 temperature sensor
- BH1750 light sensor + UV sensor module
- 20×20×20 cm aluminum enclosure
- PIR foam insulation
- Copper tape/sheet
- 12V 10A power supply
- Heatsinks and thermal paste
- Ferrite beads

### Software Setup

1. **Install Arduino IDE** with ESP32 board support
2. **Required Libraries**:
   - ESP32 WiFi libraries
   - PID control library
   - Sensor-specific libraries (TMP36, BH1750)
   - ThingSpeak API library

3. **Upload Code**:
   ```bash
   # Navigate to Code folder
   cd Code/
   
   # Open pid.ino or optical.ino in Arduino IDE
   # Configure WiFi credentials and ThingSpeak API keys
   # Upload to ESP32 board
   ```

4. **Web Dashboard**:
   - Deploy files from `Dashboard/` folder
   - Access ESP32's IP address after connection
   - Configure temperature setpoint
   - Monitor real-time sensor data

## Control Flow

1. Sensors polled every 1 second
2. PID algorithm computes control output
3. Error sign determines heating/cooling direction
4. PWM signal passes through RC filter
5. H-bridge switches TEC polarity when needed
6. Web UI updates via ESP32 WiFi connection
7. Data logged to ThingSpeak for historical analysis

## Performance Characteristics

- **Temperature Stability**: ±0.5°C at setpoint (after ZN tuning)
- **Response Time**: First-order thermal response with typical settling time of 5-10 minutes
- **EM Shielding**: >60dB attenuation (aluminum + copper lining)
- **Light Blocking**: Complete UV-IR isolation with sensor verification
- **Operating Range**: 15-40°C (calibrated range)

## Future Enhancements

- Multi-zone temperature control
- Automated experimental protocols
- Enhanced data logging with local storage
- Mobile app integration
- Additional sensors (CO₂, pressure)

## License

**Educational Use Only - All Rights Reserved**

This project and all associated materials (code, documentation, designs, and media) are provided for **educational and reference purposes only**. 

**Academic Integrity Notice:** If you are inspired by this work, you must develop your own unique implementation and provide proper citations. Direct copying violates academic integrity policies.

© All Rights Reserved. This project represents original research and development work.

## Acknowledgments

This project was developed through three comprehensive evaluation phases, incorporating extensive experimental characterization and validation. The transition from mathematical modeling to Ziegler-Nichols tuning represents a critical engineering insight into practical control system design.

---

**Note**: For detailed demonstration videos, see the `Demos/` folder. For complete technical details and experimental data, refer to the full documentation in the `Report/` and `Presentation/` folders.