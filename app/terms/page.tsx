import Navbar from '@/app/components/Navbar';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white/90 border border-[#6F4E57]/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3B2F2F] mb-1">Terms & Conditions</h1>
            <p className="text-[#6F4E57] text-xs font-medium">Last updated: September 3, 2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed pt-2">
            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">1. Overview</h2>
              <p className="text-[#3B2F2F]/80">This website is operated by our store team. Throughout the site, the terms “we”, “us” and “our” refer to the store. By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">2. Online Store Terms</h2>
              <p className="text-[#3B2F2F]/80">By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">3. Products and Pricing</h2>
              <p className="text-[#3B2F2F]/80">Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">4. Governing Law</h2>
              <p className="text-[#3B2F2F]/80">These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of our operating region.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}