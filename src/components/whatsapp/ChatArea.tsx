import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/whatsapp';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';
import doodleBg from '@/assets/whatsapp-doodle.jpg'; // Add a doodle image to your assets folder

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
}

function getDateLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
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

  // Group messages by date
  const grouped: { [date: string]: Message[] } = {};
  messages.forEach((msg) => {
    const date = msg.timestamp ? new Date(msg.timestamp) : null;
    const label = date && !isNaN(date.getTime()) ? getDateLabel(date) : 'Unknown';
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(msg);
  });

  return (
    <div
      className="flex-1 overflow-y-auto bg-whatsapp-chat-bg p-4 sm:p-6 md:p-8 custom-scrollbar"
      style={{
        backgroundImage: `url(${doodleBg})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px',
        transition: 'background 0.3s',
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground px-2 text-center text-sm sm:text-base">
          Start a conversation by sending a message
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              <div className="flex justify-center my-4">
                <span className="bg-whatsapp-input-bg text-xs sm:text-sm md:text-base text-muted-foreground px-3 py-1 rounded-full shadow select-none">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
