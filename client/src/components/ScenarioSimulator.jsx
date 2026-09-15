import React, { useState } from 'react';
import { Sparkles, Play, RotateCcw, AlertTriangle, Flame, Wind, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { soundService } from '../services/soundService';

export const ScenarioSimulator = ({
    workers = [],
    onUpdateWorker = () => { },
    onTriggerSOS = () => { },
    onAddTimelineEvent = () => { },
    onResetNominal = () => { },
    onClose = () => { }
}) => {
    const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
    const [workflowStep, setWorkflowStep] = useState(0);

    // Section 24 Full Automated Scenario Sequence
    const runFullDemoScenario = async () => {
        if (isRunningWorkflow) return;
        setIsRunningWorkflow(true);
        soundService.playClick();

        // Step 1: Initialize Worker W-042 in Normal Safe State
        setWorkflowStep(1);
        onUpdateWorker({
            workerId: 'W-042',
            name: 'Alex Mercer',
            zone: 'Tunnel B',
            status: 'SAFE',
            envTemp: 31,
            airQuality: 'Good',
            gasPpm: 12,
            battery: 84,
            connectivity: 'Strong',
            heartRate: 76,
            immobilityMinutes: 0
        });
        onAddTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: 'W-042',
            zone: 'Tunnel B',
            type: 'TELEMETRY_SYNC',
            text: 'Worker W-042 online in Tunnel B. Vitals nominal (Risk: 24).',
            severity: 'INFO'
        });

        // Step 2: Environmental conditions begin deteriorating (Risk: 41 -> 63 -> 78)
        await new Promise(r => setTimeout(r, 2000));
        setWorkflowStep(2);
        soundService.playWarning();
        onUpdateWorker({
            workerId: 'W-042',
            name: 'Alex Mercer',
            zone: 'Tunnel B',
            status: 'WARNING',
            envTemp: 35,
            airQuality: 'Fair',
            gasPpm: 32,
            battery: 82,
            connectivity: 'Strong',
            heartRate: 98
        });
        onAddTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: 'W-042',
            zone: 'Tunnel B',
            type: 'PREDICTIVE_WARNING',
            text: 'Air quality in Tunnel B deteriorating (+18% over 10m). Risk rose to 41.',
            severity: 'WARNING'
        });

        // Step 3: Gas & Temp Spike (Risk: 78) -> Predictive Alert Trigger
        await new Promise(r => setTimeout(r, 2200));
        setWorkflowStep(3);
        soundService.playWarning();
        onUpdateWorker({
            workerId: 'W-042',
            name: 'Alex Mercer',
            zone: 'Tunnel B',
            status: 'WARNING',
            envTemp: 39,
            airQuality: 'Poor',
            gasPpm: 48,
            battery: 80,
            heartRate: 118
        });
        onAddTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: 'W-042',
            zone: 'Tunnel B',
            type: 'PREDICTIVE_WARNING',
            text: 'High thermal stress (39°C) & toxic gas (48 PPM) detected. Risk rose to 78.',
            severity: 'WARNING'
        });

        // Step 4: Worker Triggers SOS -> Command Center Reacts
        await new Promise(r => setTimeout(r, 2500));
        setWorkflowStep(4);
        soundService.playEmergencyAlarm();
        onTriggerSOS({
            workerId: 'W-042',
            name: 'Alex Mercer',
            zone: 'Tunnel B',
            envTemp: 39,
            airQuality: 'Poor',
            gasPpm: 48,
            battery: 80,
            heartRate: 118,
            riskScore: 88,
            severity: 'CRITICAL',
            reason: 'Manual SOS button depressed due to toxic gas & thermal stress in Tunnel B',
            lat: 51.505,
            lng: -0.09
        });
        onAddTimelineEvent({
            time: new Date().toLocaleTimeString(),
            workerId: 'W-042',
            zone: 'Tunnel B',
            type: 'SOS_TRIGGERED',
            text: 'CRITICAL SOS EMERGENCY TRIGGERED by W-042 in Tunnel B! Risk Score: 88.',
            severity: 'CRITICAL'
        });

        setIsRunningWorkflow(false);
    };

    return (
        <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--safety-cyan)] rounded-lg p-4 font-data text-xs flex flex-col justify-between select-none">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between border-b border-[var(--grid-line)] pb-2.5 mb-3">
                    <div className="flex items-center gap-2 text-[var(--safety-cyan)] font-bold text-sm">
                        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                        <span>TACTICAL DEMO SIMULATION SANDBOX</span>
                    </div>
                    <span className="text-[0.62rem] px-2 py-0.5 rounded bg-[rgba(0,229,255,0.12)] text-[var(--safety-cyan)]">
                        SECTION 24 VERIFIER
                    </span>
                </div>

                <p className="text-[0.7rem] text-[var(--text-secondary)] mb-3 leading-relaxed">
                    Execute automated multi-phase emergency scenarios or manually simulate sensor anomalies to evaluate RescueLink's AI triage, predictive alerts, geofencing, and escalation engines.
                </p>

                {/* Main Automated Scenario Runner */}
                <div className="p-3.5 rounded bg-[rgba(0,229,255,0.06)] border border-[var(--safety-cyan)] mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-[var(--safety-cyan)] uppercase flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5" />
                            RUN COMPLETE SECTION 24 DEMO SCENARIO
                        </span>
                        {isRunningWorkflow && (
                            <span className="text-[0.65rem] text-[var(--safety-amber)] animate-pulse font-bold">
                                RUNNING PHASE {workflowStep}/4...
                            </span>
                        )}
                    </div>

                    <p className="text-[0.68rem] text-[var(--text-muted)] mb-3">
                        Simulates Worker W-042: Safe (Risk 24) ➔ Gas & Heat Spike (Risk 78) ➔ Predictive Alert ➔ SOS Trigger ➔ Command Center Reaction & Routing.
                    </p>

                    <button
                        onClick={runFullDemoScenario}
                        disabled={isRunningWorkflow}
                        className="btn-tactical btn-tactical-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    >
                        <Play className="w-4 h-4" />
                        <span>{isRunningWorkflow ? 'SIMULATION IN PROGRESS...' : 'START COMPLETE DEMO SCENARIO NOW'}</span>
                    </button>
                </div>

                {/* Individual Fast Event Triggers */}
                <div className="space-y-2">
                    <span className="text-[0.68rem] text-[var(--text-muted)] uppercase block font-bold">
                        INDIVIDUAL SENSOR INJECTION CONTROLS
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                soundService.playEmergencyAlarm();
                                onTriggerSOS({
                                    workerId: 'W-042',
                                    name: 'Alex Mercer',
                                    zone: 'Tunnel B',
                                    envTemp: 38,
                                    gasPpm: 45,
                                    battery: 75,
                                    heartRate: 120,
                                    riskScore: 92,
                                    severity: 'CRITICAL',
                                    reason: 'Simulated Instant SOS Button Press'
                                });
                            }}
                            className="btn-tactical btn-tactical-danger py-2 text-[0.68rem] flex items-center justify-center gap-1.5"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Trigger SOS (W-042)</span>
                        </button>

                        <button
                            onClick={() => {
                                soundService.playWarning();
                                onUpdateWorker({
                                    workerId: 'W-042',
                                    envTemp: 42,
                                    status: 'WARNING'
                                });
                            }}
                            className="btn-tactical py-2 text-[0.68rem] flex items-center justify-center gap-1.5 text-[var(--safety-orange)] border-[var(--safety-orange)]"
                        >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Heat Spike (42°C)</span>
                        </button>

                        <button
                            onClick={() => {
                                soundService.playWarning();
                                onUpdateWorker({
                                    workerId: 'W-011',
                                    gasPpm: 55,
                                    airQuality: 'Poor',
                                    status: 'WARNING'
                                });
                            }}
                            className="btn-tactical py-2 text-[0.68rem] flex items-center justify-center gap-1.5 text-[var(--safety-amber)] border-[var(--safety-amber)]"
                        >
                            <Wind className="w-3.5 h-3.5" />
                            <span>Gas Leak (55 PPM)</span>
                        </button>

                        <button
                            onClick={() => {
                                soundService.playWarning();
                                onUpdateWorker({
                                    workerId: 'W-007',
                                    zone: 'Restricted Zone 03',
                                    status: 'WARNING'
                                });
                            }}
                            className="btn-tactical py-2 text-[0.68rem] flex items-center justify-center gap-1.5 text-[var(--safety-cyan)] border-[var(--safety-cyan)]"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Geofence Breach</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Reset Control */}
            <div className="pt-3 border-t border-[var(--grid-line)] mt-3">
                <button
                    onClick={() => {
                        soundService.playAcknowledge();
                        onResetNominal();
                    }}
                    className="w-full btn-tactical py-2 text-xs text-[var(--safety-green)] border-[var(--safety-green)] flex items-center justify-center gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET ALL WORKFORCE VITALS TO NOMINAL SAFE</span>
                </button>
            </div>
        </div>
    );
};

export default ScenarioSimulator;
