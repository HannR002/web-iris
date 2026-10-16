import React, { useState, useEffect } from 'react';
import type { FlowerColorVariant, Product } from '../types/florist.ts';
import { formatIDR } from '../utils/floristLogic.ts';
import { FloralIllustration } from './FloralIllustration.tsx';
import { X, Check, Clock, Plus, Minus, ShoppingBag, AlertCircle, Ban } from 'lucide-react';

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedColor: FlowerColorVariant,
    cardGreeting: { to: string; message: string; from: string },
    customNotes: string
  ) => void;
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  // Always call all hooks unconditionally at top level
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<FlowerColorVariant>({
    id: 'default',
    name: 'Standar Florist',
    hex: '#FFCBA4',
  });
  const [recipientTo, setRecipientTo] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [senderFrom, setSenderFrom] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [addedToast, setAddedToast] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Synchronize and reset form state whenever a different product is selected
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(
        product.availableColors[0] || { id: 'default', name: 'Standar Florist', hex: '#FFCBA4' }
      );
      setRecipientTo('');
      setGreetingMessage('');
      setSenderFrom('');
      setCustomNotes('');
      setAddedToast(false);
      setImageError(false);
    }
  }, [product?.id]);

  // Quick greetings templates
  const greetingTemplates = [
    {
      label: 'Selamat & Sukses',
      text: 'Selamat dan sukses atas pembukaan cabang baru. Semoga bisnis semakin berkembang dan berkah selalu.',
    },
    {
      label: 'Ulang Tahun',
      text: 'Selamat ulang tahun! Semoga senantiasa diberikan kesehatan, kebahagiaan, dan tercapai segala impian.',
    },
    {
      label: 'Wisuda',
      text: 'Happy Graduation! Selamat atas kelulusannya. Bangga atas perjuanganmu, sukses di babak baru!',
    },
    {
      label: 'Belasungkawa',
      text: 'Turut berduka cita yang sedalam-dalamnya. Semoga keluarga yang ditinggalkan diberikan ketabahan dan kekuatan.',
    },
    {
      label: 'Romantis / Anniversary',
      text: 'Happy Anniversary tersayang. Terima kasih selalu ada dan melengkapi hidupku. I love you.',
    },
  ];

  const handleApplyTemplate = (text: string) => {
    setGreetingMessage(text);
  };

  // Guard rendered content after hooks
  if (!product) return null;

  const isOutOfStock = product.stockStatus === 'habis';

  const handleAddToCartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    onAddToCart(
      product,
      quantity,
      selectedColor,
      { to: recipientTo.trim(), message: greetingMessage.trim(), from: senderFrom.trim() },
      customNotes.trim()
    );
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 400);
  };

  const currentSubtotal = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50/70">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8B2635]">
              Personalisasi Rangkaian Bunga
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 line-clamp-1">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup jendela rincian produk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleAddToCartSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          
          {/* Out of Stock Warning Banner */}
          {isOutOfStock && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Stok Bunga Habis:</strong> Rangkaian ini sedang tidak tersedia untuk dipesan hari ini. Silakan pilih rangkaian bunga lainnya.
              </span>
            </div>
          )}

          {/* Top Overview: Visual + Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            
            {/* Visual Box (5 cols) */}
            <div className="sm:col-span-5 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[4/3] relative">
              {product.imageUrl && !imageError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FloralIllustration type={product.imageType} className="w-full h-full" />
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-2xs flex items-center justify-center p-3 text-center">
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    STOK BUNGA HABIS HARI INI
                  </span>
                </div>
              )}
            </div>

            {/* Product Meta (7 cols) */}
            <div className="sm:col-span-7 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                  {formatIDR(product.price)}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                    isOutOfStock
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : product.stockStatus === 'preorder'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isOutOfStock
                    ? 'Habis Hari Ini'
                    : product.stockStatus === 'preorder'
                    ? 'Pre-Order 1 Hari'
                    : 'Bunga Segar Siap Rangkai'}
                </span>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-1 text-xs text-stone-500 pt-1 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Estimasi Pengerjaan: <strong className="text-stone-700">{product.estimatedPrepTime}</strong></span>
                </div>
                {product.dimensions && (
                  <p>Dimensi: <span className="text-stone-700">{product.dimensions}</span></p>
                )}
                <p>Komposisi: <span className="text-stone-700">{product.flowerTypes.join(', ')}</span></p>
              </div>
            </div>

          </div>

          {/* Section 1: Selectable Flower Colors */}
          <div className="pt-4 border-t border-stone-200">
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              1. Pilih Nuansa & Warna Bunga
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {product.availableColors.map((color) => {
                const isSelected = selectedColor.id === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-stone-200 bg-stone-50'
                        : isSelected
                        ? 'border-[#8B2635] bg-[#8B2635]/5 text-stone-900 ring-1 ring-[#8B2635] cursor-pointer'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700 cursor-pointer'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate flex-1">{color.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8B2635] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Free Greeting Card Customization */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-stone-900">
                2. Tulisan Kartu Ucapan Eksklusif (Gratis)
              </label>
              <span className="text-xs text-stone-500">Dicetak pada kartu florist</span>
            </div>

            {/* Quick Templates */}
            <div>
              <span className="text-xs text-stone-500 block mb-1.5 font-medium">Contoh ucapan cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {greetingTemplates.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleApplyTemplate(tpl.text)}
                    className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    + {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Kepada / Penerima:
                </label>
                <input
                  type="text"
                  disabled={isOutOfStock}
                  value={recipientTo}
                  onChange={(e) => setRecipientTo(e.target.value)}
                  placeholder="Contoh: dr. Amanda / Sahabatku Tiara"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white disabled:bg-stone-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Dari / Pengirim:
                </label>
                <input
                  type="text"
                  disabled={isOutOfStock}
                  value={senderFrom}
                  onChange={(e) => setSenderFrom(e.target.value)}
                  placeholder="Contoh: Dimas & Keluarga / Anonim"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white disabled:bg-stone-100 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-stone-700">
                  Isi Pesan Ucapan:
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  {greetingMessage.length}/250 karakter
                </span>
              </div>
              <textarea
                value={greetingMessage}
                disabled={isOutOfStock}
                maxLength={250}
                onChange={(e) => setGreetingMessage(e.target.value)}
                rows={3}
                placeholder="Tuliskan ucapan Anda di sini..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white leading-relaxed resize-none disabled:bg-stone-100 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Section 3: Custom Florist Instructions */}
          <div className="pt-4 border-t border-stone-200">
            <label className="block text-sm font-semibold text-stone-900 mb-1">
              3. Catatan Khusus Perangkai (Opsional)
            </label>
            <p className="text-xs text-stone-500 mb-2">
              Contoh: Request warna pita khusus (emas/marun), kertas wrapping gelap, atau mohon kirim foto sebelum kurir berangkat.
            </p>
            <input
              type="text"
              disabled={isOutOfStock}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Contoh: Tolong pilih mawar kuncup mekar, pita warna sage green"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white disabled:bg-stone-100 disabled:opacity-60"
            />
          </div>

          {/* Disclaimer regarding freshness & confirmation */}
          <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Ketersediaan:</strong> Rangkaian bunga segar dibuat langsung setelah pesanan dikonfirmasi oleh admin NGA Florist. Stok tangkai bunga segar harian dapat disesuaikan dengan jenis setara bila diperlukan.
            </p>
          </div>

          {/* Quantity & Add to Cart Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xs font-semibold text-stone-700">Jumlah:</span>
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Kurangi jumlah pesanan"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1.5 text-xs font-bold font-mono text-stone-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
                  disabled={isOutOfStock}
                  aria-label="Tambah jumlah pesanan"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="block text-[11px] text-stone-400 uppercase font-semibold">Subtotal</span>
                <span className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                  {formatIDR(currentSubtotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isOutOfStock}
                className={`px-6 py-3 rounded-lg font-semibold text-xs transition-colors shadow-xs flex items-center gap-2 ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#8B2635] hover:bg-[#721F2B] text-white cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? 'Stok Bunga Habis'
                    : addedToast
                    ? 'Ditambahkan! ✓'
                    : 'Tambah ke Keranjang'}
                </span>
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};
