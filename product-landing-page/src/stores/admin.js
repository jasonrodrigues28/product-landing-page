import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
  }),
  actions: {
    loadUsers() {
      // Load all users from localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]')

      this.users = users
      // add storage event listener once to keep in sync across tabs/components
      if (!window.__admin_store_listener_added__) {
        window.addEventListener('storage', (e) => {
          if (e.key === 'users') {
            try {
              const newUsers = JSON.parse(e.newValue || '[]')
              this.users = newUsers
            } catch {
              // ignore parse errors
            }
          }
        })
        window.__admin_store_listener_added__ = true
      }
    },
    deleteUser(userId) {
      // Remove user from localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]')
      users = users.filter((u) => u.id !== userId)
      localStorage.setItem('users', JSON.stringify(users))
      // Update state
      this.users = this.users.filter((u) => u.id !== userId)
    },
  },
})
