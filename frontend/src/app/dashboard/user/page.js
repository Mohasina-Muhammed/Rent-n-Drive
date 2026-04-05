'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Rental History</h3>
          </div>
          <ul className="divide-y divide-slate-200">
            {bookings.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-500">You haven't made any bookings yet.</li>
            ) : (
              bookings.map((booking) => (
                <li key={booking._id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {booking.vehicle?.brand} {booking.vehicle?.model} 
                        <span className="text-slate-500 ml-2 font-normal">({booking.vehicle?.registrationNumber})</span>
                      </p>
                      <div className="mt-3 flex flex-col sm:flex-row sm:gap-4 gap-2">
                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          From: <span className="ml-1 text-slate-900">{new Date(booking.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                          To: <span className="ml-1 text-slate-900">{new Date(booking.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-lg font-black text-slate-900 mb-1 font-outfit tracking-tighter">${booking.totalPrice}</div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
