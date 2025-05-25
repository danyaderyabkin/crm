<script setup lang="ts">
import {formatDate} from "src/utils/chatDateFormatter";
import type {ChatMessageClient} from 'src/types/chat';
defineProps<{chats: ChatMessageClient[]}>()
</script>

<template>
  <q-list padding>
    <q-item
      v-for="(message, index) in chats"
      :key="index"
      clickable
      v-ripple
      :to="`/clientChat/${message.id}?client=${message.client_id}`"

    >

<!--      <pre>{{message}}</pre>-->
      <q-item-section top avatar>
        <q-avatar rounded>
          <img v-if="message.client.photo" :src="message.photo" alt="avatar">
          <img v-else src="../../assets/images/noph.jpg" alt="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ message.client.full_name || 'Без названия' }}</q-item-label>
        <q-item-label caption lines="1">
          {{ message.lastMessage || 'Вложение' }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>
          {{ formatDate(message.lastMessageAt) }}
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
