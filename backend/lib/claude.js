import Anthropic from '@anthropic-ai/sdk'
import { AGENT_PROMPTS } from '../agents/prompts.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function askAgent(agentFn, conversationHistory, userMessage) {
  const systemPrompt = AGENT_PROMPTS[agentFn] || AGENT_PROMPTS['Monitor / Analista']

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ],
  })

  return response.content[0].text
}
