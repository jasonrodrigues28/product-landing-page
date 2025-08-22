import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useSellerStore = defineStore('seller', {
  state: () => {
    // Load initial state from localStorage if available
    const savedState = localStorage.getItem('sellerStore')
    const defaultState = {
      // Store seller-specific product counters and available IDs
      // { sellerId: { currentProductId, highestUsedId, availableIds } }
      sellerProductCounters: {},
    }

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        
        // Convert availableIds arrays back to Sets
        const sellerProductCounters = {}
        
        for (const [sellerId, data] of Object.entries(parsed.sellerProductCounters || {})) {
          sellerProductCounters[sellerId] = {
            ...data,
            availableIds: new Set(data.availableIds || [])
          }
        }
        
        return {
          sellerProductCounters
        }
      } catch (error) {
        console.error('Error parsing sellerStore data:', error)
        return defaultState
      }
    }
    
    return defaultState
  },
  
  actions: {
    // Save state to localStorage
    saveToLocalStorage() {
      // Convert Sets to arrays for JSON serialization
      const stateToSave = {
        sellerProductCounters: {}
      }
      
      for (const [sellerId, data] of Object.entries(this.sellerProductCounters)) {
        stateToSave.sellerProductCounters[sellerId] = {
          ...data,
          availableIds: Array.from(data.availableIds || new Set())
        }
      }
      
      localStorage.setItem('sellerStore', JSON.stringify(stateToSave))
    },
    
    // Get the current seller's ID (email)
    getCurrentSellerId() {
      const userStore = useUserStore()
      return userStore.email
    },
    
    // Get initials from a name
    getInitialsFromName(name) {
      if (!name) return 'XX'
      
      // Split by spaces and get first letters
      const parts = name.split(' ')
      
      if (parts.length === 1) {
        // If single word, use first two letters
        return name.substring(0, 2).toUpperCase()
      }
      
      // Get first letter of first and last parts
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    },
    
    // Initialize or get a seller's product counter
    getSellerProductCounter(sellerId, sellerName) {
      // Initialize if not exists
      if (!this.sellerProductCounters[sellerId]) {
        this.sellerProductCounters[sellerId] = {
          currentProductId: 1,
          highestUsedId: 0,
          availableIds: new Set(),
          sellerInitials: this.getInitialsFromName(sellerName)
        }
        this.saveToLocalStorage()
      }
      
      return this.sellerProductCounters[sellerId]
    },
    
    // Generate a new product ID for a seller
    generateProductId() {
      const userStore = useUserStore()
      const sellerId = userStore.email
      const sellerName = userStore.username
      
      // Get or initialize the seller's counter
      const sellerCounter = this.getSellerProductCounter(sellerId, sellerName)
      
      // Generate a seller-specific product ID
      let nextId
      const sellerInitials = sellerCounter.sellerInitials
      
      if (sellerCounter.availableIds.size > 0) {
        // Use the lowest available ID from deleted products
        nextId = Math.min(...Array.from(sellerCounter.availableIds))
        sellerCounter.availableIds.delete(nextId)
      } else {
        // Use the next sequential ID
        nextId = sellerCounter.currentProductId
        sellerCounter.currentProductId = nextId + 1
      }
      
      // Update highest used ID if necessary
      if (nextId > sellerCounter.highestUsedId) {
        sellerCounter.highestUsedId = nextId
      }
      
      this.saveToLocalStorage()
      
      return `${sellerInitials}-${nextId}`
    },
    
    // Handle product deletion (make ID available for reuse)
    handleProductDeletion(productId) {
      const userStore = useUserStore()
      const sellerId = userStore.email
      
      // Get seller counter (should already exist)
      const sellerCounter = this.sellerProductCounters[sellerId]
      if (!sellerCounter) return
      
      // Extract numeric part of the ID
      const productIdParts = productId.split('-')
      if (productIdParts.length < 2) return
      
      const numericId = parseInt(productIdParts[1])
      if (isNaN(numericId)) return
      
      // Add the ID to available IDs for reuse
      sellerCounter.availableIds.add(numericId)
      
      // If we have no products left, reset everything
      // (Note: This would typically be handled elsewhere by checking product count)
      
      // Update currentProductId to be the lowest available ID
      if (sellerCounter.availableIds.size > 0) {
        const lowestAvailable = Math.min(...Array.from(sellerCounter.availableIds))
        if (lowestAvailable < sellerCounter.currentProductId) {
          sellerCounter.currentProductId = lowestAvailable
        }
      }
      
      this.saveToLocalStorage()
    },
    
    // Handle multiple product deletions
    handleMultipleProductDeletions(productIds) {
      productIds.forEach(productId => {
        this.handleProductDeletion(productId)
      })
    },
    
    // Track a product ID that was used by this seller
    trackProductId(productId) {
      const userStore = useUserStore();
      const sellerId = userStore.email;
      const sellerName = userStore.username;
      
      // Extract the initials and numeric part of the ID
      const productIdParts = productId.split('-');
      if (productIdParts.length < 2) return;
      
      const initials = productIdParts[0];
      const numericId = parseInt(productIdParts[1]);
      if (isNaN(numericId)) return;
      
      // Get or initialize the seller's counter
      const sellerCounter = this.getSellerProductCounter(sellerId, sellerName);
      
      // Update the sellerInitials if they're not set yet
      if (!sellerCounter.sellerInitials) {
        sellerCounter.sellerInitials = initials;
      }
      
      // Update the highest used ID if necessary
      if (numericId > sellerCounter.highestUsedId) {
        sellerCounter.highestUsedId = numericId;
        sellerCounter.currentProductId = sellerCounter.highestUsedId + 1;
      }
      
      // Remove from available IDs if it was there
      if (sellerCounter.availableIds.has(numericId)) {
        sellerCounter.availableIds.delete(numericId);
      }
      
      this.saveToLocalStorage();
    },
    
    // Initialize seller counters from existing products in productStore
    initializeFromProductStore() {
      const { useProductStore } = require('./productStore');
      const productStore = useProductStore();
      const userStore = useUserStore();
      
      if (!userStore.isAuthenticated) return;
      
      const sellerId = userStore.email;
      const sellerName = userStore.username;
      
      // Get products for this seller
      const sellerProducts = productStore.productList.filter(product => 
        product.sellerId === sellerId
      );
      
      // Initialize the counter with data from existing products
      if (sellerProducts.length > 0) {
        let highestId = 0;
        const usedIds = new Set();
        
        // Find the highest ID and track all used IDs
        sellerProducts.forEach(product => {
          const productIdParts = product.productId.split('-');
          if (productIdParts.length < 2) return;
          
          const numericId = parseInt(productIdParts[1]);
          if (isNaN(numericId)) return;
          
          usedIds.add(numericId);
          if (numericId > highestId) {
            highestId = numericId;
          }
        });
        
        // Get the seller's initials from the first product
        const firstProduct = sellerProducts[0];
        const firstIdParts = firstProduct.productId.split('-');
        const sellerInitials = firstIdParts[0] || this.getInitialsFromName(sellerName);
        
        // Update the seller's counter
        this.sellerProductCounters[sellerId] = {
          currentProductId: highestId + 1,
          highestUsedId: highestId,
          availableIds: new Set(),
          sellerInitials
        };
        
        this.saveToLocalStorage();
      } else {
        // No existing products, just initialize with default values
        this.getSellerProductCounter(sellerId, sellerName);
      }
    }
  }
})
