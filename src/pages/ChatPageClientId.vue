<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { LocalStorage } from 'quasar'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { useProjectsStore } from 'stores/projects-store'
import { formatDate } from '../utils/chatDateFormatter'
import { pusher } from 'src/utils/pusher' // Импортируем Pusher
import { QSpinnerGears } from 'quasar'

const loadingMessages = ref(false) // Отдельный лоадер для загрузки сообщений
const sendingMessage = ref(false)

interface Message {
  id: number
  from_user_id: number
  to_user_id: number
  message: string
  attachment: string | null
  created_at: string
  is_readed: boolean
}

const currentUserId = ref<number | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const store = useProjectsStore()
const route = useRoute()
const messages = ref<Message[]>([])
const loading = ref(false)
const error = ref('')
const newMessage = ref('')
let channel = null // Для хранения канала Pusher

const fetchMessages = async () => {
  try {
    loading.value = true
    error.value = ''
    const hash: string | null = LocalStorage.getItem('hash')
    const dialogId: number = Number(route.params.dialog_id)

    if (!hash) throw new Error('Hash not found in LocalStorage')

    const response = await api.get('/chat/messages', {
      params: { hash, chat_id: dialogId, chat_type: 2 },
    })

    messages.value = response.data.data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching messages:', err)
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return

  try {
    sendingMessage.value = true

    // Создаем временное сообщение для мгновенного отображения
    const tempMessage: Message = {
      id: Date.now(), // Временный ID (заменится при получении от сервера)
      from_user_id: currentUserId.value!,
      to_user_id: 177, // ID получателя
      message: newMessage.value,
      attachment: null,
      created_at: `${new Date().getHours()}:${new Date().getMinutes()}`,
      is_readed: false
    }


    const formData = new FormData()
    const chatId: string = String(route.params.chat_id)


    formData.append('hash', LocalStorage.getItem('hash') as string)
    formData.append('chat_id', chatId)
    formData.append('chat_type', '2')
    formData.append('to_user_id', '177')
    formData.append('message', newMessage.value)

    await api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    messages.value = [...messages.value, tempMessage]
    scrollToBottom(true)

    newMessage.value = ''
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    // Удаляем временное сообщение при ошибке
    // messages.value = messages.value.filter(m => m.id !== tempMessage.id)
  } finally {
    sendingMessage.value = false
  }
}

const isOutgoing = (msg: Message) => msg.from_user_id === currentUserId.value

const scrollToBottom = (smooth = false) => {
  setTimeout(() => {
    if (messagesContainer.value) {
      const scrollHeight = messagesContainer.value.scrollHeight;
      const clientHeight = messagesContainer.value.clientHeight;
      const computedStyle = window.getComputedStyle(messagesContainer.value);
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

      messagesContainer.value.scrollTo({
        top: scrollHeight - clientHeight + paddingBottom,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, 1);
}

const setupPusher = () => {
  if (channel) {
    pusher.unsubscribe(channel.name);
  }

  const channelName = `user-channel-${currentUserId.value}`;
  channel = pusher.subscribe(channelName);

  channel.bind('NewMessagePrivateChat', (data) => {
    console.log('New message received:', data);

    const messageData = data.data || data;

    // Проверяем, является ли сообщение входящим (не от текущего пользователя)
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

    // Обновляем только если это входящее сообщение
    if (isIncoming) {
      messages.value = messages.value.map(msg => ({
        ...msg,
        is_readed: true
      }));
    }

    // Добавляем новое сообщение
    messages.value = [...messages.value, newMsg];
    scrollToBottom(true);
  });
};

const handleResize = () => {
  if (messagesContainer.value) {
    scrollToBottom(true)
  }
}

const setVh = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

onMounted(async () => {
  setVh()
  window.addEventListener('resize', setVh)
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
  currentUserId.value = store.dictionary?.user.id ?? null
  await fetchMessages()
  scrollToBottom()

  if (currentUserId.value) {
    setupPusher()
  }

})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
  // Отписываемся от канала при размонтировании компонента
  if (channel) {
    pusher.unsubscribe(channel.name)
  }
})
</script>
<template>
  <q-header elevated>
    <q-toolbar class="bg-primary text-white">
      <q-btn to="/chat" icon="chevron_left" dense unelevated no-caps>назад</q-btn>
    </q-toolbar>
  </q-header>

  <!-- Лоадер только для загрузки сообщений -->
  <q-inner-loading :showing="loadingMessages">
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading>


  <div v-if="error" class="text-negative q-mb-md">
    {{ error }}
  </div>

  <!-- Область сообщений с анимацией -->
  <div ref="messagesContainer" class="chat-messages">
    <transition-group name="message">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-bubble', isOutgoing(msg) ? 'outgoing' : 'incoming']"
      >
        <div v-if="msg.message" :class="{long: formatDate(msg.created_at).length > 5}" class="message-content">
          {{ msg.message }}
          <div  class="message-meta">
            {{ formatDate(msg.created_at) }}
            <q-icon
              v-if="isOutgoing(msg)"
              :name="msg.is_readed ? 'done_all' : 'done'"
              :color="msg.is_readed ? 'grey-4' : 'grey-13'"
              size="14px"
            />
          </div>
        </div>
      </div>
    </transition-group>
  </div>

  <q-footer class="bg-grey-2">
    <q-toolbar>
      <q-input
        v-model="newMessage"
        placeholder="Написать сообщение..."

        borderless
        rounded
        class="full-width no-outline-input"
        @keyup.enter="sendMessage"
        @focus="scrollToBottom(true)"
        @blur="scrollToBottom(true)"
        :loading="sendingMessage"
      >
        <template v-slot:prepend>
          <q-icon
            name="add"
            @click="sendMessage"
            :class="{ 'text-grey': !newMessage.trim() }"
          />
        </template>
        <template v-slot:append>
          <q-icon
            name="send"
            @click="sendMessage"
            :class="{ 'text-grey': !newMessage.trim() }"
          />
        </template>
      </q-input>
    </q-toolbar>
  </q-footer>
</template>

<style scoped lang="scss">

/* Анимации */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Анимация для исходящих сообщений */
.outgoing.message-enter-from {
  transform: translateX(20px);
}

/* Анимация для входящих сообщений */
.incoming.message-enter-from {
  transform: translateX(-20px);
}

/* Остальные стили остаются без изменений */
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
  gap: 2px;
  max-height: calc(100vh - 50px);
  padding: 10px 10px 20px 10px; /* Увеличиваем нижний паддинг */
  overflow-x: hidden;

  /* Для мобильных устройств */
  @media (max-width: 600px) {
    max-height: calc(var(--vh, 1vh) * 100 - 100px);
    padding-bottom: 15px; /* Еще больше снизу */
  }
}

.message-bubble {
  max-width: 75%;
  border-radius: 25px 25px 3px 25px;
  position: relative;
  transition: transform 0.2s ease;
  &.incoming {
    border-radius: 25px 25px 25px 3px;
    .message-meta {
      color: #a9a9a9;
    }
    .message-content {
      padding-right: 50px;
      &.long {
        padding-right: 60px;
      }
    }
    .message-meta {
      right: 10px;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  .message-content {
    word-break: break-word;
    padding: 7px 65px 7px 12px;
    &.long {
      padding: 7px 78px 7px 12px;
    }

  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.7;
    font-weight: 300;
    font-size: 11px;
  }
}

.outgoing {
  align-self: flex-end;
  background: $primary;
  color: white;
  .message-meta {
    color: #d9d9d9;
  }
}

.message-meta {
  position: absolute;
  justify-content: flex-end;
  right: 7px;
  bottom: 4px;
}
.incoming {
  align-self: flex-start;
  background: $grey-4;
  color: $dark;
}
</style>
