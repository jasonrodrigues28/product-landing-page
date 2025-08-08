<template>
  <q-card class="q-pa-md" style="min-width: 400px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</div>
      <q-space />
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="handleSubmit" ref="productForm">
        <q-input
          v-model="product.productId"
          label="Product ID"
          readonly
          class="q-mb-md"
          bottom-slots
        />
        <q-input
          v-model="product.name"
          label="Product Name"
          class="q-mb-md"
          :rules="[val => !!val || 'Product name is required']"
        />
        <q-input
          v-model="product.description"
          label="Description"
          type="textarea"
          class="q-mb-md"
          :rules="[val => !!val || 'Description is required']"
        />
        <q-select
          v-model="product.category"
          label="Category"
          :options="categories"
          class="q-mb-md"
          :rules="[val => !!val || 'Category is required']"
        />
        <q-toggle
          v-model="product.hasDiscount"
          label="Has Discount?"
          class="q-mb-md"
        />
        <q-input
          v-if="product.hasDiscount"
          v-model.number="product.discountPercent"
          label="Discount %"
          type="number"
          min="0"
          max="100"
          class="q-mb-md"
          :rules="[
            val => (!product.hasDiscount || (val >= 0 && val <= 100)) || 'Discount must be between 0 and 100'
          ]"
        />
        <q-input
          v-model.number="product.originalPrice"
          label="Original Price"
          type="number"
          min="0"
          class="q-mb-md"
          :rules="[
            val => val > 0 || 'Price must be greater than 0'
          ]"
        />
        <q-input
          v-model="product.finalPrice"
          label="Final Price"
          type="number"
          readonly
          class="q-mb-md"
        />
        <q-select
          v-model="product.colorVariants"
          label="Color Variants"
          :options="colors"
          multiple
          use-chips
          class="q-mb-md"
          :rules="[val => val.length > 0 || 'Select at least one color']"
        />
        <div v-for="(color, index) in product.colorVariants" :key="index" class="q-mb-md">
          <q-uploader
            :label="'Upload Image for ' + color"
            :auto-upload="false"
            accept=".jpg, .jpeg, .png, .webp"
            @added="(files) => handleImageUpload(color, files)"
            @removed="() => handleImageRemove(color)"
          />
          <div v-if="product.images[color]" class="text-caption q-mt-sm">
            Selected: {{ product.images[color].name }}
          </div>
        </div>

        <!-- Stock Input -->
        <div v-if="product.colorVariants?.length > 0">
          <div v-for="color in product.colorVariants" :key="color" class="q-mb-md">
            <q-input
              v-model.number="stockByColor[color]"
              type="number"
              :label="`Initial Stock for ${color}`"
              class="q-mb-sm"
              :rules="[
                val => val >= 0 || 'Stock cannot be negative',
                val => val > 0 || 'Stock must be greater than 0'
              ]"
            >
              <template v-slot:append>
                <q-icon name="inventory_2" />
              </template>
            </q-input>
          </div>
        </div>
        <q-input
          v-else
          v-model.number="product.stock"
          type="number"
          label="Initial Stock"
          class="q-mb-md"
          :rules="[
            val => val >= 0 || 'Stock cannot be negative',
            val => val > 0 || 'Stock must be greater than 0'
          ]"
        >
          <template v-slot:append>
            <q-icon name="inventory_2" />
          </template>
        </q-input>

        <q-card-actions align="right">
          <q-btn :label="isEdit ? 'Save Changes' : 'Add Product'" color="primary" type="submit" />
          <q-btn label="Cancel" color="negative" flat @click="$emit('close')" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { useProductStore } from '../stores/productStore';

export default {
  name: 'AddProduct',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    editProduct: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      product: {
        productId: '',
        name: '',
        description: '',
        category: '',
        hasDiscount: false,
        discountPercent: 0,
        originalPrice: 0,
        finalPrice: 0,
        colorVariants: [],
        images: {},
        stock: 50, // Default stock for non-color variants
        unitsSold: 0
      },
      stockByColor: {}, // Track stock for each color
      categories: ['Shirt', 'Tshirt', 'Pants'],
      colors: ['Red', 'Green', 'Blue']
    };
  },
  created() {
    if (this.isEdit && this.editProduct) {
      // For edit mode
      this.product = { 
        ...this.editProduct,
        images: {} // Initialize empty images object for new uploads
      };
      // If there are existing image paths, show them in the preview
      if (this.editProduct.imagePaths) {
        this.existingImages = { ...this.editProduct.imagePaths };
      }
      
      // Initialize stockByColor from editProduct
      if (this.editProduct.stockByColor) {
        this.stockByColor = { ...this.editProduct.stockByColor };
      } else if (this.editProduct.stock && this.editProduct.colorVariants?.length > 0) {
        // Distribute stock evenly among colors if we have old format data
        const stockPerColor = Math.floor(this.editProduct.stock / this.editProduct.colorVariants.length);
        this.editProduct.colorVariants.forEach(color => {
          this.stockByColor[color] = stockPerColor;
        });
      }
    }
  },
  watch: {
    'product.originalPrice': 'calculateFinalPrice',
    'product.discountPercent': 'calculateFinalPrice',
    'product.hasDiscount': 'calculateFinalPrice',
    'product.colorVariants': {
      handler(newColors) {
        // When color variants change, initialize their stock values
        const newStockByColor = {};
        newColors.forEach(color => {
          // Preserve existing stock values or use default
          newStockByColor[color] = this.stockByColor[color] || 50;
        });
        this.stockByColor = newStockByColor;
      }
    }
  },
  methods: {
    calculateFinalPrice() {
      const { originalPrice, discountPercent, hasDiscount } = this.product;
      if (!hasDiscount || discountPercent <= 0) {
        this.product.finalPrice = originalPrice;
        return;
      }
      this.product.finalPrice = Math.round(originalPrice - (originalPrice * discountPercent) / 100);
    },
    async handleImageUpload(color, files) {
      if (!files || !files[0]) {
        return;
      }
      
      const file = files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$q.notify({
          type: 'negative',
          message: `Image size too large. Please use an image under 5MB.`,
          timeout: 3000
        });
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.$q.notify({
          type: 'negative',
          message: `Invalid file type. Please use JPG, PNG, or WebP images.`,
          timeout: 3000
        });
        return;
      }

      try {
        this.$q.loading.show({
          message: `Processing ${color} image...`
        });

        // Create safe filename
        const safeName = `${this.product.productId}-${color.toLowerCase()}-${Date.now()}${this.getFileExtension(file.name)}`;
        
        // Convert to base64
        const base64 = await this.fileToBase64(file);
        
        // Store the image
        this.product.images[color] = {
          file: file,
          name: safeName,
          originalName: file.name,
          preview: base64
        };
        
        // For edit mode, update the preview immediately
        if (this.isEdit && !this.product.imagePaths) {
          this.product.imagePaths = {};
        }
        if (this.isEdit) {
          this.product.imagePaths[color] = base64;
        }

        this.$q.loading.hide();
        this.$q.notify({
          type: 'positive',
          message: `Image for ${color} uploaded successfully`,
          timeout: 1000
        });
      } catch (error) {
        console.error('Error processing image:', error);
        this.$q.loading.hide();
        this.$q.notify({
          type: 'negative',
          message: `Error processing image for ${color}: ${error.message || 'Unknown error'}`,
          timeout: 3000
        });
      }
    },
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(new Error('Failed to read file: ' + error.message));
        reader.readAsDataURL(file);
      });
    },
    async resizeImage(base64, maxWidth) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            
            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get resized base64
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch (error) {
            reject(new Error('Failed to resize image: ' + error.message));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      });
    },
    handleImageRemove(color) {
      if (this.product.images[color]) {
        delete this.product.images[color];
      }
    },
    getFileExtension(filename) {
      return filename.substring(filename.lastIndexOf('.'));
    },
    async handleSubmit() {
      try {
        // Show loading state
        try {
          this.$q.loading.show({
            message: 'Processing product data...',
            spinnerColor: 'primary'
          });
        } catch (loadingError) {
          console.error('Loading plugin error:', loadingError);
          // Continue without loading indicator if it fails
        }

        const store = useProductStore();

        const isValid = await this.$refs.productForm.validate();
        
        if (!isValid) {
          this.$q.loading.hide();
          return;
        }

        // Basic validation
        if (!this.product.name || !this.product.description || !this.product.category) {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: 'Please fill in all required fields',
            timeout: 3000
          });
          return;
        }

        if (this.product.originalPrice <= 0) {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: 'Price must be greater than 0',
            timeout: 3000
          });
          return;
        }

        // Validate that all selected colors have images
        const missingImages = this.product.colorVariants.filter(color => 
          !this.product.images[color] && 
          !(this.isEdit && this.editProduct && this.editProduct.imagePaths && this.editProduct.imagePaths[color])
        );

        if (missingImages.length > 0) {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'warning',
            message: `Please upload images for: ${missingImages.join(', ')}`,
            timeout: 3000
          });
          return;
        }

        // Process and store images
        const productData = {
          productId: this.product.productId,
          name: this.product.name,
          description: this.product.description,
          category: this.product.category,
          hasDiscount: this.product.hasDiscount,
          discountPercent: this.product.hasDiscount ? this.product.discountPercent : 0,
          originalPrice: this.product.originalPrice,
          finalPrice: this.product.finalPrice,
          colorVariants: [...this.product.colorVariants],
          imagePaths: {},
          // Add stock data
          stock: this.product.colorVariants.length === 0 ? this.product.stock : undefined,
          stockByColor: this.product.colorVariants.length > 0 ? {...this.stockByColor} : undefined
        };

        // Convert any new image uploads to base64 and store them
        for (const color of this.product.colorVariants) {
          const imageObj = this.product.images[color];
          if (imageObj && imageObj.preview) {
            try {
              productData.imagePaths[color] = imageObj.preview;
            } catch (error) {
              console.error(`Error processing ${color} image:`, error);
              this.$q.loading.hide();
              this.$q.notify({
                type: 'negative',
                message: `Error processing ${color} image. Please try uploading it again.`,
                timeout: 3000
              });
              return;
            }
          } else if (this.isEdit && this.editProduct && this.editProduct.imagePaths && this.editProduct.imagePaths[color]) {
            // Preserve existing image in edit mode
            productData.imagePaths[color] = this.editProduct.imagePaths[color];
          }
        }

        // Ensure we have all required images
        if (Object.keys(productData.imagePaths).length !== this.product.colorVariants.length) {
          this.$q.loading.hide();
          this.$q.notify({
            type: 'negative',
            message: 'Some images are missing. Please check all color variants have images.',
            timeout: 3000
          });
          return;
        }

        if (this.isEdit) {
          this.$emit('save', productData);
        } else {
          const success = store.addProduct(productData);
          if (!success) {
            throw new Error('Failed to add product to store');
          }
        }
        
        try {
          this.$q.loading.hide();
        } catch (loadingError) {
          console.error('Loading plugin error:', loadingError);
        }
        
        this.$q.notify({
          type: 'positive',
          message: `Product ${this.isEdit ? 'updated' : 'added'} successfully!`,
          timeout: 2000,
          position: 'top'
        });
        
        // Clear the form data
        if (!this.isEdit) {
          this.product = {
            productId: '',
            name: '',
            description: '',
            category: '',
            hasDiscount: false,
            discountPercent: 0,
            originalPrice: 0,
            finalPrice: 0,
            colorVariants: [],
            images: {}
          };
        }
        
        this.$emit('close');
      } catch (error) {
        console.error('Error processing product:', error);
        try {
          this.$q.loading.hide();
        } catch (loadingError) {
          console.error('Loading plugin error:', loadingError);
        }
        
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Error saving product. Please try again.',
          timeout: 3000
        });
      }
    }
  }
};
</script>