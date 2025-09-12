import { useState } from "react";

function Controls({ playAll, pauseAll, resumeAll, stopAll, clearData, isPlayingAll, isPaused }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClear = () => {
    clearData();
    setIsConfirmOpen(false);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {/* PLAY ALL */}
      <button
        onClick={playAll}
        disabled={isPlayingAll}
        className={`px-8 py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 uppercase tracking-wide ${isPlayingAll
          ? "bg-gray-500 cursor-not-allowed shadow-none transform-none"
          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-white/20"
          }`}
      >
        <img src="/music-svgrepo-com.svg" className="w-6" alt="" />
        PLAY ALL
      </button>

      {/* PAUSE / RESUME */}
      {isPlayingAll &&
        (!isPaused ? (
          <button
            onClick={pauseAll}
            className="px-8 py-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide border-2 border-white/20"
          >
            <img src="/pause-circle.svg" className="w-6 bg-red-100  rounded-full" alt="" />
            PAUSE
          </button>
        ) : (
          <button
            onClick={resumeAll}
            className="px-8 py-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 uppercase tracking-wide border-2 border-white/20"
          >
            <img src="/play-button.png" className="w-6 bg-red-50  rounded-full" alt="" />
            RESUME
          </button>
        ))}

      {/* STOP */}
      <button
        onClick={stopAll}
        className="px-8 py-4 rounded-lg font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 uppercase tracking-wide border-2 border-white/20"
      >
        <img src="/stop-button.svg" className="w-6 bg-amber-50 rounded-full" alt="" />
        STOP
      </button>

      {/* CLEAR DATA */}
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="px-8 py-4 rounded-lg font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 uppercase tracking-wide border-2 border-white/20"
      >
        <img src="/delete.png" className="w-6 " alt="" />
        CLEAR DATA
      </button>

      {/* Confirm Alert */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-6">This will delete all your saved phrases.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg bg-red-600 text-white cursor-pointer"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Controls;
