import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCircle, Lock, ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = ({ setUser }) => {
    const [workerId, setWorkerId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('worker'); // worker or supervisor
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogin = (e) => {
        e.preventDefault();
        if (workerId && password) {
            // Mock login validation
            const newUser = { id: workerId, role };
            setUser(newUser);
            navigate(`/${role}`);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(2, 5, 11, 0.75), rgba(5, 10, 20, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-[var(--primary)] rounded-full blur-[120px] opacity-15"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-[var(--danger)] rounded-full blur-[120px] opacity-10"></div>

            <motion.div
                className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-dark)] p-3 rounded-full border border-[var(--primary)] glow-primary">
                    <ShieldCheck className="w-10 h-10 text-[var(--primary)]" />
                </div>

                <h2 className="text-3xl font-bold text-center mt-6 mb-2 text-white tracking-wide">{t("Secure Access")}</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">{t("Enter credentials to access RescueLink")}</p>

                <div className="flex bg-[#050a14] rounded-xl p-1 mb-8 border border-[rgba(0,240,255,0.2)]">
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'worker' ? 'bg-[var(--primary)] text-[#02050b]' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('worker')}
                    >
                        {t("Worker")}
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'supervisor' ? 'bg-[var(--primary)] text-[#02050b]' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('supervisor')}
                    >
                        {t("Supervisor")}
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder={role === 'worker' ? t("Worker ID") : t("Supervisor ID")}
                            value={workerId}
                            onChange={(e) => setWorkerId(e.target.value)}
                            className="w-full bg-[#050a14] border border-[rgba(0,240,255,0.2)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] focus:glow-primary transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="password"
                            placeholder={t("Password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#050a14] border border-[rgba(0,240,255,0.2)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] focus:glow-primary transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[#02050b] font-bold text-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all flex justify-center items-center gap-2 group"
                    >
                        {t("Authenticating System")}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {role === 'worker' ? (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1"><Info className="w-4 h-4" /> {t("Active Worker IDs for Demo:")}</p>
                            <div className="flex gap-2 justify-center">
                                {['W-042', 'W-011', 'W-007'].map(id => (
                                    <span key={id} onClick={() => { setWorkerId(id); setPassword('password'); }} className="px-3 py-1 bg-[#050a14] border border-[rgba(0,240,255,0.3)] rounded-full text-xs text-[var(--primary)] cursor-pointer hover:bg-[rgba(0,240,255,0.1)] transition-colors">{id}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1"><Info className="w-4 h-4" /> {t("Active Supervisor IDs for Demo:")}</p>
                            <div className="flex gap-2 justify-center">
                                {['SUP-001', 'SUP-002'].map(id => (
                                    <span key={id} onClick={() => { setWorkerId(id); setPassword('password'); }} className="px-3 py-1 bg-[#050a14] border border-[rgba(0,240,255,0.3)] rounded-full text-xs text-[var(--primary)] cursor-pointer hover:bg-[rgba(0,240,255,0.1)] transition-colors">{id}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
