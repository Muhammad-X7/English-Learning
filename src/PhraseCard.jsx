function PhraseCard({
    text,
    isActive,
    isPaused,
    progress,
    timeSpent,
    timeLeft,
    onSpeak,
    onPause,
    onResume,
    onDelete,
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-lg p-6 transition-all duration-500 transform hover:scale-[1.02] border-l-8 ${isActive
                ? 'bg-gradient-to-r from-red-50 to-blue-50 border-l-red-600 shadow-2xl shadow-red-500/20'
                : 'bg-white shadow-lg hover:shadow-xl border-l-blue-600 hover:border-l-red-600'
                }`}
        >
            {isActive && (
                <div
                    className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-blue-500"
                    style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex-1">
                    <p className="text-gray-800 text-lg lg:text-xl font-bold leading-relaxed mb-3 font-serif">
                        "{text}"
                    </p>

                    {isActive && (
                        <div className="space-y-3">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border">
                                <div
                                    className="h-3 bg-gradient-to-r from-red-500 via-white to-blue-500 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-700 uppercase tracking-wide">
                                <span className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                                    <span>⏱️</span>
                                    {timeSpent}s ELAPSED
                                </span>
                                <span className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                                    <span>⏳</span>
                                    ~{timeLeft}s LEFT
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mb-4 sm:mb-0">
                    <button
                        onClick={onSpeak}
                        className={`p-3 rounded-lg text-white transition-all duration-300 transform hover:scale-110 shadow-lg uppercase text-xs font-bold ${isActive && !isPaused
                            ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl cursor-pointer border-2 border-white/20'
                            }`}
                        disabled={isActive && !isPaused}
                        title="SPEAK"
                    >
                        <img src="speaker_icon.png" className="w-6" alt="" />
                    </button>

                    <button
                        onClick={onPause}
                        className={`p-3 rounded-lg text-white transition-all duration-300 transform hover:scale-110 shadow-lg uppercase text-xs font-bold ${!isActive || isPaused
                            ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl cursor-pointer border-2 border-white/20'
                            }`}
                        disabled={!isActive || isPaused}
                        title="PAUSE"
                    >
                        <img src="pause-circle.svg" className="w-6" alt="" />
                    </button>

                    <button
                        onClick={onResume}
                        className={`p-3 rounded-lg text-white transition-all duration-300 transform hover:scale-110 shadow-lg uppercase text-xs font-bold ${!isActive || !isPaused
                            ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl cursor-pointer border-2 border-white/20'
                            }`}
                        disabled={!isActive || !isPaused}
                        title="RESUME"
                    >
                        <img src="play-button.png" className="w-6" alt="" />
                    </button>

                    <button
                        onClick={onDelete}
                        className="p-3 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl uppercase text-xs font-bold border-2 border-white/20"
                        title="DELETE"
                    >
                        <img src="delete.png" className="w-6" alt="" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PhraseCard;
