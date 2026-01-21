// File: src/app/page.tsx - COMPLETELY REDESIGNED LUXURY VERSION
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero Section - Luxury Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-luxury-dark via-luxury-navy to-luxury-midnight">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(to right, #8882 1px, transparent 1px),
                            linear-gradient(to bottom, #8882 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {/* Premium badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30 mb-8">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-white/80">TRUSTED BY 10,000+ BUSINESSES</span>
              </div>

              {/* Main headline with gradient */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
                <span className="block text-white">Find Elite</span>
                <span className="text-gradient bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400">
                  Service Professionals
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Connect with South Africa's most trusted and verified service providers.
                Premium quality guaranteed.
              </p>
            </div>

            {/* Luxury Search Bar Area */}
            <div className="max-w-4xl mx-auto">
              <div className="glass-luxury rounded-2xl p-8 border border-white/10 shadow-2xl premium-hover">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Find Your Perfect Pro</h2>
                  <p className="text-white/60">Search across 50+ categories with verified reviews</p>
                </div>
                <SearchBar />
                
                {/* Quick stats */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient">10K+</div>
                    <div className="text-sm text-white/60">Verified Providers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient">4.9★</div>
                    <div className="text-sm text-white/60">Avg. Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient">24h</div>
                    <div className="text-sm text-white/60">Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="text-white/40 text-sm mb-2">Explore More</div>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gradient-to-b from-purple-400 to-teal-400 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories - Luxury Grid */}
      <section className="py-24 bg-gradient-to-b from-luxury-midnight to-luxury-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-white/10 mb-6">
              <span className="text-sm font-semibold text-gradient">POPULAR CATEGORIES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-white">Premium </span>
              <span className="text-gradient">Service Categories</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Browse our curated selection of elite service providers
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>



      {/* Final CTA - Luxury */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-luxury-dark to-teal-900/30"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-luxury rounded-3xl p-12 border border-white/10 shadow-2xl">
              <div className="inline-block p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 mb-8">
                <div className="text-5xl">🏆</div>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Showcase Your 
                <span className="text-gradient"> Excellence?</span>
              </h2>
              
              <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                Join South Africa's premier network of service professionals. 
                Get discovered by premium clients who value quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="group relative px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <span className="relative z-10">List Your Service - Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-teal-600 rounded-xl blur opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
                </button>
                
                <button className="group px-10 py-5 rounded-xl border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    Explore Premium Features
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  Join 10,000+ businesses already growing with FindAPro
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}