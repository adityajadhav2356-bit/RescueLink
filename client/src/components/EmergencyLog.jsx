import React from 'react';
import { AlertOctagon, CheckCircle2, Clock, Sparkles, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmergencyLog = ({ logs = [], onAcknowledge = null, onAnalyze = null, onGenerateReport = null }) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel rounded p-5 h-[380px] overflow-y-auto border border-[var(--brass)] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <h3 className="text-base font-bold font-display mb-3 flex items-center gap-2 text-[var(--parchment-bright)] border-b border-[var(--chart-line)] pb-2.5">
                <AlertOctagon className="text-[var(--radar-red)] w-4 h-4 animate-pulse" />
                {t("Emergency Telemetry Alerts")}
            </h3>
            <div className="space-y-3 mt-3">
                {logs.length === 0 ? (
                    <div className="text-center text-[var(--muted)] py-12 flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 text-[var(--phosphor-green)] mb-2 opacity-80" />
                        <p className="font-data text-xs">{t("No critical alerts today. All systems nominal.")}</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="bg-[var(--bg-void)] p-3.5 rounded border border-[var(--chart-line)] border-l-4 border-l-[var(--radar-red)] hover:border-[var(--brass)] transition-colors">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="font-bold font-data text-xs text-[var(--radar-red)] flex items-center gap-1.5 uppercase">
                                    <AlertOctagon className="w-3.5 h-3.5" />
                                    {t(log.type)}
                                </span>
                                <span className="text-[0.68rem] font-data text-[var(--muted)] flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[var(--phosphor-amber)]" />
                                    {new Date(log.time).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-[var(--parchment-bright)] mb-0.5 font-body">
                                {t("Worker:")} {log.name} <span className="font-data text-[var(--phosphor-amber)]">({log.workerId})</span>
                            </p>
                            <p className="text-[0.7rem] font-data text-[var(--muted)]">{t("Location:")} {log.zone}</p>
                            <div className="mt-3 pt-2 border-t border-[var(--chart-line)] flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-data text-[0.65rem]">
                                    {onAnalyze && (
                                        <button
                                            onClick={() => onAnalyze(log)}
                                            className="px-2 py-0.5 rounded border border-[var(--brass)] text-[var(--brass)] hover:bg-[rgba(201,166,107,0.1)] transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <Sparkles className="w-3 h-3 text-[var(--phosphor-amber)]" /> AI Reason
                                        </button>
                                    )}
                                    {onGenerateReport && (
                                        <button
                                            onClick={() => onGenerateReport(log)}
                                            className="px-2 py-0.5 rounded border border-[var(--chart-line)] text-[var(--muted)] hover:text-[var(--parchment)] hover:border-[var(--brass)] transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <FileText className="w-3 h-3" /> Report
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => onAcknowledge && onAcknowledge(index, log.workerId)}
                                    className="text-[0.68rem] font-data font-bold uppercase tracking-wider bg-[var(--radar-red)] text-white px-3 py-1 rounded hover:bg-[var(--phosphor-amber)] hover:text-[var(--bg-void)] transition-colors cursor-pointer shadow-[0_0_8px_var(--radar-red-glow)]"
                                >
                                    {t("Acknowledge")}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmergencyLog;
