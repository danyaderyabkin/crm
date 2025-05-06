<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useProjectsStore } from 'stores/projects-store';
import {LocalStorage, useQuasar} from 'quasar';
import {api} from "boot/axios";
import type {ApiResponse} from 'src/types/api'
import type {IUser} from "src/types/dictionary";
import {useRouter} from "vue-router";


const text = ref<string>('')
const textTime = ref<string>('Бессрочный проект')
const dateFrom = ref<string>('')
const dateTo = ref<string>('')
const dateSendTo = ref<string>('')
const timeTo = ref<string>('')
const users = ref<IUser[] | null>(null)
const valueTime = ref<boolean>(true)
const loading = ref<boolean>(false)

const store = useProjectsStore()
const router = useRouter()
// const data = ref<ApiResponse | null>(null)

const $q = useQuasar()

const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = today.getFullYear();

  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');

  dateTo.value = `${day}.${month}.${year} ${hours}:${minutes}`;
  dateSendTo.value = `${day}.${month}.${year}`;
  timeTo.value = `${hours}:${minutes}`;
};

const loadInitialTasks = async () => {
  if (store.dictionary === null) {
    await store.fetchProjects(LocalStorage.getItem('hash'))
  }
}


async function createProject() {
  loading.value = true;
  try {
    const [date, time] = dateFrom.value.split(' ');
    const params = new URLSearchParams({
      hash: LocalStorage.getItem('hash') as string,
      project_name: text.value,
      date_start: dateSendTo.value,
      time_start: timeTo.value,
      date_finish: date || '',
      time_finish: time || '',
    });

    users.value?.forEach(user => params.append('selectedUsers[]', user.id.toString()));

    const { data } = await api.post<ApiResponse>('/project/create', params.toString());

    if (!data.error) {
      await store.fetchProjects(LocalStorage.getItem('hash'));
      $q.notify({ color: 'primary', message: 'Проект создан!', icon: 'thumb_up', timeout: 3000 });
      await router.push('/tasks');
    } else {
      data.messages.forEach(msg => $q.notify({ color: 'negative', message: msg, icon: 'report_problem' }));
    }
  } catch (error) {
    console.error('Ошибка:', error);
    $q.notify({ color: 'negative', message: 'Ошибка создания проекта', icon: 'report_problem' });
  } finally {
    loading.value = false;
    store.createProjectSubmit();
  }
}

onMounted(async () => {
  await loadInitialTasks()
  getCurrentDate();
  console.log(store.dictionary);
});

watch(() => dateFrom.value,() => {
  valueTime.value = false
})

watch(() => store.createProject,async () => {
  if (store.createProject) {
    await createProject();
  }
})

</script>

<template>
  <div class="q-py-lg">
    <div class="q-gutter-y-md column">
      <q-input bg-color="white" color="blue-7"  v-model="text" placeholder="Введите название проекта" dense>
        <template v-slot:prepend>
          <svg class="q-ml-md" style="width: 20px" width="74" height="51" viewBox="0 0 74 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.3335 12.5237C16.0031 11.8994 16.7896 11.414 17.6478 11.0953C18.506 10.7766 19.4188 10.6311 20.3335 10.667V14.0003C17.8668 14.0003 17.1735 15.3903 17.0002 15.9037V35.437C17.1602 35.9137 17.8368 37.3337 20.3335 37.3337V40.667C19.4188 40.7029 18.506 40.5574 17.6478 40.2387C16.7896 39.92 16.0031 39.4346 15.3335 38.8103C14.6639 39.4346 13.8773 39.92 13.0192 40.2387C12.161 40.5574 11.2482 40.7029 10.3335 40.667V37.3337C12.8002 37.3337 13.4935 35.9437 13.6668 35.4303V15.897C13.5068 15.4203 12.8302 14.0003 10.3335 14.0003V10.667C11.2482 10.6311 12.161 10.7766 13.0192 11.0953C13.8773 11.414 14.6639 11.8994 15.3335 12.5237ZM73.6668 5.66699V45.667C73.6651 46.9925 73.1377 48.2633 72.2004 49.2006C71.2631 50.1379 69.9924 50.6652 68.6668 50.667H5.3335C4.00795 50.6652 2.73721 50.1379 1.79991 49.2006C0.86261 48.2633 0.33526 46.9925 0.333496 45.667V5.66699C0.33526 4.34145 0.86261 3.07071 1.79991 2.13341C2.73721 1.19611 4.00795 0.668756 5.3335 0.666992H68.6668C69.9924 0.668756 71.2631 1.19611 72.2004 2.13341C73.1377 3.07071 73.6651 4.34145 73.6668 5.66699ZM70.3335 5.66699C70.3335 5.22496 70.1579 4.80104 69.8453 4.48848C69.5328 4.17592 69.1088 4.00033 68.6668 4.00033H5.3335C4.89147 4.00033 4.46755 4.17592 4.15498 4.48848C3.84242 4.80104 3.66683 5.22496 3.66683 5.66699V45.667C3.66683 46.109 3.84242 46.5329 4.15498 46.8455C4.46755 47.1581 4.89147 47.3337 5.3335 47.3337H68.6668C69.1088 47.3337 69.5328 47.1581 69.8453 46.8455C70.1579 46.5329 70.3335 46.109 70.3335 45.667V5.66699ZM37.0002 40.667H40.3335V37.3337H37.0002V40.667ZM30.3335 40.667H33.6668V37.3337H30.3335V40.667ZM23.6668 40.667H27.0002V37.3337H23.6668V40.667ZM43.6668 40.667H47.0002V37.3337H43.6668V40.667ZM57.0002 40.667H60.3335V37.3337H57.0002V40.667ZM50.3335 40.667H53.6668V37.3337H50.3335V40.667Z" fill="black"/>
          </svg>
        </template>
      </q-input>
      <div>
        <q-input  bg-color="white" color="blue-7"  dense v-model="dateTo">
          <template v-slot:prepend>
            <q-icon size="xs" name="fa-regular fa-calendar" class="cursor-pointer text-grey-10 q-pl-md">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date minimal today-btn v-model="dateTo" mask="DD.MM.YYYY HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Применить" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="schedule" class="cursor-pointer text-grey-10 q-pr-md">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="dateTo" mask="DD.MM.YYYY HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Применить" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input readonly bg-color="white" color="blue-7"  v-model="textTime" dense>
          <template v-slot:prepend>
            <svg class="q-ml-md invisible" style="width: 20px" width="74" height="51" viewBox="0 0 74 51" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.3335 12.5237C16.0031 11.8994 16.7896 11.414 17.6478 11.0953C18.506 10.7766 19.4188 10.6311 20.3335 10.667V14.0003C17.8668 14.0003 17.1735 15.3903 17.0002 15.9037V35.437C17.1602 35.9137 17.8368 37.3337 20.3335 37.3337V40.667C19.4188 40.7029 18.506 40.5574 17.6478 40.2387C16.7896 39.92 16.0031 39.4346 15.3335 38.8103C14.6639 39.4346 13.8773 39.92 13.0192 40.2387C12.161 40.5574 11.2482 40.7029 10.3335 40.667V37.3337C12.8002 37.3337 13.4935 35.9437 13.6668 35.4303V15.897C13.5068 15.4203 12.8302 14.0003 10.3335 14.0003V10.667C11.2482 10.6311 12.161 10.7766 13.0192 11.0953C13.8773 11.414 14.6639 11.8994 15.3335 12.5237ZM73.6668 5.66699V45.667C73.6651 46.9925 73.1377 48.2633 72.2004 49.2006C71.2631 50.1379 69.9924 50.6652 68.6668 50.667H5.3335C4.00795 50.6652 2.73721 50.1379 1.79991 49.2006C0.86261 48.2633 0.33526 46.9925 0.333496 45.667V5.66699C0.33526 4.34145 0.86261 3.07071 1.79991 2.13341C2.73721 1.19611 4.00795 0.668756 5.3335 0.666992H68.6668C69.9924 0.668756 71.2631 1.19611 72.2004 2.13341C73.1377 3.07071 73.6651 4.34145 73.6668 5.66699ZM70.3335 5.66699C70.3335 5.22496 70.1579 4.80104 69.8453 4.48848C69.5328 4.17592 69.1088 4.00033 68.6668 4.00033H5.3335C4.89147 4.00033 4.46755 4.17592 4.15498 4.48848C3.84242 4.80104 3.66683 5.22496 3.66683 5.66699V45.667C3.66683 46.109 3.84242 46.5329 4.15498 46.8455C4.46755 47.1581 4.89147 47.3337 5.3335 47.3337H68.6668C69.1088 47.3337 69.5328 47.1581 69.8453 46.8455C70.1579 46.5329 70.3335 46.109 70.3335 45.667V5.66699ZM37.0002 40.667H40.3335V37.3337H37.0002V40.667ZM30.3335 40.667H33.6668V37.3337H30.3335V40.667ZM23.6668 40.667H27.0002V37.3337H23.6668V40.667ZM43.6668 40.667H47.0002V37.3337H43.6668V40.667ZM57.0002 40.667H60.3335V37.3337H57.0002V40.667ZM50.3335 40.667H53.6668V37.3337H50.3335V40.667Z" fill="black"/>
            </svg>
          </template>
          <template v-slot:append>
            <q-toggle
              icon-color="teal"
              size="lg"
              v-model="valueTime"
              color="green"
            />
          </template>
        </q-input>
        <q-input placeholder="Дата завершения" bg-color="white" color="blue-7"  dense v-model="dateFrom">
          <template v-slot:prepend>
            <q-icon size="xs" name="fa-regular fa-calendar" class="cursor-pointer text-grey-10 q-pl-md">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date minimal today-btn v-model="dateFrom" mask="DD.MM.YYYY HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Применить" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer text-grey-10 q-pr-md">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="dateFrom" mask="DD.MM.YYYY HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Применить" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div>
        <q-select  multiple behavior="menu"  dense bg-color="white" label="Выбрать пользователей" option-label="full_name"  v-model="users" :options="store.dictionary?.users"  >
          <template v-slot:prepend>
            <q-icon class="q-ml-md " color="black" style="width: 20px;" name="people_outline" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.full_name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<style >
.q-toggle__inner--truthy .q-toggle__thumb {
  left: 0.72em;
}
.q-toggle__track {
  height: .4em;
}
.q-toggle__thumb {
  top: 0.345em;
  width: 0.35em;
  height: 0.35em;
  color: white;
  left: 0.34em;
}
.q-toggle__inner--truthy .q-toggle__track {
  opacity: 1;
  background: #17de00;
}
.q-field .ellipsis {
  white-space: normal !important;
}
</style>
