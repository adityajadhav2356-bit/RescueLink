import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopTacticalBar, { DEMO_STAKEHOLDERS } from '../components/TopTacticalBar';
import ConsoleRail from '../components/ConsoleRail';
import WorkerMap from '../components/WorkerMap';
import IntelligencePanel from '../components/IntelligencePanel';
import LiveEventStream from '../components/LiveEventStream';
import IncidentTimeline, { INITIAL_TIMELINE_EVENTS } from '../components/IncidentTimeline';
import EmergencyContextModal from '../components/EmergencyContextModal';
import EmergencyBroadcastModal from '../components/EmergencyBroadcastModal';
import VoiceIntercomModal from '../components/VoiceIntercomModal';
import ScenarioSimulator from '../components/ScenarioSimulator';
import SupervisorDispatchToastModal from '../components/SupervisorDispatchToastModal';
import WorkerDigitalTwin from '../components/WorkerDigitalTwin';
import WorkerTable from '../components/WorkerTable';
import GeofenceManager from '../components/GeofenceManager';
import SafetyAnalytics from './SafetyAnalytics';
import { generatePredictiveWarnings } from '../services/predictiveEngine';
import { INITIAL_HAZARDS } from '../services/hazardService';
import { INITIAL_GEOFENCES } from '../services/geofenceService';
import { INITIAL_RESCUE_TEAMS } from '../services/rescueTeamService';
import { soundService } from '../services/soundService';
import { ChevronUp, ChevronDown, Sparkles, Activity, Clock } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`;
const socket = io(SERVER_URL, { autoConnect: false });

const INITIAL_WORKERS = [
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

export const SupervisorDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Core Data State
    const [workers, setWorkers] = useState(INITIAL_WORKERS);
    const [alerts, setAlerts] = useState([]);
    const [hazards, setHazards] = useState(INITIAL_HAZARDS);
    const [geofences, setGeofences] = useState(INITIAL_GEOFENCES);
    const [rescueTeams, setRescueTeams] = useState(INITIAL_RESCUE_TEAMS);
    const [timelineEvents, setTimelineEvents] = useState(INITIAL_TIMELINE_EVENTS);
    const [currentUser, setCurrentUser] = useState(DEMO_STAKEHOLDERS[2]); // S-01 Supervisor Commander

    // Navigation & Views
    const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'map' | 'workers' | 'alerts' | 'zones' | 'analytics' | 'broadcast' | 'simulator'
    const [bottomDrawerTab, setBottomDrawerTab] = useState('stream'); // 'stream' | 'timeline'
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);

    // Modals
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [digitalTwinWorker, setDigitalTwinWorker] = useState(null);
    const [activeSOSModalAlert, setActiveSOSModalAlert] = useState(null);
    const [supervisorDispatchToast, setSupervisorDispatchToast] = useState(null);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);

    // Real-time Predictive Warnings
    const predictiveWarnings = generatePredictiveWarnings(workers, hazards, geofences);

    // Socket.io Realtime Listener
    useEffect(() => {
        socket.connect();
        socket.emit('request_initial_data');

        socket.on('initial_data', (data) => {
            if (data.alerts && data.alerts.length > 0) setAlerts(data.alerts);
            if (data.workers && data.workers.length > 0) setWorkers(data.workers);
        });

        socket.on('emergency_alert_received', (newAlert) => {
            soundService.playEmergencyAlarm();
            setAlerts(prev => [newAlert, ...prev.filter(a => a.workerId !== newAlert.workerId)]);
            setWorkers(prev => prev.map(w => w.workerId === newAlert.workerId ? { ...w, status: 'CRITICAL', envTemp: newAlert.envTemp || w.envTemp + 4 } : w));
            setActiveSOSModalAlert(newAlert);
            addTimelineEvent({
                time: new Date().toLocaleTimeString(),
                workerId: newAlert.workerId,
                zone: newAlert.zone || 'Tunnel B',
                type: 'SOS_TRIGGERED',
                text: `CRITICAL SOS: Worker ${newAlert.workerId} triggered emergency alert in ${newAlert.zone || 'Tunnel B'}!`,
                severity: 'CRITICAL'
            });
        });

        socket.on('rescue_team_dispatched', (dispatchData) => {
            setWorkers(prev => prev.map(w => w.workerId === dispatchData.workerId ? { ...w, status: 'RESCUE_EN_ROUTE' } : w));
            setAlerts(prev => prev.filter(a => a.workerId !== dispatchData.workerId));
        });

        socket.on('worker_updated', (updatedData) => {
            setWorkers(prev => prev.map(w => {
                if (w.workerId === updatedData.workerId) {
                    return { ...w, ...updatedData };
                }
                return w;
            }));
        });

        socket.on('alert_resolved', (data) => {
            soundService.playAcknowledge();
            setAlerts(prev => prev.filter(a => a.workerId !== data.workerId));
            setWorkers(prev => prev.map(w => w.workerId === data.workerId ? { ...w, status: 'SAFE' } : w));
            setActiveSOSModalAlert(null);
            addTimelineEvent({
                time: new Date().toLocaleTimeString(),
                workerId: data.workerId,
                type: 'RESOLVED',
                text: `Incident for worker ${data.workerId} successfully resolved and verified safe.`,
                severity: 'INFO'
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const addTimelineEvent = (evt) => {
        setTimelineEvents(prev => [{ id: Date.now(), ...evt }, ...prev]);
    };

    // User Switcher
    const handleSwitchUser = (stakeholder) => {
        setCurrentUser(stakeholder);
        if (stakeholder.role === 'worker') {
            navigate('/worker');
        }
    };

    // Navigation Router
    const handleNavigate = (sectionId) => {
        if (sectionId === 'worker_portal') {
            navigate('/worker');
        } else {
            setActiveSection(sectionId);
        }
    };

    // Alert Actions
    const handleAcknowledgeAlert = (alertData) => {
        soundService.playAcknowledge();
        addTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: alertData.workerId,
            type: 'ACKNOWLEDGED',
            text: `Alert for ${alertData.workerId} acknowledged by ${currentUser.name}.`,
            severity: 'INFO'
        });
    };

    const handleResolveAlert = (alertData) => {
        soundService.playAcknowledge();
        setAlerts(prev => prev.filter(a => a.workerId !== alertData.workerId));
        setWorkers(prev => prev.map(w => w.workerId === alertData.workerId ? { ...w, status: 'SAFE', envTemp: 31, gasPpm: 12 } : w));
        setActiveSOSModalAlert(null);
        socket.emit('resolve_alert', { workerId: alertData.workerId });
        addTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: alertData.workerId,
            type: 'RESOLVED',
            text: `Worker ${alertData.workerId} marked SAFE. Incident logged to Safety Analytics.`,
            severity: 'INFO'
        });
    };

    // Comprehensive Rescue Force Dispatch Handler
    const handleDispatchResponder = (dispatchPayload) => {
        soundService.playAcknowledge();

        const targetWorkerId = dispatchPayload.workerId || 'W-042';
        const targetWorker = workers.find(w => w.workerId === targetWorkerId) || workers[0];
        const team = rescueTeams.find(t => t.id === dispatchPayload.teamId) || rescueTeams[0];

        const fullPayload = {
            workerId: targetWorkerId,
            workerName: targetWorker?.name || 'Alex Mercer',
            zone: targetWorker?.zone || 'Tunnel B // Sector 7G',
            lat: targetWorker?.lat || 51.505,
            lng: targetWorker?.lng || -0.09,
            teamName: dispatchPayload.teamName || team.name,
            lead: dispatchPayload.lead || team.lead,
            distanceMeters: dispatchPayload.distanceMeters || 180,
            etaMinutes: dispatchPayload.etaMinutes || 2,
            safeCorridor: 'Primary Surface Shaft Gate Alpha Corridor',
            timestamp: new Date().toISOString()
        };

        // 1. Remove red danger signal & transition worker to RESCUE_EN_ROUTE
        setWorkers(prev => prev.map(w => w.workerId === targetWorkerId ? { ...w, status: 'RESCUE_EN_ROUTE' } : w));
        setAlerts(prev => prev.filter(a => a.workerId !== targetWorkerId));
        setRescueTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: 'DISPATCHED' } : t));

        // 2. Pop up supervisor confirmation HUD with full location telemetry
        setSupervisorDispatchToast(fullPayload);

        // 3. Emit real-time WebSocket event to worker screen
        socket.emit('dispatch_rescue_team', fullPayload);

        // 4. Log to timeline
        addTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: targetWorkerId,
            zone: fullPayload.zone,
            type: 'RESCUE_DISPATCHED',
            text: `🚑 RESCUE SQUAD DISPATCHED: ${fullPayload.teamName} (Lead: ${fullPayload.lead}) deployed to ${targetWorkerId} at ${fullPayload.lat.toFixed(4)}°N, ${Math.abs(fullPayload.lng).toFixed(4)}°W (${fullPayload.zone}). ETA: ~${fullPayload.etaMinutes}m.`,
            severity: 'INFO'
        });
    };

    // Simulation Handlers
    const handleSimulatorUpdateWorker = (updatedWorker) => {
        setWorkers(prev => prev.map(w => w.workerId === updatedWorker.workerId ? { ...w, ...updatedWorker } : w));
        socket.emit('worker_update', updatedWorker);
    };

    const handleSimulatorTriggerSOS = (sosPayload) => {
        soundService.playEmergencyAlarm();
        setAlerts(prev => [sosPayload, ...prev.filter(a => a.workerId !== sosPayload.workerId)]);
        setWorkers(prev => prev.map(w => w.workerId === sosPayload.workerId ? { ...w, status: 'CRITICAL', ...sosPayload } : w));
        setActiveSOSModalAlert(sosPayload);
        socket.emit('emergency_alert', sosPayload);
    };

    const handleSimulatorResetNominal = () => {
        setWorkers(INITIAL_WORKERS);
        setAlerts([]);
        setActiveSOSModalAlert(null);
        setSupervisorDispatchToast(null);
        setRescueTeams(INITIAL_RESCUE_TEAMS);
        addTimelineEvent({
            time: new Date().toLocaleTimeString(),
            type: 'SYSTEM_RESET',
            text: 'All workforce vitals and zones reset to nominal safe baseline.',
            severity: 'INFO'
        });
    };

    const handleSendBroadcast = (broadcastData) => {
        socket.emit('emergency_broadcast', broadcastData);
        addTimelineEvent({
            time: new Date().toLocaleTimeString(),
            type: 'BROADCAST_TRANSMITTED',
            text: `Broadcast sent to ${broadcastData.target}: "${broadcastData.message}"`,
            severity: 'WARNING'
        });
    };

    return (
        <div className="h-screen w-screen bg-[var(--bg-void)] text-[var(--text-primary)] font-body flex flex-col overflow-hidden select-none">
            {/* Top Tactical Telemetry & Command Bar */}
            <TopTacticalBar
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                activeAlerts={alerts}
                onOpenVoice={() => setShowVoiceModal(true)}
                onOpenBroadcast={() => setShowBroadcastModal(true)}
                onNavigate={handleNavigate}
            />

            {/* Main Application Shell: Console Rail + Center Viewport */}
            <div className="flex-1 flex overflow-hidden">
                {/* Slim Left Console Rail Navigation */}
                <ConsoleRail
                    activeSection={activeSection}
                    onSelectSection={handleNavigate}
                    activeAlertsCount={alerts.length}
                />

                {/* Main Dynamic Viewport */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-void)] relative">
                    {activeSection === 'overview' && (
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Center Column: Interactive Tactical Safety Map + Bottom Live Drawer */}
                            <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
                                {/* Tactical Leaflet Safety Map */}
                                <div className="flex-1 min-h-[380px] w-full relative">
                                    <WorkerMap
                                        workers={workers}
                                        hazards={hazards}
                                        geofences={geofences}
                                        rescueTeams={rescueTeams}
                                        selectedWorker={selectedWorker}
                                        onSelectWorker={(w) => setSelectedWorker(w)}
                                        onOpenDigitalTwin={(w) => setDigitalTwinWorker(w)}
                                    />
                                </div>

                                {/* Bottom Expandable Drawer (Live Event Stream & Incident Timeline) */}
                                <div
                                    className={`bg-[var(--bg-panel)] border border-[var(--grid-line)] rounded-md transition-all duration-300 flex flex-col overflow-hidden ${isDrawerOpen ? 'h-[190px]' : 'h-10'
                                        }`}
                                >
                                    {/* Drawer Header Tabs */}
                                    <div className="bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] px-3 py-1.5 flex items-center justify-between z-10 select-none">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => { soundService.playClick(); setBottomDrawerTab('stream'); }}
                                                className={`text-[0.68rem] font-data font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${bottomDrawerTab === 'stream'
                                                    ? 'text-[var(--safety-cyan)]'
                                                    : 'text-[var(--text-muted)] hover:text-white'
                                                    }`}
                                            >
                                                <Activity className="w-3.5 h-3.5" />
                                                <span>Live Event Stream</span>
                                            </button>

                                            <span className="text-[var(--grid-line)]">|</span>

                                            <button
                                                onClick={() => { soundService.playClick(); setBottomDrawerTab('timeline'); }}
                                                className={`text-[0.68rem] font-data font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${bottomDrawerTab === 'timeline'
                                                    ? 'text-[var(--safety-cyan)]'
                                                    : 'text-[var(--text-muted)] hover:text-white'
                                                    }`}
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Incident Audit Timeline</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                                            className="text-[var(--text-muted)] hover:text-white cursor-pointer"
                                            title={isDrawerOpen ? 'Minimize Drawer' : 'Expand Drawer'}
                                        >
                                            {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Drawer Body Content */}
                                    {isDrawerOpen && (
                                        <div className="flex-1 overflow-y-auto">
                                            {bottomDrawerTab === 'stream' ? (
                                                <LiveEventStream
                                                    events={timelineEvents}
                                                    onInspectEvent={(evt) => {
                                                        const target = workers.find(w => w.workerId === evt.workerId);
                                                        if (target) setSelectedWorker(target);
                                                    }}
                                                />
                                            ) : (
                                                <IncidentTimeline events={timelineEvents} activeAlert={alerts[0]} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Persistent Column: RescueLink AI Intelligence Panel */}
                            <IntelligencePanel
                                workers={workers}
                                alerts={alerts}
                                predictiveWarnings={predictiveWarnings}
                                rescueTeams={rescueTeams}
                                hazards={hazards}
                                geofences={geofences}
                                onSelectWorker={(w) => setSelectedWorker(w)}
                                onDispatchResponder={handleDispatchResponder}
                                onInspectWarning={(warn) => {
                                    const target = workers.find(w => w.workerId === warn.workerId);
                                    if (target) setSelectedWorker(target);
                                }}
                            />
                        </div>
                    )}

                    {/* Section: Tactical Map (Fullscreen Mode) */}
                    {activeSection === 'map' && (
                        <div className="flex-1 p-4">
                            <WorkerMap
                                workers={workers}
                                hazards={hazards}
                                geofences={geofences}
                                rescueTeams={rescueTeams}
                                selectedWorker={selectedWorker}
                                onSelectWorker={(w) => setSelectedWorker(w)}
                                onOpenDigitalTwin={(w) => setDigitalTwinWorker(w)}
                            />
                        </div>
                    )}

                    {/* Section: Worker Live Roster */}
                    {activeSection === 'workers' && (
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                            <div className="max-w-6xl mx-auto space-y-4">
                                <div className="border-b border-[var(--grid-line)] pb-3 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-data font-bold text-lg text-[var(--text-primary)]">
                                            WORKFORCE LIVE TELEMETRY ROSTER
                                        </h2>
                                        <p className="text-xs text-[var(--text-muted)] font-data">
                                            Real-time bio-sensors, environmental exposures, and AI risk indexes for all deployed personnel.
                                        </p>
                                    </div>
                                </div>
                                <WorkerTable
                                    workers={workers}
                                    onSelectWorker={(w) => setDigitalTwinWorker(w)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Section: Alerts & Incident Management */}
                    {activeSection === 'alerts' && (
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                            <div className="max-w-4xl mx-auto space-y-4">
                                <div className="border-b border-[var(--grid-line)] pb-3">
                                    <h2 className="font-data font-bold text-lg text-[var(--text-primary)]">
                                        ACTIVE EMERGENCY ALERTS & INCIDENT AUDIT
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)] font-data">
                                        Monitor triage workflows, acknowledge emergencies, and dispatch rescue teams.
                                    </p>
                                </div>

                                {alerts.length === 0 ? (
                                    <div className="p-8 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] text-center font-data text-xs text-[var(--text-muted)]">
                                        ✓ No critical SOS emergencies active at this time. All units secured.
                                    </div>
                                ) : (
                                    alerts.map((alertItem) => (
                                        <div
                                            key={alertItem.workerId}
                                            className="p-4 rounded bg-[rgba(239,68,68,0.1)] border border-[var(--safety-red)] flex items-center justify-between gap-4 font-data text-xs"
                                        >
                                            <div>
                                                <div className="font-bold text-sm text-[var(--safety-red)]">
                                                    CRITICAL SOS: {alertItem.workerId} ({alertItem.name})
                                                </div>
                                                <div className="text-[var(--text-secondary)] mt-1">
                                                    Zone: <strong>{alertItem.zone}</strong> • Temp: <strong>{alertItem.envTemp}°C</strong> • Gas: <strong>{alertItem.gasPpm || 48} PPM</strong>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setActiveSOSModalAlert(alertItem)}
                                                className="btn-tactical btn-tactical-danger text-xs px-4 py-2"
                                            >
                                                OPEN INCIDENT HUD 🚨
                                            </button>
                                        </div>
                                    ))
                                )}

                                <div className="mt-6">
                                    <IncidentTimeline events={timelineEvents} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Zones & Geofencing */}
                    {activeSection === 'zones' && (
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                            <div className="max-w-5xl mx-auto">
                                <GeofenceManager
                                    geofences={geofences}
                                    setGeofences={setGeofences}
                                />
                            </div>
                        </div>
                    )}

                    {/* Section: Safety Analytics */}
                    {activeSection === 'analytics' && (
                        <SafetyAnalytics workers={workers} alerts={alerts} />
                    )}

                    {/* Section: Emergency Broadcast */}
                    {activeSection === 'broadcast' && (
                        <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
                            <div className="w-full max-w-lg">
                                <EmergencyBroadcastModal
                                    workers={workers}
                                    onSendBroadcast={handleSendBroadcast}
                                    onClose={() => setActiveSection('overview')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Section: Simulation Sandbox */}
                    {activeSection === 'simulator' && (
                        <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
                            <div className="w-full max-w-2xl">
                                <ScenarioSimulator
                                    workers={workers}
                                    onUpdateWorker={handleSimulatorUpdateWorker}
                                    onTriggerSOS={handleSimulatorTriggerSOS}
                                    onAddTimelineEvent={addTimelineEvent}
                                    onResetNominal={handleSimulatorResetNominal}
                                    onClose={() => setActiveSection('overview')}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Status Bar */}
            <footer className="h-[38px] bg-[var(--bg-panel)] border-t border-[var(--grid-line)] px-4 flex items-center justify-between text-[0.65rem] font-data text-[var(--text-muted)] select-none">
                <div className="flex items-center gap-3">
                    <span>SECURITY: <strong className="text-[var(--safety-green)]">ENCRYPTED INDUSTRIAL MESH</strong></span>
                    <span>•</span>
                    <span>SECTOR: <strong className="text-[var(--text-primary)]">SITE ALPHA // SHAFT 3</strong></span>
                    <span>•</span>
                    <span>TELEMETRY: <strong className="text-[var(--safety-cyan)]">99.8% PACKET RECEIPT</strong></span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveSection('simulator')}
                        className="text-[var(--safety-amber)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>DEMO SIMULATOR</span>
                    </button>
                    <span>•</span>
                    <span>v2.5.0-COMMAND</span>
                </div>
            </footer>

            {/* Emergency Context Modal */}
            {activeSOSModalAlert && (
                <EmergencyContextModal
                    alert={activeSOSModalAlert}
                    worker={workers.find(w => w.workerId === activeSOSModalAlert.workerId)}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                    onDispatch={handleDispatchResponder}
                    onOpenVoice={() => setShowVoiceModal(true)}
                    onClose={() => setActiveSOSModalAlert(null)}
                />
            )}

            {/* Supervisor Dispatch Toast Modal (Showing all target location details) */}
            {supervisorDispatchToast && (
                <SupervisorDispatchToastModal
                    dispatchData={supervisorDispatchToast}
                    onClose={() => setSupervisorDispatchToast(null)}
                />
            )}

            {showVoiceModal && (
                <VoiceIntercomModal
                    currentUser={currentUser}
                    onTriggerEmergency={handleSimulatorTriggerSOS}
                    onClose={() => setShowVoiceModal(false)}
                />
            )}

            {showBroadcastModal && (
                <EmergencyBroadcastModal
                    workers={workers}
                    onSendBroadcast={handleSendBroadcast}
                    onClose={() => setShowBroadcastModal(false)}
                />
            )}

            {digitalTwinWorker && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[var(--bg-panel)] border border-[var(--safety-cyan)] rounded-lg overflow-hidden shadow-2xl">
                        <div className="p-3 bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] flex items-center justify-between font-data text-xs">
                            <span className="font-bold text-[var(--safety-cyan)]">
                                WORKER DIGITAL TWIN TELEMETRY // {digitalTwinWorker.workerId}
                            </span>
                            <button
                                onClick={() => setDigitalTwinWorker(null)}
                                className="text-white hover:text-red-400 cursor-pointer font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 max-h-[80vh] overflow-y-auto">
                            <WorkerDigitalTwin
                                worker={digitalTwinWorker}
                                onClose={() => setDigitalTwinWorker(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
