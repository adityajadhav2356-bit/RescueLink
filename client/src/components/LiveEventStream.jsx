import React from 'react';
import { Activity, AlertTriangle, ShieldAlert, CheckCircle2, User, Radio, ArrowRight } from 'lucide-react';
import { soundService } from '../services/soundService';

export const LiveEventStream = ({
    events = [],
    onInspectWorker = () => { },
    onInspectEvent = () => { }
}) => {
    return (
        <div className="w-full h-full p-3 font-data text-xs overflow-y-auto">
            <div className="flex items-center justify-between mb-2 border-b border-[var(--grid-line)] pb-2">
                <span className="text-[0.7rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    LIVE EVENT TELEMETRY STREAM
                </span>
                <span className="text-[0.62rem] text-[var(--safety-green)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--safety-green)] animate-ping"></span>
                    <span>STREAM REALTIME</span>
                </span>
            </div>

            <div className="space-y-1.5">
                {events.map((evt) => {
                    const isCritical = evt.severity === 'CRITICAL';
                    const isWarning = evt.severity === 'WARNING';

                    return (
                        <div
                            key={evt.id}
                            className={`p-2 rounded border flex items-center justify-between gap-3 transition-colors ${isCritical
                                ? 'bg-[rgba(239,68,68,0.12)] border-[var(--safety-red)]'
                                : isWarning
                                    ? 'bg-[rgba(245,158,11,0.08)] border-[var(--safety-amber)]'
                                    : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] hover:border-[var(--safety-cyan)]'
                                }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[0.65rem] text-[var(--text-muted)] font-mono shrink-0">
                                    {evt.time}
                                </span>
                                <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCritical ? 'bg-[var(--safety-red)] animate-ping' : isWarning ? 'bg-[var(--safety-amber)]' : 'bg-[var(--safety-cyan)]'
                                        }`}
                                ></span>
                                <div className="truncate">
                                    <span className="font-bold text-xs text-[var(--text-primary)] mr-1.5">
                                        [{evt.workerId || 'SYSTEM'}]
                                    </span>
                                    <span className="text-[0.7rem] text-[var(--text-secondary)]">
                                        {evt.text}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    soundService.playClick();
                                    onInspectEvent(evt);
                                }}
                                className="text-[0.65rem] text-[var(--safety-cyan)] hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
                            >
                                <span>INSPECT</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveEventStream;
