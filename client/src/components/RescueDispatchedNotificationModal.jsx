import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Navigation, Clock, MapPin, Radio, Shield, X, Mic } from 'lucide-react';
import { soundService } from '../services/soundService';

export const RescueDispatchedNotificationModal = ({
    dispatchData = null,
    onClose = () => { },
    onOpenVoice = () => { }
}) => {
    const [secondsRemaining, setSecondsRemaining] = useState(
        (dispatchData?.etaMinutes || 2) * 60
    );

    useEffect(() => {
        if (!dispatchData) return;
        soundService.playAcknowledge();
        const timer = setInterval(() => {
            setSecondsRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [dispatchData]);

    if (!dispatchData) return null;

    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const teamName = dispatchData.teamName || 'Rapid Response Team Beta';
    const lead = dispatchData.lead || 'Alexandre';
    const zone = dispatchData.zone || 'Tunnel B // Sector 7G';
    const lat = dispatchData.lat || 51.505;
    const lng = dispatchData.lng || -0.09;
    const distanceMeters = dispatchData.distanceMeters || 180;
    const safeCorridor = dispatchData.safeCorridor || 'Primary Surface Shaft Gate Alpha';

    return (
        <div className="fixed inset-0 z-[1100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-200 font-data">
            <div className="w-full max-w-lg bg-[var(--bg-panel)] border-2 border-[var(--safety-cyan)] rounded-xl shadow-[0_0_40px_rgba(0,229,255,0.4)] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-b border-[var(--safety-cyan)] px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(0,229,255,0.15)] border-2 border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-[var(--safety-green)] font-bold tracking-widest uppercase block flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[var(--safety-green)] animate-ping"></span>
                                RESCUE FORCE DISPATCHED
                            </span>
                            <h2 className="text-base font-bold text-[var(--text-bright)] tracking-wide">
                                RESCUE TEAM IS ON THE WAY!
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            onClose();
                        }}
                        className="text-[var(--text-muted)] hover:text-white cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Telemetry & Location Body */}
                <div className="p-5 space-y-4 text-xs">
                    {/* ETA Countdown Clock */}
                    <div className="p-4 rounded-lg bg-[rgba(0,229,255,0.06)] border border-[var(--safety-cyan)] flex items-center justify-between">
                        <div>
                            <span className="text-[0.68rem] text-[var(--text-muted)] uppercase block">ESTIMATED TIME OF ARRIVAL</span>
                            <span className="text-2xl font-bold text-[var(--safety-cyan)] font-mono tracking-tight">
                                {formatCountdown(secondsRemaining)}
                            </span>
                            <span className="text-[0.62rem] text-[var(--text-secondary)] block mt-0.5">
                                Speed: ~1.5 m/s • Straight Evacuation Vector
                            </span>
                        </div>

                        <div className="text-right">
                            <span className="text-[0.68rem] text-[var(--text-muted)] uppercase block">PROXIMITY DISTANCE</span>
                            <span className="text-xl font-bold text-[var(--safety-green)] font-mono">
                                {distanceMeters} m
                            </span>
                            <span className="text-[0.62rem] text-[var(--safety-green)] block mt-0.5 font-bold">
                                CLOSING IN
                            </span>
                        </div>
                    </div>

                    {/* Team & Officer Details */}
                    <div className="p-3.5 rounded-lg bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] space-y-2">
                        <div className="text-[0.68rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            ASSIGNED TACTICAL RESCUE UNIT
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-primary)]">{teamName}</span>
                            <span className="text-[0.65rem] px-2 py-0.5 rounded bg-[rgba(16,185,129,0.15)] text-[var(--safety-green)] font-bold border border-[rgba(16,185,129,0.3)]">
                                EN ROUTE 🚑
                            </span>
                        </div>

                        <div className="text-[0.68rem] text-[var(--text-secondary)]">
                            Squad Lead: <strong className="text-[var(--text-primary)]">{lead}</strong> • Emergency Medical Technicians on board
                        </div>
                    </div>

                    {/* Exact Location & Coordinates Details */}
                    <div className="p-3.5 rounded-lg bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] space-y-2">
                        <div className="text-[0.68rem] text-[var(--safety-amber)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            TARGET OPERATOR RESCUE COORDINATES
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                            <div>
                                <span className="text-[0.62rem] text-[var(--text-muted)] block">SECTOR / ZONE</span>
                                <strong className="text-[var(--text-primary)]">{zone}</strong>
                            </div>
                            <div>
                                <span className="text-[0.62rem] text-[var(--text-muted)] block">GPS FIX</span>
                                <strong className="text-[var(--safety-cyan)] font-mono">{lat.toFixed(4)}°N, {Math.abs(lng).toFixed(4)}°W</strong>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--grid-line)] text-[0.68rem] text-[var(--text-secondary)]">
                            Safe Egress Corridor: <strong className="text-[var(--safety-green)]">{safeCorridor}</strong>
                        </div>
                    </div>

                    {/* Safety Guidance */}
                    <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.3)] text-[0.7rem] text-[var(--safety-green)] leading-relaxed">
                        ✓ <strong>Guidance</strong>: Stay in designated safe perimeter or move towards <strong>{safeCorridor}</strong> if air remains breathable. Live transponder pinging every 1.5s.
                    </div>
                </div>

                {/* Footer Operational Controls */}
                <div className="p-4 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] flex items-center justify-between gap-3">
                    <button
                        onClick={() => {
                            soundService.playClick();
                            onOpenVoice();
                        }}
                        className="btn-tactical text-xs py-2 px-3 text-[var(--safety-cyan)] flex items-center gap-1.5 cursor-pointer"
                    >
                        <Mic className="w-3.5 h-3.5" />
                        <span>OPEN LIVE VOICE COMMS</span>
                    </button>

                    <button
                        onClick={() => {
                            soundService.playAcknowledge();
                            onClose();
                        }}
                        className="btn-tactical btn-tactical-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>UNDERSTOOD // STANDING BY</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescueDispatchedNotificationModal;
