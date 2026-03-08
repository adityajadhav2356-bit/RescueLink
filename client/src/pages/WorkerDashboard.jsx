import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Battery, Wifi, Thermometer, Wind, CheckCircle2, LogOut, Volume2, Mic, MicOff } from 'lucide-react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Auto-detect the server's network IP based on where the frontend is served from
const SERVER_URL = `http://${window.location.hostname}:5000`;
const socket = io(SERVER_URL, { autoConnect: false });

const mockWorkers = [
    { workerId: 'W-042', name: 'Alex Mercer', zone: 'Sector 7G', status: 'SAFE', envTemp: 32, airQuality: 'Good', battery: 85 },
    { workerId: 'W-011', name: 'Sarah Connor', zone: 'Tunnel B', status: 'WARNING', envTemp: 38, airQuality: 'Fair', battery: 45 },
    { workerId: 'W-007', name: 'James Bond', zone: 'Deep Shaft 3', status: 'SAFE', envTemp: 28, airQuality: 'Good', battery: 90 }
];

const WorkerDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const initialData = mockWorkers.find(w => w.workerId === user?.id) || {
        name: `Worker ${user?.id || 'Unknown'}`,
        workerId: user?.id || 'W-XXX',
        zone: 'Unassigned',
        battery: 100,
        connectivity: 'Strong',
        envTemp: 25,
        airQuality: 'Good',
        status: 'SAFE'
    };

    const [data, setData] = useState(initialData);
    const [sosActive, setSosActive] = useState(false);
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Inspect ventilation shaft B', completed: false },
        { id: 2, text: 'Calibrate pressure sensors', completed: true },
        { id: 3, text: 'Report to surface at 17:00', completed: false },
    ]);
    const [isListening, setIsListening] = useState(false);
    const [transcriptText, setTranscriptText] = useState('');
    const recognitionRef = React.useRef(null);
    const isListeningRef = React.useRef(isListening);

    React.useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    const getLangCode = (lng) => {
        const map = {
            en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN',
            ta: 'ta-IN', ur: 'ur-PK', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN'
        };
        const shortLng = (lng || 'en').split('-')[0];
        return map[shortLng] || 'en-US';
    };

    const currentLangCode = getLangCode(i18n.language);

    // Initialize Speech Recognition logic once
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setTranscriptText("Speech Recognition not supported. Use Google Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                finalTranscript += event.results[i][0].transcript.toLowerCase() + ' ';
            }

            setTranscriptText(finalTranscript.trim());

            const text = finalTranscript.toLowerCase();
            const triggers = ['help', 'sos', 'emergency', 'मदद', 'बचाओ', 'madad', 'bachao', 'test'];

            if (triggers.some(trigger => text.includes(trigger))) {
                setSosActive(prevSos => {
                    if (!prevSos) {
                        setData(currentData => {
                            if (currentData.status !== 'CRITICAL') {
                                socket.emit('emergency_alert', {
                                    workerId: currentData.workerId,
                                    name: currentData.name,
                                    zone: currentData.zone,
                                    type: 'Voice SOS Triggered',
                                    time: new Date().toISOString()
                                });
                                return { ...currentData, status: 'CRITICAL' };
                            }
                            return currentData;
                        });
                    }
                    return true;
                });
            }
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') return; // Ignore silent periods safely
            setTranscriptText(`Mic Error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            if (isListeningRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) { }
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Handle language changes and start/stop triggers
    useEffect(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.lang = currentLangCode;

        if (isListening) {
            try {
                recognitionRef.current.start();
                setTranscriptText("Mic active. Say 'Help', 'SOS', 'Madad', 'Bachao'...");
            } catch (e) {
                console.error("Mic start error", e);
            }
        } else {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
            if (!transcriptText.startsWith("Mic Error")) {
                setTranscriptText("");
            }
        }
    }, [isListening, currentLangCode]); useEffect(() => {
        socket.connect();
        // Simulate real-time updates
        const interval = setInterval(() => {
            setData(prev => {
                const newData = {
                    ...prev,
                    envTemp: prev.envTemp + (Math.random() > 0.5 ? 1 : -1),
                    battery: Math.max(0, prev.battery - 0.1)
                };
                socket.emit('worker_update', newData);
                return newData;
            });
        }, 5000);

        socket.on('alert_resolved', (resolvedData) => {
            if (resolvedData.workerId === initialData.workerId) {
                setData(prev => ({ ...prev, status: 'SAFE' }));
                setSosActive(false); // Turn off the SOS button effect
            }
        });

        return () => {
            clearInterval(interval);
            socket.off('alert_resolved');
            socket.disconnect();
        };
    }, []);

    const handleSOS = () => {
        setSosActive(true);
        setData(prev => ({ ...prev, status: 'CRITICAL' })); // Instant UI update on worker side
        socket.emit('emergency_alert', {
            workerId: data.workerId,
            name: data.name,
            zone: data.zone,
            type: 'SOS Button Pressed',
            time: new Date().toISOString()
        });

        // The SOS effect will now remain indefinitely until the supervisor acknowledges it
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const speakGuidance = () => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Cancel any ongoing speech

        let introText = "Welcome to Rescue Link. Your status is currently Safe. To trigger an emergency alert, press the large red SOS button in the center of the screen, or say the word 'Help'.";

        const shortLng = (i18n.language || 'en').split('-')[0];
        if (shortLng === 'hi') introText = "रेस्क्यू लिंक में आपका स्वागत है। आपकी स्थिति सुरक्षित है। आपातकाल के लिए, लाल बटन दबाएं या 'मदद' बोलें।";
        else if (shortLng === 'bn') introText = "রেসকিউ লিঙ্কে স্বাগতম। আপনার অবস্থা নিরাপদ। জরুরি অবস্থার জন্য 'বাঁচাও' বলুন।";
        else if (shortLng === 'mr') introText = "रेस्क्यू लिंक मध्ये आपले स्वागत आहे। आपत्कालीन परिस्थितीसाठी 'मदत' म्हणा।";
        else if (shortLng === 'gu') introText = "રેસ્ક્યુ લિંકમાં આપનું સ્વાગત છે. કટોકટી માટે સપાટી પર લાલ બટન દબાવો અથવા 'મદદ' બોલો.";
        else if (shortLng === 'te') introText = "రెస్క్యూ లింక్‌కు స్వాగతం. మీ స్థితి సురక్షితం. అత్యవసర పరిస్థితి కోసం ఎర్ర బటన్‌ను నొక్కండి లేదా 'హెల్ప్' అని చెప్పండి.";

        const msg = new SpeechSynthesisUtterance();
        msg.text = introText;
        msg.lang = currentLangCode; // Use the matching accent/voice engine
        msg.rate = 0.9;
        window.speechSynthesis.speak(msg);
    };

    const statusColor = data.status === 'SAFE' ? 'text-[var(--safe)]' : data.status === 'WARNING' ? 'text-[var(--warning)]' : 'text-[var(--danger)]';
    const statusGlow = data.status === 'SAFE' ? 'glow-safe' : data.status === 'WARNING' ? 'glow-warning' : 'glow-danger';

    return (
        <div
            className="min-h-screen text-white p-4 font-sans safe-area-pt"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(2, 5, 11, 0.85), rgba(5, 10, 20, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Header */}
            <header className="flex justify-between items-center mb-6 pt-4 glass-panel p-4 rounded-2xl">
                <div>
                    <h1 className="text-xl font-bold">{data.name}</h1>
                    <p className="text-sm text-gray-400">ID: {data.workerId} | Zone: {data.zone}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full font-bold text-sm tracking-wider ${statusColor} ${statusGlow} bg-[rgba(0,0,0,0.5)] border border-current`}>
                        {t(data.status)}
                    </div>
                    <button
                        onClick={speakGuidance}
                        className={`p-2 rounded-full transition-colors bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300`}
                        title="Voice Guidance"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsListening(!isListening)}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-[rgba(0,240,255,0.2)] text-[var(--primary)] shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300'}`}
                        title="Toggle Voice Assistant"
                    >
                        {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Voice Assistant Feedback */}
            {isListening && (
                <div className="flex justify-center mb-4">
                    <div className="bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] px-4 py-2 rounded-full flex items-center gap-2 max-w-sm w-full">
                        <Mic className="w-4 h-4 text-[var(--primary)] animate-pulse" />
                        <span className="text-sm text-gray-300 truncate font-mono">
                            {transcriptText ? `> ${transcriptText}` : "Say 'Help' or 'मदद'..."}
                        </span>
                    </div>
                </div>
            )}

            {/* Main SOS Button */}
            <div className="flex justify-center my-8 relative">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSOS}
                    className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 ${sosActive ? 'border-[var(--danger)] bg-[rgba(255,0,85,0.2)]' : 'border-[#ff005540] bg-[rgba(255,0,85,0.05)]'} transition-all`}
                >
                    {/* Animated rings */}
                    <div className={`absolute inset-0 rounded-full border-2 border-[var(--danger)] opacity-50 ${sosActive ? 'animate-ping' : ''}`}></div>
                    <div className={`absolute inset-[-20px] rounded-full border border-[var(--danger)] opacity-20 ${sosActive ? 'animate-pulse' : ''}`}></div>

                    <ShieldAlert className={`w-20 h-20 ${sosActive ? 'text-[var(--danger)] animate-bounce' : 'text-[var(--danger)] opacity-80'}`} />
                    <span className={`text-2xl font-black mt-2 tracking-widest ${sosActive ? 'text-[var(--danger)] text-glow' : 'text-[var(--danger)] opacity-80'}`}>SOS</span>
                </motion.button>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
                    <Battery className={`w-8 h-8 mb-2 ${data.battery > 20 ? 'text-[var(--safe)]' : 'text-[var(--danger)]'}`} />
                    <span className="text-2xl font-bold">{data.battery.toFixed(0)}%</span>
                    <span className="text-xs text-gray-400">{t("Power")}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
                    <Wifi className={`w-8 h-8 mb-2 text-[var(--primary)]`} />
                    <span className="text-xl font-bold">{data.connectivity}</span>
                    <span className="text-xs text-gray-400">{t("Signal")}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
                    <Thermometer className={`w-8 h-8 mb-2 ${data.envTemp < 40 ? 'text-[var(--safe)]' : 'text-[var(--danger)]'}`} />
                    <span className="text-2xl font-bold">{data.envTemp.toFixed(1)}°C</span>
                    <span className="text-xs text-gray-400">{t("Temperature")}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
                    <Wind className={`w-8 h-8 mb-2 text-[var(--safe)]`} />
                    <span className="text-xl font-bold">{data.airQuality}</span>
                    <span className="text-xs text-gray-400">{t("Air Quality")}</span>
                </div>
            </div>

            {/* Task Checklist */}
            <div className="glass-panel rounded-2xl p-5 mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-[var(--primary)]" />
                    {t("Daily Tasks")}
                </h3>
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#050a14] border border-[rgba(0,240,255,0.1)] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{t(task.text)}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-[var(--safe)] bg-[var(--safe)]' : 'border-gray-500'}`}>
                                {task.completed && <CheckCircle2 className="text-[#050a14] w-4 h-4" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
