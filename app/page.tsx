import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/Navbar';
import AddToCartButton from './components/AddToCartButton';
import HeroCarousel from './components/HeroCarousel';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const selectedCategory = resolvedSearchParams.category || 'All';
  const searchQuery = resolvedSearchParams.search || '';

  // Stable category list defined safely in code to prevent database typos or clutter
  const categories = [
    { name: 'All', slug: 'all', icon: '✦' },
    { name: 'Tech', slug: 'tech', icon: '⌁' },
    { name: 'Home', slug: 'home', icon: '⌂' },
    { name: 'Style', slug: 'style', icon: '◌' },
    { name: 'Beauty', slug: 'beauty', icon: '✧' },
  ];

  // Fetch products based on category and search query
  const products = await prisma.product.findMany({
    where: {
      AND: [
        searchQuery
          ? {
              OR: [
                {
                  name: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},

        selectedCategory !== 'All'
          ? {
              category: {
                slug: selectedCategory.toLowerCase(),
              },
            }
          : {},
      ],
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch top approved 5-star customer reviews for social proof
  const testimonials = await prisma.review.findMany({
    where: {
      isApproved: true,
      rating: 5,
    },
    include: {
      product: true,
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  const trendingProducts = products.slice(0, 4);
  const newProducts = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col">
      <Navbar />

      <main className="w-full flex-1">
        <HeroCarousel />

        {/* SEARCH SECTION */}
        <section className="mx-auto max-w-[1200px] px-4 pt-8 md:px-8">
          <form
            method="GET"
            action="/"
            className="group relative flex items-center overflow-hidden rounded-2xl border border-[#D8C7B5] bg-[#FFFDF8] p-2 shadow-[0_10px_35px_rgba(59,47,47,0.06)] transition-all focus-within:border-[#C07C56]"
          >
            <div className="flex h-12 w-12 items-center justify-center text-[#6F4E57]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search for products, categories, styles..."
              className="h-12 flex-1 bg-transparent px-2 text-sm text-[#3B2F2F] outline-none placeholder:text-[#6F4E57]/45"
            />

            <button
              type="submit"
              className="hidden rounded-xl bg-[#3B2F2F] px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF3E0] transition-colors hover:bg-[#241B1B] sm:block"
            >
              Search
            </button>
          </form>
        </section>

        {/* CATEGORIES */}
        <section
          id="categories"
          className="mx-auto max-w-[1450px] px-4 pt-14 md:px-8"
        >
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">
                Explore
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#3B2F2F]">
                Shop by category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((category) => {
              const active = selectedCategory.toLowerCase() === category.slug.toLowerCase();

              return (
                <Link
                  key={category.slug}
                  href={
                    category.slug === 'all'
                      ? '/'
                      : `/?category=${category.slug}`
                  }
                  className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    active
                      ? 'border-[#3B2F2F] bg-[#3B2F2F] text-[#FAF3E0] shadow-lg'
                      : 'border-[#D8C7B5] bg-[#FFFDF8] text-[#3B2F2F] hover:border-[#C07C56] hover:shadow-lg'
                  }`}
                >
                  <div className="mb-5 text-2xl opacity-80">
                    {category.icon}
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.12em]">
                    {category.name}
                  </p>
                  <div className="mt-4 text-xs opacity-50 transition-transform group-hover:translate-x-1">
                    Explore →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TRENDING PRODUCTS */}
        <section
          id="trending"
          className="mx-auto max-w-[1450px] px-4 pt-20 md:px-8"
        >
          <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">
                Handpicked for you
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                Trending now
              </h2>
            </div>
            <span className="hidden text-xs font-medium text-[#6F4E57] sm:block">
              {products.length} products
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-[#D8C7B5] bg-[#FFFDF8] transition-all duration-300 hover:-translate-y-1 hover:border-[#C07C56]/50 hover:shadow-[0_20px_45px_rgba(59,47,47,0.10)]"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="relative block aspect-[4/4.2] overflow-hidden bg-[#FAF3E0]"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[#FFFDF8]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#3B2F2F] backdrop-blur">
                    Trending
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="line-clamp-1 text-base font-bold text-[#3B2F2F] transition-colors hover:text-[#C07C56]">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 min-h-[36px] text-xs leading-5 text-[#6F4E57]">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#D8C7B5]/60 pt-4">
                    <span className="text-lg font-black text-[#3B2F2F]">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    <AddToCartButton
                      id={product.id}
                      name={product.name}
                      price={product.price}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EDITORIAL PROMO */}
        <section className="mx-auto max-w-[1450px] px-4 pt-20 md:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-[#6F4E57] px-8 py-14 md:px-14 lg:px-20">
            <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[#C07C56]/30 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E6C9A8]">
                The Velvet Edit
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#FAF3E0] md:text-5xl">
                Elevate your
                <br />
                everyday.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-[#FAF3E0]/70">
                Thoughtfully selected products designed to make everyday
                moments a little better.
              </p>
              <a
                href="#trending"
                className="mt-8 inline-flex rounded-xl bg-[#C07C56] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#d28b65]"
              >
                Explore the edit →
              </a>
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS */}
        {newProducts.length > 0 && (
          <section className="mx-auto max-w-[1450px] px-4 pt-20 md:px-8">
            <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">
                  Fresh arrivals
                </p>
                <h2 className="text-3xl font-black tracking-tight">
                  New discoveries
                </h2>
              </div>
              <span className="hidden text-xs text-[#6F4E57] sm:block">
                Just landed
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="group"
                >
                  <div className="relative aspect-[4/4.2] overflow-hidden rounded-2xl bg-[#FFFDF8]">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-[#C07C56] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white">
                      New
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-bold text-[#3B2F2F] group-hover:text-[#C07C56]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[#6F4E57]">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CUSTOMER TESTIMONIALS SECTION */}
        {testimonials.length > 0 && (
          <section className="mx-auto max-w-[1450px] px-4 pt-20 md:px-8">
            <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">
                  Customer feedback
                </p>
                <h2 className="text-3xl font-black tracking-tight">
                  Trusted by our community
                </h2>
              </div>
              <span className="hidden text-xs text-[#6F4E57] sm:block">
                Verified buyers
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {testimonials.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#D8C7B5] bg-[#FFFDF8] p-6 shadow-sm transition-all duration-300 hover:border-[#C07C56]/50"
                >
                  <div className="space-y-3">
                    <div className="text-amber-500 tracking-widest text-sm">★★★★★</div>
                    <p className="text-xs leading-relaxed text-[#6F4E57] italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>
                  
                  <div className="mt-6 border-t border-[#D8C7B5]/60 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#3B2F2F]">{review.author}</span>
                    </div>
                    {review.product && (
                      <Link 
                        href={`/product/${review.product.id}`}
                        className="inline-block text-[10px] font-medium text-[#6F4E57] bg-[#FAF3E0] px-2.5 py-1 rounded-full border border-[#D8C7B5] hover:border-[#C07C56] transition-colors"
                      >
                        {review.product.name}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRUST SECTION */}
        <section className="mx-auto max-w-[1450px] px-4 py-20 md:px-8">
          <div className="rounded-[28px] border border-[#D8C7B5] bg-[#FFFDF8] p-7 md:p-10">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">
                The Velvet promise
              </p>
              <h2 className="mt-2 text-2xl font-black">
                More than a store.
              </h2>
            </div>

            <div className="grid grid-cols-1 divide-y divide-[#D8C7B5] md:grid-cols-4 md:divide-x md:divide-y-0">
              <div className="py-5 md:px-7 md:py-2">
                <div className="text-2xl">✦</div>
                <h3 className="mt-3 text-sm font-bold">Curated products</h3>
                <p className="mt-1 text-xs leading-5 text-[#6F4E57]">
                  Carefully selected products worth discovering.
                </p>
              </div>

              <div className="py-5 md:px-7 md:py-2">
                <div className="text-2xl">⌁</div>
                <h3 className="mt-3 text-sm font-bold">Global shipping</h3>
                <p className="mt-1 text-xs leading-5 text-[#6F4E57]">
                  Convenient delivery options around the world.
                </p>
              </div>

              <div className="py-5 md:px-7 md:py-2">
                <div className="text-2xl">◇</div>
                <h3 className="mt-3 text-sm font-bold">Secure checkout</h3>
                <p className="mt-1 text-xs leading-5 text-[#6F4E57]">
                  Your payment and personal information stay protected.
                </p>
              </div>

              <div className="py-5 md:px-7 md:py-2">
                <div className="text-2xl">♡</div>
                <h3 className="mt-3 text-sm font-bold">Real support</h3>
                <p className="mt-1 text-xs leading-5 text-[#6F4E57]">
                  We're here when you need help with your order.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}