import { create } from "zustand";
import type { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  remove: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

export const cartItemCount = (state: CartState): number => state.items.length;
