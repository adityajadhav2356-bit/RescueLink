import React from 'react';
import { Shield, Map, Users, Bell, Crosshair, BarChart3, Radio, Smartphone, Sparkles, Sliders } from 'lucide-react';
import { soundService } from '../services/soundService';

export const NAV_ITEMS = [
    { id: 'overview', label: 'Command Center', icon: Shield, badge: null },
    { id: 'map', label: 'Tactical Map', icon: Map, badge: null },
    { id: 'workers', label: 'Worker Roster', icon: Users, badge: null },
    { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badge: 'alerts' },
    { id: 'zones', label: 'Zones & Geofencing', icon: Crosshair, badge: null },
    { id: 'analytics', label: 'Safety Analytics', icon: BarChart3, badge: null },
    { id: 'broadcast', label: 'Site Broadcast', icon: Radio, badge: null },
    { id: 'worker_portal', label: 'Worker Mobile App', icon: Smartphone, badge: null },
    { id: 'simulator', label: 'Simulation Sandbox', icon: Sparkles, badge: 'DEMO' }
];

export const ConsoleRail = ({
    activeSection = 'overview',
    onSelectSection = () => { },
    activeAlertsCount = 0
}) => {
    return (
        <nav className="w-16 h-[calc(100vh-52px-38px)] bg-[var(--bg-panel)] border-r border-[var(--grid-line)] flex flex-col justify-between py-3 items-center select-none z-40">
            {/* Nav Icon Group */}
            <div className="flex flex-col gap-2.5 w-full items-center">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    const hasAlertBadge = item.badge === 'alerts' && activeAlertsCount > 0;
                    const isDemoBadge = item.badge === 'DEMO';

                    return (
                        <div key={item.id} className="relative group flex items-center justify-center">
                            <button
                                onClick={() => {
                                    soundService.playClick();
                                    onSelectSection(item.id);
                                }}
                                className={`w-11 h-11 rounded-md flex items-center justify-center transition-all cursor-pointer relative ${isActive
                                    ? 'bg-[rgba(0,229,255,0.16)] text-[var(--safety-cyan)] border border-[var(--safety-cyan)] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-elevated)] border border-transparent hover:border-[var(--grid-line)]'
                                    }`}
                                aria-label={item.label}
                            >
                                <Icon className="w-5 h-5" />

                                {/* Alert or Demo Badges */}
                                {hasAlertBadge && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--safety-red)] text-white text-[0.62rem] font-bold flex items-center justify-center animate-pulse">
                                        {activeAlertsCount}
                                    </span>
                                )}
                                {isDemoBadge && !isActive && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--safety-amber)] animate-ping"></span>
                                )}
                            </button>

                            {/* Tactical Mechanical Tooltip */}
                            <div className="absolute left-full ml-3 px-2.5 py-1 bg-[var(--bg-panel-elevated)] text-[var(--text-primary)] border border-[var(--grid-line)] rounded font-data text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--safety-cyan)]"></span>
                                <span>{item.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Indicator / Quick Settings */}
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-[1px] bg-[var(--grid-line)]"></div>
                <div
                    className="w-3 h-3 rounded-full bg-[var(--safety-green)] opacity-80"
                    title="Mesh Telemetry Relay Synchronized"
                ></div>
            </div>
        </nav>
    );
};

export default ConsoleRail;
