import { prisma } from '@/lib/prisma';

import Image from 'next/image';

import Link from 'next/link';

import Navbar from './components/Navbar';

import AddToCartButton from './components/AddToCartButton';

import HeroCarousel from './components/HeroCarousel';



// Complete translation dictionary for EN, AR, and ES support

const translations = {

  en: {

    explore: 'Explore',

    shopByCategory: 'Shop by category',

    exploreArrow: 'Explore →',

    handpicked: 'Handpicked for you',

    trendingNow: 'Trending now',

    productsCount: 'products',

    theVelvetEdit: 'The Velvet Edit',

    elevateEveryday: 'Elevate your\neveryday.',

    velvetEditDesc: 'Thoughtfully selected products designed to make everyday moments a little better.',

    exploreEdit: 'Explore the edit →',

    freshArrivals: 'Fresh arrivals',

    newDiscoveries: 'New discoveries',

    justLanded: 'Just landed',

    new: 'New',

    customerFeedback: 'Customer feedback',

    trustedByCommunity: 'Trusted by our community',

    verifiedBuyers: 'Verified buyers',

    velvetPromise: 'The Velvet promise',

    moreThanStore: 'More than a store.',

    curatedProducts: 'Curated products',

    curatedDesc: 'Carefully selected products worth discovering.',

    globalShipping: 'Global shipping',

    shippingDesc: 'Convenient delivery options around the world.',

    secureCheckout: 'Secure checkout',

    checkoutDesc: 'Your payment and personal information stay protected.',

    realSupport: 'Real support',

    supportDesc: "We're here when you need help with your order.",

    searchPlaceholder: 'Search for products, categories, styles...',

    searchButton: 'Search',

    all: 'All',

    tech: 'Tech',

    home: 'Home',

    style: 'Style',

    beauty: 'Beauty',

    off: 'OFF',

    discount: 'OFF',

  },

  ar: {

    explore: 'استكشف',

    shopByCategory: 'تسوق حسب الفئة',

    exploreArrow: 'استكشف ←',

    handpicked: 'مختار خصيصاً لك',

    trendingNow: 'الرائج الآن',

    productsCount: 'منتجات',

    theVelvetEdit: 'إصدار المخمل',

    elevateEveryday: 'ارتقِ بحياتك\nاليومية.',

    velvetEditDesc: 'منتجات مختارة بعناية لتجعل اللحظات اليومية أفضل قليلاً.',

    exploreEdit: 'استكشف الإصدار ←',

    freshArrivals: 'وصول جديد',

    newDiscoveries: 'اكتشافات جديدة',

    justLanded: 'وصل حديثاً',

    new: 'جديد',

    customerFeedback: 'آراء العملاء',

    trustedByCommunity: 'موثوق من مجتمعنا',

    verifiedBuyers: 'مشترون موثوقون',

    velvetPromise: 'وعد المخمل',

    moreThanStore: 'أكثر من مجرد متجر.',

    curatedProducts: 'منتجات مختارة',

    curatedDesc: 'منتجات مختارة بعناية تستحق الاكتشاف.',

    globalShipping: 'شحن عالمي',

    shippingDesc: 'خيارات توصيل مريحة حول العالم.',

    secureCheckout: 'دفع آمن',

    checkoutDesc: 'معلومات الدفع والبيانات الشخصية محمية.',

    realSupport: 'دعم حقيقي',

    supportDesc: 'نحن هنا عندما تحتاج إلى مساعدة بشأن طلبك.',

    searchPlaceholder: 'ابحث عن المنتجات، الفئات، الأنماط...',

    searchButton: 'بحث',

    all: 'الكل',

    tech: 'تقنية',

    home: 'المنزل',

    style: 'أزياء',

    beauty: 'جمال',

    off: 'خصم',

    discount: 'خصم',

  },

  es: {

    explore: 'Explorar',

    shopByCategory: 'Comprar por categoría',

    exploreArrow: 'Explorar →',

    handpicked: 'Seleccionado para ti',

    trendingNow: 'Tendencias',

    productsCount: 'productos',

    theVelvetEdit: 'The Velvet Edit',

    elevateEveryday: 'Eleva tu día\na día.',

    velvetEditDesc: 'Productos cuidadosamente seleccionados para mejorar tus momentos cotidianos.',

    exploreEdit: 'Explorar la selección →',

    freshArrivals: 'Novedades',

    newDiscoveries: 'Nuevos descubrimientos',

    justLanded: 'Recién llegado',

    new: 'Nuevo',

    customerFeedback: 'Opiniones de clientes',

    trustedByCommunity: 'Con la confianza de nuestra comunidad',

    verifiedBuyers: 'Compradores verificados',

    velvetPromise: 'La promesa Velvet',

    moreThanStore: 'Más que una tienda.',

    curatedProducts: 'Productos seleccionados',

    curatedDesc: 'Artículos cuidadosamente seleccionados que vale la pena descubrir.',

    globalShipping: 'Envío global',

    shippingDesc: 'Opciones de entrega convenientes en todo el mundo.',

    secureCheckout: 'Pago seguro',

    checkoutDesc: 'Tu información personal y de pago se mantiene protegida.',

    realSupport: 'Soporte real',

    supportDesc: 'Estamos aquí cuando necesitas ayuda con tu pedido.',

    searchPlaceholder: 'Buscar productos, categorías, estilos...',

    searchButton: 'Buscar',

    all: 'Todos',

    tech: 'Tecnología',

    home: 'Hogar',

    style: 'Estilo',

    beauty: 'Belleza',

    off: 'DTO',

    discount: 'DTO',

  },

};



interface Product {

  id: string;

  name: string;

  description: string;

  price: number;

  discountPrice?: number | null;

  imageUrl: string;

}



interface Review {

  id: string;

  rating: number;

  comment: string;

  author: string;

  product?: {

    id: string;

    name: string;

  } | null;

}



export default async function HomePage({

  searchParams,

}: {

  searchParams: Promise<{ category?: string; search?: string; lang?: string }>;

}) {

  const resolvedSearchParams = await searchParams;



  const selectedCategory = resolvedSearchParams.category || 'All';

  const searchQuery = resolvedSearchParams.search || '';

  

  const rawLang = resolvedSearchParams.lang;

  const currentLang = (rawLang === 'ar' || rawLang === 'es' ? rawLang : 'en') as 'en' | 'ar' | 'es';

  const t = translations[currentLang];



  const categories = [

    { name: t.all, slug: 'all', icon: '✦' },

    { name: t.tech, slug: 'tech', icon: '' },

    { name: t.home, slug: 'home', icon: '' },

    { name: t.style, slug: 'style', icon: '' },

    { name: t.beauty, slug: 'beauty', icon: '' },

  ];



  const products = await prisma.product.findMany({

    where: {

      AND: [

        searchQuery

          ? {

              OR: [

                { name: { contains: searchQuery, mode: 'insensitive' } },

                { description: { contains: searchQuery, mode: 'insensitive' } },

              ],

            }

          : {},

        selectedCategory !== 'All' && selectedCategory !== 'all'

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

    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>

      <Navbar />



      <main className="w-full flex-1">

        <HeroCarousel />



        <div className="w-full px-4 sm:px-8 py-10">

          <div className="w-full max-w-[1450px] mx-auto space-y-20">



            {/* SEARCH SECTION */}

            <section id="categories-section">

              <form

                method="GET"

                action="/"

                className="group relative flex items-center overflow-hidden rounded-2xl border border-[#D8C7B5] bg-[#FFFDF8] p-2 shadow-[0_10px_35px_rgba(59,47,47,0.06)] transition-all focus-within:border-[#C07C56]"

              >

                <input type="hidden" name="lang" value={currentLang} />

                {selectedCategory !== 'All' && (

                  <input type="hidden" name="category" value={selectedCategory} />

                )}



                <div className="flex h-12 w-12 items-center justify-center text-[#6F4E57]">

                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

                    <circle cx="11" cy="11" r="7" />

                    <path d="m20 20-4-4" />

                  </svg>

                </div>



                <input

                  type="text"

                  name="search"

                  defaultValue={searchQuery}

                  placeholder={t.searchPlaceholder}

                  className="h-12 flex-1 bg-transparent px-2 text-sm text-[#3B2F2F] outline-none placeholder:text-[#6F4E57]/45"

                />



                <button

                  type="submit"

                  className="hidden rounded-xl bg-[#3B2F2F] px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF3E0] transition-colors hover:bg-[#241B1B] sm:block"

                >

                  {t.searchButton}

                </button>

              </form>

            </section>



            {/* CATEGORIES */}

            <section>

              <div className="mb-5 flex items-end justify-between">

                <div>

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">

                    {t.explore}

                  </p>

                  <h2 className="text-3xl font-black tracking-tight text-[#3B2F2F]">

                    {t.shopByCategory}

                  </h2>

                </div>

              </div>

		
		

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">

                {categories.map((category) => {

                  const active = selectedCategory.toLowerCase() === category.slug.toLowerCase();



                  return (

                    <Link

                      key={category.slug}

                      href={

                        category.slug === 'all'

                          ? `/?lang=${currentLang}`

                          : `/?category=${category.slug}&lang=${currentLang}`

                      }

                      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${

                        active

                          ? 'border-[#3B2F2F] bg-[#3B2F2F] text-[#FAF3E0] shadow-lg'

                          : 'border-[#D8C7B5] bg-[#FFFDF8] text-[#3B2F2F] hover:border-[#C07C56] hover:shadow-lg'

                      }`}

                    >

                      <div className="mb-5 text-2xl opacity-80">{category.icon}</div>

                      <p className="text-sm font-bold uppercase tracking-[0.12em]">{category.name}</p>

                      <div className="mt-4 text-xs opacity-50 transition-transform group-hover:translate-x-1">

                        {t.exploreArrow}

                      </div>

                    </Link>

                  );

                })}

              </div>

            </section>


            {/* TRENDING PRODUCTS */}

            <section id="trending">

              <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">

                <div>

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">

                    {t.handpicked}

                  </p>

                  <h2 className="text-3xl font-black tracking-tight">{t.trendingNow}</h2>

                </div>

                <span className="hidden text-xs font-medium text-[#6F4E57] sm:block">

                  {products.length} {t.productsCount}

                </span>

              </div>



              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {trendingProducts.map((product: Product & { discountPrice?: number | null }) => {

                  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

                  const discountPercentage = hasDiscount

                    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)

                    : 0;



                  return (

                    <div

                      key={product.id}

                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D8C7B5] bg-[#FFFDF8] transition-all duration-300 hover:-translate-y-1 hover:border-[#C07C56]/50 hover:shadow-[0_20px_45px_rgba(59,47,47,0.10)]"

                    >

                      <div>

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

                          <div className="absolute left-4 top-4 flex flex-col gap-1">

                            {hasDiscount ? (

                              <span className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm">

                                -{discountPercentage}% {t.discount}

                              </span>

                            ) : (

                              <span className="rounded-full bg-[#FFFDF8]/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#3B2F2F] backdrop-blur">

                                {t.trendingNow}

                              </span>

                            )}

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

                        </div>

                      </div>



                      <div className="p-5 pt-0">

                        <div className="mt-5 flex items-center justify-between border-t border-[#D8C7B5]/60 pt-4">

                          <div className="flex items-center gap-2">

                            {hasDiscount ? (

                              <>

                                <span className="text-lg font-black text-red-600">

                                  ${(product.discountPrice! / 100).toFixed(2)}

                                </span>

                                <span className="text-sm font-semibold text-[#6F4E57] line-through">

                                  ${(product.price / 100).toFixed(2)}

                                </span>

                              </>

                            ) : (

                              <span className="text-lg font-black text-[#3B2F2F]">

                                ${(product.price / 100).toFixed(2)}

                              </span>

                            )}

                          </div>

                          <AddToCartButton

                            id={product.id}

                            name={product.name}

                            price={hasDiscount ? product.discountPrice! : product.price}

                          />

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            </section>



            {/* EDITORIAL PROMO */}

            <section>

              <div className="relative overflow-hidden rounded-[30px] bg-[#6F4E57] px-8 py-14 md:px-14 lg:px-20">

                <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[#C07C56]/30 blur-3xl" />

                <div className="relative z-10 max-w-2xl">

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E6C9A8]">

                    {t.theVelvetEdit}

                  </p>

                  <h2 className="mt-4 text-4xl font-black leading-tight text-[#FAF3E0] md:text-5xl whitespace-pre-line">

                    {t.elevateEveryday}

                  </h2>

                  <p className="mt-5 max-w-lg text-sm leading-6 text-[#FAF3E0]/70">

                    {t.velvetEditDesc}

                  </p>

                  <a

                    href="#trending"

                    className="mt-8 inline-flex rounded-xl bg-[#C07C56] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#d28b65]"

                  >

                    {t.exploreEdit}

                  </a>

                </div>

              </div>

            </section>



            {/* NEW ARRIVALS */}

            {newProducts.length > 0 && (

              <section>

                <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">

                  <div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">

                      {t.freshArrivals}

                    </p>

                    <h2 className="text-3xl font-black tracking-tight">{t.newDiscoveries}</h2>

                  </div>

                  <span className="hidden text-xs text-[#6F4E57] sm:block">{t.justLanded}</span>

                </div>



                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                  {newProducts.map((product: Product & { discountPrice?: number | null }) => {

                    const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

                    const discountPercentage = hasDiscount

                      ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)

                      : 0;



                    return (

                      <Link

                        href={`/product/${product.id}`}

                        key={product.id}

                        className="group flex flex-col justify-between"

                      >

                        <div>

                          <div className="relative aspect-[4/4.2] overflow-hidden rounded-2xl bg-[#FFFDF8] border border-[#D8C7B5]">

                            <Image

                              src={product.imageUrl}

                              alt={product.name}

                              fill

                              unoptimized

                              className="object-cover transition-transform duration-500 group-hover:scale-105"

                            />

                            <div className="absolute left-4 top-4 rounded-full bg-[#C07C56] px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white">

                              {hasDiscount ? `-${discountPercentage}% ${t.discount}` : t.new}

                            </div>

                          </div>

                          <div className="pt-4">

                            <h3 className="font-bold text-[#3B2F2F] group-hover:text-[#C07C56] line-clamp-1">

                              {product.name}

                            </h3>

                            <div className="mt-1 flex items-center gap-2">

                              {hasDiscount ? (

                                <>

                                  <span className="text-sm font-bold text-red-600">

                                    ${(product.discountPrice! / 100).toFixed(2)}

                                  </span>

                                  <span className="text-xs text-[#6F4E57] line-through">

                                    ${(product.price / 100).toFixed(2)}

                                  </span>

                                </>

                              ) : (

                                <span className="text-sm font-bold text-[#6F4E57]">

                                  ${(product.price / 100).toFixed(2)}

                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                      </Link>

                    );

                  })}

                </div>

              </section>

            )}



            {/* CUSTOMER TESTIMONIALS SECTION */}

            {testimonials.length > 0 && (

              <section>

                <div className="mb-7 flex items-end justify-between border-b border-[#D8C7B5] pb-5">

                  <div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">

                      {t.customerFeedback}

                    </p>

                    <h2 className="text-3xl font-black tracking-tight">{t.trustedByCommunity}</h2>

                  </div>

                  <span className="hidden text-xs text-[#6F4E57] sm:block">{t.verifiedBuyers}</span>

                </div>



                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                  {testimonials.map((review: Review) => (

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

            <section>

              <div className="rounded-[28px] border border-[#D8C7B5] bg-[#FFFDF8] p-7 md:p-10 shadow-sm">

                <div className="mb-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C07C56]">

                    {t.velvetPromise}

                  </p>

                  <h2 className="mt-2 text-2xl font-black">{t.moreThanStore}</h2>

                </div>



                <div className="grid grid-cols-1 divide-y divide-[#D8C7B5] md:grid-cols-4 md:divide-x md:divide-y-0">

                  <div className="py-5 md:px-7 md:py-2">

                    <div className="text-2xl">✦</div>

                    <h3 className="mt-3 text-sm font-bold">{t.curatedProducts}</h3>

                    <p className="mt-1 text-xs leading-5 text-[#6F4E57]">{t.curatedDesc}</p>

                  </div>



                  <div className="py-5 md:px-7 md:py-2">

                    <div className="text-2xl">⌁</div>

                    <h3 className="mt-3 text-sm font-bold">{t.globalShipping}</h3>

                    <p className="mt-1 text-xs leading-5 text-[#6F4E57]">{t.shippingDesc}</p>

                  </div>



                  <div className="py-5 md:px-7 md:py-2">

                    <div className="text-2xl">◇</div>

                    <h3 className="mt-3 text-sm font-bold">{t.secureCheckout}</h3>

                    <p className="mt-1 text-xs leading-5 text-[#6F4E57]">{t.checkoutDesc}</p>

                  </div>



                  <div className="py-5 md:px-7 md:py-2">

                    <div className="text-2xl">♡</div>

                    <h3 className="mt-3 text-sm font-bold">{t.realSupport}</h3>

                    <p className="mt-1 text-xs leading-5 text-[#6F4E57]">{t.supportDesc}</p>

                  </div>

                </div>

              </div>

            </section>



          </div>

        </div>

      </main>

    </div>

  );

} 

