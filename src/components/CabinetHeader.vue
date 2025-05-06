<script setup lang="ts">
import {useRoute} from "vue-router";
const route = useRoute()
import {LocalStorage, useQuasar} from 'quasar'
import { useProjectsStore } from 'stores/projects-store'
import {onMounted, ref, watch} from "vue";
const store = useProjectsStore()

const $q = useQuasar()
const noty = ref(false)
const notyList = ref()
const getNoty = async () => {
  noty.value = true
  await store.fetchNotifications(LocalStorage.getItem('hash'))
  notyList.value = store.noty
}

const readNotify = async () => {
  await store.fetchNotificationsAsRead(LocalStorage.getItem('hash'))
  await getNoty()
  $q.notify({
    color: 'primary',
    position: 'top',
    message: 'Уведомления прочитаны',
    icon: 'thumb_up',
    timeout: 1000
  });
}

onMounted( async () => await store.fetchNotifications(LocalStorage.getItem('hash')))
watch(() => store.refreshTasks, async () => {
  if (store.refreshTasks) {
    await store.fetchNotifications(LocalStorage.getItem('hash'))
    store.refreshTasksSubmit()
  }
})
</script>

<template>
  <q-header class="bg-white text-grey-8 tasks-header">
    <q-toolbar v-if="route.fullPath === '/tasks'">
      <q-toolbar-title class="text-center text-h6">
        Список задач
      </q-toolbar-title>
      <div class="absolute-right flex items-center q-gutter-sm q-mr-sm">
        <q-btn color="green" round unelevated size="sm" icon="add">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section>
                  <router-link class="text-black" to="/create-task">
                    Задача
                  </router-link>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <router-link class="text-black" to="/create-project">
                    Проект
                  </router-link>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <button @click.prevent="getNoty" class="noty">
          <svg :class="{active: store.noty?.totalNew}" class="bell" width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31 0C44.2575 0 53.7553 10.4825 53.7553 24.0649V29.1783C53.7553 29.9134 54.4149 30.8722 56.1298 32.6299L57.0202 33.4928C60.5819 37.0082 62 39.0216 62 42.2814C62 43.6876 61.8351 44.8062 61.1096 46.1165C59.6255 48.9289 56.4266 50.4948 51.6447 50.4948H45.3787C43.2681 57.9412 38.3213 62 31 62C23.5798 62 18.633 57.8454 16.5883 50.2711L16.6543 50.4948H10.3553C5.40851 50.4948 2.20957 48.8969 0.791489 45.9887C0.131915 44.7103 0 43.6876 0 42.2814C0 39.0216 1.41809 37.0082 4.97979 33.4928L5.87021 32.6299C7.61809 30.8722 8.24468 29.9134 8.24468 29.1783V24.0649C8.24468 10.4825 17.7755 0 31 0ZM39.1457 50.4948H22.8543C24.3713 54.4897 26.9766 56.2474 31 56.2474C35.0234 56.2474 37.6287 54.4897 39.1457 50.4948ZM31 5.75258C21.2383 5.75258 14.1809 13.5186 14.1809 24.0649V29.1783C14.1809 31.8948 12.8947 33.8443 10.1245 36.6247L9.20106 37.5515C6.72766 39.9485 5.93617 41.099 5.93617 42.2814C5.93617 42.8887 5.96915 43.2083 6.13404 43.4959C6.46383 44.199 7.55213 44.7423 10.3553 44.7423H51.6447C54.3489 44.7423 55.4702 44.199 55.866 43.4639C56.0309 43.1443 56.0638 42.8247 56.0638 42.2814C56.0638 41.099 55.2723 39.9485 52.7989 37.5515L51.8755 36.6247C49.1053 33.8443 47.8192 31.8948 47.8192 29.1783V24.0649C47.8192 13.5186 40.7947 5.75258 31 5.75258Z" fill="currentColor"/>
          </svg>
          <span v-if="!!store.noty?.totalNew" :class="{splash: store.noty?.totalNew >= 100}" class="noty__count">{{store.noty?.totalNew}}</span>
        </button>
      </div>
    </q-toolbar>
    <q-toolbar v-else-if="route.fullPath === '/create-task'">
      <div class="flex items-center">
        <router-link to="/tasks" class="text-blue-5 flex items-center">
          <q-icon style="border-radius: 50%;" name="chevron_left" size='20px' class="text-blue-8 q-mr-xs" />
          <span >Задачи</span>
        </router-link>
      </div>
      <q-toolbar-title class="text-center text-h6 q-px-none">
        Создать задачу
      </q-toolbar-title>
      <div class="flex items-center">
        <q-btn :disable="store.createTask" @click.prevent="store.createTaskSubmit()" color="blue" flat no-caps class="text-subtitle2 q-pa-none q-mt-xs">
          Сохранить
        </q-btn>
      </div>
    </q-toolbar>
    <q-toolbar v-else-if="route.fullPath === '/create-project'">
      <div class="flex items-center">
        <router-link to="/tasks" class="text-blue-5 flex items-center">
          <q-icon style="border-radius: 50%;" name="chevron_left" size='20px' class=" text-blue-8q-mr-xs" />
          <span >Задачи</span>
        </router-link>
      </div>
      <q-toolbar-title class="text-center text-h6 q-px-none">
        Создать проект
      </q-toolbar-title>
      <div class="flex items-center">
        <q-btn :disable="store.createProject" @click.prevent="store.createProjectSubmit()" color="blue" flat no-caps class="text-subtitle2 q-pa-none q-mt-xs">
          Сохранить
        </q-btn>
      </div>
    </q-toolbar>
    <q-toolbar v-else-if="route.fullPath === '/chat'">
        <q-toolbar-title class="text-center text-h6 absolute-center">
          Чат
        </q-toolbar-title>
        <div class="absolute-right flex items-center q-gutter-sm q-mr-sm">
          <svg class="bell" width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31 0C44.2575 0 53.7553 10.4825 53.7553 24.0649V29.1783C53.7553 29.9134 54.4149 30.8722 56.1298 32.6299L57.0202 33.4928C60.5819 37.0082 62 39.0216 62 42.2814C62 43.6876 61.8351 44.8062 61.1096 46.1165C59.6255 48.9289 56.4266 50.4948 51.6447 50.4948H45.3787C43.2681 57.9412 38.3213 62 31 62C23.5798 62 18.633 57.8454 16.5883 50.2711L16.6543 50.4948H10.3553C5.40851 50.4948 2.20957 48.8969 0.791489 45.9887C0.131915 44.7103 0 43.6876 0 42.2814C0 39.0216 1.41809 37.0082 4.97979 33.4928L5.87021 32.6299C7.61809 30.8722 8.24468 29.9134 8.24468 29.1783V24.0649C8.24468 10.4825 17.7755 0 31 0ZM39.1457 50.4948H22.8543C24.3713 54.4897 26.9766 56.2474 31 56.2474C35.0234 56.2474 37.6287 54.4897 39.1457 50.4948ZM31 5.75258C21.2383 5.75258 14.1809 13.5186 14.1809 24.0649V29.1783C14.1809 31.8948 12.8947 33.8443 10.1245 36.6247L9.20106 37.5515C6.72766 39.9485 5.93617 41.099 5.93617 42.2814C5.93617 42.8887 5.96915 43.2083 6.13404 43.4959C6.46383 44.199 7.55213 44.7423 10.3553 44.7423H51.6447C54.3489 44.7423 55.4702 44.199 55.866 43.4639C56.0309 43.1443 56.0638 42.8247 56.0638 42.2814C56.0638 41.099 55.2723 39.9485 52.7989 37.5515L51.8755 36.6247C49.1053 33.8443 47.8192 31.8948 47.8192 29.1783V24.0649C47.8192 13.5186 40.7947 5.75258 31 5.75258Z" fill="#131313"/>
          </svg>
        </div>
      </q-toolbar>
    <q-toolbar v-else-if="route.fullPath === '/settings'">
        <q-toolbar-title class="text-center text-h6 absolute-center">
          Профиль
        </q-toolbar-title>
    </q-toolbar>
    <q-toolbar v-else-if="route.fullPath.includes('edit-task')">
      <div class="flex items-center">
        <q-btn to="/tasks" flat no-caps class="text-blue-5 q-pa-none">
          <q-icon style="border-radius: 50%;" name="chevron_left" size='20px' class="text-blue-8 q-mr-xs" />
          <span >Задачи</span>
        </q-btn>
      </div>
      <q-toolbar-title class="text-center text-h6 q-px-none">
        Изменить задачу
      </q-toolbar-title>
      <div class="flex items-center">
        <q-btn color="blue" flat no-caps class="text-subtitle2 q-pa-none q-mt-xs">
          Сохранить
        </q-btn>
      </div>
    </q-toolbar>
    <q-dialog full-height full-width square maximized v-model="noty">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-btn icon="close" flat round dense v-close-popup />
          <q-space />

          <q-btn @click.prevent="readNotify" class="q-pa-none" square flat size="md" no-caps>
            <q-icon class="q-mr-xs" name="check_circle_outline"></q-icon>
            Прочитать все
          </q-btn>
<!--          <a class="read-notify" @click="readNotify" href="#">-->
<!--            <q-icon class="q-mr-xs" size="sm" name="check_circle_outline"></q-icon>-->
<!--            Прочитать все-->
<!--          </a>-->
        </q-card-section>
        <q-list class="rounded-borders q-py-lg">
          <q-item v-for="(noty, i) in notyList?.notifications" :key="i">
            <q-item-section avatar>
              <q-avatar>
                <q-img :src="noty.photo"/>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold" lines="1">{{noty.name}}</q-item-label>
              <q-item-label lines="1">
                {{noty.description}}
              </q-item-label>
              <q-item-label caption lines="2">
                {{noty.text}}
              </q-item-label>
              <div class="flex items-center ">
                  <p class="text-caption q-mb-none q-mr-sm">{{noty.date}}</p>
                  <p class="text-caption q-mb-none">{{noty.time}}</p>
              </div>
            </q-item-section>

            <q-item-section v-if="noty.isNew" side>
              <q-icon name="adjust" color="red-5" size="xs"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-header>
</template>

<style scoped>
.tasks-header {
  height: 60px;
  transition: none !important; /* Отключаем анимацию для заголовка */
}
</style>
