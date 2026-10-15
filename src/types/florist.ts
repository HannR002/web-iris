export type ProductCategory = 
  | 'semua'
  | 'buket'
  | 'papan-bunga'
  | 'wisuda'
  | 'pernikahan'
  | 'hampers';

export type StockStatus = 'tersedia' | 'preorder' | 'menipis' | 'habis';

export type OrderStatus = 
  | 'baru'
  | 'dikonfirmasi'
  | 'dirangkai'
  | 'siap-kirim'
  | 'diantar'
  | 'selesai'
  | 'dibatalkan';

export type FlowerColorVariant = {
  id: string;
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stockStatus: StockStatus;
  description: string;
  flowerTypes: string[];
  availableColors: FlowerColorVariant[];
  cardIncluded: boolean;
  estimatedPrepTime: string;
  dimensions?: string;
  imageType: 
    | 'bouquet-rose'
    | 'bouquet-lily'
    | 'papan-selamat'
    | 'papan-duka'
    | 'wisuda-teddy'
    | 'wisuda-sunflower'
    | 'wedding-bridal'
    | 'hamper-deluxe'
    | 'hamper-fruit';
  isPopular?: boolean;
};

export type GreetingCard = {
  to: string;
  message: string;
  from: string;
};

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor: FlowerColorVariant;
  cardGreeting: GreetingCard;
  customNotes: string;
  subtotal: number;
};

export type DeliveryDistrict = {
  name: string;
  fee: number;
  estimatedTime: string;
};

export type CheckoutFormData = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryDistrict: string;
  deliveryAddress: string;
  addressLandmark: string;
  deliveryDate: string; // YYYY-MM-DD
  deliveryTimeSlot: string;
  deliveryNotes: string;
  isAnonymousGift: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryDistrict: string;
  deliveryAddress: string;
  addressLandmark?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryNotes?: string;
  isAnonymousGift?: boolean;
  items: CartItem[];
  itemsSubtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type MerchantConfig = {
  storeName: string;
  whatsappNumber: string; // e.g. "6281274189000" (without + or spaces for WA link)
  displayPhone: string;   // e.g. "0812-7418-9000"
  storeAddress: string;
  operatingHours: string;
  instagramHandle: string;
  freeDeliveryMinAmount: number; // e.g. 500000
};
