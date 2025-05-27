export interface ChatMessage {
  chat_name: string;
  last_message?: string;
  last_message_at: string;
  total_new_messages: number;
  dialog_id: number;
}

export interface ChatMessageProj {
  project_name: string;
  start_at: string;
  created_at: string;
  project_info: string;
  id: string;
  totalNew: number;
}

export interface Message {
  id: number
  from_user_id?: number
  message_from?: number
  to_user_id: number
  message?: string
  message_text?: string
  attachment: File | null
  created_at: string
  is_readed: boolean
}
export interface ChatMessageClient {
  id: number;
  photo: string;
  lastMessage: string;
  lastMessageAt: string;
  totalNew: number;
  client_id: number;
  client: {
    id: number;
    photo: string;
    full_name: string;
  }
}

export interface ChatData {
  privateChats?: ChatMessage[] | undefined;
  allChats?: ChatMessage[] | undefined;
  clientChats?: ChatMessageClient[] | undefined;
  globalChat?: ChatMessage[] | undefined;
  projectChats?: ChatMessageProj[] | undefined;
  // [key: string]: ChatMessage[] | ChatMessageClient[] | ChatMessageProj[] | undefined; // Если нужен динамический доступ
}
