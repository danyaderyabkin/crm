<script setup lang="ts">
import { onMounted, ref, onUpdated } from 'vue';
import { LocalStorage } from 'quasar';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import { useProjectsStore } from 'stores/projects-store';
import { formatDate } from '../utils/chatDateFormatter';

interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  message: string;
  attachment: string | null;
  created_at: string;
  is_readed: boolean;
}

const currentUserId = ref<number | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

const store = useProjectsStore();
const route = useRoute();
const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref('');
const newMessage = ref('');


const fetchMessages = async () => {
  try {
    loading.value = true;
    error.value = '';
    const hash: string | null = LocalStorage.getItem('hash');
    const dialogId: number = Number(route.params.dialog_id);

    if (!hash) {
      throw new Error('Hash not found in LocalStorage');
    }

    const response = await api.get('/chat/messages', {
      params: { hash, chat_id: dialogId, chat_type: 4 },
    });

    messages.value = response.data.data || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching messages:', err);
  } finally {
    loading.value = false;
  }
};



const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const formData = new FormData();
    const chatId: string = String(route.params.chat_id);

    // Добавляем все необходимые поля
    formData.append('hash', LocalStorage.getItem('hash') as string);
    formData.append('chat_id', chatId); // Число нужно преобразовать в строку
    formData.append('chat_type', '4'); // Число нужно преобразовать в строку
    formData.append('to_user_id', '177'); // ID получателя
    formData.append('message', newMessage.value);

    // Если нужно прикрепить файл:
    // formData.append('attachment', file);

    const response = await api.post('/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Важно для FormData
      }
    });

    console.log('Сообщение отправлено:', response.data);
    newMessage.value = '';

    // Обновляем список сообщений
    await fetchMessages();

  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
};

const isOutgoing = (msg: Message) => msg.from_user_id === currentUserId.value;

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 0);
};

onMounted(async () => {
  currentUserId.value = store.dictionary?.user.id ?? null;
  await fetchMessages();
  scrollToBottom();

  window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('Подключено. Подписываюсь на канал...');
    window.Echo.channel('user-channel-108')
      .listen('.NewMessagePrivateChat', (data) => {
        console.log('Сообщение получено:', data);
      });
  });

  window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('Ошибка WebSocket:', err);
  });
});

onUpdated(() => {
  scrollToBottom();
});

</script>

<template>
  <q-header elevated>
    <q-toolbar class="bg-primary text-white">
      <q-btn to="/chat" icon="chevron_left" dense unelevated no-caps>назад</q-btn>
    </q-toolbar>
  </q-header>
  <q-inner-loading :showing="loading" />
  <div v-if="error" class="text-negative q-mb-md">
    {{ error }}
  </div>
  <!-- Область сообщений -->
  <div ref="messagesContainer" class="chat-messages">
    <div
      v-for="msg in messages"
      :key="msg.id"
      :class="['message-bubble', isOutgoing(msg) ? 'outgoing' : 'incoming']"
    >
      <!-- Сообщение -->
      <div v-if="msg.message" class="message-content q-pa-sm">
        {{ msg.message }}

        <!-- Мета-информация -->
        <div class="message-meta text-caption">
          {{ formatDate(msg.created_at) }}
          <q-icon
            v-if="isOutgoing(msg)"
            :name="msg.is_readed ? 'done_all' : 'done'"
            :color="msg.is_readed ? 'blue' : 'grey'"
            size="14px"
          />
        </div>
      </div>
    </div>
  </div>
  <q-footer class="bg-grey-2">
    <q-toolbar>
      <q-input
        v-model="newMessage"
        placeholder="Написать сообщение..."
        dense
        rounded
        outlined
        class="full-width"
        @keyup.enter="sendMessage"
      >
        <template v-slot:append>
          <q-icon name="send" @click="sendMessage" />
        </template>
      </q-input>
    </q-toolbar>
  </q-footer>
</template>

<style scoped lang="scss">
.q-item__label {
  word-break: break-word;
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-messages {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 100px);
  padding: 15px;
}

.message-bubble {
  max-width: 75%;
  border-radius: 12px;
  position: relative;

  .message-content {
    word-break: break-word;
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.7;
  }
}

.outgoing {
  align-self: flex-end;
  background: $primary;
  color: white;

  .message-meta {
    justify-content: flex-end;
  }
}

.incoming {
  align-self: flex-start;
  background: $grey-4;
  color: $dark;
}
</style>
