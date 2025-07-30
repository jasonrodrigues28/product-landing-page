<template>
  <q-page class="q-pa-md">
    

    <div class="text-h6 q-mb-md">{{ config.heading.text[0] }}</div>
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
    
    <ProductTable :products="productList" :deleteMode="deleteMode" @save="deleteMode=false" @cancel="deleteMode=false" />
  </q-page>
</template>

<script>
import ProductTable from "../components/SellerDashboard/ProductTable.vue";
import sellerDashboardConfig from "../configs/sellerdashboard.config.json";


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
