import React, { useState, useEffect } from 'react';
import type { CartItem, FlowerColorVariant, MerchantConfig, Order, OrderStatus, Product, ProductCategory, StockStatus } from './types/florist.ts';
import { INITIAL_MERCHANT_CONFIG, INITIAL_PRODUCTS, INITIAL_SAMPLE_ORDERS } from './data/mockData.ts';
import { filterProducts, syncCartWithCatalog } from './utils/floristLogic.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Search, Sparkles, HelpCircle, ChevronRight, Check } from 'lucide-react';

export default function App() {
  // Always declare all hooks at the top level unconditionally
  // Admin authentication state (simulated for demo, persisted in sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nga_florist_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Check URL query param safely: only allow 'admin' view if already authenticated
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestedView = searchParams.get('view');
    try {
      const isAuth = sessionStorage.getItem('nga_florist_admin_auth') === 'true';
      if (requestedView === 'admin' && isAuth) {
        return 'admin';
      }
    } catch {}
    return 'store';
  });

  // If ?view=admin was requested but user is NOT authenticated, prompt login modal without granting dashboard access
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('view') === 'admin') {
      try {
        const isAuth = sessionStorage.getItem('nga_florist_admin_auth') === 'true';
        return !isAuth;
      } catch {
        return true;
      }
    }
    return false;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nga_florist_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('nga_florist_orders');
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_ORDERS;
    } catch {
      return INITIAL_SAMPLE_ORDERS;
    }
  });

  const [merchantConfig, setMerchantConfig] = useState<MerchantConfig>(() => {
    try {
      const saved = localStorage.getItem('nga_florist_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Otomatis sinkronkan jika masih menggunakan nomor lama +62 812-7418-9000
        if (parsed.whatsappNumber === '6281274189000' || parsed.displayPhone === '0812-7418-9000') {
          parsed.whatsappNumber = INITIAL_MERCHANT_CONFIG.whatsappNumber;
          parsed.displayPhone = INITIAL_MERCHANT_CONFIG.displayPhone;
        }
        return parsed;
      }
      return INITIAL_MERCHANT_CONFIG;
    } catch {
      return INITIAL_MERCHANT_CONFIG;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nga_florist_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'semua'>('semua');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nga_florist_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('nga_florist_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('nga_florist_config', JSON.stringify(merchantConfig));
    } catch {}
  }, [merchantConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('nga_florist_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Synchronize cart with current catalog prices and availability (including stock status changes)
  useEffect(() => {
    if (cart.length > 0 && products.length > 0) {
      const { updatedCart, hasChanges } = syncCartWithCatalog(cart, products);
      if (hasChanges) {
        setCart(updatedCart);
      }
    }
  }, [products]);

  // View navigation handler with admin login gate
  const handleViewChange = (targetView: 'store' | 'admin') => {
    if (targetView === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentView('admin');
      } else {
        setIsAdminLoginOpen(true);
      }
    } else {
      setCurrentView('store');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('nga_florist_admin_auth', 'true');
    } catch {}
    setIsAdminLoginOpen(false);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('nga_florist_admin_auth');
    } catch {}
    setCurrentView('store');
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedColor: FlowerColorVariant,
    cardGreeting: { to: string; message: string; from: string },
    customNotes: string
  ) => {
    if (product.stockStatus === 'habis') return;

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      product,
      quantity,
      selectedColor,
      cardGreeting,
      customNotes,
      subtotal: product.price * quantity,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            subtotal: item.product.price * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Order submission
  const handleSubmitOrder = (newOrder: Order) => {
    // Add to orders list
    setOrders((prev) => [newOrder, ...prev]);
    // Clear cart
    setCart([]);
    setIsCheckoutOpen(false);
    // Show confirmation modal
    setConfirmedOrder(newOrder);
  };

  const handleMarkWaDispatched = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, waDispatched: true } : o))
    );
  };

  // Admin operations
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleUpdateProductStock = (productId: string, newStock: StockStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockStatus: newStock } : p))
    );
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleImportData = (importedData: {
    products?: Product[];
    orders?: Order[];
    config?: MerchantConfig;
  }) => {
    if (importedData.products) setProducts(importedData.products);
    if (importedData.orders) setOrders(importedData.orders);
    if (importedData.config) setMerchantConfig(importedData.config);
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_SAMPLE_ORDERS);
    setMerchantConfig(INITIAL_MERCHANT_CONFIG);
    setCart([]);
    localStorage.removeItem('nga_florist_products');
    localStorage.removeItem('nga_florist_orders');
    localStorage.removeItem('nga_florist_config');
    localStorage.removeItem('nga_florist_cart');
  };

  const filteredProductsList = filterProducts(products, catalogSearch, selectedCategory);

  const scrollToCatalog = () => {
    const el = document.getElementById('katalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#8B2635] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'store') setCurrentView('store');
          scrollToCatalog();
        }}
        activeCategory={selectedCategory}
      />

      {/* Main Content Router with strict Auth Guard */}
      {currentView === 'admin' && isAdminAuthenticated ? (
        <AdminDashboard
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          products={products}
          onUpdateProductStock={handleUpdateProductStock}
          onUpdateProductPrice={handleUpdateProductPrice}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          merchantConfig={merchantConfig}
          onUpdateMerchantConfig={setMerchantConfig}
          onResetDemoData={handleResetDemoData}
          onBackToStore={() => setCurrentView('store')}
          onLogoutAdmin={handleAdminLogout}
          onImportData={handleImportData}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection
            merchantConfig={merchantConfig}
            onExploreClick={scrollToCatalog}
          />

          {/* Product Catalog Section */}
          <section id="katalog-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Catalog Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B2635] block mb-1">
                  Katalog Bunga Segar & Acara Jambi
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Pilihan Rangkaian Bunga Terbaik
                </h2>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Cari mawar, papan bunga, wisuda..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] bg-white"
                />
                {catalogSearch && (
                  <button
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Filter Tabs / Segmented Controls */}
            <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
              {(
                [
                  { id: 'semua', label: 'Semua Koleksi' },
                  { id: 'buket', label: 'Hand Bouquet' },
                  { id: 'papan-bunga', label: 'Papan Bunga Jambi' },
                  { id: 'wisuda', label: 'Buket Wisuda' },
                  { id: 'pernikahan', label: 'Bunga Pernikahan' },
                  { id: 'hampers', label: 'Parcel & Hampers' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#8B2635] text-white shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product Grid: 4-column desktop */}
            {filteredProductsList.length === 0 ? (
              <div className="py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 p-8 my-6">
                <p className="font-serif text-lg font-semibold text-stone-800">
                  Tidak ditemukan rangkaian bunga yang sesuai
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Silakan coba kata kunci lain atau pilih kategori "Semua Koleksi" untuk melihat seluruh pilihan.
                </p>
                <button
                  onClick={() => {
                    setCatalogSearch('');
                    setSelectedCategory('semua');
                  }}
                  className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Tampilkan Semua Bunga
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {filteredProductsList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProductForDetail(p)}
                  />
                ))}
              </div>
            )}

          </section>

          {/* Craftsmanship & Jambi Florist Story */}
          <section className="py-12 bg-white border-y border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B2635]">
                    Sentuhan Tangan Perangkai Profesional
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                    Bunga Segar Berkualitas, Dirangkai Penuh Ketulusan di Sipin, Kota Jambi
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Setiap kelopak bunga yang kami gunakan disortir secara cermat setiap pagi. Mulai dari mawar semi-Holland, anggrek dendrobium, casablanca lili wangi, hingga suyok cerah untuk papan ucapan tradisi Jambi. Kami memastikan setiap rangkaian memiliki daya tahan segar maksimal dan visual estetis yang memukau.
                  </p>
                  
                  <div className="space-y-2 pt-2 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B2635]" />
                      <span>Gratis cetak kartu ucapan eksklusif pada setiap pesanan buket</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B2635]" />
                      <span>Bisa request kirim foto bunga sebelum kurir berangkat ke lokasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#8B2635]" />
                      <span>Kurir terlatih membawa rangkaian bunga dengan aman dan rapi</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Panduan Alur Pemesanan di NGA Florist Jambi
                  </h4>

                  <ol className="space-y-3 text-xs text-stone-600">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </span>
                      <div>
                        <strong className="text-stone-900">Pilih Rangkaian Bunga & Warna:</strong>
                        <p className="mt-0.5">Pilih buket favorit, warna bunga, dan isi ucapan kartu personal Anda.</p>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </span>
                      <div>
                        <strong className="text-stone-900">Isi Alamat & Jadwal Kirim di Jambi:</strong>
                        <p className="mt-0.5">Pilih kecamatan (Telanaipura, Danau Sipin, Pasar, dll.) dan slot jam pengantaran.</p>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        3
                      </span>
                      <div>
                        <strong className="text-stone-900">Kirim Rincian Otomatis via WhatsApp:</strong>
                        <p className="mt-0.5">Sistem menghasilkan teks pesanan rapi yang langsung terhubung ke admin florist kami untuk konfirmasi ketersediaan & petunjuk pembayaran.</p>
                      </div>
                    </li>
                  </ol>
                </div>

              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center pb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B2635] block mb-1">
                Informasi Pelanggan
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Berapa lama proses pembuatan dan pengantaran bunga di Kota Jambi?
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Untuk hand bouquet mawar segar memerlukan waktu pengerjaan 1-2 jam. Papan bunga ucapan membutuhkan waktu 3-5 jam. Pengantaran ke seluruh area Kota Jambi biasanya memakan waktu 30-60 menit tergantung jarak lokasi.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Apakah bisa mengirimkan bunga secara anonim / rahasia (surprise)?
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Bisa! Centang opsi "Hadiah Rahasia / Kejutan" pada formulir pengantaran. Kurir kami tidak akan menyebutkan nama pemesan saat menyerahkan bunga kepada penerima.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Bagaimana saya tahu bentuk bunga sebelum diantar ke lokasi?
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Tim perangkai NGA Florist selalu mengirimkan foto hasil rangkaian bunga dan foto kartu ucapan kepada pemesan melalui WhatsApp sebelum kurir berangkat.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <Footer
        merchantConfig={merchantConfig}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'store') setCurrentView('store');
          scrollToCatalog();
        }}
        onOpenAdmin={() => handleViewChange('admin')}
      />

      {/* Admin Login Gate Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onLoginSuccess={handleAdminLoginSuccess}
        onCancel={() => setIsAdminLoginOpen(false)}
        merchantConfig={merchantConfig}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        merchantConfig={merchantConfig}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        merchantConfig={merchantConfig}
        onSubmitOrder={handleSubmitOrder}
        existingOrderIds={orders.map((o) => o.id)}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        merchantConfig={merchantConfig}
        onClose={() => setConfirmedOrder(null)}
        onMarkWaDispatched={handleMarkWaDispatched}
        onViewInAdmin={() => {
          setConfirmedOrder(null);
          handleViewChange('admin');
        }}
      />

    </div>
  );
}
