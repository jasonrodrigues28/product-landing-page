import { boot } from 'quasar/wrappers'
import { useProductStore } from '../stores/productStore'

export default boot(({ app }) => {
  const productStore = useProductStore()
  
  // Initialize Firebase listeners
  productStore.initFirebase()
  
  // Clean up on app unmount
  app.unmount(() => {
    productStore.clearFirebaseListeners()
  })
})
