export default function StatusIndicator({ message }) {
    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-semibold text-white shadow-xl transition-transform duration-500 ease-in-out
                ${message ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}
                bg-green-600
                `}
        >
            {message}
        </div>
    );
}