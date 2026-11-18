import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, Truck, Navigation, CheckCircle2, Volume2, Mic, Clock, UserCheck, Flame, ArrowRight, X, MapPin } from 'lucide-react';
import { soundService } from '../services/soundService';

export const EmergencyContextModal = ({
    alert = null,
    worker = null,
    nearestResponder = { id: 'S-02', name: 'Rapid Response Team Beta', lead: 'Alexandre', distanceMeters: 180, etaMinutes: 2 },
    onAcknowledge = () => { },
    onResolve = () => { },
    onDispatch = () => { },
    onOpenVoice = () => { },
    onClose = () => { }
}) => {
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [isDispatched, setIsDispatched] = useState(false);

    useEffect(() => {
        if (!alert) return;
        soundService.playEmergencyAlarm();
        const interval = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [alert]);

    if (!alert) return null;

    // Escalation Stages calculation
    let escalationStage = '05s - SUPERVISOR NOTIFIED';
    let escalationColor = 'text-[var(--safety-amber)]';
    let countdownToNext = Math.max(0, 15 - secondsElapsed);

    if (secondsElapsed >= 60) {
        escalationStage = '60s - SITE-WIDE EMERGENCY ESCALATION';
        escalationColor = 'text-[var(--safety-red)] animate-pulse font-bold';
        countdownToNext = 0;
    } else if (secondsElapsed >= 30) {
        escalationStage = '30s - INCIDENT COMMAND DISPATCH ESCALATED';
        escalationColor = 'text-[var(--safety-red)] font-bold';
        countdownToNext = Math.max(0, 60 - secondsElapsed);
    } else if (secondsElapsed >= 15) {
        escalationStage = '15s - UNACKNOWLEDGED WARNING';
        escalationColor = 'text-[var(--safety-orange)] font-bold';
        countdownToNext = Math.max(0, 30 - secondsElapsed);
    }

    const workerId = alert.workerId || worker?.workerId || 'W-042';
    const workerName = alert.name || worker?.name || 'Alex Mercer';
    const zone = alert.zone || worker?.zone || 'Tunnel B';
    const lat = alert.lat || worker?.lat || 51.505;
    const lng = alert.lng || worker?.lng || -0.09;
    const temp = alert.envTemp || worker?.envTemp || 39;
    const gas = alert.gasPpm || worker?.gasPpm || 48;
    const battery = alert.battery || worker?.battery || 45;
    const heartRate = alert.heartRate || worker?.heartRate || 118;
    const riskScore = alert.riskScore || 88;
    const severity = alert.severity || 'CRITICAL';

    const handleDispatchClick = () => {
        soundService.playAcknowledge();
        setIsDispatched(true);
        const payload = {
            workerId,
            workerName,
            zone,
            lat,
            lng,
            teamName: nearestResponder.name,
            lead: nearestResponder.lead,
            distanceMeters: nearestResponder.distanceMeters || 180,
            etaMinutes: nearestResponder.etaMinutes || 2,
            safeCorridor: 'Primary Surface Shaft Gate Alpha Corridor',
            timestamp: new Date().toISOString()
        };
        onDispatch(payload);
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
            <div className="w-full max-w-2xl bg-[var(--bg-panel)] border-2 border-[var(--safety-red)] rounded-lg shadow-[0_0_40px_rgba(239,68,68,0.4)] overflow-hidden font-data text-xs flex flex-col emergency-strobe animate-in fade-in zoom-in-95 duration-200">
                {/* Header Banner */}
                <div className="bg-[var(--safety-red)] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <AlertOctagon className="w-6 h-6 animate-pulse" />
                        <div>
                            <div className="font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                                <span>CRITICAL SOS EMERGENCY</span>
                                <span className="text-[0.65rem] px-2 py-0.5 bg-black/30 rounded border border-white/20">
                                    SEVERITY: {severity}
                                </span>
                            </div>
                            <div className="text-[0.68rem] opacity-90">
                                WORKER {workerId} // {workerName.toUpperCase()} — {zone.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            onClose();
                        }}
                        className="w-7 h-7 rounded bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Escalation Workflow Tracker */}
                <div className="bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--safety-cyan)] animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="text-[var(--text-muted)] text-[0.68rem]">ELAPSED:</span>
                        <span className="font-bold text-sm text-[var(--text-bright)]">
                            {Math.floor(secondsElapsed / 60)}m {secondsElapsed % 60}s
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[0.68rem]">
                        <span className="text-[var(--text-muted)]">ESCALATION PROTOCOL:</span>
                        <span className={`${escalationColor}`}>{escalationStage}</span>
                        {countdownToNext > 0 && !isAcknowledged && (
                            <span className="text-[var(--text-muted)]">
                                (Escalates in: <strong className="text-[var(--safety-amber)]">{countdownToNext}s</strong>)
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Primary Telemetry & Risk Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)]">
                            <span className="text-[0.62rem] text-[var(--text-muted)] block uppercase">AI RISK SCORE</span>
                            <span className="text-xl font-bold text-[var(--safety-red)]">{riskScore} / 100</span>
                            <span className="text-[0.6rem] text-[var(--safety-red)] block mt-0.5 font-bold">EXTREME DANGER</span>
                        </div>

                        <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)]">
                            <span className="text-[0.62rem] text-[var(--text-muted)] block uppercase">TEMPERATURE</span>
                            <span className="text-xl font-bold text-[var(--safety-orange)]">{temp}°C</span>
                            <span className="text-[0.6rem] text-[var(--safety-orange)] block mt-0.5">High Thermal Stress</span>
                        </div>

                        <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)]">
                            <span className="text-[0.62rem] text-[var(--text-muted)] block uppercase">GAS / AIR TOXICITY</span>
                            <span className="text-xl font-bold text-[var(--safety-amber)]">{gas} PPM</span>
                            <span className="text-[0.6rem] text-[var(--safety-amber)] block mt-0.5">Deteriorating Air</span>
                        </div>

                        <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)]">
                            <span className="text-[0.62rem] text-[var(--text-muted)] block uppercase">HEART RATE / POWER</span>
                            <span className="text-xl font-bold text-[var(--text-primary)]">{heartRate} <span className="text-xs font-normal">BPM</span></span>
                            <span className="text-[0.6rem] text-[var(--text-muted)] block mt-0.5">Battery: {battery}%</span>
                        </div>
                    </div>

                    {/* Location & GPS Info Strip */}
                    <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] flex items-center justify-between text-[0.7rem]">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <MapPin className="w-3.5 h-3.5 text-[var(--safety-cyan)]" />
                            <span>GPS FIX: <strong className="text-[var(--safety-cyan)] font-mono">{lat.toFixed(4)}°N, {Math.abs(lng).toFixed(4)}°W</strong></span>
                        </div>
                        <div className="text-[var(--text-muted)]">
                            SECTOR: <strong className="text-[var(--text-primary)]">{zone}</strong>
                        </div>
                    </div>

                    {/* Nearest Responder & Safe Route Box */}
                    <div className="p-3 rounded bg-[rgba(0,229,255,0.05)] border border-[var(--safety-cyan)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-1.5 text-[var(--safety-cyan)] font-bold text-xs uppercase mb-1">
                                <Truck className="w-4 h-4" />
                                <span>AUTOMATED NEAREST RESPONDER ASSIGNMENT</span>
                            </div>
                            <div className="text-xs text-[var(--text-primary)] font-semibold">
                                {nearestResponder.name} (Lead: {nearestResponder.lead})
                            </div>
                            <div className="text-[0.68rem] text-[var(--text-secondary)] mt-0.5 flex items-center gap-2">
                                <span>Distance: <strong className="text-[var(--safety-cyan)]">{nearestResponder.distanceMeters || 180} m</strong></span>
                                <span>•</span>
                                <span>Estimated ETA: <strong className="text-[var(--safety-green)]">~{nearestResponder.etaMinutes || 2} min</strong></span>
                            </div>
                        </div>

                        <button
                            onClick={handleDispatchClick}
                            disabled={isDispatched}
                            className={`btn-tactical text-xs px-3 py-2 cursor-pointer ${isDispatched
                                ? 'bg-[rgba(16,185,129,0.2)] border-[var(--safety-green)] text-[var(--safety-green)] cursor-default'
                                : 'btn-tactical-primary'
                                }`}
                        >
                            {isDispatched ? '✓ RESPONDER DISPATCHED' : 'DISPATCH TEAM NOW 🚑'}
                        </button>
                    </div>

                    {/* Smart Emergency Context & AI Triage Justification */}
                    <div className="p-3 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] space-y-1.5">
                        <div className="font-bold text-xs text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-[var(--safety-red)]" />
                            <span>AI EMERGENCY CONTEXT & ROOT CAUSE TRIAGE</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[0.7rem] text-[var(--text-secondary)] leading-relaxed">
                            <li><strong>SOS Triggered</strong>: Manual emergency button depressed by operator at {new Date().toLocaleTimeString()}.</li>
                            <li><strong>Thermal Anomaly</strong>: Ambient temperature reached <strong>{temp}°C</strong> (+7°C above safe baseline).</li>
                            <li><strong>Hazardous Gas Spike</strong>: Detected <strong>{gas} PPM</strong> toxic gas concentration in {zone}.</li>
                            <li><strong>Evacuation Corridor</strong>: Primary Surface Shaft Gate Alpha designated as unobstructed escape point.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Operational Actions */}
                <div className="p-3.5 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] flex flex-wrap items-center justify-between gap-2">
                    <button
                        onClick={() => {
                            soundService.playClick();
                            onOpenVoice(worker);
                        }}
                        className="btn-tactical text-xs px-3 py-2 flex items-center gap-1.5 text-[var(--safety-cyan)]"
                    >
                        <Mic className="w-3.5 h-3.5" />
                        <span>OPEN VOICE INTERCOM</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                soundService.playAcknowledge();
                                setIsAcknowledged(true);
                                onAcknowledge(alert);
                            }}
                            className={`btn-tactical text-xs px-3 py-2 ${isAcknowledged
                                ? 'bg-[rgba(16,185,129,0.2)] border-[var(--safety-green)] text-[var(--safety-green)]'
                                : 'btn-tactical-primary'
                                }`}
                        >
                            {isAcknowledged ? '✓ ACKNOWLEDGED' : 'ACKNOWLEDGE ALERT'}
                        </button>

                        <button
                            onClick={() => {
                                soundService.playAcknowledge();
                                onResolve(alert);
                            }}
                            className="btn-tactical bg-[rgba(16,185,129,0.15)] hover:bg-[var(--safety-green)] border-[var(--safety-green)] text-[var(--safety-green)] hover:text-black text-xs px-4 py-2 font-bold cursor-pointer transition-all"
                        >
                            ✓ RESOLVE INCIDENT & CLEAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContextModal;
