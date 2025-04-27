export interface ISupplier {
  id: number
  user_id: number
}

export interface IUser {
  id: number
  full_name: string
}

export interface ITabUser {
  id: number
  user_id: number
}

export interface IClient {
  id: number
  full_name: string
}

export interface IProject {
  id: number
  project_name: string
  users: ITabUser[]
}

export interface INotification {
  id: number
  name: string
  photo: string
}

export interface INotifications {
  notification: INotification[]
  totalNew: number
}

export interface ITask {
  id: number
  task_id: number
  project_id: number
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
  user: IUser,
  projects: IProject[]
  users: IUser[]
  clients: IClient[]
}
