<template>
  <div class="product-info q-pa-md">
    <h1 class="text-h4 q-mb-xs">{{ product.name }}</h1>
    
    <!-- Category -->
    <div class="text-subtitle1 text-grey-6 q-mb-md">{{ product.category }}</div>
    
    <!-- Rating summary if any -->
    <div class="row items-center q-mb-md" v-if="hasReviews">
      <div class="rating-stars q-mr-sm">
        <q-rating
          size="1.5em"
          :model-value="averageRating"
          :max="5"
          color="amber"
          icon="star"
          icon-selected="star"
          icon-half="star_half"
          readonly
        />
      </div>
      <div class="text-subtitle2">
        {{ averageRating.toFixed(1) }} ({{ reviewCount }} reviews)
      </div>
    </div>
    
    <!-- Price information -->
    <div class="pricing q-mb-md">
      <div class="row items-end">
        <div class="text-h5 text-weight-bold" :class="{ 'text-strike': product.hasDiscount }">
          ₹{{ product.originalPrice }}
        </div>
        
        <div v-if="product.hasDiscount" class="text-h4 text-positive q-ml-md">
          ₹{{ product.finalPrice }}
        </div>
        
        <div v-if="product.hasDiscount" class="discount-badge q-ml-md">
          -{{ product.discountPercent }}%
        </div>
      </div>
    </div>
    
    <!-- Description -->
    <div class="description q-mb-lg text-grey-4">
      {{ product.description }}
    </div>
    
    <!-- Color availability -->
    <div v-if="product.colorVariants && product.colorVariants.length" class="color-availability q-mb-md">
      <div class="text-subtitle2 q-mb-xs">Available Colors:</div>
      <div class="row q-col-gutter-sm">
        <div v-for="color in product.colorVariants" :key="color" class="col-auto">
          <q-chip
            :label="color"
            :color="getColorClass(color)"
            text-color="white"
            size="sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Stock information -->
    <div class="stock-info q-mb-md">
      <div class="text-subtitle2">
        Stock Status:
        <span v-if="getTotalStock > 10" class="text-positive">In Stock</span>
        <span v-else-if="getTotalStock > 0" class="text-warning">Low Stock</span>
        <span v-else class="text-negative">Out of Stock</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useReviewStore } from 'src/stores/reviewStore'

export default {
  name: 'ProductInfo',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      reviewStore: useReviewStore()
    }
  },
  
  computed: {
    // Calculate total stock across all colors
    getTotalStock() {
      if (!this.product) return 0
      
      if (this.product.stockByColor) {
        return Object.values(this.product.stockByColor).reduce((sum, stock) => sum + stock, 0)
      }
      
      return this.product.stock || 0
    },
    
    // Review information
    averageRating() {
      return this.reviewStore.averageRating(this.product.productId) || 0
    },
    
    reviewCount() {
      return this.reviewStore.reviewCount(this.product.productId) || 0
    },
    
    hasReviews() {
      return this.reviewCount > 0
    }
  },
  
  methods: {
    // Assign color classes
    getColorClass(colorName) {
      const colorMap = {
        red: 'red',
        blue: 'blue',
        green: 'green',
        black: 'black',
        white: 'grey-5',
        yellow: 'yellow',
        purple: 'purple',
        pink: 'pink',
        orange: 'orange',
        grey: 'grey',
        brown: 'brown'
      }
      
      return colorMap[colorName.toLowerCase()] || 'grey'
    }
  }
}
</script>

<style scoped>
.product-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-strike {
  text-decoration: line-through;
  color: #999;
}

.discount-badge {
  background: #f44336;
  color: white;
  border-radius: 4px;
  padding: 2px 8px;
  font-weight: bold;
  font-size: 14px;
}
</style>
