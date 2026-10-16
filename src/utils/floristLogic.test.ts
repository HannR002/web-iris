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
  getWIBDateString,
  isPastWIBDate,
  generateOrderId,
  syncCartWithCatalog,
  calculateDashboardMetrics,
  validateImportData,
} from './floristLogic.ts';
import type { CartItem, CheckoutFormData, MerchantConfig, Order, Product } from '../types/florist.ts';

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

test('getWIBDateString and isPastWIBDate handle Asia/Jakarta timezone correctly', () => {
  const wibToday = getWIBDateString();
  assert.match(wibToday, /^\d{4}-\d{2}-\d{2}$/);

  // Past date check
  assert.equal(isPastWIBDate('2020-01-01'), true);
  assert.equal(isPastWIBDate(''), true);
  assert.equal(isPastWIBDate('invalid'), true);

  // Today and future date check
  assert.equal(isPastWIBDate(wibToday), false);
  assert.equal(isPastWIBDate('2099-12-31'), false);
});

test('generateOrderId creates unique, correctly formatted order identifiers', () => {
  const id1 = generateOrderId();
  const id2 = generateOrderId([id1]);

  assert.match(id1, /^NGA-\d{6}-[A-Z0-9]{4}$/);
  assert.match(id2, /^NGA-\d{6}-[A-Z0-9]{4}$/);
  assert.notEqual(id1, id2);
});

test('syncCartWithCatalog detects out-of-stock items and price changes', () => {
  const catalog: Product[] = [
    {
      id: 'p1',
      name: 'Mawar Merah',
      category: 'buket',
      price: 300000, // Price updated from 250000 to 300000
      stockStatus: 'tersedia',
      description: '',
      flowerTypes: [],
      availableColors: [],
      cardIncluded: true,
      estimatedPrepTime: '1 Jam',
      imageType: 'bouquet-rose',
    },
    {
      id: 'p2',
      name: 'Papan Selamat',
      category: 'papan-bunga',
      price: 500000,
      stockStatus: 'habis', // Now out of stock
      description: '',
      flowerTypes: [],
      availableColors: [],
      cardIncluded: false,
      estimatedPrepTime: '2 Jam',
      imageType: 'papan-selamat',
    },
  ];

  const cart: CartItem[] = [
    {
      id: 'c1',
      productId: 'p1',
      product: { ...catalog[0], price: 250000 },
      quantity: 2,
      selectedColor: { id: 'c', name: 'Merah', hex: '#FF0000' },
      cardGreeting: { to: '', message: '', from: '' },
      customNotes: '',
      subtotal: 500000,
    },
    {
      id: 'c2',
      productId: 'p2',
      product: catalog[1],
      quantity: 1,
      selectedColor: { id: 'c', name: 'Emas', hex: '#FFD700' },
      cardGreeting: { to: '', message: '', from: '' },
      customNotes: '',
      subtotal: 500000,
    },
  ];

  const syncResult = syncCartWithCatalog(cart, catalog);
  assert.equal(syncResult.hasUnavailableItems, true);
  assert.ok(syncResult.unavailableProductNames.includes('Papan Selamat'));
  assert.equal(syncResult.priceChangedCount, 1);
  assert.equal(syncResult.updatedCart[0].product.price, 300000);
  assert.equal(syncResult.updatedCart[0].subtotal, 600000);
});

test('calculateDashboardMetrics cleanly separates confirmed revenue from unverified new orders', () => {
  const dummyOrders: Order[] = [
    {
      id: 'NGA-001',
      customerName: 'A',
      customerPhone: '08123456789',
      recipientName: 'B',
      recipientPhone: '08123456789',
      deliveryDistrict: 'Telanaipura',
      deliveryAddress: 'Jl. A',
      deliveryDate: '2026-10-20',
      deliveryTimeSlot: 'Pagi',
      items: [],
      itemsSubtotal: 300000,
      deliveryFee: 15000,
      totalAmount: 315000,
      status: 'baru', // Unverified reservation
      createdAt: '2026-10-16T00:00:00Z',
    },
    {
      id: 'NGA-002',
      customerName: 'C',
      customerPhone: '08123456789',
      recipientName: 'D',
      recipientPhone: '08123456789',
      deliveryDistrict: 'Danau Sipin',
      deliveryAddress: 'Jl. B',
      deliveryDate: '2026-10-20',
      deliveryTimeSlot: 'Siang',
      items: [],
      itemsSubtotal: 500000,
      deliveryFee: 0,
      totalAmount: 500000,
      status: 'dirangkai', // Confirmed / in production
      createdAt: '2026-10-16T00:00:00Z',
    },
    {
      id: 'NGA-003',
      customerName: 'E',
      customerPhone: '08123456789',
      recipientName: 'F',
      recipientPhone: '08123456789',
      deliveryDistrict: 'Kotabaru',
      deliveryAddress: 'Jl. C',
      deliveryDate: '2026-10-20',
      deliveryTimeSlot: 'Sore',
      items: [],
      itemsSubtotal: 200000,
      deliveryFee: 20000,
      totalAmount: 220000,
      status: 'dibatalkan', // Cancelled
      createdAt: '2026-10-16T00:00:00Z',
    },
  ];

  const metrics = calculateDashboardMetrics(dummyOrders);
  assert.equal(metrics.totalOrders, 3);
  assert.equal(metrics.pendingRevenue, 315000); // Only order 1
  assert.equal(metrics.confirmedRevenue, 500000); // Only order 2
  assert.equal(metrics.inProductionCount, 2); // order 1 ('baru') + order 2 ('dirangkai')
});

test('REGRESSION: syncCartWithCatalog detects stock change when price remains identical', () => {
  const initialCatalog: Product[] = [
    {
      id: 'p-1',
      name: 'Mawar Pink Cantik',
      category: 'buket',
      price: 250000,
      stockStatus: 'tersedia',
      description: '',
      flowerTypes: ['Mawar'],
      availableColors: [],
      cardIncluded: true,
      estimatedPrepTime: '2 Jam',
      imageType: 'bouquet-rose',
    },
  ];

  const cart: CartItem[] = [
    {
      id: 'cart-1',
      productId: 'p-1',
      product: { ...initialCatalog[0] },
      quantity: 2,
      selectedColor: { id: 'c', name: 'Pink', hex: '#FFC0CB' },
      cardGreeting: { to: '', message: '', from: '' },
      customNotes: '',
      subtotal: 500000,
    },
  ];

  // Price stays identical (250000), but stockStatus changes to 'habis'
  const updatedCatalog: Product[] = [
    {
      ...initialCatalog[0],
      stockStatus: 'habis',
    },
  ];

  const result = syncCartWithCatalog(cart, updatedCatalog);

  // Price did not change
  assert.equal(result.priceChangedCount, 0);
  // BUT stock change MUST be detected
  assert.equal(result.stockChangedCount, 1);
  assert.equal(result.hasChanges, true);
  assert.equal(result.hasUnavailableItems, true);
  assert.ok(result.unavailableProductNames.includes('Mawar Pink Cantik'));
  assert.equal(result.updatedCart[0].product.stockStatus, 'habis');
});

test('REGRESSION: validateImportData accepts fully valid NGA Florist backup JSON', () => {
  const validPayload = {
    app: 'NGA Florist Jambi',
    exportDate: '2026-10-16T12:00:00.000Z',
    merchantConfig: {
      storeName: 'NGA Florist Jambi',
      whatsappNumber: '6289699161526',
      displayPhone: '0896-9916-1526',
      storeAddress: 'Jl. Kolonel Abunjani No. 42, Sipin, Kota Jambi',
      operatingHours: '07:30 - 21:00 WIB',
      instagramHandle: '@ngaflorist.jambi',
      freeDeliveryMinAmount: 500000,
    },
    products: [
      {
        id: 'p-1',
        name: 'Buket Mawar',
        category: 'buket',
        price: 350000,
        stockStatus: 'tersedia',
        description: 'Mawar segar',
        flowerTypes: ['Mawar'],
        availableColors: [],
        cardIncluded: true,
        estimatedPrepTime: '2 Jam',
        imageType: 'bouquet-rose',
      },
    ],
    orders: [
      {
        id: 'NGA-2410-001',
        customerName: 'Ahmad Fauzi',
        customerPhone: '081234567890',
        recipientName: 'Dewi Lestari',
        recipientPhone: '081234567890',
        deliveryDistrict: 'Telanaipura',
        deliveryAddress: 'Jl. Telanaipura No. 1',
        deliveryDate: '2026-10-25',
        deliveryTimeSlot: 'Pagi',
        items: [
          {
            id: 'item-1',
            productId: 'p-1',
            quantity: 1,
            subtotal: 350000,
          },
        ],
        itemsSubtotal: 350000,
        deliveryFee: 15000,
        totalAmount: 365000,
        status: 'dikonfirmasi',
        createdAt: '2026-10-16T10:00:00Z',
      },
    ],
  };

  const validation = validateImportData(validPayload);
  assert.equal(validation.isValid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.summary.productCount, 1);
  assert.equal(validation.summary.orderCount, 1);
  assert.equal(validation.summary.hasConfig, true);
  assert.ok(validation.sanitizedData?.products);
  assert.ok(validation.sanitizedData?.orders);
  assert.ok(validation.sanitizedData?.config);
});

test('REGRESSION: validateImportData rejects malformed, invalid, or corrupted JSON data', () => {
  // Case 1: Non-object
  assert.equal(validateImportData(null).isValid, false);
  assert.equal(validateImportData('invalid string').isValid, false);
  assert.equal(validateImportData([1, 2, 3]).isValid, false);

  // Case 2: Object with no known florist sections
  const emptyObj = { foo: 'bar', randomKey: 123 };
  const emptyVal = validateImportData(emptyObj);
  assert.equal(emptyVal.isValid, false);
  assert.ok(emptyVal.errors[0].includes('tidak memuat bagian data yang dikenali'));

  // Case 3: Invalid product fields (missing name, negative price, unknown category)
  const invalidProdPayload = {
    products: [
      {
        id: 'p-1',
        name: '', // Empty name
        price: -50000, // Negative price
        category: 'makanan-kucing', // Unknown category
        stockStatus: 'tersedia',
      },
    ],
  };
  const prodVal = validateImportData(invalidProdPayload);
  assert.equal(prodVal.isValid, false);
  assert.ok(prodVal.errors.some((e) => e.includes('name')));
  assert.ok(prodVal.errors.some((e) => e.includes('price')));
  assert.ok(prodVal.errors.some((e) => e.includes('kategori')));

  // Case 4: Invalid order (missing customerName, empty items, invalid status)
  const invalidOrderPayload = {
    orders: [
      {
        id: 'ord-1',
        customerName: '',
        recipientName: 'Penerima',
        deliveryDistrict: 'Danau Sipin',
        totalAmount: 100000,
        status: 'status-ngawur',
        items: [],
      },
    ],
  };
  const ordVal = validateImportData(invalidOrderPayload);
  assert.equal(ordVal.isValid, false);
  assert.ok(ordVal.errors.some((e) => e.includes('customerName')));
  assert.ok(ordVal.errors.some((e) => e.includes('status pesanan')));
  assert.ok(ordVal.errors.some((e) => e.includes('items')));
});

test('REGRESSION: WhatsApp link generation targets the requested merchant number 6289699161526', () => {
  const targetNumber = '089699161526';
  const url = createWhatsAppUrl(targetNumber, 'Halo Florist');
  assert.equal(url, 'https://wa.me/6289699161526?text=Halo%20Florist');
});


