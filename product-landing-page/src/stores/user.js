import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    role: '',
  }),
  actions: {
    login(payload) {
      this.username = payload.username
      this.role = payload.role
    },
    logout() {
      this.username = ''
      this.role = ''
    },
  },
})
