import React, { useState, useRef } from 'react';
import type { MerchantConfig, Order, OrderStatus, Product, ProductCategory, StockStatus } from '../types/florist.ts';
import { calculateDashboardMetrics, createWhatsAppUrl, formatIDR, formatIndonesianDate, getOrderStatusBadge } from '../utils/floristLogic.ts';
import { FloralIllustration } from './FloralIllustration.tsx';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  Plus,
  Edit2,
  Printer,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  Package,
  Settings,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  X,
  MessageCircle,
  Trash2,
  Download,
  Upload,
  LogOut,
  ImageIcon,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const FLORIST_IMAGE_PRESETS = [
  { label: 'Buket Mawar Pastel Grandeur', url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', type: 'bouquet-rose' as const },
  { label: 'Papan Bunga Selamat Jambi', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', type: 'papan-selamat' as const },
  { label: 'Buket Wisuda Teddy & Sunflowers', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', type: 'wisuda-teddy' as const },
  { label: 'Papan Duka Cita Syahdu', url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80', type: 'papan-duka' as const },
  { label: 'Bridal Bouquet White Luxury', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', type: 'wedding-bridal' as const },
  { label: 'Buket Mawar Merah 20 Tangkai', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', type: 'bouquet-rose' as const },
  { label: 'Deluxe Flower & Fruit Hamper', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', type: 'hamper-fruit' as const },
  { label: 'Lily Putih Casablanca Elegance', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80', type: 'bouquet-lily' as const },
  { label: 'Buket Tulip Musim Semi Segar', url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80', type: 'bouquet-rose' as const },
];

type AdminDashboardProps = {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: StockStatus) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  merchantConfig: MerchantConfig;
  onUpdateMerchantConfig: (config: MerchantConfig) => void;
  onResetDemoData: () => void;
  onBackToStore: () => void;
  onLogoutAdmin: () => void;
  onImportData?: (importedData: { products?: Product[]; orders?: Order[]; config?: MerchantConfig }) => void;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  products,
  onUpdateProductStock,
  onUpdateProductPrice,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  merchantConfig,
  onUpdateMerchantConfig,
  onResetDemoData,
  onBackToStore,
  onLogoutAdmin,
  onImportData,
}) => {
  // Always invoke hooks unconditionally
  const [activeTab, setActiveTab] = useState<'pesanan' | 'produk' | 'pengaturan'>('pesanan');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  // Product Modals State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // New product form fields
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('buket');
  const [newProductPrice, setNewProductPrice] = useState(300000);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductFlowerTypes, setNewProductFlowerTypes] = useState('Mawar Semi Holland, Daun Ruskus, Baby Breath');
  const [newProductPrepTime, setNewProductPrepTime] = useState('2 - 3 Jam');
  const [newProductDimensions, setNewProductDimensions] = useState('Tinggi ~45 cm');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductImageType, setNewProductImageType] = useState<Product['imageType']>('bouquet-rose');

  // Edit product form fields
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ProductCategory>('buket');
  const [editPrice, setEditPrice] = useState(0);
  const [editStockStatus, setEditStockStatus] = useState<StockStatus>('tersedia');
  const [editDesc, setEditDesc] = useState('');
  const [editFlowerTypes, setEditFlowerTypes] = useState('');
  const [editPrepTime, setEditPrepTime] = useState('');
  const [editDimensions, setEditDimensions] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageType, setEditImageType] = useState<Product['imageType']>('bouquet-rose');

  // File upload refs
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  // Config form state
  const [configStoreName, setConfigStoreName] = useState(merchantConfig.storeName);
  const [configWaNumber, setConfigWaNumber] = useState(merchantConfig.whatsappNumber);
  const [configDisplayPhone, setConfigDisplayPhone] = useState(merchantConfig.displayPhone);
  const [configAddress, setConfigAddress] = useState(merchantConfig.storeAddress);
  const [configFreeDelivery, setConfigFreeDelivery] = useState(merchantConfig.freeDeliveryMinAmount);
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [importStatusToast, setImportStatusToast] = useState<string | null>(null);

  // Calculate detailed financial KPIs separating confirmed revenue from unverified new orders
  const metrics = calculateDashboardMetrics(orders);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'semua' || o.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.recipientName.toLowerCase().includes(q) ||
      o.deliveryDistrict.toLowerCase().includes(q)
    );
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMerchantConfig({
      ...merchantConfig,
      storeName: configStoreName,
      whatsappNumber: configWaNumber.replace(/\D/g, ''),
      displayPhone: configDisplayPhone,
      storeAddress: configAddress,
      freeDeliveryMinAmount: Number(configFreeDelivery) || 0,
    });
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const flowerArr = newProductFlowerTypes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProd: Product = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price: Number(newProductPrice) || 250000,
      stockStatus: 'tersedia',
      description: newProductDesc.trim() || 'Rangkaian bunga segar spesial dari NGA Florist Jambi.',
      flowerTypes: flowerArr.length > 0 ? flowerArr : ['Mawar Segar', 'Baby Breath'],
      availableColors: [
        { id: 'c-1', name: 'Merah Segar', hex: '#8B0000' },
        { id: 'c-2', name: 'Putih Murni', hex: '#FFFFFF' },
        { id: 'c-3', name: 'Pastel Peach', hex: '#FFCBA4' },
      ],
      cardIncluded: true,
      estimatedPrepTime: newProductPrepTime || '2 Jam',
      dimensions: newProductDimensions || undefined,
      imageType: newProductImageType,
      imageUrl: newProductImageUrl.trim() || undefined,
      isPopular: false,
    };

    onAddProduct(newProd);
    setShowAddProductModal(false);
    // Reset form
    setNewProductName('');
    setNewProductDesc('');
    setNewProductImageUrl('');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category);
    setEditPrice(prod.price);
    setEditStockStatus(prod.stockStatus);
    setEditDesc(prod.description);
    setEditFlowerTypes(prod.flowerTypes.join(', '));
    setEditPrepTime(prod.estimatedPrepTime);
    setEditDimensions(prod.dimensions || '');
    setEditImageUrl(prod.imageUrl || '');
    setEditImageType(prod.imageType);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const flowerArr = editFlowerTypes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: Product = {
      ...editingProduct,
      name: editName.trim(),
      category: editCategory,
      price: Number(editPrice) || editingProduct.price,
      stockStatus: editStockStatus,
      description: editDesc.trim(),
      flowerTypes: flowerArr.length > 0 ? flowerArr : editingProduct.flowerTypes,
      estimatedPrepTime: editPrepTime.trim() || editingProduct.estimatedPrepTime,
      dimensions: editDimensions.trim() || undefined,
      imageUrl: editImageUrl.trim() || undefined,
      imageType: editImageType,
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 3MB max for client-side storage
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file foto terlalu besar (maksimal 3MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'add') {
        setNewProductImageUrl(result);
      } else {
        setEditImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = () => {
    const exportPayload = {
      app: 'NGA Florist Jambi',
      exportDate: new Date().toISOString(),
      merchantConfig,
      products,
      orders,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nga_florist_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (onImportData) {
          onImportData({
            products: parsed.products,
            orders: parsed.orders,
            config: parsed.merchantConfig || parsed.config,
          });
          setImportStatusToast('Data demo berhasil diimpor!');
        } else {
          setImportStatusToast('Fungsi impor data aktif.');
        }
        setTimeout(() => setImportStatusToast(null), 3000);
      } catch {
        alert('File JSON tidak valid atau struktur data tidak sesuai.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      
      {/* Explicit Demo Mode & Auth Banner */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2.5 text-xs border-b border-stone-800 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Mode Demo Pengelola
            </span>
            <span className="text-stone-300">
              Dashboard operasional florist Kota Jambi (Data disimpan di browser lokal).
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-[11px] hidden md:inline">
              Akun: <strong>Manager Florist</strong>
            </span>
            <button
              onClick={onLogoutAdmin}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
            <span className="text-stone-600">|</span>
            <button
              onClick={onBackToStore}
              className="text-stone-300 hover:text-white underline text-[11px] font-medium"
            >
              ← Kembali ke Toko Pelanggan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Admin Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200 no-print">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Panel Pengelola {merchantConfig.storeName}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Manajemen pesanan bunga harian, antrean produksi perangkai, ketersediaan stok, dan surat jalan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onResetDemoData}
              className="px-3 py-2 text-xs font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Kembalikan data pesanan dan produk ke setelan awal demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>

            <button
              onClick={onBackToStore}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#8B2635] hover:bg-[#721F2B] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buka Toko Pelanggan</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Strip (Accounting Discipline) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 no-print">
          
          {/* Card 1: Omzet Terkonfirmasi (Lunas/Valid) */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider text-[10px]">
                Omzet Terkonfirmasi
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                {formatIDR(metrics.confirmedRevenue)}
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                Dari pesanan status Dikonfirmasi s/d Selesai
              </p>
            </div>
          </div>

          {/* Card 2: Estimasi Reservasi Baru (Unconfirmed) */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider text-[10px]">
                Reservasi Baru (Menunggu WA)
              </span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-amber-600 tabular-nums">
                {formatIDR(metrics.pendingRevenue)}
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                Belum dihitung omzet riil hingga dikonfirmasi
              </p>
            </div>
          </div>

          {/* Card 3: Perlu Diproses / Dirangkai */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-800 font-semibold uppercase tracking-wider text-[10px]">
                Antrean Perangkai
              </span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-purple-700 tabular-nums">
                {metrics.inProductionCount}
              </span>
              <span className="text-[11px] text-stone-400">Order</span>
            </div>
          </div>

          {/* Card 4: Siap / Sedang Dikirim */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-800 font-semibold uppercase tracking-wider text-[10px]">
                Kurir / Pengantaran
              </span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-sky-700 tabular-nums">
                {metrics.outForDeliveryCount}
              </span>
              <span className="text-[11px] text-stone-400">Order</span>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center border-b border-stone-200 space-x-6 text-sm font-medium no-print">
          <button
            onClick={() => setActiveTab('pesanan')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'pesanan'
                ? 'border-[#8B2635] text-[#8B2635] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Daftar Pesanan ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('produk')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'produk'
                ? 'border-[#8B2635] text-[#8B2635] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manajemen Produk & Stok ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'pengaturan'
                ? 'border-[#8B2635] text-[#8B2635] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan & Cadangan Data</span>
          </button>
        </div>

        {/* TAB 1: ORDER MANAGEMENT */}
        {activeTab === 'pesanan' && (
          <div className="mt-6 space-y-4 no-print">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID pesanan, nama pemesan, penerima, atau kecamatan..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635] bg-stone-50/50"
                />
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(
                  [
                    { id: 'semua', label: 'Semua' },
                    { id: 'baru', label: 'Baru' },
                    { id: 'dikonfirmasi', label: 'Dikonfirmasi' },
                    { id: 'dirangkai', label: 'Dirangkai' },
                    { id: 'siap-kirim', label: 'Siap Kirim' },
                    { id: 'diantar', label: 'Diantar' },
                    { id: 'selesai', label: 'Selesai' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      statusFilter === s.id
                        ? 'bg-[#8B2635] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">No. Pesanan</th>
                      <th className="py-3 px-4">Pemesan & WA Status</th>
                      <th className="py-3 px-4">Penerima & Lokasi</th>
                      <th className="py-3 px-4">Jadwal Kirim</th>
                      <th className="py-3 px-4">Total (IDR)</th>
                      <th className="py-3 px-4">Status Pesanan</th>
                      <th className="py-3 px-4 text-right">Aksi Operasional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400">
                          Tidak ada pesanan yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const badge = getOrderStatusBadge(order.status);
                        const chatUrl = createWhatsAppUrl(
                          order.customerPhone,
                          `Halo Kak ${order.customerName}, kami dari Florist ${merchantConfig.storeName} terkait pesanan #${order.id}. Kami siap memproses pesanan bunga Kakak.`
                        );

                        return (
                          <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                            
                            {/* Order ID */}
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                              #{order.id}
                              {order.isAnonymousGift && (
                                <span className="block text-[10px] text-purple-700 font-sans font-normal">
                                  🎁 Kejutan Anonim
                                </span>
                              )}
                            </td>

                            {/* Customer & WA Status */}
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-stone-900">{order.customerName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-stone-500 font-mono">{order.customerPhone}</span>
                                {order.waDispatched ? (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                    WA Terkirim ✓
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                                    Menunggu WA
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Recipient */}
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-stone-800">{order.recipientName}</p>
                              <p className="text-[11px] text-stone-500 truncate max-w-xs">
                                Kec. {order.deliveryDistrict}
                              </p>
                            </td>

                            {/* Schedule */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <p className="font-medium text-stone-800">{order.deliveryDate}</p>
                              <p className="text-[11px] text-stone-500">{order.deliveryTimeSlot.split(' ')[0]}</p>
                            </td>

                            {/* Total */}
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap tabular-nums">
                              {formatIDR(order.totalAmount)}
                            </td>

                            {/* Status dropdown */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className={`text-xs px-2.5 py-1 rounded-md font-medium border cursor-pointer focus:outline-none ${badge.bgClass} ${badge.textClass}`}
                              >
                                <option value="baru">Pesanan Baru</option>
                                <option value="dikonfirmasi">Dikonfirmasi (DP/Lunas)</option>
                                <option value="dirangkai">Sedang Dirangkai</option>
                                <option value="siap-kirim">Siap Dikirim</option>
                                <option value="diantar">Dalam Pengantaran</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibatalkan">Dibatalkan</option>
                              </select>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                              <a
                                href={chatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1"
                                title="Buka obrolan WhatsApp dengan pemesan"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Chat</span>
                              </a>

                              <button
                                onClick={() => {
                                  setSelectedOrderForDetail(order);
                                  setShowPrintSlip(false);
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                              >
                                Detail
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedOrderForDetail(order);
                                  setShowPrintSlip(true);
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-[#8B2635] bg-[#8B2635]/10 hover:bg-[#8B2635]/20 rounded-md transition-colors"
                                title="Cetak Slip Lembar Kerja & Surat Jalan"
                              >
                                <Printer className="w-3.5 h-3.5 inline mr-1" />
                                Slip
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'produk' && (
          <div className="mt-6 space-y-4 no-print">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Daftar Katalog Bunga & Manajemen Stok
                </h3>
                <p className="text-xs text-stone-500">
                  Ubah status stok, kelola foto produk, sesuaikan harga, atau tambahkan produk baru.
                </p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-[#8B2635] hover:bg-[#721F2B] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs p-4 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <div className="w-22 h-22 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 relative">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FloralIllustration type={prod.imageType} className="w-full h-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                          {prod.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
                            title="Edit rincian produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Hapus atau arsipkan produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-stone-900 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {prod.flowerTypes.join(', ')}
                      </p>

                      {/* Stock Selector */}
                      <div className="mt-2">
                        <label className="text-[10px] text-stone-400 block mb-0.5 font-medium">Status Stok:</label>
                        <select
                          value={prod.stockStatus}
                          onChange={(e) => onUpdateProductStock(prod.id, e.target.value as StockStatus)}
                          className={`w-full text-xs px-2 py-1 border rounded focus:outline-none ${
                            prod.stockStatus === 'habis'
                              ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                              : 'bg-stone-50 border-stone-300'
                          }`}
                        >
                          <option value="tersedia">Tersedia (Bunga Segar Siap)</option>
                          <option value="preorder">Pre-Order (1 Hari)</option>
                          <option value="menipis">Stok Menipis</option>
                          <option value="habis">Habis Hari Ini</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Price Area */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Harga</span>
                      <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                        {formatIDR(prod.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="text-xs font-semibold text-[#8B2635] hover:underline"
                      >
                        Edit Lengkap →
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MERCHANT & WHATSAPP CONFIG & BACKUP */}
        {activeTab === 'pengaturan' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
            
            {/* Merchant config form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Pengaturan Profil Bisnis & Nomor WhatsApp
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Semua format pesan WhatsApp yang dihasilkan dari keranjang pelanggan akan otomatis diarahkan ke nomor ini.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Toko Florist
                  </label>
                  <input
                    type="text"
                    value={configStoreName}
                    onChange={(e) => setConfigStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nomor WhatsApp Toko (Awali 62)
                    </label>
                    <input
                      type="text"
                      value={configWaNumber}
                      onChange={(e) => setConfigWaNumber(e.target.value)}
                      placeholder="6281274189000"
                      className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Format: 628xxxxxxxxxx (Tanpa tanda + atau strip)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Format Tampilan Telepon
                    </label>
                    <input
                      type="text"
                      value={configDisplayPhone}
                      onChange={(e) => setConfigDisplayPhone(e.target.value)}
                      placeholder="0812-7418-9000"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Workshop / Toko Fisik di Jambi
                  </label>
                  <input
                    type="text"
                    value={configAddress}
                    onChange={(e) => setConfigAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Ambang Batas Gratis Ongkir Wilayah Jambi (IDR)
                  </label>
                  <input
                    type="number"
                    value={configFreeDelivery}
                    onChange={(e) => setConfigFreeDelivery(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Default: Rp 500.000</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#8B2635] hover:bg-[#721F2B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Simpan Perubahan Profil
                  </button>

                  {configSavedToast && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Pengaturan berhasil disimpan!
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Data Backup & Migration Center (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Backup Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#8B2635]" />
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Cadangkan & Pulihkan Data Demo
                  </h4>
                </div>
                
                <p className="text-xs text-stone-600 leading-relaxed">
                  Ekspor seluruh katalog produk dan riwayat pesanan yang telah Anda ubah ke file JSON, atau pulihkan data sebelumnya.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Data ke File JSON</span>
                  </button>

                  <div>
                    <input
                      type="file"
                      ref={importFileRef}
                      onChange={handleImportFileChange}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => importFileRef.current?.click()}
                      className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Impor Data dari File JSON</span>
                    </button>
                  </div>

                  {importStatusToast && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium text-center">
                      {importStatusToast}
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Disclaimer Card */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Keterbatasan Prototype Demo</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Data yang Anda tambahkan disimpan dalam memori lokal browser perangkat ini. Untuk rilis multi-cabang UMKM terpusat, integrasikan dengan Cloud Firestore atau PostgreSQL (Cloud SQL) yang sudah disiapkan di arsitektur proyek.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Modal: Tambah Produk Baru */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Tambah Rangkaian Bunga Baru
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Produk Bunga</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Contoh: Buket Bunga Matahari & Aster"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setNewProductCategory(cat);
                      if (cat === 'papan-bunga') setNewProductImageType('papan-selamat');
                      else if (cat === 'wisuda') setNewProductImageType('wisuda-teddy');
                      else if (cat === 'pernikahan') setNewProductImageType('wedding-bridal');
                      else if (cat === 'hampers') setNewProductImageType('hamper-fruit');
                      else setNewProductImageType('bouquet-rose');
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="buket">Hand Bouquet</option>
                    <option value="papan-bunga">Papan Bunga Jambi</option>
                    <option value="wisuda">Buket Wisuda</option>
                    <option value="pernikahan">Bunga Pernikahan</option>
                    <option value="hampers">Hampers & Parcel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Photo Selector with Presets or Upload */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="block font-semibold text-stone-800">Foto Produk Florist</label>
                <span className="text-[11px] text-stone-500 block">Pilih dari preset foto studio berkualitas tinggi di bawah, atau unggah foto sendiri:</span>
                
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                  {FLORIST_IMAGE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewProductImageUrl(p.url);
                        setNewProductImageType(p.type);
                      }}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border text-left transition-all ${
                        newProductImageUrl === p.url ? 'ring-2 ring-[#8B2635] border-transparent' : 'border-stone-300'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-white text-[9px] p-1 truncate block">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newProductImageUrl}
                    onChange={(e) => setNewProductImageUrl(e.target.value)}
                    placeholder="Atau tempel URL gambar kustom..."
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg bg-white text-[11px]"
                  />
                  <div>
                    <input
                      type="file"
                      ref={addFileInputRef}
                      onChange={(e) => handleImageFileUpload(e, 'add')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-800 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                    >
                      Unggah File
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Bunga</label>
                  <input
                    type="text"
                    value={newProductFlowerTypes}
                    onChange={(e) => setNewProductFlowerTypes(e.target.value)}
                    placeholder="Mawar, Krisan, Gompie"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimasi Rangkai</label>
                  <input
                    type="text"
                    value={newProductPrepTime}
                    onChange={(e) => setNewProductPrepTime(e.target.value)}
                    placeholder="Contoh: 2 - 3 Jam"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Keterangan tangkai bunga, wrapping matte, dan aksesoris..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-[#8B2635] text-white rounded-lg hover:bg-[#721F2B]"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Produk Lengkap */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">ID: {editingProduct.id}</span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Edit Rincian Produk
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Produk Bunga</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="buket">Hand Bouquet</option>
                    <option value="papan-bunga">Papan Bunga Jambi</option>
                    <option value="wisuda">Buket Wisuda</option>
                    <option value="pernikahan">Bunga Pernikahan</option>
                    <option value="hampers">Hampers & Parcel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Stok</label>
                  <select
                    value={editStockStatus}
                    onChange={(e) => setEditStockStatus(e.target.value as StockStatus)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-medium"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="preorder">Pre-Order</option>
                    <option value="menipis">Menipis</option>
                    <option value="habis">Habis Hari Ini</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="block font-semibold text-stone-800">Ganti Foto Produk</label>
                
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                  {FLORIST_IMAGE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditImageUrl(p.url);
                        setEditImageType(p.type);
                      }}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border text-left transition-all ${
                        editImageUrl === p.url ? 'ring-2 ring-[#8B2635] border-transparent' : 'border-stone-300'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-white text-[9px] p-1 truncate block">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="URL gambar..."
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg bg-white text-[11px]"
                  />
                  <div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={(e) => handleImageFileUpload(e, 'edit')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-800 text-[11px] font-semibold cursor-pointer"
                    >
                      Unggah File
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Bunga</label>
                  <input
                    type="text"
                    value={editFlowerTypes}
                    onChange={(e) => setEditFlowerTypes(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimasi Pengerjaan</label>
                  <input
                    type="text"
                    value={editPrepTime}
                    onChange={(e) => setEditPrepTime(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setProductToDelete(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Produk</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold bg-[#8B2635] text-white rounded-lg hover:bg-[#721F2B]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus / Arsipkan Produk Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Hapus atau Arsipkan Produk?
                </h3>
                <p className="text-xs text-stone-500">
                  "{productToDelete.name}"
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Anda dapat memilih untuk <strong>menghapus permanen</strong> dari daftar katalog, atau cukup mengubah status menjadi <strong>"Habis Hari Ini"</strong> agar riwayat tetap tersimpan.
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateProductStock(productToDelete.id, 'habis');
                  setProductToDelete(null);
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Tandai Sebagai "Habis Hari Ini" (Direkomendasikan)
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Hapus Permanen dari Katalog
              </button>

              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs text-center"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Order Detail / Printable Slip */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 no-print">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8B2635] font-bold">
                  {showPrintSlip ? 'Surat Pesanan Florist & Kartu Ucapan' : 'Rincian Lengkap Pesanan'}
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Pesanan #{selectedOrderForDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle between standard view and print slip */}
            <div className="flex gap-2 no-print">
              <button
                onClick={() => setShowPrintSlip(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  !showPrintSlip ? 'bg-[#8B2635] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Informasi Manajemen
              </button>
              <button
                onClick={() => setShowPrintSlip(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  showPrintSlip ? 'bg-[#8B2635] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5 inline mr-1" />
                Format Cetak Slip Perangkai
              </button>
            </div>

            {showPrintSlip ? (
              /* Printable Florist Slip View with Window Print Button */
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs no-print">
                  <span className="text-amber-900 font-medium">
                    🖨️ Format siap cetak untuk diserahkan ke perangkai bunga dan kurir pengantar:
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#8B2635] hover:bg-[#721F2B] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Slip / Simpan PDF</span>
                  </button>
                </div>

                {/* Actual Printable Slip Content with ID for print CSS */}
                <div id="printable-slip" className="border-2 border-dashed border-stone-400 p-6 rounded-xl bg-white space-y-4 text-xs font-mono">
                  
                  {/* Header Slip */}
                  <div className="text-center pb-3 border-b-2 border-stone-300">
                    <h4 className="font-serif text-lg font-bold text-stone-900 uppercase">
                      {merchantConfig.storeName}
                    </h4>
                    <p className="text-[11px] text-stone-600 font-sans mt-0.5">
                      LEMBAR KERJA PERANGKAI BUNGA & SURAT JALAN PENGANTARAN
                    </p>
                    <p className="text-[10px] text-stone-500 font-sans">
                      {merchantConfig.storeAddress} · Telp/WA: {merchantConfig.displayPhone}
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 bg-stone-100 border border-stone-300 font-bold text-sm">
                      NO. PESANAN: #{selectedOrderForDetail.id}
                    </div>
                  </div>

                  {/* Delivery & Schedule Grid */}
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-stone-300">
                    <div>
                      <span className="font-bold block text-stone-900">JADWAL PENGIRIMAN:</span>
                      <p className="text-sm font-bold text-stone-800">{formatIndonesianDate(selectedOrderForDetail.deliveryDate)}</p>
                      <p>Slot Waktu: <strong>{selectedOrderForDetail.deliveryTimeSlot}</strong></p>
                      <p className="mt-1 text-[11px] text-stone-600">
                        Pemesan: {selectedOrderForDetail.customerName} ({selectedOrderForDetail.customerPhone})
                      </p>
                    </div>
                    <div>
                      <span className="font-bold block text-stone-900">TUJUAN & PENERIMA:</span>
                      <p className="font-bold text-sm text-stone-800">
                        {selectedOrderForDetail.recipientName} ({selectedOrderForDetail.recipientPhone})
                      </p>
                      <p>Kecamatan: <strong>Kec. {selectedOrderForDetail.deliveryDistrict}, Kota Jambi</strong></p>
                      <p className="mt-0.5">Alamat: {selectedOrderForDetail.deliveryAddress}</p>
                      {selectedOrderForDetail.addressLandmark && (
                        <p className="text-[11px] italic">Patokan: {selectedOrderForDetail.addressLandmark}</p>
                      )}
                      {selectedOrderForDetail.deliveryNotes && (
                        <p className="text-[11px] font-bold text-rose-700 mt-1">
                          Instruksi Kurir: {selectedOrderForDetail.deliveryNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items to Assemble */}
                  <div>
                    <span className="font-bold block mb-1.5 text-stone-900">RINCIAN ITEM & SPESIFIKASI RANGKAIAN:</span>
                    {selectedOrderForDetail.items.map((it, i) => (
                      <div key={i} className="mb-2 p-2.5 bg-stone-50 rounded border border-stone-300">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>{i + 1}. {it.product.name}</span>
                          <span>JUMLAH: x{it.quantity}</span>
                        </div>
                        <p className="mt-1">Pilihan Warna: <strong>{it.selectedColor.name}</strong></p>
                        <p className="text-[11px] text-stone-600">Komposisi Bunga: {it.product.flowerTypes.join(', ')}</p>
                        {it.customNotes && (
                          <p className="mt-1 p-1 bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                            <strong>Catatan Khusus Perangkai:</strong> {it.customNotes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Greeting Card section on slip */}
                  {selectedOrderForDetail.items.some(
                    (i) => i.cardGreeting?.to || i.cardGreeting?.message
                  ) && (
                    <div className="p-3 bg-white rounded border-2 border-stone-400 space-y-2">
                      <span className="font-bold text-stone-900 block border-b border-stone-300 pb-1">
                        KARTU UCAPAN (SIAP CETAK / DITULIS PADA KARTU BUNGA):
                      </span>
                      {selectedOrderForDetail.items.map((it, i) => (
                        <div key={i} className="text-xs space-y-1 p-2 bg-stone-50 rounded">
                          {it.cardGreeting?.to && <p><strong>Kepada:</strong> {it.cardGreeting.to}</p>}
                          {it.cardGreeting?.message && (
                            <p className="italic bg-white p-2 rounded border border-stone-200 font-sans text-xs">
                              "{it.cardGreeting.message}"
                            </p>
                          )}
                          {it.cardGreeting?.from && <p><strong>Dari:</strong> {it.cardGreeting.from}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Physical Sign-off Signatures */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t-2 border-stone-300 text-center font-sans text-[11px]">
                    <div className="border border-stone-300 p-2 rounded h-24 flex flex-col justify-between">
                      <span className="font-bold">Perangkai Bunga</span>
                      <span className="text-[9px] text-stone-400">(Tanda Tangan & Tanggal)</span>
                    </div>
                    <div className="border border-stone-300 p-2 rounded h-24 flex flex-col justify-between">
                      <span className="font-bold">Kurir Pengantar</span>
                      <span className="text-[9px] text-stone-400">(Tanda Tangan & Jam Kirim)</span>
                    </div>
                    <div className="border border-stone-300 p-2 rounded h-24 flex flex-col justify-between">
                      <span className="font-bold">Penerima Bunga di Jambi</span>
                      <span className="text-[9px] text-stone-400">(Nama Jelas & Tanda Tangan)</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-stone-500 text-center font-sans">
                    NGA Florist Jambi · Pastikan bunga segar dalam kondisi prima sebelum diserahkan ke penerima.
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Management Detail View */
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <span className="text-stone-400 block font-semibold">Pemesan:</span>
                    <p className="font-bold text-stone-900">{selectedOrderForDetail.customerName}</p>
                    <p className="text-stone-600 font-mono">{selectedOrderForDetail.customerPhone}</p>
                    {selectedOrderForDetail.customerEmail && (
                      <p className="text-stone-500">{selectedOrderForDetail.customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-stone-400 block font-semibold">Penerima di Jambi:</span>
                    <p className="font-bold text-stone-900">{selectedOrderForDetail.recipientName}</p>
                    <p className="text-stone-600 font-mono">{selectedOrderForDetail.recipientPhone}</p>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-stone-200">
                    <span className="text-stone-400 block font-semibold">Alamat Lengkap Pengiriman:</span>
                    <p className="text-stone-800">{selectedOrderForDetail.deliveryAddress}</p>
                    {selectedOrderForDetail.addressLandmark && (
                      <p className="text-stone-500 mt-0.5">Patokan: {selectedOrderForDetail.addressLandmark}</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-2">
                  <span className="font-bold text-stone-900 block mb-1">Rincian Item:</span>
                  {selectedOrderForDetail.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-none">
                      <div>
                        <p className="font-semibold text-stone-900">{it.product.name} (x{it.quantity})</p>
                        <p className="text-stone-500 text-[11px]">Warna: {it.selectedColor.name}</p>
                      </div>
                      <span className="font-mono font-bold">{formatIDR(it.subtotal)}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Total Estimasi Biaya</span>
                    <span className="font-mono text-base text-[#8B2635]">{formatIDR(selectedOrderForDetail.totalAmount)}</span>
                  </div>
                </div>

                {/* Status Switcher inside modal */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-semibold text-stone-800">Ubah Status Pesanan:</span>
                  <select
                    value={selectedOrderForDetail.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OrderStatus;
                      onUpdateOrderStatus(selectedOrderForDetail.id, newSt);
                      setSelectedOrderForDetail({ ...selectedOrderForDetail, status: newSt });
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium focus:outline-none"
                  >
                    <option value="baru">Pesanan Baru</option>
                    <option value="dikonfirmasi">Dikonfirmasi (Lunas/DP)</option>
                    <option value="dirangkai">Sedang Dirangkai</option>
                    <option value="siap-kirim">Siap Dikirim</option>
                    <option value="diantar">Dalam Pengantaran</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end no-print">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
