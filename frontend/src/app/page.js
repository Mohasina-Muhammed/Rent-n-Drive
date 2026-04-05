'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({ type: '', date: '' });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.type) params.append('type', searchParams.type);
    if (searchParams.date) params.append('pickupDate', searchParams.date);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col animate-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center text-center px-4">
        {/* Background Image from Uploads */}
        <div className="absolute inset-0 z-0">
          <img 
            src="http://localhost:5000/uploads/homebg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight sm:text-7xl mb-8 leading-tight">
            Find Your Perfect <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Ride Instantly.</span>
          </h1>
          <p className="mt-4 text-xl text-slate-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Rent top-tier cars and bikes for hours, days, or months. Seamless booking, transparent pricing, zero hassle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/vehicles" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 hover:shadow-blue-500/40 text-lg w-full sm:w-auto">
              Browse Fleet
            </Link>
            <Link href="/register" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold flex items-center justify-center px-8 py-4 rounded-xl backdrop-blur-md transition-all hover:-translate-y-1 text-lg w-full sm:w-auto">
              Become an Owner
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="max-w-5xl mx-auto -mt-16 relative z-20 px-4 w-full">
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-4 justify-between items-end border border-white/20 shadow-2xl">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
            <select 
              value={searchParams.type}
              onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
              className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 transition-colors"
            >
              <option value="">Any Type</option>
              <option value="4Wheeler">Cars (4-Wheeler)</option>
              <option value="2Wheeler">Bikes (2-Wheeler)</option>
            </select>
          </div>
          <div className="w-full md:w-2/5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Pick-up Date</label>
            <input 
              type="date" 
              value={searchParams.date}
              onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
              className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 transition-colors" 
            />
          </div>
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-slate-900 text-white font-medium py-3 px-8 rounded-lg shadow hover:bg-slate-800 transition-colors h-[50px]"
          >
            Search
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Premium Fleet at Your Fingertips</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-16">Choose from our curated selection of luxury cars and exciting two-wheelers.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Cars Category */}
            <Link href="/vehicles?type=4Wheeler" className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-lg block">
              <img 
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800" 
                alt="Cars" 
                className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-bold tracking-tight">Luxury Cars</span>
                <span className="mt-2 text-sm opacity-80 uppercase tracking-widest">View 4-Wheelers</span>
              </div>
            </Link>
            
            {/* Bikes Category */}
            <Link href="/vehicles?type=2Wheeler" className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-lg block">
              <img 
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800" 
                alt="Bikes" 
                className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-bold tracking-tight">Exciting Bikes</span>
                <span className="mt-2 text-sm opacity-80 uppercase tracking-widest">View 2-Wheelers</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
