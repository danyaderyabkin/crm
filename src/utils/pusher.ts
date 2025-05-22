import Pusher from 'pusher-js'

export const pusher = new Pusher('7L6xSkzIurj59QLDSOJk', {
  cluster: "mt1",
  wsHost: "mpusher.ru",
  wsPort: 6001,
  wssPort: 6001,
  disableStats: false,
  enabledTransports: ["ws", "wss"],
  forceTLS: false,
})
