import React, { useState } from 'react';
import { ShoppingBag, LayoutDashboard, Store, Menu, X, Sparkles } from 'lucide-react';
import type { ProductCategory } from '../types/florist.ts';

type NavbarProps = {
  currentView: 'store' | 'admin';
  onViewChange: (view: 'store' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (category: ProductCategory) => void;
  activeCategory: ProductCategory;
};

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  cartCount,
  onOpenCart,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (cat: ProductCategory) => {
    onSelectCategory(cat);
    if (currentView !== 'store') {
      onViewChange('store');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Promotion / Service notification micro-banner */}
      <div className="bg-[#8B2635] text-stone-100 px-4 py-1.5 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Pengiriman Bunga Segar Area Kota Jambi & Sekitarnya · Buka 07:30 - 21:00 WIB</span>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-5 Nav links) - Zone 3 (Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onViewChange('store');
                onSelectCategory('semua');
              }}
              className="text-left group cursor-pointer focus:outline-none"
              aria-label="Kembali ke Beranda NGA Florist"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 group-hover:text-[#8B2635] transition-colors">
                  NGA Florist
                </span>
                <span className="text-[10px] tracking-widest text-[#8B2635] uppercase font-semibold hidden sm:inline">
                  Jambi
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-700">
            <button
              onClick={() => handleNavClick('semua')}
              className="hover:text-[#8B2635] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Semua Koleksi
            </button>
            <button
              onClick={() => handleNavClick('buket')}
              className="hover:text-[#8B2635] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Hand Bouquet
            </button>
            <button
              onClick={() => handleNavClick('papan-bunga')}
              className="hover:text-[#8B2635] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Papan Bunga Jambi
            </button>
            <button
              onClick={() => handleNavClick('wisuda')}
              className="hover:text-[#8B2635] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Wisuda & Acara
            </button>
            <button
              onClick={() => handleNavClick('hampers')}
              className="hover:text-[#8B2635] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Parcel & Hampers
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Cart + Admin Switcher) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher: Store vs Admin Dashboard */}
            <button
              onClick={() => onViewChange(currentView === 'store' ? 'admin' : 'store')}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 hover:border-stone-400 bg-white text-stone-800 hover:bg-stone-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title={currentView === 'store' ? 'Buka Mode Admin Florist' : 'Kembali ke Toko Pelanggan'}
            >
              {currentView === 'store' ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">Mode Admin (Demo)</span>
                  <span className="sm:hidden">Admin</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">Lihat Toko</span>
                  <span className="sm:hidden">Toko</span>
                </>
              )}
            </button>

            {/* Shopping Bag Button with item badge */}
            {currentView === 'store' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center justify-center p-2.5 bg-[#8B2635] hover:bg-[#721F2B] text-white rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8B2635]/40"
                aria-label={`Keranjang Belanja, ${cartCount} item`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-900 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 px-3 py-1">
            Kategori Bunga
          </p>
          <button
            onClick={() => handleNavClick('semua')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Semua Koleksi Bunga
          </button>
          <button
            onClick={() => handleNavClick('buket')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Hand Bouquet (Mawar, Lili, Gompie)
          </button>
          <button
            onClick={() => handleNavClick('papan-bunga')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Papan Bunga Ucapan (Selamat / Duka Cita)
          </button>
          <button
            onClick={() => handleNavClick('wisuda')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Buket Wisuda & Hadiah Acara
          </button>
          <button
            onClick={() => handleNavClick('pernikahan')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Bunga Pernikahan (Bridal Bouquet)
          </button>
          <button
            onClick={() => handleNavClick('hampers')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Parcel Buah & Bunga Segar
          </button>
        </div>
      )}
    </header>
  );
};
