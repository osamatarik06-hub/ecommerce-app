import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Velvet Store | Premium Quality Goods",
    template: "%s | Velvet Store"
  },
  description: "Discover exclusive collections and premium products at Velvet Store. Fast shipping, secure checkout, and 24/7 customer support.",
  keywords: ["ecommerce", "online shopping", "Velvet Store", "premium goods"],
  authors: [{ name: "Velvet Group" }],
  openGraph: {
    title: "Velvet Store | Premium Quality Goods",
    description: "Discover exclusive collections and premium products at Velvet Store. Fast shipping & secure checkout.",
    url: "https://your-vercel-url.vercel.app", // Replace with your live Vercel domain if you have it
    siteName: "Velvet Store",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velvet Store",
    description: "Discover exclusive collections and premium products at Velvet Store.",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-grow">{children}</div>
        <footer style={{ marginTop: '50px', padding: '20px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
          <p>&copy; 2026 Velvet Store. All rights reserved.</p>
          <p>
            <a href="/privacy.html">Privacy Policy</a> | 
            <a href="/terms.html"> Terms & Conditions</a> | 
            <a href="/refund.html"> Refund Policy</a> | 
            <a href="/shipping.html"> Shipping Policy</a> |
	    <a href="/contact">Contact & FAQ</a> 
          </p>
        </footer>
      </body>
    </html>
  );
}
