// components/voice-input.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // We need to create this or use checks, actually I'll inline the clsx logic to be safe if utils doesn't exist.

export function VoiceInput({
    onTranscribe,
    isLoading
}: {
    onTranscribe: (text: string) => void;
    isLoading?: boolean;
}) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            if (SpeechRecognition) {
                const speechRec = new SpeechRecognition();
                speechRec.continuous = false;
                speechRec.interimResults = false;
                speechRec.lang = 'en-US';

                speechRec.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscribe(transcript);
                    setIsListening(false);
                };

                speechRec.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                speechRec.onend = () => {
                    setIsListening(false);
                };

                setRecognition(speechRec);
            }
        }
    }, [onTranscribe]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center gap-6">
            <div className="relative group">
                {/* Active State Effects */}
                {isListening && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse-glow" />
                        <div className="absolute -inset-4 rounded-full border border-blue-500/10 animate-spin-slow dashed-border" />
                    </>
                )}

                {/* Button */}
                <button
                    onClick={toggleListening}
                    disabled={isLoading || !recognition}
                    className={cn(
                        "relative z-10 flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ease-out backdrop-blur-xl border border-white/10",
                        isListening
                            ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110"
                            : "bg-white/5 hover:bg-white/10 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95",
                        isLoading && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                    ) : (
                        <div className={cn("transition-transform duration-300", isListening ? "scale-110" : "scale-100")}>
                            {isListening ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            )}
                        </div>
                    )}
                </button>
            </div>

            {/* Status Text */}
            <div className="h-8 flex items-center justify-center">
                <p className={cn(
                    "text-sm font-medium tracking-wide transition-all duration-300",
                    isListening ? "text-red-400 animate-pulse" : "text-gray-400"
                )}>
                    {isLoading ? 'Processing...' : isListening ? 'Listening...' : 'Tap to Speak'}
                </p>
            </div>
        </div>
    );
}
