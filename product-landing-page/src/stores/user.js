import { defineStore } from 'pinia'
import usersData from '../configs/users.json'

export const useUserStore = defineStore('user', {
  state: () => {
    const savedState = localStorage.getItem('userStore')
    const defaultState = {
      isAuthenticated: false,
      username: '',
      role: '',
      email: '',
    }

    if (savedState) {
      return JSON.parse(savedState)
    }

    return defaultState
  },

  actions: {
    saveToLocalStorage() {
      localStorage.setItem('userStore', JSON.stringify(this.$state))
    },

    login(credentials) {
      // Load registered users from localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]')

      // You can also append demo users if you want them always available
      users = users.concat([
        { email: 'seller@example.com', password: 'seller123', name: 'Seller', role: 'seller' },
        { email: 'buyer@example.com', password: 'buyer123', name: 'Buyer', role: 'buyer' },
      ])

      const user = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password,
      )

      if (user) {
        this.isAuthenticated = true
        this.username = user.name
        this.role = user.role
        this.email = user.email
        this.saveToLocalStorage()
        return true
      }

      return false
    },
    registerUser(newUser) {
      // Load current users from localStorage if present
      let users = JSON.parse(localStorage.getItem('users') || '[]')

      // Prevent duplicates
      if (users.find((u) => u.email === newUser.email)) {
        return { success: false, message: 'User already exists' }
      }

      const userToAdd = { id: Date.now(), ...newUser }
      users.push(userToAdd)

      localStorage.setItem('users', JSON.stringify(users))
      return { success: true, message: 'Registration successful!' }
    },
    logout() {
      this.isAuthenticated = false
      this.username = ''
      this.role = ''
      this.email = ''
      this.saveToLocalStorage()
    },

    checkIsSeller() {
      return this.isAuthenticated && this.role === 'seller'
    },

    checkIsBuyer() {
      return this.isAuthenticated && this.role === 'buyer'
    },
  },
})
