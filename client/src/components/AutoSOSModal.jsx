import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AutoSOSModal = ({ trigger = {}, onCancel, onConfirmSOS }) => {
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        if (countdown <= 0) {
            onConfirmSOS(trigger);
            return;
        }

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, trigger, onConfirmSOS]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(10,16,20,0.85)] backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel w-full max-w-lg p-6 rounded border-2 border-[var(--radar-red)] shadow-[0_0_40px_var(--radar-red-glow)] bg-[var(--bg-panel-elevated)] relative text-center"
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--radar-red)] bg-[rgba(255,92,92,0.18)] flex items-center justify-center text-[var(--radar-red)] animate-bounce shadow-[0_0_20px_var(--radar-red-glow)]">
                    <ShieldAlert className="w-10 h-10" />
                </div>

                <span className="text-xs font-data uppercase tracking-widest text-[var(--radar-red)] block mb-1">
                    AUTOMATIC INCIDENT DETECTION
                </span>
                <h2 className="text-2xl font-bold font-display text-[var(--parchment-bright)] mb-2">
                    {trigger.type || t("Emergency Alert Triggered")}
                </h2>
                <p className="text-xs text-[var(--muted)] mb-4 font-body">
                    {trigger.reason || t("Unusual sensor telemetry detected. Transmitting distress beacon to supervisor.")}
                </p>

                {/* Countdown Dial */}
                <div className="my-6 p-4 rounded bg-[var(--bg-void)] border border-[var(--radar-red)] inline-block">
                    <div className="text-4xl font-black font-data text-[var(--radar-red)] tracking-widest text-glow-danger">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                    </div>
                    <span className="text-[0.65rem] font-data text-[var(--muted)] uppercase tracking-wider block mt-1">
                        Seconds Until Auto-Dispatch
                    </span>
                </div>

                <p className="text-sm font-semibold text-[var(--parchment)] mb-6">
                    {t("Are you OK? Cancel to prevent false dispatch.")}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onCancel}
                        className="py-3 px-4 rounded bg-[var(--bg-void)] border border-[var(--phosphor-green)] text-[var(--phosphor-green)] font-data font-bold text-xs uppercase hover:bg-[rgba(107,203,119,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_var(--phosphor-green-glow)]"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {t("I AM SAFE (CANCEL)")}
                    </button>
                    <button
                        onClick={() => onConfirmSOS(trigger)}
                        className="py-3 px-4 rounded bg-[var(--radar-red)] text-white font-data font-bold text-xs uppercase hover:bg-[var(--phosphor-amber)] hover:text-[var(--bg-void)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_var(--radar-red-glow)]"
                    >
                        <AlertOctagon className="w-4 h-4" />
                        {t("DISPATCH SOS NOW")}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AutoSOSModal;
