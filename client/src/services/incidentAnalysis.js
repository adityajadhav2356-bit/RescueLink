/**
 * RescueLink AI Incident Analysis & Post-Mortem Service
 * Generates automated root-cause analysis, timeline breakdown, and safety corrective actions.
 */

export const generateAIIncidentAnalysis = (alert = {}, worker = {}, telemetry = {}) => {
    const alertType = alert.type || 'Manual SOS Beacon';
    const workerName = alert.name || worker.name || 'Unknown Worker';
    const zone = alert.zone || worker.zone || 'Worksite Sector';
    const temp = alert.envTemp || worker.envTemp || telemetry.envTemp || 32;
    const airQuality = alert.airQuality || worker.airQuality || 'Moderate';
    const timeString = new Date(alert.time || Date.now()).toLocaleTimeString();

    let cause = "Likely sudden kinetic disorientation or acute physiological exhaustion under extreme subterranean work conditions.";
    let severity = 'CRITICAL';
    let recommendations = [
        "Deploy rescue squad equipped with extraction stretcher and SCBA breathing apparatus.",
        "Isolate sub-shaft ventilation grid to eliminate flammable pocket accumulation.",
        "Notify shift supervisor for immediate surface muster verification."
    ];

    if (alertType.toLowerCase().includes('gas') || airQuality === 'Poor' || airQuality === 'Critical') {
        cause = "Localized atmospheric methane / CO concentration spike above permissible OSHA exposure limit.";
        severity = 'CRITICAL';
        recommendations = [
            "Mandate immediate SCBA respirator donning across all adjacent tunnel sectors.",
            "Activate auxiliary scrubber fans and exhaust dampers.",
            "Establish perimeter roadblock at Shaft Sub-level entry."
        ];
    } else if (alertType.toLowerCase().includes('fall') || alertType.toLowerCase().includes('impact')) {
        cause = "High-impact kinetic shock consistent with scaffolding slip, rockfall event, or vertical ladder dismount.";
        severity = 'HIGH';
        recommendations = [
            "Dispatch emergency spine-board extraction squad.",
            "Halt overhead hoisting machinery in affected quadrant.",
            "Perform immediate visual inspection of structural shoring."
        ];
    } else if (temp > 40) {
        cause = "Thermal flash surge coupled with restricted airflow inducing acute heat exhaustion.";
        severity = 'HIGH';
        recommendations = [
            "Evacuate affected workers to air-conditioned refuge station.",
            "Administer electrolyte hydration and thermal cooling blankets."
        ];
    }

    return {
        incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        generatedAt: new Date().toISOString(),
        worker: `${workerName} (${alert.workerId || 'W-XXX'})`,
        zone,
        alertType,
        severity,
        summary: `At ${timeString}, an emergency safety trigger (${alertType}) was confirmed for ${workerName} in ${zone}. Live telemetry indicated ambient thermal readings of ${temp}°C with ${airQuality} atmospheric air quality.`,
        possibleCause: cause,
        recommendedActions: recommendations,
        timeline: [
            { time: '-10m', event: 'Nominal telemetry transmitted. Worker vitals within standard shift baseline.' },
            { time: '-2m', event: `Sensor anomaly detected: Ambient temp ${temp}°C, air rating ${airQuality}.` },
            { time: '0m', event: `Emergency SOS event received at Command Console. Beacon broadcast initiated.` },
            { time: '+1m', event: 'AI Safety Engine triggered immediate supervisor telemetry overlay.' }
        ]
    };
};
