<template>
  <q-layout :class="{'bg-purple-custom': route.fullPath === '/create-task' || route.fullPath === '/create-project'}" view="lHh Lpr lFf">
    <CabinetHeader/>
    <q-page-container>
      <transition
        name="slide"
        mode="out-in">
        <router-view />
      </transition>
    </q-page-container>
    <CabinetFooter/>
  </q-layout>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import CabinetFooter from 'components/CabinetFooter.vue'
import CabinetHeader from "components/CabinetHeader.vue";
const route = useRoute()

</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
}

.slide-leave-to {
  opacity: 0;
}

.bg-purple-custom {
  background-color: #F2F2F7;
}
</style>
