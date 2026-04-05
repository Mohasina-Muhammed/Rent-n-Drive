'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', baseDaily: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicleId: '', startDate: '', endDate: '', reason: '' });
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'vehicles') {
        const res = await api.get('/admin/vehicles/pending');
        setPendingVehicles(res.data);
      } else if (activeTab === 'bookings') {
        const res = await api.get('/admin/bookings/all');
        setBookings(res.data);
      } else if (activeTab === 'tracking') {
        const res = await api.get('/admin/active-rentals');
        setActiveRentals(res.data);
      } else if (activeTab === 'maintenance') {
        const res = await api.get('/admin/vehicles/all');
        setAllVehicles(res.data);
      } else if (activeTab === 'conflicts') {
        const res = await api.get('/admin/conflicts');
        setConflicts(res.data);
      } else if (activeTab === 'categories') {
        const res = await api.get('/admin/categories');
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = async (id) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleVehicleApproval = async (id, approved, reason = '') => {
    try {
      await api.put(`/admin/vehicles/${id}/approve`, { approved, reason });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to process vehicle');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', newCategory);
      setNewCategory({ name: '', description: '', baseDaily: '' });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/block-vehicle', maintenanceForm);
      alert('Maintenance scheduled successfully');
      setMaintenanceForm({ vehicleId: '', startDate: '', endDate: '', reason: '' });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to schedule maintenance');
    }
  };

  const renderTabContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={analytics?.totalUsers} icon="👥" color="bg-blue-500" />
              <StatCard title="MAUs" value={analytics?.mau} icon="📈" color="bg-indigo-500" />
              <StatCard title="Conversion" value={`${analytics?.conversionRate}%`} icon="🎯" color="bg-rose-500" />
              <StatCard title="Utilization" value={`${analytics?.utilizationRate}%`} icon="⚡" color="bg-emerald-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <StatCard title="Total Vehicles" value={analytics?.totalVehicles} icon="🚗" color="bg-green-500" />
              <StatCard title="Total Bookings" value={analytics?.totalBookings} icon="📅" color="bg-purple-500" />
              <StatCard title="Avg Duration" value={`${analytics?.avgDuration} days`} icon="⏱️" color="bg-sky-500" />
              <StatCard title="Revenue" value={`$${analytics?.revenue}`} icon="💰" color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue by City */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Revenue by City</h3>
                <div className="space-y-6">
                  {analytics?.revenueByCity?.length > 0 ? analytics.revenueByCity.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700">{item._id || 'Other'}</span>
                        <span className="text-slate-500">${item.revenue} ({item.count} bookings)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (item.revenue / (analytics.revenue || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )) : <p className="text-slate-500 text-sm">No data available yet.</p>}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Usage Dynamics</h3>
                <div className="flex items-center gap-6 mb-8">
                   <div className="text-5xl font-black text-blue-600">{analytics?.usageRate}</div>
                   <div className="text-slate-500 text-sm leading-tight">Average bookings<br/>per vehicle</div>
                </div>
                <div className="space-y-6">
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Bookings</h4>
                   <div className="flex items-end gap-2 h-32 pt-4">
                      {analytics?.monthlyStats?.map((stat, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                           <div 
                             className="w-full bg-blue-100 hover:bg-blue-600 transition-colors rounded-t-lg" 
                             style={{ height: `${(stat.bookings / (analytics.totalBookings || 1)) * 100}%` }}
                           ></div>
                           <span className="text-[10px] font-bold text-slate-400">{stat._id.month}/{stat._id.year.toString().slice(-2)}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Add Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Category Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Economy, Luxury"
                      value={newCategory.name}
                      onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Base Daily Price ($)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 50"
                      value={newCategory.baseDaily}
                      onChange={e => setNewCategory({...newCategory, baseDaily: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                    <textarea 
                      placeholder="Quick details about category..."
                      value={newCategory.description}
                      onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500 h-24"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Create Category
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {categories.map(cat => (
                <div key={cat._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-100 transition-colors">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-slate-500 text-sm mt-1">{cat.description}</p>
                    <div className="mt-3 inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                       From ${cat.baseDaily}/day
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-semibold">{user.phone}</div>
                      <div className="text-xs text-slate-500 italic truncate max-w-[200px]" title={user.address}>{user.address}</div>
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-bold text-slate-600">{user.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isVerified ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleUserToggle(user._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        {user.isVerified ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'vehicles':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingVehicles.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                No vehicles pending approval
              </div>
            ) : (
              pendingVehicles.map(vehicle => (
                <div key={vehicle._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-6">
                    <div className="text-xs font-bold text-blue-600 uppercase mb-1">{vehicle.type}</div>
                    <h3 className="text-lg font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-slate-500 mb-4">{vehicle.registrationNumber}</p>
                    <div className="bg-slate-50 p-3 rounded-lg mb-4">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Owner & Contact</div>
                      <div className="text-sm font-medium text-slate-800">{vehicle.owner?.name}</div>
                      <div className="text-xs text-blue-600 font-bold">{vehicle.owner?.phone}</div>
                      <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">{vehicle.owner?.address}</div>
                    </div>
                  </div>
                  <div className="mt-auto flex border-t border-slate-100">
                    <button onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason !== null) handleVehicleApproval(vehicle._id, false, reason);
                    }} className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors uppercase">Reject</button>
                    <div className="w-[1px] bg-slate-100"></div>
                    <button onClick={() => handleVehicleApproval(vehicle._id, true)} className="flex-1 py-4 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors uppercase">Approve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'bookings':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Dates</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{booking.vehicle?.brand} {booking.vehicle?.model}</div>
                        <div className="text-xs text-slate-500">{booking.vehicle?.registrationNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{booking.customer?.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold truncate leading-tight">
                        {new Date(booking.startDate).toLocaleDateString()} - <br/>
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right md:text-left">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <div className="p-12 text-center text-slate-400">No bookings found.</div>}
            </div>
          </div>
        );
      case 'tracking':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="p-6 text-xl font-bold text-slate-900 border-b border-slate-100 font-outfit">Live Rental Tracking</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Return Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRentals.map(rental => {
                    const total = new Date(rental.endDate) - new Date(rental.startDate);
                    const elapsed = new Date() - new Date(rental.startDate);
                    const percent = Math.min(100, Math.max(0, (elapsed / (total || 1)) * 100));
                    return (
                      <tr key={rental._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{rental.vehicle?.brand} {rental.vehicle?.model}</div>
                          <div className="text-xs text-slate-500">{rental.vehicle?.registrationNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-700">{rental.customer?.name}</div>
                          <div className="text-xs text-blue-600 font-bold">{rental.customer?.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-600">
                          {new Date(rental.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-black">{percent.toFixed(0)}% Duration Elapsed</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {activeRentals.length === 0 && <div className="p-12 text-center text-slate-400">No active rentals ongoing.</div>}
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 font-outfit">Schedule Maintenance</h3>
                <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Select Vehicle</label>
                    <select 
                      required
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm focus:ring-blue-500"
                      value={maintenanceForm.vehicleId}
                      onChange={e => setMaintenanceForm({...maintenanceForm, vehicleId: e.target.value})}
                    >
                      <option value="">Choose a vehicle...</option>
                      {allVehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.registrationNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Start Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm"
                        value={maintenanceForm.startDate}
                        onChange={e => setMaintenanceForm({...maintenanceForm, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">End Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm"
                        value={maintenanceForm.endDate}
                        onChange={e => setMaintenanceForm({...maintenanceForm, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Reason / Details</label>
                    <textarea 
                      placeholder="e.g. Engine service, Oil change..."
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl p-3 text-sm h-24"
                      value={maintenanceForm.reason}
                      onChange={e => setMaintenanceForm({...maintenanceForm, reason: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-black transition-colors shadow-lg shadow-slate-900/10">
                    Block Vehicle
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
               <h3 className="text-xl font-bold text-slate-900 px-2 font-outfit">Maintenance Schedule</h3>
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Schedule</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allVehicles.filter(v => v.maintenancePeriods?.length > 0).map(v => (
                        v.maintenancePeriods.map((period, idx) => (
                          <tr key={`${v._id}-${idx}`}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{v.brand} {v.model}</div>
                              <div className="text-xs text-slate-500">{v.registrationNumber}</div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                               <div className="font-bold text-slate-700">{new Date(period.startDate).toLocaleDateString()}</div>
                               <div className="text-slate-400">to {new Date(period.endDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{period.reason}</td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                 </table>
                 {allVehicles.every(v => (v.maintenancePeriods?.length || 0) === 0) && (
                   <div className="p-12 text-center text-slate-400">No vehicles scheduled for maintenance.</div>
                 )}
               </div>
            </div>
          </div>
        );
      case 'conflicts':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 font-outfit">Booking Conflicts Detected</h3>
            {conflicts.length === 0 ? (
              <div className="bg-green-50 border border-green-100 p-12 rounded-3xl text-center">
                <div className="text-4xl mb-4">✅</div>
                <h4 className="text-green-800 font-bold text-lg">No conflicts detected</h4>
                <p className="text-green-600">All bookings and maintenance schedules are currently aligned.</p>
              </div>
            ) : (
              conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-l-rose-500 border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">{conflict.type} Conflict</h4>
                    <p className="text-slate-600">
                      {conflict.type === 'Maintenance' ? (
                        <>Booking for <strong>{conflict.booking?.vehicle?.brand || 'Vehicle'}</strong> overlaps with scheduled maintenance.</>
                      ) : (
                        <>Multiple approved / pending bookings for <strong>{conflict.booking1?.vehicle?.brand || 'Vehicle'}</strong> overlap on the same dates.</>
                      )}
                    </p>
                    <div className="mt-3 flex gap-4 text-xs font-bold uppercase">
                       <span className="text-slate-400">Conflict Dates:</span>
                       <span className="text-rose-600 font-black">
                         {conflict.type === 'Maintenance' 
                           ? `${new Date(conflict.booking?.startDate).toLocaleDateString()} - ${new Date(conflict.booking?.endDate).toLocaleDateString()}`
                           : `${new Date(conflict.booking1?.startDate).toLocaleDateString()} - ${new Date(conflict.booking1?.endDate).toLocaleDateString()}`
                         }
                       </span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">Admin Control Center</h1>
            <p className="text-slate-500 mt-2">Manage the entire Rent-n-Drive ecosystem from here.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 self-start">
              <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <TabButton label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <TabButton label="Vehicles" active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} />
              <TabButton label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
              <TabButton label="Tracking" active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} />
              <TabButton label="Maintenance" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
              <TabButton label="Conflicts" active={activeTab === 'conflicts'} onClick={() => setActiveTab('conflicts')} />
              <TabButton label="Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
            </div>
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <main>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
      <div className={`w-14 h-14 ${color} text-white text-2xl flex items-center justify-center rounded-2xl shadow-lg shadow-black/10`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</div>
        <div className="text-3xl font-black text-slate-900 mt-1">{value || 0}</div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
        active 
          ? 'bg-slate-900 text-white shadow-lg' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
