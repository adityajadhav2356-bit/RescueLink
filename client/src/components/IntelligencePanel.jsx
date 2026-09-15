import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, Zap, Truck, ArrowRight, Activity, Thermometer, Wind, Radio, CheckCircle2 } from 'lucide-react';
import AnalogRiskGauge from './AnalogRiskGauge';
import { soundService } from '../services/soundService';

export const IntelligencePanel = ({
    workers = [],
    alerts = [],
    predictiveWarnings = [],
    rescueTeams = [],
    hazards = [],
    geofences = [],
    onSelectWorker = () => { },
    onDispatchResponder = () => { },
    onInspectWarning = () => { }
}) => {
    // Calculate Site-Wide Average Safety Risk Index
    const totalRisk = workers.reduce((acc, w) => {
        let wScore = 15;
        if (w.status === 'CRITICAL') wScore = 92;
        else if (w.status === 'WARNING') wScore = 65;
        else if (w.status === 'RESCUE_EN_ROUTE') wScore = 35;
        else if (w.envTemp > 36 || (w.gasPpm && w.gasPpm > 30)) wScore = 50;
        return acc + wScore;
    }, 0);

    const siteAvgRisk = workers.length > 0 ? Math.round(totalRisk / workers.length) : 18;
    const overallSafetyIndex = Math.max(0, 100 - siteAvgRisk);

    const criticalCount = alerts.length;
    const activeRiskWorkers = workers.filter(w => w.status === 'CRITICAL' || w.status === 'WARNING');
    const warningCount = predictiveWarnings.length;

    // Identify primary nearest responder
    const nearestTeam = rescueTeams.find(t => t.status === 'AVAILABLE') || rescueTeams[0];

    const handleDirectDispatchForWorker = (warn, e) => {
        e.stopPropagation();
        soundService.playAcknowledge();
        const targetWorker = workers.find(w => w.workerId === warn.workerId) || {
            workerId: warn.workerId,
            name: warn.workerName,
            zone: warn.zone,
            lat: warn.lat || 51.505,
            lng: warn.lng || -0.09
        };

        const payload = {
            workerId: warn.workerId,
            workerName: warn.workerName,
            zone: warn.zone,
            lat: targetWorker.lat || 51.505,
            lng: targetWorker.lng || -0.09,
            teamName: nearestTeam.name,
            lead: nearestTeam.lead,
            distanceMeters: 180,
            etaMinutes: 2,
            safeCorridor: 'Primary Surface Shaft Gate Alpha Corridor',
            timestamp: new Date().toISOString()
        };

        onDispatchResponder(payload);
    };

    return (
        <aside className="w-full lg:w-[360px] xl:w-[390px] h-full bg-[var(--bg-panel)] border-l border-[var(--grid-line)] flex flex-col font-data text-xs overflow-y-auto select-none">
            {/* Header */}
            <div className="p-3.5 border-b border-[var(--grid-line)] bg-[var(--bg-panel-elevated)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)]">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div>
                        <div className="font-bold text-xs text-[var(--text-primary)] tracking-wider">
                            RESCUELINK INTELLIGENCE
                        </div>
                        <div className="text-[0.62rem] text-[var(--safety-cyan)]">
                            AUTONOMOUS RISK & TRIAGE AGENT
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] text-[var(--safety-green)] text-[0.65rem] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--safety-green)] animate-ping"></span>
                    <span>ACTIVE</span>
                </div>
            </div>

            {/* Core Instrument Section: Analog Site Safety Gauge */}
            <div className="p-4 border-b border-[var(--grid-line)] bg-[var(--bg-void)]/40 flex flex-col items-center">
                <AnalogRiskGauge
                    score={siteAvgRisk}
                    size={160}
                    label="SITE RISK SEVERITY"
                    subLabel="PREDICTIVE ENGINE"
                />

                {/* KPI Matrix */}
                <div className="grid grid-cols-4 gap-2 w-full mt-2 pt-2 border-t border-[var(--grid-line)] text-center">
                    <div className="bg-[var(--bg-panel-elevated)] p-1.5 rounded border border-[var(--grid-line)]">
                        <span className="text-[0.6rem] text-[var(--text-muted)] block">SAFETY</span>
                        <span className="text-sm font-bold text-[var(--safety-green)]">{overallSafetyIndex}%</span>
                    </div>
                    <div className="bg-[var(--bg-panel-elevated)] p-1.5 rounded border border-[var(--grid-line)]">
                        <span className="text-[0.6rem] text-[var(--text-muted)] block">RISKS</span>
                        <span className={`text-sm font-bold ${activeRiskWorkers.length > 0 ? 'text-[var(--safety-amber)]' : 'text-[var(--text-primary)]'}`}>
                            {activeRiskWorkers.length}
                        </span>
                    </div>
                    <div className="bg-[var(--bg-panel-elevated)] p-1.5 rounded border border-[var(--grid-line)]">
                        <span className="text-[0.6rem] text-[var(--text-muted)] block">WARNINGS</span>
                        <span className={`text-sm font-bold ${warningCount > 0 ? 'text-[var(--safety-orange)]' : 'text-[var(--text-primary)]'}`}>
                            {warningCount}
                        </span>
                    </div>
                    <div className="bg-[var(--bg-panel-elevated)] p-1.5 rounded border border-[var(--grid-line)]">
                        <span className="text-[0.6rem] text-[var(--text-muted)] block">CRITICAL</span>
                        <span className={`text-sm font-bold ${criticalCount > 0 ? 'text-[var(--safety-red)] animate-pulse' : 'text-[var(--text-primary)]'}`}>
                            {criticalCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nearest Responder Rapid Dispatch Card */}
            {nearestTeam && (
                <div className="p-3 border-b border-[var(--grid-line)] bg-[rgba(0,229,255,0.03)]">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[0.68rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            NEAREST RAPID RESPONDER
                        </span>
                        <span className="text-[0.62rem] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.15)] text-[var(--safety-green)] font-semibold">
                            {nearestTeam.status}
                        </span>
                    </div>

                    <div className="bg-[var(--bg-panel-elevated)] p-2.5 rounded border border-[var(--grid-line)] flex items-center justify-between">
                        <div>
                            <div className="font-bold text-xs text-[var(--text-primary)]">
                                {nearestTeam.name} ({nearestTeam.lead})
                            </div>
                            <div className="text-[0.65rem] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                                <span>Dist: <strong className="text-[var(--safety-cyan)]">180 m</strong></span>
                                <span>•</span>
                                <span>ETA: <strong className="text-[var(--safety-green)]">~2 min</strong></span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                soundService.playAcknowledge();
                                const primaryWorker = workers.find(w => w.status === 'CRITICAL' || w.status === 'WARNING') || workers[0];
                                onDispatchResponder({
                                    workerId: primaryWorker.workerId,
                                    workerName: primaryWorker.name,
                                    zone: primaryWorker.zone,
                                    lat: primaryWorker.lat,
                                    lng: primaryWorker.lng,
                                    teamName: nearestTeam.name,
                                    lead: nearestTeam.lead,
                                    distanceMeters: 180,
                                    etaMinutes: 2
                                });
                            }}
                            className="btn-tactical btn-tactical-primary text-[0.65rem] px-2 py-1 flex items-center gap-1 cursor-pointer"
                        >
                            <span>DISPATCH</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Predictive Safety Warnings & Emergency Requests Feed */}
            <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.68rem] text-[var(--safety-amber)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        PREDICTIVE WARNINGS & REQUESTS ({predictiveWarnings.length})
                    </span>
                    <span className="text-[0.6rem] text-[var(--text-muted)]">ACTIVE FEED</span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {predictiveWarnings.length === 0 ? (
                        <div className="p-5 rounded bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.3)] text-center text-[var(--text-secondary)] space-y-1.5">
                            <CheckCircle2 className="w-7 h-7 mx-auto text-[var(--safety-green)]" />
                            <div className="font-bold text-xs text-[var(--safety-green)]">
                                ALL WORKFORCE REQUESTS SECURED
                            </div>
                            <p className="text-[0.68rem] text-[var(--text-muted)] leading-relaxed">
                                Help has been dispatched to all active sectors. Zero unhandled hazard requests pending.
                            </p>
                        </div>
                    ) : (
                        predictiveWarnings.map((warn) => {
                            const isCritical = warn.severity === 'CRITICAL';
                            const isHigh = warn.severity === 'HIGH';

                            return (
                                <div
                                    key={warn.id}
                                    onClick={() => {
                                        soundService.playClick();
                                        onInspectWarning(warn);
                                    }}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer shadow-md ${isCritical
                                        ? 'bg-[rgba(239,68,68,0.12)] border-[var(--safety-red)] hover:bg-[rgba(239,68,68,0.18)]'
                                        : isHigh
                                            ? 'bg-[rgba(249,115,22,0.1)] border-[var(--safety-orange)] hover:bg-[rgba(249,115,22,0.18)]'
                                            : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] hover:border-[var(--safety-amber)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="font-bold text-xs text-[var(--text-primary)] truncate flex items-center gap-1.5">
                                            <span className="text-[var(--safety-cyan)]">{warn.workerId}</span>
                                            <span>//</span>
                                            <span className="text-[var(--text-bright)]">{warn.workerName}</span>
                                        </div>
                                        <span
                                            className={`text-[0.6rem] font-bold px-1.5 py-0.2 rounded uppercase ${isCritical
                                                ? 'bg-[var(--safety-red)] text-white animate-pulse'
                                                : isHigh
                                                    ? 'bg-[var(--safety-orange)] text-white'
                                                    : 'bg-[var(--safety-amber)] text-black'
                                                }`}
                                        >
                                            {warn.severity}
                                        </span>
                                    </div>

                                    <p className="text-[0.72rem] text-[var(--text-primary)] font-semibold leading-tight">
                                        {warn.headline}
                                    </p>

                                    <div className="flex items-center justify-between text-[0.65rem] text-[var(--text-muted)] mt-1.5">
                                        <span>Current: <strong className="text-[var(--text-primary)]">{warn.currentValue}</strong></span>
                                        <span>Trend: <strong className="text-[var(--safety-amber)]">{warn.trend}</strong></span>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-[var(--grid-line)] flex items-center justify-between gap-2">
                                        <div className="text-[0.62rem] text-[var(--safety-cyan)] leading-snug truncate flex-1">
                                            💡 {warn.recommendation}
                                        </div>

                                        {/* 1-Click Direct Help Dispatcher on Warning Card */}
                                        <button
                                            onClick={(e) => handleDirectDispatchForWorker(warn, e)}
                                            className="btn-tactical btn-tactical-primary text-[0.62rem] py-1 px-2.5 shrink-0 flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                                            title="Dispatch nearest rescue unit to this worker's location"
                                        >
                                            <Truck className="w-3 h-3" />
                                            <span>SEND HELP 🚑</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom AI Status Bar */}
            <div className="p-2.5 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] text-[0.62rem] text-[var(--text-muted)] flex items-center justify-between">
                <span>MODEL: RESCUELINK HEURISTIC v2.4</span>
                <span className="text-[var(--safety-green)] font-semibold">REASONING NOMINAL</span>
            </div>
        </aside>
    );
};

export default IntelligencePanel;
