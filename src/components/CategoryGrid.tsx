// File: src/components/CategoryGrid.tsx
import Link from 'next/link'

const categories = [
  { name: 'Plumbers', icon: '💧', count: 245, color: 'bg-blue-100 text-blue-800' },
  { name: 'Electricians', icon: '⚡', count: 189, color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Cleaners', icon: '🧹', count: 312, color: 'bg-green-100 text-green-800' },
  { name: 'Gardeners', icon: '🌿', count: 156, color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Painters', icon: '🎨', count: 127, color: 'bg-purple-100 text-purple-800' },
  { name: 'Builders', icon: '🏗️', count: 98, color: 'bg-orange-100 text-orange-800' },
  { name: 'Mechanics', icon: '🔧', count: 203, color: 'bg-red-100 text-red-800' },
  { name: 'IT Support', icon: '💻', count: 176, color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Carpenters', icon: '🪚', count: 134, color: 'bg-amber-100 text-amber-800' },
  { name: 'Security', icon: '🔒', count: 89, color: 'bg-gray-100 text-gray-800' },
  { name: 'Movers', icon: '📦', count: 112, color: 'bg-teal-100 text-teal-800' },
  { name: 'Pest Control', icon: '🐜', count: 76, color: 'bg-lime-100 text-lime-800' },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link 
          key={category.name}
          href={`/providers?category=${category.name.toLowerCase()}`}
          className="group"
        >
          <div className={`${category.color} p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
            <div className="text-3xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
            <p className="text-sm opacity-75">{category.count} providers</p>
          </div>
        </Link>
      ))}
    </div>
  )
}