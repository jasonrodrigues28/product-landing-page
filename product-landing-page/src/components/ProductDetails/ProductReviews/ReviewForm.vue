<template>
  <div class="review-form">
    <!-- Show login message if not authenticated -->
    <div v-if="!userStore.isAuthenticated" class="login-required q-pa-md text-center">
      <q-icon name="login" size="2em" color="primary" />
      <div class="text-subtitle1 q-mt-sm">Please log in to submit a review</div>
      <q-btn to="/login" color="primary" label="Log In" class="q-mt-md" />
    </div>
    
    <!-- Review form for authenticated users -->
    <q-form v-else @submit.prevent="submitReview" ref="reviewForm">
      <!-- Rating -->
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
        :rules="[val => val && val.length > 0 || 'Review is required']"
        outlined
        autogrow
        class="q-mb-md"
        rows="4"
      />
      
      <!-- Actions -->
      <div class="row justify-end q-mt-md">
        <q-btn 
          label="Cancel" 
          flat 
          color="negative" 
          @click="$emit('cancel')" 
          class="q-mr-sm"
        />
        <q-btn 
          :label="submitLabel"
          type="submit" 
          color="primary" 
          :loading="submitting" 
        />
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from 'src/stores/user'

export default {
  name: 'ReviewForm',
  props: {
    initialRating: {
      type: Number,
      default: 0
    },
    initialTitle: {
      type: String,
      default: ''
    },
    initialComment: {
      type: String,
      default: ''
    },
    ratingLabels: {
      type: Array,
      default: () => ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    },
    submitting: {
      type: Boolean,
      default: false
    },
    submitLabel: {
      type: String,
      default: 'Submit Review'
    }
  },
  
  emits: ['submit', 'cancel'],
  
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    // Review data with initial values
    const review = ref({
      rating: props.initialRating,
      title: props.initialTitle,
      comment: props.initialComment
    })
    
    // Submit review function
    const submitReview = () => {
      if (!review.value.rating) {
        // Rating is required
        return
      }
      
      emit('submit', { ...review.value })
    }
    
    return {
      review,
      submitReview,
      userStore
    }
  }
}
</script>

<style scoped>
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

.login-required {
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}
</style>
