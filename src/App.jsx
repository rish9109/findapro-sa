// src/App.jsx
import { useState, useEffect } from 'react';
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
  const [categories] = useState(providersData.categories);

  const currentCategory = categories.find(c => c.id === selectedCategory);

  // Filter & sort providers
  const getFilteredProviders = () => {
    if (!currentCategory) return [];
    return currentCategory.providers
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.services && p.services.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "years") return b.years - a.years;
        if (sortBy === "price") return a.price.localeCompare(b.price);
        return 0;
      });
  };

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* HOMEPAGE */}
      {!selectedCategory ? (
        <>
          <Hero onViewCategory={setSelectedCategory} categories={categories} />
          
          {/* Category Grid */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              Browse Categories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="bg-gray-900/60 backdrop-blur-xl border border-emerald-900/70 rounded-3xl p-10 text-center hover:border-emerald-600 transition-all cursor-pointer hover:scale-105 shadow-2xl"
                >
                  <div className="text-6xl mb-6">{cat.icon}</div>
                  <h3 className="text-3xl font-bold text-white mb-4">{cat.name}</h3>
                  <p className="text-emerald-400 text-xl font-bold">
                    {cat.providers.length} {cat.providers.length === 1 ? 'Pro' : 'Pros'} Available
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* CATEGORY DETAIL PAGE */
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-emerald-950">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Back button + title */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-8 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-lg font-medium"
            >
              ← All Categories
            </button>

            <h2 className="text-5xl md:text-6xl font-black mb-10 bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              {currentCategory?.icon} {currentCategory?.name} in South Africa
            </h2>

            {/* Sort */}
            <div className="mb-10 flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900/80 backdrop-blur border border-emerald-800 rounded-xl px-8 py-4 text-white focus:border-emerald-500 focus:outline-none text-lg"
              >
                <option value="rating">Highest Rated</option>
                <option value="years">Most Experienced</option>
                <option value="price">Price: Low → High</option>
              </select>
            </div>

            {/* Providers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {getFilteredProviders().length > 0 ? (
                getFilteredProviders().map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onClick={setSelectedProvider}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400 text-xl py-20">
                  No providers found matching your search.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Provider Modal */}
      <AnimatePresence>
        {selectedProvider && (
          <ProviderModal
            provider={selectedProvider}
            onClose={() => setSelectedProvider(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}