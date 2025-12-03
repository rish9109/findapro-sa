// src/components/Card.jsx
export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 shadow-2xl transition-all hover:border-gray-700 hover:shadow-gray-900/50 hover:scale-[1.02] ${className}`}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-purple-900/10 opacity-50"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}