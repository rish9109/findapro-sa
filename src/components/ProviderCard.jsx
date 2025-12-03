// src/components/ProviderCard.jsx
import ProviderAvatar from './ProviderAvatar';

export default function ProviderCard({ provider, onClick }) {
  return (
    <div
      onClick={() => onClick(provider)}
      className="bg-gray-900/70 backdrop-blur-xl border border-emerald-900/70 rounded-2xl p-8 hover:border-emerald-500 transition-all cursor-pointer hover:scale-[1.02] shadow-2xl"
    >
      <div className="flex justify-between items-start mb-6">
        <ProviderAvatar name={provider.name} />

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-3">
            <span className="text-4xl">STAR</span>
            <span className="text-3xl font-black text-yellow-400">{provider.rating}</span>
            <span className="text-sm text-gray-400">({provider.reviews || 0})</span>
          </div>
          <div className="text-4xl font-bold text-emerald-400">R{provider.price}</div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">{provider.name}</h3>
      <p className="text-emerald-300 mb-2 flex items-center gap-2">
        <span>LOCATION</span> {provider.location}
      </p>
      <p className="text-gray-400 mb-4">{provider.years} years experience</p>
      <p className="text-gray-500 text-sm line-clamp-2">{provider.description}</p>
    </div>
  );
}