import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/whatsapp';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-whatsapp-chat-bg">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-whatsapp-chat-bg p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a conversation by sending a message
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};