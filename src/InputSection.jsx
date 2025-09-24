import { useState } from "react";

function InputSection({ addPhrase }) {
    const [text, setText] = useState("");

    const handleAdd = () => {
        if (!text.trim()) return;
        addPhrase(text.trim());
        setText("");
    };

    return (
        <div className="relative mb-10">
            <div className="flex gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border-2 border-blue-200">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your English phrase here..."
                    className="flex-1 px-1 md:px-6 py-4 bg-transparent text-sm md:text-xl placeholder-gray-600 focus:outline-none font-medium border-b-2 border-transparent focus:border-red-500 transition-all duration-300"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <button
                    onClick={handleAdd}
                    className="px-1.5 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white cursor-pointer text-[10px] md:text-lg rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 uppercase tracking-wide border-2 border-white/20"
                >
                    ADD PHRASE
                </button>
            </div>
        </div>
    );
}

export default InputSection;