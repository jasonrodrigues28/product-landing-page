<template>
    <q-page class="q-pa-md buyer-home-page">
        <div class="header-row q-mb-md">
            <div>
                <div class="text-h5">Shop by Category</div>
                <div class="text-subtitle2 text-grey-6">Browse top categories or view the entire store</div>
            </div>
            <div>
                <q-btn label="View Full Store" color="primary" unelevated @click="viewAll" />
            </div>
        </div>

        <div class="categories-grid">
            <div v-for="cat in categories" :key="cat">
                <q-card class="product-card product-card-dark category-tile" @click="openCategory(cat)">
                    <div class="tile-bg"
                        :style="{ backgroundImage: 'url(' + (getCategoryImage(cat) || defaultImage) + ')' }">
                        <div class="tile-overlay">
                            <div class="tile-title">{{ cat }}</div>
                        </div>
                    </div>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script>
import { useProductStore } from 'src/stores/productStore'
import pantsImg from 'src/assets/p.jpg'
import shirtImg from 'src/assets/s.jpg'
import tshirtImg from 'src/assets/t.jpg'

export default {
    name: 'BuyerHome',
    data() {
        return {
            productStore: useProductStore(),
            // Map of category -> image url; you can inject links here or via props later
            categoryImages: {
                Pants: pantsImg,
                Shirts: shirtImg,
                TShirts: tshirtImg,
            },
            defaultImage: 'https://via.placeholder.com/600x400?text=Category'
        }
    },
    computed: {
        categories() {
            const cats = new Set(this.productStore.productList.map(p => p.category).filter(Boolean))
            return Array.from(cats)
        }
    },
    methods: {
        openCategory(cat) {
            // Navigate directly to the buyer product list filtered by category
            this.$router.push({ name: 'buyer', query: { category: cat } })
        },
        viewAll() {
            this.$router.push({ name: 'buyer' })
        }
        ,
        getCategoryImage(cat) {
            if (!cat) return null
            const lower = cat.toLowerCase().replace(/\s|-/g, '')
            // Prefer exact tshirt match first
            if (lower.includes('tshirt') || lower.includes('tee')) return this.categoryImages.TShirts
            if (lower.includes('shirt')) return this.categoryImages.Shirts
            if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser')) return this.categoryImages.Pants
            return null
        }
    }
}
</script>

<style scoped>
.categories-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.category-tile {
    height: 220px;
    border-radius: 14px;
    overflow: hidden;
    transition: transform .18s ease, box-shadow .18s ease;
}

.category-tile:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

.tile-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
}

.tile-overlay {
    width: 100%;
    padding: 16px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.tile-title {
    color: #fff;
    font-weight: 700;
    font-size: 1.05rem;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
