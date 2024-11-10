import { describe,  expect, test } from 'bun:test'
import * as ai from './ai'

describe('ai', () => {
  test('knows when stuff contains stuff', async () => {
    expect(await ai.contains('rainbow', 'rain')).toBeTrue()
    expect(await ai.contains('rainbow', 'bow')).toBeTrue()
    expect(await ai.contains('rainbow', 'colors')).toBeTrue()
    expect(await ai.contains('perfect logic', 'fallacies')).toBeFalse()
    expect(await ai.contains('perfect logic', 'no mistakes')).toBeTrue()
    expect(await ai.contains('bad logic', 'fallacies')).toBeTrue()
    expect(await ai.contains('bad logic', 'no mistakes')).toBeFalse()
    expect(await ai.contains(undefined, 'anything')).toBeFalse()
  })
})
