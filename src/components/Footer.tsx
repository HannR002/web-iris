import React from 'react';
import type { MerchantConfig, ProductCategory } from '../types/florist.ts';
import { MapPin, Phone, Clock, Instagram, MessageCircle, Heart } from 'lucide-react';
import { createWhatsAppUrl } from '../utils/floristLogic.ts';

type FooterProps = {
  merchantConfig: MerchantConfig;
  onSelectCategory: (category: ProductCategory) => void;
  onOpenAdmin: () => void;
};

export const Footer: React.FC<FooterProps> = ({
  merchantConfig,
  onSelectCategory,
  onOpenAdmin,
}) => {
  const waUrl = createWhatsAppUrl(
    merchantConfig.whatsappNumber,
    `Halo ${merchantConfig.storeName}, saya ingin menanyakan informasi pemesanan bunga.`
  );

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          
          {/* Brand & Identity */}
          <div className="space-y-3">
            <span className="font-serif text-2xl font-bold text-white tracking-tight block">
              {merchantConfig.storeName}
            </span>
            <p className="text-stone-400 text-xs leading-relaxed">
              Studio florist artisan lokal di Kota Jambi. Menyediakan aneka buket bunga segar, papan bunga ucapan, hadiah wisuda, hantaran pernikahan, dan hampers premium.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 flex items-center justify-center transition-colors"
                aria-label="Hubungi WhatsApp Florist"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <span className="text-stone-400 text-xs">{merchantConfig.displayPhone}</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Koleksi Bunga Jambi
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('buket')}
                  className="hover:text-white transition-colors"
                >
                  Hand Bouquet Mawar & Lili
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('papan-bunga')}
                  className="hover:text-white transition-colors"
                >
                  Papan Bunga Selamat & Duka Cita
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('wisuda')}
                  className="hover:text-white transition-colors"
                >
                  Buket Wisuda UNJA & Boneka
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pernikahan')}
                  className="hover:text-white transition-colors"
                >
                  Buket Pengantin & Corsage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('hampers')}
                  className="hover:text-white transition-colors"
                >
                  Hampers Buah & Bunga Segar
                </button>
              </li>
            </ul>
          </div>

          {/* Store Info & Jambi Coverage */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Lokasi & Layanan Antar
            </h4>
            <div className="space-y-2 text-stone-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8B2635] shrink-0 mt-0.5" />
                <span>{merchantConfig.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{merchantConfig.operatingHours}</span>
              </div>
              <div className="pt-1 text-[11px] text-stone-400">
                Area: Telanaipura, Danau Sipin, Pasar, Jelutung, Kotabaru, Alam Barajo, Jambi Selatan, Mendalo.
              </div>
            </div>
          </div>

          {/* Prototype & Admin Switcher */}
          <div className="space-y-2.5 bg-stone-800/60 p-4 rounded-xl border border-stone-700/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Tentang Prototipe Demo
            </h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Dirancang sebagai sistem pemesanan digital dan manajemen antrean florist UMKM di Jambi. Dilengkapi pembuat format WhatsApp otomatis.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium rounded-lg transition-colors"
              >
                Buka Panel Pengelola Toko →
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <p>© {new Date().getFullYear()} NGA Florist Jambi · Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dirangkai dengan cinta untuk UMKM Florist Indonesia
          </p>
        </div>

      </div>
    </footer>
  );
};
