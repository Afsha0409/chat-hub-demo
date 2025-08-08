import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/whatsapp';
import { MoreVertical, Phone, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  return (
    <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 bg-whatsapp-chat-bg border-b border-whatsapp-border sticky top-0 z-20 shadow-sm">
      <div className="flex flex-1 min-w-0 items-center gap-3 sm:gap-4">
        <Avatar className="w-10 h-10 flex-shrink-0">
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

        <div className="min-w-0">
          <h2 className="font-medium text-base sm:text-lg truncate">
            {conversation.user?.name || conversation.wa_id}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {conversation.user?.phone_number || conversation.wa_id}
          </p>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0 flex-shrink-0">
        <Button variant="ghost" size="icon" title="Video call" aria-label="Video call">
          <VideoIcon className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Voice call" aria-label="Voice call">
          <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>
        <Button variant="ghost" size="icon" title="More options" aria-label="More options">
          <MoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};
