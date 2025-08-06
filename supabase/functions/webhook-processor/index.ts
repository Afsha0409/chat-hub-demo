import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Webhook payload received:', JSON.stringify(payload, null, 2));

    // Process WhatsApp webhook payload
    if (payload.object === 'whatsapp_business_account') {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          // Process incoming messages
          if (value.messages) {
            for (const message of value.messages) {
              await processIncomingMessage(supabase, message, value.contacts?.[0]);
            }
          }

          // Process status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              await processStatusUpdate(supabase, status);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});

async function processIncomingMessage(supabase: any, message: any, contact: any) {
  try {
    const wa_id = message.from;
    
    // Ensure user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wa_id', wa_id)
      .single();

    let userId = existingUser?.id;

    if (!existingUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          wa_id,
          name: contact?.profile?.name,
          phone_number: wa_id
        })
        .select('id')
        .single();

      if (userError) throw userError;
      userId = newUser.id;
    }

    // Ensure conversation exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('wa_id', wa_id)
      .single();

    let conversationId = existingConversation?.id;

    if (!existingConversation) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          wa_id,
          user_id: userId,
          last_message_at: new Date(parseInt(message.timestamp) * 1000).toISOString()
        })
        .select('id')
        .single();

      if (convError) throw convError;
      conversationId = newConversation.id;
    } else {
      // Update last message time
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date(parseInt(message.timestamp) * 1000).toISOString()
        })
        .eq('id', conversationId);
    }

    // Insert the message
    const messageData = {
      conversation_id: conversationId,
      wa_id,
      meta_msg_id: message.id,
      message_type: message.type,
      content: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      status: 'delivered',
      is_from_me: false,
      sender_name: contact?.profile?.name
    };

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messageData);

    if (messageError) throw messageError;

    console.log('Message processed successfully:', message.id);
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

async function processStatusUpdate(supabase: any, status: any) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status: status.status })
      .eq('meta_msg_id', status.id);

    if (error) throw error;
    console.log('Status updated successfully:', status.id, status.status);
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
}