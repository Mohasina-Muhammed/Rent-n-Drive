'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
}

function VehiclesContent() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    type: searchParams.get('type') || '', 
    minPrice: '', 
    maxPrice: '',
    city: '',
    fuelType: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.city) params.append('city', filters.city);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);

      const response = await api.get(`/vehicles?${params.toString()}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Search Header */}
      <div className="bg-slate-900 pt-10 pb-24 px-4 mt-[-64px] pt-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-8 font-outfit uppercase tracking-tight">Browse the Fleet</h1>
          
          <div className="glass-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end border border-white/10 shadow-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Vehicle Type</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 text-sm font-semibold"
              >
                <option value="">All Vehicles</option>
                <option value="4Wheeler">Cars (4-Wheeler)</option>
                <option value="2Wheeler">Bikes (2-Wheeler)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Fuel Type</label>
              <select 
                name="fuelType" 
                value={filters.fuelType} 
                onChange={handleFilterChange}
                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 text-sm font-semibold"
              >
                <option value="">Any Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Location / City</label>
              <input 
                type="text" 
                name="city" 
                value={filters.city} 
                onChange={handleFilterChange}
                placeholder="e.g. New York"
                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 text-sm font-semibold" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Max Price ($)</label>
              <input 
                type="number" 
                name="maxPrice" 
                value={filters.maxPrice} 
                onChange={handleFilterChange}
                placeholder="Daily max"
                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50 text-sm font-semibold" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-xl shadow border border-slate-100 h-72 animate-pulse"></div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <div className="text-slate-400 mb-4">
               <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
             </div>
             <h3 className="text-xl font-medium text-slate-900">No vehicles found</h3>
             <p className="text-slate-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                <div className="h-48 bg-slate-200 relative overflow-hidden group">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img src={getImageSrc(vehicle.images[0])} alt={vehicle.model} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${vehicle.availabilityStatus === 'Available' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {vehicle.availabilityStatus === 'Available' ? (vehicle.city || 'Anywhere') : vehicle.availabilityStatus}
                  </div>
                  {(vehicle.availabilityStatus === 'Maintenance' || vehicle.availabilityStatus === 'Booked') && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                       <div className="border-2 border-white/30 px-4 py-2 rounded-lg">
                          <span className="text-white font-black text-sm tracking-[0.2em] uppercase">
                            {vehicle.availabilityStatus === 'Maintenance' ? 'Under Maintenance' : 'Currently Reserved'}
                          </span>
                       </div>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{vehicle.brand}</div>
                    {vehicle.pricingCategory && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                        {vehicle.pricingCategory.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{vehicle.model} <span className="text-slate-500 font-normal text-sm">({vehicle.year})</span></h3>
                  
                  <div className="flex gap-4 mt-2 mb-6">
                    <div className="flex items-center text-slate-500 text-xs font-semibold">
                      <span className="bg-slate-100 rounded p-1 mr-1.5">⛽</span>
                      {vehicle.fuelType || 'Petrol'}
                    </div>
                    <div className="flex items-center text-slate-500 text-xs font-semibold">
                      <span className="bg-slate-100 rounded p-1 mr-1.5">⚙️</span>
                      {vehicle.transmission || 'Auto'}
                    </div>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-xl font-black text-blue-600 font-outfit">${vehicle.pricing?.daily || 0}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase ml-1">/ day</span>
                    </div>
                    {vehicle.availabilityStatus !== 'Available' ? (
                      <button disabled className="bg-slate-200 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        {vehicle.availabilityStatus === 'Booked' ? 'Reserved' : 'Unavailable'}
                      </button>
                    ) : (
                      <Link href={`/vehicles/${vehicle._id}`} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Book Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Vehicles() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-outfit text-xl font-bold">Loading vehicles...</div>}>
      <VehiclesContent />
    </Suspense>
  );
}
