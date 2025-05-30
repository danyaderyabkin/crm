<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
// import { useProjectsStore } from 'stores/projects-store';
import { pusher } from 'src/utils/pusher';
import { QSpinnerGears } from 'quasar';
import type { Message } from 'src/types/chat';
import ChatFooter from 'components/chat/ChatFooter.vue';
import { useChatMessages } from 'src/composables/useChatMessages';
import { useScrollToBottom } from 'src/composables/useScrollToBottom';
import GlobalChatMessage from "components/chat/GlobalChatMessage.vue"; // Импортируем новый composable

const sendingMessage = ref(false);
const resetInput = ref(false);
const currentUserId = ref<number | null>(null);
// const store = useProjectsStore();
const route = useRoute();
const newMessage = ref('');
let channel = null;

// Используем композабл для сообщений
const { messages, loading: loadingMessages, error, fetchMessages } = useChatMessages();

// Используем композабл для скролла
const { messagesContainer, scrollToBottom } = useScrollToBottom();

const sendMessage = async (type:string) => {
  if (!newMessage.value.trim() || sendingMessage.value) return;

  try {
    sendingMessage.value = true;

    const tempMessage: Message = {
      id: Date.now(),
      from_user_id: currentUserId.value!,
      to_user_id: currentUserTo.value!,
      message: newMessage.value,
      attachment: null,
      created_at: `${new Date().getHours()}:${new Date().getMinutes()}`,
      is_readed: false
    };

    const formData = new FormData();
    formData.append('hash', LocalStorage.getItem('hash') as string);
    formData.append('chat_id', String(route.params.dialog_id));
    formData.append('chat_type', type);
    formData.append('to_user_id', String(currentUserTo.value));
    formData.append('message', newMessage.value);

    await api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    messages.value = [...messages.value, tempMessage];
    scrollToBottom(true);
    resetInput.value = true;
    setTimeout(() => resetInput.value = false, 100);
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  } finally {
    sendingMessage.value = false;
  }
};

const setupPusher = () => {
  if (channel) {
    pusher.unsubscribe(channel.name);
  }

  const channelName = `user-channel-${currentUserId.value}`;
  channel = pusher.subscribe(channelName);

  channel.bind('NewMessagePrivateChat', (data) => {
    console.log('New message received:', data);

    const messageData = data.data || data;
    const isIncoming = messageData.from_user_id !== currentUserId.value;

    const newMsg: Message = {
      id: messageData.id || Date.now(),
      from_user_id: messageData.from_user_id,
      to_user_id: messageData.to_user_id || currentUserId.value!,
      message: messageData.message,
      attachment: messageData.attachment || null,
      created_at: messageData.created_at || new Date().toISOString(),
      is_readed: messageData.is_readed || false
    };

    if (isIncoming) {
      messages.value = messages.value.map(msg => ({
        ...msg,
        is_readed: true
      }));
    }

    messages.value = [...messages.value, newMsg];
    scrollToBottom(true);
  });
};

const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};


const currentUserTo = computed(() => {
  if (messages?.value[0]?.from_user_id === currentUserId.value) {
    return  messages?.value[0]?.to_user_id
  } else {
    return  messages?.value[0]?.from_user_id
  }
})

onMounted(async () => {
  setVh();
  window.addEventListener('resize', setVh);
  currentUserId.value = Number(route.params.dialog_id);
  await fetchMessages(3);
  scrollToBottom();

  if (currentUserId.value) {
    setupPusher();
  }
  console.log(messages.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVh);
  if (channel) {
    pusher.unsubscribe(channel.name);
  }
});
</script>

<template>
  <q-header elevated>
    <q-toolbar class="bg-primary text-white">
      <q-btn class="absolute-left" to="/chat" icon="chevron_left" dense unelevated no-caps>назад</q-btn>

      <p class="q-mx-auto q-mb-none chat--name">Общий чат</p>
    </q-toolbar>
  </q-header>

  <q-inner-loading :showing="loadingMessages">
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading>

  <div ref="messagesContainer" class="chat-messages">
    <GlobalChatMessage v-for="msg in messages" :message="msg" :user-id="currentUserId" :key="msg.id" />
    <div v-if="error" class="text-grey text-center q-mt-md">
      Нет сообщений
    </div>
  </div>

  <ChatFooter
    v-model="newMessage"
    @send="sendMessage('3')"
    @focus="scrollToBottom(true)"
    @blur="scrollToBottom(true)"
    :file="true"
    :loading="sendingMessage"
    :reset="resetInput"
  />
</template>

<style scoped lang="scss">
/* Ваши стили */
</style>
