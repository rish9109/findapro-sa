// File: src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-full">
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
            <div className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 font-bold">
              FindAPro
            </div>
            <div className="hidden sm:block w-0.5 h-5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"></div>
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Connecting South Africans since 2024
            </div>
          </div>
          
          <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed px-2">
            Trusted by thousands of homeowners and service providers across South Africa. 
            Join our growing community of professionals and customers today.
          </p>
          
          {/* Contact and Listing Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              <span>Contact Us →</span>
            </Link>
            <Link 
              href="/providers/provider-listings"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent hover:from-yellow-300 hover:to-amber-300 text-xs font-medium hover:underline transition-all duration-300"
            >
              <span>List your service now →</span>
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="pt-6 border-t border-gray-800">
            <div className="text-gray-500 text-xs">
              <p>© {currentYear} Find A Pro Connect (PTY) LTD. All rights reserved.</p>
              <p className="mt-1">findapro.co.za</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}