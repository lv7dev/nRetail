import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, cartItemCount } from './useCartStore';

const item1 = { id: 'a', name: 'Apple', price: 100, quantity: 1 };
const item2 = { id: 'b', name: 'Banana', price: 50, quantity: 2 };

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('starts with empty cart', () => {
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('cartItemCount is 0 when cart is empty', () => {
    expect(cartItemCount(useCartStore.getState())).toBe(0);
  });

  describe('add', () => {
    it('adds a new item', () => {
      useCartStore.getState().add(item1);
      expect(useCartStore.getState().items).toHaveLength(1);
    });

    it('increments quantity when same item added again', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().add(item1);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('increments duplicate and leaves other items unchanged', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().add(item2);
      useCartStore.getState().add(item1); // increment item1, leave item2 unchanged
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
      expect(items.find((i) => i.id === 'a')?.quantity).toBe(2);
      expect(items.find((i) => i.id === 'b')?.quantity).toBe(2);
    });

    it('adds different items separately', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().add(item2);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('removes an item by id', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().remove('a');
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('leaves other items intact', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().add(item2);
      useCartStore.getState().remove('a');
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].id).toBe('b');
    });
  });

  describe('cartItemCount', () => {
    it('sums quantities across items', () => {
      useCartStore.getState().add(item1); // qty 1
      useCartStore.getState().add(item2); // qty 2
      expect(cartItemCount(useCartStore.getState())).toBe(3);
    });

    it('counts correctly after adding same item twice', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().add(item1);
      expect(cartItemCount(useCartStore.getState())).toBe(2);
    });
  });

  describe('clear', () => {
    it('empties the cart', () => {
      useCartStore.getState().add(item1);
      useCartStore.getState().clear();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });
});
