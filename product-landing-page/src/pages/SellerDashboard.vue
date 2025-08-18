<template>
  <q-page class="q-pa-md seller-dashboard-page">
    <div class="text-h6 q-mb-md seller-heading">{{ config.heading.text[0] }}</div>
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
/* Dark themed background similar to login & buyer dashboards */
.seller-dashboard-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(40,44,52,1), rgba(15,17,20,1));
  color: #fff;
}

/* Heading glow */
.seller-heading {
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: .5px;
  text-shadow: 0 2px 6px rgba(0,0,0,.45);
}

/* Glassy top action bar */
.sd-top-section {
  margin-bottom: 20px;
  gap: 12px;
  background: rgba(30,32,38,0.65);
  padding: 14px 18px;
  border-radius: 14px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px -4px rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,0.08);
}

/* Button styling for consistency */
.top-button, .sd-top-section :deep(.q-btn) {
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: .4px;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,.45);
  transition: transform .25s ease, box-shadow .25s ease;
}

.top-button:hover, .sd-top-section :deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -2px rgba(0,0,0,.55);
}

/* Subtle active press */
.top-button:active, .sd-top-section :deep(.q-btn:active) {
  transform: translateY(0);
  box-shadow: 0 3px 10px -2px rgba(0,0,0,.55);
}

/* ---- Dark Table Theming (visual only, no logic changes) ---- */
:deep(.q-table__container.q-table__card) {
  background: rgba(30,32,38,0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 6px 20px -4px rgba(0,0,0,0.55);
  color: #f1f5f9;
}

/* Header */
:deep(.q-table thead tr) {
  background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
}
:deep(.q-table th) {
  color: #e2e8f0;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

/* Body rows */
:deep(.q-table td) {
  border-bottom: 1px solid rgba(255,255,255,0.06);
  color: #f1f5f9;
}
:deep(.q-table tbody tr:hover) {
  background: rgba(255,255,255,0.05);
}

/* Search field inside table top */
:deep(.q-table__top .q-field__control) {
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.18);
  transition: border-color .25s ease, background .25s ease;
}
:deep(.q-table__top .q-field__control:hover) {
  background: rgba(255,255,255,0.12);
}
:deep(.q-table__top .q-field--focused .q-field__control) {
  background: rgba(0,180,216,0.2);
  border-color: #00b4d8;
  box-shadow: 0 0 0 2px rgba(0,180,216,0.35);
}
:deep(.q-table__top .q-field__native),
:deep(.q-table__top .q-field__label),
:deep(.q-table__top .q-icon) {
  color: #f1f5f9;
}

/* Pagination / bottom bar */
:deep(.q-table__bottom) {
  background: rgba(255,255,255,0.04);
  color: #e2e8f0;
  border-top: 1px solid rgba(255,255,255,0.08);
}

/* Sort icons */
:deep(.q-table__sort-icon) {
  color: #94a3b8;
}
:deep(th.sortable:hover .q-table__sort-icon) {
  color: #fff;
}

/* Inputs inside Stock Management cells */
:deep(.stock-cell .q-field__control) {
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
}
:deep(.stock-cell .q-field__native),
:deep(.stock-cell .q-field__label) { color: #f8fafc; }

/* Adjust positive chip to match dark context */
:deep(.q-chip.bg-positive) {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
</style>
