<template>
    <q-page class="cart-page q-pa-md">
        <div class="text-h5 text-bold q-mb-md">🛒 Your Cart</div>

        <!-- Empty Cart Message -->
        <q-card v-if="cart.length === 0" class="q-pa-md text-center empty-cart">
            <q-icon name="shopping_cart" size="64px" color="grey-5" />
            <div class="text-subtitle1 q-mt-sm text-grey-7">Your cart is empty</div>
        </q-card>

        <!-- Cart Items -->
        <div v-else>
            <q-card v-for="item in cart" :key="item.id" class="q-mb-md cart-item-card">
                <q-img :src="item.image" :ratio="16 / 9" class="cart-img" />

                <q-card-section>
                    <div class="text-h6">{{ item.title }}</div>
                    <div class="text-subtitle2 text-grey">Qty: {{ item.quantity }}</div>
                    <div class="text-bold text-primary">
                        ₹ {{ item.price }} x {{ item.quantity }} = ₹ {{ item.price * item.quantity }}
                    </div>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat round color="negative" icon="delete" @click="removeFromCart(item.id)" />
                </q-card-actions>
            </q-card>

            <!-- Total -->
            <div class="text-h6 text-right q-mt-lg">
                Total: <span class="text-primary">₹ {{ totalPrice }}</span>
            </div>

            <!-- Checkout -->
            <q-btn label="Proceed to Checkout" color="primary" class="q-mt-md full-width" @click="checkout"
                icon="payment" />
        </div>
    </q-page>
</template>

<script>
import { useCartStore } from '../stores/cart'
import { mapState, mapActions } from 'pinia'

export default {
    name: 'CartPage',

    computed: {
        ...mapState(useCartStore, ['items', 'totalPrice']),
        cart() {
            return this.items
        }
    },

    methods: {
        ...mapActions(useCartStore, ['removeFromCart', 'clearCart']),

        checkout() {
            this.$q.notify({ type: 'positive', message: 'Checkout complete (dummy)' })
            this.clearCart()
        }
    }
}
</script>

<style scoped>
.cart-page {
    background: linear-gradient(135deg, #f0f4ff, #e0e7ff);
    min-height: 100vh;
}

.empty-cart {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.cart-item-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cart-img {
    object-fit: cover;
}

.full-width {
    width: 100%;
}
</style>
