<script setup lang="ts">
import { formatDate } from 'src/utils/chatDateFormatter';
import type { Message } from 'src/types/chat';
const props = defineProps<{message: Message, userId: number}>()
const isOutgoing = (msg: Message) => msg.from_user_id === props.userId
</script>

<template>
  <div
    :class="['message-bubble', isOutgoing(message) ? 'outgoing' : 'incoming']"
  >
    <div v-if="message.message" :class="{long: formatDate(message.created_at).length > 5}" class="message-content">
      {{ message.message }}
      <div  class="message-meta">
        {{ formatDate(message.created_at) }}
        <q-icon
          v-if="isOutgoing(message)"
          :name="message.is_readed ? 'done_all' : 'done'"
          :color="message.is_readed ? 'grey-4' : 'grey-13'"
          size="14px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
