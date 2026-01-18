// File: src/app/page.tsx
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-12 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Trusted Service Providers
            <br />
            <span className="text-blue-200">Across South Africa</span>
          </h1>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            Connect with verified professionals for home services, repairs, maintenance, and more
          </p>
          
          <div className="max-w-3xl mx-auto">
            <SearchBar />
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-blue-500/30 px-4 py-2 rounded-full">✓ Verified Providers</span>
              <span className="bg-blue-500/30 px-4 py-2 rounded-full">📅 Instant Booking</span>
              <span className="bg-blue-500/30 px-4 py-2 rounded-full">⭐ Customer Reviews</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Popular Service Categories</h2>
        <p className="text-gray-600 text-center mb-10">Browse professionals by category</p>
        <CategoryGrid />
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Are You a Service Professional?</h2>
          <p className="text-gray-700 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of service providers getting more customers through FindAPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/add-listing" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg"
            >
              List Your Service for Free
            </a>
            <a 
              href="/providers" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Browse Service Providers
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}