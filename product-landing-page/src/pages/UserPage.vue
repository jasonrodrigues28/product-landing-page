<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center justify-between">
      <h5 class="q-my-none">Available Products</h5>
      <q-btn
        icon="shopping_cart"
        color="primary"
        :to="{ path: '/cart' }"
        label="Cart"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="product in productList"
        :key="product.productId"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ product.name }}</div>
            <div class="text-subtitle2">{{ product.category }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-body1 q-mb-md">
              {{ product.description }}
            </div>
            <div class="row items-center justify-between">
              <div class="text-h6">${{ product.price }}</div>
              <div class="text-caption">Stock: {{ product.quantity }}</div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="Add to Cart"
              @click="addToCart(product)"
              :disable="product.quantity <= 0"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div v-if="productList.length === 0" class="col-12 text-center">
        <q-icon name="inventory_2" size="48px" color="grey-5" />
        <div class="text-h6 text-grey-5 q-mt-sm">No products available</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useProductStore } from '../stores/product'

export default {
  name: 'UserPage',

  computed: {
    productList() {
      const productStore = useProductStore()
      return productStore.productList.filter(product => product.quantity > 0)
    }
  },

  methods: {
    addToCart(product) {
      // TODO: Implement cart functionality
      this.$q.notify({
        message: `Added ${product.name} to cart`,
        color: 'positive'
      })
    }
  }
}
</script>
