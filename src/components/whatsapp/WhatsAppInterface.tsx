import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { ChatArea } from './ChatArea';
import { MessageInput } from './MessageInput';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Conversation } from '@/types/whatsapp';

export const WhatsAppInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations, loading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedConversation?.id || null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (content: string) => {
    if (selectedConversation) {
      await sendMessage(content);
    }
  };

  return (
    <div className="h-screen flex bg-whatsapp-bg">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <ChatArea messages={messages} loading={messagesLoading} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-whatsapp-chat-bg">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-medium mb-2">WhatsApp Web</h2>
              <p className="text-muted-foreground">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};