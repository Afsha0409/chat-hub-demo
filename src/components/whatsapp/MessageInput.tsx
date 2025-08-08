import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic, FileText, Camera, Image, User, MapPin } from 'lucide-react';

type MessageInputValue = string | { audio: Blob };
interface MessageInputProps {
  onSendMessage: (message: MessageInputValue) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder|null>(null);
  const [audioURL, setAudioURL] = useState<string|null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob|null>(null);
  const [recordingError, setRecordingError] = useState<string|null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const emojiRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioBlob && audioURL && !disabled) {
      onSendMessage({ audio: audioBlob });
      setAudioBlob(null);
      setAudioURL(null);
      setShowEmoji(false);
      setShowAttach(false);
      setMessage('');
      return;
    }
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmoji(false);
      setShowAttach(false);
    }
  };

  // Simple emoji list for demo
  const emojis = ['😀','😂','😍','😎','😭','👍','🙏','🎉','🔥','❤️','😅','😉','😇','😜','😢','😡','🥳','🤔','😏','😬'];

  // WhatsApp-like attachment options with Lucide icons
  const attachOptions = [
    { icon: <FileText className="w-5 h-5 text-[#7b83a0]" />, label: 'Document' },
    { icon: <Camera className="w-5 h-5 text-[#e07b67]" />, label: 'Camera' },
    { icon: <Image className="w-5 h-5 text-[#4fa3e3]" />, label: 'Photos & Videos' },
    { icon: <User className="w-5 h-5 text-[#5bbd6b]" />, label: 'Contact' },
    { icon: <MapPin className="w-5 h-5 text-[#d6b94b]" />, label: 'Location' },
  ];

  // Close popovers if clicked outside
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
      if (showAttach && attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttach(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEmoji, showAttach]);

  // --- Voice Recording Logic ---
  const handleStartRecording = async () => {
    setRecordingError(null);
    setAudioURL(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setRecordingError('Microphone access denied or not available.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Optionally, send audio message
  // const handleSendAudio = () => {
  //   if (audioBlob && onSendAudioMessage) {
  //     onSendAudioMessage(audioBlob);
  //     setAudioBlob(null);
  //     setAudioURL(null);
  //   }
  // };

  return (
    <div className="p-4 bg-whatsapp-chat-bg border-t border-whatsapp-border">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-whatsapp-input-bg border-whatsapp-border rounded-full shadow-sm px-2 py-1">
          {/* Emoji button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              title="Emoji"
              className="rounded-full"
              onClick={() => { setShowEmoji((v) => !v); setShowAttach(false); }}
            >
              <span role="img" aria-label="emoji" className="text-xl">😀</span>
            </Button>
            {showEmoji && (
              <div ref={emojiRef} className="absolute bottom-12 left-0 z-50 bg-white border border-whatsapp-border rounded-lg shadow-lg p-2 flex flex-wrap w-64">
                {emojis.map((em, i) => (
                  <button
                    key={i}
                    className="text-2xl p-1 hover:bg-whatsapp-input-bg rounded"
                    type="button"
                    onClick={() => {
                      setMessage(msg => msg + em);
                      setShowEmoji(false);
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Attachment button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              title="Attach"
              className="rounded-full"
              onClick={() => { setShowAttach((v) => !v); setShowEmoji(false); }}
            >
              <Paperclip className="w-5 h-5" style={{ transform: 'rotate(-45deg)' }} />
            </Button>
            {showAttach && (
              <div ref={attachRef} className="absolute bottom-12 left-0 z-50 bg-white border border-whatsapp-border rounded-lg shadow-lg p-2 flex flex-col w-48">
                {attachOptions.map((opt, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-whatsapp-input-bg rounded text-base"
                    type="button"
                  >
                    {opt.icon} <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Input */}
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="bg-transparent border-none focus:ring-0 focus:outline-none flex-1 min-w-0 px-2 shadow-none"
            disabled={disabled || isRecording}
            style={{ minHeight: 44 }}
          />
          {/* Microphone icon and recording UI */}
          {!isRecording && !audioURL && (
            <Button 
              variant="ghost" 
              size="icon" 
              type="button"
              className="rounded-full"
              title="Record voice message"
              onClick={handleStartRecording}
              disabled={disabled}
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
          {isRecording && (
            <Button 
              variant="destructive" 
              size="icon" 
              type="button"
              className="rounded-full animate-pulse"
              title="Stop recording"
              onClick={handleStopRecording}
            >
              <Mic className="w-4 h-4 text-red-600" />
            </Button>
          )}
          {audioURL && (
            <div className="flex items-center gap-2 ml-2">
              <audio src={audioURL} controls className="h-8" />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                title="Discard recording"
                onClick={() => { setAudioURL(null); setAudioBlob(null); }}
              >
                ✖️
              </Button>
              {/* Optionally, add a send button for audio */}
              {/* <Button
                variant="primary"
                size="icon"
                type="button"
                title="Send voice message"
                onClick={handleSendAudio}
              >
                <Send className="w-5 h-5" />
              </Button> */}
            </div>
          )}
        </div>
        {/* Send button */}
        <Button 
          type="submit" 
          size="icon" 
          disabled={(!message.trim() && !audioURL) || disabled || isRecording}
          className="bg-primary hover:bg-primary/90 rounded-full shadow"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
      {recordingError && <div className="text-xs text-red-500 mt-1">{recordingError}</div>}
    </div>
  );
};