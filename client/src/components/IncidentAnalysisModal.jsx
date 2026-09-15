import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, AlertOctagon, CheckCircle2, FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateAIIncidentAnalysis } from '../services/incidentAnalysis';

const IncidentAnalysisModal = ({ alert = {}, worker = {}, onClose }) => {
    const { t } = useTranslation();
    const analysis = generateAIIncidentAnalysis(alert, worker);

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel w-full max-w-2xl p-6 rounded border-2 border-[var(--brass)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[var(--bg-panel-elevated)] max-h-[88vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.15)] flex items-center justify-center text-[var(--phosphor-amber)] font-bold text-lg shadow-[0_0_12px_var(--phosphor-amber-glow)]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold font-display text-[var(--parchment-bright)]">
                                    AI Incident Analysis & Post-Mortem
                                </h2>
                                <span className="font-data text-xs px-2 py-0.5 rounded border border-[var(--radar-red)] text-[var(--radar-red)] bg-[rgba(255,92,92,0.1)]">
                                    {analysis.incidentId}
                                </span>
                            </div>
                            <span className="text-[0.65rem] font-data text-[var(--muted)] uppercase tracking-wider">
                                Automated Root-Cause & Tactical Response Reasoning
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded border border-[var(--chart-line)] hover:border-[var(--radar-red)] text-[var(--muted)] hover:text-[var(--radar-red)] cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Incident Overview Card */}
                <div className="p-4 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] mb-5 font-data text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-[var(--chart-line)] pb-2">
                        <span className="text-[var(--muted)]">Target Subject: <strong className="text-[var(--parchment-bright)]">{analysis.worker}</strong></span>
                        <span className="text-[var(--muted)]">Zone: <strong className="text-[var(--phosphor-amber)]">{analysis.zone}</strong></span>
                    </div>
                    <p className="text-sm font-body text-[var(--parchment)] leading-relaxed pt-1">
                        {analysis.summary}
                    </p>
                </div>

                {/* Root Cause & Contributing Factors */}
                <div className="mb-5 space-y-2">
                    <h3 className="font-display font-bold text-sm text-[var(--parchment-bright)] flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-[var(--radar-red)]" />
                        Probable Root Cause & Trigger Mechanism
                    </h3>
                    <div className="p-3.5 rounded bg-[rgba(255,92,92,0.06)] border border-[var(--radar-red)] text-xs font-body text-[var(--parchment)]">
                        {analysis.possibleCause}
                    </div>
                </div>

                {/* Recommended Response Protocol */}
                <div className="mb-5 space-y-2">
                    <h3 className="font-display font-bold text-sm text-[var(--parchment-bright)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[var(--phosphor-green)]" />
                        Recommended Corrective Protocol for Command
                    </h3>
                    <div className="space-y-1.5">
                        {analysis.recommendedActions.map((rec, i) => (
                            <div key={i} className="p-2.5 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] font-data text-xs flex items-start gap-2">
                                <span className="text-[var(--brass)] font-bold">0{i + 1}.</span>
                                <span>{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 mb-6">
                    <h3 className="font-display font-bold text-sm text-[var(--parchment-bright)]">
                        Incident Telemetry Sequence Timeline
                    </h3>
                    <div className="space-y-1.5 font-data text-xs">
                        {analysis.timeline.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded bg-[var(--bg-void)] border border-[var(--chart-line)]">
                                <span className="text-[var(--phosphor-amber)] font-bold w-12">{t.time}</span>
                                <span className="text-[var(--parchment)]">{t.event}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default IncidentAnalysisModal;
