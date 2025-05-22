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

export interface ChatMessageClient {
  id: number;
  photo: string;
  lastMessage: string;
  lastMessageAt: string;
  totalNew: number;
  dialog_id: number;
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
