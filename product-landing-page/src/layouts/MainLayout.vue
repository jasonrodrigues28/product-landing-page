<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" v-if="$route.name !== 'login'">
      <q-toolbar>
        <q-toolbar-title>Product Landing Page</q-toolbar-title>

        <q-space />

        <!-- Navigation Links (show based on user role) -->
        <template v-if="userStore.isAuthenticated">
          <!-- Shop link for buyers -->
          <q-btn v-if="userStore.checkIsBuyer()" flat no-caps :color="$route.path === '/buyer' ? 'yellow' : 'white'"
            label="Shop" to="/buyer" class="q-mx-sm" />
          <!-- Seller Dashboard for sellers -->
          <q-btn v-if="userStore.checkIsSeller()" flat no-caps :color="$route.path === '/seller' ? 'yellow' : 'white'"
            label="Seller Dashboard" to="/seller" class="q-mx-sm" />

          <!-- User Menu -->
          <q-btn flat dense round icon="account_circle">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>{{ userStore.username }}</q-item-label>
                    <q-item-label caption>{{ userStore.role }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="handleLogout" v-close-popup>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Cart Button (only for buyers) -->
          <q-btn v-if="userStore.checkIsBuyer()" flat round dense icon="shopping_cart" to="/cart" class="q-ml-sm">
            <q-badge v-if="totalItems > 0" color="red" floating transparent :label="totalItems" />
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useCartStore } from 'stores/cart'
import { useUserStore } from 'stores/user'

export default {
  name: 'MainLayout',

  data() {
    return {
      cartStore: useCartStore(),
      userStore: useUserStore()
    }
  },

  computed: {
    totalItems() {
      return this.cartStore.totalItems
    }
  },

  methods: {
    handleLogout() {
      this.userStore.logout();
      // Clear cart on logout
      this.cartStore.$reset();
      this.$q.notify({
        type: 'info',
        message: 'Logged out successfully',
        position: 'top'
      });
      // Always redirect to login page on logout
      this.$router.push({ name: 'login' });
    }
  }
}
</script>