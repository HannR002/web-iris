import React from 'react';
import type { CartItem, MerchantConfig } from '../types/florist.ts';
import { formatIDR } from '../utils/floristLogic.ts';
import { FloralIllustration } from './FloralIllustration.tsx';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  merchantConfig: MerchantConfig;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  merchantConfig,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const freeThreshold = merchantConfig.freeDeliveryMinAmount || 500000;
  const isFreeDeliveryQualified = subtotal >= freeThreshold;
  const amountToFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8B2635]" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Keranjang Pesanan ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Promo Bar */}
        <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs">
          {isFreeDeliveryQualified ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Selamat! Pesanan Anda memenuhi syarat <strong>Gratis Ongkir</strong> area Jambi.</span>
            </div>
          ) : (
            <div className="text-stone-700">
              <span>Tambah <strong>{formatIDR(amountToFree)}</strong> lagi untuk dapat <strong>Gratis Ongkir</strong> di wilayah Kota Jambi.</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-stone-300" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold text-stone-800 mb-1">
                  Keranjang Bunga Masih Kosong
                </p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Pilih buket bunga segar atau karangan papan bunga terbaik kami untuk memulai pesanan.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#8B2635] text-white text-xs font-semibold rounded-lg hover:bg-[#721F2B] transition-colors"
              >
                Jelajahi Katalog
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2.5"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FloralIllustration type={item.product.imageType} className="w-full h-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        aria-label={`Hapus ${item.product.name} dari keranjang`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected Color */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                      <span className="truncate">{item.selectedColor.name}</span>
                    </div>

                    {/* Unit Price */}
                    <span className="text-xs text-stone-500 font-mono tabular-nums block mt-0.5">
                      {formatIDR(item.product.price)} / buket
                    </span>
                  </div>
                </div>

                {/* Custom Greeting Card Preview if present */}
                {(item.cardGreeting?.to || item.cardGreeting?.message) && (
                  <div className="bg-stone-50 rounded-lg p-2 text-[11px] text-stone-600 border border-stone-150 space-y-0.5">
                    {item.cardGreeting.to && (
                      <p><strong className="text-stone-700">Untuk:</strong> {item.cardGreeting.to}</p>
                    )}
                    {item.cardGreeting.message && (
                      <p className="italic line-clamp-1">"{item.cardGreeting.message}"</p>
                    )}
                  </div>
                )}

                {/* Custom Perangkai Note if present */}
                {item.customNotes && (
                  <p className="text-[11px] text-stone-500 bg-stone-50 px-2 py-1 rounded border border-stone-150 line-clamp-1">
                    <strong>Catatan:</strong> {item.customNotes}
                  </p>
                )}

                {/* Out of Stock Warning for item */}
                {item.product.stockStatus === 'habis' && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded text-[11px] font-medium flex items-center justify-between">
                    <span>⚠️ Stok produk ini sudah habis</span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="underline font-bold hover:text-rose-900"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* Quantity & Item Subtotal */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center border border-stone-300 rounded-md overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                      disabled={item.quantity <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 text-xs font-mono font-bold text-stone-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                      disabled={item.product.stockStatus === 'habis'}
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                    {formatIDR(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal & Proceed to Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Subtotal Produk</span>
              <span className="font-mono font-bold text-base text-stone-900 tabular-nums">
                {formatIDR(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              * Ongkos kirim dihitung berdasarkan kecamatan di Kota Jambi pada langkah berikutnya.
            </p>

            {items.some((it) => it.product.stockStatus === 'habis') ? (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs text-center font-medium">
                Ada produk yang habis di keranjang Anda. Harap hapus produk tersebut untuk melanjutkan ke formulir pengantaran.
              </div>
            ) : (
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#8B2635] hover:bg-[#721F2B] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Pengisian Data Pengiriman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
