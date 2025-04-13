<script setup lang="ts">
import {useQuasar} from "quasar";

const $q = useQuasar()
console.log($q.localStorage.getAll())

</script>

<template>
  <div class="q-pa-sm q-gutter-sm task">
    <q-card v-for="item in 5" :key="item" class="my-card task__item rounded-borders no-shadow">
      <q-card-section class="q-pb-none q-pt-sm">
        <h3 class="text-body1 q-my-none">Разработка wecrm приложения для
          android версии на vue quasar</h3>
      </q-card-section>
      <q-card-section class="flex justify-start q-pa-xs q-px-md">
        <small class="bg-white rounded-borders text-black q-px-sm  items-center">wecrm</small>
      </q-card-section>
      <q-card-section class="q-pt-none q-pb-xs flex justify-between" align="right">
        <div>
          <div class="flex items-center text-caption">
            <p class="q-ma-none">Павлов Д.М</p>
            <q-icon class="q-mx-xs" color="grey-9" name="trending_flat" />
            <p class="q-ma-none">Павлов Д.М</p>
          </div>
          <div class="flex items-center text-caption">
            <p class="q-ma-none">15/01/2025</p>
            <small class="q-mx-xs">-</small>
            <p class="q-ma-none">15/01/2025</p>
          </div>
        </div>
        <div class="flex items-center">
          <small class="task__small bg-primary no-border rounded-borders text-white text-caption q-px-md block">Новый</small>
          <q-icon size="xs" class="q-ml-sm q-mr-xs" color="grey-9" name="far fa-comment-alt" />
          <p class="text-caption q-ma-none">3</p>
        </div>
      </q-card-section>
    </q-card>

  </div>
</template>

<style scoped>

</style>
