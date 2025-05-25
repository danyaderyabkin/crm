<script setup lang="ts">
import {formatDate} from "src/utils/chatDateFormatter";
import type {ChatMessage} from 'src/types/chat';
defineProps<{chats: ChatMessage[]}>()
</script>

<template>
  <q-list padding>
    <q-item
      v-for="(message, index) in chats"
      :key="index"
      clickable
      v-ripple
      :to="message.last_message ? `/chat/${message.dialog_id}` : undefined"

    >
      <q-item-section top avatar>
        <q-avatar rounded>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ message.chat_name || 'Без названия' }}</q-item-label>
        <q-item-label caption lines="1">
          {{ message.last_message || 'Нет сообщений' }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>
          {{ formatDate(message.last_message_at) }}
        </q-item-label>
        <q-badge
          class="q-mt-auto q-px-none"
          v-if="message.total_new_messages > 0"
          color="primary"
          rounded
        >
          {{ message.total_new_messages }}
        </q-badge>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>

</style>
