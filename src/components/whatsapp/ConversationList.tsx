import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-whatsapp-sidebar border-r border-whatsapp-border">
      <div className="p-4 border-b border-whatsapp-border">
        <h1 className="text-xl font-semibold">WhatsApp Web</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-whatsapp-input-bg transition-colors ${
              selectedConversationId === conversation.id ? 'bg-whatsapp-input-bg' : ''
            }`}
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={conversation.user?.profile_pic_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {conversation.user?.name?.[0]?.toUpperCase() || conversation.wa_id[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">
                  {conversation.user?.name || conversation.wa_id}
                </h3>
                {conversation.latest_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.latest_message.timestamp), {
                      addSuffix: false
                    })}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {conversation.latest_message?.is_from_me && 
                  getStatusIcon(conversation.latest_message.status)
                }
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.latest_message?.content || 'No messages yet'}
                </p>
              </div>
            </div>
            
            {conversation.unread_count > 0 && (
              <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {conversation.unread_count}
              </div>
            )}
          </div>
        ))}
        
        {conversations.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};