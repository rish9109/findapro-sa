// src/components/ProviderAvatar.jsx
export default function ProviderAvatar({ name, size = "w-20 h-20", className = "" }) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${size} ${className} rounded-xl overflow-hidden border-4 border-emerald-600/30 shadow-2xl`}>
      {/* Real image if exists */}
      <img
        src="/assets/placeholder.jpg"
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = ""; // trigger fallback
          e.target.style.display = "none";
          e.target.nextElementSibling.style.display = "flex";
        }}
      />
      {/* Fallback: initials on gradient */}
      <div className="hidden w-full h-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 items-center justify-center text-white font-black text-3xl">
        {initials}
      </div>
    </div>
  );
}