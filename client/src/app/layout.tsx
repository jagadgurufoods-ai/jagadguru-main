import Link from 'next/link';
import './globals.css';
import { Providers } from './context/Providers';

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
      <body className="bg-[#fdfaf5] text-[#3a2212] font-sans antialiased">
        <Providers>
          <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-orange-50/50">
            <nav className="max-w-[1440px] mx-auto px-6 h-[90px] flex items-center justify-between">
              {/* Logo area */}
              <div className="flex items-center gap-4 shrink-0">
                <Link href="/">
                  <img src="/assets/image 74.png" alt="" className="h-[70px] w-auto object-contain" />
                </Link>
                <Link href="/">
                  <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[70px] w-auto object-contain" />
                </Link>
              </div>

              {/* Center Links */}
              <div className="hidden lg:flex items-center space-x-10 text-[13px] font-[600] tracking-[0.1em] text-[#705844]">
                <Link href="/category/pickles" className="hover:text-[#be8948] transition-colors">PICKLES</Link>
                <Link href="/category/powders" className="hover:text-[#be8948] transition-colors">POWDERS</Link>
                <Link href="/category/snacks" className="hover:text-[#be8948] transition-colors">SNACKS</Link>
                <Link href="/category/papads" className="hover:text-[#be8948] transition-colors">PAPADS</Link>
                <Link href="/category/premix" className="hover:text-[#be8948] transition-colors">PREMIX</Link>
                <Link href="/category/combos" className="hover:text-[#be8948] transition-colors">COMBOS</Link>
              </div>

              {/* Action Icons */}
              <div className="flex items-center space-x-6 shrink-0">
                <button aria-label="Search" className="hover:opacity-75 transition-opacity">
                  <img src="/assets/search.png" alt="Search" className="h-[20px] w-auto" />
                </button>
                <Link href="/login" aria-label="Profile" className="hover:opacity-75 transition-opacity">
                  <img src="/assets/profile.png" alt="Profile" className="h-[20px] w-auto" />
                </Link>
                <Link href="/wishlist" aria-label="Wishlist" className="hover:opacity-75 transition-opacity">
                  <img src="/assets/heart.png" alt="Wishlist" className="h-[20px] w-auto" />
                </Link>
                <Link href="/cart" aria-label="Cart" className="hover:opacity-75 transition-opacity relative">
                  <img src="/assets/cart.png" alt="Cart" className="h-[20px] w-auto" />
                </Link>
              </div>
            </nav>
          </header>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
