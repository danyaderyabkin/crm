import  type { Echo } from 'laravel-echo'

declare module 'laravel-echo' {
  interface Echo {
    connect(): void
    channel(channel: string): Channel
    private(channel: string): Channel
    listen(event: string, callback: (data: never) => void): void
  }

  interface Channel {
    listen(event: string, callback: (data: never) => void): Channel
    notification(callback: (data: never) => void): Channel
    stopListening(event: string): Channel
    subscribed(callback: () => void): Channel
    error(callback: (error: never) => void): Channel
  }
}

declare global {
  interface Window {
    Echo: Echo
  }
}
