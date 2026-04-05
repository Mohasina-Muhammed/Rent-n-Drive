'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function AddVehicle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    type: '4Wheeler',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    dailyPrice: '',
    weeklyPrice: '',
    monthlyPrice: '',
    city: '',
    pricingCategory: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/vehicles/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-fill suggested pricing if category is selected
    if (name === 'pricingCategory' && value) {
      const category = categories.find(cat => cat._id === value);
      if (category) {
        newFormData.dailyPrice = category.baseDaily;
        newFormData.weeklyPrice = category.baseDaily * 6; // Suggested discount (6 days)
        newFormData.monthlyPrice = category.baseDaily * 22; // Suggested discount (22 days)
      }
    }

    setFormData(newFormData);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const uploadedImageUrls = [];
      for (const file of imageFiles) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrls.push(uploadRes.data.imageUrl);
      }

      const payload = {
        ...formData,
        pricing: {
          daily: Number(formData.dailyPrice),
          weekly: Number(formData.weeklyPrice),
          monthly: Number(formData.monthlyPrice)
        },
        images: uploadedImageUrls
      };
      
      delete payload.dailyPrice;
      delete payload.weeklyPrice;
      delete payload.monthlyPrice;

      await api.post('/vehicles', payload);
      router.push('/dashboard/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle. Please check your inputs.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/owner" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h1 className="text-xl font-bold text-slate-900">Add New Vehicle</h1>
            <p className="mt-1 text-sm text-slate-500">Enter the details of the vehicle you want to list for rent.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Type Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Vehicle Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="4Wheeler">4-Wheeler (Car/SUV)</option>
                  <option value="2Wheeler">2-Wheeler (Bike/Scooter)</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Brand</label>
                <input 
                  type="text" 
                  name="brand" 
                  required 
                  value={formData.brand} 
                  onChange={handleChange} 
                  placeholder="e.g. Toyota, Honda"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Model</label>
                <input 
                  type="text" 
                  name="model" 
                  required 
                  value={formData.model} 
                  onChange={handleChange} 
                  placeholder="e.g. Camry, Civic"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g. New York, London"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Pricing Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Pricing Category</label>
                <select 
                  name="pricingCategory" 
                  value={formData.pricingCategory} 
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="">Select a Category (Optional)</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name} (from ${cat.baseDaily}/day)</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Manufacturing Year</label>
                <input 
                  type="number" 
                  name="year" 
                  required 
                  min="2000" 
                  max={new Date().getFullYear()} 
                  value={formData.year} 
                  onChange={handleChange} 
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Registration Number</label>
                <input 
                  type="text" 
                  name="registrationNumber" 
                  required 
                  value={formData.registrationNumber} 
                  onChange={handleChange} 
                  placeholder="e.g. MH12 AB 1234"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Fuel Type</label>
                <select 
                  name="fuelType" 
                  value={formData.fuelType} 
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Transmission */}
              {formData.type === '4Wheeler' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Transmission</label>
                  <select 
                    name="transmission" 
                    value={formData.transmission} 
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              )}
              {/* Vehicle Images */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 font-bold mb-2">Vehicle Images (Different Angles)</label>
                <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                      <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                    <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-2 text-xs font-medium text-slate-500 group-hover:text-blue-600">Add Photo</span>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 my-6 pt-6">
              <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">Pricing Setup</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Daily Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Daily Rate ($)</label>
                  <input 
                    type="number" 
                    name="dailyPrice" 
                    required 
                    min="1"
                    value={formData.dailyPrice} 
                    onChange={handleChange} 
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {/* Weekly Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Weekly Rate ($)</label>
                  <input 
                    type="number" 
                    name="weeklyPrice" 
                    required 
                    min="1"
                    value={formData.weeklyPrice} 
                    onChange={handleChange} 
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {/* Monthly Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monthly Rate ($)</label>
                  <input 
                    type="number" 
                    name="monthlyPrice" 
                    required 
                    min="1"
                    value={formData.monthlyPrice} 
                    onChange={handleChange} 
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Link href="/dashboard/owner" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
