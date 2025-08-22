<template>
  <div>
    <q-table :rows="products" :columns="columns" row-key="productId" :filter="filter"
      :row-class="(row) => deleteMode && productsToDelete.has(row.productId) ? 'bg-red-1' : ''">
      <template v-slot:top>
        <div class="row full-width">
          <div class="col-6">
            <q-input v-if="!deleteMode" dense debounce="300" v-model="filter" placeholder="Search products">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-6 text-right">
            <q-btn v-if="deleteMode" color="green" :label="config.buttons.save.label" @click="handleDeleteSave"
              class="q-mr-sm" />
            <q-btn v-if="deleteMode" color="red" :label="config.buttons.cancel.label" @click="handleDeleteCancel" />
          </div>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="productId" :props="props">{{ props.row.productId }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="description" :props="props">{{ props.row.description }}</q-td>
          <q-td key="hasDiscount" :props="props">{{ props.row.hasDiscount ? 'Yes' : 'No' }}</q-td>
          <q-td key="discountPercent" :props="props">{{ props.row.hasDiscount ? props.row.discountPercent + '%' : '-'
          }}</q-td>
          <q-td key="originalPrice" :props="props">{{ props.row.originalPrice }}</q-td>
          <q-td key="finalPrice" :props="props">{{ props.row.hasDiscount ? props.row.finalPrice :
            props.row.originalPrice }}</q-td>
          <q-td key="stock" :props="props" class="q-pa-md">
            <div v-if="props.row.colorVariants?.length > 0">
              <div v-for="color in props.row.colorVariants" :key="color" class="q-mb-sm">
                <div class="text-caption">{{ color }}:</div>
                <ProductQuantity :product-id="props.row.productId" :initial-stock="props.row.stockByColor?.[color] || 0"
                  :is-seller="true" :selected-color="color" @stock-updated="onStockUpdated" />
              </div>
            </div>
            <ProductQuantity v-else :product-id="props.row.productId" :initial-stock="props.row.stock || 0"
              :is-seller="true" @stock-updated="onStockUpdated" />
          </q-td>
          <q-td key="createdAt" :props="props">{{ formatDate(props.row.createdAt) }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn v-if="!deleteMode" flat round color="primary" :icon="config.icons.edit"
              @click="editProduct(props.row)" />
            <q-btn v-if="deleteMode" flat round color="negative" :icon="config.icons.delete"
              @click="deleteProduct(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="editDialog" persistent>
      <EditProduct :product="productToEdit" @close="closeEditDialog" />
    </q-dialog>
  </div>
</template>

<style scoped>
.q-table td {
  white-space: normal;
}

.q-table td.stock-cell {
  min-width: 250px;
  padding: 12px;
}
</style>

<script>
import { useProductStore } from '../../stores/productStore';
import appConfig from '../../configs/appConfig.json';
import EditProduct from '../EditProduct.vue';
import ProductQuantity from '../common/ProductQuantity.vue';

export default {
  name: 'ProductTable',
  components: {
    EditProduct,
    ProductQuantity
  },
  props: {
    deleteMode: Boolean
  },
  data() {
    return {
      config: appConfig.productTable,
      filter: '',
      productsToDelete: new Set(),
      editDialog: false,
      productToEdit: null,
      columns: appConfig.productTable.table.columns
    };
  },
  computed: {
    products() {
      return useProductStore().productList;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    editProduct(product) {
      if (!this.deleteMode) {
        this.productToEdit = { ...product };
        this.editDialog = true;
      }
    },
    closeEditDialog() {
      this.editDialog = false;
      this.productToEdit = null;
    },
    handleEditSave(updatedProduct) {
      const store = useProductStore();
      store.updateProduct(updatedProduct.productId, updatedProduct);
      this.closeEditDialog();
    },
    deleteProduct(product) {
      if (this.deleteMode) {
        if (this.productsToDelete.has(product.productId)) {
          this.productsToDelete.delete(product.productId);
          this.$q.notify({
            type: 'info',
            message: `Removed ${product.name} from deletion list`,
            timeout: 1000
          });
        } else {
          this.productsToDelete.add(product.productId);
          this.$q.notify({
            type: 'warning',
            message: `Added ${product.name} to deletion list`,
            timeout: 1000
          });
        }
      }
    },
    handleDeleteSave() {
      if (this.productsToDelete.size > 0) {
        const store = useProductStore();
        const productsCount = this.productsToDelete.size;
        store.deleteMultipleProducts(Array.from(this.productsToDelete));
        this.productsToDelete.clear();
        this.$q.notify({
          type: 'positive',
          message: `Successfully deleted ${productsCount} product${productsCount > 1 ? 's' : ''}`
        });
      }
      this.$emit('save');
    },
    handleDeleteCancel() {
      this.productsToDelete.clear();
      this.$emit('cancel');
    },
    onStockUpdated(productId, newStock, color) {
      const store = useProductStore();
      store.updateProductStock(productId, newStock, color);
    }
  },
  watch: {
    deleteMode(newVal) {
      if (!newVal) {
        this.productsToDelete.clear();
      }
    }
  }
};
</script>