/**
 * RescueLink Geofencing & Zone Perimeter Service
 */

export const INITIAL_GEOFENCES = [
    {
        id: 'GEO-SAFE-01',
        name: 'Surface Muster Point Alpha (Safe Exit)',
        type: 'SAFE',
        lat: 51.516,
        lng: -0.075,
        radius: 120,
        color: '#6BCB77',
        description: 'Primary above-ground evacuation assembly area with medical tent.'
    },
    {
        id: 'GEO-RESTRICTED-02',
        name: 'High-Voltage Transformer Substation',
        type: 'RESTRICTED',
        lat: 51.502,
        lng: -0.108,
        radius: 110,
        color: '#FF5C5C',
        description: 'Blast-shielded high voltage area. Entry strictly forbidden without permit.'
    },
    {
        id: 'GEO-RISK-03',
        name: 'Deep Tunnel C Sub-shaft',
        type: 'HIGH_RISK',
        lat: 51.518,
        lng: -0.115,
        radius: 140,
        color: '#FFB454',
        description: 'Unreinforced excavation tunnel prone to micro-tremors and low airflow.'
    }
];

export const checkWorkerGeofence = (lat, lng, geofences = INITIAL_GEOFENCES) => {
    for (const geo of geofences) {
        // Haversine / Euclidean distance approximation for worksite scale
        const dLat = (lat - geo.lat) * 111000;
        const dLng = (lng - geo.lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);

        if (distance <= geo.radius) {
            return {
                inside: true,
                geofence: geo,
                distance: Math.round(distance)
            };
        }
    }
    return { inside: false, geofence: null, distance: null };
};
