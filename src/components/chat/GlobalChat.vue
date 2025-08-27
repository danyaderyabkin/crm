<script setup lang="ts">
// import {formatDate} from "src/utils/chatDateFormatter";
// import type {ChatMessage} from 'src/types/chat';
// defineProps<{chats: ChatMessage[]}>()
import {useChatMessages} from "src/composables/useChatMessages";
import {onMounted, ref, computed} from "vue";
import type {Message} from "src/types/chat";

defineProps<{count: number}>();

const getChat = useChatMessages()
const globalChatMessages = ref<Message[]>([])

onMounted(async () => {
  await getChat.fetchMessages(3)
  globalChatMessages.value = getChat.messages.value
})

const getLastMessage = computed(() => {
  const lastMessage = globalChatMessages.value.findLastIndex(el => el)
  return globalChatMessages.value[lastMessage]
})
</script>

<template>
    <q-item
      clickable
      v-ripple
      to="/chat/3"
    >
      <q-item-section class="q-pa-none" top avatar>
        <q-avatar size="xl" rounded>
          <img src="../../assets/images/group.png" alt="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>Общий чат</q-item-label>
        <q-item-label caption lines="1">
            {{getLastMessage?.message_text}}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>

        </q-item-label>
        <q-badge
          v-if="count"
          class="q-mt-auto q-px-none"
          color="primary"
          rounded
        >
          {{count}}
        </q-badge>
      </q-item-section>
    </q-item>
</template>

<style scoped>

</style>
