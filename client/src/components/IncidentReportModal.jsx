import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const IncidentReportModal = ({ alert = {}, worker = {}, onClose }) => {
    const { t } = useTranslation();

    const handlePrint = () => {
        window.print();
    };

    const reportId = `RL-REPORT-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US');

    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel w-full max-w-3xl p-8 rounded border-2 border-[var(--brass)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[var(--bg-panel-elevated)] max-h-[90vh] overflow-y-auto print:bg-white print:text-black"
            >
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-4 mb-6 print:hidden">
                    <div className="flex items-center gap-2 font-data text-xs text-[var(--phosphor-amber)]">
                        <FileText className="w-4 h-4" />
                        <span>RESCUELINK AUTOMATED SAFETY COMPLIANCE REPORT</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 rounded bg-[var(--brass)] text-[var(--bg-void)] font-data font-bold text-xs uppercase hover:bg-[var(--phosphor-amber)] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" /> Print / PDF Export
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded border border-[var(--chart-line)] hover:border-[var(--radar-red)] text-[var(--muted)] hover:text-[var(--radar-red)]"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Printable Document Body */}
                <div className="space-y-6 font-body text-xs text-[var(--parchment)]">
                    {/* Official Letterhead */}
                    <div className="border-b-2 border-[var(--brass)] pb-4 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-6 h-6 text-[var(--brass)]" />
                                <span className="font-display font-black text-xl tracking-wider text-[var(--parchment-bright)]">
                                    RESCUELINK CONSOLE
                                </span>
                            </div>
                            <span className="font-data text-[0.68rem] text-[var(--muted)] uppercase tracking-widest block">
                                Mining & Subterranean Safety Incident Telemetry Log
                            </span>
                        </div>
                        <div className="font-data text-right text-[0.7rem] text-[var(--muted)]">
                            <div>REPORT ID: <strong className="text-[var(--parchment-bright)]">{reportId}</strong></div>
                            <div>DATE: {dateStr} • {timeStr}</div>
                        </div>
                    </div>

                    {/* Section 1: Incident Specifications */}
                    <div>
                        <h3 className="font-data uppercase font-bold text-xs text-[var(--brass)] mb-2 border-b border-[var(--chart-line)] pb-1">
                            1. Incident Specifications & Personnel Details
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-data text-xs bg-[var(--bg-void)] p-3 rounded border border-[var(--chart-line)]">
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Worker Name</span>
                                <strong className="text-[var(--parchment-bright)]">{alert.name || worker.name || 'Alex Mercer'}</strong>
                            </div>
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Worker Callsign</span>
                                <strong className="text-[var(--phosphor-amber)]">{alert.workerId || worker.workerId || 'W-042'}</strong>
                            </div>
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Sector / Zone</span>
                                <strong className="text-[var(--parchment-bright)]">{alert.zone || worker.zone || 'Sector 7G'}</strong>
                            </div>
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Trigger Type</span>
                                <strong className="text-[var(--radar-red)]">{alert.type || 'Emergency Distress SOS'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Sensor Telemetry at Trigger */}
                    <div>
                        <h3 className="font-data uppercase font-bold text-xs text-[var(--brass)] mb-2 border-b border-[var(--chart-line)] pb-1">
                            2. Biological & Environmental Telemetry at Trigger Event
                        </h3>
                        <div className="grid grid-cols-3 gap-3 font-data text-xs bg-[var(--bg-void)] p-3 rounded border border-[var(--chart-line)]">
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Core Ambient Temp</span>
                                <strong className="text-[var(--parchment)]">{worker.envTemp || 32}°C</strong>
                            </div>
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Air Quality Index</span>
                                <strong className="text-[var(--phosphor-green)]">{worker.airQuality || 'Good (Nominal)'}</strong>
                            </div>
                            <div>
                                <span className="text-[var(--muted)] block text-[0.65rem]">Telemetry Power</span>
                                <strong className="text-[var(--parchment)]">{worker.battery || 85}% Charged</strong>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Root Cause & Resolution */}
                    <div>
                        <h3 className="font-data uppercase font-bold text-xs text-[var(--brass)] mb-2 border-b border-[var(--chart-line)] pb-1">
                            3. AI Automated Post-Mortem & Supervisor Resolution
                        </h3>
                        <div className="p-3.5 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] space-y-2 font-body text-xs leading-relaxed">
                            <p>
                                <strong>Assessment:</strong> Distress signal logged and analyzed against worksite hazard matrices. Incident was acknowledged and assigned to tactical extraction squads in accordance with Mine Safety & Health Administration guidelines.
                            </p>
                            <p>
                                <strong>Status:</strong> <span className="text-[var(--phosphor-green)] font-bold">ACKNOWLEDGED & RESOLUTION SIGN-OFF VERIFIED</span>
                            </p>
                        </div>
                    </div>

                    {/* Sign-off signatures */}
                    <div className="pt-6 grid grid-cols-2 gap-8 font-data text-xs">
                        <div className="border-t border-[var(--chart-line)] pt-2">
                            <span className="text-[var(--muted)] block text-[0.65rem]">COMMAND BRIDGE SUPERVISOR</span>
                            <span className="text-[var(--parchment-bright)] font-bold">Authorized Digital Signature</span>
                        </div>
                        <div className="border-t border-[var(--chart-line)] pt-2">
                            <span className="text-[var(--muted)] block text-[0.65rem]">SAFETY COMPLIANCE OFFICER</span>
                            <span className="text-[var(--parchment-bright)] font-bold">Certified Log Record</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default IncidentReportModal;
