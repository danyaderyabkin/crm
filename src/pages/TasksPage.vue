<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { LocalStorage, useQuasar } from 'quasar';
import { useProjectsStore } from 'stores/projects-store';
import { formatDateRange } from '../utils/dateFormatter';
import type { IProject, ISupplier, ITask, IUser } from 'src/types/dictionary';
import { useTasksStore } from 'stores/tasks-store';

const store = useProjectsStore();
const storeTasks = useTasksStore();
const isRefreshing = ref(false);
const taskModal = ref(false);
const tab = ref(1);
const tabs = ref<IProject[] | null>();
const currentUser = ref<IUser | null>(null);

// Храним количество видимых задач для каждой вкладки
const visibleTasksCount = ref<Record<number, number>>({ 1: 20 }); // Инициализируем для вкладки "Все"

const $q = useQuasar();

// Получаем текущее количество видимых задач для активной вкладки
const currentVisibleCount = computed(() => visibleTasksCount.value[tab.value] || 20);

const filteredTasks = computed<ITask[] | null>(() => {
  if (!store.dictionary?.tasks || !currentUser.value) return null;

  // Фильтруем задачи по доступности для пользователя
  const userTasks = store.dictionary.tasks.filter(task => {
    return (
      task.suppliers?.some(s => s.user_id === currentUser.value?.id) ||
      task.author.id === currentUser.value?.id ||
      task.observers?.some(o => o.user_id === currentUser.value?.id)
    );
  });

  // Для вкладки "Все"
  if (tab.value === 1) return userTasks.slice(0, currentVisibleCount.value);

  // Для конкретного проекта
  return userTasks
    .filter(task => task.project_id === tab.value)
    .slice(0, currentVisibleCount.value);
});

// Проверяем, все ли задачи загружены для текущей вкладки
const isAllTasksLoaded = computed(() => {
  if (!store.dictionary?.tasks) return false;

  const allFilteredTasks = store.dictionary.tasks.filter((task) => {
    return (
      task.suppliers?.some((s) => s.user_id === currentUser.value?.id) ||
      task.author.id === currentUser.value?.id
    );
  });

  if (tab.value === 1) {
    return currentVisibleCount.value >= allFilteredTasks.length;
  }

  const selectedProject = tabs.value?.find((t) => t.id === tab.value);
  if (!selectedProject) return currentVisibleCount.value >= allFilteredTasks.length;

  const projectTasks = allFilteredTasks.filter((task) => task.project_id === selectedProject.id);
  return currentVisibleCount.value >= projectTasks.length;
});

const handleScroll = () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !isAllTasksLoaded.value
  ) {
    loadMoreTasks();
  }
};

const loadInitialTasks = async () => {
  if (store.dictionary === null) {
    await store.fetchProjects(LocalStorage.getItem('hash'));
  }

  currentUser.value = store.dictionary ? store.dictionary.user : null;

  if (store.dictionary) {
    // Фильтруем проекты, где у пользователя есть хотя бы одна задача:
    // - как исполнитель
    // - как автор
    // - как наблюдатель
    tabs.value = store.dictionary.projects.filter((project: IProject) => {
      return store.dictionary?.tasks.some(task => {
        // Проверяем принадлежность задачи к проекту
        if (task.project_id !== project.id) return false;

        // Проверяем причастность пользователя к задаче
        return (
          // Является исполнителем
          task.suppliers?.some(s => s.user_id === currentUser.value?.id) ||
          // Является автором
          task.author.id === currentUser.value?.id ||
          // Является наблюдателем
          task.observers?.some(o => o.user_id === currentUser.value?.id)
        );
      });
    });

    // Инициализируем счетчики для найденных проектов
    tabs.value.forEach(project => {
      if (!visibleTasksCount.value[project.id]) {
        visibleTasksCount.value[project.id] = 20;
      }
    });
  } else {
    tabs.value = null;
  }
};

const refresh = async (done: () => void) => {
  isRefreshing.value = true;
  store.refreshTasksSubmit();
  try {
    await store.fetchProjects(LocalStorage.getItem('hash'));

    // Сбрасываем счетчики для всех вкладок
    Object.keys(visibleTasksCount.value).forEach((key) => {
      visibleTasksCount.value[Number(key)] = 20;
    });

    if (store.dictionary) {
      tabs.value = store.dictionary.projects.filter((project) => {
        return store.dictionary?.tasks.some(
          (task) =>
            task.project_id === project.id &&
            (task.suppliers?.some((s) => s.user_id === currentUser.value?.id) ||
              task.author.id === currentUser.value?.id),
        );
      });
    }
  } finally {
    isRefreshing.value = false;
    done();
  }
};

const loadMoreTasks = () => {
  if (!store.dictionary || isRefreshing.value || isAllTasksLoaded.value) return;

  // Увеличиваем счетчик для текущей вкладки
  visibleTasksCount.value = {
    ...visibleTasksCount.value,
    [tab.value]: (visibleTasksCount.value[tab.value] || 20) + 20,
  };
};

// Остальные функции остаются без изменений
const deleteTask = async (id: number) => {
  try {
    await storeTasks.deleteTask(LocalStorage.getItem('hash'), id);
    await refresh(() => {
      $q.notify({
        color: 'primary',
        message: 'Задача успешно удалена',
        timeout: 1000,
      });
    });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    $q.notify({
      color: 'negative',
      message: 'Не удалось удалить задачу',
    });
  }
};

const getProjectName = (projectId: number): string | null => {
  if (!store.dictionary?.projects) return null;
  const project = store.dictionary.projects.find((p) => p.id === projectId);
  return project ? project.project_name : null;
};

const getUsersName = (suppliers: ISupplier[]): string[] | null => {
  if (!store.dictionary?.users) return null;
  const supplierUserIds = suppliers.map((supplier) => supplier.user_id);
  const matchedUsers = store.dictionary.users.filter((user) => supplierUserIds.includes(user.id));
  return matchedUsers.map((user) => user.full_name);
};

onMounted(async () => {
  window.addEventListener('scroll', handleScroll);
  await loadInitialTasks();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <q-pull-to-refresh @refresh="refresh">
    <div v-if="store.loading || isRefreshing" class="q-pa-sm q-gutter-sm task">
      <div class="flex items-stretch no-wrap overflow-hidden">
        <q-skeleton
          class="bg-grey-3 brd q-mr-xs"
          animation="fade"
          height="22px"
          width="100px"
          type="QBadge"
        />
        <q-skeleton
          class="bg-grey-3 brd q-mr-xs"
          animation="fade"
          height="22px"
          width="100px"
          type="QBadge"
        />
        <q-skeleton
          class="bg-grey-3 brd q-mr-xs"
          animation="fade"
          height="22px"
          width="100px"
          type="QBadge"
        />
        <q-skeleton
          class="bg-grey-3 brd q-mr-xs"
          animation="fade"
          height="22px"
          width="100px"
          type="QBadge"
        />
        <q-skeleton
          class="bg-grey-3 brd"
          animation="fade"
          height="22px"
          width="100px"
          type="QBadge"
        />
      </div>
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
          :label="`${tabItem.project_name}`"
          content-class="q-py-none"
          class="q-btn--rounded q-mr-xs"
          :name="tabItem.id"
        />
      </q-tabs>

      <q-card
        v-for="item in filteredTasks"
        :key="item.id"
        class="my-card task__item rounded-borders no-shadow"
      >
        <q-btn class="absolute-top-right z-fab" no-caps dense round unelevated flat color="grey-5" icon="more_vert">
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <router-link class="text-black" :to="`/edit-task/${item.id}`">
                    Редактировать
                  </router-link>
                </q-item-section>
              </q-item>
              <q-item @click.prevent="deleteTask(item.id)" v-close-popup clickable>
                <q-item-section class="text-red-5"> Удалить </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- Содержимое карточки задачи -->
        <q-card-section class="q-pb-none q-pt-sm q-pr-lg q-mr-xs">
          <h3 @click.prevent="taskModal = !taskModal" class="task__title q-my-none">
            {{ item.task_title }}
          </h3>
        </q-card-section>
        <q-card-section class="flex justify-start q-pa-xs q-px-md">
          <small
            v-if="getProjectName(item.project_id)"
            class="bg-white rounded-borders text-black q-px-sm items-center"
          >
            {{ getProjectName(item.project_id) }}
          </small>
        </q-card-section>
        <q-card-section class="q-pt-none q-pb-xs q-pr-sm flex no-wrap justify-between">
          <div class="task__users">
            <div class="flex items-center no-wrap text-caption">
              <p class="q-ma-none text-truncate">
                {{ item.author.full_name }}
                <q-icon class="q-mr-xs" color="grey-9" name="trending_flat" />
                <small class="text-caption"
                  ><span
                    class="q-ma-none task__suppliers"
                    v-for="(supplier, i) in getUsersName(item.suppliers)"
                    :key="i"
                  >
                    {{ supplier }}</span
                  ></small
                >
              </p>
            </div>
            <div ref="status" class="flex items-center no-wrap text-caption">
              <p class="q-ma-none">{{ formatDateRange(item.start_at, item.finish_at ?? '') }}</p>
            </div>
          </div>
          <div class="flex items-center no-wrap">
            <small
              v-if="item.status_id === 1"
              class="task__small text-no-wrap bg-primary no-border rounded-borders text-white text-caption q-px-md block"
              >Новый</small
            >
            <small
              v-if="item.status_id === 2"
              class="task__small text-no-wrap bg-yellow-8 no-border rounded-borders text-white text-caption q-px-md block"
              >В процессе</small
            >
            <small
              v-if="item.status_id === 3"
              class="task__small text-no-wrap bg-green-7 no-border rounded-borders text-white text-caption q-px-md block"
              >Выполнено</small
            >
            <small
              v-if="item.status_id === 4"
              class="task__small text-no-wrap bg-red-5 no-border rounded-borders text-white text-caption q-px-md block"
              >Не выполнено</small
            >
            <small
              v-if="item.status_id === 5"
              class="task__small text-no-wrap bg-grey-6 no-border rounded-borders text-white text-caption q-px-md block"
              >Отменен</small
            >
            <div class="flex items-center relative-position q-ml-sm">
              <q-icon size="xs" color="grey-9 " name="far fa-comment-alt" />
              <p v-if="item.totalComments" class="text-caption count-message q-ma-none">
                {{ item.totalComments }}
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Сообщение о завершении -->
      <div v-if="isAllTasksLoaded" class="text-center text-caption q-mt-md">
        Все задачи загружены
      </div>
      <q-page-scroller
        class="z-fab relative-position"
        expand
        position="top"
        :scroll-offset="150"
        :offset="[0, 0]"
      >
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
  max-width: 100%;
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
