import Link from 'next/link';
import './globals.css';
import { Providers } from './context/Providers';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Jagadguru Foods | Authentic South Indian Heritage',
  description: 'Authentic pickles, powders, snacks and more from the heart of Andhra.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#fdfaf5] text-[#3a2212] font-sans antialiased overflow-x-hidden">
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
