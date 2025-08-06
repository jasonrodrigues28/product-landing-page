import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
  state: () => {
    // Load initial state from localStorage if available
    const savedState = localStorage.getItem('productStore');
    const defaultState = {
      sellerInitials: 'SUY',
      productList: [],
      currentProductId: 1,
      highestUsedId: 0,
      availableIds: new Set()
    };

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const availableIds = new Set(parsed.availableIds || []);
        
        // If there are no products, reset everything
        if (!parsed.productList || parsed.productList.length === 0) {
          return defaultState;
        }

        // Calculate the actual highest ID from existing products
        const usedIds = parsed.productList.map(p => parseInt(p.productId.split('-')[1]) || 0);
        const highestId = Math.max(...usedIds, 0);
        
        // Reset currentProductId if it's too high
        let nextId = highestId + 1;
        
        // If we have available IDs that are lower than nextId, use the lowest one
        if (availableIds.size > 0) {
          const lowestAvailable = Math.min(...Array.from(availableIds));
          if (lowestAvailable < nextId) {
            nextId = lowestAvailable;
          }
        }
        
        return {
          ...parsed,
          availableIds,
          highestUsedId: highestId,
          currentProductId: nextId
        };
      } catch (error) {
        console.error('Error parsing stored data:', error);
        return defaultState;
      }
    }

    return defaultState;
  },
  actions: {
    getNextProductId() {
      // Always check available IDs first
      if (this.availableIds.size > 0) {
        const sortedIds = Array.from(this.availableIds).sort((a, b) => a - b);
        const reusedId = sortedIds[0];
        return `${this.sellerInitials}-${reusedId}`;
      }
      
      // Use the next sequential ID
      return `${this.sellerInitials}-${this.currentProductId}`;
    },
    generateProductId() {
      return this.getNextProductId();
    },
    saveToLocalStorage() {
      // Convert state to JSON-friendly format
      const stateToSave = {
        ...this.$state,
        availableIds: Array.from(this.availableIds) // Convert Set to Array for JSON storage
      };
      localStorage.setItem('productStore', JSON.stringify(stateToSave));
    },
    addProduct(product) {
      try {
        const timestamp = new Date().toISOString();
        
        // First, determine the ID to use
        let nextId;
        if (this.availableIds.size > 0) {
          // Use the lowest available ID from deleted products
          nextId = Math.min(...Array.from(this.availableIds));
          this.availableIds.delete(nextId);
        } else {
          // Use the current counter
          nextId = this.currentProductId;
          this.currentProductId = nextId + 1;
        }
        
        // Create the product with the determined ID
        const newProduct = {
          ...product,
          productId: `${this.sellerInitials}-${nextId}`,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        // Update the highest used ID if necessary
        if (nextId > this.highestUsedId) {
          this.highestUsedId = nextId;
        }
        
        // Add the product to the list
        this.productList.push(newProduct);
        
        this.saveToLocalStorage();
        return true;
      } catch (error) {
        console.error('Error adding product:', error);
        return false;
      }
    },
    updateProduct(productId, updatedProduct) {
      const index = this.productList.findIndex(p => p.productId === productId);
      if (index !== -1) {
        const numericId = parseInt(updatedProduct.productId.split('-')[1]);
        if (numericId > this.highestUsedId) {
          this.highestUsedId = numericId;
          this.currentProductId = this.highestUsedId + 1;
        }
        
        this.productList[index] = {
          ...updatedProduct,
          createdAt: this.productList[index].createdAt, // Preserve original creation date
          updatedAt: new Date().toISOString() // Update the modification date
        };
        this.saveToLocalStorage();
      }
    },
    deleteProduct(productId) {
      const index = this.productList.findIndex(p => p.productId === productId);
      if (index !== -1) {
        // Extract the numeric part of the ID
        const numericId = parseInt(productId.split('-')[1]);
        
        // Add the ID to available IDs for reuse
        this.availableIds.add(numericId);
        
        // Remove the product
        this.productList.splice(index, 1);
        
        // If we have no products left, reset everything
        if (this.productList.length === 0) {
          this.currentProductId = 1;
          this.highestUsedId = 0;
          this.availableIds.clear();
        } else {
          // Update currentProductId to be the lowest available ID
          const lowestAvailable = Math.min(...Array.from(this.availableIds));
          if (lowestAvailable < this.currentProductId) {
            this.currentProductId = lowestAvailable;
          }
        }
        
        this.saveToLocalStorage();
      }
    },
    deleteMultipleProducts(productIds) {
      // Add all deleted IDs to available IDs
      productIds.forEach(productId => {
        const numericId = parseInt(productId.split('-')[1]);
        this.availableIds.add(numericId);
      });
      
      // Remove the products
      this.productList = this.productList.filter(p => !productIds.includes(p.productId));
      
      // If we have no products left, reset everything
      if (this.productList.length === 0) {
        this.currentProductId = 1;
        this.highestUsedId = 0;
        this.availableIds.clear();
      } else {
        // Update currentProductId to be the lowest available ID
        const lowestAvailable = Math.min(...Array.from(this.availableIds));
        if (lowestAvailable < this.currentProductId) {
          this.currentProductId = lowestAvailable;
        }
      }
      
      this.saveToLocalStorage();
    },
    resetProducts() {
      this.productList = [];
      this.currentProductId = 1;
      this.highestUsedId = 0;
      this.availableIds.clear();
      localStorage.removeItem('productStore'); // Completely clear the stored state
    }
  }
});