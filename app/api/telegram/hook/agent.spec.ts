import { getUser, resetUser } from '@/lib/db'
import { describe,  expect, test, beforeEach, afterAll } from 'bun:test'
import { mockHook, BOB, ALICE } from './spec'
import { respond } from './agent'
import * as ai from '@/lib/ai'

describe('agent', () => {
  beforeEach(async () => { 
    await resetUser(ALICE) 
    await resetUser(BOB)
  })

  afterAll(async () => { 
    await resetUser(ALICE)
    await resetUser(BOB)
  })

  test('says hi', async () => {
    let response = await respond(mockHook(ALICE, 'alice', '/foxy howdy robofoxy!!'))
    // console.log(response.message!.text)
    expect(await ai.contains(response.message!.text, 'a greeting and a question')).toBeTrue()
    let { state } = await getUser(ALICE)
    expect(Bun.deepEquals(state, { answers: [] })).toBeTrue()

    response = await respond(mockHook(ALICE, 'alice', '/foxy yearn vision: democratize complex DeFi strategies through autonomous, self-improving systems that maximize returns while minimizing risk, making institutional-grade yield optimization accessible to everyone.'))
    // console.log(response.message!.text)

    response = await respond(mockHook(BOB, 'bob', '/foxy to be the universal standard for automated DeFi yield generation, where intelligent protocols work 24/7 to deliver institutional-grade returns to every user.'))
    // console.log(response.message!.text)

    response = await respond(mockHook(ALICE, 'alice', '/foxy what is the latest yearn vision?'))
    console.log(response.message!.text)

  })
})
