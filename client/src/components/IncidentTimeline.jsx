import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle, Radio, Truck, Activity } from 'lucide-react';

export const INITIAL_TIMELINE_EVENTS = [
    { id: 1, time: '11:15:08', workerId: 'W-042', zone: 'Sector 7G', type: 'ZONE_ENTRY', text: 'Worker W-042 entered Sector 7G', severity: 'INFO' },
    { id: 2, time: '11:22:15', workerId: 'W-011', zone: 'Tunnel B', type: 'PREDICTIVE_WARNING', text: 'Air quality in Tunnel B deteriorating (+18% PPM)', severity: 'WARNING' },
    { id: 3, time: '11:24:30', workerId: 'W-011', zone: 'Tunnel B', type: 'RISK_SCORE_CHANGE', text: 'Worker W-011 Risk Score escalated to 65 (HIGH)', severity: 'WARNING' },
    { id: 4, time: '11:27:00', workerId: 'W-042', zone: 'Deep Shaft 3', type: 'TELEMETRY_SYNC', text: 'Telemetry beacon heartbeat verified (98% packet receipt)', severity: 'INFO' }
];

export const IncidentTimeline = ({ events = INITIAL_TIMELINE_EVENTS, activeAlert = null }) => {
    return (
        <div className="w-full h-full p-3 font-data text-xs overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--grid-line)] pb-2">
                <span className="text-[0.7rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    AUDIT LOG & INCIDENT TIMELINE
                </span>
                <span className="text-[0.62rem] text-[var(--text-muted)]">
                    TOTAL EVENTS: {events.length}
                </span>
            </div>

            <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--grid-line)]">
                {events.map((evt) => {
                    let dotColor = 'bg-[var(--safety-cyan)]';
                    let badgeBg = 'bg-[rgba(0,229,255,0.12)] text-[var(--safety-cyan)]';

                    if (evt.severity === 'CRITICAL' || evt.type === 'SOS_TRIGGERED') {
                        dotColor = 'bg-[var(--safety-red)] animate-ping';
                        badgeBg = 'bg-[rgba(239,68,68,0.2)] text-[var(--safety-red)] font-bold';
                    } else if (evt.severity === 'WARNING' || evt.type === 'PREDICTIVE_WARNING') {
                        dotColor = 'bg-[var(--safety-amber)]';
                        badgeBg = 'bg-[rgba(245,158,11,0.2)] text-[var(--safety-amber)] font-bold';
                    } else if (evt.type === 'RESOLVED' || evt.type === 'SAFE') {
                        dotColor = 'bg-[var(--safety-green)]';
                        badgeBg = 'bg-[rgba(16,185,129,0.2)] text-[var(--safety-green)]';
                    }

                    return (
                        <div key={evt.id} className="relative pl-2">
                            {/* Dot Marker on Timeline Rail */}
                            <span className={`absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full ${dotColor} border border-[var(--bg-panel)]`}></span>

                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[0.65rem] text-[var(--text-muted)] font-mono">
                                    {evt.time}
                                </span>
                                <span className={`text-[0.6rem] px-1.5 py-0.2 rounded uppercase ${badgeBg}`}>
                                    {evt.type}
                                </span>
                            </div>

                            <p className="text-[0.72rem] text-[var(--text-primary)] font-medium mt-0.5">
                                {evt.text}
                            </p>

                            {evt.workerId && (
                                <div className="text-[0.62rem] text-[var(--text-muted)] mt-0.5">
                                    Target: <strong className="text-[var(--text-secondary)]">{evt.workerId}</strong> {evt.zone ? `• Zone: ${evt.zone}` : ''}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default IncidentTimeline;
