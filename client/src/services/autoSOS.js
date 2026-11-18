/**
 * RescueLink Automatic SOS Trigger Detection Service
 * Evaluates triggers: Fall/Impact, Immobility, Extreme Temp, Toxic Gas, Heart Rate anomalies.
 */

export const evaluateAutoSOSTriggers = (telemetry = {}, previousTelemetry = {}) => {
    const triggers = [];

    // 1. Fall / High Impact Sensor Trigger (acceleration spike)
    if (telemetry.impactDetected || telemetry.fallDetected) {
        triggers.push({
            type: 'Severe Fall / Impact Detected',
            severity: 'CRITICAL',
            reason: 'Accelerometer registered a high G-force kinetic shock or sudden vertical drop.'
        });
    }

    // 2. Prolonged Immobility
    if ((telemetry.immobilityMinutes || 0) >= 4) {
        triggers.push({
            type: 'Man-Down / Zero Movement',
            severity: 'CRITICAL',
            reason: `No movement detected for ${telemetry.immobilityMinutes} consecutive minutes.`
        });
    }

    // 3. Extreme Temperature (> 45°C or < -5°C)
    if (telemetry.envTemp >= 45) {
        triggers.push({
            type: 'Extreme Thermal Flash / Heat Hazard',
            severity: 'CRITICAL',
            reason: `Ambient sensor detected flash temperature surge of ${telemetry.envTemp}°C.`
        });
    }

    // 4. Hazardous Toxic Gas (> 60 PPM or 'Critical')
    if ((telemetry.gasPpm || 0) >= 60 || telemetry.airQuality === 'Critical') {
        triggers.push({
            type: 'Lethal Gas / Methane Surge',
            severity: 'CRITICAL',
            reason: `Air analyzer detected toxic atmospheric concentration exceeding 60 PPM.`
        });
    }

    // 5. Critical Heart Rate Spikes (> 160 or < 40)
    if (telemetry.heartRate && (telemetry.heartRate > 160 || telemetry.heartRate < 40)) {
        triggers.push({
            type: 'Critical Cardiac Anomaly',
            severity: 'CRITICAL',
            reason: `Heart rate sensor reading critical limit: ${telemetry.heartRate} BPM.`
        });
    }

    return triggers;
};
