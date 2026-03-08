import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, AlertTriangle, Crosshair, BellRing, LogOut } from 'lucide-react';
import WorkerTable from '../components/WorkerTable';
import WorkerMap from '../components/WorkerMap';
import EmergencyLog from '../components/EmergencyLog';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Auto-detect the server's network IP based on where the frontend is served from
const SERVER_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`;
const socket = io(SERVER_URL, { autoConnect: false });

const mockWorkers = [
    { workerId: 'W-042', name: 'Alex Mercer', zone: 'Sector 7G', status: 'SAFE', envTemp: 32, airQuality: 'Good', battery: 85, lat: 51.505, lng: -0.09 },
    { workerId: 'W-011', name: 'Sarah Connor', zone: 'Tunnel B', status: 'WARNING', envTemp: 38, airQuality: 'Fair', battery: 45, lat: 51.51, lng: -0.1 },
    { workerId: 'W-007', name: 'James Bond', zone: 'Deep Shaft 3', status: 'SAFE', envTemp: 28, airQuality: 'Good', battery: 90, lat: 51.51, lng: -0.08 }
];

const SupervisorDashboard = ({ user }) => {
    const [workers, setWorkers] = useState(mockWorkers);
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => { setIsConnected(true); });
        socket.on('disconnect', () => { setIsConnected(false); });

        // Fetch current active state from server since page just loaded
        socket.emit('request_initial_data');

        socket.on('initial_data', (data) => {
            if (data.alerts) setAlerts(data.alerts);
            if (data.workers) setWorkers(data.workers);
        });

        socket.on('emergency_alert_received', (data) => {
            setAlerts(prev => [data, ...prev]);

            // Update worker status to CRITICAL
            setWorkers(prev => prev.map(w => w.workerId === data.workerId ? { ...w, status: 'CRITICAL', envTemp: w.envTemp + 5 } : w));
        });

        socket.on('worker_updated', (updatedData) => {
            setWorkers(prev => prev.map(w => {
                if (w.workerId === updatedData.workerId) {
                    // If supervisor currently sees them as CRITICAL, don't let a normal update revert it
                    const keepCritical = w.status === 'CRITICAL';
                    return { ...w, ...updatedData, status: keepCritical ? 'CRITICAL' : updatedData.status };
                }
                return w;
            }));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initial_data');
            socket.off('emergency_alert_received');
            socket.off('worker_updated');
            socket.disconnect();
        };
    }, []);

    const handleAcknowledge = (alertIndex, workerId) => {
        setAlerts(prev => prev.filter((_, i) => i !== alertIndex));
        setWorkers(prev => prev.map(w => w.workerId === workerId ? { ...w, status: 'SAFE' } : w));
        socket.emit('resolve_alert', { workerId });
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const criticalCount = workers.filter(w => w.status === 'CRITICAL').length;
    const warningCount = workers.filter(w => w.status === 'WARNING').length;

    return (
        <div
            className="min-h-screen text-[#e2e8f0] font-sans"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(2, 5, 11, 0.85), rgba(5, 10, 20, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Navbar Option */}
            <nav className="glass-panel border-b border-[rgba(0,240,255,0.1)] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[var(--primary)] w-8 h-8" />
                    <span className="text-xl font-bold tracking-wider text-white">Rescue<span className="text-[var(--primary)] text-glow">Link</span> Command</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[var(--safe)] glow-safe animate-pulse' : 'bg-[var(--danger)] glow-danger'}`}></span>
                        <span className={`text-sm font-semibold ${isConnected ? 'text-[var(--safe)]' : 'text-[var(--danger)]'}`}>
                            {isConnected ? t("System Online") : "Connection Failed"}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" /> {t("Logout")}
                    </button>
                </div>
            </nav>

            {/* FULL SCREEN EMERGENCY POP-UP OVERLAY */}
            {alerts.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(255,0,85,0.1)] pointer-events-none">
                    <div className="absolute inset-0 border-[10px] border-[var(--danger)] animate-pulse opacity-50"></div>
                </div>
            )}

            <main className="p-6 max-w-7xl mx-auto space-y-6 relative z-10">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { title: t("Active Workers"), value: workers.length, icon: <Users className="text-[var(--primary)] w-7 h-7" />, color: "border-[var(--primary)]" },
                        { title: t("Critical Alerts"), value: criticalCount, icon: <BellRing className={`${criticalCount > 0 ? 'text-[var(--danger)] animate-bounce' : 'text-gray-500'} w-7 h-7`} />, color: criticalCount > 0 ? "border-[var(--danger)] glow-danger" : "border-gray-800" },
                        { title: t("Zones Monitored"), value: "4", icon: <Crosshair className="text-[var(--safe)] w-7 h-7" />, color: "border-[var(--safe)]" },
                        { title: t("SOS Alerts Today"), value: alerts.length, icon: <AlertTriangle className={`${alerts.length > 0 ? 'text-[var(--warning)] animate-pulse' : 'text-gray-500'} w-7 h-7`} />, color: alerts.length > 0 ? "border-[var(--warning)] glow-warning" : "border-gray-800" }
                    ].map((card, index) => (
                        <div key={index} className={`glass-panel p-6 rounded-2xl flex items-center justify-between border ${card.color} transition-all duration-300 hover:-translate-y-1`}>
                            <div>
                                <p className="text-sm text-gray-400 font-semibold mb-1">{card.title}</p>
                                <h3 className="text-3xl font-black text-white">{card.value}</h3>
                            </div>
                            <div className="bg-[#050a14] p-3 rounded-xl border border-[rgba(255,255,255,0.05)]">
                                {card.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Map and Log column */}
                    <div className="xl:col-span-1 space-y-6 flex flex-col">
                        <WorkerMap workers={workers} />
                        <EmergencyLog logs={alerts} onAcknowledge={handleAcknowledge} />
                    </div>

                    {/* Table column */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users className="text-[var(--primary)]" />
                                {t("Live Roster")}
                            </h2>
                            <div className="flex gap-4 text-sm font-semibold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--danger)] rounded-full animate-pulse"></span> {criticalCount} {t("Critical")}</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--warning)] rounded-full"></span> {warningCount} {t("Warning")}</span>
                            </div>
                        </div>
                        <WorkerTable workers={workers} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupervisorDashboard;
