import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import { 
  ref, set, update, remove, 
  onValue, off, push
} from 'firebase/database'

export const useProductStore = defineStore('product', {
  state: () => {
    // Default state
    const defaultState = {
      sellerInitials: 'SUY',
      productList: [],
      currentProductId: 1,
      highestUsedId: 0,
      availableIds: [],
      cartItems: [],
      isLoading: true
    }

    return defaultState
  },

  actions: {
    // Initialize Firebase listeners
    initFirebase() {
      // Set up listener for products
      const productsRef = ref(db, 'products')
      
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          // Convert Firebase object to array
          const productArray = Object.keys(data).map(key => ({
            firebaseKey: key,
            ...data[key]
          }))
          
          this.productList = productArray
          
          // Calculate the highest used ID
          const usedIds = productArray.map((p) => parseInt(p.productId.split('-')[1]) || 0)
          this.highestUsedId = Math.max(...usedIds, 0)
          this.currentProductId = this.highestUsedId + 1
        } else {
          this.productList = []
          this.highestUsedId = 0
          this.currentProductId = 1
        }
        
        this.isLoading = false
      })
    },

    // Stop listening to Firebase
    clearFirebaseListeners() {
      const productsRef = ref(db, 'products')
      off(productsRef)
    },

    // Save a product to Firebase
    async addProduct(product) {
      try {
        // Generate new product ID
        const productId = this.generateProductId()
        
        // Prepare product for saving
        const productToSave = {
          ...product,
          productId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unitsSold: 0
        }
        
        // If product has color variants, set up stock structure
        if (productToSave.colorVariants && productToSave.colorVariants.length > 0) {
          const stock = productToSave.stock || 0
          productToSave.stockByColor = {}

          // Distribute stock evenly among variants or use provided specific values
          if (productToSave.stockByColor) {
            // Keep existing stock structure
          } else {
            // Set up even distribution
            const variantCount = productToSave.colorVariants.length
            const baseStock = Math.floor(stock / variantCount)
            const remainder = stock % variantCount

            // Distribute stock evenly among variants
            productToSave.colorVariants.forEach((color, index) => {
              // Add an extra to early variants if there's remainder stock
              productToSave.stockByColor[color] = baseStock + (index < remainder ? 1 : 0)
            })
          }
        }
        
        // Add to Firebase
        const productsRef = ref(db, 'products')
        const newProductRef = push(productsRef)
        await set(newProductRef, productToSave)
        
        return productId
      } catch (error) {
        console.error('Error adding product:', error)
        throw error
      }
    },
    
    // Update a product in Firebase
    async updateProduct(productId, updatedFields) {
      try {
        const product = this.productList.find((p) => p.productId === productId)
        if (!product) throw new Error('Product not found')
        
        const firebaseKey = product.firebaseKey
        const productRef = ref(db, `products/${firebaseKey}`)
        
        // If color variants were updated, handle stock restructuring
        if (updatedFields.colorVariants) {
          const currentStock = product.stockByColor || {}
          const updatedStockByColor = {}

          // Keep existing stock values for colors that still exist
          updatedFields.colorVariants.forEach((color) => {
            updatedStockByColor[color] = currentStock[color] || 0
          })

          // Update the stock by color
          updatedFields.stockByColor = updatedStockByColor
        }
        
        await update(productRef, {
          ...updatedFields,
          updatedAt: new Date().toISOString()
        })
        
        return true
      } catch (error) {
        console.error('Error updating product:', error)
        throw error
      }
    },
    
    // Delete a product from Firebase
    async deleteProduct(productId) {
      try {
        const product = this.productList.find((p) => p.productId === productId)
        if (!product) return false
        
        const firebaseKey = product.firebaseKey
        const productRef = ref(db, `products/${firebaseKey}`)
        
        await remove(productRef)
        return true
      } catch (error) {
        console.error('Error deleting product:', error)
        throw error
      }
    },
    
    // Delete multiple products
    async deleteMultipleProducts(productIds) {
      try {
        const promises = productIds.map(id => this.deleteProduct(id))
        const results = await Promise.all(promises)
        return results.some(result => result === true)
      } catch (error) {
        console.error('Error deleting multiple products:', error)
        throw error
      }
    },

    // Reset products (useful for testing)
    resetProducts() {
      const productsRef = ref(db, 'products')
      set(productsRef, null)
    },

    // Generate a product ID
    generateProductId() {
      const sellerCode = this.sellerInitials || 'XX'
      return `${sellerCode}-${this.currentProductId++}`
    },
    
    // Update product stock
    async updateProductStock(productId, newStock, color) {
      try {
        const product = this.productList.find((p) => p.productId === productId)
        if (!product) return
        
        const firebaseKey = product.firebaseKey
        
        if (color && product.stockByColor) {
          // Update color-specific stock
          const updates = {}
          updates[`stockByColor/${color}`] = newStock
          
          const productRef = ref(db, `products/${firebaseKey}`)
          await update(productRef, updates)
        } else {
          // Update general stock
          const productRef = ref(db, `products/${firebaseKey}`)
          await update(productRef, { 
            stock: newStock,
            updatedAt: new Date().toISOString() 
          })
        }
      } catch (error) {
        console.error('Error updating product stock:', error)
        throw error
      }
    },
    
    // Increment units sold
    async incrementUnitsSold(productId, quantity = 1, color = null) {
      try {
        const product = this.productList.find((p) => p.productId === productId)
        if (!product) return
        
        const firebaseKey = product.firebaseKey
        
        if (color && product.colorVariants?.includes(color)) {
          // Update color-specific units sold
          const unitsSoldByColor = { ...(product.unitsSoldByColor || {}) }
          unitsSoldByColor[color] = (unitsSoldByColor[color] || 0) + quantity
          
          const totalUnitsSold = Object.values(unitsSoldByColor).reduce((a, b) => a + b, 0)
          
          const updates = {
            unitsSoldByColor,
            unitsSold: totalUnitsSold,
            updatedAt: new Date().toISOString()
          }
          
          const productRef = ref(db, `products/${firebaseKey}`)
          await update(productRef, updates)
        } else {
          // Update general units sold
          const unitsSold = (product.unitsSold || 0) + quantity
          
          const productRef = ref(db, `products/${firebaseKey}`)
          await update(productRef, { 
            unitsSold, 
            updatedAt: new Date().toISOString() 
          })
        }
      } catch (error) {
        console.error('Error incrementing units sold:', error)
        throw error
      }
    },

    // Legacy methods (kept for compatibility but using Firebase)
    addToCart(productId, quantity) {
      // This now just updates the local state
      const product = this.productList.find((p) => p.productId === productId)
      if (product && product.stock >= quantity) {
        const cartItem = {
          productId,
          quantity,
          addedAt: new Date().toISOString(),
        }
        this.cartItems.push(cartItem)
        return true
      }
      return false
    },

    removeFromCart(productId) {
      const index = this.cartItems.findIndex((item) => item.productId === productId)
      if (index !== -1) {
        this.cartItems.splice(index, 1)
      }
    },

    // Process checkout
    async checkout(cartItems) {
      try {
        // Process each item in the cart
        const promises = cartItems.map(async (item) => {
          const product = this.productList.find((p) => p.productId === item.id)
          if (!product) return
          
          const firebaseKey = product.firebaseKey
          
          if (item.selectedColor) {
            // Handle color-specific stock
            if (product.stockByColor?.[item.selectedColor] >= item.quantity) {
              const newStock = product.stockByColor[item.selectedColor] - item.quantity
              const unitsSoldByColor = { ...(product.unitsSoldByColor || {}) }
              unitsSoldByColor[item.selectedColor] = (unitsSoldByColor[item.selectedColor] || 0) + item.quantity
              
              const totalUnitsSold = Object.values(unitsSoldByColor).reduce((a, b) => a + b, 0)
              
              const updates = {}
              updates[`stockByColor/${item.selectedColor}`] = newStock
              updates.unitsSoldByColor = unitsSoldByColor
              updates.unitsSold = totalUnitsSold
              updates.updatedAt = new Date().toISOString()
              
              const productRef = ref(db, `products/${firebaseKey}`)
              await update(productRef, updates)
            }
          } else {
            // Handle regular stock
            if (product.stock >= item.quantity) {
              const productRef = ref(db, `products/${firebaseKey}`)
              await update(productRef, {
                stock: product.stock - item.quantity,
                unitsSold: (product.unitsSold || 0) + item.quantity,
                updatedAt: new Date().toISOString()
              })
            }
          }
        })
        
        await Promise.all(promises)
      } catch (error) {
        console.error('Error processing checkout:', error)
        throw error
      }
    },

    // Save to localStorage - kept for backward compatibility but not used with Firebase
    saveToLocalStorage() {
      // Do nothing as we're using Firebase
      return
    }
  },

  getters: {
    productsByCategory: (state) => {
      return (category) => state.productList.filter((p) => p.category === category)
    },
    productById: (state) => {
      return (id) => state.productList.find((p) => p.productId === id)
    }
  },
})
