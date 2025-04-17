import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref } from 'vue'

export const useTasksStore = defineStore('api', () => {

  // Состояние
  const tasks = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Действия
  const fetchTasks = async (hash:string | null) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/tasks', {
        params: {
          hash,
        }
      })
      tasks.value = response.data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      loading.value = false
    }
  }


  // Геттеры

  return {
    tasks,
    loading,
    error,
    fetchTasks,
  }
})
