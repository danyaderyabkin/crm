<template>
  <div class="q-pa-sm q-gutter-sm user q-h-sc">
    <q-list >
      <q-item class="q-gutter-md">
        <img class="user__img" :src="user?.photo || ''" :alt="user?.full_name || ''">
        <q-item-section >
          <h1 class="text-h6 text-bold q-ma-none">{{user?.full_name}}</h1>
          <p class="text-subtitle1">{{user?.email}}</p>
        </q-item-section>

      </q-item>
    </q-list>
    <div class="flex">
      <q-btn @click.prevent="logOut" class="q-mx-auto" flat unelevated no-caps size="lg" color="red-7">Выйти</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useProjectsStore} from "stores/projects-store";
import {onMounted, ref} from "vue";
import type {IUser} from "src/types/dictionary";
import {LocalStorage} from "quasar";
import {useRouter} from "vue-router";

const router = useRouter()
const user = ref<IUser | null>(null)

const store = useProjectsStore()
const logOut = async () => {
  LocalStorage.removeItem("hash")
  await router.push('/')
}

onMounted( () => {
  if(store.dictionary) {
    user.value = store.dictionary?.user
  }
})
</script>

<style lang="scss">

.user {
  &__img {
    border-radius: 50%;
    max-height: 120px;
    object-fit: contain;
  }
}
</style>
