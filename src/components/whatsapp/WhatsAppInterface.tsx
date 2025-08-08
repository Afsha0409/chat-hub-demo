import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { ChatArea } from './ChatArea';
import { MessageInput } from './MessageInput';
import { SidebarNav } from './SidebarNav';
import { Message } from '@/types/whatsapp';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Conversation } from '@/types/whatsapp';
import whatsapplanding from '@/assets/whatsapp-landing.png'; // replace with actual image asset
export const WhatsAppInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations, loading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedConversation?.wa_id || null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Accepts text or { audio: Blob }
  // Upload audio blob to backend and get a URL
  const uploadAudio = async (blob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');
    const res = await fetch('http://localhost:3001/api/upload-audio', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Audio upload failed');
    const { url } = await res.json();
    return url;
  };

  const handleSendMessage = async (input: string | { audio: Blob }) => {
    if (!selectedConversation) return;
    if (typeof input === 'string') {
      await sendMessage(input);
    } else if (input && input.audio instanceof Blob) {
      // Upload audio and get a persistent URL
      const audioUrl = await uploadAudio(input.audio);
      const newMsg: Partial<Message> = {
        id: Math.random().toString(36).slice(2),
        conversation_id: selectedConversation.id,
        wa_id: selectedConversation.wa_id,
        message_type: 'audio',
        audio: audioUrl,
        timestamp: new Date().toISOString(),
        status: 'sent',
        is_from_me: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await sendMessage(newMsg);
    }
  };

  return (
    <div className="h-screen w-full flex bg-whatsapp-bg text-whatsapp-foreground">
      {/* Vertical nav */}
      <SidebarNav active="chats" />
      {/* Sidebar */}
      <aside className="w-[30%] min-w-[280px] max-w-[480px] flex-shrink-0 border-r border-whatsapp-border bg-whatsapp-sidebar shadow-lg">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
        />
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col relative">

        {selectedConversation ? (
           <>
      <ChatHeader conversation={selectedConversation} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatArea messages={messages} loading={messagesLoading} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </>):(
          <div className="flex-1 flex items-center justify-center bg-[#f6f2ed]">
            <div className="text-center max-w-md px-6">
              {/* Laptop image */}
              <div className="flex justify-center mb-8">
                <img
                  src={whatsapplanding} // replace with actual image asset
                  alt="WhatsApp Laptop"
                  className="w-72"
                />
              </div>

              <h2 className="font-whats text-wa-title whitespace-nowrap  mpp-2 text-gray-1000 mb-5 text-[38px] font-light leading-[42px] -ml-6">
                Download WhatsApp for Windows
              </h2>
              <p className="text-wa-md text-gray-600 text-center max-w-xl mb-6  mt-2 -ml-0">
                Make calls, share your screen and get a faster experience when you download the Windows app.
              </p>
              <button className="bg-wa-green hover:bg-green-500 text-white rounded-full px-8 py-2 font-whats text-wa-md">
                Download
              </button>
             

              {/* Lock note */}
              <div className="mt-8 flex items-center justify-center text-gray-500 text-sm margin-block-end: -130px margin-top: 184px">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v2h-4v-2zM8 11V9a4 4 0 118 0v2m-6 0h4m-6 0v2m6-2v2m-8 0v6h12v-6H6z" />
                </svg>
                Your personal messages are end-to-end encrypted
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};