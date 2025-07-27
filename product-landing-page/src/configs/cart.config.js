// src/configs/cart.config.js

export const cartConfig = {
  buttons: {
    addToCart: "Add to Cart",
    viewCart: "View Cart",
    checkout: "Proceed to Checkout",
    removeItem: "Remove",
    clearCart: "Clear Cart"
  },

  messages: {
    emptyCart: "Your cart is empty.",
    itemAdded: "Item added to cart!",
    itemRemoved: "Item removed from cart.",
    purchaseSuccess: "Purchase completed successfully!",
    error: "Something went wrong. Please try again."
  },

  cartLimits: {
    maxItemsPerCart: 20
  }
};
