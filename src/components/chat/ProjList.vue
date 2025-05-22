<script setup lang="ts">
import {formatDate} from "src/utils/chatDateFormatter";
import type {ChatMessageProj} from 'src/types/chat';
defineProps<{chats: ChatMessageProj[]}>()
</script>

<template>
  <q-list padding>
    <q-item
      v-for="(message, index) in chats"
      :key="index"
      clickable
      v-ripple
      :to="`/chat/${message.id}`"

    >
      <q-item-section top avatar>
        <q-avatar rounded>
          <img src="../../assets/images/noph.jpg" alt="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ message.project_name || 'Без названия' }}</q-item-label>
        <q-item-label caption lines="1">
          {{ message.project_info || 'Нет сообщений' }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>
          {{ formatDate(message.start_at) }}
        </q-item-label>
        <q-badge
          class="q-mt-auto q-px-none"
          v-if="message.totalNew > 0"
          color="primary"
          rounded
        >
          {{ message.totalNew }}
        </q-badge>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>

</style>
