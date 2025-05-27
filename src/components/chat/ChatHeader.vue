<script setup lang="ts">
import {useProjectsStore} from "stores/projects-store";

defineProps<{name: string; id?: number}>()
const store = useProjectsStore();
const getUserName = (id: number) => {
  return store.dictionary?.users?.find((user) => user.id === id);
};
</script>

<template>
  <q-header elevated>
    <q-toolbar class="bg-primary text-white flex items-center">
      <q-btn class="absolute-left" to="/chat" icon="chevron_left" dense unelevated no-caps>назад</q-btn>

      <p class="q-mx-auto q-mb-none chat--name">{{name}}</p>
      <q-avatar
        v-if="getUserName(id)?.photo"
        class="absolute-right q-mt-sm q-mr-sm"
        size="lg"
        round
      >
        <img :src="getUserName(id)?.photo || '../../src/assets/images/noph.jpg'" alt="avatar" />
      </q-avatar>
    </q-toolbar>
  </q-header>
</template>

<style scoped>

</style>
