'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
}

export default function VehicleDetails({ params }) {
  const { id } = use(params); // unwrap async params (Next.js 15)
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ startDate: '', endDate: '' });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchVehicle();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle details', error);
      router.push('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    
    // Calculate total hours
    const diffHours = diffTime / (1000 * 60 * 60);
    // If under 24 hours, charge for 1 day. If over, charge proportional to days (rounded up).
    const diffDays = Math.max(1, Math.ceil(diffHours / 24));
    
    return diffDays * (vehicle.pricing?.daily || 0);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    try {
      const total = calculateTotal();
      await api.post('/bookings', {
        vehicleId: vehicle._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalPrice: total
      });
      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/user');
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading vehicle details...</div>;
  if (!vehicle) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 font-bold mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Fleet
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Image Section */}
          <div className="md:w-3/5 bg-slate-900 relative flex flex-col items-center justify-center overflow-hidden p-6 gap-6">
            <div className="relative z-10 w-full flex-grow flex items-center justify-center">
               {vehicle.images?.length > 0 ? (
                 <img 
                   src={getImageSrc(vehicle.images[activeImage])} 
                   alt={vehicle.model} 
                   className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-2xl transition-all duration-500" 
                 />
               ) : (
                 <div className="text-slate-500 font-bold uppercase tracking-widest">No Image Available</div>
               )}
            </div>

            {/* Gallery Thumbnails */}
            {vehicle.images?.length > 1 && (
              <div className="relative z-10 flex gap-3 overflow-x-auto pb-4 max-w-full no-scrollbar">
                {vehicle.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? 'border-blue-500 scale-110 shadow-lg' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={getImageSrc(img)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-slate-800 shadow-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              {vehicle.city || 'Anywhere'}
            </div>
            <div className={`absolute top-4 right-4 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm uppercase tracking-widest ${vehicle.availabilityStatus === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}>
              {vehicle.availabilityStatus}
            </div>
          </div>

          {/* Details & Booking Section */}
          <div className="md:w-2/5 p-10 flex flex-col bg-white">
            <div className="flex justify-between items-start mb-2">
               <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">{vehicle.brand}</div>
               {vehicle.pricingCategory && (
                 <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-tighter shadow-sm">
                   {vehicle.pricingCategory.name}
                 </span>
               )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tight">{vehicle.model}</h1>
            <p className="text-slate-500 font-medium mb-8">Registration: {vehicle.registrationNumber} &bull; {vehicle.year}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Fuel</div>
                <div className="font-bold text-slate-900">{vehicle.fuelType || 'Petrol'}</div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Transmission</div>
                <div className="font-bold text-slate-900">{vehicle.transmission || 'Automatic'}</div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Pricing Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 transition-colors hover:bg-slate-50 px-2 rounded-lg">
                  <span className="text-slate-500 font-semibold text-sm">Daily (Base)</span>
                  <span className="font-black text-slate-900 font-outfit text-xl">${vehicle.pricing?.daily}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 transition-colors hover:bg-slate-50 px-2 rounded-lg">
                  <span className="text-slate-500 font-semibold text-sm">Weekly (Avg)</span>
                  <span className="font-black text-slate-900 font-outfit text-xl">${vehicle.pricing?.weekly}</span>
                </div>
                <div className="flex justify-between items-center py-3 transition-colors hover:bg-slate-50 px-2 rounded-lg">
                  <span className="text-slate-500 font-semibold text-sm">Monthly (Avg)</span>
                  <span className="font-black text-slate-900 font-outfit text-xl">${vehicle.pricing?.monthly}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              {vehicle.availabilityStatus === 'Maintenance' ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                  <div className="text-amber-500 text-3xl mb-3">🛠️</div>
                  <h4 className="font-bold text-amber-500 mb-2 text-sm uppercase tracking-widest text-white">Under Maintenance</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    This vehicle is currently undergoing scheduled maintenance and is temporarily unavailable for booking.
                  </p>
                </div>
              ) : vehicle.availabilityStatus === 'Booked' ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
                  <div className="text-blue-500 text-3xl mb-3">📅</div>
                  <h4 className="font-bold text-blue-500 mb-2 text-sm uppercase tracking-widest text-white">Currently Reserved</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    This vehicle is already booked by another customer. Please check back later or explore other options in our fleet.
                  </p>
                </div>
              ) : user && user.role !== 'customer' ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Admin/Owner View</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Reservations are only permitted for Customer accounts.
                  </p>
                </div>
              ) : (
                <>
                  {bookingSuccess && (
                    <div className="bg-green-500 text-white px-4 py-3 rounded-2xl text-sm font-bold mb-4 animate-bounce">
                      Booking Confirmed!
                    </div>
                  )}
                  {bookingError && (
                    <div className="bg-red-500 text-white px-4 py-3 rounded-2xl text-sm font-bold mb-4">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBook} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pick up Date & Time</label>
                        <input 
                          type="datetime-local" 
                          required 
                          min={new Date().toISOString().slice(0, 16)}
                          value={bookingData.startDate}
                          onChange={e => setBookingData({...bookingData, startDate: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Drop off Date & Time</label>
                        <input 
                          type="datetime-local" 
                          required 
                          min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
                          value={bookingData.endDate}
                          onChange={e => setBookingData({...bookingData, endDate: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t border-white/10 mt-6">
                      <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Est. Total</span>
                      <span className="text-3xl font-black text-white font-outfit tracking-tighter">${calculateTotal()}</span>
                    </div>

                    <button 
                      type="submit" 
                      disabled={vehicle.availabilityStatus !== 'Available' || !bookingData.startDate || !bookingData.endDate}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 font-outfit uppercase tracking-widest text-xs"
                    >
                      {vehicle.availabilityStatus !== 'Available' ? 'Not Available' : 'Confirm Rental'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
