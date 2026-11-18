import React, { useState } from 'react';
import { Radio, AlertOctagon, Send, Volume2, X, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

export const TEMPLATES = [
    { label: 'Tunnel Evacuation', text: '⚠️ EMERGENCY NOTICE: Evacuate Tunnel B immediately. Follow designated Exit Shaft Alpha.' },
    { label: 'Toxic Gas Alert', text: '🛑 HAZARDOUS GAS DETECTED: Put on SCBA breathing apparatus and move to elevated muster points.' },
    { label: 'Thermal Stress Advisory', text: '🌡️ THERMAL ALERT: High ambient heat detected. Mandatory 15-minute cooling & hydration cycle.' },
    { label: 'All-Clear Resumption', text: '✅ ALL-CLEAR: Hazardous conditions mitigated. Resume standard shift operations with caution.' }
];

export const EmergencyBroadcastModal = ({
    workers = [],
    onSendBroadcast = () => { },
    onClose = () => { }
}) => {
    const [targetScope, setTargetScope] = useState('ALL'); // 'ALL' | 'ZONE' | 'WORKER'
    const [selectedZone, setSelectedZone] = useState('Tunnel B');
    const [selectedWorkerId, setSelectedWorkerId] = useState('W-042');
    const [message, setMessage] = useState(TEMPLATES[0].text);
    const [sentSuccess, setSentSuccess] = useState(false);

    const zones = ['Sector 7G', 'Tunnel B', 'Deep Shaft 3', 'Sub-station Alpha'];

    const handleSend = () => {
        soundService.playEmergencyAlarm();
        onSendBroadcast({
            targetScope,
            target: targetScope === 'ALL' ? 'ALL_WORKERS' : targetScope === 'ZONE' ? selectedZone : selectedWorkerId,
            message,
            timestamp: new Date().toISOString()
        });
        setSentSuccess(true);
        setTimeout(() => {
            setSentSuccess(false);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
            <div className="w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--safety-amber)] rounded-lg shadow-2xl overflow-hidden font-data text-xs flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--safety-amber)] font-bold text-sm">
                        <Radio className="w-4.5 h-4.5 animate-pulse" />
                        <span>EMERGENCY TACTICAL BROADCAST TRANSMITTER</span>
                    </div>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            onClose();
                        }}
                        className="text-[var(--text-muted)] hover:text-white cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3.5">
                    {/* Target Scope Selector */}
                    <div>
                        <label className="text-[0.68rem] text-[var(--text-muted)] uppercase block mb-1.5 font-bold">
                            BROADCAST TARGET SCOPE
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => { soundService.playClick(); setTargetScope('ALL'); }}
                                className={`p-2 rounded border text-center transition-all cursor-pointer ${targetScope === 'ALL'
                                    ? 'bg-[rgba(239,68,68,0.2)] border-[var(--safety-red)] text-[var(--safety-red)] font-bold'
                                    : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                📢 SITE-WIDE (ALL)
                            </button>

                            <button
                                type="button"
                                onClick={() => { soundService.playClick(); setTargetScope('ZONE'); }}
                                className={`p-2 rounded border text-center transition-all cursor-pointer ${targetScope === 'ZONE'
                                    ? 'bg-[rgba(245,158,11,0.2)] border-[var(--safety-amber)] text-[var(--safety-amber)] font-bold'
                                    : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                📍 SECTOR / ZONE
                            </button>

                            <button
                                type="button"
                                onClick={() => { soundService.playClick(); setTargetScope('WORKER'); }}
                                className={`p-2 rounded border text-center transition-all cursor-pointer ${targetScope === 'WORKER'
                                    ? 'bg-[rgba(0,229,255,0.2)] border-[var(--safety-cyan)] text-[var(--safety-cyan)] font-bold'
                                    : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                👷 SINGLE WORKER
                            </button>
                        </div>
                    </div>

                    {/* Conditional Dropdown for Zone or Worker */}
                    {targetScope === 'ZONE' && (
                        <div>
                            <label className="text-[0.68rem] text-[var(--text-muted)] uppercase block mb-1">
                                SELECT MONITORED SECTOR
                            </label>
                            <select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="w-full bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] text-[var(--text-primary)] rounded p-2 text-xs focus:border-[var(--safety-cyan)]"
                            >
                                {zones.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                    )}

                    {targetScope === 'WORKER' && (
                        <div>
                            <label className="text-[0.68rem] text-[var(--text-muted)] uppercase block mb-1">
                                SELECT OPERATOR TRANSPONDER
                            </label>
                            <select
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                className="w-full bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] text-[var(--text-primary)] rounded p-2 text-xs focus:border-[var(--safety-cyan)]"
                            >
                                {workers.map(w => (
                                    <option key={w.workerId} value={w.workerId}>
                                        {w.workerId} - {w.name} ({w.zone})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Pre-set Fast Templates */}
                    <div>
                        <label className="text-[0.68rem] text-[var(--text-muted)] uppercase block mb-1">
                            PRESET TACTICAL MESSAGES
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {TEMPLATES.map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        soundService.playClick();
                                        setMessage(tmpl.text);
                                    }}
                                    className="p-1.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] hover:border-[var(--safety-cyan)] text-left text-[0.65rem] text-[var(--text-secondary)] hover:text-white truncate cursor-pointer"
                                >
                                    {tmpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div>
                        <label className="text-[0.68rem] text-[var(--text-muted)] uppercase block mb-1">
                            TRANSMISSION TEXT
                        </label>
                        <textarea
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] rounded p-2 text-[var(--text-primary)] font-data text-xs focus:outline-none focus:border-[var(--safety-cyan)]"
                            placeholder="Enter emergency instructions..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] flex items-center justify-between">
                    <span className="text-[0.62rem] text-[var(--text-muted)]">
                        RELAY: HIGH-FREQUENCY MESH AUDIO BROADCAST
                    </span>

                    <button
                        onClick={handleSend}
                        className={`btn-tactical text-xs px-4 py-2 font-bold flex items-center gap-1.5 ${sentSuccess
                            ? 'bg-[var(--safety-green)] text-black'
                            : 'btn-tactical-danger'
                            }`}
                    >
                        {sentSuccess ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>TRANSMITTED TO MESH</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                <span>TRANSMIT BROADCAST NOW</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmergencyBroadcastModal;
