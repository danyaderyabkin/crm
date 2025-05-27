<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { LocalStorage } from "quasar";
import { useChatStore } from "stores/chat";
import type { ChatData } from 'src/types/chat';
import PrivateList from "components/chat/PrivateList.vue";
import ClientList from "components/chat/ClientList.vue";
import ProjList from "components/chat/ProjList.vue";

// const router = useRouter();
const chatStore = useChatStore();

// Определяем типы табов
type ChatTab = 'private' | 'client' | 'proj';

const chats = ref<ChatData>({
  privateChats: [],
  allChats: [],
  clientChats: [],
  projectChats: []
});

const activeTab = ref<ChatTab>('private');
const loading = ref<boolean>(false);

// Маппинг табов для отображения
const tabs = [
  { value: 'private', label: 'Мои чаты', icon: 'mail' },
  { value: 'client', label: 'Клиенты', icon: 'people' },
  { value: 'proj', label: 'Проекты', icon: 'forum' }
];

// Вычисляемое свойство для текущего списка чатов
const currentChats = computed(() => {
  switch (activeTab.value) {
    case 'private':
      return chats.value.privateChats || [];
    case 'client':
      return chats.value.clientChats || [];
    case 'proj':
      return [...(chats.value.projectChats || [])];
    default:
      return [];
  }
});

const loadChatData = async () => {
  loading.value = true;
  try {
    const hash: string | null = LocalStorage.getItem('hash');
    if (!hash) {
      console.error('Hash not found in LocalStorage');
      return;
    }

    const response: ChatData = await chatStore.fetchChat(hash);

    // Обновляем данные чатов
    chats.value = {
      privateChats: response.privateChats || [],
      allChats: response.allChats || [],
      clientChats: response.clientChats || [],
      projectChats: response.projectChats || []
    };
  } catch (error) {
    console.error('Error loading chat data:', error);
    // Сбрасываем в пустое состояние при ошибке
    chats.value = {
      privateChats: [],
      allChats: [],
      clientChats: [],
      projectChats: []
    };
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadChatData();
});
</script>

<template>
  <div>
    <q-inner-loading label="Загрузка..." :showing="loading" />

    <q-tabs
      narrow-indicator
      dense
      v-model="activeTab"
      inline-label
      class="text-primary bg-transparent no-shadow"
      align="right"
    >
      <q-tab
        no-caps
        class="text-primary full-width q-px-none"
        v-for="tab in tabs"
        :key="tab.value"
        :name="tab.value"
        :label="tab.label"
      />
    </q-tabs>
<!--<pre>{{currentChats}}</pre>-->
    <PrivateList :chats="currentChats" v-if="activeTab === 'private'"/>
    <ClientList :chats="currentChats" v-else-if="activeTab === 'client'"/>
    <ProjList :chats="currentChats" v-else-if="activeTab === 'proj'"/>

    <!-- Fallback если нет сообщений -->
    <div v-if="!currentChats.length" v-show="!loading" class="text-center q-pa-md text-grey">
      Нет чатов для отображения
    </div>
  </div>
</template>

<style scoped>
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
