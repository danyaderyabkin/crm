// boot/axios.ts
import { defineBoot } from '#q-app/wrappers';
import axios from 'axios';
import { API_TOKEN } from '../config/auth';

// 1. Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: 'https://wecrm.ru/api',
  timeout: 10000,
});

// 2. Добавляем интерцептор для авторизации
api.interceptors.request.use((config) => {

  const token = API_TOKEN;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default defineBoot(({ app }) => {
  // 3. Регистрируем глобально для Options API
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // 4. Для Composition API используем provide/inject
  app.provide('api', api);
});

// Экспортируем для использования вне компонентов
export { axios, api };
