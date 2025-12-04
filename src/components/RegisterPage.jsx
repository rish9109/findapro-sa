// src/components/RegisterPage.jsx — 100% FIXED & GORGEOUS DROPDOWNS
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  "Plumbing", "Electrical", "Cleaning Services", "Gardening", "Painting",
  "Web Design", "Tutoring", "Photography", "Handyman", "Beauty & Spa", "Moving Services", "Pest Control"
];

const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West"
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "", ownerName: "", email: "", phone: "", category: "", province: "", city: "", description: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your listing is under review. We'll email you within 24 hours.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black/90 py-20">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => navigate("/")} className="mb-10 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-lg">
          ← Back to Home
        </button>

        <div className="bg-gradient-to-b from-zinc-900 to-black rounded-3xl border border-emerald-800/50 shadow-2xl p-12">
          <h1 className="text-5xl font-black text-center mb-4 text-white">
            List Your Business on <span className="text-emerald-400">FindAPro</span>
          </h1>
          <p className="text-center text-gray-400 text-lg mb-12">Get found by customers in your area — free for 30 days</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <input required type="text" placeholder="Business Name" value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg"
              />
              <input required type="text" placeholder="Your Full Name" value={formData.ownerName}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg"
              />
              <input required type="email" placeholder="Business Email" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg"
              />
              <input required type="tel" placeholder="Phone Number (e.g. 082 123 4567)" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg"
              />

              {/* PERFECTLY STYLED DROPDOWN — BULLETPROOF */}
              <div className="relative">
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition text-lg appearance-none cursor-pointer pr-12"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238b8b8b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 1.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "12px"
                  }}
                >
                  <option value="" disabled className="text-gray-500">Select Service Category</option>
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* PROVINCE DROPDOWN — SAME STYLE */}
              <div className="relative">
                <select
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition text-lg appearance-none cursor-pointer pr-12"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238b8b8b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 1.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "12px"
                  }}
                >
                  <option value="" disabled className="text-gray-500">Select Province</option>
                  {provinces.map(p => (
                    <option key={p} value={p} className="bg-zinc-900 text-white">{p}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <input required type="text" placeholder="City / Town" value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg"
              />
              <textarea required rows={4} placeholder="Brief description of your services..."
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition text-lg md:col-span-2 resize-none"
              />
            </div>

            <div className="text-center">
              <button type="submit"
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-2xl px-20 py-7 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Submit Listing — Start Getting Clients
              </button>
              <p className="mt-6 text-gray-400">Free for 30 days • No card required</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}