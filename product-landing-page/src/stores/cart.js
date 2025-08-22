import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // each item = { id, title, price, quantity, selectedColor }
  }),

  actions: {
    addToCart(product) {
      // Check for existing item with same id AND color
      const existing = this.items.find(
        (item) => item.id === product.id && item.selectedColor === product.selectedColor,
      )
      if (existing) {
        existing.quantity += product.quantity || 1
      } else {
        this.items.push({
          ...product,
          quantity: product.quantity || 1,
        })
      }
    },

    // This method is no longer used as we only update stock during checkout
    updateProductStock() {
      // Method kept for backward compatibility but no longer does anything
      return
    },

    removeFromCart(itemToRemove) {
      this.items = this.items.filter(
        (item) =>
          !(item.id === itemToRemove.id && item.selectedColor === itemToRemove.selectedColor),
      )
    },

    clearCart() {
      this.items = []
    },
  },

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
})
