<template>
  <q-page class="flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Login</div>
        
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !!val || 'Email is required']"
          />

          <q-input
            v-model="password"
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            :rules="[val => !!val || 'Password is required']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="text-caption q-mb-md">
            Demo Credentials:<br>
            Seller: seller@example.com / seller123<br>
            Buyer: buyer@example.com / buyer123
          </div>

          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
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
      loading: false
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
          // Redirect based on role
          if (userStore.checkIsSeller()) {
            this.$router.push('/seller')
          } else if (userStore.checkIsBuyer()) {
            this.$router.push('/buyer')
          }
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Invalid credentials'
          })
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: `Login failed: ${error.message}`
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>