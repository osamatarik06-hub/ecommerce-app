export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: September 3, 2026</p>

      <p className="text-gray-300 text-sm mb-6 leading-relaxed">
        This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.
      </p>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Personal Information We Collect</h2>
          <p>When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the site, and information about how you interact with the site.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. How Do We Use Your Personal Information?</h2>
          <p>We use the Order Information that we collect generally to fulfill any orders placed through the site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Sharing Your Personal Information</h2>
          <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. We also use analytics to understand how our customers use the site.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Your Rights</h2>
          <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted.</p>
        </section>
      </div>
    </div>
  );
}