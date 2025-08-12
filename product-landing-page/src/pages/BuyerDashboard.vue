<template>
    <q-page class="buyer-dashboard-page q-pa-md">
        <div class="text-h5 q-mb-md text-primary">Available Products</div>

        <!-- Search and Filter Section -->
        <div class="row q-mb-md search-filter">
            <div class="col-12 col-md-4">
                <q-input v-model="searchText" label="Search products" dense outlined clearable label-color="white"
                    color="white" class="white-input">
                    <template v-slot:append>
                        <q-icon name="search" color="white" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-4 q-pl-md">
                <q-select v-model="selectedCategory" :options="categories" label="Filter by category" dense outlined
                    clearable options-dense label-color="white" color="white" class="white-input" />
            </div>
        </div>

        <!-- Products Grid -->
        <div class="row q-col-gutter-md">
            <div v-for="product in filteredProducts" :key="product.productId" class="col-12 col-sm-6 col-md-4 col-lg-3">
                <q-card class="product-card-dark q-mb-md" @click="openProductDetails(product)">
                    <q-img
                        :src="product.imagePaths && Object.keys(product.imagePaths).length > 0 ? product.imagePaths[selectedColors[product.productId] || product.colorVariants[0]] : product.image || ''"
                        :ratio="16 / 9" class="product-img-dark">
                        <template v-slot:error>
                            <div class="no-image flex flex-center column text-grey-5">
                                <q-icon name="image" size="64px" />
                                <div>No Image</div>
                            </div>
                        </template>
                    </q-img>
                    <q-card-section>
                        <div class="text-h6 text-white">{{ product.name }}</div>
                        <div class="text-subtitle2 text-grey-4">{{ product.category }}</div>
                        <div class="text-grey-5 q-mt-sm">{{ product.description }}</div>
                        <div class="text-h6 text-primary q-mt-md">
                            ₹ {{ product.finalPrice ?? product.originalPrice ?? product.price ?? 0 }}
                            <span v-if="product.hasDiscount" class="text-negative text-caption q-ml-sm">SALE</span>
                        </div>
                    </q-card-section>
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

export default {
    name: "BuyerDashboard",
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
        openProductDetails(product) {
            this.$router.push({ name: 'productDetail', params: { id: product.productId } });
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

.search-filter {
    background: rgba(30, 32, 38, 0.7);
    padding: 12px;
    border-radius: 10px;
    backdrop-filter: blur(4px);
}

.no-image {
    min-height: 200px;
}
</style>
