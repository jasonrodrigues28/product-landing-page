<template>
    <q-page class="q-pa-md buyer-dashboard-page">
        <div class="text-h5 q-mb-md">Available Products</div>

        <!-- Search and Filter Section -->
        <div class="row q-mb-md search-filter">
            <div class="col-12 col-md-4">
                <q-input
                    v-model="searchText"
                    label="Search products"
                    dense
                    outlined
                    clearable
                    class="white-input"
                >
                    <template v-slot:append>
                        <q-icon name="search" color="white" />
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
                    class="white-input"
                />
            </div>
        </div>

        <!-- Products Grid -->
        <div class="row q-col-gutter-md">
            <div v-for="product in filteredProducts" 
                 :key="product.productId" 
                 class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
                <q-card class="product-card product-card-dark">
                    <div class="product-image product-img-dark">
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
                                :style="chipStyle(color)"
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
import { useProductStore } from "../stores/productStore";
import ProductQuantity from "../components/common/ProductQuantity.vue";

export default {
    name: "BuyerDashboard",
    components: {
        ProductQuantity
    },

    data() {
        return {
            productStore: useProductStore(),
            searchText: "",
            selectedCategory: null,
            selectedColors: {}
        };
    },
    computed: {
        categories() {
            const categoriesSet = new Set(this.productStore.productList.map(p => p.category));
            return Array.from(categoriesSet);
        },
        filteredProducts() {
            let products = this.productStore.productList;
            if (this.searchText) {
                const searchLower = this.searchText.toLowerCase();
                products = products.filter(p => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower));
            }
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
        chipStyle(color) {
            const c = (color || '').trim();
            const cssColor = c.toLowerCase();
            const lightColors = ['yellow','white','lightyellow','lightgray','lightgrey','pink','lime','cyan','aqua','beige','ivory','khaki','mintcream','azure','lemonchiffon','honeydew','aliceblue'];
            const isLight = lightColors.includes(cssColor);
            return {
                backgroundColor: cssColor,
                color: isLight ? '#000' : '#fff',
                textTransform: 'capitalize',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.15)'
            };
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
.white-input .q-field__label,
.white-input .q-field__native,
.white-input .q-field__control,
.white-input input,
.white-input .q-select__dropdown-icon {
    color: #fff !important;
}

.buyer-dashboard-page {
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(40, 44, 52, 1), rgba(15, 17, 20, 1));
    color: white;
}

.product-card-dark {
    background: rgba(30, 32, 38, 0.9);
    border-radius: 14px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card-dark:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
}

.product-img-dark {
    border-radius: 12px;
    background: #222;
}

.text-primary {
    color: #00b4d8 !important;
}

.text-h6 {
    font-size: 1.1rem;
    font-weight: 600;
}

.text-subtitle2 {
    color: #b0b0b0;
    font-size: 0.9rem;
}

/* Added dark theme and input styling */
.white-input .q-field__label,
.white-input .q-field__native,
.white-input .q-field__control,
.white-input input,
.white-input .q-select__dropdown-icon {
    color: #fff !important;
}

.buyer-dashboard-page {
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(40, 44, 52, 1), rgba(15, 17, 20, 1));
    color: white;
}

.product-card-dark {
    background: rgba(30, 32, 38, 0.9);
    border-radius: 14px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card-dark:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
}

.product-img-dark {
    border-radius: 12px;
    background: #222;
}

.text-primary {
    color: #00b4d8 !important;
}

.text-h6 {
    font-size: 1.1rem;
    font-weight: 600;
}

.text-subtitle2 {
    color: #b0b0b0;
    font-size: 0.9rem;
}

.search-filter {
    background: rgba(30, 32, 38, 0.7);
    padding: 12px;
    border-radius: 10px;
    backdrop-filter: blur(4px);
}

.no-image {
    min-height: 200px;
}

/* Improve contrast for product info section that used bg-grey-2 */
.product-card-dark .bg-grey-2 {
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(2px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.product-card-dark .bg-grey-2 .text-h6 {
    color: #ffffff;
}

.product-card-dark .bg-grey-2 .text-subtitle2 {
    color: #cbd5e1; /* Light slate */
}

/* Color toggle buttons readability */
.product-card-dark :deep(.q-btn-group .q-btn) {
    color: #e5e5e5;
    font-weight: 500;
}

.product-card-dark :deep(.q-btn-group .q-btn.q-btn--active) {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
}

/* --- Enhanced Search / Filter Bar Styling --- */
.search-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px; /* row gap / column gap */
    align-items: stretch;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 4px 14px -4px rgba(0,0,0,0.55);
}

/* Make both fields visually consistent */
.search-filter .white-input { flex: 1 1 260px; }

/* Base control look */
.white-input :deep(.q-field__control) {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 10px;
    transition: border-color .25s ease, background .25s ease, box-shadow .25s ease;
    min-height: 46px;
}

/* Input / placeholder / label / icon colors */
.white-input :deep(.q-field__native),
.white-input :deep(.q-field__native::placeholder),
.white-input :deep(.q-field__label),
.white-input :deep(.q-select__dropdown-icon),
.white-input :deep(.q-icon) {
    color: #eef4ff !important;
}

.white-input :deep(.q-field__native::placeholder) { opacity: .55; }

/* Focus state */
.white-input.q-field--focused :deep(.q-field__control),
:deep(.white-input.q-field--focused .q-field__control) {
    background: rgba(0,180,216,0.18);
    border-color: #00b4d8;
    box-shadow: 0 0 0 2px rgba(0,180,216,0.35);
}

/* Hover subtle lift */
.white-input :deep(.q-field__control:hover) {
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.30);
}

/* Dense mode internal padding tweak */
.white-input :deep(.q-field__control-container) { padding-top: 4px; }

/* Remove default outline artifact in dark theme */
.white-input :deep(.q-field__control:before),
.white-input :deep(.q-field__control:after) { display:none; }
</style>