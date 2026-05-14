import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      // إضافة منتج للسلة
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        
        if (existingItem) {
          // لو المنتج موجود أصلاً، زود الكمية بس (بحد أقصى المخزون المتاح)
          if (existingItem.quantity < item.stock) {
            set({
              items: currentItems.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            });
          }
        } else {
          // لو مش موجود، ضيفه لأول مرة
          set({ items: [...currentItems, { ...item, quantity: 1 }] });
        }
      },

      // مسح منتج من السلة
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      // تعديل الكمية (+ أو -)
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        });
      },

      // تفريغ السلة بالكامل
      clearCart: () => set({ items: [] }),

      // حساب الإجمالي
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'gstore-cart', // ده اسم الملف اللي هيتحفظ في الـ Local Storage
    }
  )
);