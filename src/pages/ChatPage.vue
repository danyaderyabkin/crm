<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { LocalStorage } from "quasar";
import { useChatStore } from "stores/chat";
import { useRouter } from 'vue-router';

interface ChatMessage {
  chat_name: string;
  last_message?: string;
  last_message_at: string;
  total_new_messages: number;
  dialog_id: number;
}

interface ChatData {
  privateChats?: ChatMessage[];
  allChats?: ChatMessage[];
  clientChats?: ChatMessage[];
  globalChat?: ChatMessage[];
  projectChats?: ChatMessage[];
  [key: string]: ChatMessage[] | undefined; // Индексная сигнатура
}

const router = useRouter();
const useTasksStore = useChatStore();

// Инициализируем с правильной структурой
const chats = ref<ChatData>({
  privateChats: [],
  allChats: [],
  clientChats: [],
  globalChat: [],
  projectChats: []
});

const activeTab = ref('privateChats');
const loading = ref<boolean>(false);

const currentChats = computed(() => {
  return chats.value[activeTab.value] || [];
});

const loadChatData = async () => {
  loading.value = true;
  try {
    const hash: string | null = LocalStorage.getItem('hash');
    if (!hash) {
      console.error('Hash not found in LocalStorage');
      return;
    }

    const response:ChatData = await useTasksStore.fetchChat(hash);

    // Явное приведение типа и проверка структуры
    if (response && typeof response === 'object') {
      chats.value = {
        privateChats: response.privateChats || [],
        allChats: response.allChats || [],
        clientChats: response.clientChats || [],
        globalChat: response.globalChat || [],
        projectChats: response.projectChats || [],
        ...response // Добавляем остальные возможные свойства
      };
    } else {
      chats.value = {
        privateChats: [],
        allChats: [],
        clientChats: [],
        globalChat: [],
        projectChats: []
      };
    }

    console.log('Chat data loaded:', chats.value);
  } catch (error) {
    console.error('Error loading chat data:', error);
    // Сбрасываем в пустое состояние при ошибке
    chats.value = {
      privateChats: [],
      allChats: [],
      clientChats: [],
      globalChat: [],
      projectChats: []
    };
  } finally {
    loading.value = false;
  }
};
function formatDate(inputDate?: string): string {
  if (!inputDate) return '';

  try {
    const [datePart] = inputDate.split(' ');
    if (!datePart) return inputDate; // Если не удалось извлечь часть с датой

    const dateComponents: string[]  = datePart.split('.');
    if (dateComponents.length !== 3) return inputDate; // Неправильный формат даты

    const day = parseInt(dateComponents[0] || '');
    const month = parseInt(dateComponents[1] || '');
    const year = parseInt(dateComponents[2] || '');

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return inputDate; // Не удалось преобразовать в числа
    }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return inputDate; // Некорректная дата
    }

    const now = new Date();
    const isCurrentYear = date.getFullYear() === now.getFullYear();

    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const monthNamesNominative = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex > 11) {
      return inputDate; // Некорректный месяц
    }

    return isCurrentYear
      ? `${day} ${monthNames[monthIndex]}`
      : `${monthNamesNominative[monthIndex]} ${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return inputDate;
  }
}

const openChat = async (dialogId: number) => {
  await router.push(`/chat/${dialogId}`);
};

onMounted(async () => {
  await loadChatData();
});
</script>
<template>
  <div>
    <q-inner-loading label="Загрузка..." :showing="loading" />
    <q-tabs
      v-model="activeTab"
      inline-label
      class="bg-primary text-white shadow-2"
    >
      <!-- Итерируемся по ключам объекта chats -->
      <q-tab
        v-for="(chatList, tabName) in chats"
        :key="tabName"
        :name="tabName"
        icon="mail"
        :label="tabName"
      />
    </q-tabs>

    <q-list bordered padding v-if="currentChats.length">
      <q-item
        v-for="(message, index) in currentChats"
        :key="index"
        clickable
        v-ripple
        @click="openChat(message.dialog_id)"
      >
        <q-item-section top avatar>
          <q-avatar rounded>
            <img src="https://cdn.quasar.dev/img/boy-avatar.png">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ message.chat_name || 'Без названия' }}</q-item-label>
          <q-item-label caption lines="1">
            {{ message.last_message || 'Нет сообщений' }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption>
            {{ formatDate(message.last_message_at) }}
          </q-item-label>
          <q-badge
            class="q-mt-auto"
            v-if="message.total_new_messages > 0"
            color="primary"
            rounded
          >
            {{ message.total_new_messages }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Fallback если нет сообщений -->
    <div v-else v-show="!loading" class="text-center q-pa-md text-grey">
      Нет чатов для отображения
    </div>
  </div>
</template>

<style scoped>
/* Добавьте свои стили при необходимости */
.q-item {
  transition: background-color 0.3s;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.q-icon {
  font-size: 10px !important;
  margin-top: auto;
}
</style>
