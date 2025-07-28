import MainLayout from '../layouts/MainLayout.vue'
import LoginPage from '../pages/LoginPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: LoginPage },
      { path: 'buyer-dashboard', component: () => import('../pages/BuyerDashboard.vue') },
      { path: 'seller-dashboard', component: () => import('../pages/SellerDashboard.vue') },
      { path: 'admin-dashboard', component: () => import('../pages/AdminDashboard.vue') },
    ],
  },
]

export default routes
