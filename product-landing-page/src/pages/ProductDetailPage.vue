<template>
    <q-page class="product-detail-page flex flex-center q-pa-md">
        <q-card v-if="product" class="product-detail-card q-pa-lg">
            <div class="row q-col-gutter-xl items-center">
                <div class="col-12 col-md-5 flex flex-center">
                    <q-img :src="mainImage" :ratio="4 / 3" class="product-img" spinner-color="primary"
                        :alt="product.name" style="max-width: 350px; border-radius: 12px;">
                        <template v-slot:error>
                            <div class="no-image flex flex-center column text-grey-5">
                                <q-icon name="image" size="64px" />
                                <div>No Image</div>
                            </div>
                        </template>
                    </q-img>
                </div>
                <div class="col-12 col-md-7">
                    <div class="text-h5 text-white q-mb-sm">{{ product.name }}</div>
                    <div class="text-subtitle1 text-grey-4 q-mb-md">{{ product.category }}</div>
                    <div class="text-body1 text-grey-3 q-mb-md">{{ product.description }}</div>
                    <div class="text-h6 text-primary q-mb-md">
                        ₹ {{ product.finalPrice ?? product.originalPrice ?? product.price ?? 0 }}
                    </div>
                    <q-btn color="primary" label="Add to Cart" @click="addToCart" class="full-width rounded-btn" />
                </div>
            </div>
        </q-card>
        <div v-else class="text-center text-grey-5">
            <q-spinner color="primary" size="40px" class="q-mb-md" />
            <div>Loading product...</div>
        </div>
    </q-page>
</template>

<script>
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useProductStore } from '../stores/productStore'

export default {
    name: 'ProductDetailPage',
    setup() {
        const route = useRoute()
        const cartStore = useCartStore()
        const productStore = useProductStore()

        const productId = route.params.id
        // Find by productId (string), not id (number)
        const product = productStore.productList.find(p => p.productId === productId)

        // Pick main image: prefer selected color, fallback to first image, fallback to product.image
        let mainImage = ''
        if (product) {
            if (product.imagePaths && Object.keys(product.imagePaths).length > 0) {
                mainImage = product.imagePaths[Object.keys(product.imagePaths)[0]]
            } else if (product.image) {
                mainImage = product.image
            } else {
                mainImage = ''
            }
        }

        function addToCart() {
            // Add all product fields, but ensure id, title, image, price for cart page
            const cartItem = {
                ...product,
                id: product.productId, // for cart key
                title: product.name,   // for cart display
                image: mainImage,      // for cart image
                price: product.finalPrice ?? product.originalPrice ?? product.price ?? 0 // for cart price
            }
            cartStore.addToCart(cartItem)
        }

        return { product, addToCart, mainImage }
    }
}
</script>

<style scoped>
.product-detail-page {
    background: linear-gradient(135deg, #232526, #414345, #232526);
    min-height: 100vh;
}

.product-detail-card {
    max-width: 800px;
    width: 100%;
    background: rgba(30, 32, 34, 0.98);
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.product-img {
    border-radius: 12px;
    background: #222;
}

.text-primary {
    color: #00b4d8 !important;
}

.rounded-btn {
    border-radius: 8px;
}

.no-image {
    min-height: 200px;
}
</style>
