// src/components/Hero.jsx
export default function Hero() {
  return (
    <section className="text-center py-24 px-6">
      <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
        Find Trusted Local <br />
        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
          Service Providers
        </span>
      </h2>
      <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
        Compare ratings, prices, and reviews — all in one place across South Africa.
      </p>
    </section>
  );
}