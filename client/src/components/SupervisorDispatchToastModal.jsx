import React from 'react';
import { Truck, CheckCircle2, Navigation, MapPin, Shield, X, Radio, ArrowRight } from 'lucide-react';
import { soundService } from '../services/soundService';

export const SupervisorDispatchToastModal = ({
    dispatchData = null,
    onClose = () => { },
    onFocusMap = () => { }
}) => {
    if (!dispatchData) return null;

    const workerId = dispatchData.workerId || 'W-042';
    const workerName = dispatchData.workerName || 'Alex Mercer';
    const zone = dispatchData.zone || 'Tunnel B // Sector 7G';
    const lat = dispatchData.lat || 51.505;
    const lng = dispatchData.lng || -0.09;
    const teamName = dispatchData.teamName || 'Rapid Response Team Beta';
    const lead = dispatchData.lead || 'Alexandre';
    const distanceMeters = dispatchData.distanceMeters || 180;
    const etaMinutes = dispatchData.etaMinutes || 2;
    const safeCorridor = dispatchData.safeCorridor || 'Primary Surface Shaft Gate Alpha Corridor';

    return (
        <div className="fixed top-16 right-6 z-[1200] w-full max-w-md bg-[var(--bg-panel)] border-2 border-[var(--safety-cyan)] rounded-lg shadow-[0_0_35px_rgba(0,229,255,0.35)] overflow-hidden font-data text-xs animate-in slide-in-from-top-4 duration-200 select-none">
            {/* Header */}
            <div className="bg-[rgba(0,229,255,0.15)] border-b border-[var(--safety-cyan)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--safety-cyan)] text-black flex items-center justify-center font-bold animate-pulse">
                        <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <div className="font-bold text-xs text-[var(--text-bright)] flex items-center gap-1.5">
                            <span>RESCUE FORCE DISPATCHED</span>
                            <span className="w-2 h-2 rounded-full bg-[var(--safety-green)] animate-ping"></span>
                        </div>
                        <div className="text-[0.62rem] text-[var(--safety-cyan)]">
                            EN ROUTE TO {workerId} ({workerName.toUpperCase()})
                        </div>
                    </div>
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

            {/* Target Location Details */}
            <div className="p-4 space-y-3">
                <div className="p-3 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] space-y-2">
                    <div className="text-[0.65rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        TARGET LOCATION & GPS TELEMETRY
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                        <div>
                            <span className="text-[0.62rem] text-[var(--text-muted)] block">SECTOR / ZONE</span>
                            <strong className="text-[var(--text-primary)]">{zone}</strong>
                        </div>
                        <div>
                            <span className="text-[0.62rem] text-[var(--text-muted)] block">GPS COORDINATES</span>
                            <strong className="text-[var(--safety-cyan)] font-mono">{lat.toFixed(4)}°N, {Math.abs(lng).toFixed(4)}°W</strong>
                        </div>
                        <div>
                            <span className="text-[0.62rem] text-[var(--text-muted)] block">SECTOR DISTANCE</span>
                            <strong className="text-[var(--safety-green)] font-mono">{distanceMeters} meters</strong>
                        </div>
                        <div>
                            <span className="text-[0.62rem] text-[var(--text-muted)] block">ESTIMATED ETA</span>
                            <strong className="text-[var(--safety-green)] font-mono">~{etaMinutes} minutes</strong>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--grid-line)] text-[0.68rem] text-[var(--text-secondary)]">
                        Designated Access Route: <strong className="text-[var(--safety-cyan)]">{safeCorridor}</strong>
                    </div>
                </div>

                <div className="p-2.5 rounded bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.3)] text-[0.68rem] text-[var(--safety-green)] flex items-center justify-between">
                    <span>UNIT: <strong>{teamName}</strong> (Lead: {lead})</span>
                    <span className="font-bold">STATUS: DEPLOYED</span>
                </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] flex items-center justify-between">
                <span className="text-[0.62rem] text-[var(--text-muted)]">
                    WORKER SCREEN UPDATED VIA WEBSOCKET
                </span>
                <button
                    onClick={() => {
                        soundService.playClick();
                        onClose();
                    }}
                    className="btn-tactical btn-tactical-primary text-[0.65rem] py-1 px-3"
                >
                    ACKNOWLEDGE & CLOSE
                </button>
            </div>
        </div>
    );
};

export default SupervisorDispatchToastModal;
