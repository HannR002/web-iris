import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIDR,
  calculateOrderTotal,
  validateCheckoutForm,
  generateWhatsAppOrderMessage,
  createWhatsAppUrl,
  filterProducts,
  getOrderStatusBadge,
} from './floristLogic.ts';
import type { CheckoutFormData, MerchantConfig, Order, Product } from '../types/florist.ts';

test('formatIDR formats currency numbers correctly into Indonesian format', () => {
  assert.equal(formatIDR(0), 'Rp 0');
  assert.equal(formatIDR(50000), 'Rp 50.000');
  assert.equal(formatIDR(375000), 'Rp 375.000');
  assert.equal(formatIDR(1250000), 'Rp 1.250.000');
});

test('calculateOrderTotal applies delivery fee and free shipping correctly', () => {
  // Below threshold
  const items = [{ subtotal: 250000 }, { subtotal: 100000 }];
  const result1 = calculateOrderTotal(items, 20000, 500000);
  assert.equal(result1.itemsSubtotal, 350000);
  assert.equal(result1.effectiveDeliveryFee, 20000);
  assert.equal(result1.totalAmount, 370000);
  assert.equal(result1.isFreeDelivery, false);

  // Above threshold
  const itemsHigh = [{ subtotal: 350000 }, { subtotal: 200000 }];
  const result2 = calculateOrderTotal(itemsHigh, 25000, 500000);
  assert.equal(result2.itemsSubtotal, 550000);
  assert.equal(result2.effectiveDeliveryFee, 0);
  assert.equal(result2.totalAmount, 550000);
  assert.equal(result2.isFreeDelivery, true);
});

test('validateCheckoutForm detects missing or invalid fields', () => {
  const invalidForm: CheckoutFormData = {
    customerName: '',
    customerPhone: '123',
    recipientName: '',
    recipientPhone: 'abc',
    deliveryDistrict: '',
    deliveryAddress: 'Jl.',
    addressLandmark: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
    deliveryNotes: '',
    isAnonymousGift: false,
  };

  const validation = validateCheckoutForm(invalidForm);
  assert.equal(validation.isValid, false);
  assert.ok(validation.errors.customerName);
  assert.ok(validation.errors.customerPhone);
  assert.ok(validation.errors.recipientName);
  assert.ok(validation.errors.recipientPhone);
  assert.ok(validation.errors.deliveryDistrict);
  assert.ok(validation.errors.deliveryAddress);
  assert.ok(validation.errors.deliveryDate);
  assert.ok(validation.errors.deliveryTimeSlot);
});

test('validateCheckoutForm accepts valid Indonesian customer details', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const validForm: CheckoutFormData = {
    customerName: 'Siti Rahmawati',
    customerPhone: '081274123456',
    customerEmail: 'siti@example.com',
    recipientName: 'Dr. Hendra Gunawan',
    recipientPhone: '081398765432',
    deliveryDistrict: 'Telanaipura',
    deliveryAddress: 'Jl. Arif Rahman Hakim No. 12, RT 04, Telanaipura',
    addressLandmark: 'Dekat RSUD Raden Mattaher Jambi',
    deliveryDate: dateStr,
    deliveryTimeSlot: '09:00 - 12:00 WIB',
    deliveryNotes: 'Tolong jangan bunyikan klakson karena ada pasien istirahat',
    isAnonymousGift: false,
  };

  const validation = validateCheckoutForm(validForm);
  assert.equal(validation.isValid, true);
  assert.deepEqual(validation.errors, {});
});

test('createWhatsAppUrl creates a sanitized wa.me link with encoded text', () => {
  const url1 = createWhatsAppUrl('081274189000', 'Halo Florist');
  assert.equal(url1, 'https://wa.me/6281274189000?text=Halo%20Florist');

  const url2 = createWhatsAppUrl('+62 812-7418-9000', 'Pesanan Bunga');
  assert.equal(url2, 'https://wa.me/6281274189000?text=Pesanan%20Bunga');
});

test('generateWhatsAppOrderMessage includes essential order details and disclaimers', () => {
  const sampleOrder: Order = {
    id: 'NGA-2410-099',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    recipientName: 'Alya Putri',
    recipientPhone: '081987654321',
    deliveryDistrict: 'Danau Sipin',
    deliveryAddress: 'Jl. Slamet Riyadi No. 5',
    addressLandmark: 'Samping Masjid Al-Falah',
    deliveryDate: '2026-10-25',
    deliveryTimeSlot: '13:00 - 16:00 WIB',
    items: [
      {
        id: 'cart-1',
        productId: 'p-1',
        product: {
          id: 'p-1',
          name: 'Buket Mawar Pastel Grandeur',
          category: 'buket',
          price: 350000,
          stockStatus: 'tersedia',
          description: '',
          flowerTypes: ['Mawar Merah', 'Baby Breath'],
          availableColors: [],
          cardIncluded: true,
          estimatedPrepTime: '2 Jam',
          imageType: 'bouquet-rose',
        },
        quantity: 1,
        selectedColor: { id: 'c1', name: 'Pastel Peach', hex: '#FFDAB9' },
        cardGreeting: { to: 'Alya', message: 'Selamat ulang tahun sayang!', from: 'Budi' },
        customNotes: 'Warna pita tolong putih gading ya kak',
        subtotal: 350000,
      },
    ],
    itemsSubtotal: 350000,
    deliveryFee: 15000,
    totalAmount: 365000,
    status: 'baru',
    createdAt: new Date().toISOString(),
  };

  const merchantConfig: MerchantConfig = {
    storeName: 'NGA Florist Jambi',
    whatsappNumber: '6281274189000',
    displayPhone: '0812-7418-9000',
    storeAddress: 'Jl. Kolonel Abunjani No. 42, Sipin, Kota Jambi',
    operatingHours: '07:30 - 21:00 WIB',
    instagramHandle: '@ngaflorist.jambi',
    freeDeliveryMinAmount: 500000,
  };

  const message = generateWhatsAppOrderMessage(sampleOrder, merchantConfig);
  assert.ok(message.includes('NGA Florist Jambi'));
  assert.ok(message.includes('NGA-2410-099'));
  assert.ok(message.includes('Budi Santoso'));
  assert.ok(message.includes('Alya Putri'));
  assert.ok(message.includes('Buket Mawar Pastel Grandeur'));
  assert.ok(message.includes('Pastel Peach'));
  assert.ok(message.includes('Selamat ulang tahun sayang!'));
  assert.ok(message.includes('Rp 365.000'));
  assert.ok(message.includes('Danau Sipin'));
});

test('filterProducts filters by search query and category', () => {
  const dummyProducts: Product[] = [
    {
      id: '1',
      name: 'Buket Mawar Merah',
      category: 'buket',
      price: 250000,
      stockStatus: 'tersedia',
      description: 'Mawar segar',
      flowerTypes: ['Mawar'],
      availableColors: [],
      cardIncluded: true,
      estimatedPrepTime: '2 Jam',
      imageType: 'bouquet-rose',
    },
    {
      id: '2',
      name: 'Papan Bunga Selamat',
      category: 'papan-bunga',
      price: 600000,
      stockStatus: 'tersedia',
      description: 'Ukuran 2x1.5m',
      flowerTypes: ['Suyok', 'Gerbera'],
      availableColors: [],
      cardIncluded: false,
      estimatedPrepTime: '4 Jam',
      imageType: 'papan-selamat',
    },
    {
      id: '3',
      name: 'Buket Wisuda Teddy',
      category: 'wisuda',
      price: 180000,
      stockStatus: 'tersedia',
      description: 'Boneka wisuda',
      flowerTypes: ['Mawar Artifisial'],
      availableColors: [],
      cardIncluded: true,
      estimatedPrepTime: '1 Jam',
      imageType: 'wisuda-teddy',
    },
  ];

  // Category filter
  const bouquetsOnly = filterProducts(dummyProducts, '', 'buket');
  assert.equal(bouquetsOnly.length, 1);
  assert.equal(bouquetsOnly[0].id, '1');

  // Search filter
  const searchTeddy = filterProducts(dummyProducts, 'teddy', 'semua');
  assert.equal(searchTeddy.length, 1);
  assert.equal(searchTeddy[0].id, '3');

  // Both filter
  const combined = filterProducts(dummyProducts, 'mawar', 'buket');
  assert.equal(combined.length, 1);
});

test('getOrderStatusBadge returns valid labels and steps', () => {
  const newBadge = getOrderStatusBadge('baru');
  assert.equal(newBadge.label, 'Pesanan Baru');
  assert.equal(newBadge.step, 1);

  const doneBadge = getOrderStatusBadge('selesai');
  assert.equal(doneBadge.label, 'Selesai');
  assert.equal(doneBadge.step, 6);
});
