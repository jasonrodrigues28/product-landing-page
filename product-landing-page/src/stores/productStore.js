import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => {
    // Load initial state from localStorage if available
    const savedState = localStorage.getItem('productStore')
    const defaultState = {
      sellerInitials: 'SUY',
      productList: [],
      currentProductId: 1,
      highestUsedId: 0,
      availableIds: new Set(),
      cartItems: [],
    }

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        const availableIds = new Set(parsed.availableIds || [])

        // If there are no products, reset everything
        if (!parsed.productList || parsed.productList.length === 0) {
          return defaultState
        }

        // Calculate the actual highest ID from existing products
        const usedIds = parsed.productList.map((p) => parseInt(p.productId.split('-')[1]) || 0)
        const highestId = Math.max(...usedIds, 0)

        // Reset currentProductId if it's too high
        let nextId = highestId + 1

        // If we have available IDs that are lower than nextId, use the lowest one
        if (availableIds.size > 0) {
          const lowestAvailable = Math.min(...Array.from(availableIds))
          if (lowestAvailable < nextId) {
            nextId = lowestAvailable
          }
        }

        return {
          ...parsed,
          availableIds,
          highestUsedId: highestId,
          currentProductId: nextId,
        }
      } catch (error) {
        console.error('Error parsing stored data:', error)
        return defaultState
      }
    }

    return defaultState
  },

  actions: {
    getNextProductId() {
      // Always check available IDs first
      if (this.availableIds.size > 0) {
        const sortedIds = Array.from(this.availableIds).sort((a, b) => a - b)
        const reusedId = sortedIds[0]
        return `${this.sellerInitials}-${reusedId}`
      }

      // Use the next sequential ID
      return `${this.sellerInitials}-${this.currentProductId}`
    },
    generateProductId() {
      return this.getNextProductId()
    },
    saveToLocalStorage() {
      // Convert state to JSON-friendly format
      const stateToSave = {
        ...this.$state,
        availableIds: Array.from(this.availableIds), // Convert Set to Array for JSON storage
      }
      localStorage.setItem('productStore', JSON.stringify(stateToSave))
    },
    addProduct(product) {
      // Find unused ID from pool or use next sequential
      const productId = this.generateProductId()

      // If we used an ID from the pool, remove it
      const numericId = parseInt(productId.split('-')[1])
      if (this.availableIds.has(numericId)) {
        this.availableIds.delete(numericId)
      } else {
        // Increment the counter if we used a sequential ID
        this.currentProductId++
        this.highestUsedId = Math.max(this.highestUsedId, numericId)
      }

      // Prepare the product object
      const newProduct = {
        ...product,
        productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unitsSold: 0,
      }

      // If product has color variants, set up stock structure
      if (newProduct.colorVariants && newProduct.colorVariants.length > 0) {
        const stock = newProduct.stock || 0
        newProduct.stockByColor = {}

        // Distribute stock evenly among variants or use provided specific values
        if (newProduct.stockByColor) {
          // Keep existing stock structure
        } else {
          // Set up even distribution
          const variantCount = newProduct.colorVariants.length
          const baseStock = Math.floor(stock / variantCount)
          const remainder = stock % variantCount

          // Distribute stock evenly among variants
          newProduct.colorVariants.forEach((color, index) => {
            // Add an extra to early variants if there's remainder stock
            newProduct.stockByColor[color] = baseStock + (index < remainder ? 1 : 0)
          })
        }
      }

      // Store in products list
      this.productList.push(newProduct)

      // Save to localStorage
      this.saveToLocalStorage()

      return productId
    },
    updateProduct(productId, updatedProduct) {
      const index = this.productList.findIndex((p) => p.productId === productId)
      if (index === -1) return false

      // Update the existing product, preserve important fields
      const originalProduct = this.productList[index]
      this.productList[index] = {
        ...originalProduct, // Keep original fields
        ...updatedProduct, // Apply updates
        productId, // Ensure ID doesn't change
        createdAt: originalProduct.createdAt, // Keep creation timestamp
        updatedAt: new Date().toISOString(), // Update the modification timestamp
      }

      // If color variants were updated, handle stock restructuring
      if (updatedProduct.colorVariants) {
        const currentStock = this.productList[index].stockByColor || {}
        const updatedStockByColor = {}

        // Keep existing stock values for colors that still exist
        updatedProduct.colorVariants.forEach((color) => {
          updatedStockByColor[color] = currentStock[color] || 0
        })

        // Update the stock by color
        this.productList[index].stockByColor = updatedStockByColor
      }

      this.saveToLocalStorage()
      return true
    },
    deleteProduct(productId) {
      const index = this.productList.findIndex((p) => p.productId === productId)
      if (index === -1) return false

      // Mark the ID as available for reuse
      const numericId = parseInt(productId.split('-')[1])
      if (numericId > 0) {
        this.availableIds.add(numericId)
      }

      // Remove the product
      this.productList.splice(index, 1)

      // Also remove from cart if present
      this.cartItems = this.cartItems.filter((item) => item.productId !== productId)

      this.saveToLocalStorage()
      return true
    },
    deleteMultipleProducts(productIds) {
      let anyDeleted = false

      // Delete each product
      productIds.forEach((id) => {
        if (this.deleteProduct(id)) {
          anyDeleted = true
        }
      })

      if (anyDeleted) {
        this.saveToLocalStorage()
      }

      return anyDeleted
    },
    resetProducts() {
      this.productList = []
      this.currentProductId = 1
      this.highestUsedId = 0
      this.availableIds = new Set()
      this.cartItems = []
      this.saveToLocalStorage()
    },

    updateProductStock(productId, newStock, color) {
      const index = this.productList.findIndex((p) => p.productId === productId)
      if (index === -1) return

      const product = this.productList[index]

      if (color && product.stockByColor) {
        // Update color-specific stock
        if (!product.stockByColor[color] && color) {
          // Initialize if it doesn't exist
          product.stockByColor[color] = 0
        }
        product.stockByColor[color] = newStock
      } else {
        // Update general stock
        product.stock = newStock
      }

      // Mark as updated
      product.updatedAt = new Date().toISOString()

      this.saveToLocalStorage()
    },

    incrementUnitsSold(productId, quantity = 1, color = null) {
      const index = this.productList.findIndex((p) => p.productId === productId)
      if (index === -1) return
      const product = this.productList[index]
      // Color-specific path
      if (color && product.colorVariants?.includes(color)) {
        if (!product.unitsSoldByColor) product.unitsSoldByColor = {}
        product.unitsSoldByColor[color] = (product.unitsSoldByColor[color] || 0) + quantity
        product.unitsSold = Object.values(product.unitsSoldByColor).reduce((a, b) => a + b, 0)
      } else {
        // Legacy / no-color path
        product.unitsSold = (product.unitsSold || 0) + quantity
      }
      product.updatedAt = new Date().toISOString()
      this.saveToLocalStorage()
    },

    addToCart(productId, quantity) {
      const product = this.productList.find((p) => p.productId === productId)
      if (product && product.stock >= quantity) {
        const cartItem = {
          productId,
          quantity,
          addedAt: new Date().toISOString(),
        }
        this.cartItems.push(cartItem)
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    removeFromCart(productId) {
      const index = this.cartItems.findIndex((item) => item.productId === productId)
      if (index !== -1) {
        // Restore stock
        const item = this.cartItems[index]
        const productIndex = this.productList.findIndex((p) => p.productId === productId)
        if (productIndex !== -1) {
          this.productList[productIndex].stock += item.quantity
          this.productList[productIndex].unitsSold -= item.quantity
        }
        // Remove from cart
        this.cartItems.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    checkout(cartItems) {
      // Process each item in the cart
      cartItems.forEach((item) => {
        const product = this.productList.find((p) => p.productId === item.id)
        if (!product) return

        if (item.selectedColor) {
          // Handle color-specific stock
          if (product.stockByColor?.[item.selectedColor] >= item.quantity) {
            product.stockByColor[item.selectedColor] -= item.quantity
            // Increment color-specific units sold
            if (!product.unitsSoldByColor) product.unitsSoldByColor = {}
            product.unitsSoldByColor[item.selectedColor] =
              (product.unitsSoldByColor[item.selectedColor] || 0) + item.quantity
            product.unitsSold = Object.values(product.unitsSoldByColor).reduce((a, b) => a + b, 0)
          }
        } else {
          // Handle regular stock
          if (product.stock >= item.quantity) {
            product.stock -= item.quantity
            product.unitsSold = (product.unitsSold || 0) + item.quantity
          }
        }
      })

      this.saveToLocalStorage()
    },
  },

  getters: {
    productsByCategory: (state) => {
      return (category) => state.productList.filter((p) => p.category === category)
    },
    productById: (state) => {
      return (id) => state.productList.find((p) => p.productId === id)
    },
  },
})
