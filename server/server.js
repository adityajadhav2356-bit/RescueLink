const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory data store for live simulation & operations
let alerts = [];
let activeHazards = [];
let rescueIncidents = [];

const mockWorkers = [
    {
        workerId: 'W-042',
        name: 'Alex Mercer',
        zone: 'Sector 7G',
        status: 'SAFE',
        envTemp: 31,
        airQuality: 'Good',
        gasPpm: 12,
        battery: 84,
        connectivity: 'Strong',
        heartRate: 76,
        immobilityMinutes: 0,
        lat: 51.505,
        lng: -0.09
    },
    {
        workerId: 'W-011',
        name: 'Sarah Connor',
        zone: 'Tunnel B',
        status: 'WARNING',
        envTemp: 38,
        airQuality: 'Fair',
        gasPpm: 34,
        battery: 45,
        connectivity: 'Strong',
        heartRate: 114,
        immobilityMinutes: 0,
        lat: 51.510,
        lng: -0.100
    },
    {
        workerId: 'W-007',
        name: 'James Bond',
        zone: 'Deep Shaft 3',
        status: 'SAFE',
        envTemp: 28,
        airQuality: 'Good',
        gasPpm: 6,
        battery: 90,
        connectivity: 'Strong',
        heartRate: 72,
        immobilityMinutes: 0,
        lat: 51.512,
        lng: -0.080
    }
];

let workers = [...mockWorkers];

io.on('connection', (socket) => {
    console.log(`[Socket.io] Tactical client connected: ${socket.id}`);

    // Send initial data to client on connect
    socket.on('request_initial_data', () => {
        socket.emit('initial_data', { alerts, workers, hazards: activeHazards, rescueIncidents });
    });

    // Receive SOS emergency from worker or simulator
    socket.on('emergency_alert', (data) => {
        console.log('[Socket.io] Emergency Alert Received:', data);

        // Deduplicate identical active alerts for same worker
        const existingAlertIdx = alerts.findIndex(a => a.workerId === data.workerId);
        if (existingAlertIdx === -1) {
            alerts.unshift(data);
        } else {
            alerts[existingAlertIdx] = { ...alerts[existingAlertIdx], ...data };
        }

        // Update worker status in backend state
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            workers[workerIndex].status = 'CRITICAL';
            if (data.envTemp) workers[workerIndex].envTemp = data.envTemp;
            if (data.gasPpm) workers[workerIndex].gasPpm = data.gasPpm;
        }

        // Broadcast to all connected clients
        io.emit('emergency_alert_received', data);
    });

    // Receive worker vitals updates
    socket.on('worker_update', (data) => {
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            const currentStatus = workers[workerIndex].status;
            workers[workerIndex] = {
                ...workers[workerIndex],
                ...data,
                status: currentStatus === 'CRITICAL' ? 'CRITICAL' : data.status || currentStatus
            };
        } else {
            workers.push(data);
        }
        io.emit('worker_updated', data);
    });

    // Supervisor dispatches rescue team to worker location
    socket.on('dispatch_rescue_team', (dispatchPayload) => {
        console.log('[Socket.io] Rescue Team Dispatched:', dispatchPayload);

        // Update worker status to RESCUE_EN_ROUTE and remove critical danger state
        const workerIndex = workers.findIndex(w => w.workerId === dispatchPayload.workerId);
        if (workerIndex !== -1) {
            workers[workerIndex].status = 'RESCUE_EN_ROUTE';
        }

        // Remove active critical alert or update its state
        alerts = alerts.filter(a => a.workerId !== dispatchPayload.workerId);

        // Broadcast to all clients including the specific worker
        io.emit('rescue_team_dispatched', dispatchPayload);
        io.emit('worker_updated', { workerId: dispatchPayload.workerId, status: 'RESCUE_EN_ROUTE' });
    });

    // Supervisor resolves an alert
    socket.on('resolve_alert', (data) => {
        console.log('[Socket.io] Alert Resolved for worker:', data.workerId);
        alerts = alerts.filter(a => a.workerId !== data.workerId);

        // Update worker status back to safe
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            workers[workerIndex].status = 'SAFE';
            workers[workerIndex].envTemp = 31;
            workers[workerIndex].gasPpm = 12;
        }

        io.emit('alert_resolved', data);
    });

    // Emergency Broadcast from supervisor
    socket.on('emergency_broadcast', (broadcastData) => {
        console.log('[Socket.io] Emergency Broadcast:', broadcastData);
        io.emit('emergency_broadcast_received', broadcastData);
    });

    // Hazard management
    socket.on('hazard_broadcast', (hazard) => {
        activeHazards.unshift(hazard);
        io.emit('hazard_updated', activeHazards);
    });

    socket.on('hazard_resolve', (hazardId) => {
        activeHazards = activeHazards.filter(h => h.id !== hazardId);
        io.emit('hazard_updated', activeHazards);
    });

    // Rescue team assignments
    socket.on('rescue_team_update', (payload) => {
        io.emit('rescue_team_broadcast', payload);
    });

    // Offline event sync
    socket.on('sync_offline_events', (events = []) => {
        console.log(`[Socket.io] Syncing ${events.length} offline queued events`);
        events.forEach(evt => {
            alerts.unshift(evt);
            const wIdx = workers.findIndex(w => w.workerId === evt.workerId);
            if (wIdx !== -1) workers[wIdx].status = 'CRITICAL';
            io.emit('emergency_alert_received', evt);
        });
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.status(200).send("RescueLink Tactical Command Backend Running 🚀");
});

app.get("/api/workers", (req, res) => {
    res.json(workers);
});

app.get("/api/alerts", (req, res) => {
    res.json(alerts);
});

app.get("/api/health", (req, res) => {
    res.json({ status: "NOMINAL", timestamp: new Date().toISOString(), workers: workers.length, activeAlerts: alerts.length });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`RescueLink Server running on http://0.0.0.0:${PORT}`);
});
