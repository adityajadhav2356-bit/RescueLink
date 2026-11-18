import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';

const WorkerTable = ({ workers = [], onInspect = null }) => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto glass-panel rounded border border-[var(--brass)] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <table className="w-full text-left border-collapse font-body text-sm">
                <thead className="bg-[var(--bg-void)] text-[var(--muted)] font-data text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Worker ID")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Name")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Zone")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Status")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Temp (°C)")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Air Quality")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)]">{t("Battery")}</th>
                        <th className="p-3.5 border-b border-[var(--chart-line)] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-xs">
                    {workers.map((worker) => (
                        <tr key={worker.workerId} className="hover:bg-[rgba(201,166,107,0.06)] transition-colors border-b border-[var(--chart-line)] last:border-b-0">
                            <td className="p-3.5 font-data text-[var(--phosphor-amber)] font-bold">{worker.workerId}</td>
                            <td className="p-3.5 font-semibold text-[var(--parchment-bright)]">{worker.name}</td>
                            <td className="p-3.5 font-data text-[var(--parchment)]">{worker.zone}</td>
                            <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded font-data text-[0.7rem] font-bold border ${worker.status === 'SAFE' ? 'border-[var(--phosphor-green)] text-[var(--phosphor-green)] bg-[rgba(107,203,119,0.12)]' : worker.status === 'WARNING' ? 'border-[var(--phosphor-amber)] text-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.12)]' : 'border-[var(--radar-red)] text-[var(--radar-red)] bg-[rgba(255,92,92,0.15)] animate-pulse'}`}>
                                    {t(worker.status)}
                                </span>
                            </td>
                            <td className={`p-3.5 font-data font-semibold ${worker.envTemp > 35 ? 'text-[var(--radar-red)]' : 'text-[var(--parchment)]'}`}>
                                {worker.envTemp}°C
                            </td>
                            <td className="p-3.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${worker.airQuality === 'Good' ? 'bg-[var(--phosphor-green)]' : worker.airQuality === 'Fair' ? 'bg-[var(--phosphor-amber)]' : 'bg-[var(--radar-red)]'}`}></div>
                                    <span className="font-data text-[var(--parchment)]">{t(worker.airQuality)}</span>
                                </div>
                            </td>
                            <td className="p-3.5 font-data">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-[var(--bg-void)] border border-[var(--chart-line)] rounded overflow-hidden">
                                        <div
                                            className={`h-full ${worker.battery > 50 ? 'bg-[var(--phosphor-green)]' : worker.battery > 20 ? 'bg-[var(--phosphor-amber)]' : 'bg-[var(--radar-red)]'}`}
                                            style={{ width: `${worker.battery}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[var(--muted)]">{worker.battery}%</span>
                                </div>
                            </td>
                            <td className="p-3.5 text-right">
                                <button
                                    onClick={() => onInspect && onInspect(worker)}
                                    className="px-2.5 py-1 rounded border border-[var(--chart-line)] hover:border-[var(--brass)] text-[var(--brass)] hover:bg-[rgba(201,166,107,0.1)] font-data text-[0.68rem] transition-colors cursor-pointer"
                                >
                                    Inspect
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkerTable;
