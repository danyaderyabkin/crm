<template>
  <div class="q-pa-md full-width">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        filled
        rounded
        v-model="name"
        label="Электронная почта"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        filled
        rounded
        type="number"
        v-model="age"
        label="Пароль"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type your age',
          val => val > 0 && val < 100 || 'Please type a real age'
        ]"
      />
<!--      <q-toggle v-model="accept" label="I accept the license and terms"/>-->

      <div class="flex justify-center">
        <q-btn rounded label="Войти" type="submit" color="primary"/>
      </div>
    </q-form>

  </div>
</template>

<script setup lang="ts">
import {useQuasar} from 'quasar'
import {ref} from 'vue'

const $q = useQuasar()

const name = ref(null)
const age = ref(null)
const accept = ref(false)

function onSubmit() {
  if (accept.value !== true) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'You need to accept the license and terms first'
    })
  } else {
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Submitted'
    })
  }
}

function onReset() {
  name.value = null
  age.value = null
  accept.value = false
}
</script>
