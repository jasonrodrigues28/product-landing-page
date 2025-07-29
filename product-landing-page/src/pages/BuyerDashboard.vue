<template>
    <q-page class="q-pa-md">
        <div class="text-h5 q-mb-md">All Products</div>

        <q-card v-for="product in products" :key="product.id" class="q-mb-md">
            <q-img :src="product.image" :ratio="16 / 9" />

            <q-card-section>
                <div class="text-h6">{{ product.title }}</div>
                <div class="text-subtitle2 text-grey">{{ product.description }}</div>
                <div class="text-bold q-mt-sm">₹ {{ product.price }}</div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="Add to Cart" color="primary" @click="addToCart(product)" />
            </q-card-actions>
        </q-card>
    </q-page>
</template>

<script>
import products from "../configs/products.config.json";
import { useCartStore } from "../stores/cart";

export default {
    name: "BuyerDashboard",

    data() {
        return {
            products,
            cartStore: useCartStore(),
        };
    },

    methods: {
        addToCart(product) {
            this.cartStore.addToCart(product);
            this.$q.notify({
                type: "positive",
                message: `${product.title} added to cart!`,
            });
        },
    },
};
</script>
