<template>
    <q-page class="q-pa-md">
        <div class="text-h5 q-mb-md">Your Cart</div>

        <q-card v-if="cart.length === 0" class="q-pa-md">
            <div class="text-subtitle1">Your cart is empty.</div>
        </q-card>

        <div v-else>
            <q-card v-for="item in cart" :key="item.id" class="q-mb-md">
                <q-img :src="item.image" :ratio="16 / 9" />

                <q-card-section>
                    <div class="text-h6">{{ item.title }}</div>
                    <div class="text-subtitle2 text-grey">Qty: {{ item.quantity }}</div>
                    <div class="text-bold">
                        ₹ {{ item.price }} x {{ item.quantity }} = ₹ {{ item.price * item.quantity }}
                    </div>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat color="negative" icon="delete" @click="removeFromCart(item.id)" />
                </q-card-actions>
            </q-card>

            <div class="text-h6 q-mt-lg">Total: ₹ {{ totalPrice }}</div>

            <q-btn label="Checkout" color="primary" class="q-mt-md" @click="checkout" />
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