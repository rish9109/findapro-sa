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