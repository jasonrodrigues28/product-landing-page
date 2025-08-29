<template>
    <q-page class="q-pa-md category-page">
        <div class="text-h5 q-mb-md">{{ category }} - Subcategories</div>

        <div class="row q-col-gutter-md">
            <div v-for="sub in subcategories" :key="sub" class="col-12 col-sm-6 col-md-4 col-lg-3">
                <q-card class="product-card product-card-dark clickable-card" @click="openSub(sub)">
                    <q-card-section class="text-center">
                        <div class="text-h6">{{ sub }}</div>
                    </q-card-section>
                </q-card>
            </div>

            <div v-if="subcategories.length === 0" class="col-12 text-center q-pa-xl">
                <div class="text-h6 text-grey-6 q-mt-md">No subcategories available</div>
            </div>
        </div>
    </q-page>
</template>

<script>
import { useProductStore } from 'src/stores/productStore'

export default {
    name: 'CategoryPage',
    props: ['category'],
    data() {
        return { productStore: useProductStore() }
    },
    computed: {
        subcategories() {
            // Derive subcategories from a `subCategory` field on products or fallback to generic groups
            const subs = new Set(this.productStore.productList
                .filter(p => p.category === this.category)
                .map(p => p.subCategory || 'All'))
            return Array.from(subs)
        }
    },
    methods: {
        openSub(sub) {
            this.$router.push({ name: 'buyer', query: { category: this.category, subcategory: sub } })
        }
    }
}
</script>

<style scoped>
.clickable-card {
    cursor: pointer;
}
</style>
