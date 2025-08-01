<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ config.heading.text[0] }}</div>
    <div class="sd-top-section row justify-end">
      <q-btn
        color="primary"
        :icon-right="config.buttonTop.icon[0]"
        :label="config.buttonTop.text[0]"
        class="top-button"
        @click="showAddProductDialog = true"
      />
      <q-dialog v-model="showAddProductDialog" persistent>
        <AddProduct @close="showAddProductDialog = false" />
      </q-dialog>

      <q-btn
        color="red"
        :icon-right="config.buttonTop.icon[1]"
        :label="config.buttonTop.text[1]"
        @click="deleteMode = true"
      />
    </div>

    <ProductTable :deleteMode="deleteMode" @save="deleteMode = false" @cancel="deleteMode = false" />
  </q-page>
</template>

<script>
import ProductTable from '../components/SellerDashboard/ProductTable.vue';
import AddProduct from '../components/AddProduct.vue';
import sellerDashboardConfig from '../configs/sellerdashboard.config.json';

export default {
  name: 'SellerDashboard',
  components: { ProductTable, AddProduct },
  data() {
    return {
      config: { ...sellerDashboardConfig },
      deleteMode: false,
      showAddProductDialog: false
    };
  }
};
</script>

<style scoped>
.sd-top-section {
  margin-bottom: 16px;
}
.top-button {
  margin-right: 8px;
}
</style>