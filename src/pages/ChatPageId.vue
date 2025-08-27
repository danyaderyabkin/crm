<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import { useProjectsStore } from 'stores/projects-store';
import { pusher } from 'src/utils/pusher';
import { QSpinnerGears } from 'quasar';
import type { IUser } from 'src/types/dictionary';
import type { Message } from 'src/types/chat';
import ChatMessage from 'components/chat/ChatMessage.vue';
import ChatHeader from 'components/chat/ChatHeader.vue';
import ChatFooter from 'components/chat/ChatFooter.vue';
import { useChatMessages } from 'src/composables/useChatMessages';
import { useScrollToBottom } from 'src/composables/useScrollToBottom';

const sendingMessage = ref(false);
const replyMessage = ref<Message | null>(null);
const resetInput = ref(false);
const currentUserId = ref<number | null>(null);
const store = useProjectsStore();
const route = useRoute();
const newMessage = ref('');
let channel = null;

// Используем композабл для сообщений
const { messages, loading: loadingMessages, error, fetchMessages } = useChatMessages();

// Используем композабл для скролла
const { messagesContainer, scrollToBottom } = useScrollToBottom();

const sendMessage = async (payload: { type?: number; file?: File | null; text?: string }) => {
  if ((!newMessage.value.trim()) || sendingMessage.value) return;

  try {
    sendingMessage.value = true;

    // Создаем временное сообщение для UI
    let tempMessage: Message;


    // Подготавливаем FormData для отправки
    const formData = new FormData();
    formData.append('hash', LocalStorage.getItem('hash') as string);
    formData.append('chat_id', String(route.params.dialog_id));
    formData.append('chat_type', String(payload.type || 4));
    formData.append('to_user_id', String(currentUserTo.value));

    // Добавляем текст сообщения, если есть
    if (payload.text) {
      formData.append('message', payload.text);
    }

    // Добавляем файл, если есть
    if (payload.file) {
      formData.append('attachment', payload.file);
    }

    // Отправляем запрос
    const data = await api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (payload.type === 3) { // Глобальный чат
      tempMessage = {
        id: Date.now(),
        message_from: currentUserId.value!,
        to_user_id: currentUserTo.value!,
        message_text: payload.text || '',
        attachment: data.data.data.attachment,
        created_at: `${new Date().getHours()}:${new Date().getMinutes()}`,
        is_readed: false
      };
    } else {
      tempMessage = {
        id: Date.now(),
        from_user_id: currentUserId.value!,
        to_user_id: currentUserTo.value!,
        message: payload.text || '',
        attachment: data.data.data.attachment,
        created_at: `${new Date().getHours()}:${new Date().getMinutes()}`,
        is_readed: false
      };
    }

    // Обновляем UI
    messages.value = [...messages.value, tempMessage];
    console.log(messages.value)
    scrollToBottom(true);
    resetInput.value = true;
    setTimeout(() => resetInput.value = false, 100);

    // Очищаем поле ввода
    newMessage.value = '';
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

  if(Number(route.params.dialog_id) !== 3) {
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
  } else {
    channel.bind('NewMessageGlobalChat', (data) => {
      console.log('New message received:', data);

      const messageData = data.data || data;
      const isIncoming = messageData.from_user_id !== currentUserId.value;

      const newMsg = {
        id: messageData.id || Date.now(),
        message_from: messageData.message_from,
        to_user_id: messageData.to_user_id || currentUserId.value!,
        message_text: messageData.message_text,
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
      console.log(messages.value);
    });
  }
};

const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const currentUserName = computed(() => {
  return store.dictionary?.users.find((user: IUser) => user.id === currentUserTo.value);
});

const isGlobalChat = computed(() => {
  return Number(route.params.dialog_id) === 3;
});


const reply = (msg: Message) => {
  console.log(msg)
  replyMessage.value = msg;
}
const cancelReplay = () => {
  replyMessage.value = null;
}


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
  currentUserId.value = store.dictionary?.user.id ?? null;
  const typeChat = computed(() => {
    if (Number(route.params.dialog_id) === 3) {
      return 3;
    } else {
      return 4;
    }
  });
  await fetchMessages(typeChat.value);
  scrollToBottom();

  if (currentUserId.value) {
    setupPusher();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVh);
  if (channel) {
    pusher.unsubscribe(channel.name);
  }
});
</script>

<template>
  <ChatHeader v-if="currentUserName?.full_name" :id="Number(currentUserTo)" :name="`Чат с ${currentUserName?.full_name}`" />
  <ChatHeader v-else name="Общий чат" />

  <q-inner-loading :showing="loadingMessages">
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading>

  <div ref="messagesContainer" class="chat-messages">
      <ChatMessage v-for="msg in messages"
                   @reply="reply"
                   @load-image="scrollToBottom(false)"
                   :message="msg"
                   :user-id="Number(currentUserId)"
                   :key="msg.id"/>
      <div v-if="error" class="text-grey text-center q-mt-md">
        Нет сообщений
      </div>
  </div>
  <ChatFooter
    v-model="newMessage"
    @send="sendMessage"
    @focus="scrollToBottom(true)"
    @blur="scrollToBottom(true)"
    :file="true"
    :loading="sendingMessage"
    :reset="resetInput"
    :global="isGlobalChat"
    :reply-to="replyMessage"
    @cancel-reply="cancelReplay"
  />
</template>

<style scoped lang="scss">
/* Ваши стили */
</style>
