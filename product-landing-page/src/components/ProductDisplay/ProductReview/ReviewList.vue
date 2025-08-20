<template>
  <div class="product-reviews q-mt-md">
    <!-- Review Summary Card -->
    <div class="review-summary q-mb-lg" v-if="reviews.length > 0">
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
            <div class="text-subtitle1 q-mt-sm">{{ reviews.length }} Review{{ reviews.length !== 1 ? 's' : '' }}</div>
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
      <review-form
        :productId="productId"
        :config="config"
        :allowImages="config.allowImages"
        @review-submitted="onReviewSubmitted"
      />
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
          
          <!-- Review Images -->
          <div v-if="review.images && review.images.length > 0" class="row q-col-gutter-sm q-mt-md">
            <div v-for="(imgUrl, index) in review.images" :key="index" class="col-4 col-sm-2">
              <q-img :src="imgUrl" class="rounded-borders cursor-pointer" @click="openImageViewer(review.images, index)" />
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
    <div v-else class="no-reviews text-center q-py-xl">
      <q-icon name="rate_review" size="3rem" color="grey-6" />
      <div class="text-h6 q-mt-md">No reviews yet</div>
      <div class="text-subtitle1 q-mt-sm">Be the first to review this product</div>
    </div>
    
    <!-- Image Viewer Dialog -->
    <q-dialog v-model="imageDialog">
      <q-card class="image-viewer-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Review Images</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <q-carousel
            v-model="selectedImageIndex"
            animated
            arrows
            navigation
            infinite
            height="70vh"
          >
            <q-carousel-slide 
              v-for="(img, index) in dialogImages" 
              :key="index"
              :name="index"
              class="column flex-center"
            >
              <q-img :src="img" style="max-height: 70vh; max-width: 100%" contain />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { useReviewStore } from 'src/stores/reviewStore'
import { useUserStore } from 'src/stores/user'
import ReviewForm from './ReviewForm.vue'
import { date } from 'quasar'

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
      default: () => ({
        submitLabel: 'Submit Review',
        allowImages: false,
        ratingLabels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        defaultSort: 'newest',
        sorting: ['newest', 'highest', 'lowest']
      })
    }
  },
  
  data() {
    return {
      reviews: [],
      sortBy: this.config.defaultSort || 'newest',
      imageDialog: false,
      selectedImageIndex: 0,
      dialogImages: []
    }
  },
  
  computed: {
    averageRating() {
      if (this.reviews.length === 0) return 0
      const sum = this.reviews.reduce((total, review) => total + review.rating, 0)
      return sum / this.reviews.length
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
  
  methods: {
    fetchReviews() {
      const reviewStore = useReviewStore()
      this.reviews = reviewStore.getReviews(this.productId)
    },
    
    getRatingPercentage(star) {
      if (this.reviews.length === 0) return 0
      const count = this.reviews.filter(r => r.rating === star).length
      return count / this.reviews.length
    },
    
    getRatingCount(star) {
      return this.reviews.filter(r => r.rating === star).length
    },
    
    formatDate(dateString) {
      const dateObj = new Date(dateString)
      return date.formatDate(dateObj, 'MMMM D, YYYY')
    },
    
    canManageReview(review) {
      const userStore = useUserStore()
      return userStore.email === review.userId
    },
    
    onReviewSubmitted() {
      this.fetchReviews()
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
    
    markHelpful(reviewId, isHelpful) {
      try {
        const reviewStore = useReviewStore()
        reviewStore.markHelpful(this.productId, reviewId, isHelpful)
        this.fetchReviews()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update review: ${error.message}`,
          position: 'top'
        })
      }
    },
    
    openImageViewer(images, startIndex) {
      this.dialogImages = images
      this.selectedImageIndex = startIndex
      this.imageDialog = true
    }
  },
  
  created() {
    this.fetchReviews()
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

.image-viewer-card {
  width: 90vw;
  max-width: 1000px;
}

.no-reviews {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem 0;
}
</style>
