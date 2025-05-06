export interface DateTimeParts {
  date: string;
  time: string;
}


export interface ISupplier {
  id: number
  user_id: number
}

export interface IObserver {
  id: number
  full_name: number
}

export interface IUser {
  id: number
  full_name: string
  photo: string
  email: string
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

export interface ICheckList {
  id: number
  title: string
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
  task_text: string
  start_at: Date | string
  finish_at?: Date | null
  totalComments: number
  status_id: number
  author: {
    id: number
    full_name: string
  }
  suppliers: ISupplier[],
  observers: ISupplier[],
  client_id: number,
  check_list: ICheckList[],
  client: IClient,
}

export interface IDictionary {
  tasks: ITask[],
  user: IUser,
  projects: IProject[]
  users: IUser[]
  clients: IClient[]
}
