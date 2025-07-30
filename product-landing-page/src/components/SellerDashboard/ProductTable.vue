<template>
  <q-page class="q-pa-md">
    <q-table
      :rows="products"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="product-table"
    >
      <template v-slot:body-cell-action="props">
        <q-td>
          <q-icon
            v-if="!deleteMode"
            :name="icons.edit"
            class="cursor-pointer"
            @click="editProduct(props.row)"
          />
          <q-icon
            v-else
            :name="icons.delete"
            class="cursor-pointer text-red"
            @click="deleteProduct(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <div v-if="deleteMode" class="table-button row justify-end q-mt-md">
      <q-btn
        :color="buttons.save.color"
        :label="buttons.save.label"
        @click="save"
        class="q-mr-sm"
      />
      <q-btn
        :color="buttons.cancel.color"
        :label="buttons.cancel.label"
        @click="cancel"
      />
    </div>
  </q-page>
</template>

<script>
import productTableConfig from '../../configs/producttable.config.json';

export default {
  name: "ProductTable",
  props: {
    products: {
      type: Array,
      required: true
    },
    deleteMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      columns: productTableConfig.table.columns.map(col => {
        // Special handling for computed field like "hasDiscount"
        if (col.name === "hasDiscount") {
          return {
            ...col,
            field: row => (row.hasDiscount ? "Yes" : "No")
          };
        }
        return {
          ...col,
          field: col.name
        };
      }),
      buttons: productTableConfig.buttons,
      icons: productTableConfig.icons
    };
  },
  methods: {
    editProduct(row) {
      console.log("Edit product clicked:", row);
    },
    deleteProduct(row) {
      console.log("Delete product clicked:", row);
    },
    save() {
      console.log("Save changes");
      this.$emit('save');
    },
    cancel() {
      console.log("Cancel delete mode");
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.product-table {
  margin-bottom: 16px;
}
</style>
