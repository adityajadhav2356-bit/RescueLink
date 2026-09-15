import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, AlertOctagon, Clock, Users, ArrowUpRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

const INCIDENTS_OVER_TIME = [
    { hour: '06:00', safe: 45, warning: 3, critical: 0 },
    { hour: '08:00', safe: 42, warning: 5, critical: 1 },
    { hour: '10:00', safe: 38, warning: 8, critical: 2 },
    { hour: '12:00', safe: 40, warning: 6, critical: 1 },
    { hour: '14:00', safe: 35, warning: 11, critical: 3 },
    { hour: '16:00', safe: 41, warning: 4, critical: 0 },
    { hour: '18:00', safe: 44, warning: 2, critical: 0 }
];

const RESPONSE_TIMES_BY_ZONE = [
    { zone: 'Sector 7G', avgAckSeconds: 8, avgResolveMinutes: 3.2 },
    { zone: 'Tunnel B', avgAckSeconds: 14, avgResolveMinutes: 4.8 },
    { zone: 'Deep Shaft 3', avgAckSeconds: 11, avgResolveMinutes: 5.1 },
    { zone: 'Sub-station Alpha', avgAckSeconds: 6, avgResolveMinutes: 2.4 },
    { zone: 'North Vent Shaft', avgAckSeconds: 9, avgResolveMinutes: 3.8 }
];

const RISK_DISTRIBUTION = [
    { name: 'Low Risk (0-29)', value: 68, color: '#10B981' },
    { name: 'Moderate (30-54)', value: 20, color: '#F59E0B' },
    { name: 'High Risk (55-79)', value: 9, color: '#F97316' },
    { name: 'Critical (80-100)', value: 3, color: '#EF4444' }
];

const REPEAT_WARNING_WORKERS = [
    { workerId: 'W-011', name: 'Sarah Connor', zone: 'Tunnel B', totalWarnings: 7, lastIncident: 'High Gas Concentration', avgHeartRate: 112, compliance: '82%' },
    { workerId: 'W-042', name: 'Alex Mercer', zone: 'Sector 7G', totalWarnings: 4, lastIncident: 'Thermal Stress (39°C)', avgHeartRate: 98, compliance: '94%' },
    { workerId: 'W-007', name: 'James Bond', zone: 'Deep Shaft 3', totalWarnings: 1, lastIncident: 'Geofence Perimeter Warning', avgHeartRate: 74, compliance: '99%' }
];

export const SafetyAnalytics = ({ workers = [], alerts = [] }) => {
    const [timeRange, setTimeRange] = useState('Today (Shift 1)');

    return (
        <div className="h-full w-full bg-[var(--bg-void)] p-4 md:p-6 overflow-y-auto font-data select-none space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--grid-line)] pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)]">
                            <BarChart3 className="w-4.5 h-4.5" />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold tracking-wider text-[var(--text-primary)]">
                            INDUSTRIAL SAFETY ANALYTICS & KPI INTELLIGENCE
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Historical trend analysis, response latency benchmarks, and environmental compliance audits.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => {
                            soundService.playClick();
                            setTimeRange(e.target.value);
                        }}
                        className="bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] text-[var(--text-primary)] rounded px-3 py-1.5 text-xs font-data focus:outline-none focus:border-[var(--safety-cyan)]"
                    >
                        <option>Today (Shift 1 & 2)</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Quarterly Audit</option>
                    </select>

                    <button
                        onClick={() => soundService.playClick()}
                        className="btn-tactical btn-tactical-primary text-xs"
                    >
                        EXPORT AUDIT PDF
                    </button>
                </div>
            </div>

            {/* Top Stat KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                    <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                        <span>TOTAL WORKFORCE</span>
                        <Users className="w-3.5 h-3.5 text-[var(--safety-cyan)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">48</div>
                    <div className="text-[0.62rem] text-[var(--safety-green)] mt-0.5">100% transponders linked</div>
                </div>

                <div className="p-3.5 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                    <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                        <span>TOTAL INCIDENTS</span>
                        <AlertOctagon className="w-3.5 h-3.5 text-[var(--safety-amber)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--safety-amber)] mt-1">12</div>
                    <div className="text-[0.62rem] text-[var(--text-muted)] mt-0.5">10 resolved, 2 active</div>
                </div>

                <div className="p-3.5 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                    <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                        <span>AVG RESPONSE TIME</span>
                        <Clock className="w-3.5 h-3.5 text-[var(--safety-green)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--safety-green)] mt-1">1.8 <span className="text-xs font-normal">min</span></div>
                    <div className="text-[0.62rem] text-[var(--safety-green)] mt-0.5">-28% vs industrial standard</div>
                </div>

                <div className="p-3.5 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)]">
                    <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                        <span>AVG ACKNOWLEDGEMENT</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--safety-cyan)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--safety-cyan)] mt-1">8.4 <span className="text-xs font-normal">sec</span></div>
                    <div className="text-[0.62rem] text-[var(--text-muted)] mt-0.5">Instant triage protocol</div>
                </div>

                <div className="p-3.5 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                        <span>OVERALL SAFETY INDEX</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--safety-green)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--safety-green)] mt-1">94.2%</div>
                    <div className="text-[0.62rem] text-[var(--safety-green)] mt-0.5">GRADE A+ NOMINAL</div>
                </div>
            </div>

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Chart 1: Incidents Timeline (Stacked Area) */}
                <div className="p-4 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-[var(--safety-cyan)]" />
                            WORKFORCE SAFETY STATUS OVER TIME
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">HOURLY SHIFT LOG</span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={INCIDENTS_OVER_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#1E2E4A" strokeDasharray="3 3" />
                                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0E1626', borderColor: '#1E2E4A', borderRadius: '4px', color: '#F8FAFC', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                <Area type="monotone" dataKey="safe" stroke="#10B981" fillOpacity={1} fill="url(#colorSafe)" name="Safe Workers" />
                                <Area type="monotone" dataKey="warning" stroke="#F59E0B" fillOpacity={1} fill="url(#colorWarning)" name="Warning State" />
                                <Area type="monotone" dataKey="critical" stroke="#EF4444" fillOpacity={1} fill="url(#colorCritical)" name="Critical SOS" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Response & Ack Latency by Zone */}
                <div className="p-4 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[var(--safety-green)]" />
                            EMERGENCY RESPONSE TIME BY SECTOR (MINUTES)
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">BENCHMARK: &lt; 5 MIN</span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={RESPONSE_TIMES_BY_ZONE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#1E2E4A" strokeDasharray="3 3" />
                                <XAxis dataKey="zone" stroke="#64748B" tick={{ fontSize: 9 }} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0E1626', borderColor: '#1E2E4A', borderRadius: '4px', color: '#F8FAFC', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                <Bar dataKey="avgResolveMinutes" fill="#00E5FF" radius={[4, 4, 0, 0]} name="Avg Rescue Time (min)" />
                                <Bar dataKey="avgAckSeconds" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Avg Ack Latency (sec)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: AI Risk Tier Distribution */}
                <div className="p-4 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[var(--safety-cyan)]" />
                            AI RISK SCORE DISTRIBUTION (% OF WORKFORCE)
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">DYNAMIC SCORING</span>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={RISK_DISTRIBUTION}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {RISK_DISTRIBUTION.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0E1626" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0E1626', borderColor: '#1E2E4A', borderRadius: '4px', color: '#F8FAFC', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table: Repeat Warning Operators & Proactive Safety Compliance */}
                <div className="p-4 rounded bg-[var(--bg-panel)] border border-[var(--grid-line)] space-y-3 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-[var(--safety-amber)]" />
                                OPERATORS WITH REPEATED WARNINGS
                            </span>
                            <span className="text-[0.65rem] text-[var(--safety-cyan)]">PROACTIVE AUDIT</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--grid-line)] text-[0.65rem] text-[var(--text-muted)] uppercase">
                                        <th className="pb-1.5">Operator</th>
                                        <th className="pb-1.5">Zone</th>
                                        <th className="pb-1.5">Warnings</th>
                                        <th className="pb-1.5">Last Trigger</th>
                                        <th className="pb-1.5">Compliance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--grid-line)]">
                                    {REPEAT_WARNING_WORKERS.map((w) => (
                                        <tr key={w.workerId} className="hover:bg-[var(--bg-panel-elevated)] transition-colors">
                                            <td className="py-2 font-bold text-[var(--text-primary)]">
                                                {w.workerId} <span className="text-[0.65rem] font-normal text-[var(--text-muted)]">({w.name})</span>
                                            </td>
                                            <td className="py-2 text-[var(--text-secondary)]">{w.zone}</td>
                                            <td className="py-2">
                                                <span className="px-1.5 py-0.2 rounded bg-[rgba(245,158,11,0.15)] text-[var(--safety-amber)] font-bold">
                                                    {w.totalWarnings}
                                                </span>
                                            </td>
                                            <td className="py-2 text-[0.68rem] text-[var(--text-muted)] truncate max-w-[120px]">{w.lastIncident}</td>
                                            <td className="py-2 font-bold text-[var(--safety-green)]">{w.compliance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] text-[0.68rem] text-[var(--text-muted)] flex items-center justify-between">
                        <span>AUDIT FREQUENCY: Continuous Realtime Telemetry</span>
                        <span className="text-[var(--safety-cyan)] font-semibold">ZERO FATALITY GOAL ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyAnalytics;
