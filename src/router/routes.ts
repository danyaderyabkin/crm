import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/tasks',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/TasksPage.vue') }],
  },
  {
    path: '/chat/:dialog_id',
    component: () => import('layouts/ChatLayout.vue'),
    props: true,
    children: [{ path: '', component: () => import('pages/ChatPageId.vue') }],
  },
  {
    path: '/clientChat/:dialog_id',
    component: () => import('layouts/ChatLayout.vue'),
    props: true,
    children: [{ path: '', component: () => import('pages/ChatClientId.vue') }],
  },
  {
    path: '/chat',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/ChatsPage.vue') }],
  },
  {
    path: '/globalChat',
    component: () => import('layouts/ChatLayout.vue'),
    children: [{ path: '', component: () => import('pages/ChatGlobalId.vue') }],
  },
  {
    path: '/settings',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/SettingsPage.vue') }],
  },
  {
    path: '/create-task',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/CreateTask.vue') }],
  },
  {
    path: '/edit-task/:task_id',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditTask.vue') }],
  },
  {
    path: '/create-project',
    component: () => import('layouts/CabinetLayout.vue'),
    children: [{ path: '', component: () => import('pages/CreateProject.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
