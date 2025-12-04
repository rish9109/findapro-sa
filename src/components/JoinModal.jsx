// src/components/JoinModal.jsx
import { motion } from 'framer-motion';

export default function JoinModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-gradient-to-b from-zinc-900 to-black rounded-3xl max-w-2xl w-full border border-emerald-800/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-12 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Join <span className="text-emerald-400">FindAPro</span> Today
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-lg mx-auto">
            Get more clients, grow your business, and reach customers across South Africa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-4xl mb-3">Chart</div>
              <p className="text-emerald-400 font-bold">More Leads</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">Star</div>
              <p className="text-emerald-400 font-bold">Trusted Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">Wallet</div>
              <p className="text-emerald-400 font-bold">Grow Revenue</p>
            </div>
          </div>
<button 
  onClick={() => window.location.href = "/register"}
  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-2xl px-16 py-6 rounded-full shadow-2xl transition-all hover:scale-105"
>
  Start Free Trial — No Card Needed
</button>

          <button onClick={onClose} className="mt-8 text-gray-400 hover:text-white text-sm">
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}