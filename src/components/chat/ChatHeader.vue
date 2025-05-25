<script setup lang="ts">
defineProps<{name: string}>()
</script>

<template>
  <q-header elevated>
    <q-toolbar class="bg-primary text-white">
      <q-btn class="absolute-left" to="/chat" icon="chevron_left" dense unelevated no-caps>назад</q-btn>

      <p class="q-mx-auto q-mb-none chat--name">Чат с {{name}}</p>
    </q-toolbar>
  </q-header>
</template>

<style scoped>

</style>
