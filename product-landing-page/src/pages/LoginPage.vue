<template>
    <q-page class="q-pa-md flex flex-center">
        <q-card class="q-pa-lg" style="width: 100%; max-width: 400px;">
            <q-card-section>
                <div class="text-h6">Seller Login</div>
                <div class="text-subtitle2 text-grey">Login to manage your products</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="handleLogin" class="q-gutter-md">
                    <q-input v-model="email" label="Email" type="email" outlined :rules="[
                        val => !!val || 'Email is required',
                        val => validateEmail(val) || 'Please enter a valid email'
                    ]" />

                    <q-input v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" outlined
                        :rules="[val => !!val || 'Password is required']">
                        <template v-slot:append>
                            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="showPassword = !showPassword" />
                        </template>
                    </q-input>

                    <div>
                        <q-btn type="submit" color="primary" label="Login" class="full-width" :loading="loading" />
                    </div>
                </q-form>
            </q-card-section>

            <q-card-section class="text-center text-grey">
                Demo credentials:<br>
                Email: seller@example.com<br>
                Password: seller123
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { useUserStore } from "../stores/user";
import { useRouter, useRoute } from "vue-router";

export default {
    name: "LoginPage",
    data() {
        return {
            email: "",
            password: "",
            showPassword: false,
            loading: false
        };
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const userStore = useUserStore();
        return { router, route, userStore };
    },
    methods: {
        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        handleLogin() {
            this.loading = true;

            // Simple validation
            if (!this.email || !this.password) {
                this.$q.notify({
                    type: "negative",
                    message: "Please fill in all fields",
                    position: 'top'
                });
                this.loading = false;
                return;
            }

            const success = this.userStore.login({
                username: this.email,
                password: this.password,
                role: 'seller'
            });

            if (success) {
                this.$q.notify({
                    type: "positive",
                    message: "Login successful!",
                    position: 'top'
                });

                // Redirect to the original destination or seller dashboard
                const redirectPath = this.route.query.redirect || '/seller';
                this.router.push(redirectPath);
            } else {
                this.$q.notify({
                    type: "negative",
                    message: "Invalid credentials",
                    position: 'top'
                });
            }

            this.loading = false;
        }
    }
};
</script>