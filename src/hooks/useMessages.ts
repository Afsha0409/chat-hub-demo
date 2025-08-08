import { useEffect, useState } from 'react';
import { Message } from '@/types/whatsapp';

export function useMessages(wa_id) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wa_id) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/messages?wa_id=${wa_id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wa_id]);

  // Accepts either a string (text) or a Message object (audio)
  const sendMessage = async (input) => {
    if (!wa_id || !input) return;
    if (typeof input === 'string') {
      const res = await fetch('http://localhost:3001/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wa_id, content: input })
      });
      const newMsg = await res.json();
      setMessages(msgs => [...msgs, newMsg]);
    } else if (typeof input === 'object' && input.message_type === 'audio') {
      // For local demo, just add the audio message to state
      setMessages(msgs => [...msgs, {
        ...input,
        id: input.id || Math.random().toString(36).slice(2),
      } as Message]);
    }
  };

  return { messages, loading, sendMessage };
}