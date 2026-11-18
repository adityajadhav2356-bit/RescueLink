/**
 * RescueLink AI Risk Prediction Engine
 * Modular rule-based & heuristic scoring architecture.
 * Pluggable for future ML/TensorFlow Lite model replacement.
 */

export const calculateWorkerRisk = (worker = {}, telemetry = {}, activeHazards = [], currentGeofence = null) => {
    let score = 0;
    const factors = [];
    let recommendations = [];

    const heartRate = telemetry.heartRate ?? worker.heartRate ?? 78;
    const temp = telemetry.envTemp ?? worker.envTemp ?? 28;
    const airQuality = telemetry.airQuality ?? worker.airQuality ?? 'Good';
    const battery = telemetry.battery ?? worker.battery ?? 85;
    const gasPpm = telemetry.gasPpm ?? (airQuality === 'Poor' ? 55 : airQuality === 'Fair' ? 25 : 8);
    const immobilityMinutes = telemetry.immobilityMinutes ?? 0;
    const isCriticalStatus = worker.status === 'CRITICAL';

    // 1. Heart Rate Evaluation (Normal: 60-100 bpm)
    if (heartRate > 135 || heartRate < 45) {
        score += 35;
        factors.push(`Extreme Heart Rate (${heartRate} BPM)`);
        recommendations.push("Immediate medical telemetry check & rest mandatory.");
    } else if (heartRate > 115 || heartRate < 55) {
        score += 18;
        factors.push(`Elevated Heart Rate (${heartRate} BPM)`);
        recommendations.push("Pace activity and monitor hydration.");
    }

    // 2. Core Environmental Temperature
    if (temp >= 42) {
        score += 30;
        factors.push(`Dangerous Thermal Exposure (${temp}°C)`);
        recommendations.push("Risk of heat stroke. Evacuate to cooled shelter.");
    } else if (temp >= 36) {
        score += 15;
        factors.push(`High Temperature (${temp}°C)`);
        recommendations.push("Increase ventilation and enforce hydration breaks.");
    } else if (temp <= 0) {
        score += 20;
        factors.push(`Freezing Sub-zero Conditions (${temp}°C)`);
    }

    // 3. Air Quality & Toxic Gas (PPM)
    if (gasPpm > 50 || airQuality === 'Critical' || airQuality === 'Poor') {
        score += 35;
        factors.push(`Hazardous Gas Concentration (${gasPpm} PPM / ${airQuality})`);
        recommendations.push("Activate breathing apparatus or initiate immediate zone egress.");
    } else if (gasPpm > 25 || airQuality === 'Fair') {
        score += 15;
        factors.push(`Moderate Air Toxicity (${gasPpm} PPM)`);
        recommendations.push("Check scrubber units and ventilation airflow.");
    }

    // 4. Worker Immobility / Man-Down Detection
    if (immobilityMinutes >= 5) {
        score += 40;
        factors.push(`Prolonged Immobility (${immobilityMinutes} mins no movement)`);
        recommendations.push("Potential man-down event. Dispatch immediate contact verification.");
    } else if (immobilityMinutes >= 2) {
        score += 15;
        factors.push(`Stationary Warning (${immobilityMinutes} mins inactivity)`);
    }

    // 5. Battery Telemetry Link
    if (battery < 15) {
        score += 15;
        factors.push(`Low Transponder Power (${battery.toFixed(0)}%)`);
        recommendations.push("Swap telemetry power pack at nearest charge beacon.");
    }

    // 6. Nearby Active Hazards Influence
    if (activeHazards && activeHazards.length > 0) {
        const nearbyCriticalHazard = activeHazards.find(h => h.severity === 'CRITICAL' || h.severity === 'HIGH');
        if (nearbyCriticalHazard) {
            score += 20;
            factors.push(`Proximity to ${nearbyCriticalHazard.type} Hazard`);
            recommendations.push(`Maintain safe perimeter from ${nearbyCriticalHazard.zone || 'hazard area'}.`);
        }
    }

    // 7. Restricted Geofence Influence
    if (currentGeofence && currentGeofence.type === 'RESTRICTED') {
        score += 30;
        factors.push(`Within Restricted Geofence: ${currentGeofence.name}`);
        recommendations.push("Unauthorized zone presence. Egress to designated sector.");
    }

    // Force high score if status is explicitly CRITICAL (e.g. SOS pressed)
    if (isCriticalStatus) {
        score = Math.max(score, 90);
        factors.unshift("Active Emergency SOS Signal Triggered");
        recommendations.unshift("IMMEDIATE RESCUE OPERATION REQUIRED.");
    }

    // Normalize score to 0-100
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine Risk Category
    let level = 'LOW';
    if (finalScore >= 80) level = 'CRITICAL';
    else if (finalScore >= 55) level = 'HIGH';
    else if (finalScore >= 30) level = 'MODERATE';

    if (factors.length === 0) {
        factors.push("All biological and environmental vitals within nominal ranges");
        recommendations.push("Continue scheduled shift operations.");
    }

    return {
        score: finalScore,
        level,
        factors,
        recommendation: recommendations[0] || "Maintain nominal monitoring.",
        allRecommendations: recommendations,
        timestamp: new Date().toISOString()
    };
};
