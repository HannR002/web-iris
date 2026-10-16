import React, { useState } from 'react';
import { Lock, KeyRound, Sparkles, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { MerchantConfig } from '../types/florist.ts';

type AdminLoginModalProps = {
  isOpen: boolean;
  onLoginSuccess: () => void;
  onCancel: () => void;
  merchantConfig: MerchantConfig;
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onCancel,
  merchantConfig,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    // Accept demo PINs or demo password
    if (cleanPin === '1234' || cleanPin === 'admin123' || cleanPin === 'admin') {
      setErrorMsg('');
      onLoginSuccess();
    } else {
      setErrorMsg('PIN / Kata sandi demo tidak tepat. Silakan gunakan PIN "1234" atau klik "Masuk Otomatis Demo".');
    }
  };

  const handleFastDemoLogin = () => {
    setPin('1234');
    setErrorMsg('');
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-stone-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#8B2635] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                Area Khusus Pengelola
              </span>
              <h2 className="font-serif text-lg font-bold">
                Masuk Admin Florist
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white p-1 rounded-lg"
            aria-label="Kembali ke toko"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Demo Notice Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Simulasi Otentikasi Demo UMKM</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Ini adalah simulasi login dashboard internal florist {merchantConfig.storeName}. Untuk kemudahan evaluasi prototype, gunakan PIN demo di bawah atau klik tombol Masuk Otomatis.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                PIN Akses Pengelola / Kasir
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Masukkan PIN (Demo: 1234)"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B2635] font-mono"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
                <span>PIN Bawaan Demo: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded font-bold text-stone-800">1234</code></span>
                <span>Atau sandi: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded font-bold text-stone-800">admin123</code></span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#8B2635] hover:bg-[#721F2B] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Masuk ke Panel Pengelola
              </button>

              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>⚡ 1-Klik Masuk Akses Demo</span>
              </button>
            </div>
          </form>

          {/* Technical Architecture Disclaimer */}
          <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 leading-relaxed">
            <span className="font-semibold text-stone-700 block mb-0.5">Catatan Arsitektur Produksi:</span>
            Pada tahap rilis produksi berikutnya, login ini akan dihubungkan ke sistem autentikasi terpusat (Firebase Auth / JWT) dengan enkripsi bcrypt dan pemisahan hak akses per peran (Owner, Perangkai, Kurir).
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog Pelanggan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
