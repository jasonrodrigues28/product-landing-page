<template>
  <div class="review-form q-mb-lg">
    <!-- Review Form Card - Always visible -->
    <q-card flat bordered class="bg-dark review-form-card q-pa-md">
      <div class="text-h6 q-mb-md">Write a Review</div>
      
      <q-form @submit.prevent="submitReview" ref="reviewForm">
        <!-- Rating Selection -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Your Rating *</div>
          <q-rating
            v-model="review.rating"
            :max="5"
            color="amber"
            icon="star_border"
            icon-selected="star"
            size="2em"
          />
          <div class="text-caption q-mt-xs">
            {{ review.rating ? ratingLabels[review.rating-1] : 'Select a rating' }}
          </div>
        </div>
        
        <!-- Review Title -->
        <q-input
          v-model="review.title"
          label="Review Title *"
          :rules="[val => val && val.length > 0 || 'Title is required']"
          outlined
          dense
          class="q-mb-md"
        />
        
        <!-- Review Content -->
        <q-input
          v-model="review.comment"
          type="textarea"
          label="Your Review *"
          :rules="[val => val && val.length > 10 || 'Review must be at least 10 characters']"
          outlined
          autogrow
          class="q-mb-md"
          rows="5"
          hint="Tell others what you think about this product"
        />
        
        <!-- Images Upload (Optional) -->
        <div v-if="allowImages" class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Upload Images (Optional)</div>
          <q-file
            v-model="reviewImages"
            label="Choose images"
            accept="image/*"
            outlined
            dense
            multiple
            use-chips
            max-files="3"
            hint="Maximum 3 images"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          
          <!-- Image Previews -->
          <div v-if="imagePreviewUrls.length > 0" class="row q-col-gutter-sm q-mt-sm">
            <div v-for="(url, idx) in imagePreviewUrls" :key="idx" class="col-4 col-sm-3">
              <q-img :src="url" class="rounded-borders" style="height: 100px; width: 100px">
                <div class="absolute-top-right">
                  <q-btn round dense flat icon="close" size="xs" @click="removeImage(idx)" />
                </div>
              </q-img>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="row justify-end q-mt-md">
          <q-btn 
            label="Cancel" 
            flat 
            color="negative" 
            @click="cancelReview" 
            class="q-mr-sm"
          />
          <q-btn 
            :label="config.submitLabel || 'Submit Review'" 
            type="submit" 
            color="primary" 
            :loading="submitting" 
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script>
import { useReviewStore } from 'src/stores/reviewStore'

export default {
  name: 'ReviewForm',
  props: {
    productId: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      default: () => ({
        submitLabel: 'Submit Review',
        allowImages: false,
        ratingLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
      })
    },
    allowImages: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['review-submitted', 'form-canceled'],
  
  data() {
    return {
      submitting: false,
      reviewImages: [],
      imagePreviewUrls: [],
      review: {
        rating: 0,
        title: '',
        comment: ''
      }
    }
  },
  
  computed: {
    ratingLabels() {
      return this.config.ratingLabels || ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    }
  },
  
  methods: {
    handleImageChange() {
      this.imagePreviewUrls = []
      
      if (this.reviewImages && this.reviewImages.length) {
        for (let i = 0; i < this.reviewImages.length; i++) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.imagePreviewUrls.push(e.target.result)
          }
          reader.readAsDataURL(this.reviewImages[i])
        }
      }
    },
    
    removeImage(index) {
      if (this.reviewImages && this.reviewImages.length) {
        // Create new arrays without the removed image
        const newReviewImages = Array.from(this.reviewImages)
        newReviewImages.splice(index, 1)
        
        // Update files and previews
        this.reviewImages = newReviewImages
        this.imagePreviewUrls.splice(index, 1)
      }
    },
    
    async submitReview() {
      // Validate form
      if (!this.review.rating) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select a rating',
          position: 'top'
        })
        return
      }

      this.submitting = true
      const reviewStore = useReviewStore()

      try {
        // Add images if any
        const reviewData = { ...this.review }
        if (this.allowImages && this.imagePreviewUrls.length > 0) {
          reviewData.images = this.imagePreviewUrls
        }

        // Save review
        await reviewStore.addReview(this.productId, reviewData)

        // Success notification
        this.$q.notify({
          type: 'positive',
          message: 'Review submitted successfully',
          position: 'top'
        })

        this.$refs.reviewForm.resetValidation();
        // Reset form
        this.review = { rating: 0, title: '', comment: '' }
        this.reviewImages = []
        this.imagePreviewUrls = []
        // Reset validation state to clear errors
        
          
        

        // Emit event
        this.$emit('review-submitted')
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to submit review: ${error.message}`,
          position: 'top'
        })
      } finally {
        this.submitting = false
      }
    },
    
    cancelReview() {
      this.review = { rating: 0, title: '', comment: '' }
      this.reviewImages = []
      this.imagePreviewUrls = []
      // Reset validation state to clear errors
      if (this.$refs.reviewForm) {
        this.$refs.reviewForm.resetValidation();
      }
      this.$emit('form-canceled')
    }
  },
  
  watch: {
    reviewImages: {
      handler: 'handleImageChange',
      deep: true
    }
  }
}
</script>

<style scoped>
.review-form-card {
  background: rgba(30, 30, 30, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Dark theme input styles */
:deep(.q-field__native),
:deep(.q-field__prefix),
:deep(.q-field__suffix),
:deep(.q-field__input) {
  color: white !important;
}

:deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>
