'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // vehicle id to confirm
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'owner') { router.push('/login'); return; }
    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, bookingsRes] = await Promise.all([
        api.get('/vehicles/my-vehicles'),
        api.get('/bookings/my-bookings'),
      ]);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDelete = async (vehicleId) => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to remove vehicle.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleMaintenance = async (vehicleId) => {
    try {
      await api.put(`/vehicles/${vehicleId}/maintenance-toggle`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle maintenance', error);
    }
  };

  const vehicleHasActiveBooking = (vehicleId) => {
    return bookings.some(
      (b) =>
        b.vehicle?._id === vehicleId &&
        (b.status === 'Pending' || b.status === 'Approved')
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const statusColor = (status, approved = true, rejected = false) => {
    if (rejected) return 'bg-red-100 text-red-800';
    if (!approved) return 'bg-blue-100 text-blue-800';
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Booked': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{user.name} Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your fleet and bookings</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/owner/add-vehicle"
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
            >
              + Add Vehicle
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">My Vehicles</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{vehicles.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Rentals</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'Approved').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Approvals</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'Pending').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'vehicles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              My Vehicles
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              Booking Requests
            </button>
          </nav>
        </div>

        {/* My Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Registered Vehicles</h3>
            </div>
            {vehicles.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <p>You haven&apos;t added any vehicles yet.</p>
                <Link
                  href="/dashboard/owner/add-vehicle"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  + Add Your First Vehicle
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {vehicles.map((vehicle) => {
                  const hasActive = vehicleHasActiveBooking(vehicle._id);
                  return (
                    <li key={vehicle._id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        {/* Image */}
                        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          {vehicle.images?.[0] ? (
                            <img
                              src={getImageSrc(vehicle.images[0])}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{vehicle.registrationNumber} · {vehicle.type}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                            {vehicle.fuelType && <span>{vehicle.fuelType}</span>}
                            {vehicle.transmission && <span>· {vehicle.transmission}</span>}
                            <span>· ${vehicle.pricing?.daily}/day</span>
                          </div>
                          {vehicle.isRejected && vehicle.rejectionReason && (
                            <div className="mt-2 text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded-md font-bold inline-block border border-red-200">
                               REJECTED: {vehicle.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(vehicle.availabilityStatus, vehicle.isApproved, vehicle.isRejected)}`}>
                          {vehicle.isRejected ? 'Rejected' : (!vehicle.isApproved ? 'Pending Approval' : vehicle.availabilityStatus)}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleMaintenance(vehicle._id)}
                            title={vehicle.availabilityStatus === 'Maintenance' ? 'Mark as Available' : 'Toggle Maintenance Mode'}
                            className={`text-xs px-3 py-1.5 rounded border font-medium transition-all ${
                              vehicle.availabilityStatus === 'Maintenance' 
                                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700' 
                                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {vehicle.availabilityStatus === 'Maintenance' ? '🔧 In Maintenance' : '🛠️ Maintenance'}
                          </button>
                          <Link
                            href={`/dashboard/owner/edit-vehicle/${vehicle._id}`}
                            className="text-xs px-3 py-1.5 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
                          >
                            Edit
                          </Link>
                          {!hasActive ? (
                            <button
                              onClick={() => { setDeleteConfirm(vehicle._id); setDeleteError(''); }}
                              className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-medium"
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-400 bg-white cursor-not-allowed" title="Cannot remove a vehicle with active bookings">
                              Remove
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Booking Requests</h3>
            </div>
            <ul className="divide-y divide-slate-200">
              {bookings.length === 0 ? (
                <li className="px-6 py-8 text-center text-slate-500">No bookings found for your vehicles.</li>
              ) : (
                bookings.map((booking) => (
                  <li key={booking._id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Requested by: {booking.customer?.name} ({booking.customer?.email})
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-semibold text-blue-600">
                            Contact: <span className="text-slate-600 font-normal">{booking.customer?.phone}</span>
                          </p>
                          <p className="text-xs font-semibold text-blue-600">
                            Address: <span className="text-slate-600 font-normal italic">{booking.customer?.address}</span>
                          </p>
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row sm:gap-4 gap-2">
                          <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></span>
                            Pickup: <span className="ml-1 text-slate-900 font-bold">{new Date(booking.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 shadow-sm"></span>
                            Drop-off: <span className="ml-1 text-slate-900 font-bold">{new Date(booking.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {booking.status}
                        </span>
                        {booking.status === 'Pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'Approved')}
                              className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'Rejected')}
                              className="text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {booking.status === 'Approved' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'Completed')}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01M10.293 4.293a1 1 0 011.414 0L21 13l-1.414 1.414L12 6.414 4.414 14.414 3 13l7.293-8.707z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Remove Vehicle</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-5">
              Are you sure you want to permanently remove this vehicle from your listings?
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(''); }}
                className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
