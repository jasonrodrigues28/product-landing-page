<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Product Landing Page</q-toolbar-title>
        <q-btn flat round dense icon="shopping_cart" to="/cart">
          <q-badge v-if="totalItems > 0" color="red" floating transparent :label="totalItems" />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useCartStore } from 'stores/cart'

export default {
  name: 'MainLayout',

  data() {
    return {
      cartStore: useCartStore()
    }
  },

  computed: {
    totalItems() {
      return this.cartStore.totalItems
    }
  }
}
</script>
