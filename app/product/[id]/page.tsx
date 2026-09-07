import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Adjust path if needed
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import AddToCartButton from '@/app/components/AddToCartButton';
import ReviewForm from '@/app/components/ReviewForm';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (dbUser) currentUserId = dbUser.id;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const approvedReviews = product.reviews.filter((r) => r.isApproved);
  const totalReviews = approvedReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          approvedReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        ).toFixed(1)
      : null;

  const userAlreadyReviewed = currentUserId
    ? product.reviews.some((r) => r.userId === currentUserId)
    : false;

  // Discount validation & strict primitive fallback pricing metrics
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const effectivePrice: number = hasDiscount && product.discountPrice != null ? product.discountPrice : product.price;

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto p-8 w-full my-auto space-y-12">
        <Link
          href="/"
          className="text-sm text-[#6F4E57] hover:text-[#3B2F2F] underline inline-block font-medium"
        >
          &larr; Back to Marketplace
        </Link>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/95 border border-[#6F4E57]/30 rounded-3xl p-8 shadow-sm">
          <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-[#6F4E57]/20 bg-[#FAF3E0] group cursor-zoom-in flex items-center justify-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 ease-out group-hover:scale-150"
              unoptimized
              priority
            />
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest bg-[#FAF3E0] text-[#6F4E57] px-3 py-1 rounded-full border border-[#6F4E57]/30 font-semibold">
                  In Stock
                </span>
                {averageRating && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    ★ {averageRating} ({totalReviews} reviews)
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mt-4 mb-2 text-[#3B2F2F]">
                {product.name}
              </h1>

              {/* Price Display Block with High Contrast Strikethrough */}
              <div className="flex items-center gap-3 mb-4">
                <p className={`text-2xl font-bold font-mono ${hasDiscount ? 'text-red-500' : 'text-[#C07C56]'}`}>
                  ${(effectivePrice / 100).toFixed(2)}
                </p>
                {hasDiscount && (
                  <p className="text-sm text-[#6F4E57] line-through font-mono">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="border-t border-[#6F4E57]/20 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-[#6F4E57] uppercase mb-2 tracking-wider">
                  Description
                </h3>
                <p className="text-[#3B2F2F]/80 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#6F4E57]/20 flex items-center gap-4">
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={effectivePrice}
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-black text-[#3B2F2F]">
              Customer Reviews ({totalReviews})
            </h2>

            {approvedReviews.length === 0 ? (
              <p className="text-sm text-[#6F4E57] bg-white/50 p-6 rounded-2xl border border-[#6F4E57]/20">
                No approved reviews yet. Be the first to share your thoughts!
              </p>
            ) : (
              approvedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/95 border border-[#6F4E57]/20 rounded-2xl p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#3B2F2F]">
                      {review.author}
                    </span>
                    <span className="text-amber-500 tracking-widest text-sm">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6F4E57]/80">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[#3B2F2F]/90 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          <div>
            {!currentUserId ? (
              <div className="bg-white/95 border border-[#6F4E57]/30 rounded-3xl p-6 text-center space-y-3">
                <p className="text-sm font-medium text-[#6F4E57]">Please log in to leave a review.</p>
                <Link href="/login" className="inline-block w-full py-2.5 bg-[#3B2F2F] text-[#FAF3E0] rounded-xl text-xs font-bold uppercase tracking-widest">
                  Log In
                </Link>
              </div>
            ) : userAlreadyReviewed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-2">
                <p className="text-sm font-bold text-emerald-800">Review Submitted</p>
                <p className="text-xs text-emerald-700">You have already reviewed this product. Your feedback is pending approval.</p>
              </div>
            ) : (
              <ReviewForm productId={product.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}