<template>
  <div class="product-gallery">
    <!-- Main image display -->
    <div class="main-image q-mb-md">
      <q-img
        :src="currentImage.url || 'https://placehold.co/600x400?text=No+Image'"
        :ratio="4/3"
        fit="contain"
        class="rounded-borders"
        :alt="currentImage.alt"
      >
        <template v-slot:loading>
          <q-spinner-dots color="white" size="40px" />
        </template>
        
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
            <q-icon name="error" size="2rem" />
          </div>
        </template>
      </q-img>
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="thumbnails-row row q-col-gutter-sm justify-center">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="col-auto"
      >
        <q-img
          :src="image.url || 'https://placehold.co/100x100?text=No+Image'"
          class="thumbnail-img cursor-pointer"
          :class="{ 'active-thumbnail': currentIndex === index }"
          @click="setCurrentImage(index)"
          width="60px"
          height="60px"
          fit="cover"
          :alt="image.alt"
        />
      </div>
    </div>
    
    <!-- Color labels if applicable -->
    <div v-if="hasColorVariants" class="color-selector q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Color: <span class="text-weight-bold">{{ currentImage.color }}</span></div>
      <div class="row q-col-gutter-sm">
        <div 
          v-for="(image, index) in images" 
          :key="image.color"
          class="col-auto"
        >
          <q-chip
            :label="image.color"
            :color="currentIndex === index ? 'primary' : 'grey-4'"
            text-color="white"
            clickable
            @click="setCurrentImage(index)"
            size="sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'ProductGallery',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => ({
        thumbnailsPosition: 'bottom',
        maxThumbnails: 5,
        zoomEnabled: false
      })
    }
  },
  setup(props) {
    const currentIndex = ref(0)
    
    // Compute current image
    const currentImage = computed(() => {
      return props.images[currentIndex.value] || { url: '', alt: 'No image available', color: '' }
    })
    
    // Check if we have color variants
    const hasColorVariants = computed(() => {
      return props.images.some(img => img.color)
    })
    
    // Set current image
    const setCurrentImage = (index) => {
      if (index >= 0 && index < props.images.length) {
        currentIndex.value = index
      }
    }
    
    // Reset current index if images change
    watch(() => props.images, () => {
      currentIndex.value = 0
    })
    
    onMounted(() => {
      // Initialize with first image
      if (props.images.length > 0) {
        currentIndex.value = 0
      }
    })
    
    return {
      currentIndex,
      currentImage,
      hasColorVariants,
      setCurrentImage
    }
  }
}
</script>

<style scoped>
.product-gallery {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.main-image {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.thumbnail-img {
  border-radius: 4px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.active-thumbnail {
  border-color: #1976d2;
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.thumbnail-img:hover {
  transform: scale(1.05);
}
</style>
