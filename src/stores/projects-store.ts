import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref } from 'vue'
import type { IDictionary, INotifications } from 'src/types/dictionary'
export const useProjectsStore = defineStore('apiDictionary', () => {

  const createProject = ref<boolean>(false)
  const createTask = ref<boolean>(false)
  const refreshTasks = ref<boolean>(false)

  // Состояние
  const dictionary = ref<IDictionary | null>(null)
  const noty = ref<INotifications | null>(null)
  const loading = ref<boolean>(false)
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

  const fetchNotificationsAsRead = async (hash:string | null) => {
    try {
      const response = await api.post('/notifications/read?hash=' + hash)
      console.log(response.data.data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    }
  }

  const createProjectSubmit = () => createProject.value = !createProject.value
  const createTaskSubmit = () => createTask.value = !createTask.value
  const refreshTasksSubmit = () => refreshTasks.value = !refreshTasks.value

  return {
    createProject,
    createTask,
    dictionary,
    loading,
    error,
    noty,
    refreshTasks,
    fetchProjects,
    fetchNotifications,
    fetchNotificationsAsRead,
    createProjectSubmit,
    createTaskSubmit,
    refreshTasksSubmit
  }
})
