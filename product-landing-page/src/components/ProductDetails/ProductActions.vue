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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

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
  setup(props, { emit }) {
    const $q = useQuasar()
    const router = useRouter()
    const quantity = ref(1)
    const selectedColor = ref(props.product.colorVariants?.[0] || null)
    const isAdding = ref(false)
    
    // Get stock for selected color
    const getStockForSelectedColor = computed(() => {
      if (!props.product) return 0
      
      if (selectedColor.value && props.product.stockByColor) {
        return props.product.stockByColor[selectedColor.value] || 0
      }
      
      return props.product.stock || 0
    })
    
    // Max quantity that can be added
    const maxQuantity = computed(() => {
      return Math.min(10, getStockForSelectedColor.value) // Limit to 10 or available stock
    })
    
    // Format color options for q-option-group
    const colorOptions = computed(() => {
      if (!props.product.colorVariants) return []
      
      return props.product.colorVariants.map(color => ({
        label: color,
        value: color
      }))
    })
    
    // Calculate total price
    const totalPrice = computed(() => {
      if (!props.product) return 0
      
      const price = props.product.hasDiscount ? 
        props.product.finalPrice : 
        props.product.originalPrice
        
      return (price * quantity.value).toFixed(2)
    })
    
    // Check if we can add to cart
    const canAddToCart = computed(() => {
      return quantity.value > 0 && quantity.value <= maxQuantity.value
    })
    
    // Quantity control
    const incrementQuantity = () => {
      if (quantity.value < maxQuantity.value) {
        quantity.value++
      }
    }
    
    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }
    
    const validateQuantity = () => {
      if (!quantity.value || quantity.value < 1) {
        quantity.value = 1
      } else if (quantity.value > maxQuantity.value) {
        quantity.value = maxQuantity.value
      }
    }
    
    // Add to cart
    const addToCart = async () => {
      if (!canAddToCart.value) return
      
      isAdding.value = true
      
      try {
        emit('add-to-cart', quantity.value, selectedColor.value)
        
        $q.notify({
          type: 'positive',
          message: `Added ${quantity.value} item(s) to cart`,
          position: 'top'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Failed to add to cart: ${error.message}`,
          position: 'top'
        })
      } finally {
        isAdding.value = false
      }
    }
    
    // Buy now
    const buyNow = () => {
      addToCart()
      router.push('/cart')
    }
    
    // Reset quantity when product or color changes
    watch([() => props.product, selectedColor], () => {
      quantity.value = 1
    })
    
    return {
      quantity,
      selectedColor,
      isAdding,
      maxQuantity,
      colorOptions,
      totalPrice,
      canAddToCart,
      incrementQuantity,
      decrementQuantity,
      validateQuantity,
      addToCart,
      buyNow
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
