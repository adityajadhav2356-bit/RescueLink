import React from 'react';

/**
 * Analog Risk Gauge Component
 * Precision SVG semi-circular dial instrument with rotating needle,
 * calibrated risk zones (0-30 Low, 30-55 Moderate, 55-80 High, 80-100 Critical),
 * and tactile mechanical bezel styling.
 */
export const AnalogRiskGauge = ({
    score = 0,
    size = 180,
    label = "SAFETY RISK INDEX",
    subLabel = "AI PREDICTIVE",
    showTiers = true
}) => {
    const clampedScore = Math.min(100, Math.max(0, Number(score) || 0));

    // Dial spans from -135 deg to +135 deg (270 degree sweep)
    const minAngle = -135;
    const maxAngle = 135;
    const angle = minAngle + (clampedScore / 100) * (maxAngle - minAngle);

    // Color resolution
    let tier = 'NOMINAL / LOW';
    let tierColor = '#10B981'; // Green
    let glowColor = 'rgba(16, 185, 129, 0.3)';

    if (clampedScore >= 80) {
        tier = 'CRITICAL HAZARD';
        tierColor = '#EF4444';
        glowColor = 'rgba(239, 68, 68, 0.4)';
    } else if (clampedScore >= 55) {
        tier = 'HIGH RISK';
        tierColor = '#F97316';
        glowColor = 'rgba(249, 115, 22, 0.35)';
    } else if (clampedScore >= 30) {
        tier = 'MODERATE CAUTION';
        tierColor = '#F59E0B';
        glowColor = 'rgba(245, 158, 11, 0.3)';
    }

    const radius = 68;
    const center = 90;

    return (
        <div className="flex flex-col items-center justify-center relative select-none">
            <svg
                width={size}
                height={size * 0.88}
                viewBox="0 0 180 160"
                className="overflow-visible"
            >
                {/* Outer Bezel Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r="78"
                    fill="none"
                    stroke="#1E2E4A"
                    strokeWidth="1.5"
                    strokeDasharray="2, 4"
                />

                {/* Dial Background Track */}
                <path
                    d="M 38 126 A 68 68 0 1 1 142 126"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Calibrated Color Arc Segments */}
                {/* 0-30: Safe (Green) */}
                <path
                    d="M 38 126 A 68 68 0 0 1 52 48"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                />
                {/* 30-55: Caution (Amber) */}
                <path
                    d="M 52 48 A 68 68 0 0 1 90 22"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                />
                {/* 55-80: High (Orange) */}
                <path
                    d="M 90 22 A 68 68 0 0 1 128 48"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                />
                {/* 80-100: Critical (Red) */}
                <path
                    d="M 128 48 A 68 68 0 0 1 142 126"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                />

                {/* Active Dynamic Progress Glow Track */}
                <path
                    d="M 38 126 A 68 68 0 1 1 142 126"
                    fill="none"
                    stroke={tierColor}
                    strokeWidth="8"
                    strokeDasharray="320"
                    strokeDashoffset={320 - (clampedScore / 100) * 240}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.4s ease',
                        filter: `drop-shadow(0 0 6px ${glowColor})`
                    }}
                />

                {/* Dial Tick Marks */}
                {[-135, -90, -45, 0, 45, 90, 135].map((tickAngle, i) => {
                    const rad = (tickAngle - 90) * (Math.PI / 180);
                    const x1 = center + 56 * Math.cos(rad);
                    const y1 = center + 56 * Math.sin(rad);
                    const x2 = center + 62 * Math.cos(rad);
                    const y2 = center + 62 * Math.sin(rad);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#64748B"
                            strokeWidth="1.5"
                        />
                    );
                })}

                {/* Rotating Needle */}
                <g
                    transform={`rotate(${angle} ${center} ${center})`}
                    style={{ transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                >
                    {/* Needle Shadow */}
                    <polygon
                        points={`${center - 2},${center} ${center},24 ${center + 2},${center}`}
                        fill={tierColor}
                        style={{ filter: `drop-shadow(0 0 8px ${tierColor})` }}
                    />
                    <circle cx={center} cy="26" r="2.5" fill="#FFFFFF" />
                </g>

                {/* Center Pivot Bezel */}
                <circle cx={center} cy={center} r="14" fill="#0E1626" stroke="#1E2E4A" strokeWidth="2" />
                <circle cx={center} cy={center} r="6" fill={tierColor} />
            </svg>

            {/* Numeric Readout & Tier HUD */}
            <div className="text-center -mt-6">
                <div
                    className="font-data font-bold text-2xl tracking-tight"
                    style={{ color: tierColor, textShadow: `0 0 12px ${glowColor}` }}
                >
                    {clampedScore.toFixed(0)}
                    <span className="text-xs text-[var(--text-muted)] font-normal ml-0.5">/100</span>
                </div>

                {showTiers && (
                    <div
                        className="font-data text-[0.68rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-0.5 border"
                        style={{
                            color: tierColor,
                            borderColor: tierColor,
                            backgroundColor: `${tierColor}15`
                        }}
                    >
                        {tier}
                    </div>
                )}

                {label && (
                    <div className="font-data text-[0.62rem] text-[var(--text-muted)] tracking-widest uppercase mt-1">
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalogRiskGauge;
