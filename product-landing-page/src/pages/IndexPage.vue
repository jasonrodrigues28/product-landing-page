<template>
  <q-page class="login-page">
    <q-card class="login-card q-pa-lg">
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Login</div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="email" label="Email" type="email" outlined :rules="[val => !!val || 'Email is required']" />

          <q-input v-model="password" label="Password" :type="isPwd ? 'password' : 'text'" outlined
            :rules="[val => !!val || 'Password is required']">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>

          <q-btn label="Login" type="submit" color="primary" class="full-width" :loading="loading" />
          <q-btn label="Sign Up" flat color="secondary" class="full-width" @click="showSignup = true" />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Signup Dialog -->
    <q-dialog v-model="showSignup">
      <q-card style="min-width: 350px;">
        <q-card-section>
          <div class="text-h6">Sign Up</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="signupData.name" label="Name" outlined />
          <q-input v-model="signupData.email" label="Email" outlined />
          <q-input v-model="signupData.password" label="Password" type="password" outlined />
          <q-select v-model="signupData.role" :options="['buyer', 'seller']" label="Role" outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Register" color="primary" @click="registerUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useUserStore } from 'src/stores/user'

export default {
  name: 'IndexPage',

  data() {
    return {
      email: '',
      password: '',
      isPwd: true,
      loading: false,
      showSignup: false,
      signupData: { name: '', email: '', password: '', role: '' }
    }
  },

  methods: {
    async onSubmit() {
      this.loading = true
      const userStore = useUserStore()

      try {
        const success = await userStore.login({
          email: this.email,
          password: this.password
        })

        if (success) {
          if (userStore.checkIsSeller()) {
            this.$router.push('/seller')
          } else if (userStore.checkIsBuyer()) {
            this.$router.push('/buyer')
          }
        } else {
          this.$q.notify({ color: 'negative', message: 'Invalid credentials' })
        }
      } catch (error) {
        this.$q.notify({ color: 'negative', message: `Login failed: ${error.message}` })
      } finally {
        this.loading = false
      }
    },

    registerUser() {
      const { name, email, password, role } = this.signupData
      const userStore = useUserStore()

      if (!name || !email || !password || !role) {
        this.$q.notify({ color: 'negative', message: 'Please fill all fields' })
        return
      }

      const result = userStore.registerUser({ name, email, password, role })
      this.$q.notify({ color: result.success ? 'positive' : 'negative', message: result.message })

      if (result.success) {
        this.showSignup = false
        this.signupData = { name: '', email: '', password: '', role: '' }
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.q-input {
  font-size: 14px;
}

.q-btn.full-width {
  border-radius: 8px;
}

.q-dialog .q-card {
  border-radius: 10px;
}
</style>
