<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
        <router-view />
    </q-page-container>
    <CabinetFooter/>
  </q-layout>
</template>

<script setup lang="ts">
import CabinetFooter from 'components/CabinetFooter.vue'
</script>
