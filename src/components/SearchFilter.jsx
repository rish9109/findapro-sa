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