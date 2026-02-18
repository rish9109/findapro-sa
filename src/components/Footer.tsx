// File: src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 relative z-50">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-full">
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
            <Link
              href="/"
              className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 font-bold hover:from-orange-300 hover:to-yellow-300 transition-all duration-300"
            >
              FindAPro
            </Link>
            <div className="hidden sm:block w-0.5 h-5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700" />
            
          </div>

          <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed px-2">
            Trusted by homeowners and service providers across South Africa. 
            Join our growing community of professionals and customers today.
          </p>

          {/* Navigation Links - WITH HOME LINK ADDED */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {/* HOME LINK - ADDED */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent hover:from-orange-300 hover:to-red-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent hover:from-green-300 hover:to-emerald-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              About Us
            </Link>

            <Link
              href="/legal"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              Legal
            </Link>

            <Link
              href="/terms"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-teal-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              Contact Us
            </Link>
            <div className="relative">
  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
</div>

          </nav>

          {/* Copyright & Protection Notice */}
          <div className="pt-6 border-t border-gray-800">
            <div className="text-gray-500 text-xs space-y-2">
              <p> Find A Pro Connect (PTY) LTD. All rights reserved.</p>

              <div className="mt-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 font-medium mb-1">⚠️ Intellectual Property Protection</p>
                <p className="text-gray-500 text-[11px] leading-tight">
                  This website, including its design, business model, database structure, and proprietary systems 
                  are protected by copyright, database rights, and trade secret laws. Unauthorized copying, 
                  scraping, reverse-engineering, or creating derivative works is strictly prohibited and will 
                  result in legal action.
                </p>
              </div>

             
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}