<script setup lang="ts">
import { formatDate } from 'src/utils/chatDateFormatter';
import type { Message } from 'src/types/chat';
import { useProjectsStore } from 'stores/projects-store';
import { computed } from 'vue';

const store = useProjectsStore();
const props = defineProps<{
  message: Message;
  userId: number;
  previousMessage: Message;
  nextMessage?: Message; // Добавляем пропс для следующего сообщения
}>();

const isOutgoing = (msg: Message) => msg?.message_from === props.userId;

const getUserName = (id: number) => {
  return store.dictionary?.users?.find((user) => user.id === id);
};

const hasImageAttachment = computed(() => {
  return props.message.attachment && /\.(jpg|jpeg|png|gif|webp)$/i.test(props.message.attachment);
});

const getUserColor = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const userNameColor = computed(() => {
  if (!props.message?.message_from) return '';
  return getUserColor(props.message?.message_from);
});

// Показываем аватар, если следующее сообщение от другого пользователя или это последнее сообщение
const shouldShowAvatar = computed(() => {
  if (isOutgoing(props.message)) return false;
  if (!props.nextMessage) return true; // Это последнее сообщение
  return props.nextMessage.message_from !== props.message.message_from;
});

// Показываем имя, если это первое сообщение от пользователя в цепочке
const shouldShowUserName = computed(() => {
  if (isOutgoing(props.message)) return false;
  if (!props.previousMessage) return true;
  return props.previousMessage.message_from !== props.message.message_from;
});
</script>

<template>
  <div
    :class="[
      isOutgoing(message) ? 'justify-end' : '',
      hasImageAttachment ? 'items-start' : 'items-end',
    ]"
    class="flex no-wrap q-gutter-sm"
    v-if="message.attachment || message.message_text"
  >
    <q-avatar v-if="shouldShowAvatar" size="md" round>
      <img
        :src="getUserName(message?.message_from)?.photo || '../../src/assets/images/noph.jpg'"
        alt="avatar"
      />
    </q-avatar>
    <div v-else style="width: 32px"></div>

    <div class="message-wrapper">
      <div
        v-if="hasImageAttachment"
        :class="[isOutgoing(message) ? 'outgoing' : 'incoming']"
        class="attachment-container"
      >
        <img
          :src="`https://moovix.wecrm.ru/storage/${message?.attachment}`"
          alt="Message attachment"
          class="attachment-image"
          @load="$emit('loadImage')"
        />
      </div>

      <div
        :class="[
          'message-bubble',
          isOutgoing(message) ? 'outgoing' : 'incoming',
          hasImageAttachment ? 'image' : '',
        ]"
      >
        <svg v-if="shouldShowAvatar" width="9" height="20" class="svg-appendix">
          <defs>
            <filter
              x="-50%"
              y="-14.7%"
              width="200%"
              height="141.2%"
              filterUnits="objectBoundingBox"
              id="messageAppendix"
            >
              <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur
                stdDeviation="1"
                in="shadowOffsetOuter1"
                result="shadowBlurOuter1"
              ></feGaussianBlur>
              <feColorMatrix
                values="0 0 0 0 0.0621962482 0 0 0 0 0.138574144 0 0 0 0 0.185037364 0 0 0 0.15 0"
                in="shadowBlurOuter1"
              ></feColorMatrix>
            </filter>
          </defs>
          <g fill="#e0e0e0" fill-rule="evenodd">
            <path
              d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
              fill="#000"
              filter="url(#messageAppendix)"
            ></path>
            <path
              d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
              fill="FFF"
              class="corner"
            ></path>
          </g>
        </svg>
        <div
          v-if="message?.message_text"
          :class="{ long: formatDate(message.created_at).length > 5 }"
          class="message-content"
        >

          <span v-if="shouldShowUserName" class="span--user" :style="{ color: userNameColor }">
            {{ getUserName(message?.message_from)?.full_name }}
          </span>
          {{ message?.message_text }}
          <div class="message-meta">
            {{ formatDate(message.created_at) }}
            <q-icon v-if="isOutgoing(message)" name="done_all" color="grey-4" size="14px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Стили остаются без изменений */
.span--user {
  font-size: 11px;
  line-height: 0.8;
  font-weight: 500;
  margin-bottom: 4px;
  display: inline-block;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-bubble .message-content.long {
  padding: 7px 78px 5px 12px;
}

.message-bubble {
  max-width: 100%;
}

.outgoing.message-bubble .message-content.long {
  padding: 7px 78px 7px 12px;
}

.message-bubble:not(.outgoing) + .message-bubble:not(.outgoing) {
  margin-top: 2px;
}

.message-bubble {
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.attachment-container {
  overflow: hidden;
}

.attachment-container.outgoing {
  background: transparent;
}

.attachment-container.outgoing {
  .attachment-image {
    border-radius: 8px 8px 3px 8px;
  }
}

.attachment-image {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  border-radius: 8px 8px 8px 3px;
  object-fit: contain;
}

.message-bubble.active {
  background-color: rgba(0, 0, 0, 0.1);
}

.q-menu {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
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

.message-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  max-width: 75%;
}

.q-avatar + .message-wrapper {
  margin-bottom: auto;
  position: relative;
}

.message-bubble svg {
  position: absolute;
  left: -0.522rem;
  bottom: -0.15rem;
}
</style>
