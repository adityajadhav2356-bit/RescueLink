import React from 'react';
import { AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmergencyLog = ({ logs, onAcknowledge }) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel rounded-2xl p-6 h-[400px] overflow-y-auto border-[rgba(0,240,255,0.2)]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white border-b border-gray-800 pb-2">
                <AlertOctagon className="text-[var(--danger)] w-6 h-6 animate-pulse" />
                {t("Emergency Alert Log")}
            </h3>
            <div className="space-y-4 mt-4">
                {logs.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-[var(--safe)] mb-2" />
                        <p>{t("No critical alerts today. All systems nominal.")}</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="bg-[#050a14] p-4 rounded-xl border-l-4 border-[var(--danger)] hover:bg-[rgba(255,0,85,0.05)] transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-[var(--danger)] flex items-center gap-2">
                                    <AlertOctagon className="w-4 h-4" />
                                    {t(log.type)}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.time).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-white mb-1">{t("Worker:")} {log.name} ({log.workerId})</p>
                            <p className="text-xs text-gray-400">{t("Location:")} {log.zone}</p>
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => onAcknowledge && onAcknowledge(index, log.workerId)}
                                    className="text-xs bg-[var(--danger)] text-white px-3 py-1 rounded-full font-bold hover:bg-white hover:text-[var(--danger)] transition-colors"
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
