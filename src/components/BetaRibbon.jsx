// src/components/BetaRibbon.jsx
export default function BetaRibbon() {
  return (
    <div className="fixed top-6 right-6 z-50 animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-60 animate-ping"></div>
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wider shadow-2xl border border-emerald-400/50 flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
          BETA • Launching Soon
        </div>
      </div>
    </div>
  );
}