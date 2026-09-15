import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

const RiskScoreBadge = ({ risk = { score: 0, level: 'LOW', factors: [] }, showDetails = false, onClick = null }) => {
    const { score = 0, level = 'LOW', factors = [] } = risk;

    const badgeStyle = {
        LOW: 'border-[var(--phosphor-green)] text-[var(--phosphor-green)] bg-[rgba(107,203,119,0.12)]',
        MODERATE: 'border-[var(--phosphor-amber)] text-[var(--phosphor-amber)] bg-[rgba(255,180,84,0.12)]',
        HIGH: 'border-[#ff9800] text-[#ff9800] bg-[rgba(255,152,0,0.15)] shadow-[0_0_8px_rgba(255,152,0,0.3)]',
        CRITICAL: 'border-[var(--radar-red)] text-[var(--radar-red)] bg-[rgba(255,92,92,0.18)] shadow-[0_0_12px_var(--radar-red-glow)] animate-pulse'
    }[level] || 'border-[var(--phosphor-green)] text-[var(--phosphor-green)] bg-[rgba(107,203,119,0.12)]';

    return (
        <div 
            onClick={onClick}
            className={`inline-flex flex-col rounded p-2 border ${badgeStyle} ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
        >
            <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-data font-bold text-xs">
                    RISK: {score}/100 [{level}]
                </span>
            </div>
            {showDetails && factors.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-[var(--chart-line)] text-[0.68rem] text-[var(--muted)] font-data space-y-0.5">
                    {factors.slice(0, 2).map((f, i) => (
                        <div key={i} className="truncate">• {f}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiskScoreBadge;
