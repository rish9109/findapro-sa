// src/components/SearchFilter.jsx
import ProviderAvatar from './components/ProviderAvatar';
export default function SearchFilter({ sortBy, setSortBy, selectedCategory, setSelectedCategory, categories }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap gap-4 items-center justify-between">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-3 focus:outline-none focus:border-purple-400"
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-3"
      >
        <option value="rating">Best Rating</option>
        <option value="years">Most Experienced</option>
        <option value="price">Price (Low to High)</option>
      </select>
    </div>
  );
}

// src/components/CategoryGrid.jsx
import ProviderCard from './ProviderCard';

export default function CategoryGrid({ categories, searchTerm, selectedCategory, sortBy, setSelectedProvider }) {
  const filtered = categories
    .filter(cat => !selectedCategory || cat.id === selectedCategory)
    .map(cat => ({
      ...cat,
      providers: cat.providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.services.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(cat => cat.providers.length > 0 || !selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filtered.map(category => (
        <div key={category.id} className="animate-slide-up">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                {category.name}
              </h3>
              <span className="text-3xl font-bold text-purple-400">
                {category.providers.length}
              </span>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-2xl font-bold text-lg transition transform hover:scale-105">
              View {category.name} →
            </button>

            <div className="grid gap-4 mt-6">
              {category.providers
                .sort((a, b) => {
                  if (sortBy === "rating") return b.rating - a.rating;
                  if (sortBy === "years") return b.years - a.years;
                  if (sortBy === "price") return a.price.length - b.price.length;
                  return 0;
                })
                .slice(0, 3)
                .map(provider => (
                  <ProviderCard key={provider.id} provider={provider} onClick={setSelectedProvider} />
                ))}
              {category.providers.length > 3 && (
                <p className="text-center text-gray-400 py-4">
                  + {category.providers.length - 3} more providers
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// src/App.jsx
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import SearchFilter from './components/SearchFilter';
import ProviderModal from './components/ProviderModal';
import Footer from './components/Footer';
import providersData from './data/providers.json';

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setCategories(providersData.categories);
  }, []);

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Hero />
      <SearchFilter
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />
      <CategoryGrid
        categories={categories}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        setSelectedProvider={setSelectedProvider}
      />
      <Footer />

      <AnimatePresence>
        {selectedProvider && (
          <ProviderModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
        )}
      </AnimatePresence>
    </>
  );
}