import React from 'react';
import { Message } from '@/types/whatsapp';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const getStatusIcon = () => {
    if (!message.is_from_me) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-2",
        message.is_from_me ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 relative",
          message.is_from_me
            ? "bg-whatsapp-message-sent text-white rounded-br-sm"
            : "bg-whatsapp-message-received text-foreground rounded-bl-sm"
        )}
      >
        {!message.is_from_me && message.sender_name && (
          <div className="text-xs text-primary font-medium mb-1">
            {message.sender_name}
          </div>
        )}
        
        <div className="text-sm leading-relaxed">
          {message.content}
        </div>
        
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};