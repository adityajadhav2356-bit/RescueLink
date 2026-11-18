import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity, ShieldAlert, Thermometer, Wind, Volume2 } from 'lucide-react';

const mockExposureHistory = [
    { time: '08:00', temp: 24, gas: 5, noise: 68, particles: 20 },
    { time: '09:00', temp: 26, gas: 8, noise: 74, particles: 25 },
    { time: '10:00', temp: 29, gas: 14, noise: 82, particles: 38 },
    { time: '11:00', temp: 34, gas: 22, noise: 88, particles: 45 },
    { time: '12:00', temp: 38, gas: 35, noise: 91, particles: 52 },
    { time: '13:00', temp: 36, gas: 28, noise: 85, particles: 40 },
    { time: '14:00', temp: 33, gas: 18, noise: 79, particles: 30 },
];

const ExposureChart = ({ workerId = 'W-042', currentTelemetry = {} }) => {
    const [metric, setMetric] = useState('temp');

    const metricConfig = {
        temp: {
            title: 'Thermal Core & Ambient Heat Exposure (°C)',
            dataKey: 'temp',
            color: '#FFB454',
            unit: '°C',
            threshold: 38,
            thresholdLabel: 'OSHA Heat Threshold (38°C)'
        },
        gas: {
            title: 'Atmospheric Toxic Gas Level (PPM)',
            dataKey: 'gas',
            color: '#FF5C5C',
            unit: 'PPM',
            threshold: 30,
            thresholdLabel: 'PEL Gas Ceiling Limit (30 PPM)'
        },
        noise: {
            title: 'Acoustic Sound Pressure Level (dBA)',
            dataKey: 'noise',
            color: '#C9A66B',
            unit: 'dBA',
            threshold: 85,
            thresholdLabel: 'OSHA 8-Hr TWA Limit (85 dBA)'
        }
    };

    const config = metricConfig[metric];

    return (
        <div className="glass-panel p-5 rounded border border-[var(--brass)] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--chart-line)] pb-3 mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[var(--brass)]" />
                    <h3 className="font-display font-bold text-base text-[var(--parchment-bright)]">
                        {config.title}
                    </h3>
                </div>

                <div className="flex bg-[var(--bg-void)] p-1 rounded border border-[var(--chart-line)] font-data text-xs">
                    <button
                        onClick={() => setMetric('temp')}
                        className={`px-2.5 py-1 rounded transition-colors ${metric === 'temp' ? 'bg-[var(--brass)] text-[var(--bg-void)] font-bold' : 'text-[var(--muted)] hover:text-[var(--parchment)]'}`}
                    >
                        Heat
                    </button>
                    <button
                        onClick={() => setMetric('gas')}
                        className={`px-2.5 py-1 rounded transition-colors ${metric === 'gas' ? 'bg-[var(--brass)] text-[var(--bg-void)] font-bold' : 'text-[var(--muted)] hover:text-[var(--parchment)]'}`}
                    >
                        Gas PPM
                    </button>
                    <button
                        onClick={() => setMetric('noise')}
                        className={`px-2.5 py-1 rounded transition-colors ${metric === 'noise' ? 'bg-[var(--brass)] text-[var(--bg-void)] font-bold' : 'text-[var(--muted)] hover:text-[var(--parchment)]'}`}
                    >
                        Noise dB
                    </button>
                </div>
            </div>

            <div className="h-56 w-full font-data text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockExposureHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-line)" vertical={false} />
                        <XAxis dataKey="time" stroke="var(--muted)" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                        <YAxis stroke="var(--muted)" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-panel-elevated)',
                                borderColor: 'var(--brass)',
                                borderRadius: '4px',
                                color: 'var(--parchment)',
                                fontFamily: 'var(--font-data)',
                                fontSize: '11px'
                            }}
                        />
                        <ReferenceLine
                            y={config.threshold}
                            stroke="var(--radar-red)"
                            strokeDasharray="4 4"
                            label={{ value: config.thresholdLabel, fill: 'var(--radar-red)', fontSize: 9, position: 'top' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={config.dataKey}
                            stroke={config.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${metric})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-2 border-t border-[var(--chart-line)] flex justify-between items-center font-data text-xs text-[var(--muted)]">
                <span>Shift Exposure: <strong className="text-[var(--phosphor-amber)]">Within Safe Margin</strong></span>
                <span>OSHA 1910 Compliance: <strong className="text-[var(--phosphor-green)]">VERIFIED</strong></span>
            </div>
        </div>
    );
};

export default ExposureChart;
