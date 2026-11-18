import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Thermometer, Wind, Battery, ShieldAlert, Clock, MapPin, Radio, Activity, AlertOctagon } from 'lucide-react';
import { calculateWorkerRisk } from '../services/riskEngine';

const WorkerDigitalTwin = ({ worker = {}, hazards = [], onClose }) => {
    const risk = calculateWorkerRisk(worker, {}, hazards);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel w-full max-w-2xl p-6 rounded border-2 border-[var(--brass)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[var(--bg-panel-elevated)] max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-[var(--brass)] bg-[rgba(201,166,107,0.12)] flex items-center justify-center text-[var(--brass)] font-bold text-lg">
                            👥
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold font-display text-[var(--parchment-bright)]">
                                    {worker.name}
                                </h2>
                                <span className="px-2 py-0.5 rounded font-data text-xs border border-[var(--chart-line)] bg-[var(--bg-void)] text-[var(--phosphor-amber)]">
                                    {worker.workerId}
                                </span>
                            </div>
                            <span className="text-[0.65rem] font-data text-[var(--muted)] uppercase tracking-wider">
                                Real-Time Worker Digital Twin & Biometrics
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded border border-[var(--chart-line)] hover:border-[var(--radar-red)] text-[var(--muted)] hover:text-[var(--radar-red)] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tactical Status Banner */}
                <div className="grid grid-cols-3 gap-3 mb-5 font-data text-xs">
                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)]">
                        <span className="text-[0.65rem] text-[var(--muted)] uppercase block mb-1">Assigned Sector</span>
                        <div className="flex items-center gap-1.5 font-bold text-[var(--parchment)]">
                            <MapPin className="w-3.5 h-3.5 text-[var(--brass)]" />
                            {worker.zone || 'Zone Unassigned'}
                        </div>
                    </div>
                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)]">
                        <span className="text-[0.65rem] text-[var(--muted)] uppercase block mb-1">Active Shift Duration</span>
                        <div className="flex items-center gap-1.5 font-bold text-[var(--parchment)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--phosphor-amber)]" />
                            3h 42m Active
                        </div>
                    </div>
                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)]">
                        <span className="text-[0.65rem] text-[var(--muted)] uppercase block mb-1">Telemetry Signal</span>
                        <div className="flex items-center gap-1.5 font-bold text-[var(--phosphor-green)]">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            {worker.connectivity || 'Online'} (98%)
                        </div>
                    </div>
                </div>

                {/* Real-time Biological & Environmental Gauges */}
                <h3 className="font-display font-bold text-sm text-[var(--parchment-bright)] mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--brass)]" /> Live Sensor Telemetry
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex flex-col items-center">
                        <Heart className="w-5 h-5 text-[var(--radar-red)] mb-1 animate-pulse" />
                        <span className="font-data font-bold text-lg text-[var(--parchment-bright)]">
                            {worker.heartRate || 76} <span className="text-xs font-normal text-[var(--muted)]">BPM</span>
                        </span>
                        <span className="text-[0.6rem] font-data text-[var(--muted)] uppercase">Heart Rate</span>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex flex-col items-center">
                        <Thermometer className="w-5 h-5 text-[var(--phosphor-amber)] mb-1" />
                        <span className="font-data font-bold text-lg text-[var(--parchment-bright)]">
                            {worker.envTemp || 28}°C
                        </span>
                        <span className="text-[0.6rem] font-data text-[var(--muted)] uppercase">Core Temp</span>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex flex-col items-center">
                        <Wind className="w-5 h-5 text-[var(--phosphor-green)] mb-1" />
                        <span className="font-data font-bold text-lg text-[var(--phosphor-green)]">
                            {worker.airQuality || 'Good'}
                        </span>
                        <span className="text-[0.6rem] font-data text-[var(--muted)] uppercase">Atmosphere</span>
                    </div>

                    <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex flex-col items-center">
                        <Battery className="w-5 h-5 text-[var(--brass)] mb-1" />
                        <span className="font-data font-bold text-lg text-[var(--parchment-bright)]">
                            {worker.battery || 85}%
                        </span>
                        <span className="text-[0.6rem] font-data text-[var(--muted)] uppercase">Battery Pack</span>
                    </div>
                </div>

                {/* AI Risk Assessment Card */}
                <div className={`p-4 rounded border mb-5 ${risk.level === 'CRITICAL' ? 'border-[var(--radar-red)] bg-[rgba(255,92,92,0.12)]' : risk.level === 'HIGH' ? 'border-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.1)]' : 'border-[var(--brass)] bg-[var(--bg-void)]'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-data text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-[var(--brass)]" />
                            AI Safety Risk Evaluation
                        </span>
                        <span className="font-data font-black text-sm px-2.5 py-0.5 rounded border border-current">
                            SCORE: {risk.score}/100 [{risk.level}]
                        </span>
                    </div>
                    <div className="space-y-1 my-2 text-xs font-data text-[var(--parchment)]">
                        <p><strong>Primary Factor:</strong> {risk.factors[0]}</p>
                        <p><strong>AI Recommendation:</strong> <span className="text-[var(--phosphor-amber)]">{risk.recommendation}</span></p>
                    </div>
                </div>

                {/* Shift Cumulative Exposure */}
                <div className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] font-data text-xs space-y-2">
                    <span className="text-[0.65rem] text-[var(--muted)] uppercase tracking-wider block font-bold">
                        Shift Cumulative Exposure Profile (OSHA / Thresholds)
                    </span>
                    <div className="space-y-1.5">
                        <div>
                            <div className="flex justify-between text-[0.7rem] mb-0.5">
                                <span>Thermal Index (Max 40°C-hr)</span>
                                <span>24.5°C-hr (Normal)</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--bg-panel)] rounded overflow-hidden">
                                <div className="h-full bg-[var(--phosphor-green)]" style={{ width: '55%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[0.7rem] mb-0.5">
                                <span>Gas Concentration Limit (8hr TWA)</span>
                                <span>12 PPM / 50 PPM</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--bg-panel)] rounded overflow-hidden">
                                <div className="h-full bg-[var(--phosphor-amber)]" style={{ width: '24%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WorkerDigitalTwin;
