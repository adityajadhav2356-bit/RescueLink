import React from 'react';
import { useTranslation } from 'react-i18next';

const WorkerTable = ({ workers }) => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto glass-panel rounded-2xl border-[rgba(0,240,255,0.2)]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#050a14] text-gray-400 text-sm">
                    <tr>
                        <th className="p-4 border-b border-gray-800">{t("Worker ID")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Name")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Zone")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Status")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Temp (°C)")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Air Quality")}</th>
                        <th className="p-4 border-b border-gray-800">{t("Battery")}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {workers.map((worker) => (
                        <tr key={worker.workerId} className="hover:bg-[rgba(0,240,255,0.05)] transition-colors border-b border-gray-800">
                            <td className="p-4 font-mono text-[var(--primary)]">{worker.workerId}</td>
                            <td className="p-4 font-semibold">{worker.name}</td>
                            <td className="p-4">{worker.zone}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${worker.status === 'SAFE' ? 'border-[var(--safe)] text-[var(--safe)] bg-[rgba(0,255,136,0.1)]' : worker.status === 'WARNING' ? 'border-[var(--warning)] text-[var(--warning)] bg-[rgba(255,204,0,0.1)]' : 'border-[var(--danger)] text-[var(--danger)] bg-[rgba(255,0,85,0.1)] animate-pulse'}`}>
                                    {t(worker.status)}
                                </span>
                            </td>
                            <td className={`p-4 ${worker.envTemp > 35 ? 'text-[var(--danger)]' : 'text-gray-300'}`}>{worker.envTemp}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${worker.airQuality === 'Good' ? 'bg-[var(--safe)]' : worker.airQuality === 'Fair' ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}></div>
                                    {t(worker.airQuality)}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${worker.battery > 50 ? 'bg-[var(--primary)]' : worker.battery > 20 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
                                            style={{ width: `${worker.battery}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs">{worker.battery}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkerTable;
