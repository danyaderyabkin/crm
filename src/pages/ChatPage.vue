<script setup lang="ts">
</script>

<template>
  <div class="q-pa-md">
    <div v-for="item in 5" :key="item">
      <q-chat-message
        name="me"
        :text="['hey, how are you?']"
        sent
      />
      <q-chat-message
        name="Jane"
        :text="['doing fine, how r you?']"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
