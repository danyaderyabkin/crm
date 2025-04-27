<script setup lang="ts">
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { useProjectsStore } from 'stores/projects-store'
import { onMounted, onUnmounted } from 'vue'
import { formatDateRange } from '../utils/dateFormatter'
import type { IProject, ITask, IUser } from 'src/types/dictionary';

const tasks = ref<ITask[] | null>(null)
const visibleTasksCount = ref(20)
const store = useProjectsStore()
const isRefreshing = ref(false)
const tab = ref(1)
const tabs = ref()
const currentUser = ref<IUser | null>(null)
// Фильтруем задачи по выбранной вкладке
const filteredTasks = computed<ITask[] | null>(() => {
  if (!tasks.value) return null
  if (tab.value === 1) return tasks.value

  // Находим выбранный проект по id вкладки
  const selectedProject = tabs.value?.find((t:ITask) => t.id === tab.value)
  if (!selectedProject) return tasks.value

  // Фильтруем задачи по project_id
  return tasks.value.filter(task => task.project_id === selectedProject.id)
})

const handleScroll = () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    loadMoreTasks()
  }
}

const loadInitialTasks = async () => {
  if (store.dictionary === null) {
    await store.fetchProjects(LocalStorage.getItem('hash'))
  }

  tasks.value = store.dictionary ? store.dictionary.tasks.slice(0, visibleTasksCount.value) : null
  currentUser.value = store.dictionary ? store.dictionary.user : null
  // Фильтруем проекты по доступу текущего пользователя
  if (store.dictionary) {
    tabs.value = store.dictionary.projects.filter((project:IProject) => {
      // Проверяем есть ли текущий пользователь в списке пользователей проекта
      return project.users.some(user => user.user_id === currentUser.value?.id)
    })
  } else {
    tabs.value = null
  }
}

const refresh = async (done: () => void) => {
  isRefreshing.value = true
  try {
    await store.fetchProjects(LocalStorage.getItem('hash'))
    visibleTasksCount.value = 20
    tasks.value = store.dictionary ? store.dictionary.tasks.slice(0, visibleTasksCount.value) : null

    // Обновляем фильтрацию проектов при обновлении
    if (store.dictionary) {
      tabs.value = store.dictionary.projects.filter(project => {
        return project.users.some(user => user.user_id === currentUser.value?.id)
      })
    }
  } finally {
    isRefreshing.value = false
    done()
  }
}

const loadMoreTasks = () => {
  if (!store.dictionary || isRefreshing.value) return
  visibleTasksCount.value += 20
  tasks.value = store.dictionary.tasks.slice(0, visibleTasksCount.value)
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  await loadInitialTasks()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <q-pull-to-refresh @refresh="refresh">
    <div v-if="store.loading || isRefreshing" class="q-pa-sm q-gutter-sm task">
      <q-card v-for="item in 8" :key="item" class="no-shadow task__item">
        <q-item class="q-py-none">
          <q-item-section>
            <q-item-label>
              <q-skeleton class="brd" animation="fade" height="50px" type="text" />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions class="q-px-md q-pt-none justify-between">
          <div class="q-gutter-none">
            <q-skeleton animation="fade" height="20px" width="160px" type="text" />
            <q-skeleton animation="fade" height="20px" type="text" />
          </div>
          <div class="flex q-gutter-sm">
            <q-skeleton animation="fade" height="20px" type="QBtn" />
            <q-skeleton animation="fade" height="20px" width="30px" type="QBtn" />
          </div>
        </q-card-actions>
      </q-card>
    </div>

    <div v-else class="q-pa-sm q-gutter-sm task">
      <q-tabs
        v-model="tab"
        inline-label
        indicator-color="transparent"
        active-color="white"
        no-caps
        dense
        active-bg-color="primary"
        class="bg-transparent text-black sticky"
      >
        <q-tab content-class="q-py-none" class="q-btn--rounded q-mr-xs" :name="1" label="Все" />
        <q-tab
          v-for="tabItem in tabs"
          :key="tabItem.id"
          content-class="q-py-none"
          class="q-btn--rounded q-mr-xs"
          :name="tabItem.id"
          :label="tabItem.project_name"
        />
      </q-tabs>

      <q-card
        v-for="item in filteredTasks"
        :key="item.id"
        class="my-card task__item rounded-borders no-shadow"
      >
        <!-- Содержимое карточки задачи -->
        <q-card-section class="q-pb-none q-pt-sm">
          <h3 class="task__title q-my-none">{{ item.task_title }}</h3>
        </q-card-section>
        <q-card-section class="flex justify-start q-pa-xs q-px-md">
          <small class="bg-white rounded-borders text-black q-px-sm items-center">wecrm</small>
        </q-card-section>
        <q-card-section class="q-pt-none q-pb-xs flex no-wrap justify-between">
          <div class="task__users">
            <div class="flex items-center no-wrap text-caption">
              <p class="q-ma-none text-truncate">{{item.author.full_name}}
                <q-icon class="q-mx-xs" color="grey-9" name="trending_flat" />
                <span class="q-ma-none ">{{currentUser?.full_name}}</span>
              </p>
            </div>
            <div class="flex items-center no-wrap text-caption">
              <p class="q-ma-none">{{ formatDateRange(item.start_at, item.finish_at) }}</p>
            </div>
          </div>
          <div class="flex items-center no-wrap">
            <small v-if="item.status_id === 1" class="task__small text-no-wrap bg-primary no-border rounded-borders text-white text-caption q-px-md block">Новый</small>
            <small v-if="item.status_id === 2" class="task__small text-no-wrap bg-yellow-8 no-border rounded-borders text-white text-caption q-px-md block">В процессе</small>
            <small v-if="item.status_id === 3" class="task__small text-no-wrap bg-green-7 no-border rounded-borders text-white text-caption q-px-md block">Выполнено</small>
            <small v-if="item.status_id === 4" class="task__small text-no-wrap bg-grey-6 no-border rounded-borders text-white text-caption q-px-md block">Отменен</small>
            <q-icon size="xs" class="q-ml-sm q-mr-xs" color="grey-9" name="far fa-comment-alt" />
            <p v-if="item.totalComments" class="text-caption q-ma-none">{{item.totalComments}}</p>
          </div>
        </q-card-section>
      </q-card>

      <!-- Сообщение о завершении -->
      <div v-if="store.dictionary && visibleTasksCount >= store.dictionary.tasks.length" class="text-center text-caption q-mt-md">
        Все задачи загружены
      </div>
      <q-page-scroller expand position="top" :scroll-offset="150" :offset="[0, 0]">
        <div class="col cursor-pointer q-pa-sm bg-primary text-white text-center">
          Подняться вверх
          <q-icon name="arrow_upward" />
        </div>
      </q-page-scroller>
    </div>
  </q-pull-to-refresh>
</template>

<style scoped>
.brd {
  border-radius: 10px;
}
.text-truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.q-tabs--dense .q-tab {
  min-height: auto;
}

.q-tab.self-stretch {
  align-self: center;
}
</style>
