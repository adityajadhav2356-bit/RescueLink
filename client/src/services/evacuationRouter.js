/**
 * RescueLink Safe Evacuation Routing Service
 * Calculates optimal obstacle-avoiding paths from worker to nearest safe exit/muster point.
 */

export const SAFE_EXITS = [
    { id: 'EXIT-1', name: 'Primary Surface Shaft Gate Alpha', lat: 51.516, lng: -0.075, status: 'OPEN' },
    { id: 'EXIT-2', name: 'Emergency Escape Portal Beta (South)', lat: 51.498, lng: -0.092, status: 'OPEN' }
];

export const calculateEvacuationRoute = (workerPos = [51.505, -0.09], activeHazards = [], safeExits = SAFE_EXITS) => {
    if (!workerPos || !workerPos[0]) return null;

    // 1. Identify closest unobstructed safe exit
    let closestExit = safeExits[0];
    let minDistance = Infinity;

    safeExits.forEach(exit => {
        const dLat = (workerPos[0] - exit.lat) * 111000;
        const dLng = (workerPos[1] - exit.lng) * 111000 * Math.cos((workerPos[0] * Math.PI) / 180);
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDistance) {
            minDistance = dist;
            closestExit = exit;
        }
    });

    const [wLat, wLng] = workerPos;
    const [eLat, eLng] = [closestExit.lat, closestExit.lng];

    // Check if direct vector intersects any critical hazards
    let waypoints = [[wLat, wLng]];
    let isRerouted = false;

    activeHazards.forEach(hazard => {
        if (hazard.severity === 'CRITICAL' || hazard.severity === 'HIGH') {
            const hDistToMid = Math.sqrt(
                Math.pow(((wLat + eLat) / 2 - hazard.lat) * 111000, 2) +
                Math.pow(((wLng + eLng) / 2 - hazard.lng) * 111000, 2)
            );

            // If hazard is blocking the path corridor, insert detour waypoints
            if (hDistToMid < (hazard.radius || 100) + 50) {
                isRerouted = true;
                // Add lateral offset waypoint away from hazard center
                const offsetLat = hazard.lat + (hazard.lat > wLat ? -0.003 : 0.003);
                const offsetLng = hazard.lng + (hazard.lng > wLng ? 0.004 : -0.004);
                waypoints.push([offsetLat, offsetLng]);
            }
        }
    });

    waypoints.push([eLat, eLng]);

    // Calculate total path distance
    let totalDist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];
        const dLat = (p1[0] - p2[0]) * 111000;
        const dLng = (p1[1] - p2[1]) * 111000 * Math.cos((p1[0] * Math.PI) / 180);
        totalDist += Math.sqrt(dLat * dLat + dLng * dLng);
    }

    // Walking speed in mine tunnels: ~1.1 m/s (4 km/h)
    const travelTimeMinutes = Math.max(1, Math.round(totalDist / 66));

    return {
        waypoints,
        distanceMeters: Math.round(totalDist),
        estimatedMinutes: travelTimeMinutes,
        destinationName: closestExit.name,
        isRerouted,
        status: isRerouted ? 'REROUTED_AROUND_HAZARD' : 'DIRECT_PATH_CLEAR'
    };
};
