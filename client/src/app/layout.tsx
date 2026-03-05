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
