<script setup lang="ts">
import {formatDate} from "src/utils/chatDateFormatter";
import type {ChatMessage} from 'src/types/chat';
import GlobalChat from "components/chat/GlobalChat.vue";
import {useProjectsStore} from "stores/projects-store";
defineProps<{chats: ChatMessage[];globalNew: number}>()
const store = useProjectsStore();
const getUserName = (id: number) => {
  return store.dictionary?.users?.find((user) => user.id === id);
};

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
      <q-item-section class="q-pa-none" top avatar>
        <q-avatar size="xl" round>
          <img :src="getUserName(message.userId)?.photo || '../../src/assets/images/noph.jpg'" alt="avatar" />
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
    <GlobalChat :count="globalNew" v-if="chats.length" />
  </q-list>
</template>

<style scoped>

</style>
