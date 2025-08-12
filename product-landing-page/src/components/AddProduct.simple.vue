&lt;template>
  &lt;q-card class="q-pa-md">
    &lt;q-card-section>
      &lt;div class="text-h6">{{ isEdit ? 'Edit Product' : 'Add New Product' }}&lt;/div>
    &lt;/q-card-section>

    &lt;q-card-section>
      &lt;q-form @submit.prevent="handleSubmit" ref="productForm">
        &lt;!-- Product ID -->
        &lt;q-input
          v-model="product.productId"
          label="Product ID"
          readonly
          filled
        />

        &lt;!-- Basic Info -->
        &lt;q-input
          v-model="product.name"
          label="Product Name"
          :rules="[val => !!val || 'Required']"
        />

        &lt;q-input
          v-model="product.description"
          label="Description"
          type="textarea"
          :rules="[val => !!val || 'Required']"
        />

        &lt;q-select
          v-model="product.category"
          label="Category"
          :options="categories"
          :rules="[val => !!val || 'Required']"
        />

        &lt;!-- Price -->
        &lt;q-input
          v-model.number="product.price"
          label="Price"
          type="number"
          :rules="[val => val > 0 || 'Required']"
        />

        &lt;!-- Colors -->
        &lt;q-select
          v-model="product.colors"
          label="Colors"
          :options="availableColors"
          multiple
          :rules="[val => val.length > 0 || 'Select at least one color']"
        />

        &lt;q-card-actions align="right">
          &lt;q-btn label="Cancel" flat @click="$emit('close')" />
          &lt;q-btn :label="isEdit ? 'Save' : 'Add'" type="submit" color="primary"/>
        &lt;/q-card-actions>
      &lt;/q-form>
    &lt;/q-card-section>
  &lt;/q-card>
&lt;/template>

&lt;script>
export default {
  name: 'AddProduct',
  
  props: {
    isEdit: Boolean,
    editProduct: Object
  },

  data() {
    return {
      product: {
        productId: this.isEdit ? this.editProduct?.productId : this.$store.state.product.nextId,
        name: this.isEdit ? this.editProduct?.name : '',
        description: this.isEdit ? this.editProduct?.description : '',
        category: this.isEdit ? this.editProduct?.category : '',
        price: this.isEdit ? this.editProduct?.price : 0,
        colors: this.isEdit ? this.editProduct?.colors : []
      },
      categories: ['Shirt', 'Pants', 'Shoes'],
      availableColors: ['Red', 'Blue', 'Green', 'Black', 'White']
    }
  },

  methods: {
    async handleSubmit() {
      const isValid = await this.$refs.productForm.validate()
      if (!isValid) return

      if (this.isEdit) {
        this.$emit('save', this.product)
      } else {
        this.$store.commit('product/addProduct', this.product)
      }

      this.$q.notify({
        message: `Product ${this.isEdit ? 'updated' : 'added'} successfully`,
        type: 'positive'
      })

      this.$emit('close')
    }
  }
}
&lt;/script>
