<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h3 text-white q-mt-md q-mb-md">Welcome</div>
      </q-card-section>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input v-model="email" label="Email" type="email" outlined dense class="white-input" label-color="white" />

        <q-input v-model="password" :type="isPwd ? 'password' : 'text'" label="Password" outlined dense
          class="dark-input" label-color="white">
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer text-grey-5"
              @click="isPwd = !isPwd" />
          </template>
        </q-input>

        <q-btn label="Sign in" type="submit" color="grey-8" text-color="white" unelevated class="full-width rounded-btn"
          :loading="loading" />

      </q-form>

      <div class="text-center text-grey-5 q-mt-md">
        Don’t have an account?
        <a href="#" class="signup-link" @click.prevent="showSignup = true">Sign up, it’s free!</a>
      </div>
    </q-card>

    <!-- Signup Dialog -->
    <q-dialog v-model="showSignup">
      <q-card style="min-width: 350px;">
        <q-card-section>
          <div class="text-h6">Sign Up</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="signupData.name" label="Name" outlined dense />
          <q-input v-model="signupData.email" label="Email" outlined dense />
          <q-input v-model="signupData.password" label="Password" type="password" outlined dense />
          <q-select v-model="signupData.role" :options="['buyer', 'seller']" label="Role" outlined dense />
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
  background: radial-gradient(circle at top, rgba(40, 44, 52, 1), rgba(15, 17, 20, 1));
  background-size: cover;
  color: white;
}

.login-card {
  width: 100vh;
  height: 75vh;
  background: rgba(38, 92, 255, 0.205);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  padding: 100px;
}

.dark-input .q-field__control {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: white;
}

.rounded-btn {
  border-radius: 12px;
  color: white;
}

.signup-link {
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

/* Make input text light for the email field (white-input) */
.white-input :deep(.q-field__control),
.white-input :deep(.q-field__native),
.white-input :deep(.q-placeholder) {
  color: #ffffff;
  caret-color: #ffffff;
}

/* Ensure label stays white when focused / floated */
.white-input :deep(.q-field__label) {
  color: #ffffff;
}

.dark-input .q-field__control {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: white;
}

.rounded-btn {
  border-radius: 12px;
  color: white;
}

.signup-link {
  color: white;
  text-decoration: underline;
  cursor: pointer;
}
</style>
