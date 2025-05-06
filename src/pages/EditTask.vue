<script setup lang="ts">
import {onMounted, ref, computed, watch} from 'vue';
import { useProjectsStore } from 'stores/projects-store';
import {LocalStorage, useQuasar} from 'quasar';
import type {
  DateTimeParts,
  ICheckList,
  IClient,
  IProject,
  ISupplier,
  ITask, IUser,
} from "src/types/dictionary";
import {api} from "boot/axios";
import type {ApiResponse} from "src/types/api";
import {useRouter, useRoute} from "vue-router";



const taskName = ref<string>('')
const currentTask = ref<ITask | null>(null);
const taskDescription = ref<string>('')
const dateFrom = ref<string>('')
const dateTo = ref<string>('')
const dateToEnd = ref<string>('')
const files = ref<Array<File | null>>([null]);
const project = ref<IProject | null>(null)
const supplier = ref<IUser[] | null>(null);
const observer = ref<IUser[] | null>(null)
const client = ref<IClient | null>(null)
const loading = ref<boolean>(false)
const store = useProjectsStore()


const dateSendTo = ref('')
const dateSendToEnd = ref('')
const timeTo = ref('')
const timeToEnd = ref('')
const data = ref<ApiResponse | null>(null)
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Вычисляемое свойство для отфильтрованных проектов текущего пользователя
const filteredProjects = computed(() => {
  if (!store.dictionary?.projects) return []
  return store.dictionary.projects
})

const addFileInput = () => {
  files.value.push(null);
};

const removeFileInput = (index: number) => {
  if (files.value.length > 1) {
    files.value.splice(index, 1);
  }
};

// Исправленный обработчик изменения файла
const handleFileChange = (newFile: File | null, index: number) => {
  files.value[index] = newFile;

  // Если добавили файл в последний инпут - добавляем новый
  if (newFile && index === files.value.length - 1) {
    addFileInput();
  }
};
const getCurrentStartDate = (stringToday: Date | string) => {
  if (!stringToday) return null;
  const today =  new Date(stringToday )
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');

  dateTo.value = `${day}.${month}.${year} ${hours}:${minutes}`;
  dateSendTo.value = `${day}.${month}.${year}`;
  timeTo.value = `${hours}:${minutes}`;
};
const getCurrentEndDate = (stringToday: Date | null | string) => {
  if (!stringToday) {
    dateToEnd.value = '';
    return;
  } else {
    const today =  new Date(stringToday)
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    dateToEnd.value = `${day}.${month}.${year} ${hours}:${minutes}`;
    dateSendToEnd.value = `${day}.${month}.${year}`;
    timeToEnd.value = `${hours}:${minutes}`;
  }
};

const loadInitialTasks = async () => {
  if (store.dictionary === null) {
    await store.fetchProjects(LocalStorage.getItem('hash'))
    await loadInitialTasks()
  } else {
    currentTask.value = store.dictionary?.tasks?.find((t:ITask) => t.id === Number(route.params.task_id)) ?? null;
    taskName.value = currentTask.value?.task_title ?? '';
    taskDescription.value = currentTask.value?.task_text ?? '';
    getCurrentStartDate( currentTask.value ? String(currentTask.value?.start_at) : '' );
    getCurrentEndDate( currentTask.value?.finish_at ? new Date(currentTask.value.finish_at) : null);
    project.value = store.dictionary?.projects?.find((p:IProject) => p.id === Number(currentTask.value?.project_id)) ?? null;
    fields.value = currentTask.value?.check_list.length ? currentTask.value?.check_list?.map((el: ICheckList) => ({value: el.title})) : [{ value: '' }];
    // Обработка suppliers
    supplier.value = currentTask.value?.suppliers
      ?.map((s: ISupplier) => store.dictionary?.users?.find((u: IUser) => u.id === s.user_id))
      ?.filter((u): u is IUser => u !== undefined) ?? null;
    observer.value = currentTask.value?.observers
      ?.map(o => store.dictionary?.users?.find(u => u.id === o.user_id))
      ?.filter((u): u is IUser => u !== undefined) ?? null;
    client.value = currentTask.value ? currentTask.value?.client : null;
  }
}

const fields = ref<{ value: string }[]>([{ value: '' }])

const addField = () => {
  fields.value.push({ value: '' })
}

const removeField = (index: number) => {
  if (fields.value.length > 1) {
    fields.value.splice(index, 1)
  }
}


async function createTask() {
  loading.value = true;
  try {
    const getDateTimeParts = (dateTimeStr: string): DateTimeParts => {
      const [date = '', time = ''] = dateTimeStr.split(' ');
      return { date, time };
    };

    const { date: datePart, time: timePart } = getDateTimeParts(dateFrom.value);

    // Создаем FormData для отправки файлов и данных
    const formData = new FormData();

    // Добавляем основные поля
    formData.append('task_title', taskName.value);
    formData.append('task_text', taskDescription.value);
    formData.append('hash', LocalStorage.getItem('hash') as string);
    formData.append('project_id', project.value?.id?.toString() || '');
    formData.append('date_start', dateSendTo.value);
    formData.append('time_start', timeTo.value);
    formData.append('date_finish', datePart);
    formData.append('time_finish', timePart);
    formData.append('client_id', client.value?.id?.toString() || '');

    // Добавляем исполнителей
    if (supplier.value) {
      supplier.value.forEach((user: IUser) => {
        formData.append('supplier_id[]', user.id.toString());
      });
    }

    // Добавляем наблюдателей
    if (observer.value) {
      observer.value.forEach(user => {
        formData.append('observers[]', user.id.toString());
      });
    }

    // Добавляем файлы
    if (files.value) {
      files.value
        .filter(file => file !== null)
        .forEach(file => {
          if (file) {
            formData.append('taskFiles[]', file);
          }
        });
    }

    // Добавляем подзадачи
    fields.value.forEach((field) => {
      if (field.value.trim()) {
        formData.append(`checklist[]`, field.value);
      }
    });

    // Отправляем запрос
    const response = await api.post<ApiResponse>('/task/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    data.value = response.data;
    if (!response.data.error) {
      await store.fetchProjects(LocalStorage.getItem('hash'))
      $q.notify({
        color: 'primary',
        position: 'top',
        message: 'Задача создана!',
        icon: 'thumb_up',
        timeout: 3000
      });
      await router.push('/tasks')
    } else {
      response.data.messages.forEach((msg: string) => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: msg,
          icon: 'report_problem',
          timeout: 3000
        });
      })
    }

  } catch (error: unknown) {
    console.error('Полная информация об ошибке:', error);
    const errorMessage = 'Ошибка';
    $q.notify({
      color: 'negative',
      position: 'top',
      message: errorMessage,
      icon: 'report_problem',
      timeout: 3000
    });
  } finally {
    loading.value = false;
    store.createTaskSubmit()
  }
}


onMounted(async () => await loadInitialTasks());

watch(() => store.createTask,async () => {
  if (store.createTask) {
    await createTask();
  }
})
</script>

<template>
  <div class="q-py-lg">
    <div class="q-gutter-y-md column">
<!--      <pre>{{currentTask}}</pre>-->
<!--      <pre>{{supplier}}</pre>-->
      <q-select
        behavior="menu"
        dense
        bg-color="white"
        label="Выберите проект"
        option-label="project_name"
        menu-self="top left"
        v-model="project"
        :options="filteredProjects"
      >
        <template v-slot:prepend>
          <svg class="q-ml-md" style="width: 20px" width="60" height="54" viewBox="0 0 60 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M56.4706 48.1783C56.4706 49.1524 55.6765 49.943 54.7059 49.943H5.29409C4.32347 49.943 3.52941 49.1524 3.52941 48.1783V4.06063H21.9953L26.7 11.1195H7.05881V14.6489H56.4706V48.1783H56.4706ZM30.9459 11.1195L23.887 0.53125H0V48.1783C0 51.0971 2.37531 53.4724 5.29413 53.4724H54.7059C57.6247 53.4724 60 51.0971 60 48.1783V11.1195H30.9459Z" fill="black"/>
          </svg>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.project_name }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-input bg-color="white" color="blue-7"  v-model="taskName" placeholder="Введите название задачи" dense>
        <template v-slot:prepend>
          <svg class="q-ml-md" style="width: 20px" width="74" height="51" viewBox="0 0 74 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.3335 12.5237C16.0031 11.8994 16.7896 11.414 17.6478 11.0953C18.506 10.7766 19.4188 10.6311 20.3335 10.667V14.0003C17.8668 14.0003 17.1735 15.3903 17.0002 15.9037V35.437C17.1602 35.9137 17.8368 37.3337 20.3335 37.3337V40.667C19.4188 40.7029 18.506 40.5574 17.6478 40.2387C16.7896 39.92 16.0031 39.4346 15.3335 38.8103C14.6639 39.4346 13.8773 39.92 13.0192 40.2387C12.161 40.5574 11.2482 40.7029 10.3335 40.667V37.3337C12.8002 37.3337 13.4935 35.9437 13.6668 35.4303V15.897C13.5068 15.4203 12.8302 14.0003 10.3335 14.0003V10.667C11.2482 10.6311 12.161 10.7766 13.0192 11.0953C13.8773 11.414 14.6639 11.8994 15.3335 12.5237ZM73.6668 5.66699V45.667C73.6651 46.9925 73.1377 48.2633 72.2004 49.2006C71.2631 50.1379 69.9924 50.6652 68.6668 50.667H5.3335C4.00795 50.6652 2.73721 50.1379 1.79991 49.2006C0.86261 48.2633 0.33526 46.9925 0.333496 45.667V5.66699C0.33526 4.34145 0.86261 3.07071 1.79991 2.13341C2.73721 1.19611 4.00795 0.668756 5.3335 0.666992H68.6668C69.9924 0.668756 71.2631 1.19611 72.2004 2.13341C73.1377 3.07071 73.6651 4.34145 73.6668 5.66699ZM70.3335 5.66699C70.3335 5.22496 70.1579 4.80104 69.8453 4.48848C69.5328 4.17592 69.1088 4.00033 68.6668 4.00033H5.3335C4.89147 4.00033 4.46755 4.17592 4.15498 4.48848C3.84242 4.80104 3.66683 5.22496 3.66683 5.66699V45.667C3.66683 46.109 3.84242 46.5329 4.15498 46.8455C4.46755 47.1581 4.89147 47.3337 5.3335 47.3337H68.6668C69.1088 47.3337 69.5328 47.1581 69.8453 46.8455C70.1579 46.5329 70.3335 46.109 70.3335 45.667V5.66699ZM37.0002 40.667H40.3335V37.3337H37.0002V40.667ZM30.3335 40.667H33.6668V37.3337H30.3335V40.667ZM23.6668 40.667H27.0002V37.3337H23.6668V40.667ZM43.6668 40.667H47.0002V37.3337H43.6668V40.667ZM57.0002 40.667H60.3335V37.3337H57.0002V40.667ZM50.3335 40.667H53.6668V37.3337H50.3335V40.667Z" fill="black"/>
          </svg>
        </template>
      </q-input>
<!--      <q-input bg-color="white" color="blue-7"  v-model="taskDescription" type="textarea" placeholder="Описание задачи" dense>-->
<!--        <template v-slot:prepend>-->
<!--          <svg class="q-ml-md" style="width: 20px" width="74" height="51" viewBox="0 0 74 51" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--            <path d="M15.3335 12.5237C16.0031 11.8994 16.7896 11.414 17.6478 11.0953C18.506 10.7766 19.4188 10.6311 20.3335 10.667V14.0003C17.8668 14.0003 17.1735 15.3903 17.0002 15.9037V35.437C17.1602 35.9137 17.8368 37.3337 20.3335 37.3337V40.667C19.4188 40.7029 18.506 40.5574 17.6478 40.2387C16.7896 39.92 16.0031 39.4346 15.3335 38.8103C14.6639 39.4346 13.8773 39.92 13.0192 40.2387C12.161 40.5574 11.2482 40.7029 10.3335 40.667V37.3337C12.8002 37.3337 13.4935 35.9437 13.6668 35.4303V15.897C13.5068 15.4203 12.8302 14.0003 10.3335 14.0003V10.667C11.2482 10.6311 12.161 10.7766 13.0192 11.0953C13.8773 11.414 14.6639 11.8994 15.3335 12.5237ZM73.6668 5.66699V45.667C73.6651 46.9925 73.1377 48.2633 72.2004 49.2006C71.2631 50.1379 69.9924 50.6652 68.6668 50.667H5.3335C4.00795 50.6652 2.73721 50.1379 1.79991 49.2006C0.86261 48.2633 0.33526 46.9925 0.333496 45.667V5.66699C0.33526 4.34145 0.86261 3.07071 1.79991 2.13341C2.73721 1.19611 4.00795 0.668756 5.3335 0.666992H68.6668C69.9924 0.668756 71.2631 1.19611 72.2004 2.13341C73.1377 3.07071 73.6651 4.34145 73.6668 5.66699ZM70.3335 5.66699C70.3335 5.22496 70.1579 4.80104 69.8453 4.48848C69.5328 4.17592 69.1088 4.00033 68.6668 4.00033H5.3335C4.89147 4.00033 4.46755 4.17592 4.15498 4.48848C3.84242 4.80104 3.66683 5.22496 3.66683 5.66699V45.667C3.66683 46.109 3.84242 46.5329 4.15498 46.8455C4.46755 47.1581 4.89147 47.3337 5.3335 47.3337H68.6668C69.1088 47.3337 69.5328 47.1581 69.8453 46.8455C70.1579 46.5329 70.3335 46.109 70.3335 45.667V5.66699ZM37.0002 40.667H40.3335V37.3337H37.0002V40.667ZM30.3335 40.667H33.6668V37.3337H30.3335V40.667ZM23.6668 40.667H27.0002V37.3337H23.6668V40.667ZM43.6668 40.667H47.0002V37.3337H43.6668V40.667ZM57.0002 40.667H60.3335V37.3337H57.0002V40.667ZM50.3335 40.667H53.6668V37.3337H50.3335V40.667Z" fill="black"/>-->
<!--          </svg>-->
<!--        </template>-->
<!--      </q-input>-->
      <div>
        <q-editor flat v-model="taskDescription" min-height="5rem" />
<!--        <q-card flat >-->
<!--          <q-card-section>-->
<!--            <pre style="white-space: pre-line">{{ taskDescription }}</pre>-->
<!--          </q-card-section>-->
<!--        </q-card>-->
      </div>
<!--      <q-editor v-model="taskDescription" min-height="5rem" />-->
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
        <q-input placeholder="Дата завершения" bg-color="white" color="blue-7"  dense v-model="dateToEnd">
          <template v-slot:prepend>
            <q-icon size="xs" name="fa-regular fa-calendar" class="cursor-pointer text-grey-10 q-pl-md">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date minimal today-btn v-model="dateToEnd" mask="DD.MM.YYYY HH:mm">
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
                <q-time v-model="dateToEnd" mask="DD.MM.YYYY HH:mm" format24h>
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
        <q-select multiple behavior="menu" dense bg-color="white" label="Исполнитель" option-label="full_name"  v-model="supplier" :options="store.dictionary?.users"  >
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
        <q-select  multiple behavior="menu"  dense bg-color="white" label="Наблюдатель" option-label="full_name"  v-model="observer" :options="store.dictionary?.users"  >
          <template v-slot:prepend>
            <div class="q-pl-md flex">
              <span style="width: 20px;"></span>
            </div>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.full_name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select  dense bg-color="white" label="Клиент" option-label="full_name"  v-model="client" :options="store.dictionary?.clients"  >
          <template v-slot:prepend>
            <div class="q-pl-md flex">
              <span style="width: 20px;"></span>
            </div>
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
      <div>
        <div v-for="(file, index) in files" :key="index" class="q-mb-sm file-input-wrapper relative-position">
          <q-file
            square
            dense
            bg-color="white"
            color="blue-7"
            :model-value="files[index]"
            @update:model-value="(val) => handleFileChange(val, index)"
          >
            <template v-slot:prepend>
              <svg style="width: 20px; height: 20px" class="q-ml-md" width="80" height="74" viewBox="0 0 80 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M72.9805 7.75916C63.6209 -1.60053 48.4734 -1.59959 39.1148 7.75916L5.45602 41.4179C-1.81867 48.6924 -1.81867 60.5292 5.45602 67.8038C12.7326 75.0806 24.5695 75.0763 31.842 67.8038L65.5007 34.1451C70.7132 28.9326 70.7132 20.4513 65.5007 15.2388C60.2884 10.0262 51.807 10.0262 46.5945 15.2388L17.8871 43.9462C16.7973 45.036 16.7973 46.8032 17.8871 47.8929C18.977 48.9828 20.7441 48.9828 21.8338 47.8929L50.5412 19.1856C53.5774 16.1493 58.5177 16.1493 61.5538 19.1856C64.5899 22.2218 64.5899 27.1621 61.5538 30.1982L27.8952 63.8571C22.7843 68.9681 14.513 68.9674 9.40273 63.8571C6.93305 61.3874 5.57289 58.1038 5.57289 54.611C5.57289 51.1182 6.9332 47.8346 9.40273 45.3648L43.0615 11.7059C50.2396 4.52775 61.8563 4.52869 69.0337 11.7059C76.1941 18.8665 76.1941 30.5176 69.0337 37.6781L54.0741 52.6376C52.9843 53.7274 52.9843 55.4945 54.0741 56.5843C55.164 57.6742 56.9312 57.6742 58.0209 56.5843L72.9804 41.6248C82.3402 32.2654 82.3391 17.1176 72.9805 7.75916Z" fill="black"/>
              </svg>
            </template>
            <template v-if="!files[index]" v-slot:default>
              <div class="text-grey-7 absolute-left q-mt-sm">Прикрепить файл</div>
            </template>
          </q-file>

          <q-btn
            v-if="files.length > 1"
            round
            dense
            flat
            icon="remove"
            @click="removeFileInput(index)"
            color="negative"
            class="remove-btn bg-white absolute-top-right"
          />
        </div>

      </div>
      <div>
        <div v-for="(field, index) in fields" :key="index" class="q-mb-sm">
          <q-input
            bg-color="white"
            color="blue-7"
            v-model="field.value"
            type="text"
            placeholder="Подзадачи"
            dense
          >
            <template v-slot:prepend>
              <q-icon style="width: 20px" size="xs" class="q-ml-md text-black" name="fa-solid fa-list-ul"></q-icon>
              <q-btn
                v-if="index === fields.length - 1"
                round
                dense
                unelevated
                no-caps
                class="q-ml-xs"
                size="sm"
                icon="add"
                @click="addField"
                color="positive"
              />
            </template>

            <template v-slot:append>

              <q-btn
                v-if="fields.length > 1"
                round
                dense
                flat
                icon="remove"
                @click="removeField(index)"
                color="negative"
                class="q-ml-xs"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<style >
.q-field__native .ellipsis {
  white-space: normal;
}
.q-editor__content {
  word-break: break-all;
}
</style>
