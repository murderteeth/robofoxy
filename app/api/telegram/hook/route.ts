export const maxDuration = 60

import '@/lib/global'
import { NextRequest, NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'
import { TelegramWebHookSchema } from '@/lib/types'
import * as agent from './agent'

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN ?? '')

export async function POST(request: NextRequest) {
  const hook = TelegramWebHookSchema.parse(await request.json())
  if (!hook.message?.text) { return NextResponse.json({ ok: 'ok' }) }

  await bot.sendChatAction(hook.message.chat.id.toString(), 'typing')

  try {
    const response = await agent.respond(hook)
    await bot.sendMessage(hook.message.chat.id.toString(), response.message!.text ?? '🦊 IDK')

  } catch(error) {
    console.error(error)
    await bot.sendMessage(
      hook.message.chat.id.toString(),
      `😿😿😿 \`\`\`${error}\`\`\` 😿😿😿`, 
      { parse_mode: 'Markdown' }
    )

  } finally {
    return NextResponse.json({ ok: 'ok' })

  }
}
