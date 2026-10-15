import React, { useState } from 'react';
import type { MerchantConfig, Order, OrderStatus, Product, ProductCategory, StockStatus } from '../types/florist.ts';
import { formatIDR, formatIndonesianDate, getOrderStatusBadge } from '../utils/floristLogic.ts';
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
  X
} from 'lucide-react';

type AdminDashboardProps = {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: StockStatus) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onAddProduct: (product: Product) => void;
  merchantConfig: MerchantConfig;
  onUpdateMerchantConfig: (config: MerchantConfig) => void;
  onResetDemoData: () => void;
  onBackToStore: () => void;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  products,
  onUpdateProductStock,
  onUpdateProductPrice,
  onAddProduct,
  merchantConfig,
  onUpdateMerchantConfig,
  onResetDemoData,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'pesanan' | 'produk' | 'pengaturan'>('pesanan');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  // Product edit state
  const [editingPriceProductId, setEditingPriceProductId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('buket');
  const [newProductPrice, setNewProductPrice] = useState(300000);
  const [newProductDesc, setNewProductDesc] = useState('');

  // Config form state
  const [configStoreName, setConfigStoreName] = useState(merchantConfig.storeName);
  const [configWaNumber, setConfigWaNumber] = useState(merchantConfig.whatsappNumber);
  const [configDisplayPhone, setConfigDisplayPhone] = useState(merchantConfig.displayPhone);
  const [configAddress, setConfigAddress] = useState(merchantConfig.storeAddress);
  const [configFreeDelivery, setConfigFreeDelivery] = useState(merchantConfig.freeDeliveryMinAmount);
  const [configSavedToast, setConfigSavedToast] = useState(false);

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

  // Calculate KPIs
  const totalOrdersCount = orders.length;
  const nonCancelledOrders = orders.filter((o) => o.status !== 'dibatalkan');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const inProductionCount = orders.filter((o) => o.status === 'baru' || o.status === 'dikonfirmasi' || o.status === 'dirangkai').length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'siap-kirim' || o.status === 'diantar').length;

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
    setTimeout(() => setConfigSavedToast(false), 2000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price: Number(newProductPrice) || 250000,
      stockStatus: 'tersedia',
      description: newProductDesc.trim() || 'Rangkaian bunga segar pesanan spesial NGA Florist.',
      flowerTypes: ['Mawar Segar', 'Daun Ruskus', 'Baby Breath'],
      availableColors: [
        { id: 'c-red', name: 'Merah Klasik', hex: '#8B0000' },
        { id: 'c-white', name: 'Putih Salju', hex: '#FFFFFF' },
        { id: 'c-peach', name: 'Pastel Peach', hex: '#FFCBA4' },
      ],
      cardIncluded: true,
      estimatedPrepTime: '2 Jam',
      imageType: newProductCategory === 'papan-bunga' ? 'papan-selamat' : newProductCategory === 'wisuda' ? 'wisuda-teddy' : 'bouquet-rose',
    };

    onAddProduct(newProd);
    setShowAddProductModal(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      
      {/* Explicit Demo Mode Banner (Prompt Requirement) */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2 text-xs border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Simulasi Demo
            </span>
            <span>
              Dashboard ini menggunakan data contoh lokal browser untuk keperluan demonstrasi UMKM Florist Jambi.
            </span>
          </div>
          <button
            onClick={onBackToStore}
            className="text-stone-300 hover:text-white underline text-[11px] font-medium"
          >
            ← Kembali ke Tampilan Pelanggan
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Admin Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Panel Pengelola {merchantConfig.storeName}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manajemen pesanan bunga harian, antrean produksi perangkai, dan katalog produk.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#8B2635] hover:bg-[#721F2B] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buka Toko Pelanggan</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Total Pesanan Tercatat</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                {totalOrdersCount}
              </span>
              <span className="text-[11px] text-stone-400">Order</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Estimasi Omset Simulasi</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                {formatIDR(totalRevenue)}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Perlu Diproses / Dirangkai</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-purple-700 tabular-nums">
                {inProductionCount}
              </span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Siap / Sedang Dikirim</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-2xl font-bold text-sky-700 tabular-nums">
                {outForDeliveryCount}
              </span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center border-b border-stone-200 space-x-6 text-sm font-medium">
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
            <span>Pengaturan WhatsApp & Toko</span>
          </button>
        </div>

        {/* TAB 1: ORDER MANAGEMENT */}
        {activeTab === 'pesanan' && (
          <div className="mt-6 space-y-4">
            
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
                      <th className="py-3 px-4">Pemesan</th>
                      <th className="py-3 px-4">Penerima & Lokasi</th>
                      <th className="py-3 px-4">Jadwal Kirim</th>
                      <th className="py-3 px-4">Total (IDR)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi Cepat</th>
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

                            {/* Customer */}
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-stone-900">{order.customerName}</p>
                              <p className="text-[11px] text-stone-500 font-mono">{order.customerPhone}</p>
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
                                <option value="baru">Baru</option>
                                <option value="dikonfirmasi">Dikonfirmasi</option>
                                <option value="dirangkai">Sedang Dirangkai</option>
                                <option value="siap-kirim">Siap Dikirim</option>
                                <option value="diantar">Dalam Pengantaran</option>
                                <option value="selesai">Selesai</option>
                                <option value="dibatalkan">Dibatalkan</option>
                              </select>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
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
                                title="Cetak Slip Rangkaian & Kartu Ucapan"
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
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Daftar Katalog Bunga & Ketersediaan Stok
                </h3>
                <p className="text-xs text-stone-500">
                  Atur status ketersediaan tangkai bunga dan sesuaikan harga katalog langsung di sini.
                </p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-[#8B2635] hover:bg-[#721F2B] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                      <FloralIllustration type={prod.imageType} className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                        {prod.category}
                      </span>
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
                          className="w-full text-xs px-2 py-1 border border-stone-300 rounded bg-stone-50 focus:outline-none"
                        >
                          <option value="tersedia">Tersedia (Bunga Segar Siap)</option>
                          <option value="preorder">Pre-Order (1 Hari)</option>
                          <option value="menipis">Stok Menipis</option>
                          <option value="habis">Habis Hari Ini</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Price Edit Area */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Harga</span>
                      {editingPriceProductId === prod.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(Number(e.target.value))}
                            className="w-24 text-xs font-mono px-2 py-1 border border-stone-300 rounded"
                          />
                          <button
                            onClick={() => {
                              onUpdateProductPrice(prod.id, editPriceValue);
                              setEditingPriceProductId(null);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px]"
                          >
                            Simpan
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                            {formatIDR(prod.price)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceProductId(prod.id);
                              setEditPriceValue(prod.price);
                            }}
                            className="text-stone-400 hover:text-stone-700"
                            title="Ubah harga"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] text-stone-400 font-mono">
                      ID: {prod.id}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MERCHANT & WHATSAPP CONFIG */}
        {activeTab === 'pengaturan' && (
          <div className="mt-6 max-w-2xl bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Pengaturan WhatsApp Toko & Profil Bisnis
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Ubah nomor tujuan WhatsApp kasir florist. Format pesan yang dikirim pelanggan akan otomatis ditujukan ke nomor ini.
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
                    Nomor WhatsApp Tujuan (Tanpa + atau Spasi)
                  </label>
                  <input
                    type="text"
                    value={configWaNumber}
                    onChange={(e) => setConfigWaNumber(e.target.value)}
                    placeholder="6281274189000"
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Format: 628xxxxxxxxxx</span>
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
                  Alamat Fisik Toko di Jambi
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
                  Minimal Belanja untuk Promo Gratis Ongkir (IDR)
                </label>
                <input
                  type="number"
                  value={configFreeDelivery}
                  onChange={(e) => setConfigFreeDelivery(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8B2635] hover:bg-[#721F2B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>

                {configSavedToast && (
                  <span className="text-xs text-emerald-700 font-semibold animate-in fade-in">
                    ✓ Pengaturan berhasil disimpan!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Tambah Produk Bunga Baru (Demo)
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Nama Produk Bunga</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Contoh: Buket Bunga Matahari & Aster"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B2635]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="buket">Hand Bouquet</option>
                    <option value="papan-bunga">Papan Bunga Jambi</option>
                    <option value="wisuda">Buket Wisuda</option>
                    <option value="pernikahan">Bunga Pernikahan</option>
                    <option value="hampers">Hampers & Parcel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Keterangan tangkai bunga dan kemasan..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#8B2635] text-white rounded-lg hover:bg-[#721F2B]"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Detail / Printable Slip */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
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
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle between standard view and print slip */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrintSlip(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  !showPrintSlip ? 'bg-[#8B2635] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Informasi Manajemen
              </button>
              <button
                onClick={() => setShowPrintSlip(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  showPrintSlip ? 'bg-[#8B2635] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5 inline mr-1" />
                Format Cetak Slip Perangkai
              </button>
            </div>

            {showPrintSlip ? (
              /* Printable Florist Slip View */
              <div className="border-2 border-dashed border-stone-300 p-5 rounded-xl bg-amber-50/30 space-y-4 text-xs font-mono">
                <div className="text-center pb-3 border-b border-stone-300">
                  <h4 className="font-serif text-base font-bold text-stone-900 font-sans uppercase">
                    {merchantConfig.storeName}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-sans">
                    LEMBAR KERJA PERANGKAI BUNGA & SURAT JALAN KURIR
                  </p>
                  <p className="text-[11px] font-bold mt-1">NO: #{selectedOrderForDetail.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-stone-200">
                  <div>
                    <span className="font-bold block">JADWAL PENGIRIMAN:</span>
                    <p>{formatIndonesianDate(selectedOrderForDetail.deliveryDate)}</p>
                    <p>Slot: {selectedOrderForDetail.deliveryTimeSlot}</p>
                  </div>
                  <div>
                    <span className="font-bold block">TUJUAN:</span>
                    <p>Kec. {selectedOrderForDetail.deliveryDistrict}</p>
                    <p>Penerima: {selectedOrderForDetail.recipientName} ({selectedOrderForDetail.recipientPhone})</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold block mb-1">ITEM YANG HARUS DIRANGKAI:</span>
                  {selectedOrderForDetail.items.map((it, i) => (
                    <div key={i} className="mb-2 p-2 bg-white rounded border border-stone-200">
                      <p className="font-bold text-stone-900">
                        {it.product.name} (x{it.quantity})
                      </p>
                      <p>Warna: {it.selectedColor.name}</p>
                      {it.customNotes && <p>Catatan Perangkai: {it.customNotes}</p>}
                    </div>
                  ))}
                </div>

                {/* Greeting Card section on slip */}
                {selectedOrderForDetail.items.some(
                  (i) => i.cardGreeting?.to || i.cardGreeting?.message
                ) && (
                  <div className="p-3 bg-white rounded border-2 border-stone-400 space-y-1">
                    <span className="font-bold text-stone-900 block border-b pb-1">
                      KARTU UCAPAN (SIAP CETAK / TULIS):
                    </span>
                    {selectedOrderForDetail.items.map((it, i) => (
                      <div key={i} className="text-[11px] space-y-0.5">
                        {it.cardGreeting?.to && <p><strong>Kepada:</strong> {it.cardGreeting.to}</p>}
                        {it.cardGreeting?.message && (
                          <p className="italic bg-stone-50 p-1.5 rounded">"{it.cardGreeting.message}"</p>
                        )}
                        {it.cardGreeting?.from && <p><strong>Dari:</strong> {it.cardGreeting.from}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-[10px] text-stone-500 text-center font-sans">
                  NGA Florist Jambi · Mohon pastikan bunga segar dalam kondisi prima sebelum diserahkan ke kurir.
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
                    <option value="dikonfirmasi">Dikonfirmasi</option>
                    <option value="dirangkai">Sedang Dirangkai</option>
                    <option value="siap-kirim">Siap Dikirim</option>
                    <option value="diantar">Dalam Pengantaran</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-800"
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
