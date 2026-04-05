'use client';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="bg-slate-50 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h1>
          <p className="text-slate-600 mb-8 text-lg">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row my-8">
          <div className="md:w-1/2 bg-blue-600 p-12 text-white">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <p className="text-blue-100 mb-8 text-lg">Have questions? We're here to help you get on the road.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📍</span>
                <span>123 Mobility Lane, Tech City</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">📞</span>
                <span>+1 (555) 000-RENT</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">✉️</span>
                <span>support@rentndrive.com</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50" 
                  placeholder="Your Name" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50" 
                  placeholder="your@email.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  rows="4" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-slate-50" 
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
