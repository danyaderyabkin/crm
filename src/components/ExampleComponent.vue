<template>
  <div class="q-pa-md full-width">
    <div class="row justify-center">
      <q-img
        class="col-6 q-btn--rounded"
        src="../assets/images/524beff85402a7f2648b60ebed82fcc3.png"
      />
    </div>
    <h1 class="text-h6 text-bold text-center text-mainAuth q-mb-xl q-mt-md">WeCRM</h1>

    <q-form @submit.prevent="loadData" @reset="onReset" class="q-gutter-md">
      <q-input
        class="custom-rounded-input"
        bg-color="inputAuth"
        label-color="blue-grey-12"
        outlined
        dense
        hide-bottom-space
        v-model="name"
        label="Электронная почта"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Введите Вашу почту']"
      />

      <q-input
        bg-color="inputAuth"
        label-color="blue-grey-12"
        hide-bottom-space
        outlined
        dense
        class="custom-rounded-input"
        type="password"
        v-model="password"
        label="Пароль"
        lazy-rules
        :rules="[(val) => (val !== null && val !== '') || 'Введите пароль']"
      />

      <div class="flex justify-center">
        <q-btn
          class="q-px-lg text-subtitle1"
          no-caps
          rounded
          label="Войти"
          type="submit"
          color="mainAuth"
          :loading="loading"
          :disable="loading"
        >
          <template v-slot:loading>
            <q-spinner-hourglass/>
          </template>
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { LocalStorage } from 'quasar'

interface ApiResponse {
  data: {
    hash: string
    userId: number
  }
  messages: string[] | []
  error: boolean
}

const $q = useQuasar()
const router = useRouter()

const name = ref<string>('')
const password = ref<string>('')
const data = ref<ApiResponse | null>(null)
const loading = ref<boolean>(false)

async function loadData() {
  loading.value = true;
  try {
    const response = await api.post<ApiResponse>('/auth', {
      email: name.value,
      password: password.value
    });

    data.value = response.data;
    if (!response.data.error) {
      await router.push('/tasks');
      LocalStorage.set('hash', response.data.data.hash);
    } else {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Пользователь не найден!',
        icon: 'report_problem',
        timeout: 3000
      });
    }

  } catch (error: unknown) {
    console.error('Полная информация об ошибке:', error);
    const errorMessage = 'Ошибка авторизации';
      $q.notify({
        color: 'negative',
        position: 'top',
        message: errorMessage,
        icon: 'report_problem',
        timeout: 3000
      });
  } finally {
    loading.value = false;
  }
}


function onReset() {
  name.value = ''
  password.value = ''
}

</script>
