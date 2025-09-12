import { useState, useEffect, useRef, useCallback } from "react";
import Controls from "./Controls";
import InputSection from "./InputSection";
import PhraseCard from "./PhraseCard";

const STORAGE_KEY = "englishLearningData";
// Status Indicator Component
function StatusIndicator({ message }) {
    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-lg font-bold text-white shadow-2xl transition-all duration-500 ease-out ${message
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-24 opacity-0 scale-95"
                } bg-gradient-to-r from-red-600 via-gray-100 to-blue-600 border-2 border-white text-gray-800`}
        >
            <div className="flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                {message}
            </div>
        </div>
    );
}

// Initial phrases
const initialPhrases = [
    "Welcome!",
];

export default function EnglishLearningApp() {
    const [phrases, setPhrases] = useState([]);
    const [status, setStatus] = useState("");
    const [playAllQueue, setPlayAllQueue] = useState([]);
    const [, setCurrentIndex] = useState(0);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [rate, setRate] = useState(1);
    const [voices, setVoices] = useState([]);
    const [voice, setVoice] = useState(null);

    const [activeId, setActiveId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    // Modal states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [isEmptyModalOpen, setIsEmptyModalOpen] = useState(false);
    const [isEmptyModalClosing, setIsEmptyModalClosing] = useState(false);

    const utteranceRef = useRef(null);
    const timerRef = useRef(null);
    const totalDurationRef = useRef(null);

    const showStatus = (msg) => {
        setStatus(msg);
        setTimeout(() => setStatus(""), 1800);
    };
    const playNextRef = useRef();

    const speak = useCallback((text, id) => {
        if (!voice) {
            showStatus("⚠️ No voice available");
            return;
        }

        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);

        const u = new SpeechSynthesisUtterance(text);
        u.lang = voice.lang;
        u.rate = rate;
        u.pitch = 1;
        u.voice = voice;

        u.onstart = () => {
            utteranceRef.current = u;
            setActiveId(id);
            setIsPaused(false);

            showStatus(
                <span className="flex items-center gap-2">
                    <img src="speaker_icon.png" alt="speaking icon" className="w-5 h-5" />
                    Speaking...
                </span>
            );

            setProgress(0);
            setTimeSpent(0);

            const wordsPerMinute = 150;
            const totalWords = text.split(/\s+/).length;
            const estimatedDuration = (totalWords / (wordsPerMinute * rate)) * 60;
            totalDurationRef.current = estimatedDuration;
            setTimeLeft(estimatedDuration.toFixed(1));

            let elapsed = 0;
            timerRef.current = setInterval(() => {
                if (!window.speechSynthesis.paused) {
                    elapsed += 100;
                    setTimeSpent((elapsed / 1000).toFixed(1));
                    const remainingTime = Math.max(0, estimatedDuration - (elapsed / 1000));
                    setTimeLeft(remainingTime.toFixed(1));
                    const percent = (elapsed / 1000) / estimatedDuration * 100;
                    setProgress(Math.min(100, percent));
                }
            }, 100);
        };

        u.onend = () => {
            clearInterval(timerRef.current);
            setProgress(100);
            setTimeLeft(0);
            utteranceRef.current = null;
            setActiveId(null);
            setIsPaused(false);

            if (isPlayingAll && playNextRef.current) {
                playNextRef.current();
            }
        };

        window.speechSynthesis.speak(u);
    }, [voice, rate, isPlayingAll]);

    const playNext = useCallback(() => {
        setCurrentIndex(prevIndex => {
            const next = prevIndex + 1;
            if (next < phrases.length) {
                speak(phrases[next], next);
                return next;
            } else {
                setIsPlayingAll(false);
                setPlayAllQueue([]);
                showStatus("✅ Finished all phrases");
                return 0;
            }
        });
    }, [phrases, speak]);

    playNextRef.current = playNext;

    const pause = useCallback((id) => {
        if (activeId === id && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);

            showStatus(
                <span className="flex items-center gap-2">
                    <img src="pause-circle.svg" alt="icon" className="w-5 h-5" />
                    Paused
                </span>
            );
        }
    }, [activeId]);


    const resume = useCallback((id) => {
        if (activeId === id && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);

            showStatus(
                <span className="flex items-center gap-2">
                    <img src="play-button.png" alt="icon" className="w-5 h-5" />
                    Resumed
                </span>
            );
        }
    }, [activeId]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.phrases?.length) setPhrases(parsed.phrases);
                if (parsed.rate !== undefined) setRate(Number(parsed.rate));
            } catch (e) {
                console.error("Error parsing saved data:", e);
            }
        } else {
            setPhrases(initialPhrases);
        }

        const synth = window.speechSynthesis;
        const loadVoices = () => {
            const allVoices = synth.getVoices();
            setVoices(allVoices);

            const savedVoiceURI = localStorage.getItem("preferredVoiceURI");
            const preferredVoice = allVoices.find(v => v.voiceURI === savedVoiceURI) || allVoices[0];
            setVoice(preferredVoice || null);
        };

        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        } else {
            loadVoices();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ phrases, rate, timestamp: Date.now() })
        );
        if (voice) {
            localStorage.setItem("preferredVoiceURI", voice.voiceURI);
        }
    }, [phrases, rate, voice]);

    useEffect(() => {
        if (playAllQueue.length > 0) {
            setIsPlayingAll(true);
            setCurrentIndex(0);
            speak(playAllQueue[0], 0);
        }
    }, [playAllQueue, speak]);

    // Check if phrases become empty, and show empty modal if so.
    // useEffect(() => {
    //     if (phrases.length === 0) {
    //         setIsEmptyModalOpen(true);
    //     }
    // }, [phrases]);

    const playAll = () => {
        if (!phrases.length) {
            return showStatus(
                <span>
                    <img src="written_icon.png" alt="icon" style={{ display: "inline", width: "20px", marginRight: "6px" }} />
                    No phrases to play
                </span>
            );
        }
        setPlayAllQueue([...phrases]);
    };

    const pauseAll = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);

            showStatus(
                <span className="flex items-center gap-2">
                    <img src="pause-circle.svg" alt="icon" className="w-5 h-5" />
                    Paused all
                </span>
            );
        }
    };

    const resumeAll = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);

            showStatus(
                <span className="flex items-center gap-2">
                    <img src="play-button.png" alt="icon" className="w-5 h-5" />
                    Resumed all
                </span>
            );
        }
    };

    const stopAll = () => {
        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);
        setIsPlayingAll(false);
        setPlayAllQueue([]);
        setActiveId(null);
        setIsPaused(false);
        setProgress(0);
        setTimeSpent(0);
        setTimeLeft(0);

        showStatus(
            <span className="flex items-center gap-2">
                <img src="stop-button.svg" alt="stop icon" className="w-5 h-5 bg-amber-50 rounded-full" />
                Stopped
            </span>
        );
    };

    const addPhrase = (text) => {
        setPhrases((p) => [...p, text]);
        showStatus(
            <span className="flex items-center gap-2">
                <img src="pause-circle.svg" alt="icon" className="w-5 h-5" />
                Phrase added
            </span>
        );
    };

    const deletePhrase = (text, id) => {
        if (activeId === id) stopAll();
        setPhrases((p) => p.filter((x, idx) => !(x === text && idx === id)));

        showStatus(
            <span className="flex items-center gap-2">
                <img src="delete.png" alt="icon" className="w-5 h-5" />
                Phrase deleted
            </span>
        );
    };

    // New function to handle the "Clear Data" button logic
    const handleClearData = () => {
        if (phrases.length === 0) {
            // لو فاضي أصلاً ممكن بس نوري رسالة Status بدون مودال
            showStatus("⚠️ No phrases to clear");
        } else {
            setIsConfirmOpen(true);
        }
    };

    // Close modals
    const closeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setIsConfirmOpen(false);
            setIsModalClosing(false);
        }, 250);
    };

    const closeEmptyModal = () => {
        setIsEmptyModalClosing(true);
        setTimeout(() => {
            setIsEmptyModalOpen(false);
            setIsEmptyModalClosing(false);
        }, 250);
    };

    // مسح البيانات فعلياً
    const clearPhrasesData = () => {
        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);
        setPhrases([]);
        setPlayAllQueue([]);
        setActiveId(null);
        setIsPlayingAll(false);
        setIsPaused(false);
        setProgress(0);
        setTimeSpent(0);
        setTimeLeft(0);
        localStorage.removeItem(STORAGE_KEY);

        // نفتح مودال "No Phrases!" فقط بعد المسح
        setIsEmptyModalOpen(true);

        showStatus(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <img src="delete.png" alt="icon" style={{ width: "22px", height: "20px" }} />
                All phrases cleared
            </span>
        );
    };
    const handleClearConfirm = () => {
        clearPhrasesData();
        closeModal();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-blue-100 relative overflow-hidden pt-6">
            {/* Background & Stars */}
            <div className="absolute inset-0 overflow">
                <div className="absolute top-0 left-0 w-full h-1/6 bg-gradient-to-r from-red-500 to-red-600 opacity-10"></div>
                <div className="absolute top-1/6 left-0 w-full h-1/6 bg-white opacity-5"></div>
                <div className="absolute top-2/6 left-0 w-full h-1/6 bg-gradient-to-r from-red-500 to-red-600 opacity-10"></div>
                <div className="absolute top-3/6 left-0 w-full h-1/6 bg-white opacity-5"></div>
                <div className="absolute top-4/6 left-0 w-full h-1/6 bg-gradient-to-r from-red-500 to-red-600 opacity-10"></div>
                <div className="absolute top-5/6 left-0 w-full h-1/6 bg-white opacity-5"></div>
                <div className="absolute top-0 left-0 w-1/3 h-2/5 bg-gradient-to-br from-blue-700 to-blue-900 opacity-20"></div>
                <div className="absolute top-8 left-8 text-white text-2xl opacity-70">★</div>
                <div className="absolute top-16 left-24 text-white text-xl opacity-70">★</div>
                <div className="absolute top-24 left-12 text-white text-lg opacity-70">★</div>
                <div className="absolute top-32 left-32 text-white text-2xl opacity-70">★</div>
                <div className="absolute top-12 left-40 text-white text-xl opacity-70">★</div>
            </div>
            <div className="relative z-40 max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 via-white to-blue-600 rounded-full mb-6 shadow-2xl border-4 border-white">
                        <img src="../public/US_flag.svg" className="w-15" alt="" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-800 to-red-600 mb-4 font-serif tracking-wider">
                        AMERICAN ENGLISH
                    </h1>
                    <h2 className="text-xl md:text-3xl font-bold text-blue-800 mb-2 uppercase tracking-wide">
                        PRONUNCIATION TRAINER
                    </h2>
                    <p className="text-md md:text-xl text-gray-700 font-medium">
                        Master American English with confidence and clarity!
                    </p>
                </div>

                {/* Settings Panel */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl p-8 mb-8 border-l-8 border-blue-600">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Voice Selection */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 text-xl font-bold text-gray-800 uppercase tracking-wide">
                                <img src="/Gemini_Generated_Image_i0m5bzi0m5bzi0m.png" className="w-15 h-15" alt="" />
                                VOICE SELECTION
                            </label>
                            <div className="relative">
                                <select
                                    value={voice?.voiceURI || ""}
                                    onChange={(e) => {
                                        const selectedVoice = voices.find(v => v.voiceURI === e.target.value);
                                        setVoice(selectedVoice);
                                    }}
                                    className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-lg  cursor-pointer focus:border-red-500 focus:outline-none transition-all duration-300 text-[8.5px] lg:text-lg font-medium appearance-none shadow-md"
                                >
                                    {voices.length > 0 ? (
                                        voices.map((v, i) => (
                                            <option key={`${v.voiceURI}-${i}`} value={v.voiceURI}>
                                                {v.name} ({v.lang})
                                            </option>
                                        ))
                                    ) : (
                                        <option>Loading voices...</option>
                                    )}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Speed Control */}
                        <div className="space-y-4">
                            <label className="flex items-center justify-between text-xl font-bold text-gray-800 uppercase tracking-wide">
                                <span className="flex items-center gap-3">
                                    <img src="/thunder-bolt.png" className="w-12 h-12 bg" alt="" />
                                    SPEECH RATE
                                </span>
                                <span className="text-red-600 font-black text-2xl border-2 border-red-600 px-3 py-1 rounded">{rate.toFixed(1)}</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                    className="w-full h-3 bg-gradient-to-r from-red-300 to-blue-300 rounded-full appearance-none cursor-pointer slider-thumb shadow-lg"
                                />

                                <div className="flex justify-between text-sm font-bold text-gray-600 mt-2 uppercase">
                                    {/* SLOW مع أيقونة */}
                                    <div className="flex items-center gap-2">
                                        <img src="/turtle_8589459.png" className="w-6 h-6" alt="turtle icon" />
                                        <span>Slow</span>
                                    </div>

                                    {/* FAST مع أيقونة */}
                                    <div className="flex items-center gap-2">
                                        <img src="/rocket.png" className="w-6 h-6" alt="rocket icon" />
                                        <span>Fast</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <Controls
                    playAll={playAll}
                    pauseAll={pauseAll}
                    resumeAll={resumeAll}
                    stopAll={stopAll}
                    clearData={handleClearData}
                    isPlayingAll={isPlayingAll}
                    isPaused={isPaused}
                />

                <InputSection addPhrase={addPhrase} />

                {/* Phrases Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl md:text-4xl font-black text-gray-800 flex items-center gap-4 uppercase tracking-wide">
                            YOUR PHRASES
                        </h2>
                        <div className="px-2 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-lg font-bold text-sm md:text-lg shadow-lg uppercase tracking-wide border-2 border-white">
                            {phrases.length} PHRASES
                        </div>
                    </div>

                    <div className="space-y-6">
                        {phrases.length ? (
                            phrases.map((p, i) => (
                                <PhraseCard
                                    key={`phrase-${i}`}
                                    id={i}
                                    text={p}
                                    isActive={activeId === i}
                                    isPaused={isPaused}
                                    progress={activeId === i ? progress : 0}
                                    timeSpent={activeId === i ? timeSpent : 0}
                                    timeLeft={activeId === i ? timeLeft : 0}
                                    onSpeak={() => speak(p, i)}
                                    onPause={() => pause(i)}
                                    onResume={() => resume(i)}
                                    onDelete={() => deletePhrase(p, i)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-32 h-32 bg-gradient-to-br from-red-600 via-white to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white">
                                    <img src="/written_icon.png" className="w-24   rounded-full" alt="" />
                                </div>
                                <p className="text-3xl text-gray-800 font-bold mb-4 uppercase tracking-wide">NO PHRASES YET</p>
                                <p className="text-md md:text-xl text-gray-600 font-medium">Add your first phrase to start your American English journey!</p>
                            </div>
                        )}
                    </div>
                </div>

                <StatusIndicator message={status} />
            </div>

            {/* Confirm Modal */}
            {isConfirmOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={closeModal}
                >
                    <div
                        className={`bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center transform transition-all duration-300 ${isModalClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Are you sure?</h2>
                        <p className="mb-6 text-gray-600">This will delete all your saved phrases permanently.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearConfirm}
                                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md cursor-pointer transition-colors transform hover:scale-105"
                            >
                                Yes, Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty Phrases Modal */}
            {isEmptyModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={closeEmptyModal}
                >
                    <div
                        className={`bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center transform transition-all duration-300 ${isEmptyModalClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-red-600 via-white to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
                            <img src="/written_icon.png" className="w-16   rounded-full" alt="" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800 uppercase tracking-wide">NO PHRASES!</h2>
                        <p className="mb-6 text-gray-600 text-lg leading-relaxed">
                            Your phrase list is empty! Start adding English phrases to begin your pronunciation training journey.
                        </p>
                        <button
                            onClick={closeEmptyModal}
                            className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold shadow-lg cursor-pointer transition-all transform hover:scale-105 uppercase tracking-wide"
                        >
                            Let's start!
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #dc2626, #ffffff, #2563eb);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 3px solid white;
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #dc2626, #ffffff, #2563eb);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 3px solid white;
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
      `}</style>
        </div>
    );
}