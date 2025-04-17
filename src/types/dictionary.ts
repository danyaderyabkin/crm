export interface ISupplier {
  id: number
  user_id: number
}

export interface IUser {
  id: number
  full_name: string
}

export interface INotification {
  id: number
  name: string
}

export interface INotifications {
  notification: INotification[]
  totalNew: number
}

export interface ITask {
  id: number
  task_id: number
  task_title: string
  start_at: Date | string
  finish_at?: Date | string
  totalComments: number
  status_id: number
  author: {
    full_name: string
  }
  suppliers: ISupplier[]
}

export interface IDictionary {
  tasks: ITask[],
  user: IUser
}
