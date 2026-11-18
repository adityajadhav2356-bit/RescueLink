import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, X, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INITIAL_CONTACTS, dispatchFamilyEmergencyAlert } from '../services/familyNotifier';

const EmergencyContactModal = ({ workerId = 'W-042', workerName = 'Alex Mercer', zone = 'Sector 7G', onClose }) => {
    const { t } = useTranslation();
    const [dispatched, setDispatched] = useState(false);
    const [log, setLog] = useState(null);

    const contacts = INITIAL_CONTACTS[workerId] || [
        { name: 'Designated Family Contact', relation: 'Next of Kin', phone: '+1 (555) 000-1122', notifyOnCritical: true }
    ];

    const handleSendTestBroadcast = () => {
        const result = dispatchFamilyEmergencyAlert(workerId, workerName, zone, 'Manual Distress Test');
        setLog(result);
        setDispatched(true);
    };

    return (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel w-full max-w-lg p-6 rounded border-2 border-[var(--brass)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[var(--bg-panel-elevated)]"
            >
                <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[var(--brass)]" />
                        <h3 className="font-display font-bold text-base text-[var(--parchment-bright)]">
                            {t("Emergency Family Liaison Dispatch")}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded border border-[var(--chart-line)] hover:border-[var(--radar-red)] text-[var(--muted)] hover:text-[var(--radar-red)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-[var(--muted)] mb-4 font-body">
                    Automated encrypted emergency broadcasts sent to designated family members when critical distress is confirmed.
                </p>

                {/* Registered Contact Roster */}
                <div className="space-y-2.5 mb-5 font-data text-xs">
                    {contacts.map((c, i) => (
                        <div key={i} className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] flex items-center justify-between">
                            <div>
                                <strong className="text-[var(--parchment-bright)]">{c.name}</strong>
                                <span className="text-[var(--muted)] block text-[0.7rem]">{c.relation} • {c.phone}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[0.65rem] border border-[var(--phosphor-green)] text-[var(--phosphor-green)] bg-[rgba(107,203,119,0.1)] font-bold">
                                ACTIVE RECIPIENT
                            </span>
                        </div>
                    ))}
                </div>

                {dispatched && log && (
                    <div className="mb-5 p-3 rounded bg-[rgba(107,203,119,0.08)] border border-[var(--phosphor-green)] font-data text-xs space-y-1">
                        <div className="flex items-center gap-1 text-[var(--phosphor-green)] font-bold text-[0.7rem]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>BROADCAST TRANSMITTED [DEMO / SIMULATION]</span>
                        </div>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                            {log.notifications[0]?.message}
                        </p>
                    </div>
                )}

                <div className="pt-2 border-t border-[var(--chart-line)] flex justify-end gap-3 font-data text-xs">
                    <button
                        onClick={handleSendTestBroadcast}
                        className="w-full py-2.5 rounded bg-[var(--brass)] text-[var(--bg-void)] font-bold uppercase hover:bg-[var(--phosphor-amber)] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_var(--brass-glow)]"
                    >
                        <Send className="w-3.5 h-3.5" /> Send Test Emergency Broadcast
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EmergencyContactModal;
