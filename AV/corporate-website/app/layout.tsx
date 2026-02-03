import type { Metadata } from "next";
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SecurityNoticeBanner } from '@/components/commercial/SecurityNoticeBanner';

export const metadata: Metadata = {
  title: "AURUM VAULT - Premium Banking",
  description: "Experience the gold standard in banking with Aurum Vault. Secure, personal, and innovative financial services.",
  icons: {
    icon: '/images/logos/aurum-vault-icon-badge.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-inter antialiased flex flex-col min-h-screen bg-off-white text-charcoal">
        <SecurityNoticeBanner />
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
