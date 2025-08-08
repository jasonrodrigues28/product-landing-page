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
      users: [],
    }

    if (savedState) {
      return JSON.parse(savedState)
    }

    // If no store saved, load default users from JSON
    defaultState.users = usersData
    return defaultState
  },

  actions: {
    saveToLocalStorage() {
      localStorage.setItem('userStore', JSON.stringify(this.$state))
    },

    loadUsers() {
      const storedUsers = localStorage.getItem('users')
      if (storedUsers) {
        this.users = JSON.parse(storedUsers)
      } else {
        this.users = usersData
      }
    },

    login(credentials) {
      // Make sure we have the latest user list
      this.loadUsers()

      const user = this.users.find(
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
      this.loadUsers()

      if (this.users.find((u) => u.email === newUser.email)) {
        return { success: false, message: 'User already exists' }
      }

      const userToAdd = { id: Date.now(), ...newUser }
      this.users.push(userToAdd)

      localStorage.setItem('users', JSON.stringify(this.users))
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
