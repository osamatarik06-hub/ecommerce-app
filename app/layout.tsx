import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";

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
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}