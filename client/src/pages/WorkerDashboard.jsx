import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Battery, Wifi, Thermometer, Wind, CheckCircle2, Volume2, Mic, MicOff, Heart, Radio, Activity, AlertTriangle, UserCheck, Flame, Send, ArrowRight, ShieldCheck, Clock, MapPin, Truck } from 'lucide-react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { calculateWorkerRisk } from '../services/riskEngine';
import { soundService } from '../services/soundService';
import AnalogRiskGauge from '../components/AnalogRiskGauge';
import WorkerDigitalTwin from '../components/WorkerDigitalTwin';
import ExposureChart from '../components/ExposureChart';
import RescueDispatchedNotificationModal from '../components/RescueDispatchedNotificationModal';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`;
const socket = io(SERVER_URL, { autoConnect: false });

export const WorkerDashboard = ({ user = { id: 'W-042', name: 'Alex Mercer' } }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [workerData, setWorkerData] = useState({
        workerId: user?.id || 'W-042',
        name: user?.name || 'Alex Mercer',
        zone: 'Sector 7G',
        status: 'SAFE', // 'SAFE' | 'WARNING' | 'CRITICAL' | 'RESCUE_EN_ROUTE'
        envTemp: 31,
        airQuality: 'Good',
        gasPpm: 12,
        battery: 84,
        connectivity: 'Strong',
        heartRate: 76,
        immobilityMinutes: 0,
        lat: 51.505,
        lng: -0.09
    });

    const [sosActive, setSosActive] = useState(false);
    const [rescueDispatchInfo, setRescueDispatchInfo] = useState(null);
    const [showRescueModal, setShowRescueModal] = useState(false);

    const [tasks, setTasks] = useState([
        { id: 1, text: 'Inspect ventilation damper shaft 4B', completed: true },
        { id: 2, text: 'Calibrate pressure & gas telemetry nodes', completed: false },
        { id: 3, text: 'Perform muster point emergency check', completed: false }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [showDigitalTwin, setShowDigitalTwin] = useState(false);
    const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'tasks' | 'route'

    const risk = calculateWorkerRisk(workerData, workerData);

    // Socket link
    useEffect(() => {
        socket.connect();
        socket.emit('request_initial_data');

        socket.on('worker_updated', (data) => {
            if (data.workerId === workerData.workerId) {
                setWorkerData(prev => ({ ...prev, ...data }));
            }
        });

        // Listen for Rescue Team Dispatched by Supervisor
        socket.on('rescue_team_dispatched', (dispatchData) => {
            if (dispatchData.workerId === workerData.workerId || !dispatchData.workerId) {
                soundService.playAcknowledge();
                // Remove the danger red strobe and update state to RESCUE_EN_ROUTE
                setSosActive(false);
                setWorkerData(prev => ({
                    ...prev,
                    status: 'RESCUE_EN_ROUTE'
                }));
                setRescueDispatchInfo(dispatchData);
                setShowRescueModal(true);
            }
        });

        socket.on('alert_resolved', (data) => {
            if (data.workerId === workerData.workerId) {
                soundService.playAcknowledge();
                setSosActive(false);
                setWorkerData(prev => ({ ...prev, status: 'SAFE' }));
                setShowRescueModal(false);
            }
        });

        socket.on('emergency_broadcast_received', (broadcast) => {
            soundService.playEmergencyAlarm();
            alert(`⚠️ EMERGENCY COMMAND BROADCAST:\n\n${broadcast.message}`);
        });

        return () => {
            socket.disconnect();
        };
    }, [workerData.workerId]);

    // Handle SOS Trigger
    const triggerSOS = () => {
        soundService.playEmergencyAlarm();
        setSosActive(true);
        const updated = {
            ...workerData,
            status: 'CRITICAL',
            envTemp: workerData.envTemp + 4,
            riskScore: 92
        };
        setWorkerData(updated);

        socket.emit('emergency_alert', {
            workerId: workerData.workerId,
            name: workerData.name,
            zone: workerData.zone,
            envTemp: updated.envTemp,
            airQuality: updated.airQuality,
            gasPpm: updated.gasPpm || 48,
            battery: updated.battery,
            heartRate: updated.heartRate || 120,
            riskScore: 92,
            severity: 'CRITICAL',
            timestamp: new Date().toISOString(),
            lat: workerData.lat,
            lng: workerData.lng
        });
    };

    const cancelSOS = () => {
        soundService.playAcknowledge();
        setSosActive(false);
        setWorkerData(prev => ({ ...prev, status: 'SAFE' }));
        socket.emit('resolve_alert', { workerId: workerData.workerId });
    };

    const toggleTask = (id) => {
        soundService.playClick();
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const isCritical = (workerData.status === 'CRITICAL' || sosActive) && workerData.status !== 'RESCUE_EN_ROUTE';
    const isRescueEnRoute = workerData.status === 'RESCUE_EN_ROUTE';

    return (
        <div className="min-h-screen w-full bg-[var(--bg-void)] text-[var(--text-primary)] font-data text-xs pb-12 select-none flex flex-col">
            {/* Top Tactical Mobile Header */}
            <header className="bg-[var(--bg-panel)] border-b border-[var(--grid-line)] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)]">
                        <Radio className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-xs text-[var(--text-primary)] tracking-wide flex items-center gap-1.5">
                            RESCUELINK <span className="text-[var(--safety-cyan)] text-[0.62rem]">OPERATOR</span>
                        </div>
                        <div className="text-[0.65rem] text-[var(--text-muted)]">
                            {workerData.workerId} // {workerData.name} ({workerData.zone})
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/supervisor')}
                        className="btn-tactical text-[0.65rem] py-1 px-2 text-[var(--safety-cyan)]"
                    >
                        COMMAND HUB 🛡️
                    </button>
                </div>
            </header>

            {/* Emergency Strobe Banner if Critical */}
            {isCritical && (
                <div className="bg-[var(--safety-red)] text-white px-4 py-2.5 flex items-center justify-between emergency-strobe">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase">
                        <ShieldAlert className="w-4 h-4 animate-ping" />
                        <span>CRITICAL SOS BEACON BROADCASTING</span>
                    </div>
                    <button
                        onClick={cancelSOS}
                        className="bg-black/40 hover:bg-black/60 text-white px-2.5 py-1 rounded text-[0.68rem] font-bold cursor-pointer"
                    >
                        CANCEL SOS ✕
                    </button>
                </div>
            )}

            {/* Reassuring Rescue Force En Route Banner (Replaces Red Danger) */}
            {isRescueEnRoute && (
                <div className="bg-gradient-to-r from-cyan-900 to-emerald-900 border-b border-[var(--safety-cyan)] text-white px-4 py-2.5 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2.5 font-bold text-xs">
                        <Truck className="w-4.5 h-4.5 text-[var(--safety-cyan)] animate-bounce" />
                        <div>
                            <span className="text-[var(--safety-cyan)] uppercase tracking-wider block font-mono">
                                🚑 RESCUE FORCE IS ON THE WAY!
                            </span>
                            <span className="text-[0.65rem] opacity-90 font-normal">
                                Team: Rapid Response Beta • ETA: ~2 min • Stand by at coordinates
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRescueModal(true)}
                        className="btn-tactical btn-tactical-primary text-[0.65rem] py-1 px-2.5"
                    >
                        VIEW DETAILS 📋
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-xl w-full mx-auto p-4 space-y-4 flex-1">
                {/* Giant Tactile SOS Button */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-2 left-3 text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider">
                        EMERGENCY DISPATCH TRIGGER
                    </div>

                    <button
                        onClick={isCritical ? cancelSOS : triggerSOS}
                        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-2xl relative ${isCritical
                            ? 'bg-[var(--safety-red)] text-white emergency-strobe border-4 border-white'
                            : isRescueEnRoute
                                ? 'bg-gradient-to-br from-cyan-600 to-emerald-700 text-white border-4 border-cyan-400 shadow-[0_0_35px_rgba(0,229,255,0.4)]'
                                : 'bg-gradient-to-br from-red-600 to-red-800 text-white border-4 border-red-400 hover:shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                            }`}
                    >
                        {isRescueEnRoute ? (
                            <>
                                <Truck className="w-12 h-12 mb-1 text-white animate-pulse" />
                                <span className="font-bold text-base tracking-wider">RESCUE EN ROUTE</span>
                                <span className="text-[0.6rem] opacity-90 uppercase">HELP ON WAY</span>
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="w-12 h-12 mb-1" />
                                <span className="font-bold text-lg tracking-widest">
                                    {isCritical ? 'SOS ACTIVE' : 'SOS'}
                                </span>
                                <span className="text-[0.6rem] opacity-80 uppercase tracking-tight">
                                    {isCritical ? 'TAP TO CANCEL' : 'EMERGENCY HELP'}
                                </span>
                            </>
                        )}
                    </button>

                    <p className="text-[0.68rem] text-[var(--text-muted)] mt-3 text-center">
                        {isRescueEnRoute
                            ? "Rescue operators dispatched to your coordinates. Maintain position."
                            : "Instant priority distress relay to Surface Incident Command with full sensor telemetry."
                        }
                    </p>
                </div>

                {/* Risk Score & Status Dial */}
                <div className="p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <AnalogRiskGauge
                        score={isRescueEnRoute ? 35 : risk.score}
                        size={150}
                        label="AI RISK LEVEL"
                    />

                    <div className="flex-1 w-full space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--grid-line)] pt-3 sm:pt-0 sm:pl-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[0.68rem] text-[var(--text-muted)]">STATUS ASSESSMENT</span>
                            <span
                                className={`text-[0.68rem] font-bold px-2 py-0.5 rounded uppercase ${isRescueEnRoute
                                    ? 'bg-[rgba(0,229,255,0.2)] text-[var(--safety-cyan)] border border-[var(--safety-cyan)]'
                                    : isCritical
                                        ? 'bg-[var(--safety-red)] text-white'
                                        : workerData.status === 'WARNING'
                                            ? 'bg-[var(--safety-amber)] text-black'
                                            : 'bg-[rgba(16,185,129,0.2)] text-[var(--safety-green)]'
                                    }`}
                            >
                                {isRescueEnRoute ? '🚑 RESCUE EN ROUTE' : workerData.status}
                            </span>
                        </div>

                        <div className="text-[0.72rem] text-[var(--text-secondary)] leading-snug">
                            💡 <strong>Recommendation</strong>: {isRescueEnRoute ? "Rescue squad dispatched. Stand by at coordinates." : risk.recommendation}
                        </div>

                        <div className="pt-2 border-t border-[var(--grid-line)] flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                            <span>ZONE: <strong className="text-[var(--text-primary)]">{workerData.zone}</strong></span>
                            <span>GPS: <strong className="text-[var(--safety-cyan)] font-mono">{workerData.lat.toFixed(4)}°N, {Math.abs(workerData.lng).toFixed(4)}°W</strong></span>
                        </div>
                    </div>
                </div>

                {/* Primary Real-Time Sensor Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] text-[0.65rem]">
                            <span>TEMPERATURE</span>
                            <Thermometer className="w-3.5 h-3.5 text-[var(--safety-orange)]" />
                        </div>
                        <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
                            {workerData.envTemp}°C
                        </div>
                        <div className="text-[0.6rem] text-[var(--safety-green)] mt-0.5">Nominal Range</div>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] text-[0.65rem]">
                            <span>GAS / AIR QUALITY</span>
                            <Wind className="w-3.5 h-3.5 text-[var(--safety-cyan)]" />
                        </div>
                        <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
                            {workerData.gasPpm} <span className="text-xs font-normal text-[var(--text-muted)]">PPM</span>
                        </div>
                        <div className="text-[0.6rem] text-[var(--safety-green)] mt-0.5">{workerData.airQuality}</div>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] text-[0.65rem]">
                            <span>HEART RATE</span>
                            <Heart className="w-3.5 h-3.5 text-[var(--safety-red)]" />
                        </div>
                        <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
                            {workerData.heartRate} <span className="text-xs font-normal text-[var(--text-muted)]">BPM</span>
                        </div>
                        <div className="text-[0.6rem] text-[var(--text-muted)] mt-0.5">Cardiac Telemetry</div>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                        <div className="flex items-center justify-between text-[var(--text-muted)] text-[0.65rem]">
                            <span>TRANSPONDER</span>
                            <Battery className="w-3.5 h-3.5 text-[var(--safety-green)]" />
                        </div>
                        <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
                            {workerData.battery}%
                        </div>
                        <div className="text-[0.6rem] text-[var(--safety-green)] mt-0.5">{workerData.connectivity} Mesh</div>
                    </div>
                </div>

                {/* Shift Tasks Checklist */}
                <div className="p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[var(--grid-line)] pb-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--safety-cyan)]" />
                            ASSIGNED SHIFT SAFETY TASKS
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">
                            {tasks.filter(t => t.completed).length} / {tasks.length} COMPLETED
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className={`p-2.5 rounded border flex items-center gap-2.5 cursor-pointer transition-colors ${task.completed
                                    ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)] text-[var(--text-muted)] line-through'
                                    : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-primary)] hover:border-[var(--safety-cyan)]'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-[var(--safety-green)] border-[var(--safety-green)] text-black' : 'border-[var(--text-muted)]'}`}>
                                    {task.completed && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <span className="text-[0.72rem]">{task.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency Escape Corridor Pointer */}
                <div className="p-3 rounded-lg bg-[rgba(0,229,255,0.06)] border border-[var(--safety-cyan)] flex items-center justify-between">
                    <div>
                        <div className="text-[0.65rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider">
                            NEAREST MUSTER / ESCAPE CORRIDOR
                        </div>
                        <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                            Primary Surface Shaft Gate Alpha (140m East)
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-[rgba(16,185,129,0.2)] text-[var(--safety-green)] text-[0.65rem] font-bold">
                        OPEN ✓
                    </div>
                </div>
            </main>

            {/* Rescue Force Notification Modal Popup */}
            {showRescueModal && rescueDispatchInfo && (
                <RescueDispatchedNotificationModal
                    dispatchData={rescueDispatchInfo}
                    onClose={() => setShowRescueModal(false)}
                />
            )}
        </div>
    );
};

export default WorkerDashboard;
