<template>
  <q-page class="product-details-page q-pa-md">
    <!-- Loading state -->
    <div v-if="loading" class="full-width flex flex-center q-py-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error state -->
    <q-card v-else-if="error" class="q-pa-md text-center">
      <q-icon name="error" color="negative" size="3em" />
      <div class="text-h6 q-mt-md">{{error}}</div>
      <q-btn label="Back to Products" color="primary" to="/buyer" class="q-mt-md" />
    </q-card>

    <!-- Product found -->
    <template v-else>
      <!-- Breadcrumbs and Back Button -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-grey">
          <router-link to="/buyer" class="text-grey">Products</router-link> 
          <q-icon name="chevron_right" size="1em" class="q-px-xs" />
          <span>{{product.category}}</span>
          <q-icon name="chevron_right" size="1em" class="q-px-xs" />
          <span>{{product.name}}</span>
        </div>
        <q-btn
          icon="arrow_back"
          label="Back to Products"
          flat
          color="primary"
          to="/buyer"
          class="q-mr-sm"
        />
      </div>

      <!-- Product content goes here (gallery, info, actions) -->
      <div class="row q-col-gutter-lg">
        <!-- Left: Gallery component -->
        <div class="col-12 col-md-6">
          <ProductGallery 
            :images="productImages" 
            :config="config.gallery"
          />
        </div>

        <!-- Right: Product info -->
        <div class="col-12 col-md-6">
          <ProductInfo :product="product" />
          <ProductActions 
            :product="product" 
            :config="config.ui"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>

      <!-- Reviews section -->
      <div class="q-mt-xl">
        <h2 class="text-h5">{{config.ui.sections.reviews}}</h2>
        <ProductReview 
          :product-id="product.productId" 
          :config="config.ui.reviewForm"
          :allow-images="config.ui.allowReviewImages"
          :initially-open="true"
        />
      </div>
      
      <!-- Bottom back button -->
      <div class="text-center q-mt-xl q-mb-md">
        <q-btn
          icon="arrow_back"
          label="Back to Products"
          color="primary"
          to="/buyer"
          class="q-py-sm"
        />
      </div>
    </template>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from 'src/stores/productStore'
import { useCartStore } from 'src/stores/cart'
import productDetailsConfig from 'src/configs/productdetails.config.json'

// Import the components you'll create
import ProductGallery from 'src/components/ProductDetails/ProductGallery.vue'
import ProductInfo from 'src/components/ProductDetails/ProductInfo.vue'
import ProductActions from 'src/components/ProductDetails/ProductActions.vue'
import ProductReview from '../components/ProductDisplay/ProductReview/ProductReview.vue'
export default {
  name: 'ProductDetailsPage',
  components: {
    ProductGallery,
    ProductInfo,
    ProductActions,
    ProductReview,
    
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const productStore = useProductStore()
    const cartStore = useCartStore()
    
    const loading = ref(true)
    const error = ref(null)
    const config = ref(productDetailsConfig)
    
    // Get product from store based on ID
    const product = computed(() => {
      const found = productStore.productList.find(p => p.productId === props.id)
      return found || null
    })
    
    // Prepare images for gallery
    const productImages = computed(() => {
      if (!product.value) return []
      
      // If product has image paths for colors
      if (product.value.imagePaths && Object.keys(product.value.imagePaths).length) {
        return Object.entries(product.value.imagePaths).map(([color, url]) => ({
          url,
          color,
          alt: `${product.value.name} in ${color}`
        }))
      }
      
      // Fallback
      return [{
        url: '', // Default placeholder image
        color: '',
        alt: product.value.name
      }]
    })
    
    // Handle adding to cart
    const handleAddToCart = (quantity, color) => {
      if (!product.value) return
      
      const cartItem = {
        id: product.value.productId,
        title: product.value.name,
        price: product.value.hasDiscount ? product.value.finalPrice : product.value.originalPrice,
        image: color && product.value.imagePaths ? 
          product.value.imagePaths[color] : Object.values(product.value.imagePaths)[0],
        selectedColor: color || (product.value.colorVariants?.[0] || null),
        quantity,
        stockByColor: JSON.parse(JSON.stringify(product.value.stockByColor || {}))
      }
      
      cartStore.addToCart(cartItem)
      
      // Don't update product stock here - it should only be updated during checkout
    }
    
    onMounted(() => {
      // Validate product exists
      if (!product.value) {
        error.value = "Product not found"
      }
      loading.value = false
    })
    
    return {
      product,
      productImages,
      loading,
      error,
      config,
      handleAddToCart
    }
  }
}
</script>

<style scoped>
.product-details-page {
  background: radial-gradient(circle at top, rgba(40, 44, 52, 1), rgba(15, 17, 20, 1));
  min-height: 100vh;
  color: white;
}
</style>