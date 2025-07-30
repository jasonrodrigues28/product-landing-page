<template>
    <q-page class="q-pa-md flex flex-center">
        <q-card class="q-pa-lg" style="width: 100%; max-width: 400px;">
            <q-card-section>
                <div class="text-h6">Login</div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="handleLogin">
                    <q-input v-model="username" :placeholder="config.username.placeholder"
                        :maxlength="config.username.maxLength" label="Username" filled class="q-mb-md" />
                    <q-input v-model="password" :placeholder="config.password.placeholder"
                        :maxlength="config.password.maxLength" label="Password" type="password" filled
                        class="q-mb-md" />

                    <q-btn type="submit" color="primary" :label="config.button.text" class="full-width" />
                </q-form>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import loginConfig from "../configs/login.config.json";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";

export default {
    name: "LoginPage",
    data() {
        return {
            username: "",
            password: "",
            config: loginConfig
        };
    },
    setup() {
        const router = useRouter();
        const userStore = useUserStore();
        return { router, userStore };
    },
    methods: {
        handleLogin() {
            // 👇 Temporary fake login logic
            const role = this.username.toLowerCase(); // e.g., "buyer", "seller", "admin"

            if (!this.config.roles.includes(role)) {
                this.$q.notify({
                    type: "negative",
                    message: "Invalid role/user"
                });
                return;
            }

            this.userStore.login({
                username: this.username,
                role: role
            });

            // 🔀 Redirect to correct dashboard
            if (role === "buyer") {
                this.router.push("/buyer-dashboard");
            } else if (role === "seller") {
                this.router.push("/seller-dashboard");
            } else if (role === "admin") {
                this.router.push("/admin-dashboard");
            }
        }
    }
};
</script>
