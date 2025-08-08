<template>
  <q-page class="seller-dashboard">
    <div class="page-header">
      <div class="text-h5 text-white">{{ config.heading.text[0] }}</div>
    </div>

    <div class="sd-top-section row justify-end q-mb-md">
      <q-btn color="primary" :icon-right="config.buttonTop.icon[0]" :label="config.buttonTop.text[0]" class="top-button"
        unelevated @click="showAddProductDialog = true" />
      <q-dialog v-model="showAddProductDialog" persistent>
        <AddProduct @close="showAddProductDialog = false" />
      </q-dialog>

      <q-btn color="negative" :icon-right="config.buttonTop.icon[1]" :label="config.buttonTop.text[1]"
        class="top-button" unelevated @click="deleteMode = true" />
    </div>

    <q-card class="content-card">
      <ProductTable :deleteMode="deleteMode" @save="deleteMode = false" @cancel="deleteMode = false" />
    </q-card>
  </q-page>
</template>

<script>
import ProductTable from '../components/SellerDashboard/ProductTable.vue'
import AddProduct from '../components/AddProduct.vue'
import sellerDashboardConfig from '../configs/sellerdashboard.config.json'

export default {
  name: 'SellerDashboard',
  components: { ProductTable, AddProduct },
  data() {
    return {
      config: { ...sellerDashboardConfig },
      deleteMode: false,
      showAddProductDialog: false
    }
  }
}
</script>

<style scoped>
.seller-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.sd-top-section {
  margin-bottom: 16px;
}

.top-button {
  margin-left: 8px;
  border-radius: 8px;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
</style>
