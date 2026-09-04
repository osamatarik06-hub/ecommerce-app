import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black text-gray-400 py-8 mt-16 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-white font-semibold">
          VELVET &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}