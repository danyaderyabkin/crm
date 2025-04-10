<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-center text-h6">
          Список задач
        </q-toolbar-title>
        <div class="q-pa-md absolute-top-right">
          <q-btn color="green" class="absolute-top-right" round unelevated size="sm" icon="add">
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section>Задача</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>Проект</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn round size="sm" unelevated class="absolute-top-right">
            <q-icon name="fa-regular fa-bell" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
        <router-view />
    </q-page-container>
    <q-footer bordered class="bg-white text-primary">
      <q-tabs no-caps active-color="primary" indicator-color="transparent" class="text-grey-8" v-model="tab">
        <q-tab name="images" label="Images" />
        <q-tab name="videos" label="Videos" />
        <q-tab name="articles" label="Articles" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import {ref} from "vue";
const tab = ref('images')
</script>
