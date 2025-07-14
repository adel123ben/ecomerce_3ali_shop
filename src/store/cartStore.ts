// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   image_url?: string;
//   quantity: number;
//   stock_quantity: number;
// }

// export interface WishlistItem {
//   id: string;
//   name: string;
//   price: number;
//   image_url?: string;
// }

// interface CartStore {
//   // Cart state
//   items: CartItem[];
//   totalItems: number;
//   totalPrice: number;
  
//   // Wishlist state
//   wishlist: WishlistItem[];
  
//   // Cart actions
//   addToCart: (product: Omit<CartItem, 'quantity'>) => void;
//   removeFromCart: (productId: string) => void;
//   updateQuantity: (productId: string, quantity: number) => void;
//   clearCart: () => void;
  
//   // Wishlist actions
//   addToWishlist: (product: WishlistItem) => void;
//   removeFromWishlist: (productId: string) => void;
//   isInWishlist: (productId: string) => boolean;
  
//   // Computed values
//   getCartItem: (productId: string) => CartItem | undefined;
//   calculateTotals: () => void;
// }

// export const useCartStore = create<CartStore>()(
//   persist(
//     (set, get) => ({
//       // Initial state
//       items: [],
//       totalItems: 0,
//       totalPrice: 0,
//       wishlist: [],

//       // Cart actions
//       addToCart: (product) => {
//         const { items } = get();
//         const existingItem = items.find(item => item.id === product.id);
        
//         if (existingItem) {
//           // Check stock limit
//           if (existingItem.quantity >= product.stock_quantity) {
//             return; // Don't add if at stock limit
//           }
          
//           set({
//             items: items.map(item =>
//               item.id === product.id
//                 ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
//                 : item
//             )
//           });
//         } else {
//           set({
//             items: [...items, { ...product, quantity: 1 }]
//           });
//         }
        
//         get().calculateTotals();
//       },

//       removeFromCart: (productId) => {
//         set({
//           items: get().items.filter(item => item.id !== productId)
//         });
//         get().calculateTotals();
//       },

//       updateQuantity: (productId, quantity) => {
//         const { items } = get();
//         const item = items.find(item => item.id === productId);
        
//         if (!item) return;
        
//         // Ensure quantity doesn't exceed stock
//         const validQuantity = Math.min(Math.max(0, quantity), item.stock_quantity);
        
//         if (validQuantity === 0) {
//           get().removeFromCart(productId);
//           return;
//         }
        
//         set({
//           items: items.map(item =>
//             item.id === productId
//               ? { ...item, quantity: validQuantity }
//               : item
//           )
//         });
        
//         get().calculateTotals();
//       },

//       clearCart: () => {
//         set({ items: [], totalItems: 0, totalPrice: 0 });
//       },

//       // Wishlist actions
//       addToWishlist: (product) => {
//         const { wishlist } = get();
//         if (!wishlist.find(item => item.id === product.id)) {
//           set({
//             wishlist: [...wishlist, product]
//           });
//         }
//       },

//       removeFromWishlist: (productId) => {
//         set({
//           wishlist: get().wishlist.filter(item => item.id !== productId)
//         });
//       },

//       isInWishlist: (productId) => {
//         return get().wishlist.some(item => item.id === productId);
//       },

//       // Utility functions
//       getCartItem: (productId) => {
//         return get().items.find(item => item.id === productId);
//       },

//       calculateTotals: () => {
//         const { items } = get();
//         const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
//         const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
//         set({ totalItems, totalPrice });
//       },
//     }),
//     {
//       name: 'cart-storage',
//       partialize: (state) => ({
//         items: state.items,
//         wishlist: state.wishlist,
//       }),
//     }
//   )
// );


import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
  stock_quantity: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url?: string;
  };
}

interface CartStore {
  // Cart state
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  // Wishlist state
  wishlist: WishlistItem[];
  
  // Cart actions
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist actions
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  
  // Utility functions
  getCartItem: (productId: string) => CartItem | undefined;
  calculateTotals: () => void;
  getTotalInDZD: () => string;
}

// Exchange rate: 1 USD = 134 DZD (approximate)
const USD_TO_DZD = 134;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,
      wishlist: [],

      // Cart actions
      addToCart: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          // Check stock limit
          if (existingItem.quantity >= product.stock_quantity) {
            return; // Don't add if at stock limit
          }
          
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
        
        get().calculateTotals();
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
        get().calculateTotals();
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const item = items.find(item => item.id === productId);
        
        if (!item) return;
        
        // Ensure quantity doesn't exceed stock
        const validQuantity = Math.min(Math.max(0, quantity), item.stock_quantity);
        
        if (validQuantity === 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          items: items.map(item =>
            item.id === productId
              ? { ...item, quantity: validQuantity }
              : item
          )
        });
        
        get().calculateTotals();
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      // Wishlist actions
      addToWishlist: (product) => {
        const { wishlist } = get();
        if (!wishlist.find(item => item.id === product.id)) {
          set({
            wishlist: [...wishlist, { ...product, created_at: new Date().toISOString() }]
          });
        }
      },

      removeFromWishlist: (productId) => {
        set({
          wishlist: get().wishlist.filter(item => item.id !== productId)
        });
      },

      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.id === productId);
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      // Utility functions
      getCartItem: (productId) => {
        return get().items.find(item => item.id === productId);
      },

      calculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ totalItems, totalPrice });
      },

      getTotalInDZD: () => {
        const { totalPrice } = get();
        const dzdAmount = totalPrice * USD_TO_DZD;
        return new Intl.NumberFormat('ar-DZ', {
          style: 'currency',
          currency: 'DZD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(dzdAmount);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
      }),
    }
  )
);