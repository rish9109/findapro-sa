import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
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

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      {!selectedCategory ? (
        <>
          <Hero onViewCategory={setSelectedCategory} categories={categories} />
          <CategoryGrid 
            categories={categories} 
            searchTerm={searchTerm}
            setSelectedCategory={setSelectedCategory}
          />
        </>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-emerald-950">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="mb-6 text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
            >
              ← Back to all categories
            </button>
            
            <h2 className="text-5xl font-black mb-8 bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              {currentCategory?.icon} {currentCategory?.name} in South Africa
            </h2>

            {/* Beautiful filters only on category page */}
            <div className="flex flex-wrap gap-4 mb-8">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900/80 backdrop-blur border border-emerald-800 rounded-xl px-6 py-3 text-white focus:border-emerald-500 focus:outline-none">
                <option value="rating">Highest Rated First</option>
                <option value="years">Most Experienced</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentCategory?.providers
                .filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.location.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => {
                  if (sortBy === "rating") return b.rating - a.rating;
                  if (sortBy === "years") return b.years - a.years;
                  if (sortBy === "price") return a.price.localeCompare(b.price);
                  return 0;
                })
                .map(provider => (
                  <div key={provider.id} onClick={() => setSelectedProvider(provider)}
                    className="bg-gray-900/50 backdrop-blur-lg border border-emerald-900/50 rounded-2xl p-6 hover:border-emerald-700 transition-all cursor-pointer hover:transform hover:scale-105">
                    <div className="flex justify-between items-start mb-4">
                      <img src={provider.logo || "/assets/placeholder.jpg"} alt={provider.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-600" />
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-2xl">⭐</span>
                          <span className="text-xl font-bold">{provider.rating}</span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-400">R{provider.price}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{provider.name}</h3>
                    <p className="text-emerald-300 mb-2">{provider.location}</p>
                    <p className="text-gray-400 text-sm">{provider.years} years experience</p>
                  </div>
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