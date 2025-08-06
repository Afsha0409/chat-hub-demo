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
    <div className="flex items-center justify-between p-4 bg-whatsapp-chat-bg border-b border-whatsapp-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.user?.profile_pic_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {conversation.user?.name?.[0]?.toUpperCase() || conversation.wa_id[0]}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="font-medium">
            {conversation.user?.name || conversation.wa_id}
          </h2>
          <p className="text-sm text-muted-foreground">
            {conversation.user?.phone_number || conversation.wa_id}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <VideoIcon className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};