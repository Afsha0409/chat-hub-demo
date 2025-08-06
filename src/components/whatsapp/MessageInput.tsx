import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-whatsapp-chat-bg border-t border-whatsapp-border">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="bg-whatsapp-input-bg border-whatsapp-border rounded-lg pr-12"
            disabled={disabled}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};