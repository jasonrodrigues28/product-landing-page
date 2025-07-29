import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // each item = { id, title, price, quantity }
  }),

  actions: {
    addToCart(product) {
      const existing = this.items.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1,
        })
      }
    },

    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.id !== productId)
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
