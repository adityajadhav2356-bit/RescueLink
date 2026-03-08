import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Users, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Landing = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div
            className="min-h-screen text-[#e2e8f0] relative overflow-hidden flex flex-col items-center justify-center"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(2, 5, 11, 0.75), rgba(5, 10, 20, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Background Animated Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] rounded-full blur-[150px] opacity-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Navigation */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10 glass-panel border-b-0">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[var(--primary)] w-8 h-8" />
                    <span className="text-2xl font-bold tracking-wider text-glow text-white">RescueLink</span>
                </div>
                <div className="flex items-center gap-2 relative group cursor-pointer bg-[#050a14] py-2 px-4 rounded-full border border-[rgba(0,240,255,0.2)]">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-semibold text-white uppercase">{i18n.language}</span>
                    <div className="absolute top-full right-0 mt-2 bg-black border border-[rgba(0,240,255,0.2)] rounded-lg overflow-hidden flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto max-h-64 overflow-y-auto">
                        <button onClick={() => changeLanguage('en')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'en' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>English</button>
                        <button onClick={() => changeLanguage('hi')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'hi' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>हिंदी</button>
                        <button onClick={() => changeLanguage('bn')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'bn' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>বাংলা</button>
                        <button onClick={() => changeLanguage('te')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'te' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>తెలుగు</button>
                        <button onClick={() => changeLanguage('mr')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'mr' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>मराठी</button>
                        <button onClick={() => changeLanguage('ta')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'ta' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>தமிழ்</button>
                        <button onClick={() => changeLanguage('ur')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'ur' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>اردو</button>
                        <button onClick={() => changeLanguage('gu')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'gu' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>ગુજરાતી</button>
                        <button onClick={() => changeLanguage('kn')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'kn' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>ಕನ್ನಡ</button>
                        <button onClick={() => changeLanguage('ml')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'ml' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>മലയാളം</button>
                        <button onClick={() => changeLanguage('pa')} className={`px-4 py-2 text-sm text-left hover:bg-[rgba(0,240,255,0.1)] ${i18n.language === 'pa' ? 'text-[var(--primary)]' : 'text-gray-300'}`}>ਪੰਜਾਬੀ</button>
                    </div>
                </div>
            </nav>

            {/* Hero Content */}
            <main className="z-10 text-center px-4 mt-20 max-w-4xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.05)] text-[var(--primary)] text-sm mb-6 font-medium">
                        {t('Smart Worker Safety Monitoring')}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
                        {t('Secure the')} <span className="text-[var(--primary)] text-glow">{t('Future')}</span> {t('of Worker Safety')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        {t('Monitor workers, detect hazards, and respond to emergencies instantly. The ultimate platform for mines, tunnels, and hazardous environments.')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[#02050b] font-bold text-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 transform hover:scale-105"
                        >
                            {t('Login')} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Features Preview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {[
                        { icon: <Activity className="w-8 h-8 text-[var(--accent)]" />, title: t("Real-time Tracking"), desc: t("Live vitals & locational data.") },
                        { icon: <ShieldAlert className="w-8 h-8 text-[var(--danger)]" />, title: t("Hazard Detection"), desc: t("Instant environmental alerts.") },
                        { icon: <Users className="w-8 h-8 text-[var(--safe)]" />, title: t("Command Center"), desc: t("Complete fleet visibility.") }
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="bg-[#050a14] p-4 rounded-full mb-4 border border-[rgba(0,240,255,0.2)]">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default Landing;
