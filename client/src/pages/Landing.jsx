import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Activity, Users, ArrowRight, ShieldCheck, Globe, Radio, Zap, Navigation, Clock, Truck, Smartphone, KeyRound, CheckCircle2, Flame, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { soundService } from '../services/soundService';

const DEMO_ACCOUNTS = [
    {
        id: 'W-042',
        name: 'Alex Mercer',
        role: 'worker',
        title: 'Deep Shaft Specialist',
        zone: 'Sector 7G',
        avatar: '👷‍♂️',
        path: '/worker',
        badge: 'WORKER PORTAL'
    },
    {
        id: 'W-011',
        name: 'Sarah Connor',
        role: 'worker',
        title: 'Tunnel Egress Lead',
        zone: 'Tunnel B',
        avatar: '👩‍🚒',
        path: '/worker',
        badge: 'WORKER PORTAL'
    },
    {
        id: 'S-01',
        name: 'Commander Vance',
        role: 'supervisor',
        title: 'Safety Incident Commander',
        zone: 'Surface Command Hub',
        avatar: '🛡️',
        path: '/supervisor',
        badge: 'COMMAND HUB'
    },
    {
        id: 'ADMIN-01',
        name: 'Elena Rostova',
        role: 'supervisor',
        title: 'Chief Industrial Safety Officer',
        zone: 'All Sectors',
        avatar: '⚡',
        path: '/supervisor',
        badge: 'CHIEF ADMIN'
    }
];

export const Landing = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] relative overflow-hidden flex flex-col font-body select-none">
            {/* Ambient Tactical Grid Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgba(0,229,255,0.06)] rounded-full blur-[180px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgba(245,158,11,0.04)] rounded-full blur-[180px] pointer-events-none"></div>

            {/* Tactical Top Bar */}
            <header className="w-full px-4 md:px-8 py-3.5 flex justify-between items-center z-20 bg-[var(--bg-panel)] border-b border-[var(--grid-line)] shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)] shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-base font-bold tracking-wider font-data text-[var(--text-primary)] flex items-center gap-2">
                            RESCUELINK <span className="text-[var(--safety-cyan)] text-[0.65rem] px-1.5 py-0.5 bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.3)] rounded">COMMAND</span>
                        </div>
                        <div className="text-[0.62rem] font-data text-[var(--text-muted)] tracking-wider uppercase">
                            Autonomous Industrial Worker Safety Platform
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[var(--safety-green)] font-data text-xs">
                        <span className="w-2 h-2 rounded-full bg-[var(--safety-green)] animate-pulse"></span>
                        <span>SYSTEM NOMINAL</span>
                    </div>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            navigate('/login');
                        }}
                        className="btn-tactical text-xs py-1.5 px-3"
                    >
                        LOGIN HUB 🔑
                    </button>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            navigate('/supervisor');
                        }}
                        className="btn-tactical btn-tactical-primary text-xs py-1.5 px-3"
                    >
                        COMMAND CENTER 🛡️
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 z-10 text-center px-4 py-10 max-w-5xl mx-auto flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] text-[var(--safety-cyan)] text-xs mb-5 font-data tracking-wider uppercase">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-[var(--safety-cyan)]" />
                        <span>INTELLIGENT WORKER SAFETY & EMERGENCY RESPONSE</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight tracking-tight text-[var(--text-bright)] font-display max-w-4xl">
                        Autonomous Safety Intelligence for <br />
                        <span className="text-[var(--safety-cyan)] text-glow-cyan">
                            Hazardous Industrial Environments
                        </span>
                    </h1>

                    {/* 6 Core Philosophy Pillars */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-2 font-data text-xs font-bold text-[var(--text-secondary)]">
                        {['CONNECT', 'MONITOR', 'LOCATE', 'ANALYZE', 'DETECT', 'RESPOND'].map((word, i) => (
                            <span key={word} className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] text-[var(--safety-cyan)]">
                                    {word}
                                </span>
                                {i < 5 && <span className="text-[var(--text-muted)]">•</span>}
                            </span>
                        ))}
                    </div>

                    <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed mt-3">
                        Connect operators with Command Centers through live biometric vitals, predictive hazard trends, automated geofencing, nearest responder dispatch, and smart emergency evacuation routes.
                    </p>

                    {/* Fast Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center w-full max-w-md mb-8">
                        <button
                            onClick={() => {
                                soundService.playClick();
                                navigate('/supervisor');
                            }}
                            className="btn-tactical btn-tactical-primary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] cursor-pointer"
                        >
                            <Shield className="w-4.5 h-4.5" />
                            <span>SUPERVISOR COMMAND HUB</span>
                        </button>

                        <button
                            onClick={() => {
                                soundService.playClick();
                                navigate('/worker');
                            }}
                            className="btn-tactical py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 border-[var(--grid-line)] text-[var(--text-primary)] hover:border-[var(--safety-cyan)] cursor-pointer"
                        >
                            <Smartphone className="w-4.5 h-4.5 text-[var(--safety-cyan)]" />
                            <span>WORKER MOBILE APP</span>
                        </button>
                    </div>
                </motion.div>

                {/* 1-Click Fast Demo Stakeholder Login Cards */}
                <div className="w-full my-6 p-5 rounded-xl bg-[var(--bg-panel)] border-2 border-[var(--grid-line)] hover:border-[var(--safety-cyan)] transition-all text-left shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[var(--grid-line)] pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="w-4.5 h-4.5 text-[var(--safety-cyan)]" />
                            <h2 className="font-data font-bold text-sm text-[var(--text-bright)] tracking-wider">
                                1-CLICK INSTANT DEMO STAKEHOLDER ACCESS
                            </h2>
                        </div>
                        <span className="text-[0.62rem] font-data px-2 py-0.5 rounded bg-[rgba(0,229,255,0.12)] text-[var(--safety-cyan)] font-bold">
                            NO PASSWORD REQUIRED
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {DEMO_ACCOUNTS.map((account) => {
                            const isWorker = account.role === 'worker';
                            return (
                                <button
                                    key={account.id}
                                    onClick={() => {
                                        soundService.playClick();
                                        navigate(account.path);
                                    }}
                                    className="p-3.5 rounded-lg bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] hover:border-[var(--safety-cyan)] hover:bg-[rgba(0,229,255,0.06)] transition-all text-left cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{account.avatar}</span>
                                            <span className={`text-[0.6rem] font-data font-bold px-1.5 py-0.5 rounded uppercase ${isWorker ? 'bg-[rgba(16,185,129,0.15)] text-[var(--safety-green)] border border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(0,229,255,0.15)] text-[var(--safety-cyan)] border border-[rgba(0,229,255,0.3)]'}`}>
                                                {account.badge}
                                            </span>
                                        </div>

                                        <div className="font-data font-bold text-xs text-[var(--text-bright)] group-hover:text-[var(--safety-cyan)] transition-colors">
                                            {account.name}
                                        </div>
                                        <div className="font-data text-[0.68rem] text-[var(--text-muted)]">
                                            {account.id} • {account.zone}
                                        </div>
                                        <div className="font-data text-[0.65rem] text-[var(--text-secondary)] mt-1">
                                            {account.title}
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-[var(--grid-line)] flex items-center justify-between text-[0.68rem] font-data text-[var(--safety-cyan)] font-semibold">
                                        <span>Enter Portal</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feature Grid Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6 text-left">
                    <div className="p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] hover:border-[var(--safety-cyan)] transition-colors">
                        <div className="w-8 h-8 rounded bg-[rgba(0,229,255,0.1)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)] mb-3">
                            <Zap className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="font-data font-bold text-sm text-[var(--text-primary)] mb-1">
                            AI Worker Risk Engine (0-100)
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            Continuous multi-factor heuristic assessment calculating heat stress, gas PPM, heart rate, and fatigue before incidents occur.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] hover:border-[var(--safety-amber)] transition-colors">
                        <div className="w-8 h-8 rounded bg-[rgba(245,158,11,0.1)] border border-[var(--safety-amber)] flex items-center justify-center text-[var(--safety-amber)] mb-3">
                            <Navigation className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="font-data font-bold text-sm text-[var(--text-primary)] mb-1">
                            Nearest Responder & Routing
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            Spatial pathfinding calculates obstacle-avoiding evacuation vectors to safe surface portals while bypassing danger zones.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--grid-line)] hover:border-[var(--safety-red)] transition-colors">
                        <div className="w-8 h-8 rounded bg-[rgba(239,68,68,0.1)] border border-[var(--safety-red)] flex items-center justify-center text-[var(--safety-red)] mb-3">
                            <Clock className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="font-data font-bold text-sm text-[var(--text-primary)] mb-1">
                            Automated 60s Escalation
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            Strict triage countdown protocols from 0s SOS trigger to 5s notification to 30s escalation to site-wide emergency dispatch.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-4 border-t border-[var(--grid-line)] bg-[var(--bg-panel)] px-6 flex flex-col sm:flex-row items-center justify-between font-data text-xs text-[var(--text-muted)]">
                <div>RESCUELINK PLATFORM // BUILT WITH TACTICAL RELIABILITY</div>
                <div className="mt-2 sm:mt-0 flex gap-4">
                    <button onClick={() => navigate('/supervisor')} className="hover:text-[var(--safety-cyan)]">Command Hub</button>
                    <button onClick={() => navigate('/worker')} className="hover:text-[var(--safety-cyan)]">Worker View</button>
                    <button onClick={() => navigate('/login')} className="hover:text-[var(--safety-cyan)]">Stakeholder Login</button>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
