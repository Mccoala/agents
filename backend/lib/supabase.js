import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function createConversation(type, participantIds) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ type, participant_ids: participantIds })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveMessage(conversationId, sender, content, isSystem = false) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender, content, is_system: isSystem })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function endConversation(conversationId) {
  await supabase
    .from('conversations')
    .update({ status: 'ended' })
    .eq('id', conversationId)
}
