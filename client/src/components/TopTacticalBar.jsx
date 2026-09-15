import React, { useState, useEffect } from 'react';
import { Shield, Radio, Volume2, VolumeX, Mic, Bell, ChevronDown, User, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundService } from '../services/soundService';

export const DEMO_STAKEHOLDERS = [
    {
        id: 'W-042',
        name: 'Alex Mercer',
        role: 'worker',
        title: 'Deep Shaft Specialist',
        zone: 'Sector 7G',
        avatar: '👷‍♂️'
    },
    {
        id: 'W-011',
        name: 'Sarah Connor',
        role: 'worker',
        title: 'Tunnel Egress Lead',
        zone: 'Tunnel B',
        avatar: '👩‍🚒'
    },
    {
        id: 'S-01',
        name: 'Commander Vance',
        role: 'supervisor',
        title: 'Safety Incident Commander',
        zone: 'Surface Command Hub',
        avatar: '🛡️'
    },
    {
        id: 'ADMIN-01',
        name: 'Elena Rostova',
        role: 'supervisor',
        title: 'Chief Industrial Safety Officer',
        zone: 'All Sectors',
        avatar: '⚡'
    }
];

export const TopTacticalBar = ({
    currentUser = DEMO_STAKEHOLDERS[2],
    onSwitchUser = () => { },
    activeAlerts = [],
    onOpenVoice = () => { },
    onOpenBroadcast = () => { },
    onNavigate = () => { }
}) => {
    const [timeStr, setTimeStr] = useState('');
    const [isMuted, setIsMuted] = useState(soundService.isMuted());
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Live Tactical Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const utc = now.toUTCString().split(' ')[4];
            const local = now.toLocaleTimeString();
            setTimeStr(`${local} (UTC: ${utc})`);
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleSound = () => {
        const newMuted = !isMuted;
        soundService.setMuted(newMuted);
        setIsMuted(newMuted);
        if (!newMuted) soundService.playClick();
    };

    const hasCriticalSOS = activeAlerts.length > 0;

    return (
        <header className="h-[52px] w-full bg-[var(--bg-panel)] border-b border-[var(--grid-line)] px-3 md:px-5 flex items-center justify-between z-50 select-none shadow-lg">
            {/* Left: Brand / Platform Identity */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        soundService.playClick();
                        onNavigate('overview');
                    }}
                    className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
                >
                    <div className="w-8 h-8 rounded bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)] shadow-[0_0_10px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform">
                        <Shield className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <div className="font-data font-bold text-sm tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                            RESCUELINK <span className="text-[var(--safety-cyan)] text-[0.68rem] px-1.5 py-0.2 bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.3)] rounded">COMMAND</span>
                        </div>
                        <div className="text-[0.62rem] text-[var(--text-muted)] font-data hidden sm:block tracking-wide">
                            INTELLIGENT WORKER SAFETY PLATFORM
                        </div>
                    </div>
                </button>
            </div>

            {/* Center: Live Tactical Telemetry HUD */}
            <div className="hidden lg:flex items-center gap-5 text-xs font-data">
                {/* Active Emergency Ticker if present */}
                {hasCriticalSOS ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(239,68,68,0.18)] border border-[var(--safety-red)] rounded emergency-strobe text-[var(--safety-red)]">
                        <span className="beacon-pulse-red"></span>
                        <span className="font-bold tracking-wider animate-pulse">
                            CRITICAL SOS ACTIVE: {activeAlerts.length} INCIDENT(S)
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded text-[var(--safety-green)]">
                        <span className="beacon-pulse"></span>
                        <span className="font-medium tracking-wide">SYSTEM NOMINAL // SENSORS ONLINE</span>
                    </div>
                )}

                <div className="text-[var(--text-secondary)] border-l border-[var(--grid-line)] pl-4">
                    <span className="text-[var(--text-muted)] text-[0.65rem] block">SECTOR POSITION</span>
                    <span className="text-[var(--safety-cyan)] font-semibold">SITE ALPHA // 51.505°N, 0.090°W</span>
                </div>

                <div className="text-[var(--text-secondary)] border-l border-[var(--grid-line)] pl-4">
                    <span className="text-[var(--text-muted)] text-[0.65rem] block">TACTICAL CLOCK</span>
                    <span className="text-[var(--text-primary)] font-mono">{timeStr}</span>
                </div>
            </div>

            {/* Right: Tactical Actions & Stakeholder Fast Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Voice Intercom Action */}
                <button
                    onClick={() => {
                        soundService.playClick();
                        onOpenVoice();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.2)] border border-[rgba(0,229,255,0.4)] text-[var(--safety-cyan)] text-xs font-data font-semibold cursor-pointer transition-all shadow-[0_0_8px_rgba(0,229,255,0.15)]"
                    title="Push-to-Talk Voice Safety Intercom (EN / HI / MR)"
                >
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">VOICE HUD</span>
                </button>

                {/* Emergency Broadcast Trigger */}
                <button
                    onClick={() => {
                        soundService.playClick();
                        onOpenBroadcast();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[rgba(245,158,11,0.1)] hover:bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)] text-[var(--safety-amber)] text-xs font-data font-semibold cursor-pointer transition-all"
                    title="Emergency Site Broadcast"
                >
                    <Radio className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">BROADCAST</span>
                </button>

                {/* Audio Effects Toggle */}
                <button
                    onClick={toggleSound}
                    className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] hover:border-[var(--safety-cyan)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    title={isMuted ? "Enable Sound Effects" : "Mute Sound Effects"}
                >
                    {isMuted ? <VolumeX className="w-4 h-4 text-[var(--text-muted)]" /> : <Volume2 className="w-4 h-4 text-[var(--safety-cyan)]" />}
                </button>

                {/* Stakeholder Fast-Switcher Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            soundService.playClick();
                            setShowProfileMenu(!showProfileMenu);
                        }}
                        className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] hover:border-[var(--safety-cyan)] text-left cursor-pointer transition-all"
                    >
                        <span className="text-base">{currentUser?.avatar || '👤'}</span>
                        <div className="hidden sm:block leading-tight">
                            <div className="font-data text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px]">
                                {currentUser?.name}
                            </div>
                            <div className="font-data text-[0.62rem] text-[var(--safety-cyan)] uppercase">
                                {currentUser?.role}
                            </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </button>

                    {showProfileMenu && (
                        <div
                            className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] rounded-md shadow-2xl p-2 z-[100] font-data text-xs"
                            onMouseLeave={() => setShowProfileMenu(false)}
                        >
                            <div className="px-2 py-1.5 border-b border-[var(--grid-line)] text-[0.68rem] text-[var(--safety-cyan)] font-bold uppercase tracking-wider">
                                SWITCH ACTIVE STAKEHOLDER
                            </div>
                            <div className="py-1 space-y-1">
                                {DEMO_STAKEHOLDERS.map(s => {
                                    const isSelected = s.id === currentUser?.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                soundService.playClick();
                                                onSwitchUser(s);
                                                setShowProfileMenu(false);
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${isSelected
                                                ? 'bg-[rgba(0,229,255,0.15)] border border-[var(--safety-cyan)] text-[var(--text-bright)]'
                                                : 'hover:bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            <span className="text-lg">{s.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-xs truncate flex items-center justify-between">
                                                    <span>{s.name}</span>
                                                    <span className="text-[0.62rem] text-[var(--text-muted)]">{s.id}</span>
                                                </div>
                                                <div className="text-[0.65rem] text-[var(--text-muted)] truncate">{s.title}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-[var(--grid-line)] pt-1.5 mt-1 flex justify-between">
                                <button
                                    onClick={() => {
                                        soundService.playClick();
                                        onNavigate('worker_portal');
                                        setShowProfileMenu(false);
                                    }}
                                    className="text-[0.68rem] text-[var(--safety-cyan)] hover:underline"
                                >
                                    Open Worker View 📱
                                </button>
                                <button
                                    onClick={() => {
                                        soundService.playClick();
                                        onNavigate('overview');
                                        setShowProfileMenu(false);
                                    }}
                                    className="text-[0.68rem] text-[var(--safety-green)] hover:underline"
                                >
                                    Command Center 🛡️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopTacticalBar;
