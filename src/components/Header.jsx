export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="bg-black/90 backdrop-blur-2xl border-b border-emerald-900/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative">
        <div className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50 group-hover:opacity-80 transition"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center shadow-2xl border border-emerald-400/50">
              <span className="text-2xl font-black text-white">SA</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-400 bg-clip-text text-transparent">
                FindAPro
              </span>
            </h1>
            <p className="text-xs text-emerald-400 font-medium tracking-widest uppercase">
              South Africa’s Trusted Pros
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-60 animate-ping"></div>
            <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wider shadow-2xl border border-emerald-400/50 flex items-center gap-2 whitespace-nowrap">
              <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
              BETA • Launching Soon
            </div>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search plumbers, builders, tutors in SA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-gray-900/70 backdrop-blur-xl border border-emerald-800/60 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all text-white placeholder-gray-500 text-lg"
          />
          <svg className="absolute left-5 top-5 h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>
  );
}