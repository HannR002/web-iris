import React, { useState } from 'react';
import type { Product } from '../types/florist.ts';
import { formatIDR } from '../utils/floristLogic.ts';
import { FloralIllustration } from './FloralIllustration.tsx';
import { Eye, Ban } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = product.stockStatus === 'habis';

  const getStockLabel = () => {
    switch (product.stockStatus) {
      case 'tersedia':
        return <span className="text-emerald-700 font-medium">Bunga Segar Siap</span>;
      case 'preorder':
        return <span className="text-blue-700 font-medium">Pre-order 1 Hari</span>;
      case 'menipis':
        return <span className="text-amber-700 font-medium">Stok Terbatas</span>;
      case 'habis':
        return <span className="text-rose-600 font-medium flex items-center gap-1"><Ban className="w-3 h-3 inline" /> Habis Hari Ini</span>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'buket':
        return 'Hand Bouquet';
      case 'papan-bunga':
        return 'Papan Bunga Jambi';
      case 'wisuda':
        return 'Buket Wisuda';
      case 'pernikahan':
        return 'Bunga Pernikahan';
      case 'hampers':
        return 'Hampers & Parcel';
      default:
        return 'Koleksi Bunga';
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer ${
        isOutOfStock ? 'opacity-90' : ''
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <FloralIllustration
            type={product.imageType}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-2xs flex items-center justify-center p-2">
            <span className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm tracking-wide">
              HABIS HARI INI
            </span>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3 py-1.5 bg-white/95 text-stone-900 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Detail & Ucapan</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Metadata line without pill enclosures */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="uppercase tracking-wider font-semibold text-stone-400 text-[11px]">
              {getCategoryLabel(product.category)}
            </span>
            <span className="text-xs">{getStockLabel()}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-[#8B2635] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Flower ingredients preview */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-medium">Harga</span>
            <span className="text-base font-bold text-stone-900 font-mono tabular-nums">
              {formatIDR(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : 'text-[#8B2635] bg-[#8B2635]/10 hover:bg-[#8B2635] hover:text-white cursor-pointer'
            }`}
          >
            <span>{isOutOfStock ? 'Habis' : 'Pilih Rangkaian'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
