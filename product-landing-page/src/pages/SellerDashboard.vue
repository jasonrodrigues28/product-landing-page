<template>
  <q-page class="q-pa-md">
    <div class="sd-top-section row justify-end">
      <q-btn
        color="primary"
        :icon-right="config.buttonTop.icon[0]"
        :label="config.buttonTop.text[0]"
        class="top-button"
        @click="deleteMode = false"
      />
      <q-btn
        color="red"
        :icon-right="config.buttonTop.icon[1]"
        :label="config.buttonTop.text[1]"
        @click="deleteMode = true"
      />
    </div>

    <div class="text-h6 q-mb-md">{{ config.heading.text[0] }}</div>

    <!-- FIX: Changed from config.products to productList -->
    <ProductTable :products="productList" :deleteMode="deleteMode" />
  </q-page>
</template>

<script>
import sellerDashboardConfig from "../configs/sellerdashboard.config.json";
import ProductTable from "../components/SellerDashboard/ProductTable.vue";

export default {
  name: "SellerDashboard",
  components: {
    ProductTable
  },
  data() {
    return {
      config: sellerDashboardConfig,
      deleteMode: false,
      productList: [
        {
          id: "seller123-001",
          name: "Product A",
          description: "Some great product",
          hasDiscount: true,
          discountPercent: 10,
          price: 1500,
          hovered: false
        },
        {
          id: "seller123-002",
          name: "Product B",
          description: "Another one",
          hasDiscount: false,
          discountPercent: 0,
          price: 1000,
          hovered: false
        }
      ]
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
