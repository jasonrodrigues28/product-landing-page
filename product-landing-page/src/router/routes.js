import MainLayout from '../layouts/MainLayout.vue'
import IndexPage from '../pages/IndexPage.vue'
import { useUserStore } from '../stores/user'

// Route guard for seller
const requireSeller = (to, from, next) => {
  const userStore = useUserStore()
  if (!userStore.checkIsSeller()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

// Route guard for buyer
const requireBuyer = (to, from, next) => {
  const userStore = useUserStore()
  if (!userStore.checkIsBuyer()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

// Route guard for authenticated users
const requireAuth = (to, from, next) => {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: IndexPage,
      },
      {
        path: '/test',
        name: 'test',
        component:() => import('../pages/TemporaryTest.vue'), 
      },
      {
        path: '/seller',
        name: 'seller',
        component: () => import('../pages/SellerDashboard.vue'),
        beforeEnter: requireSeller,
      },
      {
        path: '/buyer',
        name: 'buyer',
        component: () => import('../pages/BuyerDashboard.vue'),
        beforeEnter: requireBuyer,
      },
      {
        path: '/cart',
        name: 'cart',
        component: () => import('../pages/CartPage.vue'),
        beforeEnter: requireAuth,
      },
      {
  path: '/product/:id',
  name: 'productDetails',
  component: () => import('../pages/ProductDetails.vue'),
  props: true, // This passes the id param as a prop
  beforeEnter: requireAuth,
},
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes
