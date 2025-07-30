<template>
    <q-page class="q-pa-md">
        <q-table 
         :rows="products"
         :columns="columns"
         row-key="id"
         flat
         bordered
         class="product-table">
        <template v-slot:body-cell-actions="props">
            <q-td>
                <q-icon v-if="!deleteMode" name="edit" class="cursor-pointer"
                @click="editProduct(props.row)"
                v-show="props.row.hovered"
                />
                <q-icon v-else name="delete" class="cursor-pointer text-red"
                @click="deleteProduct(props.row)"
                v-show="props.row.hovered"
                />
                
            </q-td>
        </template>
        </q-table>
    </q-page>
</template>
<script>
export default{
    name: "ProductTable",
    props:{
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
      columns: [
        { name: "id", label: "Product ID", field: "id", align: "left" },
        { name: "name", label: "Name", field: "name", align: "left" },
        { name: "description", label: "Description", field: "description", align: "left" },
        {
          name: "hasDiscount",
          label: "Discount?",
          field: row => (row.hasDiscount ? "Yes" : "No"),
          align: "center"
        },
        { name: "discountPercent", label: "Discount %", field: "discountPercent", align: "center" },
        { name: "price", label: "Original Price", field: "price", align: "center" },
        { name: "action", label: "", field: "action", align: "center" }
      ]
    };
  },
  methods:{
    editProduct(){
        console.log("Edit product clicked");
    },
    deleteProduct(){
        console.log("deleteproduct clicked");
    }
  }
}
</script>