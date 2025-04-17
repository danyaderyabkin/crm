import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref } from 'vue'
import type { IDictionary, INotifications } from 'src/types/dictionary'
export const useProjectsStore = defineStore('api', () => {
  // Состояние
  const dictionary = ref<IDictionary | null>(null)
  const noty = ref<INotifications | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Действия
  const fetchProjects = async (hash:string | null) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/dictionaries', {
        params: {
          hash,
        }
      })
      dictionary.value = response.data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      loading.value = false
    }
  }

  const fetchNotifications = async (hash:string | null) => {
    try {
      const response = await api.get('/notifications', {
        params: {
          hash,
        }
      })
      noty.value = response.data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    }
  }

  return {
    dictionary,
    loading,
    error,
    noty,
    fetchProjects,
    fetchNotifications,
  }
})
