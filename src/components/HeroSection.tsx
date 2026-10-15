import React from 'react';
import { ArrowRight, Clock, Award, MessageCircle, MapPin } from 'lucide-react';
import { FloralIllustration } from './FloralIllustration.tsx';
import type { MerchantConfig } from '../types/florist.ts';
import { createWhatsAppUrl } from '../utils/floristLogic.ts';

type HeroSectionProps = {
  merchantConfig: MerchantConfig;
  onExploreClick: () => void;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ merchantConfig, onExploreClick }) => {
  const consultationUrl = createWhatsAppUrl(
    merchantConfig.whatsappNumber,
    `Halo ${merchantConfig.storeName}, saya ingin konsultasi pemesanan karangan bunga segar untuk acara di Jambi.`
  );

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#FAF9F6] via-[#F6F4EE] to-[#FAF9F6] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Screen Hero: 2-Column Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quiet text kicker without pill boxes */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#8B2635] uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Studio Florist Artisan · Kota Jambi & Sekitarnya</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Ungkapkan Kasih & Apresiasi dengan Rangkaian Bunga Segar di Jambi
            </h1>

            {/* Subtitle Prose */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Dari buket mawar romantis, papan bunga ucapan selamat peresmian, buket wisuda UNJA/UIN, hingga belasungkawa terhormat. Dirangkai penuh ketelitian oleh florist lokal Jambi dengan bunga segar bermutu tinggi.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#8B2635] hover:bg-[#721F2B] rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <span>Lihat Katalog Bunga</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={consultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 text-sm font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Konsultasi Cepat WA</span>
              </a>
            </div>

            {/* Service Area trust reassurance */}
            <div className="pt-2 text-xs text-stone-500 flex items-center gap-2">
              <span className="font-medium text-stone-700">Area Antar:</span>
              <span>Telanaipura · Danau Sipin · Jelutung · Pasar · Kotabaru · Muaro Jambi</span>
            </div>
          </div>

          {/* Right Visual Spotlight Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-sm p-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden">
                <FloralIllustration type="bouquet-rose" className="w-full h-full" />
              </div>
              
              <div className="p-3 text-center">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
                  Koleksi Favorit Pekan Ini
                </span>
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Buket Mawar Pastel Grandeur
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  10 Tangkai Mawar Semi Holland Segar + Eucalyptus Impor
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Proof & Reassurance Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-stone-200">
          <div className="p-4 bg-white/70 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-2.5 text-[#8B2635] mb-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">Same-Day Delivery</span>
            </div>
            <p className="text-xs text-stone-600">
              Antar cepat hari ini untuk pesanan terkonfirmasi sebelum pukul 15.00 WIB.
            </p>
          </div>

          <div className="p-4 bg-white/70 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-2.5 text-[#8B2635] mb-1.5">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">Bunga Segar Terpilih</span>
            </div>
            <p className="text-xs text-stone-600">
              Hanya menggunakan mawar, krisan & lily segar yang disortir setiap pagi.
            </p>
          </div>

          <div className="p-4 bg-white/70 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-2.5 text-[#8B2635] mb-1.5">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">Pemesanan WhatsApp</span>
            </div>
            <p className="text-xs text-stone-600">
              Format rincian otomatis tanpa ribet langsung ke WhatsApp florist.
            </p>
          </div>

          <div className="p-4 bg-white/70 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-2.5 text-[#8B2635] mb-1.5">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">Gratis Kartu Ucapan</span>
            </div>
            <p className="text-xs text-stone-600">
              Cetak pesan ucapan personal eksklusif disertakan pada setiap pesanan.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
