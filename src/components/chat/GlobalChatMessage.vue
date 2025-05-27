<script setup lang="ts">
import { formatDate } from 'src/utils/chatDateFormatter';
import type { Message } from 'src/types/chat';
import { useProjectsStore } from 'stores/projects-store';
import { computed } from 'vue';

const store = useProjectsStore();
const props = defineProps<{
  message: Message;
  userId: number;
  previousMessage: Message; // Добавляем пропс для предыдущего сообщения
}>();

const isOutgoing = (msg: Message) => msg?.message_from === props.userId;

const getUserName = (id: number) => {
  return store.dictionary?.users?.find((user) => user.id === id);
};

const getUserColor = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const userNameColor = computed(() => {
  if (!props.message?.message_from) return '';
  return getUserColor(props.message?.message_from);
});

// Проверяем, нужно ли показывать имя пользователя
const shouldShowUserName = computed(() => {
  if (isOutgoing(props.message)) return false;
  if (!props.previousMessage) return true;

  // Показываем имя, если предыдущее сообщение от другого пользователя
  return props.previousMessage.message_from !== props.message.message_from;
});

// Проверяем, нужно ли показывать аватар
const shouldShowAvatar = computed(() => {
  if (isOutgoing(props.message)) return false;
  if (!props.previousMessage) return true;

  // Показываем аватар, если предыдущее сообщение от другого пользователя
  return props.previousMessage.message_from !== props.message.message_from;
});
</script>

<template>
  <div :class="{'justify-end': isOutgoing(message)}" class="flex items-end q-gutter-xs">
    <q-avatar
      v-if="shouldShowAvatar"
      size="lg"
      round
    >
      <img :src="getUserName(message?.message_from)?.photo || '../../src/assets/images/noph.jpg'" alt="avatar" />
    </q-avatar>
    <div
      v-else
      style="width: 40px"
    ></div> <!-- Пустой элемент для выравнивания -->

    <div :class="['message-bubble', isOutgoing(message) ? 'outgoing' : 'incoming']">
      <div
        v-if="message?.message_text"
        :class="{ long: formatDate(message.created_at).length > 5 }"
        class="message-content"
      >
        <span
          v-if="shouldShowUserName"
          class="span--user"
          :style="{ color: userNameColor }"
        >
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
</template>

<style scoped>
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

.outgoing.message-bubble .message-content.long {
  padding: 7px 78px 7px 12px;
}

/* Добавляем отступ между сообщениями от разных пользователей */
.message-bubble:not(.outgoing) + .message-bubble:not(.outgoing) {
  margin-top: 2px;
}
</style>
