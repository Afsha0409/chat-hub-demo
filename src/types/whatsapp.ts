export interface User {
  id: string;
  wa_id: string;
  name?: string;
  phone_number?: string;
  profile_pic_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  wa_id: string;
  user_id?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  latest_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  wa_id: string;
  meta_msg_id?: string;
  message_type: string;
  content?: string;
  media_url?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_from_me: boolean;
  sender_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }[];
  }[];
}