// src/components/ProviderModal.jsx
import { motion } from 'framer-motion';
import ProviderAvatar from './ProviderAvatar';

export default function ProviderModal({ provider, onClose }) {
  if (!provider) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 100, scale: 0.9 }}
        className="bg-gradient-to-b from-gray-900 via-emerald-950/50 to-black rounded-3xl max-w-4xl w-full border border-emerald-800/50 shadow-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10">
          {/* Top section with avatar + close button */}
          <div className="flex justify-between items-start mb-10">
            <ProviderAvatar 
              name={provider.name} 
              size="w-36 h-36" 
              className="border-8 border-emerald-600/40 shadow-2xl"
            />
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Provider Info */}
          <h2 className="text-5xl font-black text-white mb-4">{provider.name}</h2>
          
          <div className="flex items-center gap-6 text-emerald-300 mb-6 text-lg">
            <span className="flex items-center gap-2">
              <span>LOCATION</span> {provider.location}
            </span>
            <span>•</span>
            <span>{provider.years} years experience</span>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
            {provider.description}
          </p>

          {/* Services */}
          {provider.services && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Services Offered</h3>
              <p className="text-gray-300">{provider.services}</p>
            </div>
          )}

          {/* Rating & Price */}
          <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-5xl">STAR</span>
              <div>
                <div className="text-4xl font-black text-yellow-400">{provider.rating}</div>
                <div className="text-sm text-gray-400">{provider.reviews || 0} reviews</div>
              </div>
            </div>

            <div className="text-6xl font-black text-emerald-400">
              R{provider.price}
            </div>
          </div>

          {/* Contact Button */}
          <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-2xl py-6 rounded-2xl transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact {provider.name.split(" ")[0]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}