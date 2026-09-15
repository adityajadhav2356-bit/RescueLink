import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundService } from '../services/soundService';

export const VoiceIntercomModal = ({
    currentUser = { name: 'Operator' },
    onTriggerEmergency = () => { },
    onClose = () => { }
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('Tactical Voice Intercom standing by. Speak safety command or SOS...');
    const [activeLang, setActiveLang] = useState('en-US'); // 'en-US' | 'hi-IN' | 'mr-IN'

    const recognitionRef = useRef(null);

    useEffect(() => {
        soundService.playClick();
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = activeLang;

            rec.onresult = (event) => {
                let text = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    text += event.results[i][0].transcript;
                }
                setTranscript(text);
                processCommand(text);
            };

            rec.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current = rec;
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, [activeLang]);

    const toggleListening = () => {
        soundService.playClick();
        if (!isListening) {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
                setTranscript('');
                setAiResponse('Listening on high-frequency safety channel...');
            } catch (e) {
                setIsListening(true);
                // Fallback simulation if microphone not allowed
                simulateVoiceInput();
            }
        } else {
            try {
                recognitionRef.current?.stop();
            } catch (e) { }
            setIsListening(false);
        }
    };

    const simulateVoiceInput = () => {
        setTimeout(() => {
            setTranscript("Mayday, toxic gas detected in Tunnel B. Need immediate rescue!");
            processCommand("Mayday, toxic gas detected in Tunnel B. Need immediate rescue!");
            setIsListening(false);
        }, 2200);
    };

    const processCommand = (spoken) => {
        const lower = spoken.toLowerCase();
        // SOS Emergency Keywords in EN, HI, MR
        if (
            lower.includes('sos') ||
            lower.includes('help') ||
            lower.includes('emergency') ||
            lower.includes('mayday') ||
            lower.includes('बचाओ') ||
            lower.includes('मदद') ||
            lower.includes('मदत') ||
            lower.includes('वाचवा')
        ) {
            soundService.playEmergencyAlarm();
            setAiResponse('🚨 CRITICAL SOS RECOGNIZED! Immediate alert broadcast to Surface Command Hub.');
            onTriggerEmergency({
                reason: `Voice SOS: "${spoken}"`,
                timestamp: new Date().toISOString()
            });
        } else if (lower.includes('status') || lower.includes('स्थिति')) {
            setAiResponse('✓ Transponder operational. Telemetry nominal: Temp 31°C, Gas 12 PPM, Battery 85%.');
        } else if (lower.includes('evacuate') || lower.includes('बाहर')) {
            setAiResponse('🧭 Evacuation order acknowledged. Proceed to Surface Shaft Alpha (140m East).');
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
            <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--safety-cyan)] rounded-lg shadow-2xl overflow-hidden font-data text-xs flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[var(--bg-panel-elevated)] border-b border-[var(--grid-line)] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="beacon-pulse"></span>
                        <span className="font-bold text-xs text-[var(--safety-cyan)] uppercase tracking-wider">
                            TACTICAL VOICE SAFETY INTERCOM // CHANNEL 16
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            soundService.playClick();
                            onClose();
                        }}
                        className="text-[var(--text-muted)] hover:text-white cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="p-6 flex flex-col items-center justify-center bg-[var(--bg-void)]/60 border-b border-[var(--grid-line)]">
                    <div className="flex items-center gap-1.5 h-14 mb-4">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 rounded-full transition-all ${isListening
                                    ? 'bg-[var(--safety-cyan)] animate-pulse'
                                    : 'bg-[var(--grid-line)]'
                                    }`}
                                style={{
                                    height: isListening ? `${20 + Math.sin(i + Date.now() / 200) * 25 + Math.random() * 20}px` : '6px',
                                    animationDelay: `${i * 0.1}s`,
                                    boxShadow: isListening ? '0 0 8px rgba(0,229,255,0.4)' : 'none'
                                }}
                            ></div>
                        ))}
                    </div>

                    <button
                        onClick={toggleListening}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${isListening
                            ? 'bg-[var(--safety-red)] text-white animate-pulse border-2 border-white'
                            : 'bg-[rgba(0,229,255,0.15)] border-2 border-[var(--safety-cyan)] text-[var(--safety-cyan)] hover:scale-105'
                            }`}
                    >
                        {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                    </button>

                    <div className="font-data text-xs mt-3 text-[var(--text-secondary)]">
                        {isListening ? (
                            <span className="text-[var(--safety-cyan)] font-bold animate-pulse">
                                ● LISTENING... (Speak SOS or Status Query)
                            </span>
                        ) : (
                            <span>Tap microphone to transmit voice query</span>
                        )}
                    </div>
                </div>

                {/* Live Transcript & AI Safety Guidance */}
                <div className="p-4 space-y-3">
                    <div>
                        <span className="text-[0.65rem] text-[var(--text-muted)] uppercase block mb-1">
                            TRANSCRIPT
                        </span>
                        <div className="p-2.5 rounded bg-[var(--bg-panel-elevated)] border border-[var(--grid-line)] min-h-[44px] text-[var(--text-primary)] font-mono text-[0.72rem]">
                            {transcript ? `"${transcript}"` : <span className="text-[var(--text-muted)] italic">Awaiting speech audio...</span>}
                        </div>
                    </div>

                    <div>
                        <span className="text-[0.65rem] text-[var(--text-muted)] uppercase block mb-1">
                            AI SAFETY RESPONSE
                        </span>
                        <div className="p-2.5 rounded bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.3)] text-[var(--safety-cyan)] text-[0.72rem] leading-relaxed">
                            {aiResponse}
                        </div>
                    </div>

                    {/* Multilingual Selector */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-[0.65rem] text-[var(--text-muted)]">LANGUAGE:</span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setActiveLang('en-US')}
                                className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${activeLang === 'en-US' ? 'bg-[var(--safety-cyan)] text-black' : 'bg-[var(--bg-panel-elevated)] text-[var(--text-muted)]'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setActiveLang('hi-IN')}
                                className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${activeLang === 'hi-IN' ? 'bg-[var(--safety-cyan)] text-black' : 'bg-[var(--bg-panel-elevated)] text-[var(--text-muted)]'}`}
                            >
                                हिन्दी (HI)
                            </button>
                            <button
                                onClick={() => setActiveLang('mr-IN')}
                                className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${activeLang === 'mr-IN' ? 'bg-[var(--safety-cyan)] text-black' : 'bg-[var(--bg-panel-elevated)] text-[var(--text-muted)]'}`}
                            >
                                मराठी (MR)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Fast Triggers */}
                <div className="p-3 bg-[var(--bg-panel-elevated)] border-t border-[var(--grid-line)] flex gap-2">
                    <button
                        onClick={() => {
                            setTranscript("MAYDAY! Emergency in Tunnel B!");
                            processCommand("MAYDAY! Emergency in Tunnel B!");
                        }}
                        className="btn-tactical btn-tactical-danger text-[0.65rem] py-1 px-2 flex-1"
                    >
                        Test Voice SOS 🆘
                    </button>
                    <button
                        onClick={() => {
                            setTranscript("Requesting site status report.");
                            processCommand("Requesting site status report.");
                        }}
                        className="btn-tactical text-[0.65rem] py-1 px-2 flex-1"
                    >
                        Test Status Query 📊
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceIntercomModal;
