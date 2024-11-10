import { TelegramWebHook, TelegramWebHookSchema } from '@/lib/types'

export const ALICE = 0n
export const BOB = 1n

export function mockHook(id: bigint, username: string, text: string): TelegramWebHook {
  return TelegramWebHookSchema.parse({
    update_id: id,
    message: {
      message_id: id,
      from: {
        id: id,
        is_bot: false,
        first_name: username,
        username: username,
        language_code: 'en'
      },
      chat: {
        id: id,
        first_name: username,
        username: username,
        type: 'private'
      },
      date: id,
      text
    }
  })
}
