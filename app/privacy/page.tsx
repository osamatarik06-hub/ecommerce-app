import Navbar from '@/app/components/Navbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white/90 border border-[#6F4E57]/30 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3B2F2F] mb-1">Privacy Policy</h1>
            <p className="text-[#6F4E57] text-xs font-medium">Last updated: September 3, 2026</p>
          </div>

          <p className="text-[#3B2F2F]/80 text-sm leading-relaxed border-b border-[#6F4E57]/20 pb-4">
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.
          </p>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">1. Personal Information We Collect</h2>
              <p className="text-[#3B2F2F]/80">When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the site, and information about how you interact with the site.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">2. How Do We Use Your Personal Information?</h2>
              <p className="text-[#3B2F2F]/80">We use the Order Information that we collect generally to fulfill any orders placed through the site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">3. Sharing Your Personal Information</h2>
              <p className="text-[#3B2F2F]/80">We share your Personal Information with third parties to help us use your Personal Information, as described above. We also use analytics to understand how our customers use the site.</p>
            </section>

            <section className="bg-[#FAF3E0]/50 border border-[#6F4E57]/20 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-[#3B2F2F]">4. Your Rights</h2>
              <p className="text-[#3B2F2F]/80">If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}