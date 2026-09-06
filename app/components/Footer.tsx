import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#6F4E57]/30 bg-[#3B2F2F] text-[#FAF3E0]/80 py-8 px-6 text-xs mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-[#FAF3E0] font-semibold tracking-wider">
          VELVET &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-[#FAF3E0]/80">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}