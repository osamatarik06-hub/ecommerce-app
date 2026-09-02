export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
        <p className="text-gray-400">
          Thank you for your order. We have received your payment and are getting your items ready for shipment.
        </p>
        <a
          href="/"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
        >
          Back to Store
        </a>
      </div>
    </main>
  );
}