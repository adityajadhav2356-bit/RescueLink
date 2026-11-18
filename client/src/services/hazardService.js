/**
 * RescueLink Unified Hazard Detection Service
 * Monitors gas, smoke, fire, temperature spikes, and atmospheric hazards.
 */

export const INITIAL_HAZARDS = [
    {
        id: 'HAZ-101',
        type: 'Methane Gas Leak',
        category: 'Gas',
        severity: 'CRITICAL',
        zone: 'Sector 7G (Lower Shaft)',
        lat: 51.503,
        lng: -0.095,
        radius: 120,
        reading: '64 PPM',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        isSimulated: false
    },
    {
        id: 'HAZ-102',
        type: 'Thermal Heat Surge',
        category: 'Temperature',
        severity: 'HIGH',
        zone: 'Tunnel B (Ventilation Block)',
        lat: 51.512,
        lng: -0.098,
        radius: 90,
        reading: '44.5°C',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
        isSimulated: false
    },
    {
        id: 'HAZ-103',
        type: 'Elevated Carbon Monoxide',
        category: 'Air Quality',
        severity: 'CAUTION',
        zone: 'Deep Shaft 3',
        lat: 51.508,
        lng: -0.082,
        radius: 60,
        reading: '32 PPM',
        timestamp: new Date(Date.now() - 80 * 60000).toISOString(),
        isSimulated: false
    }
];

export const createSimulatedHazard = (type, severity, zone = 'Active Worksite Zone') => {
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;

    return {
        id: `SIM-HAZ-${Math.floor(100 + Math.random() * 900)}`,
        type,
        category: type.includes('Gas') ? 'Gas' : type.includes('Fire') ? 'Fire' : 'Environmental',
        severity,
        zone,
        lat: 51.505 + latOffset,
        lng: -0.09 + lngOffset,
        radius: 100,
        reading: severity === 'CRITICAL' ? 'ALERT LEVEL MAXIMUM' : 'Elevated threshold',
        timestamp: new Date().toISOString(),
        isSimulated: true
    };
};
