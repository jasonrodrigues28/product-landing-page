<template>
  <div class="product-review-section q-my-lg">
    <!-- Review Summary -->
    <div class="review-summary q-mb-lg" v-if="showSummary">
      <q-card flat class="bg-transparent review-card">
        <q-card-section class="row items-center q-py-lg">
          <!-- Left: Average Rating -->
          <div class="col-12 col-md-4 text-center">
            <div class="text-h2 text-weight-bold">{{ averageRating.toFixed(1) }}</div>
            <q-rating
              size="2em"
              :model-value="averageRating"
              :max="5"
              color="amber"
              icon="star_border"
              icon-selected="star"
              icon-half="star_half"
              readonly
            />
            <div class="text-subtitle1 q-mt-sm">{{ reviewCount }} Review{{ reviewCount !== 1 ? 's' : '' }}</div>
          </div>
          
          <!-- Right: Rating breakdown -->
          <div class="col-12 col-md-8 q-pl-md-lg">
            <div v-for="i in 5" :key="i" class="row items-center q-mb-sm">
              <div class="col-2 text-right">{{ 6-i }} stars</div>
              <div class="col-8 q-px-md">
                <q-linear-progress
                  :value="getRatingPercentage(6-i)"
                  color="amber"
                  track-color="grey-8"
                  style="height: 8px"
                />
              </div>
              <div class="col-2">
                {{ getRatingCount(6-i) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Review Form - Always visible -->
    <ReviewForm
      :product-id="productId"
      :config="formConfig" 
      :allow-images="allowImages"
      @review-submitted="loadReviews"
    />
    
    <!-- Review List -->
    <div v-if="reviews.length > 0" class="review-list">
      <!-- Sort control -->
      <div class="row justify-between items-center q-mb-md">
        <div class="text-subtitle1">{{ reviews.length }} Review{{ reviews.length !== 1 ? 's' : '' }}</div>
        
        <q-select
          v-model="sortBy"
          :options="sortOptions"
          label="Sort by"
          outlined
          dense
          emit-value
          map-options
          options-dense
          class="sort-select"
          bg-color="dark"
        />
      </div>
      
      <!-- Individual reviews -->
      <q-card
        v-for="review in sortedReviews"
        :key="review.id"
        flat
        bordered
        class="review-item q-mb-md bg-transparent"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="col-auto">
              <q-avatar color="primary" text-color="white">
                {{ review.username.charAt(0).toUpperCase() }}
              </q-avatar>
            </div>
            <div class="col q-ml-md">
              <div class="text-h6">{{ review.title }}</div>
              <div class="row items-center">
                <q-rating
                  :model-value="review.rating"
                  :max="5"
                  size="1em"
                  color="amber"
                  readonly
                />
                <div class="q-ml-sm">
                  {{ review.username }}
                </div>
                <div class="text-caption q-ml-sm">
                  {{ formatDate(review.date) }}
                </div>
                <q-badge v-if="review.verified" color="green" class="q-ml-sm">
                  Verified Purchase
                </q-badge>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-section>
          <div>{{ review.comment }}</div>
          
          <!-- Display review images if any -->
          <div v-if="review.images && review.images.length > 0" class="row q-col-gutter-sm q-mt-md">
            <div v-for="(img, idx) in review.images" :key="idx" class="col-4 col-sm-2">
              <q-img 
                :src="img" 
                class="rounded-borders cursor-pointer"
                style="height: 100px; width: 100px"
                @click="openImageViewer(review.images, idx)"
              />
            </div>
          </div>
        </q-card-section>
        
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="helpful-section">
              Was this review helpful?
              <q-btn flat round size="sm" color="grey" icon="thumb_up" @click="markHelpful(review.id, true)" />
              {{ review.helpful || 0 }}
              <q-btn flat round size="sm" color="grey" icon="thumb_down" @click="markHelpful(review.id, false)" class="q-ml-sm" />
              {{ review.notHelpful || 0 }}
            </div>
            
            <div v-if="canManageReview(review)">
              <q-btn flat round size="sm" color="grey" icon="delete" @click="deleteReview(review.id)" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- No reviews yet -->
    <div v-else-if="showEmptyState" class="no-reviews text-center q-py-xl">
      <q-icon name="rate_review" size="3rem" color="grey-6" />
      <div class="text-h6 q-mt-md">No reviews yet</div>
      <div class="text-subtitle1 q-mt-sm">Be the first to review this product</div>
    </div>
    
    <!-- Image viewer dialog -->
    <q-dialog v-model="imageDialog">
      <q-carousel
        v-model="imageSlide"
        animated
        arrows
        height="70vh"
        navigation
        infinite
        navigation-position="bottom"
        padding
        class="bg-black"
      >
        <q-carousel-slide 
          v-for="(img, idx) in viewerImages" 
          :key="idx"
          :name="idx" 
          :img-src="img"
          class="column flex-center no-wrap"
        />
      </q-carousel>
    </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar'
import { useReviewStore } from 'src/stores/reviewStore'
import { useUserStore } from 'src/stores/user'
import ReviewForm from './ReviewForm.vue'

export default {
  name: 'ProductReview',
  components: {
    ReviewForm
  },
  props: {
    productId: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      default: () => ({
        sorting: ['newest', 'highest', 'lowest'],
        defaultSort: 'newest',
        ratingLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        buttons: {
          submitReview: 'Submit Review'
        }
      })
    },
    showSummary: {
      type: Boolean,
      default: true
    },
    showEmptyState: {
      type: Boolean,
      default: true
    },
    allowImages: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      reviews: [],
      sortBy: this.config.defaultSort || 'newest',
      imageDialog: false,
      imageSlide: 0,
      viewerImages: []
    }
  },
  
  computed: {
    formConfig() {
      return {
        submitLabel: this.config.buttons?.submitReview || 'Submit Review',
        allowImages: this.allowImages,
        ratingLabels: this.config.ratingLabels
      }
    },
    
    sortOptions() {
      const options = [
        { label: 'Newest', value: 'newest' },
        { label: 'Highest Rating', value: 'highest' },
        { label: 'Lowest Rating', value: 'lowest' }
      ]
      
      return options.filter(option => 
        this.config.sorting?.includes(option.value)
      )
    },
    
    sortedReviews() {
      if (this.reviews.length === 0) return []
      
      const sorted = [...this.reviews]
      
      switch (this.sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
        case 'highest':
          return sorted.sort((a, b) => b.rating - a.rating)
        case 'lowest':
          return sorted.sort((a, b) => a.rating - b.rating)
        default:
          return sorted
      }
    },
    
    averageRating() {
      if (this.reviews.length === 0) return 0
      const sum = this.reviews.reduce((total, review) => total + review.rating, 0)
      return sum / this.reviews.length
    },
    
    reviewCount() {
      return this.reviews.length
    }
  },
  
  methods: {
    getRatingPercentage(stars) {
      if (this.reviews.length === 0) return 0
      const count = this.getRatingCount(stars)
      return count / this.reviews.length
    },
    
    getRatingCount(stars) {
      return this.reviews.filter(review => review.rating === stars).length
    },
    
    formatDate(dateString) {
      const dateObj = new Date(dateString)
      return date.formatDate(dateObj, 'MMMM D, YYYY')
    },
    
    canManageReview(review) {
      const userStore = useUserStore()
      return userStore.email === review.userId
    },
    
    markHelpful(reviewId, isHelpful) {
      try {
        const reviewStore = useReviewStore()
        reviewStore.markHelpful(this.productId, reviewId, isHelpful)
        this.loadReviews()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update review: ${error.message}`,
          position: 'top'
        })
      }
    },
    
    deleteReview(reviewId) {
      this.$q.dialog({
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          const reviewStore = useReviewStore()
          await reviewStore.deleteReview(this.productId, reviewId)
          
          this.$q.notify({
            type: 'positive',
            message: 'Review deleted successfully',
            position: 'top'
          })
          
          this.loadReviews()
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: `Failed to delete review: ${error.message}`,
            position: 'top'
          })
        }
      })
    },
    
    openImageViewer(images, index) {
      this.viewerImages = images
      this.imageSlide = index
      this.imageDialog = true
    },
    
    loadReviews() {
      const reviewStore = useReviewStore()
      this.reviews = reviewStore.getReviews(this.productId)
    }
  },
  
  created() {
    this.loadReviews()
  }
}
</script>

<style scoped>
.review-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sort-select {
  width: 200px;
}

.helpful-section {
  color: #999;
}
</style>
