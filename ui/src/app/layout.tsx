import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientMidnightProvider } from '@/components/ClientMidnightProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anonymous Organization Membership',
  description: 'Zero-Knowledge Proofs for Membership Verification on Midnight Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientMidnightProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {children}
          </main>
        </ClientMidnightProvider>
      </body>
    </html>
  );
}
