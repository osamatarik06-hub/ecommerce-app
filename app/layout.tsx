import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./components/Providers";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "VELVET | Secure E-Commerce Storefront",
    template: "%s | VELVET",
  },
  description: "Shop exclusive high-end tech, accessories, and lifestyle gear securely at VELVET.",
  metadataBase: new URL("https://ecommerce-app-eight-lovat.vercel.app"),
  openGraph: {
    title: "VELVET | Secure E-Commerce Storefront",
    description: "Shop exclusive high-end tech, accessories, and lifestyle gear securely at VELVET.",
    url: "https://ecommerce-app-eight-lovat.vercel.app",
    siteName: "VELVET",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col justify-between`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-00ZLCQ60QP');
          `}
        </Script>

        <Providers>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}