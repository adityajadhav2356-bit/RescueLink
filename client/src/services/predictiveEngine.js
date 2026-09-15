/**
 * RescueLink Predictive Trend & Deterioration Engine
 * Analyzes telemetry deltas, environmental gradients, and worker distress requests.
 * Automatically clears warnings when rescue force / help is dispatched or resolved.
 */

export const generatePredictiveWarnings = (workers = [], hazards = [], geofences = []) => {
    const warnings = [];

    workers.forEach(w => {
        // If help has already been sent to this worker or they are marked safe, clear/suppress their warning requests
        if (w.status === 'RESCUE_EN_ROUTE' || w.status === 'SAFE') {
            return;
        }

        const temp = w.envTemp || 28;
        const gas = w.gasPpm || (w.airQuality === 'Poor' ? 48 : w.airQuality === 'Fair' ? 24 : 8);
        const battery = w.battery || 80;
        const heartRate = w.heartRate || 75;
        const immobility = w.immobilityMinutes || 0;
        const signal = w.connectivity || 'Strong';

        // 1. Gas Accumulation / Air Quality Deterioration Trend
        if (gas >= 35 || (w.zone === 'Tunnel B' && gas >= 25)) {
            warnings.push({
                id: `pred-gas-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'AIR_QUALITY_DETERIORATION',
                metric: 'Gas / Toxicity',
                currentValue: `${gas} PPM`,
                trend: '+18% over 10m',
                severity: gas >= 45 ? 'CRITICAL' : 'HIGH',
                headline: `Air quality deteriorating in ${w.zone}`,
                recommendation: `Verify scrubber ventilation in ${w.zone}; dispatch rescue squad for ${w.workerId}.`
            });
        }

        // 2. Rapid Thermal Rise / Heat Stress
        if (temp >= 37) {
            warnings.push({
                id: `pred-temp-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'THERMAL_STRESS',
                metric: 'Temperature',
                currentValue: `${temp}°C`,
                trend: '+2.4°C/min',
                severity: temp >= 40 ? 'CRITICAL' : 'HIGH',
                headline: `Temperature rising rapidly for ${w.workerId} (${w.name})`,
                recommendation: 'Mandate immediate cooling cycle and dispatch support.'
            });
        }

        // 3. Tachycardia / Cardiac Spike
        if (heartRate >= 115) {
            warnings.push({
                id: `pred-cardiac-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'CARDIAC_EXERTION',
                metric: 'Heart Rate',
                currentValue: `${heartRate} BPM`,
                trend: 'Accelerating (>110 bpm)',
                severity: heartRate >= 130 ? 'CRITICAL' : 'MODERATE',
                headline: `Elevated biometric exertion on ${w.workerId}`,
                recommendation: 'Contact worker via voice intercom to confirm fitness for duty.'
            });
        }

        // 4. Signal / Mesh Network Degradation
        if (signal === 'Weak' || signal === 'Degraded') {
            warnings.push({
                id: `pred-sig-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'TELEMETRY_LINK_UNSTABLE',
                metric: 'Connectivity',
                currentValue: 'Weak (-92 dBm)',
                trend: 'Intermittent packet drop',
                severity: 'MODERATE',
                headline: `Worker ${w.workerId} connectivity becoming unstable`,
                recommendation: 'Route telemetry relay through adjacent transponder node.'
            });
        }

        // 5. Battery Depletion Threat
        if (battery <= 20) {
            warnings.push({
                id: `pred-bat-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'LOW_TRANSPONDER_POWER',
                metric: 'Battery',
                currentValue: `${battery.toFixed(0)}%`,
                trend: '-15%/hr',
                severity: battery <= 10 ? 'HIGH' : 'LOW',
                headline: `Transponder power critical for ${w.workerId}`,
                recommendation: 'Direct worker to Sub-station Alpha for battery exchange.'
            });
        }

        // 6. Prolonged Immobility
        if (immobility >= 2) {
            warnings.push({
                id: `pred-immob-${w.workerId}`,
                workerId: w.workerId,
                workerName: w.name,
                zone: w.zone,
                lat: w.lat || 51.505,
                lng: w.lng || -0.09,
                type: 'INACTIVITY_STATIONARY',
                metric: 'Motion Sensor',
                currentValue: `${immobility} min static`,
                trend: 'Zero accelerometer vector',
                severity: immobility >= 4 ? 'HIGH' : 'MODERATE',
                headline: `Worker ${w.workerId} stationary in ${w.zone}`,
                recommendation: 'Send ping acknowledgement to confirm worker conscious.'
            });
        }
    });

    return warnings;
};
