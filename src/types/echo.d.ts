import type { Echo } from 'laravel-echo'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $echo: Echo
  }
}

declare global {
  interface Window {
    Pusher: never
  }
}

export interface PusherMessageEvent<T = never> {
  event: string
  data: T
  channel: string
}

export interface PrivateMessageData {
  userId: number
  data: {
    message: string
    senderId: number
    timestamp: string
    // Другие поля в зависимости от вашего API
  }
}
