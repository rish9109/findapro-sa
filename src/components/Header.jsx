export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="bg-black/80 backdrop-blur-xl border-b border-emerald-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center font-bold text-xl">
            SA
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            FindAPro
          </h1>
          <span className="text-xs bg-emerald-900/50 px-2 py-1 rounded-full text-emerald-300">
            South Africa
          </span>
        </div>

        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search plumbers, electricians, cleaners in SA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-900/50 backdrop-blur border border-emerald-800/50 rounded-full focus:outline-none focus:border-emerald-500 transition placeholder-gray-500 text-white"
          />
          <svg className="absolute left-4 top-4 h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>
  );
}