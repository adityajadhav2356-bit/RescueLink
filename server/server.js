const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
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

// Mock database connection for the demo as MongoDB might not be running locally
// In a real application, you would connect to a real MongoDB URI
/*
mongoose.connect('mongodb://localhost:27017/rescuelink', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));
*/

// In-memory array for demo purposes if DB is not active
let alerts = [];

const mockWorkers = [
    { workerId: 'W-042', name: 'Alex Mercer', zone: 'Sector 7G', status: 'SAFE', envTemp: 32, airQuality: 'Good', battery: 85, lat: 51.505, lng: -0.09 },
    { workerId: 'W-011', name: 'Sarah Connor', zone: 'Tunnel B', status: 'WARNING', envTemp: 38, airQuality: 'Fair', battery: 45, lat: 51.51, lng: -0.1 },
    { workerId: 'W-007', name: 'James Bond', zone: 'Deep Shaft 3', status: 'SAFE', envTemp: 28, airQuality: 'Good', battery: 90, lat: 51.51, lng: -0.08 }
];

let workers = [...mockWorkers];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send initial data to supervisor on connect
    socket.on('request_initial_data', () => {
        socket.emit('initial_data', { alerts, workers });
    });

    // Receive SOS from worker
    socket.on('emergency_alert', (data) => {
        console.log('Emergency Alert Received:', data);

        // Add to active alerts
        alerts.unshift(data);

        // Update worker status in backend state
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            workers[workerIndex].status = 'CRITICAL';
        }

        // Broadcast to supervisor
        io.emit('emergency_alert_received', data);
    });

    // Receive periodic worker vitals updates
    socket.on('worker_update', (data) => {
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            // Only update non-critical statuses if already critical
            const currentStatus = workers[workerIndex].status;
            workers[workerIndex] = { ...workers[workerIndex], ...data, status: currentStatus === 'CRITICAL' ? 'CRITICAL' : data.status };
        } else {
            workers.push(data);
        }
        io.emit('worker_updated', data);
    });

    // Supervisor resolves an alert
    socket.on('resolve_alert', (data) => {
        alerts = alerts.filter(a => a.workerId !== data.workerId);

        // Update worker status back to safe
        const workerIndex = workers.findIndex(w => w.workerId === data.workerId);
        if (workerIndex !== -1) {
            workers[workerIndex].status = 'SAFE';
        }

        io.emit('alert_resolved', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8080;

// Health route (must exist)
app.get("/", (req, res) => {
    res.status(200).send("RescueLink backend running 🚀");
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
