'use client';
import { useState } from 'react';
import { addReview } from '@/app/actions/review';

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await addReview(formData);
    setIsSubmitting(false);

    if (result) {
      setStatusMessage({ success: result.success, text: result.message });
    }
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white/95 border border-[#6F4E57]/30 rounded-3xl p-6 shadow-sm space-y-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <h3 className="text-lg font-bold text-[#3B2F2F]">Leave a Review</h3>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold ${
          statusMessage.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="flex items-center gap-1 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className="text-2xl focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            {(hoverRating || rating) >= star ? '★' : '☆'}
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-[#6F4E57]">({rating}/5)</span>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-1">
          Your Comment
        </label>
        <textarea
          name="comment"
          required
          rows={3}
          placeholder="What did you think of this product?"
          className="w-full rounded-xl border border-[#D8C7B5] bg-[#FAF3E0]/40 px-4 py-2.5 text-sm text-[#3B2F2F] outline-none focus:border-[#C07C56]"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#3B2F2F] py-3 text-xs font-bold uppercase tracking-widest text-[#FAF3E0] transition-colors hover:bg-[#241B1B] disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Post Review'}
      </button>
    </form>
  );
}