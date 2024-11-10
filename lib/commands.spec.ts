import { expect, test } from 'bun:test'
import { hasCommands, trimPrefix } from './commands'
import { MockTelegramWebHook } from './spec'

test('knows if a message has commands', () => {
  expect(hasCommands(MockTelegramWebHook({
    text: '/foxy howdy robofoxy!!'
  }))).toBeTrue()

  expect(hasCommands(MockTelegramWebHook({
    text: '/foxy howdy robofoxy!!'
  }))).toBeTrue()

  expect(hasCommands(MockTelegramWebHook({
    text: 'howdy someone else!!'
  }))).toBeFalse()
})

test('trims command prefix', () => {
  expect(trimPrefix('/foxy i am a command')).toBe('i am a command')
  expect(trimPrefix('/robofoxy you are a command')).toBe('you are a command')
})
