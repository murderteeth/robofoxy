import { TelegramWebHook } from './types'

const COMMAND_PREFIXES = ['robofoxy', 'foxy', 'fox']
const PREFIX_REGEX = new RegExp(`^/(${COMMAND_PREFIXES.join('|')}) `)

export function hasCommands(hook: TelegramWebHook): boolean {
  return PREFIX_REGEX.test(hook.message?.text ?? '')
}

export function trimPrefix(message: string): string {
  return message.replace(PREFIX_REGEX, '')
}
