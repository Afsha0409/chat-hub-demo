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

  // Speak message on click, with improved reliability
  const handleSpeak = () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (!message.content || typeof message.content !== 'string' || !message.content.trim()) {
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(message.content);
    window.speechSynthesis.speak(utter);
  };

  // Helper: check if message.audio is a Blob or URL
  const isAudioBlob = (audio: any): audio is Blob => audio instanceof Blob;
  const isAudioUrl = (audio: any): audio is string => typeof audio === 'string' && audio.startsWith('blob:');

  return (
    <div
      className={cn(
        "flex w-full mb-2 group",
        message.is_from_me ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 relative shadow-md transition-all cursor-pointer hover:brightness-95",
          message.is_from_me
            ? "bg-[#d9fdd3] text-black rounded-2xl rounded-br-md border border-[#b2e59e]"
            : "bg-white text-black rounded-2xl rounded-bl-md border border-[#ece5dd]"
        )}
        style={{ boxShadow: '0 1px 1.5px rgba(0,0,0,0.05)' }}
        onClick={handleSpeak}
        title="Tap to speak"
      >
        {/* Hover menu placeholder */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="text-muted-foreground hover:text-primary text-xs px-2 py-1 rounded hover:bg-whatsapp-input-bg">⋮</button>
        </div>
        {!message.is_from_me && message.sender_name && (
          <div className="text-xs text-primary font-medium mb-1">
            {message.sender_name}
          </div>
        )}
        <div className="text-sm leading-relaxed break-words">
          {message.audio && (isAudioBlob(message.audio) || isAudioUrl(message.audio)) ? (
            <audio controls src={isAudioBlob(message.audio) ? URL.createObjectURL(message.audio) : message.audio} style={{ maxWidth: 200 }} />
          ) : typeof message.content === 'string' ? (
            message.content
          ) : message.content == null ? null : (
            <span className="italic text-muted-foreground">[Unsupported message type]</span>
          )}
        </div>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {(() => {
              const date = new Date(message.timestamp);
              return isNaN(date.getTime()) ? '' : format(date, 'HH:mm');
            })()}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};