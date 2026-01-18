// File: src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
              <h2 className="text-2xl font-bold">FindAPro</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              Connecting South Africans with trusted, verified service professionals. 
              Find the right pro for your needs.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/providers" className="hover:text-white">Browse Providers</Link></li>
              <li><Link href="/add-listing" className="hover:text-white">Add Listing</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Plumbers</li>
              <li>Electricians</li>
              <li>Cleaners</li>
              <li>Gardeners</li>
              <li>Builders</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {currentYear} FindAPro.co.za. All rights reserved.</p>
          <p className="mt-1">Connecting South Africa with quality service providers</p>
        </div>
      </div>
    </footer>
  )
}