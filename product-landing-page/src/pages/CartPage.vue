<template>
    <q-page class="q-pa-md cart-page">
        <div class="text-h5 q-mb-md">Your Cart</div>

        <q-card v-if="cart.length === 0" class="q-pa-md empty-cart">
            <div class="text-subtitle1">Your cart is empty.</div>
        </q-card>

        <div v-else>
            <q-card v-for="item in cart" :key="item.id" class="q-mb-md cart-item-card">
                <q-img :src="item.image" :ratio="16 / 9" class="cart-img full-width" />

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
import { useProductStore } from '../stores/productStore'
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

        async checkout() {
            try {
                const productStore = useProductStore();
                
                // First check if all items have sufficient stock
                const insufficientStock = this.items.find(item => {
                    const product = productStore.productList.find(p => p.productId === item.id);
                    if (!product) return true;
                    const currentStock = item.selectedColor ? 
                        (product.stockByColor?.[item.selectedColor] || 0) : 
                        (product.stock || 0);
                    return currentStock < item.quantity;
                });

                if (insufficientStock) {
                    throw new Error('Some items are out of stock');
                }

                // Update stock in product store
                productStore.checkout(this.items);
                
                // Clear the cart
                this.clearCart();
                
                this.$q.notify({ 
                    type: 'positive', 
                    message: 'Checkout complete! Thank you for your purchase.',
                    position: 'top'
                });
            } catch (error) {
                this.$q.notify({ 
                    type: 'negative', 
                    message: error.message || 'Failed to complete checkout',
                    position: 'top'
                });
            }
        }
    }
}
</script>

<style scoped>
.cart-page {
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(40, 44, 52, 1), rgba(15, 17, 20, 1));
    color: white;
}

.empty-cart {
    background: rgba(30, 32, 38, 0.9);
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    color: white;
}

.cart-item-card {
    background: rgba(30, 32, 38, 0.9);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    color: white;
    max-width: 500px;
}

.cart-img {
    object-fit: cover;
}

.full-width {
    width: 100%;
}

.rounded-btn {
    border-radius: 12px;
}
</style>