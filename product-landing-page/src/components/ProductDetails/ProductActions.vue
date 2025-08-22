<template>
  <div class="product-actions q-pa-md">
    <!-- Color selection (if applicable) -->
    <div v-if="product.colorVariants?.length > 1" class="color-selection q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Select Color:</div>
      <q-option-group
        v-model="selectedColor"
        :options="colorOptions"
        type="radio"
        inline
        color="primary"
      />
    </div>
    
    <!-- Quantity selection -->
    <div class="quantity-selection q-mb-lg">
      <div class="text-subtitle2 q-mb-sm">Quantity:</div>
      <div class="row items-center">
        <q-btn icon="remove" round dense flat @click="decrementQuantity" :disable="quantity <= 1" />
        <q-input
          v-model.number="quantity"
          type="number"
          dense
          outlined
          class="q-mx-sm"
          style="width: 60px"
          :min="1"
          :max="maxQuantity"
          @update:model-value="validateQuantity"
        />
        <q-btn icon="add" round dense flat @click="incrementQuantity" :disable="quantity >= maxQuantity" />
        
        <div class="q-ml-md text-caption">
          {{ maxQuantity }} items available
        </div>
      </div>
    </div>
    
    <!-- Total price -->
    <div class="price-summary q-mb-lg">
      <div class="row items-baseline">
        <div class="text-subtitle1 q-mr-sm">Total:</div>
        <div class="text-h6 text-weight-bold">₹{{ totalPrice }}</div>
      </div>
    </div>
    
    <!-- Action buttons -->
    <div class="action-buttons">
      <q-btn 
        :label="config.buttons.addToCart"
        color="primary"
        class="full-width"
        size="lg"
        :disable="!canAddToCart"
        @click="addToCart"
        :loading="isAdding"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductActions',
  props: {
    product: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  
  emits: ['add-to-cart'],
  
  data() {
    return {
      quantity: 1,
      selectedColor: this.product.colorVariants?.[0] || null,
      isAdding: false
    }
  },
  
  computed: {
    // Get stock for selected color
    getStockForSelectedColor() {
      if (!this.product) return 0
      
      if (this.selectedColor && this.product.stockByColor) {
        return this.product.stockByColor[this.selectedColor] || 0
      }
      
      return this.product.stock || 0
    },
    
    // Max quantity that can be added
    maxQuantity() {
      return Math.min(10, this.getStockForSelectedColor) // Limit to 10 or available stock
    },
    
    // Format color options for q-option-group
    colorOptions() {
      if (!this.product.colorVariants) return []
      
      return this.product.colorVariants.map(color => ({
        label: color,
        value: color
      }))
    },
    
    // Calculate total price
    totalPrice() {
      if (!this.product) return 0
      
      const price = this.product.hasDiscount ? 
        this.product.finalPrice : 
        this.product.originalPrice
        
      return (price * this.quantity).toFixed(2)
    },
    
    // Check if we can add to cart
    canAddToCart() {
      return this.quantity > 0 && this.quantity <= this.maxQuantity
    }
  },
  
  methods: {
    // Quantity control
    incrementQuantity() {
      if (this.quantity < this.maxQuantity) {
        this.quantity++
      }
    },
    
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    
    validateQuantity() {
      if (!this.quantity || this.quantity < 1) {
        this.quantity = 1
      } else if (this.quantity > this.maxQuantity) {
        this.quantity = this.maxQuantity
      }
    },
    
    // Add to cart
    async addToCart() {
      if (!this.canAddToCart) return
      
      this.isAdding = true
      
      try {
        this.$emit('add-to-cart', this.quantity, this.selectedColor)
        
        this.$q.notify({
          type: 'positive',
          message: `Added ${this.quantity} item(s) to cart`,
          position: 'top'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to add to cart: ${error.message}`,
          position: 'top'
        })
      } finally {
        this.isAdding = false
      }
    },
    
    // Buy now
    buyNow() {
      this.addToCart()
      this.$router.push('/cart')
    }
  },
  
  watch: {
    // Reset quantity when product or color changes
    product: {
      handler() {
        this.quantity = 1
      },
      deep: true
    },
    
    selectedColor() {
      this.quantity = 1
    }
  }
}
</script>

<style scoped>
.product-actions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Custom styling for radio group */
:deep(.q-radio__inner) {
  font-size: 0.8em;
}
</style>
