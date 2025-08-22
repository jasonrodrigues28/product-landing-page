// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPQ7Ylmdz-6FhGCYzRn6OSdzXVaysG6h8",
  authDomain: "product-landing-page-fb3b8.firebaseapp.com",
  databaseURL: "https://product-landing-page-fb3b8-default-rtdb.firebaseio.com", // Added default database URL
  projectId: "product-landing-page-fb3b8",
  storageBucket: "product-landing-page-fb3b8.firebasestorage.app",
  messagingSenderId: "840027663687",
  appId: "1:840027663687:web:a7cefdc60d5b07aa4db062",
  measurementId: "G-TRR77T6ZVT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app) // Initialize analytics
const db = getDatabase(app)

export { db, analytics }
