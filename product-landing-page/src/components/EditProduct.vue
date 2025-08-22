<template>
  <q-card class="edit-product-card" style="min-width: 400px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6">Edit Product</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup @click="$emit('close')" />
    </q-card-section>

    <q-card-section>
      <q-form @submit="handleSubmit" ref="editForm">
        <!-- Basic Info -->
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="editedProduct.name"
              label="Product Name"
              :rules="[val => !!val || 'Name is required']"
              outlined
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="editedProduct.description"
              label="Description"
              type="textarea"
              :rules="[val => !!val || 'Description is required']"
              outlined
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-select
              v-model="editedProduct.category"
              :options="categories"
              label="Category"
              :rules="[val => !!val || 'Category is required']"
              outlined
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="editedProduct.originalPrice"
              label="Price"
              type="number"
              :rules="[
                val => val > 0 || 'Price must be greater than 0'
              ]"
              outlined
            />
          </div>
        </div>

        <!-- Discount Section -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12">
            <q-toggle
              v-model="editedProduct.hasDiscount"
              label="Apply Discount"
            />
          </div>

          <div class="col-12 col-sm-6" v-if="editedProduct.hasDiscount">
            <q-input
              v-model.number="editedProduct.discountPercent"
              label="Discount %"
              type="number"
              :rules="[
                val => (!editedProduct.hasDiscount || (val >= 0 && val <= 100)) || 'Discount must be between 0 and 100'
              ]"
              outlined
            />
          </div>

          <div class="col-12 col-sm-6" v-if="editedProduct.hasDiscount">
            <q-input
              v-model.number="editedProduct.finalPrice"
              label="Final Price"
              readonly
              outlined
            />
          </div>
        </div>

        <!-- Color and Image Section -->
        <div class="q-mt-lg">
          <div class="text-subtitle1 q-mb-sm">Colors & Images</div>
          <q-select
            v-model="editedProduct.colorVariants"
            :options="colors"
            label="Color Variants"
            multiple
            use-chips
            outlined
            :rules="[val => val.length > 0 || 'Select at least one color']"
          />

          <div v-for="color in editedProduct.colorVariants" :key="color" class="color-section q-mt-md">
            <div class="color-section-header">
              <span class="text-subtitle2">{{ color }}</span>
              <q-btn
                v-if="hasExistingImage(color)"
                flat
                round
                size="sm"
                color="negative"
                icon="delete"
                @click="removeImage(color)"
              />
            </div>

            <!-- Show existing image -->
            <div v-if="hasExistingImage(color)" class="existing-image q-mb-md">
              <img :src="getImagePath(color)" :alt="color">
            </div>

            <!-- Image upload -->
            <q-uploader
              :label="hasExistingImage(color) ? 'Replace image' : 'Upload image'"
              accept=".jpg, .jpeg, .png, .webp"
              :auto-upload="false"
              bordered
              @added="files => handleImageUpload(color, files)"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row justify-end q-mt-lg">
          <q-btn label="Cancel" flat color="negative" @click="$emit('close')" class="q-mr-sm" />
          <q-btn label="Save Changes" type="submit" color="primary" :loading="saving" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { useProductStore } from '../stores/productStore';

export default {
  name: 'EditProduct',
  
  props: {
    product: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      categories: ['Shirt', 'Tshirt', 'Pants'],
      colors: ['Red', 'Green', 'Blue'],
      saving: false,
      editedProduct: {
        productId: '',
        name: '',
        description: '',
        category: '',
        hasDiscount: false,
        discountPercent: 0,
        originalPrice: 0,
        finalPrice: 0,
        colorVariants: [],
        imagePaths: {}
      },
      newImages: {}
    };
  },

  created() {
    // Deep copy the product to avoid modifying the original
    this.editedProduct = JSON.parse(JSON.stringify(this.product));
    this.calculateFinalPrice();
  },

  methods: {
    hasExistingImage(color) {
      return this.editedProduct.imagePaths && this.editedProduct.imagePaths[color];
    },

    getImagePath(color) {
      return this.editedProduct.imagePaths[color];
    },

    removeImage(color) {
      if (this.editedProduct.imagePaths) {
        this.$delete(this.editedProduct.imagePaths, color);
      }
    },

    async handleImageUpload(color, files) {
      if (!files || !files[0]) return;

      const file = files[0];
      try {
        const base64 = await this.fileToBase64(file);
        if (!this.editedProduct.imagePaths) {
          this.editedProduct.imagePaths = {};
        }
        this.editedProduct.imagePaths[color] = base64;
      } catch (error) {
        console.error('Error processing image:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Failed to process image'
        });
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    calculateFinalPrice() {
      if (this.editedProduct.hasDiscount && this.editedProduct.discountPercent > 0) {
        this.editedProduct.finalPrice = Math.round(
          this.editedProduct.originalPrice - 
          (this.editedProduct.originalPrice * this.editedProduct.discountPercent) / 100
        );
      } else {
        this.editedProduct.finalPrice = this.editedProduct.originalPrice;
      }
    },

    async handleSubmit() {
      try {
        this.saving = true;
        const store = useProductStore();
        await store.updateProduct(this.editedProduct.productId, this.editedProduct);
        
        this.$q.notify({
          type: 'positive',
          message: 'Product updated successfully'
        });
        
        this.$emit('close');
      } catch (error) {
        console.error('Error updating product:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update product'
        });
      } finally {
        this.saving = false;
      }
    }
  },

  watch: {
    'editedProduct.originalPrice': 'calculateFinalPrice',
    'editedProduct.hasDiscount': 'calculateFinalPrice',
    'editedProduct.discountPercent': 'calculateFinalPrice'
  }
};
</script>

<style scoped>
.edit-product-card {
  max-height: 90vh;
  overflow-y: auto;
}

.existing-image {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
}

.existing-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.color-section {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.color-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
</style>
