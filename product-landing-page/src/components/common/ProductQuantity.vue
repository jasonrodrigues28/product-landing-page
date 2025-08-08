<template>
  <div class="product-quantity">
    <div class="row items-center justify-between q-col-gutter-md">
      <div v-if="isSeller" class="col-12">
        <q-input
          v-model.number="stock"
          type="number"
          dense
          outlined
          label="Stock"
          :rules="[
            val => val >= 0 || 'Stock cannot be negative',
            val => val >= unitsSold || 'Stock cannot be less than units sold'
          ]"
          @update:model-value="updateStock"
        />
        <div class="row q-mt-sm items-center justify-between">
          <q-chip
            :color="stock === 0 ? 'negative' : stock <= 5 ? 'warning' : 'positive'"
            text-color="white"
            size="sm"
          >
            {{ stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock' }}
          </q-chip>
          <div class="text-caption">
            Units Sold: {{ unitsSold }}
          </div>
        </div>
      </div>
      <div v-else class="col-12">
        <div class="text-subtitle2">
          Available: 
          <q-chip
            :color="stock === 0 ? 'negative' : stock <= 5 ? 'warning' : 'positive'"
            text-color="white"
            size="sm"
          >
            {{ stock }}
          </q-chip>
        </div>
      </div>

      <div v-if="!isSeller" class="row items-center q-gutter-x-sm">
        <q-btn
          flat
          round
          color="primary"
          icon="remove"
          :disable="quantity <= 1"
          @click="updateQuantity(-1)"
        />
        <span class="text-h6">{{ quantity }}</span>
        <q-btn
          flat
          round
          color="primary"
          icon="add"
          :disable="quantity >= stock"
          @click="updateQuantity(1)"
        />
        <q-btn
          color="primary"
          label="Add to Cart"
          :disable="stock === 0"
          @click="addToCart"
        />
      </div>
    </div>

    <q-linear-progress
      :value="progressValue"
      class="q-mt-sm"
      :color="progressColor"
      size="10px"
    />
  </div>
</template>

<script>
import { useProductStore } from '../../stores/productStore';

export default {
  name: 'ProductQuantity',
  props: {
    productId: {
      type: String,
      required: true
    },
    isSeller: {
      type: Boolean,
      default: false
    },
    initialStock: {
      type: Number,
      default: 50
    },
    selectedColor: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      stock: this.initialStock,
      unitsSold: 0,
      quantity: 1
    };
  },
  computed: {
    progressValue() {
      const total = this.initialStock || 50; // Use initial stock as total capacity
      if (this.stock === 0) return 1;
      return (total - this.stock) / total;
    },
    progressColor() {
      if (this.stock === 0) return 'negative';
      if (this.stock <= 5) return 'warning';
      return 'positive';
    },
    stockStatus() {
      if (this.stock === 0) return 'Out of Stock';
      if (this.stock <= 5) return 'Low Stock';
      return 'In Stock';
    }
  },
  created() {
    this.updateFromStore();
  },
  
  methods: {
    updateFromStore() {
      const store = useProductStore();
      const product = store.productList.find(p => p.productId === this.productId);
      if (product) {
        this.unitsSold = product.unitsSold || 0;
        
        // Get color-specific stock
        if (product.stockByColor && this.selectedColor) {
          this.stock = product.stockByColor[this.selectedColor] ?? this.initialStock;
        } else if (product.stockByColor && product.colorVariants?.length === 1) {
          // If there's only one color variant
          this.stock = product.stockByColor[product.colorVariants[0]] ?? this.initialStock;
        } else {
          this.stock = product.stock ?? this.initialStock;
        }
      }
    },
    
    updateStock(newStock) {
      if (newStock >= this.unitsSold) {
        const store = useProductStore();
        store.updateProductStock(this.productId, newStock, this.selectedColor);
        this.updateFromStore(); // Refresh from store to ensure consistency
        this.$emit('stock-updated', this.productId, newStock, this.selectedColor);
      }
    },
    updateQuantity(change) {
      const newQuantity = this.quantity + change;
      if (newQuantity >= 1 && newQuantity <= this.stock) {
        this.quantity = newQuantity;
      }
    },
    addToCart() {
      if (this.stock >= this.quantity) {
        // We'll handle stock updates in the parent component
        this.$emit('added-to-cart', this.quantity);
        
        // Only update the displayed stock
        this.stock -= this.quantity;
        
        this.$q.notify({
          type: 'positive',
          message: `Added ${this.quantity} unit(s) to cart`,
          position: 'top'
        });
        
        this.quantity = 1; // Reset quantity
      }
    }
  },
  watch: {
    selectedColor: {
      handler() {
        this.updateFromStore();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.product-quantity {
  min-width: 200px;
}
</style> 
