<template>
    <q-page class="q-pa-md page-gradient">
        <div class="text-h5 q-mb-md text-primary">Available Products</div>

        <!-- Search and Filter Section -->
        <div class="row q-mb-md search-filter">
            <div class="col-12 col-md-4">
                <q-input v-model="searchText" label="Search products" dense outlined clearable>
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-4 q-pl-md">
                <q-select v-model="selectedCategory" :options="categories" label="Filter by category" dense outlined
                    clearable options-dense />
            </div>
        </div>

        <!-- Products Grid -->
        <div class="row q-col-gutter-md">
            <div v-for="product in filteredProducts" :key="product.productId" class="col-12 col-sm-6 col-md-4 col-lg-3">
                <q-card class="product-card">
                    <div class="product-image">
                        <template v-if="product.imagePaths && Object.keys(product.imagePaths).length > 0">
                            <img :src="product.imagePaths[selectedColors[product.productId] || product.colorVariants[0]]"
                                :alt="product.name" />
                        </template>
                        <div v-else class="no-image">
                            <q-icon name="image" size="50px" color="grey-5" />
                        </div>
                    </div>

                    <q-card-section>
                        <div class="row items-center q-mt-sm">
                            <div class="col">
                                <div class="text-h6">{{ product.name }}</div>
                                <div class="text-subtitle2">{{ product.category }}</div>
                            </div>
                        </div>

                        <!-- Color variants -->
                        <div v-if="product.colorVariants && product.colorVariants.length > 0"
                            class="row items-center q-mt-sm">
                            <q-btn-toggle v-model="selectedColors[product.productId]" :options="product.colorVariants.map(color => ({
                                label: color,
                                value: color,
                                disable: !product.imagePaths[color]
                            }))" flat dense spread no-caps class="full-width" />
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <div class="text-grey-8">{{ product.description }}</div>

                        <div class="row justify-between items-center q-mt-md">
                            <div>
                                <div class="text-subtitle1" :class="{ 'text-strike': product.hasDiscount }">
                                    ₹{{ product.originalPrice }}
                                </div>
                                <div v-if="product.hasDiscount" class="text-positive text-weight-bold">
                                    ₹{{ product.finalPrice }}
                                    <span class="text-grey text-caption q-ml-sm">
                                        (-{{ product.discountPercent }}%)
                                    </span>
                                </div>
                            </div>

                            <q-chip v-if="product.hasDiscount" color="negative" text-color="white" size="sm">
                                SALE
                            </q-chip>
                        </div>
                    </q-card-section>

                    <q-card-section v-if="product.colorVariants && product.colorVariants.length">
                        <div class="text-caption q-mb-xs">Available Colors:</div>
                        <div class="row items-center">
                            <q-chip v-for="color in product.colorVariants" :key="color" size="sm" dense>
                                {{ color }}
                            </q-chip>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn label="Add to Cart" color="primary" @click="addToCart(product)"
                            :loading="addingToCart === product.productId" class="q-mt-sm" />
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

export default {
    name: "BuyerDashboard",
    data() {
        return {
            cartStore: useCartStore(),
            productStore: useProductStore(),
            searchText: "",
            selectedCategory: null,
            addingToCart: null,
            selectedColors: {}
        };
    },
    computed: {
        categories() {
            const categoriesSet = new Set(
                this.productStore.productList.map(p => p.category)
            );
            return Array.from(categoriesSet);
        },
        filteredProducts() {
            let products = this.productStore.productList;

            if (this.searchText) {
                const searchLower = this.searchText.toLowerCase();
                products = products.filter(
                    p =>
                        p.name.toLowerCase().includes(searchLower) ||
                        p.description.toLowerCase().includes(searchLower)
                );
            }
            if (this.selectedCategory) {
                products = products.filter(
                    p => p.category === this.selectedCategory
                );
            }
            return products;
        }
    },
    methods: {
        async addToCart(product) {
            this.addingToCart = product.productId;
            try {
                const selectedColor =
                    this.selectedColors[product.productId] ||
                    product.colorVariants[0];
                await this.cartStore.addToCart({
                    id: product.productId,
                    title: product.name,
                    price: product.hasDiscount
                        ? product.finalPrice
                        : product.originalPrice,
                    originalPrice: product.originalPrice,
                    description: product.description,
                    selectedColor: selectedColor,
                    image: product.imagePaths[selectedColor],
                    quantity: 1
                });
                this.$q.notify({
                    type: "positive",
                    message: `${product.name} (${selectedColor}) added to cart!`,
                    position: "top"
                });
            } catch (err) {
                this.$q.notify({
                    type: "negative",
                    message: `Failed to add product to cart: ${err.message}`,
                    position: "top"
                });
            } finally {
                this.addingToCart = null;
            }
        }
    }
};
</script>

<style scoped>
/* Page background gradient */
.page-gradient {
    background: linear-gradient(135deg, #fdfbfb, #ebedee, #dfe9f3);
    min-height: 100vh;
}

/* Product card styling */
.product-card {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Product image container */
.product-image {
    position: relative;
    width: 100%;
    padding-top: 75%;
    background-color: #f9f9f9;
    overflow: hidden;
}

.product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
}

.product-image:hover img {
    transform: scale(1.06);
}

/* No image placeholder */
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

/* Strike-through price */
.text-strike {
    text-decoration: line-through;
    color: #888;
}

/* Typography tweaks */
.text-h6 {
    font-size: 1.1rem;
    font-weight: 600;
}

.text-subtitle2 {
    color: #777;
    font-size: 0.9rem;
}

/* Search filter section spacing */
.search-filter {
    background: rgba(255, 255, 255, 0.5);
    padding: 12px;
    border-radius: 10px;
    backdrop-filter: blur(4px);
}
</style>
