import React, { useState } from 'react';
import type { MerchantConfig, Order } from '../types/florist.ts';
import { createWhatsAppUrl, formatIDR, formatIndonesianDate, generateWhatsAppOrderMessage } from '../utils/floristLogic.ts';
import { CheckCircle2, MessageCircle, Copy, Check, ExternalLink, X, MapPin, Calendar, Clock, ShoppingBag } from 'lucide-react';

type OrderConfirmationModalProps = {
  order: Order | null;
  merchantConfig: MerchantConfig;
  onClose: () => void;
  onViewInAdmin?: () => void;
};

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  merchantConfig,
  onClose,
  onViewInAdmin,
}) => {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  const formattedMessage = generateWhatsAppOrderMessage(order, merchantConfig);
  const waUrl = createWhatsAppUrl(merchantConfig.whatsappNumber, formattedMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="px-6 py-5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
                Pemesanan Berhasil Dibuat
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Pesanan #{order.id}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-emerald-100/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup jendela konfirmasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Quick instructions banner */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Kirimkan Rincian ke WhatsApp Florist</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Silakan klik tombol <strong>"Kirim via WhatsApp"</strong> di bawah untuk membuka obrolan langsung dengan admin florist di nomor <strong>{merchantConfig.displayPhone}</strong>. Rincian bunga dan kartu ucapan sudah otomatis terformat rapi!
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buka Chat WhatsApp Florist</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopy}
              className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs transition-colors border border-stone-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Format Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Salin Pesan Format WA</span>
                </>
              )}
            </button>
          </div>

          {/* Order Details Brief */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Ringkasan Data Pengiriman
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">Pemesan:</span>
                <span className="font-semibold text-stone-900">{order.customerName} ({order.customerPhone})</span>
              </div>
              <div>
                <span className="text-stone-500 block">Penerima di Jambi:</span>
                <span className="font-semibold text-stone-900">{order.recipientName} ({order.recipientPhone})</span>
              </div>
              <div>
                <span className="text-stone-500 block">Tujuan & Jadwal:</span>
                <span className="font-semibold text-stone-900">
                  Kec. {order.deliveryDistrict} · {formatIndonesianDate(order.deliveryDate)} ({order.deliveryTimeSlot})
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Total Pembayaran (Estimasi):</span>
                <span className="font-mono font-bold text-[#8B2635] text-sm tabular-nums">
                  {formatIDR(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500 block">Alamat Lengkap:</span>
              <p className="text-stone-800 font-medium">
                {order.deliveryAddress} {order.addressLandmark ? `(Patokan: ${order.addressLandmark})` : ''}
              </p>
            </div>
          </div>

          {/* WhatsApp Text Preview Collapsible or Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Pratinjau Pesan WhatsApp:</span>
              <span className="text-[11px] font-mono">Tujuan: +{merchantConfig.whatsappNumber}</span>
            </div>
            
            <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-stone-800">
              {formattedMessage}
            </pre>
          </div>

          {/* Admin demo link helper */}
          {onViewInAdmin && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <p className="text-xs text-stone-600 mb-2">
                Ingin melihat bagaimana pesanan ini tampil di dashboard pengelola toko?
              </p>
              <button
                onClick={() => {
                  onClose();
                  onViewInAdmin();
                }}
                className="text-xs font-semibold text-[#8B2635] hover:underline"
              >
                Lihat di Dashboard Admin Florist →
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
