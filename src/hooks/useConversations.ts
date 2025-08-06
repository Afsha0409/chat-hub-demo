import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/whatsapp';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            user:users(*),
            latest_message:messages(*)
          `)
          .order('last_message_at', { ascending: false });

        if (error) throw error;
        
        // Process to get the latest message for each conversation
        const processedConversations = (data as any)?.map((conv: any) => ({
          ...conv,
          latest_message: conv.latest_message?.[0] || null
        })) || [];

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { conversations, loading };
};