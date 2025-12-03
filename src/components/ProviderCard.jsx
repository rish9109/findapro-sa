import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderCard({ provider, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      onClick={() => onClick(provider)}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <img
          src={provider.logo || "/assets/placeholder.jpg"}
          alt={provider.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
        />
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold">{provider.rating}</span>
          <span className="text-sm text-gray-400">({provider.reviews})</span>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{provider.name}</h3>
      <p className="text-gray-300 mb-3">{provider.location}</p>
      <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-purple-400">{provider.price}</span>
        <span className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
          {provider.years} years
        </span>
      </div>
    </motion.div>
  );
}