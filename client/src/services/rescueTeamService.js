/**
 * RescueLink Rescue Team Operations Service
 * Manages responder squads and emergency incident states:
 * NEW -> ACKNOWLEDGED -> TEAM ASSIGNED -> EN ROUTE -> AT LOCATION -> WORKER LOCATED -> RESCUED -> CLOSED
 */

export const INITIAL_RESCUE_TEAMS = [
    {
        id: 'TEAM-ALPHA',
        name: 'Alpha Tactical Medics',
        status: 'STANDBY', // STANDBY, DISPATCHED, AT_SCENE, RETURNING
        lat: 51.514,
        lng: -0.088,
        members: ['Capt. Miller (Paramedic)', 'Sgt. Vance (Extraction)'],
        equipment: ['Breathing Units (SCBA)', 'Stretcher', 'Hydraulic Spreader'],
        assignedWorkerId: null
    },
    {
        id: 'TEAM-BRAVO',
        name: 'Bravo Hazmat & Search Unit',
        status: 'STANDBY',
        lat: 51.501,
        lng: -0.096,
        members: ['Lt. Hayes (Hazmat Specialist)', 'Cpl. Diaz (K9 Handler)'],
        equipment: ['Gas Detection Rig', 'Thermal Imager', 'Rope Rescue Kit'],
        assignedWorkerId: null
    }
];

export const INCIDENT_STAGES = [
    { key: 'NEW', label: 'New Alert', color: 'var(--radar-red)' },
    { key: 'ACKNOWLEDGED', label: 'Acknowledged', color: 'var(--phosphor-amber)' },
    { key: 'TEAM_ASSIGNED', label: 'Team Assigned', color: 'var(--brass)' },
    { key: 'EN_ROUTE', label: 'En Route', color: '#2196f3' },
    { key: 'AT_LOCATION', label: 'At Location', color: '#9c27b0' },
    { key: 'WORKER_LOCATED', label: 'Worker Located', color: '#00bcd4' },
    { key: 'RESCUED', label: 'Rescued / Stabilized', color: 'var(--phosphor-green)' },
    { key: 'CLOSED', label: 'Incident Closed', color: 'var(--muted)' }
];
