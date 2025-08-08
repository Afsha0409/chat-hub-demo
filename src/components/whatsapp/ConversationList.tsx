import React, { useState } from 'react';
import { Plus, MoreVertical, Star, LogOut, Users, UserPlus, MessageCircle, ArrowLeft, User, Circle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import WhatsAppLogo from '@/assets/whatsapp-logo.webp'; // Place a WhatsApp logo PNG in src/assets
// import { User , Circle} from 'lucide-react';

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

  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const filtered = search.trim()
    ? conversations.filter(c =>
      (c.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      c.wa_id.toLowerCase().includes(search.toLowerCase())
    )
    : conversations;

  // For new chat panel: all contacts sorted alphabetically
  const allContacts = [...conversations]
    .map(c => c.user)
    .filter(Boolean)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return (
    <div className="flex flex-col h-full bg-whatsapp-sidebar border-r border-whatsapp-border">
      {/* Sidebar header with WhatsApp logo, +, and 3-dots menu */}
      <div className="flex items-center justify-between p-4 border-b border-whatsapp-border sticky top-0 bg-whatsapp-sidebar z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* <img src={WhatsAppLogo} alt="WhatsApp" className="w-9 h-9 rounded" /> */}
          <span className="font-bold text-xl text-primary">WhatsApp</span>
        </div>
        <div className="flex gap-2 items-center">
          {/* + button for new chat panel */}
          <button
            className="rounded-full p-2 hover:bg-whatsapp-input-bg transition"
            title="New chat"
            onClick={() => setShowNewChat(v => !v)}
          >
            <Plus className="w-6 h-6" />
          </button>
          {/* 3-dots dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 hover:bg-whatsapp-input-bg transition" title="Menu">
                <MoreVertical className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" /> New Group
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="w-4 h-4 mr-2" /> Starred Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* New chat panel (replaces chat list) */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Overlay new chat panel over chat list area */}
        <div className="relative h-full">
          {showNewChat && (
            <div className="absolute inset-0 bg-whatsapp-sidebar z-20 flex flex-col animate-in fade-in shadow-lg border-r border-whatsapp-border">
              <div className="flex items-center gap-2 p-4 border-b border-whatsapp-border">
                <button className="rounded-full p-2 hover:bg-whatsapp-input-bg transition" onClick={() => setShowNewChat(false)} title="Back">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">New Chat</span>
              </div>
              <div className="p-4 pt-2 flex-1 flex flex-col">
                <input
                  type="text"
                  placeholder="Search contacts"
                  className="w-full rounded-full px-4 py-2 mb-3 bg-whatsapp-input-bg text-sm border border-whatsapp-border focus:outline-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-whatsapp-input-bg">
                    <Users className="w-4 h-4" /> New Group
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-whatsapp-input-bg">
                    <UserPlus className="w-4 h-4" /> New Contact
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-whatsapp-input-bg">
                    <MessageCircle className="w-4 h-4" /> New Community
                  </button>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground mb-1 font-semibold">All Contacts</div>
                  <div className="max-h-48 overflow-y-auto">
                    {allContacts.length === 0 ? (
                      <div className="text-muted-foreground text-sm">No contacts found</div>
                    ) : (
                      allContacts.map((user, i) => (
                        <div key={user.wa_id || i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-whatsapp-input-bg cursor-pointer">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={user.profile_pic_url} />
                            <AvatarFallback className="bg-white text-gray-500 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                              >
                                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.315 0-10 1.658-10 5v3h20v-3c0-3.342-6.685-5-10-5z" />
                              </svg>
                            </AvatarFallback>


                          </Avatar>
                          <span className="text-sm">{user.name || user.wa_id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showNewChat && (
            <div className="px-4 py-2 border-b border-whatsapp-border bg-whatsapp-sidebar">
              <input
                type="text"
                placeholder="Search or start new chat"
                className="w-full rounded-full px-4 py-2 bg-whatsapp-input-bg text-sm focus:outline-none border border-whatsapp-border"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              filtered.map((conversation) => {
                const lastMessage =
                  conversation.latest_message ??
                  (conversation.messages && conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1]
                    : null);

                return (
                  <div
                    key={conversation.wa_id}
                    onClick={() => onSelectConversation(conversation)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-whatsapp-input-bg transition-colors rounded-lg mb-1 shadow-sm ${selectedConversationId === conversation.wa_id ? 'bg-whatsapp-input-bg' : ''
                      }`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.user?.profile_pic_url} />
                      <AvatarFallback className="bg-white text-gray-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.315 0-10 1.658-10 5v3h20v-3c0-3.342-6.685-5-10-5z" />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {conversation.user?.name || conversation.wa_id}
                        </h3>
                        {lastMessage?.timestamp && !isNaN(Date.parse(lastMessage.timestamp)) ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(Date.parse(lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No messages yet</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                        {lastMessage?.content}
                        {lastMessage && getStatusIcon(lastMessage.status)}
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>


          {/* Chat list (underlay) */}
          {/* {!showNewChat && (
            <>
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filtered.map((conversation) => (
                  <div
                    key={conversation.wa_id}
                    onClick={() => onSelectConversation(conversation)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-whatsapp-input-bg transition-colors rounded-lg mb-1 shadow-sm ${
                      selectedConversationId === conversation.wa_id ? 'bg-whatsapp-input-bg' : ''
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
                        {conversation.latest_message && conversation.latest_message.timestamp && !isNaN(Date.parse(conversation.latest_message.timestamp)) ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(Date.parse(conversation.latest_message.timestamp), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No messages yet</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                        {conversation.latest_message?.content}
                        {conversation.latest_message && getStatusIcon(conversation.latest_message.status)}
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                ))
              )}
            </>
          )} */}
        </div>
      </div>
      {/* Search bar (hide when new chat panel is open) */}


      {/* WhatsApp for Windows footer */}
      <div className="flex items-center gap-2 p-4 border-t border-whatsapp-border bg-whatsapp-sidebar">
        <img src={WhatsAppLogo} alt="WhatsApp" className="w-8 h-8" />
        <a
          href="https://www.whatsapp.com/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary font-semibold hover:underline"
        >
          Get WhatsApp for Windows
        </a>
      </div>
    </div>
  );
};