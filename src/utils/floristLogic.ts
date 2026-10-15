import type { CheckoutFormData, MerchantConfig, Order, OrderStatus, Product, ProductCategory } from '../types/florist.ts';

/**
 * Format number to Indonesian Rupiah (IDR) currency format.
 * Example: 350000 -> "Rp 350.000"
 */
export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const cleanAmount = Math.round(amount);
  const formatted = cleanAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

/**
 * Format YYYY-MM-DD date string to Indonesian readable format.
 * Example: "2026-10-20" -> "Selasa, 20 Oktober 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate order subtotal, applied delivery fee (considering free delivery rules), and final total.
 */
export function calculateOrderTotal(
  items: { subtotal: number }[],
  deliveryFee: number,
  freeDeliveryThreshold: number = 500000
): { itemsSubtotal: number; effectiveDeliveryFee: number; totalAmount: number; isFreeDelivery: boolean } {
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const isFreeDelivery = itemsSubtotal >= freeDeliveryThreshold && freeDeliveryThreshold > 0;
  const effectiveDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const totalAmount = itemsSubtotal + effectiveDeliveryFee;

  return {
    itemsSubtotal,
    effectiveDeliveryFee,
    totalAmount,
    isFreeDelivery,
  };
}

/**
 * Validates checkout form data with explicit Indonesian error messages.
 */
export function validateCheckoutForm(form: CheckoutFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Customer Name
  if (!form.customerName || form.customerName.trim().length < 2) {
    errors.customerName = 'Nama pemesan wajib diisi (minimal 2 karakter)';
  }

  // Customer Phone (Indonesian format check)
  const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
  const cleanCustomerPhone = (form.customerPhone || '').replace(/[\s-]/g, '');
  if (!cleanCustomerPhone) {
    errors.customerPhone = 'Nomor WhatsApp pemesan wajib diisi';
  } else if (!phoneRegex.test(cleanCustomerPhone)) {
    errors.customerPhone = 'Nomor telepon tidak valid (contoh: 08123456789 atau 628123456789)';
  }

  // Recipient Name
  if (!form.recipientName || form.recipientName.trim().length < 2) {
    errors.recipientName = 'Nama penerima bunga wajib diisi';
  }

  // Recipient Phone
  const cleanRecipientPhone = (form.recipientPhone || '').replace(/[\s-]/g, '');
  if (!cleanRecipientPhone) {
    errors.recipientPhone = 'Nomor telepon penerima wajib diisi';
  } else if (!phoneRegex.test(cleanRecipientPhone)) {
    errors.recipientPhone = 'Nomor telepon penerima tidak valid (contoh: 08123456789)';
  }

  // District in Jambi
  if (!form.deliveryDistrict || form.deliveryDistrict === '') {
    errors.deliveryDistrict = 'Pilih kecamatan tujuan pengiriman di wilayah Jambi';
  }

  // Delivery Address
  if (!form.deliveryAddress || form.deliveryAddress.trim().length < 8) {
    errors.deliveryAddress = 'Alamat pengantaran wajib diisi dengan jelas (minimal 8 karakter)';
  }

  // Delivery Date
  if (!form.deliveryDate) {
    errors.deliveryDate = 'Pilih tanggal pengiriman bunga';
  } else {
    // Check if delivery date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(form.deliveryDate);
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      errors.deliveryDate = 'Tanggal pengiriman tidak boleh di masa lalu';
    }
  }

  // Time Slot
  if (!form.deliveryTimeSlot) {
    errors.deliveryTimeSlot = 'Pilih estimasi jam pengiriman yang diinginkan';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates an orderly, professional WhatsApp message text for florist order confirmation.
 */
export function generateWhatsAppOrderMessage(order: Order, merchantConfig: MerchantConfig): string {
  const dateFormatted = formatIndonesianDate(order.deliveryDate);

  let message = `🌸 *PESANAN BARU - ${merchantConfig.storeName.toUpperCase()}*\n`;
  message += `No. Pesanan: #${order.id}\n`;
  message += `Waktu Order: ${new Date(order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n`;
  message += `━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *DATA PEMESAN:*\n`;
  message += `• Nama: ${order.customerName}\n`;
  message += `• No. WA: ${order.customerPhone}\n`;
  if (order.customerEmail) {
    message += `• Email: ${order.customerEmail}\n`;
  }
  if (order.isAnonymousGift) {
    message += `• Catatan: _(Kirim rahasia / Pengirim anonim kepada penerima)_\n`;
  }
  message += `\n`;

  message += `📍 *DETAIL PENGIRIMAN (JAMBI):*\n`;
  message += `• Penerima: ${order.recipientName} (${order.recipientPhone})\n`;
  message += `• Wilayah: Kec. ${order.deliveryDistrict}, Jambi\n`;
  message += `• Alamat Lengkap: ${order.deliveryAddress}\n`;
  if (order.addressLandmark) {
    message += `• Patokan Lokasi: ${order.addressLandmark}\n`;
  }
  message += `• Tanggal Kirim: ${dateFormatted}\n`;
  message += `• Slot Jam Kirim: ${order.deliveryTimeSlot}\n`;
  if (order.deliveryNotes) {
    message += `• Instruksi Kurir: ${order.deliveryNotes}\n`;
  }
  message += `\n`;

  message += `💐 *RINCIAN PRODUK:* \n`;
  order.items.forEach((item, index) => {
    message += `${index + 1}. *${item.product.name}* (x${item.quantity})\n`;
    message += `   • Pilihan Warna: ${item.selectedColor.name}\n`;
    if (item.customNotes) {
      message += `   • Catatan Perangkai: ${item.customNotes}\n`;
    }
    if (item.cardGreeting && (item.cardGreeting.to || item.cardGreeting.message || item.cardGreeting.from)) {
      message += `   • Kartu Ucapan:\n`;
      if (item.cardGreeting.to) message += `     - Kepada: ${item.cardGreeting.to}\n`;
      if (item.cardGreeting.message) message += `     - Isi Pesan: "${item.cardGreeting.message}"\n`;
      if (item.cardGreeting.from) message += `     - Dari: ${item.cardGreeting.from}\n`;
    }
    message += `   • Subtotal: ${formatIDR(item.subtotal)}\n\n`;
  });

  message += `💰 *RINGKASAN ESTIMASI BIAYA:*\n`;
  message += `• Subtotal Produk: ${formatIDR(order.itemsSubtotal)}\n`;
  message += `• Estimasi Ongkir (${order.deliveryDistrict}): ${order.deliveryFee === 0 ? 'GRATIS (Promo)' : formatIDR(order.deliveryFee)}\n`;
  message += `• *TOTAL ESTIMASI: ${formatIDR(order.totalAmount)}*\n\n`;

  message += `⚠️ *CATATAN PENTING:*\n`;
  message += `_Pesanan ini bersifat reservasi awal demo. Ketersediaan jenis bunga segar harian, slot kurir, dan konfirmasi pembayaran akan dipastikan oleh admin florist ${merchantConfig.storeName} melalui chat ini._\n\n`;
  message += `Mohon konfirmasi ketersediaan & petunjuk pembayaran selanjutnya. Terima kasih! 🙏`;

  return message;
}

/**
 * Creates a valid wa.me URL with URL-encoded text message.
 */
export function createWhatsAppUrl(rawPhone: string, messageText: string): string {
  // Normalize phone number: remove +, spaces, dashes.
  // If starts with 0, replace with 62.
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Filter product list by search query and category.
 */
export function filterProducts(products: Product[], query: string, category: ProductCategory | 'semua'): Product[] {
  return products.filter((item) => {
    const matchesCategory = category === 'semua' || item.category === category;
    if (!matchesCategory) return false;

    if (!query || query.trim() === '') return true;

    const q = query.toLowerCase().trim();
    const matchesName = item.name.toLowerCase().includes(q);
    const matchesDesc = item.description.toLowerCase().includes(q);
    const matchesFlower = item.flowerTypes.some((f) => f.toLowerCase().includes(q));

    return matchesName || matchesDesc || matchesFlower;
  });
}

/**
 * Returns human-readable Indonesian label and styling for order statuses.
 */
export function getOrderStatusBadge(status: OrderStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  step: number;
} {
  switch (status) {
    case 'baru':
      return {
        label: 'Pesanan Baru',
        bgClass: 'bg-amber-50 border border-amber-200',
        textClass: 'text-amber-800',
        step: 1,
      };
    case 'dikonfirmasi':
      return {
        label: 'Dikonfirmasi',
        bgClass: 'bg-blue-50 border border-blue-200',
        textClass: 'text-blue-800',
        step: 2,
      };
    case 'dirangkai':
      return {
        label: 'Sedang Dirangkai',
        bgClass: 'bg-purple-50 border border-purple-200',
        textClass: 'text-purple-800',
        step: 3,
      };
    case 'siap-kirim':
      return {
        label: 'Siap Dikirim',
        bgClass: 'bg-indigo-50 border border-indigo-200',
        textClass: 'text-indigo-800',
        step: 4,
      };
    case 'diantar':
      return {
        label: 'Dalam Pengantaran',
        bgClass: 'bg-sky-50 border border-sky-200',
        textClass: 'text-sky-800',
        step: 5,
      };
    case 'selesai':
      return {
        label: 'Selesai',
        bgClass: 'bg-emerald-50 border border-emerald-200',
        textClass: 'text-emerald-800',
        step: 6,
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        bgClass: 'bg-rose-50 border border-rose-200',
        textClass: 'text-rose-800',
        step: 0,
      };
    default:
      return {
        label: status,
        bgClass: 'bg-stone-50 border border-stone-200',
        textClass: 'text-stone-800',
        step: 0,
      };
  }
}
