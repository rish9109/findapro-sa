// src/App.jsx — FINAL: Modern luxury (emerald + gold + cyan), no loud purple
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import ProviderCard from './components/ProviderCard';
import ProviderModal from './components/ProviderModal';
import Footer from './components/Footer';
import providersData from './data/providers.json';

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const categories = providersData.categories;

  const currentCategory = categories.find(c => c.id === selectedCategory);

  const filteredProviders = currentCategory?.providers
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "years") return b.years - a.years;
      if (sortBy === "price") return a.price.localeCompare(b.price);
      return 0;
    }) || [];

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {!selectedCategory ? (
        <>
          <Hero />

          {/* MODERN LUXURY CATEGORY CARDS */}
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative bg-black/70 backdrop-blur-2xl rounded-3xl border border-emerald-900/40 overflow-hidden shadow-2xl transition-all duration-500 hover:border-emerald-700/60 hover:shadow-emerald-500/20 hover:-translate-y-3"
                >
                  {/* Top: Icon + Name + Count */}
                  <div className="px-8 pt-10 pb-8 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="text-3xl font-bold text-emerald-400">
                      {cat.providers.length}
                    </span>
                  </div>

                  {/* SUBTLE CYAN-GOLD GRADIENT BUTTON — classy, not loud */}
                  <div className="px-8 pb-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                      <div className="relative bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-lg px-10 py-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                        <span>View {cat.name}</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* CATEGORY DETAIL PAGE */
        <div className="min-h-screen py-16">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-10 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-lg font-medium"
            >
              ← All categories
            </button>

            <h1 className="text-6xl font-black mb-12 text-white">
              {currentCategory?.icon} {currentCategory?.name}
            </h1>

            <div className="flex justify-end mb-12">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/60 backdrop-blur border border-emerald-800/50 rounded-xl px-8 py-4 text-white focus:border-emerald-500 text-lg"
              >
                <option value="rating">Top Rated</option>
                <option value="years">Most Experienced</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProviders.length > 0 ? (
                filteredProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} onClick={setSelectedProvider} />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400 py-20 text-2xl">
                  No providers yet — be the first!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <AnimatePresence>
        {selectedProvider && (
          <ProviderModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
        )}
      </AnimatePresence>
    </>
  );
}