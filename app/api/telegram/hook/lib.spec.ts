import { TelegramWebHook } from '@/lib/types'
import { expect, test } from 'bun:test'
import { parseMessages, simulateAgentHook } from './lib'
import { mockHook } from './spec'

test('parses TelegramWebHook[] into message stream', () => {
  const hooks: TelegramWebHook[] = [
    mockHook(1n, 'alice', '/foxy howdy robofoxy!!'),
    mockHook(2n, 'bob', 'laters'),
    simulateAgentHook('Yip yip frens!! 🦊')
  ]

  const messages = parseMessages(hooks)
  expect(Bun.deepEquals(messages, [
    { role: 'user', content: '[alice]: howdy robofoxy!!' },
    { role: 'user', content: '[bob]: laters' },
    { role: 'assistant', content: 'Yip yip frens!! 🦊' }
  ])).toBeTrue()
})
