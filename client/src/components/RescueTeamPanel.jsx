import React from 'react';
import { Shield, Truck, UserCheck, ArrowRight, CheckCircle2, AlertOctagon, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INCIDENT_STAGES } from '../services/rescueTeamService';

const RescueTeamPanel = ({
    teams = [],
    incidents = [],
    onAssignTeam,
    onAdvanceStage
}) => {
    const { t } = useTranslation();

    const getStageIndex = (stageKey) => {
        return INCIDENT_STAGES.findIndex(s => s.key === stageKey);
    };

    return (
        <div className="glass-panel p-5 rounded border border-[var(--brass)] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-[var(--chart-line)] pb-3 mb-4">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[var(--brass)]" />
                    <h3 className="font-display font-bold text-base text-[var(--parchment-bright)]">
                        {t("Rescue Ops & Tactical Team Dispatch")}
                    </h3>
                </div>
                <span className="font-data text-xs px-2 py-0.5 rounded border border-[var(--chart-line)] bg-[var(--bg-void)] text-[var(--phosphor-green)]">
                    {teams.filter(t => t.status === 'STANDBY').length} SQUADS STANDBY
                </span>
            </div>

            {/* Active Emergency Operations */}
            <div className="space-y-4 mb-6">
                <h4 className="font-data text-xs uppercase tracking-wider text-[var(--muted)] font-bold">
                    Active Emergency Life-Cycle Tracking
                </h4>

                {incidents.length === 0 ? (
                    <div className="py-6 text-center text-xs font-data text-[var(--muted)] flex flex-col items-center bg-[var(--bg-void)] rounded border border-[var(--chart-line)]">
                        <CheckCircle2 className="w-8 h-8 text-[var(--phosphor-green)] mb-1.5 opacity-80" />
                        <span>No active emergency incidents currently requiring rescue deployment.</span>
                    </div>
                ) : (
                    incidents.map((inc, index) => {
                        const currentStageKey = inc.stage || 'NEW';
                        const currentStageIdx = getStageIndex(currentStageKey);
                        const assignedTeam = teams.find(t => t.assignedWorkerId === inc.workerId);

                        return (
                            <div
                                key={index}
                                className="p-4 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] border-l-4 border-l-[var(--radar-red)] space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-data font-bold text-sm text-[var(--radar-red)] uppercase flex items-center gap-1">
                                                <AlertOctagon className="w-4 h-4 animate-pulse" />
                                                {inc.type || 'Emergency SOS'}
                                            </span>
                                            <span className="text-xs font-data text-[var(--phosphor-amber)]">
                                                Worker: {inc.name} ({inc.workerId})
                                            </span>
                                        </div>
                                        <p className="font-data text-xs text-[var(--muted)] mt-0.5">
                                            Zone: <strong className="text-[var(--parchment)]">{inc.zone}</strong> • Reported: {new Date(inc.time).toLocaleTimeString()}
                                        </p>
                                    </div>

                                    {/* Lifecycle Stage Badge */}
                                    <div className="flex items-center gap-1 font-data text-[0.68rem] font-bold px-2.5 py-1 rounded border border-[var(--brass)] bg-[var(--bg-panel)]">
                                        <span>STATUS:</span>
                                        <span className="text-[var(--phosphor-amber)] uppercase">{currentStageKey.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                {/* Step Progress Chain */}
                                <div className="flex flex-wrap items-center gap-1 font-data text-[0.6rem]">
                                    {INCIDENT_STAGES.slice(0, 7).map((st, i) => (
                                        <React.Fragment key={st.key}>
                                            <span
                                                className={`px-2 py-0.5 rounded border transition-colors ${i <= currentStageIdx ? 'border-[var(--brass)] bg-[rgba(201,166,107,0.15)] text-[var(--parchment-bright)] font-bold' : 'border-[var(--chart-line)] text-[var(--muted-dark)]'}`}
                                            >
                                                {st.label}
                                            </span>
                                            {i < 6 && <span className="text-[var(--chart-line)]">➔</span>}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Dispatch Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--chart-line)]">
                                    <div className="text-xs font-data text-[var(--muted)]">
                                        Assigned Unit: <strong className="text-[var(--parchment)]">{assignedTeam ? assignedTeam.name : 'Unassigned'}</strong>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!assignedTeam && (
                                            <button
                                                onClick={() => onAssignTeam && onAssignTeam(teams[0]?.id, inc.workerId)}
                                                className="px-3 py-1 bg-[var(--brass)] text-[var(--bg-void)] font-data font-bold text-xs uppercase rounded hover:bg-[var(--phosphor-amber)] transition-colors cursor-pointer"
                                            >
                                                Assign Alpha Squad
                                            </button>
                                        )}

                                        {currentStageIdx < INCIDENT_STAGES.length - 1 && (
                                            <button
                                                onClick={() => onAdvanceStage && onAdvanceStage(inc.workerId, INCIDENT_STAGES[currentStageIdx + 1]?.key)}
                                                className="px-3 py-1 rounded border border-[var(--phosphor-green)] text-[var(--phosphor-green)] font-data font-bold text-xs uppercase hover:bg-[rgba(107,203,119,0.15)] transition-colors flex items-center gap-1 cursor-pointer"
                                            >
                                                Advance Status <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Squad Fleet Inventory */}
            <h4 className="font-data text-xs uppercase tracking-wider text-[var(--muted)] font-bold mb-2.5">
                Designated Search & Rescue Squads
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-data text-xs">
                {teams.map(t => (
                    <div key={t.id} className="p-3 rounded bg-[var(--bg-void)] border border-[var(--chart-line)] space-y-1">
                        <div className="flex items-center justify-between">
                            <strong className="text-[var(--parchment-bright)]">{t.name}</strong>
                            <span className={`px-1.5 py-0.5 rounded text-[0.65rem] border ${t.status === 'STANDBY' ? 'border-[var(--phosphor-green)] text-[var(--phosphor-green)]' : 'border-[var(--phosphor-amber)] text-[var(--phosphor-amber)]'}`}>
                                {t.status}
                            </span>
                        </div>
                        <p className="text-[0.68rem] text-[var(--muted)]">Squad: {t.members.join(', ')}</p>
                        <p className="text-[0.65rem] text-[var(--muted)]">Gear: {t.equipment.join(' • ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RescueTeamPanel;
