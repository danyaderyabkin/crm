<script setup lang="ts">
import ChatHeader from 'components/ChatHeader.vue'
</script>

<template>
  <ChatHeader/>
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
