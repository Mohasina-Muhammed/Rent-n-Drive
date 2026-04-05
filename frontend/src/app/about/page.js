'use client';
import Link from 'next/link';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          {/* Decorative shapes */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            About Rent-n-Drive
          </h1>
          <p className="mt-4 text-xl sm:text-2xl max-w-3xl mx-auto font-light text-blue-100">
            Your premium platform for renting reliable two-wheelers and comfortable four-wheelers. We make your journey seamless and enjoyable.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
        <div className="glass-card p-8 sm:p-12 shadow-xl border border-white border-opacity-40 backdrop-blur-md rounded-2xl bg-white/80">
          
          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
              Our Mission
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              At Rent-n-Drive, our mission is to provide accessible, affordable, and high-quality vehicle rentals for everyone. Whether you need a quick ride across town on a nimble two-wheeler or a spacious four-wheeler for a family road trip, we bridge the gap between vehicle owners and renters.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We focus on removing the friction from traditional rentals by offering a streamlined, fully digital platform. You can browse, book, and hit the road in just a few clicks.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Seamless Booking</h3>
              <p className="text-slate-600">Our digital-first approach ensures that you can book your vehicle from anywhere, at any time, straight from your device.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Reliable</h3>
              <p className="text-slate-600">Every vehicle on our platform undergoes a thorough quality check. Book with confidence knowing you're in safe hands.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to start your journey?</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link href="/vehicles" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all hover:-translate-y-0.5">
                Browse Our Fleet
              </Link>
              <Link href="/register" className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium shadow-sm hover:bg-blue-50 transition-all">
                Join Now
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
