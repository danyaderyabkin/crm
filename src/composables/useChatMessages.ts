// src/composables/useChatMessages.ts
import { ref } from 'vue';
import { LocalStorage } from 'quasar';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';
import type { Message } from 'src/types/chat';

export function useChatMessages() {
  const route = useRoute();
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref('');

  const fetchMessages = async (type: number) => {
    try {
      loading.value = true;
      error.value = '';
      const hash: string | null = LocalStorage.getItem('hash');
      const dialogId: number = Number(route.params.dialog_id);

      if (!hash) throw new Error('Hash not found in LocalStorage');

      const response = await api.get('/chat/messages', {
        params: { hash, chat_id: dialogId, chat_type: type },
      });

      messages.value = response.data.data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching messages:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    messages,
    loading,
    error,
    fetchMessages,
  };
}
