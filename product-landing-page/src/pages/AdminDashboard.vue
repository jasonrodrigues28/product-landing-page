<template>
    <q-page class="q-pa-md">
        <div class="text-h5 q-mb-md">Admin Dashboard</div>
        <q-table :rows="users" :columns="columns" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }">
            <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                    <q-btn color="negative" icon="delete" dense flat @click="confirmDelete(props.row)" />
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="showConfirm" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Are you sure you want to delete this user?</div>
                    <div class="q-mt-sm">{{ userToDelete?.name }} ({{ userToDelete?.email }})</div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cancel" v-close-popup @click="showConfirm = false" />
                    <q-btn color="negative" label="Delete" @click="deleteUser" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-btn style="padding: 2%;" @click="handleLogout">
            Back to login
        </q-btn>
    </q-page>
</template>

<script>
import { useAdminStore } from 'src/stores/admin'
import appConfig from 'src/configs/appConfig.json'

export default {
    name: 'AdminDashboard',
    data() {
        return {
            columns: appConfig.adminTable.columns,
            showConfirm: false,
            userToDelete: null
        }
    },
    computed: {
        users() {
            return useAdminStore().users
        }
    },
    created() {
        useAdminStore().loadUsers()
    },
    methods: {
        confirmDelete(user) {
            this.userToDelete = user
            this.showConfirm = true
        },
        deleteUser() {
            if (this.userToDelete) {
                useAdminStore().deleteUser(this.userToDelete.id)
                this.showConfirm = false
                this.userToDelete = null
            }
        },

        handleLogout() {
            // Always redirect to login page on logout
            this.$router.push({ name: 'login' });
        }

    }
}
</script>
