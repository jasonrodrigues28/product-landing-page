<template>
    <q-page class="q-pa-md">
        <div class="text-h5 q-mb-md">Available Products</div>

        <!-- Search and Filter Section -->
        <div class="row q-mb-md">
            <div class="col-12 col-md-4">
                <q-input
                    v-model="searchText"
                    label="Search products"
                    dense
                    outlined
                    clearable
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-4 q-pl-md">
                <q-select
                    v-model="selectedCategory"
                    :options="categories"
                    label="Filter by category"
                    dense
                    outlined
                    clearable
                    options-dense
                />
            </div>
        </div>

        <!-- Products Grid -->
        <div class="row q-col-gutter-md">
            <div v-for="product in filteredProducts" 
                 :key="product.productId" 
                 class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
                <q-card class="product-card">
                    <div class="product-image">
                        <template v-if="product.imagePaths && Object.keys(product.imagePaths).length > 0">
                            <img :src="product.imagePaths[selectedColors[product.productId] || product.colorVariants[0]]" 
                                 :alt="product.name">
                        </template>
                        <div v-else class="no-image">
                            <q-icon name="image" size="50px" color="grey-5" />
                        </div>
                    </div>
                    
                    <q-card-section class="bg-grey-2">
                        <div class="row items-center q-mt-sm">
                            <div class="col">
                                <div class="text-h6">{{ product.name }}</div>
                                <div class="text-subtitle2">{{ product.category }}</div>
                            </div>
                        </div>
                        <!-- Color variants -->
                        <div v-if="product.colorVariants && product.colorVariants.length > 0" 
                             class="row items-center q-mt-sm">
                            <q-btn-toggle
                                v-model="selectedColors[product.productId]"
                                :options="product.colorVariants.map(color => ({
                                    label: color,
                                    value: color,
                                    disable: !product.imagePaths[color]
                                }))"
                                flat
                                dense
                                spread
                                no-caps
                                class="full-width"
                                @update:model-value="updateProductColor(product.productId)"
                            />
                        </div>
                    </q-card-section>                    <q-card-section>
                        <div class="text-grey-8">{{ product.description }}</div>
                        
                        <div class="row justify-between items-center q-mt-md">
                            <div>
                                <div class="text-subtitle1" :class="{'text-strike': product.hasDiscount}">
                                    ₹{{ product.originalPrice }}
                                </div>
                                <div v-if="product.hasDiscount" class="text-positive text-weight-bold">
                                    ₹{{ product.finalPrice }}
                                    <span class="text-grey text-caption q-ml-sm">
                                        (-{{ product.discountPercent }}%)
                                    </span>
                                </div>
                            </div>
                            
                            <q-chip 
                                v-if="product.hasDiscount" 
                                color="negative" 
                                text-color="white"
                                size="sm"
                            >
                                SALE
                            </q-chip>
                        </div>

                        <div class="q-mt-md">
                            <ProductQuantity
                                :key="`${product.productId}-${selectedColors[product.productId] || product.colorVariants[0]}`"
                                :product-id="product.productId"
                                :initial-stock="product.stockByColor ? product.stockByColor[selectedColors[product.productId] || product.colorVariants[0]] : product.stock"
                                :is-seller="false"
                                :selected-color="selectedColors[product.productId] || product.colorVariants[0]"
                                @added-to-cart="handleAddToCart($event, product)"
                            />
                        </div>
                    </q-card-section>

                    <q-card-section v-if="product.colorVariants && product.colorVariants.length">
                        <div class="text-caption q-mb-xs">Available Colors:</div>
                        <div class="row items-center">
                            <q-chip 
                                v-for="color in product.colorVariants" 
                                :key="color"
                                size="sm"
                                dense
                            >
                                {{ color }}
                            </q-chip>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right" v-if="false">
                        <!-- Hidden since we're using ProductQuantity component -->
                        <q-btn 
                            label="Add to Cart" 
                            color="primary" 
                            @click="addToCart(product)"
                            :loading="addingToCart === product.productId"
                        />
                    </q-card-actions>
                </q-card>
            </div>

            <!-- Empty State -->
            <div v-if="filteredProducts.length === 0" class="col-12 text-center q-pa-xl">
                <q-icon name="sentiment_dissatisfied" size="50px" color="grey-5" />
                <div class="text-h6 text-grey-6 q-mt-md">No products found</div>
                <div class="text-grey-5">Try adjusting your search or filters</div>
            </div>
        </div>
    </q-page>
</template>

<script>
import { useCartStore } from "../stores/cart";
import { useProductStore } from "../stores/productStore";
import ProductQuantity from "../components/common/ProductQuantity.vue";

export default {
    name: "BuyerDashboard",
    components: {
        ProductQuantity
    },

    data() {
        return {
            cartStore: useCartStore(),
            productStore: useProductStore(),
            searchText: '',
            selectedCategory: null,
            addingToCart: null,
            selectedColors: {} // Tracks selected color for each product
        };
    },

    computed: {
        categories() {
            // Get unique categories from products
            const categoriesSet = new Set(this.productStore.productList.map(p => p.category));
            return Array.from(categoriesSet);
        },
        filteredProducts() {
            let products = this.productStore.productList;

            // Apply search filter
            if (this.searchText) {
                const searchLower = this.searchText.toLowerCase();
                products = products.filter(p => 
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower)
                );
            }

            // Apply category filter
            if (this.selectedCategory) {
                products = products.filter(p => p.category === this.selectedCategory);
            }

            return products;
        }
    },

    methods: {
        getProductImage(product) {
            if (!product.imagePaths || Object.keys(product.imagePaths).length === 0) {
                return null;
            }
            // Get the first available image
            const firstColor = Object.keys(product.imagePaths)[0];
            return product.imagePaths[firstColor];
        },
    async handleAddToCart(quantity, product) {
      this.addingToCart = product.productId;
      try {
        const selectedColor = this.selectedColors[product.productId] || product.colorVariants[0];
        const currentStock = product.stockByColor?.[selectedColor] || product.stock;
        
        // Check if enough stock is available
        if (currentStock < quantity) {
          throw new Error('Not enough stock available');
        }
        
        const cartItem = {
          id: product.productId,
          title: product.name,
          price: product.hasDiscount ? product.finalPrice : product.originalPrice,
          originalPrice: product.originalPrice,
          description: product.description,
          selectedColor: selectedColor,
          image: product.imagePaths[selectedColor],
          quantity: quantity,
          stockByColor: product.stockByColor // Include stock information
        };
        
        // Add to cart without updating stock
        await this.cartStore.addToCart(cartItem);
        
        this.$q.notify({
          type: 'positive',
          message: `Added ${quantity} ${product.name} to cart`,
          position: 'top'
        });
      } catch (err) {
        console.error('Failed to add to cart:', err);
        this.$q.notify({
          type: "negative",
          message: `Failed to add product to cart: ${err.message}`,
          position: 'top'
        });
      } finally {
        this.addingToCart = null;
      }
    },
        
    // Legacy method kept for reference
    async addToCart(product) {
      await this.handleAddToCart(1, product);
    },
    
    // Update ProductQuantity when color changes
    updateProductColor() {
      // Force ProductQuantity component to re-render by creating a key
      this.$nextTick(() => {
        // This will trigger reactivity
        this.$forceUpdate();
      });
    }
    }
};
</script>

<style scoped>
.product-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.text-strike {
    text-decoration: line-through;
    color: #666;
}

.product-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.product-image {
    position: relative;
    width: 100%;
    padding-top: 75%; /* 4:3 Aspect Ratio */
    background-color: #f5f5f5;
    border-radius: 4px 4px 0 0;
    overflow: hidden;
}

.product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* This will cover the area without distortion */
    transition: transform 0.3s ease;
}

.product-image:hover img {
    transform: scale(1.05); /* Slight zoom on hover */
}

.no-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

/* Ensure card sections have proper spacing */
.q-card__section {
    padding: 16px;
}

/* Add some spacing between elements */
.text-h6 {
    margin-bottom: 4px;
    font-size: 1.1rem;
}

.text-subtitle2 {
    color: #666;
    font-size: 0.9rem;
}
</style>