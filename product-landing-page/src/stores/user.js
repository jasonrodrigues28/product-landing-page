import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    const savedState = localStorage.getItem('userStore');
    const defaultState = {
      isAuthenticated: false,
      username: '',
      role: '',
      email: ''
    };

    if (savedState) {
      return JSON.parse(savedState);
    }

    return defaultState;
  },

  actions: {
    saveToLocalStorage() {
      localStorage.setItem('userStore', JSON.stringify(this.$state));
    },

    login(credentials) {
      // Demo credentials
      const users = {
        seller: {
          email: 'seller@example.com',
          password: 'seller123',
          username: 'Seller',
          role: 'seller'
        },
        buyer: {
          email: 'buyer@example.com',
          password: 'buyer123',
          username: 'Buyer',
          role: 'buyer'
        }
      };

      // Check credentials
      const user = Object.values(users).find(u => 
        u.email === credentials.email && 
        u.password === credentials.password
      );

      if (user) {
        this.isAuthenticated = true;
        this.username = user.username;
        this.role = user.role;
        this.email = user.email;
        this.saveToLocalStorage();
        return true;
      }

      return false;
    },

    logout() {
      this.isAuthenticated = false;
      this.username = '';
      this.role = '';
      this.email = '';
      this.saveToLocalStorage();
    },

    checkIsSeller() {
      return this.isAuthenticated && this.role === 'seller';
    },

    checkIsBuyer() {
      return this.isAuthenticated && this.role === 'buyer';
    }
  }
})
