<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Product Landing Page
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Optional Drawer -->
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple to="/">
          <q-item-section>Home</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main content area -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      leftDrawerOpen: false
    }
  }
}
</script>
