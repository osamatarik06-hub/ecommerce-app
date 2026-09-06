import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { deleteReview, toggleReviewApproval } from '@/app/actions/review';

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#3B2F2F]">Manage Reviews</h1>
            <p className="text-xs text-[#6F4E57] mt-1">Approve, moderate, or remove customer reviews across all products.</p>
          </div>
          <Link href="/" className="text-xs font-bold uppercase tracking-wider bg-[#3B2F2F] text-[#FAF3E0] px-4 py-2 rounded-xl">
            Back to Store
          </Link>
        </div>

        <div className="bg-white/95 border border-[#6F4E57]/30 rounded-3xl p-6 shadow-sm overflow-x-auto">
          {reviews.length === 0 ? (
            <p className="text-sm text-[#6F4E57] py-8 text-center">No reviews found in the database.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#6F4E57]/20 text-xs font-bold text-[#6F4E57] uppercase tracking-wider">
                  <th className="pb-3 px-4">Product</th>
                  <th className="pb-3 px-4">Author</th>
                  <th className="pb-3 px-4">Rating</th>
                  <th className="pb-3 px-4">Comment</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7B5]/40 text-sm">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#FAF3E0]/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-[#3B2F2F]">
                      {review.product?.name || 'Unknown Product'}
                    </td>
                    <td className="py-4 px-4 text-[#6F4E57]">{review.author}</td>
                    <td className="py-4 px-4 text-amber-500 font-bold">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </td>
                    <td className="py-4 px-4 text-[#3B2F2F]/90 max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        review.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <form action={async () => {
                        'use server';
                        await toggleReviewApproval(review.id, review.isApproved, review.productId);
                      }} className="inline">
                        <button type="submit" className="text-xs font-bold text-[#6F4E57] hover:underline bg-[#FAF3E0] px-3 py-1.5 rounded-lg border border-[#D8C7B5]">
                          {review.isApproved ? 'Unapprove' : 'Approve'}
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await deleteReview(review.id, review.productId);
                      }} className="inline">
                        <button type="submit" className="text-xs font-bold text-red-600 hover:underline bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}