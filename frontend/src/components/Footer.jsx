import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Rent-n-Drive
            </span>
            <p className="mt-4 text-sm text-slate-400">
              Your premium destination for central, reliable, and smooth vehicle rentals. Experience the joy of the open road.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Vehicles</h3>
            <ul className="space-y-4">
              <li><Link href="/vehicles?type=4Wheeler" className="text-base hover:text-white transition-colors">Cars</Link></li>
              <li><Link href="/vehicles?type=2Wheeler" className="text-base hover:text-white transition-colors">Bikes & Scooters</Link></li>
              <li><Link href="/pricing" className="text-base hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-base hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-base hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="text-base hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Connect</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-base hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="text-base hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-base hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-slate-400">
            &copy; {new Date().getFullYear()} Rent-n-Drive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
