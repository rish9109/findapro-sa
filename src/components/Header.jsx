// src/components/Header.jsx
export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="bg-black/40 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative">
        
        {/* SA Logo + Text */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 blur-xl opacity-60 group-hover:opacity-90 transition"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl border border-purple-500/50">
              SA
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
              FindAPro
            </h1>
            <p className="text-xs text-purple-300 tracking-widest uppercase font-medium">
              South Africa’s Trusted Providers
            </p>
          </div>
        </div>

        {/* Centered BETA Ribbon */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 blur-xl opacity-70 animate-ping"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wider shadow-2xl border border-purple-400/50 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
              BETA • Launching Soon
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search plumbers, electricians in SA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:border-purple-400 transition-all text-white placeholder-gray-400 text-lg"
          />
          <svg className="absolute left-5 top-5 h-7 w-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>
  );
}