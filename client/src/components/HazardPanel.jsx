import React, { useState } from 'react';
import { Flame, AlertTriangle, Wind, Thermometer, PlusCircle, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createSimulatedHazard } from '../services/hazardService';

const HazardPanel = ({ hazards = [], onAddHazard, onResolveHazard }) => {
    const { t } = useTranslation();
    const [simType, setSimType] = useState('Gas Spike');

    const handleSimulate = () => {
        const hazard = createSimulatedHazard(
            simType === 'Gas Spike' ? 'Toxic Gas Surge (CH4)' : simType === 'Fire' ? 'Thermal Fire Flare' : 'Ventilation Failure (CO)',
            simType === 'Fire' ? 'CRITICAL' : 'HIGH',
            'Sector 7G (Sub-Level 2)'
        );
        onAddHazard(hazard);
    };

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'CRITICAL':
                return 'border-[var(--radar-red)] text-[var(--radar-red)] bg-[rgba(255,92,92,0.15)] glow-danger animate-pulse';
            case 'HIGH':
                return 'border-[var(--phosphor-amber)] text-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.12)] glow-warning';
            case 'CAUTION':
                return 'border-[#ffeb3b] text-[#ffeb3b] bg-[rgba(255,235,59,0.1)]';
            default:
                return 'border-[var(--phosphor-green)] text-[var(--phosphor-green)] bg-[rgba(107,203,119,0.1)]';
        }
    };

    return (
        <div className="glass-panel p-5 rounded border border-[var(--brass)] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-3 mb-4">
                <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[var(--phosphor-amber)]" />
                    <h3 className="font-display font-bold text-base text-[var(--parchment-bright)]">
                        {t("Atmospheric & Site Hazards")}
                    </h3>
                </div>
                <span className="font-data text-xs px-2 py-0.5 rounded border border-[var(--chart-line)] bg-[var(--bg-void)] text-[var(--phosphor-amber)]">
                    {hazards.length} ACTIVE
                </span>
            </div>

            {/* Active Hazard List */}
            <div className="space-y-3 max-h-56 overflow-y-auto mb-5 pr-1">
                {hazards.length === 0 ? (
                    <div className="py-6 text-center text-xs font-data text-[var(--muted)] flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-[var(--phosphor-green)] mb-1.5 opacity-80" />
                        <span>No environmental hazards detected in perimeter.</span>
                    </div>
                ) : (
                    hazards.map((h) => (
                        <div
                            key={h.id}
                            className="bg-[var(--bg-void)] p-3 rounded border border-[var(--chart-line)] flex items-center justify-between hover:border-[var(--brass)] transition-colors"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded font-data text-[0.65rem] font-bold border ${getSeverityBadge(h.severity)}`}>
                                        {h.severity}
                                    </span>
                                    <strong className="text-xs font-body text-[var(--parchment-bright)]">{h.type}</strong>
                                    {h.isSimulated && (
                                        <span className="text-[0.6rem] font-data text-[var(--muted)] px-1 border border-[var(--chart-line)] rounded">
                                            DEMO
                                        </span>
                                    )}
                                </div>
                                <div className="font-data text-[0.7rem] text-[var(--muted)] flex items-center gap-3">
                                    <span>Zone: <strong className="text-[var(--parchment)]">{h.zone}</strong></span>
                                    <span>Reading: <strong className="text-[var(--phosphor-amber)]">{h.reading}</strong></span>
                                </div>
                            </div>

                            <button
                                onClick={() => onResolveHazard(h.id)}
                                className="px-2.5 py-1 rounded border border-[var(--chart-line)] hover:border-[var(--phosphor-green)] hover:text-[var(--phosphor-green)] text-[var(--muted)] font-data text-[0.65rem] uppercase tracking-wider transition-colors cursor-pointer"
                                title="Neutralize / Clear Hazard"
                            >
                                Resolve
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Clearly labeled Demo / Simulation Mode Trigger */}
            <div className="pt-3 border-t border-[var(--chart-line)] bg-[rgba(201,166,107,0.03)] p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.65rem] font-data text-[var(--phosphor-amber)] uppercase tracking-wider flex items-center gap-1 font-bold">
                        <ShieldAlert className="w-3 h-3 text-[var(--phosphor-amber)]" />
                        [DEMO / SIMULATION DATA]
                    </span>
                    <span className="text-[0.6rem] font-data text-[var(--muted)]">Hardware Injection Mock</span>
                </div>
                <div className="flex gap-2">
                    <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value)}
                        className="bg-[var(--bg-void)] border border-[var(--chart-line)] rounded px-2 py-1 text-xs font-data text-[var(--parchment)] focus:outline-none focus:border-[var(--brass)] flex-1"
                    >
                        <option value="Gas Spike">Methane Gas Leak (64 PPM)</option>
                        <option value="Fire">Thermal Flare Outbreak</option>
                        <option value="CO">Carbon Monoxide Surge (CO)</option>
                    </select>
                    <button
                        onClick={handleSimulate}
                        className="px-3 py-1 bg-[var(--brass)] text-[var(--bg-void)] font-data font-bold text-xs uppercase rounded hover:bg-[var(--phosphor-amber)] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Inject Hazard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HazardPanel;
