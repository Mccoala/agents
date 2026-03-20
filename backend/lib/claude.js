import Anthropic from '@anthropic-ai/sdk'
import { AGENT_PROMPTS } from '../agents/prompts.js'
import { AGENT_TOOLS, executeTool } from './tools.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Ask agent with full tool access — agentic loop
export async function askAgent(agentFn, conversationHistory, userMessage) {
  const systemPrompt = AGENT_PROMPTS[agentFn] || AGENT_PROMPTS['Monitor / Analista']
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  let finalResponse = ''
  let toolCallResults = []

  // Agentic loop: keep calling until no more tool_use
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      tools: AGENT_TOOLS,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      // Extract text from response
      finalResponse = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n')
      break
    }

    if (response.stop_reason === 'tool_use') {
      // Add assistant's response (with tool_use blocks) to messages
      messages.push({ role: 'assistant', content: response.content })

      // Execute all tool calls in parallel
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          console.log(`🔧 ${agentFn} usando ferramenta: ${block.name}(${JSON.stringify(block.input)})`)
          const result = await executeTool(block.name, block.input)
          toolCallResults.push({ tool: block.name, input: block.input, result })
          return {
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          }
        })
      )

      // Add tool results to messages and continue loop
      messages.push({ role: 'user', content: toolResults })
      continue
    }

    // Unexpected stop reason
    finalResponse = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
    break
  }

  return { text: finalResponse, toolCalls: toolCallResults }
}

// Simpler version for autonomous analysis (Haiku, no history)
// onToolUse(toolName, input) is called just before each tool executes — used for real-time SSE broadcast
export async function agentAnalyzeWithTools(agentFn, agentName, focusFiles, onToolUse = null) {
  const systemPrompt = AGENT_PROMPTS[agentFn]
  const messages = [{
    role: 'user',
    content: `Você é ${agentName}, especialista em ${agentFn} do projeto app-ags.
Use as ferramentas disponíveis para analisar os arquivos do repositório.
Foque em: ${focusFiles.join(', ')}
Identifique o problema mais crítico e sugira uma ação concreta.
Seja direto — máximo 3 parágrafos.`,
  }]

  let finalText = ''

  for (let i = 0; i < 4; i++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      tools: AGENT_TOOLS.filter(t => t.name !== 'create_fix'), // no fixes in auto mode
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      finalText = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
      break
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          // Notify caller that this tool is starting (pixel-agents transcript parser concept)
          onToolUse?.(block.name, block.input)
          const result = await executeTool(block.name, block.input)
          return { type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) }
        })
      )
      messages.push({ role: 'user', content: toolResults })
      continue
    }

    finalText = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    break
  }

  return finalText
}
