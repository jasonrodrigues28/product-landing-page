<template>
  <div class="product-reviews q-mt-md">
    <!-- Review Summary Card -->
    <div class="review-summary q-mb-lg">
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
    
    <!-- Write a review - Always visible -->
    <div class="add-review q-mb-lg">
      <!-- Review form card is always visible -->
      <q-card flat bordered class="bg-dark review-form-card q-pa-md">
        <div class="text-h6 q-mb-md">Write a Review</div>
        
        <ReviewForm
          :submitting="submitting"
          :submit-label="config.buttons.submitReview"
          :rating-labels="ratingLabels"
          @submit="submitReview"
          @cancel="cancelReview"
        />
      </q-card>
    </div>
    
    <!-- Review list -->
    <div v-if="reviews.length > 0">
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
    <div v-else class="no-reviews text-center q-py-xl">
      <q-icon name="rate_review" size="3rem" color="grey-6" />
      <div class="text-h6 q-mt-md">No reviews yet</div>
      <div class="text-subtitle1 q-mt-sm">Be the first to review this product</div>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import ReviewForm from './ReviewForm.vue'
import { useReviewStore } from 'src/stores/reviewStore'
import { useUserStore } from 'src/stores/user'

export default {
  name: 'ReviewList',
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
      required: true
    }
  },
  
  data() {
    return {
      reviews: [],
      showAddReview: true, // Always show the review form by default
      submitting: false,
      sortBy: 'newest',
      
      // Review form data
      review: {
        rating: 0,
        title: '',
        comment: ''
      },
      
      // Store instances
      reviewStore: useReviewStore(),
      userStore: useUserStore()
    }
  },
  
  computed: {
    // Map rating labels
    ratingLabels() {
      return this.config.ratingLabels || ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    
    // Sort options for dropdown
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
    
    // Average rating
    averageRating() {
      if (this.reviews.length === 0) return 0
      const sum = this.reviews.reduce((total, review) => total + review.rating, 0)
      return sum / this.reviews.length
    },
    
    // Review count
    reviewCount() {
      return this.reviews.length
    },
    
    // Get reviews sorted
    sortedReviews() {
      if (!this.reviews.length) return []
      
      return [...this.reviews].sort((a, b) => {
        if (this.sortBy === 'newest') {
          return new Date(b.date) - new Date(a.date)
        } else if (this.sortBy === 'highest') {
          return b.rating - a.rating
        } else if (this.sortBy === 'lowest') {
          return a.rating - b.rating
        }
        return 0
      })
    }
  },
  
  mounted() {
    this.fetchReviews()
    // Default sort
    this.sortBy = this.config.defaultSort || 'newest'
  },
  
  methods: {
    // Calculate percentage for each star rating
    getRatingPercentage(star) {
      if (this.reviews.length === 0) return 0
      const count = this.reviews.filter(r => r.rating === star).length
      return count / this.reviews.length
    },
    
    // Count for each star rating
    getRatingCount(star) {
      return this.reviews.filter(r => r.rating === star).length
    },
    
    // Format date
    formatDate(dateString) {
      const dateObj = new Date(dateString)
      return date.formatDate(dateObj, 'MMMM D, YYYY')
    },
    
    // Check if current user can manage this review
    canManageReview(review) {
      return this.userStore.email === review.userId
    },
    
    // Submit new review
    async submitReview(reviewData) {
      if (!reviewData.rating) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select a rating',
          position: 'top'
        })
        return
      }
      
      this.submitting = true
      
      try {
        await this.reviewStore.addReview(this.productId, reviewData)
        
        this.$q.notify({
          type: 'positive',
          message: 'Review submitted successfully',
          position: 'top'
        })
        
        // Keep the form visible
        
        // Refresh reviews
        this.fetchReviews()
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
    
    // Cancel adding review - just reset the form without hiding it
    cancelReview() {
      // Form stays visible
      this.review = { rating: 0, title: '', comment: '' }
    },
    
    // Delete a review
    deleteReview(reviewId) {
      this.$q.dialog({
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.reviewStore.deleteReview(this.productId, reviewId)
          
          this.$q.notify({
            type: 'positive',
            message: 'Review deleted successfully',
            position: 'top'
          })
          
          this.fetchReviews()
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: `Failed to delete review: ${error.message}`,
            position: 'top'
          })
        }
      })
    },
    
    // Mark review as helpful or not
    async markHelpful(reviewId, isHelpful) {
      try {
        await this.reviewStore.markHelpful(this.productId, reviewId, isHelpful)
        this.fetchReviews()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update review: ${error.message}`,
          position: 'top'
        })
      }
    },
    
    // Fetch reviews for this product
    fetchReviews() {
      this.reviews = this.reviewStore.getReviews(this.productId)
    }
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

.review-form-card {
  background: rgba(30, 30, 30, 0.7) !important;
}

.sort-select {
  width: 200px;
}

.helpful-section {
  color: #999;
}
</style>
