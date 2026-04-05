'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'owner') return '/dashboard/owner';
    return '/dashboard/user';
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full transition-all border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-outfit">
              Rent-n-Drive
            </Link>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/vehicles" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm">Browse Fleet</Link>
            <Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm">About Us</Link>

            {user ? (
              <div className="flex items-center gap-4 bg-slate-50 pl-4 pr-1 py-1 rounded-full border border-slate-200">

                <Link href={getDashboardLink()} className="bg-white hover:bg-slate-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 transition-all">
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-blue-600 font-bold text-sm px-2">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-blue-600 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-slate-100 animate-slide-up">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/vehicles" className="block px-3 py-2 text-base font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl">Browse Fleet</Link>
            <Link href="/about" className="block px-3 py-2 text-base font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl">About Us</Link>
            <div className="h-[1px] bg-slate-100 my-2"></div>
            {user ? (
              <>
                <div className="px-3 py-2">
                  <div className="text-xs text-slate-400 font-bold uppercase">Account</div>
                  <div className="text-lg font-bold text-slate-900">{user.name}</div>
                </div>
                <Link href={getDashboardLink()} className="block px-3 py-3 text-center bg-blue-600 text-white font-bold rounded-xl shadow-lg">Go to Dashboard</Link>
                <button onClick={handleLogout} className="w-full px-3 py-3 text-center bg-slate-900 text-white font-bold rounded-xl">Logout</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" className="px-3 py-3 text-center text-slate-700 font-bold hover:bg-slate-50 rounded-xl border border-slate-200">Login</Link>
                <Link href="/register" className="px-3 py-3 text-center bg-blue-600 text-white font-bold rounded-xl shadow-lg">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
