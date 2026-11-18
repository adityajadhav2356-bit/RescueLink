import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

export const Login = ({ setUser }) => {
    const [workerId, setWorkerId] = useState('W-042');
    const [password, setPassword] = useState('rescuelink2026');
    const [role, setRole] = useState('worker'); // 'worker' | 'supervisor'
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        soundService.playClick();
        const newUser = {
            id: workerId,
            name: workerId === 'W-042' ? 'Alex Mercer' : workerId === 'W-011' ? 'Sarah Connor' : 'Commander Vance',
            role
        };
        if (setUser) setUser(newUser);
        navigate(role === 'worker' ? '/worker' : '/supervisor');
    };

    const handleQuickSelect = (id, r, pass = 'rescuelink2026') => {
        soundService.playClick();
        setWorkerId(id);
        setRole(r);
        setPassword(pass);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-body text-[var(--text-primary)] bg-[var(--bg-void)] select-none">
            {/* Ambient Lighting */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[rgba(0,229,255,0.08)] rounded-full blur-[160px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[rgba(245,158,11,0.05)] rounded-full blur-[160px] pointer-events-none"></div>

            <motion.div
                className="bezel-panel w-full max-w-md p-8 rounded-lg z-10 relative border border-[var(--grid-line)] shadow-2xl bg-[var(--bg-panel)] font-data"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
            >
                {/* Command Badge */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(0,229,255,0.12)] border border-[var(--safety-cyan)] flex items-center justify-center text-[var(--safety-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                        <Shield className="w-6 h-6" />
                    </div>
                </div>

                <div className="text-center mb-6">
                    <span className="text-[0.65rem] uppercase tracking-widest text-[var(--safety-cyan)] block mb-1 font-bold">
                        TACTICAL STAKEHOLDER AUTHENTICATION
                    </span>
                    <h2 className="text-2xl font-bold text-[var(--text-bright)]">
                        RESCUELINK ACCESS HUB
                    </h2>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                        Secure Industrial Worker & Command Center Portals
                    </p>
                </div>

                {/* Fast One-Click Stakeholder Fill */}
                <div className="mb-5 space-y-1.5">
                    <div className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                        FAST DEMO STAKEHOLDERS (1-CLICK)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => handleQuickSelect('W-042', 'worker')}
                            className={`p-2 rounded border text-left transition-colors cursor-pointer ${workerId === 'W-042' && role === 'worker' ? 'bg-[rgba(0,229,255,0.15)] border-[var(--safety-cyan)] text-[var(--safety-cyan)]' : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <div className="font-bold">👷 Worker W-042</div>
                            <div className="text-[0.62rem] opacity-80">Alex Mercer (Sector 7G)</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickSelect('W-011', 'worker')}
                            className={`p-2 rounded border text-left transition-colors cursor-pointer ${workerId === 'W-011' && role === 'worker' ? 'bg-[rgba(0,229,255,0.15)] border-[var(--safety-cyan)] text-[var(--safety-cyan)]' : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <div className="font-bold">👩‍🚒 Worker W-011</div>
                            <div className="text-[0.62rem] opacity-80">Sarah Connor (Tunnel B)</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickSelect('S-01', 'supervisor')}
                            className={`p-2 rounded border text-left transition-colors cursor-pointer ${workerId === 'S-01' && role === 'supervisor' ? 'bg-[rgba(0,229,255,0.15)] border-[var(--safety-cyan)] text-[var(--safety-cyan)]' : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <div className="font-bold">🛡️ Supervisor S-01</div>
                            <div className="text-[0.62rem] opacity-80">Command Center Lead</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickSelect('ADMIN-01', 'supervisor')}
                            className={`p-2 rounded border text-left transition-colors cursor-pointer ${workerId === 'ADMIN-01' && role === 'supervisor' ? 'bg-[rgba(0,229,255,0.15)] border-[var(--safety-cyan)] text-[var(--safety-cyan)]' : 'bg-[var(--bg-panel-elevated)] border-[var(--grid-line)] text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <div className="font-bold">⚡ Chief Admin</div>
                            <div className="text-[0.62rem] opacity-80">Safety Officer</div>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                        <label className="text-[0.65rem] text-[var(--text-muted)] uppercase block mb-1">
                            IDENTIFIER TRANSPONDER ID
                        </label>
                        <input
                            type="text"
                            value={workerId}
                            onChange={(e) => setWorkerId(e.target.value)}
                            className="w-full bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] rounded py-2 px-3 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--safety-cyan)] font-mono"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[0.65rem] text-[var(--text-muted)] uppercase block mb-1">
                            SECURITY KEY / PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] rounded py-2 px-3 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--safety-cyan)] font-mono"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-tactical btn-tactical-primary w-full py-2.5 text-xs font-bold mt-2 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    >
                        <span>AUTHENTICATE & ENTER {role === 'worker' ? 'WORKER APP' : 'COMMAND HUB'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
