import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useReviewStore = defineStore('review', {
  state: () => {
    const savedReviews = localStorage.getItem('productReviews')
    return {
      reviews: savedReviews ? JSON.parse(savedReviews) : {}
    }
  },
  
  actions: {
    saveToLocalStorage() {
      localStorage.setItem('productReviews', JSON.stringify(this.reviews))
    },
    
    getReviews(productId) {
      return this.reviews[productId] || []
    },
    
    addReview(productId, reviewData) {
      const userStore = useUserStore()
      
      // Ensure user is logged in
      if (!userStore.isAuthenticated) {
        throw new Error('You must be logged in to submit a review')
      }
      
      // Initialize array for this product if needed
      if (!this.reviews[productId]) {
        this.reviews[productId] = []
      }
      
      // Create the review object
      const review = {
        id: Date.now().toString(),
        productId,
        userId: userStore.email,
        username: userStore.username,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        date: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        verified: true // Could be based on purchase history
      }
      
      // Add to reviews
      this.reviews[productId].push(review)
      this.saveToLocalStorage()
      
      return review
    },
    
    updateReview(productId, reviewId, data) {
      if (!this.reviews[productId]) return false
      
      const index = this.reviews[productId].findIndex(r => r.id === reviewId)
      if (index === -1) return false
      
      this.reviews[productId][index] = {
        ...this.reviews[productId][index],
        ...data,
        edited: true,
        editDate: new Date().toISOString()
      }
      
      this.saveToLocalStorage()
      return true
    },
    
    deleteReview(productId, reviewId) {
      if (!this.reviews[productId]) return false
      
      const initialLength = this.reviews[productId].length
      this.reviews[productId] = this.reviews[productId].filter(r => r.id !== reviewId)
      
      if (this.reviews[productId].length !== initialLength) {
        this.saveToLocalStorage()
        return true
      }
      
      return false
    },
    
    markHelpful(productId, reviewId, isHelpful) {
      if (!this.reviews[productId]) return false
      
      const review = this.reviews[productId].find(r => r.id === reviewId)
      if (!review) return false
      
      if (isHelpful) {
        review.helpful++
      } else {
        review.notHelpful++
      }
      
      this.saveToLocalStorage()
      return true
    }
  },
  
  getters: {
    averageRating: (state) => (productId) => {
      const productReviews = state.reviews[productId] || []
      if (productReviews.length === 0) return 0
      
      const sum = productReviews.reduce((total, review) => total + review.rating, 0)
      return sum / productReviews.length
    },
    
    reviewCount: (state) => (productId) => {
      return (state.reviews[productId] || []).length
    }
  }
})