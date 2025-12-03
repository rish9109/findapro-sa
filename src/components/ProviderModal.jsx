import { X, Mail, MapPin, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderModal({ provider, onClose }) {
  if (!provider) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl max-w-2xl w-full max-h-screen overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <img
              src={provider.logo || "/assets/placeholder.jpg"}
              alt={provider.name}
              className="w-24 h-24 rounded-full border-4 border-purple-500"
            />
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-8 h-8" />
            </button>
          </div>

          <h2 className="text-4xl font-bold mb-2">{provider.name}</h2>
          <div className="flex items-center gap-4 text-gray-300 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{provider.rating}</span>
              <span>({provider.reviews} reviews)</span>
            </div>
            <span className="text-3xl font-bold text-purple-400">{provider.price}</span>
          </div>

          <div className="space-y-4 text-lg">
            <p className="flex items-center gap-3"><MapPin /> {provider.location}</p>
            <p className="flex items-center gap-3"><Clock /> {provider.years} years in business</p>
            <p className="leading-relaxed">{provider.description}</p>
            <div>
              <p className="font-semibold mb-2">Services:</p>
              <p className="text-purple-300">{provider.services}</p>
            </div>
          </div>

          <button className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-full text-xl transition transform hover:scale-105 flex items-center justify-center gap-3">
            <Mail className="w-6 h-6" />
            Contact {provider.name.split(" ")[0]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}