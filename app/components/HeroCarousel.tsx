'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    image: '/hero-1.jpg',
    title: 'Elevate your everyday',
    subtitle: 'The Velvet Edit',
  },
  {
    id: 2,
    image: '/hero-2.jpg',
    title: 'Timeless style & design',
    subtitle: 'New Collection',
  },
  {
    id: 3,
    image: '/hero-3.jpg',
    title: 'Curated for your space',
    subtitle: 'Home & Living',
  },
  {
    id: 4,
    image: '/hero-4.jpg',
    title: 'Discover modern tech',
    subtitle: 'Innovative Gear',
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <section className="mx-auto max-w-[1450px] px-4 pt-6 md:px-8">
      <div className="relative overflow-hidden rounded-[30px] bg-[#3B2F2F] h-[450px] md:h-[550px] shadow-xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              unoptimized
              className="object-cover opacity-50"
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B2F2F]/90 via-[#3B2F2F]/50 to-transparent" />

            <div className="relative z-20 flex h-full flex-col justify-center px-8 md:px-16 lg:px-20 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E6C9A8]">
                {slide.subtitle}
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#FAF3E0] md:text-6xl">
                {slide.title}
              </h2>
              <div className="mt-8 flex gap-4">
                <a
                  href="#trending"
                  className="inline-flex rounded-xl bg-[#C07C56] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#d28b65]"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition hover:bg-black/50"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition hover:bg-black/50"
          aria-label="Next slide"
        >
          ❯
        </button>

        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-[#C07C56]' : 'w-2.5 bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}