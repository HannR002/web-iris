import React, { useState, useEffect } from 'react';
import type { CartItem, CheckoutFormData, DeliveryDistrict, MerchantConfig, Order } from '../types/florist.ts';
import { calculateOrderTotal, formatIDR, generateOrderId, getWIBDateString, validateCheckoutForm } from '../utils/floristLogic.ts';
import { JAMBI_DELIVERY_DISTRICTS, DELIVERY_TIME_SLOTS } from '../data/mockData.ts';
import { X, MapPin, Calendar, Clock, User, Phone, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Ban } from 'lucide-react';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  merchantConfig: MerchantConfig;
  onSubmitOrder: (order: Order) => void;
  existingOrderIds?: string[];
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  merchantConfig,
  onSubmitOrder,
  existingOrderIds = [],
}) => {
  // Always invoke hooks unconditionally at top level
  const todayWIB = getWIBDateString();

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    recipientName: '',
    recipientPhone: '',
    deliveryDistrict: JAMBI_DELIVERY_DISTRICTS[0].name,
    deliveryAddress: '',
    addressLandmark: '',
    deliveryDate: todayWIB,
    deliveryTimeSlot: DELIVERY_TIME_SLOTS[0].label,
    deliveryNotes: '',
    isAnonymousGift: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      setIsSubmitting(false);
      // Ensure default delivery date is at least today WIB
      setFormData((prev) => ({
        ...prev,
        deliveryDate: prev.deliveryDate < todayWIB ? todayWIB : prev.deliveryDate,
      }));
    }
  }, [isOpen, todayWIB]);

  // Determine current district delivery fee
  const selectedDistrictObj = JAMBI_DELIVERY_DISTRICTS.find(
    (d) => d.name === formData.deliveryDistrict
  ) || JAMBI_DELIVERY_DISTRICTS[0];

  const { itemsSubtotal, effectiveDeliveryFee, totalAmount, isFreeDelivery } = calculateOrderTotal(
    items,
    selectedDistrictObj.fee,
    merchantConfig.freeDeliveryMinAmount
  );

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const hasUnavailableItem = items.some((it) => it.product.stockStatus === 'habis');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasUnavailableItem) {
      setFormErrors({ general: 'Beberapa item di keranjang Anda telah habis. Mohon hapus sebelum checkout.' });
      return;
    }

    const validation = validateCheckoutForm(formData);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    // Create unique, non-colliding Order ID based on WIB date
    const orderId = generateOrderId(existingOrderIds);

    const newOrder: Order = {
      id: orderId,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail?.trim(),
      recipientName: formData.recipientName.trim(),
      recipientPhone: formData.recipientPhone.trim(),
      deliveryDistrict: formData.deliveryDistrict,
      deliveryAddress: formData.deliveryAddress.trim(),
      addressLandmark: formData.addressLandmark.trim(),
      deliveryDate: formData.deliveryDate,
      deliveryTimeSlot: formData.deliveryTimeSlot,
      deliveryNotes: formData.deliveryNotes.trim(),
      isAnonymousGift: formData.isAnonymousGift,
      items: [...items],
      itemsSubtotal,
      deliveryFee: effectiveDeliveryFee,
      totalAmount,
      status: 'baru',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitOrder(newOrder);
    }, 300);
  };

  // Guard render AFTER hooks
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8B2635]">
              Langkah Terakhir Pemesanan
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Formulir Pengantaran Bunga Jambi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup form pemesanan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body: 2 Columns on desktop */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Input Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Block 1: Customer Data */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                  <User className="w-4 h-4 text-[#8B2635]" />
                  <h3 className="text-sm font-semibold text-stone-900">
                    1. Data Pemesan (Untuk Notifikasi WA)
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Pemesan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                      formErrors.customerName
                        ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                        : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                    }`}
                  />
                  {formErrors.customerName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.customerName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nomor WhatsApp Pemesan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Contoh: 081274189000"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                        formErrors.customerPhone
                          ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                          : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                      }`}
                    />
                    {formErrors.customerPhone && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="pemesan@email.com"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Block 2: Recipient & Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                  <MapPin className="w-4 h-4 text-[#8B2635]" />
                  <h3 className="text-sm font-semibold text-stone-900">
                    2. Data Penerima & Alamat di Jambi
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Penerima Bunga <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      placeholder="Contoh: Dr. Hendra Gunawan"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                        formErrors.recipientName
                          ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                          : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                      }`}
                    />
                    {formErrors.recipientName && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.recipientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      No. Telepon / WA Penerima <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                      placeholder="081398765432"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                        formErrors.recipientPhone
                          ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                          : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                      }`}
                    />
                    {formErrors.recipientPhone && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.recipientPhone}</p>
                    )}
                  </div>
                </div>

                {/* District Selector in Jambi */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Kecamatan Tujuan (Kota Jambi & Sekitarnya) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.deliveryDistrict}
                    onChange={(e) => handleInputChange('deliveryDistrict', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white"
                  >
                    {JAMBI_DELIVERY_DISTRICTS.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name} ({formatIDR(dist.fee)} · est. {dist.estimatedTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                    placeholder="Nama jalan, nomor rumah/kantor, RT/RW, kelurahan..."
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                      formErrors.deliveryAddress
                        ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                        : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                    }`}
                  />
                  {formErrors.deliveryAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.deliveryAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Patokan Lokasi (Landmark Membantu Kurir)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLandmark}
                    onChange={(e) => handleInputChange('addressLandmark', e.target.value)}
                    placeholder="Contoh: Samping Masjid Al-Falah / Seberang Indomaret Simpang Pulai"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white"
                  />
                </div>
              </div>

              {/* Block 3: Schedule & Notes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                  <Calendar className="w-4 h-4 text-[#8B2635]" />
                  <h3 className="text-sm font-semibold text-stone-900">
                    3. Waktu & Instruksi Khusus
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Tanggal Kirim <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayWIB}
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white ${
                        formErrors.deliveryDate
                          ? 'border-rose-400 ring-rose-400 focus:border-rose-500'
                          : 'border-stone-300 focus:ring-[#8B2635] focus:border-[#8B2635]'
                      }`}
                    />
                    {formErrors.deliveryDate && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.deliveryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Pilihan Slot Jam Pengiriman <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.deliveryTimeSlot}
                      onChange={(e) => handleInputChange('deliveryTimeSlot', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white"
                    >
                      {DELIVERY_TIME_SLOTS.map((slot) => (
                        <option key={slot.id} value={slot.label}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Instruksi Kurir Tambahan
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryNotes}
                    onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                    placeholder="Contoh: Titipkan ke satpam lobi / jangan bunyikan klakson"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] focus:border-[#8B2635] bg-white"
                  />
                </div>

                {/* Secret Gift Checkbox */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymousGift}
                    onChange={(e) => handleInputChange('isAnonymousGift', e.target.checked)}
                    className="w-4 h-4 text-[#8B2635] rounded border-stone-300 focus:ring-[#8B2635]"
                  />
                  <span className="text-xs text-stone-700">
                    Kirim sebagai <strong>Hadiah Rahasia / Kejutan</strong> (Rahasiakan nama pemesan dari penerima saat kurir tiba)
                  </span>
                </label>
              </div>

            </div>

            {/* Right Column: Order Summary & Florist Disclaimer (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-200 pb-2">
                  Ringkasan Pesanan ({items.length} item)
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="text-xs flex justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 truncate">
                          {item.product.name} (x{item.quantity})
                        </p>
                        <p className="text-stone-500 text-[11px]">
                          Warna: {item.selectedColor.name}
                        </p>
                        {item.cardGreeting?.to && (
                          <p className="text-stone-400 text-[10px] truncate">
                            Untuk: {item.cardGreeting.to}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-medium text-stone-800 tabular-nums shrink-0">
                        {formatIDR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 pt-3 border-t border-stone-200 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal Produk</span>
                    <span className="font-mono tabular-nums">{formatIDR(itemsSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <div>
                      <span>Ongkir ({formData.deliveryDistrict})</span>
                      {isFreeDelivery && (
                        <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          PROMO GRATIS
                        </span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums">
                      {effectiveDeliveryFee === 0 ? 'Gratis' : formatIDR(effectiveDeliveryFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                    <span>Total Estimasi</span>
                    <span className="font-mono tabular-nums text-base text-[#8B2635]">
                      {formatIDR(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Florist Confirmation Disclaimer (Prompt requirement 9) */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/90 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Konfirmasi Florist Diperlukan</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-800">
                  Pesanan ini menghasilkan format pesan WhatsApp terstruktur ke {merchantConfig.storeName}. Jadwal pengiriman aktual dan ketersediaan bunga segar hari ini akan dicek & dikonfirmasi oleh admin florist.
                </p>
              </div>

              {/* Trust badges */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Simulasi Demo: Tanpa input kartu kredit / pembayaran online langsung.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#8B2635] hover:bg-[#721F2B] text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Lanjut & Buat Pesan WhatsApp'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
