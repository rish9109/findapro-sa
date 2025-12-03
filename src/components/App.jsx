// src/App.jsx
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
          <div className="max-w-7xl mx-auto px-6 py-20">
            <h2 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Service
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:border-purple-500/50 transition-all hover:scale-105"
                >
                  <div className="text-6xl mb-6 group-hover:scale-110 transition">{cat.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-purple-300">{cat.providers.length} pros</p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen py-16">
          <div className="max-w-7xl mx-auto px-6">
            <button onClick={() => setSelectedCategory(null)} className="mb-10 text-gray-400 hover:text-white flex items-center gap-2">
              ← All categories
            </button>

            <h1 className="text-6xl font-black mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {currentCategory?.icon} {currentCategory?.name}
            </h1>

            <div className="flex justify-end mb-10">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-8 py-4 text-white focus:border-purple-400"
              >
                <option value="rating">Top Rated</option>
                <option value="years">Most Experienced</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} onClick={setSelectedProvider} />
              ))}
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