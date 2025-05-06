import { boot } from 'quasar/wrappers'
import Pusher from 'pusher-js'
import Echo from 'laravel-echo'


declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: {
      channel<T = unknown>(name: string): {
        listen<U = T>(event: string, callback: (data: U) => void): void;
      };
    };
  }
}


export default boot(() => {
  window.Pusher = Pusher

  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '7L6xSkzIurj59QLDSOJk',
    cluster: 'mt1',
    wsHost: 'mpusher.ru',
    wsPort: 6001,
    wssPort: 6001,
    disableStats: false,
    enabledTransports: ['ws', 'wss'],
    forceTLS: false,
  })
})

export { Echo }
