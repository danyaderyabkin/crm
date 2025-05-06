import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref } from 'vue'

export const useChatStore = defineStore('apiChat', () => {

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
  const chat = ref<ChatData>({
    privateChats: [],
    allChats: [],
    clientChats: [],
    globalChat: [],
    projectChats: []
  })

  const fetchChat = async (hash: string | null): Promise<ChatData> => {
    try {
      const response = await api.get('/chat/list', {
        params: { hash }
      })

      // Преобразуем ответ сервера в ChatData
      const data = response.data.data || {}
      const result: ChatData = {
        privateChats: data.privateChats || [],
        allChats: data.allChats || [],
        clientChats: data.clientChats || [],
        globalChat: data.globalChat || [],
        projectChats: data.projectChats || []
      }

      chat.value = result
      return result
    } catch (err) {
      console.error(err)
      // Возвращаем пустую структуру в случае ошибки
      return {
        privateChats: [],
        allChats: [],
        clientChats: [],
        globalChat: [],
        projectChats: []
      }
    }
  }

  return { chat, fetchChat }
})
