<script setup lang="ts">
import { formatDate } from 'src/utils/chatDateFormatter';
import type { Message } from 'src/types/chat';
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from 'quasar';

const $q = useQuasar();
const emit = defineEmits(['loadImage', 'reply']);

const props = defineProps<{
  message: Message,
  userId: number
}>();

const isOutgoing = (msg: Message) => {
  if (msg.from_user_id) {
    return msg.from_user_id === props.userId
  } else {
    return !msg.message_from_client;
  }
};
const menuPosition = ref({ x: 0, y: 0 });
const showContextMenu = ref(false);

const hasImageAttachment = computed(() => {
  return props.message.attachment &&
    /\.(jpg|jpeg|png|gif|webp)$/i.test(props.message.attachment);
});

// Функция для парсинга цитаты из сообщения
const parsedMessage = computed(() => {
  const msg = props.message.message || '';
  const quoteRegex = /\[quote\](.*?)\[\/quote\]/s;
  const match = msg.match(quoteRegex);

  if (match) {
    return {
      hasQuote: true,
      quoteText: match[1].trim(),
      messageText: msg.replace(quoteRegex, '').trim()
    };
  }

  return {
    hasQuote: false,
    quoteText: '',
    messageText: msg
  };
});

let longPressTimer: number;
const LONG_PRESS_DURATION = 0;

const handleScroll = () => {
  closeMenu();
};



const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const event = e as TouchEvent;
  const clientX = event.touches ? event.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY = event.touches ? event.touches[0].clientY : (e as MouseEvent).clientY;

  longPressTimer = window.setTimeout(() => {
    showContextMenu.value = true;
    menuPosition.value = { x: clientX, y: clientY };
  }, LONG_PRESS_DURATION);
};

const handleTouchEnd = () => {
  clearTimeout(longPressTimer);
};

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  showContextMenu.value = true;
  menuPosition.value = { x: e.clientX, y: e.clientY };
};

const closeMenu = () => {
  showContextMenu.value = false;
  clearTimeout(longPressTimer);
};

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.message || '');
    $q.notify({
      message: 'Сообщение скопировано',
      color: 'grey-13',
      position: 'top',
      timeout: 1000
    });
  } catch  {
    $q.notify({
      message: 'Не удалось скопировать сообщение',
      color: 'negative',
      position: 'top',
      timeout: 1000
    });
  }
  closeMenu();
};

const replyToMessage = () => {
  closeMenu();
  emit('reply', props.message);
};


onMounted(() => {
  window.addEventListener('scroll', handleScroll, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll, true);
});
</script>

<template>
  <div
    :class="['message-bubble', isOutgoing(message) ? 'outgoing' : 'incoming', hasImageAttachment ? 'image' : '', parsedMessage.hasQuote ? 'reply' : '' ]"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @mousedown="handleTouchStart"
    @mouseup="handleTouchEnd"
    @mouseleave="handleTouchEnd"
    @contextmenu="handleContextMenu"
    v-if="message.attachment || message.message"
  >
    <!-- Блок с цитатой (если есть) -->
    <div v-if="parsedMessage.hasQuote" class="quote-container">
      <div class="quote-bar"></div>
      <div class="quote-content">
        {{ parsedMessage.quoteText }}
      </div>
    </div>

    <!-- Блок с вложением (если есть) -->
    <div v-if="hasImageAttachment" class="attachment-container">
      <img
        :src="`https://moovix.wecrm.ru/storage/${message?.attachment}`"
        alt="Message attachment"
        class="attachment-image"
        @load="$emit('loadImage')"
      >
    </div>



    <!-- Блок с текстом сообщения (если есть) -->
    <div
      v-if="parsedMessage.messageText"
      :class="{long: formatDate(message.created_at).length > 5}"
      class="message-content"
    >
      {{ parsedMessage.messageText }}
      <div class="message-meta">
        {{ formatDate(message.created_at) }}
        <q-icon
          v-if="isOutgoing(message)"
          :name="message.is_readed ? 'done_all' : 'done'"
          :color="message.is_readed ? 'grey-4' : 'grey-13'"
          size="14px"
        />
      </div>
    </div>

    <!-- Контекстное меню -->
    <q-menu
      v-model="showContextMenu"
      :position="menuPosition"
      context-menu
      @hide="closeMenu"
    >
      <q-list class="q-py-xs" dense style="min-width: 150px">
        <q-item class="items-center" clickable v-close-popup @click="replyToMessage">
          <q-icon class="q-mr-sm" name="reply"/>
          <q-item-section>Ответить</q-item-section>
        </q-item>
        <q-item class="items-center" clickable v-close-popup @click="copyMessage">
          <q-icon class="q-mr-sm" name="content_copy"/>
          <q-item-section>Копировать</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<style scoped>
.message-bubble {
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.attachment-container {
  max-width: 100%;
  overflow: hidden;
}

.attachment-image {
  max-width: 100%;
  height: 40vh;
  max-height: 50vh;
  display: block;
  border-radius: 8px 8px 8px 3px;
  object-fit: contain;
}

.message-bubble.active {
  background-color: rgba(0, 0, 0, 0.1);
}

.q-menu {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 8px;
  z-index: 10000;
}

.quote-container {
  display: flex;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px 10px 0 0;
  position: relative;
}

.message-bubble.outgoing .quote-container {
  background-color: rgba(255, 255, 255, 0.1);
}

.quote-bar {
  width: 2px;
  background-color: #13b9c8;
  border-radius: 10px;
  margin-right: 5px;
  flex-shrink: 0;
}

.message-bubble.outgoing .quote-bar {
  background-color: rgba(255, 255, 255, 0.7);
}

.quote-content {
  font-size: 0.9em;
  opacity: 0.8;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
