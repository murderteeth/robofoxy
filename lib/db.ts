import '@/lib/global'
import { TelegramWebHookSchema, User, UserSchema, UserStateSchema } from './types'

import { createClient } from '@libsql/client'

export async function connect() {
  const result = createClient({ 
    url: process.env.TURSO_URL ?? '', 
    authToken: process.env.TURSO_TOKEN
  })

  await result.execute({
    sql: 'CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY NOT NULL, state TEXT NULL, chat TEXT NULL)',
    args: []
  })

  return result
}

export async function upsertUser(userId: bigint, update: (user: User) => User) {
  if (userId === undefined) { throw new Error('userId is required') }
  const current = await getUser(userId)
  const upsert = update(current)
  const db = await connect()
  await db.execute({
    sql: 'REPLACE INTO user(id, state, chat) VALUES(?, ?, ?)',
    args: [upsert.id, JSON.stringify(upsert.state), JSON.stringify(upsert.chat)]
  })
  await db.close()
}

export async function getUser(userId: bigint) {
  const db = await connect()
  const result = await db.execute({
    sql: 'SELECT * FROM user WHERE id = ?',
    args: [userId]
  })
  await db.close()

  if (!result.rows[0]) { return {
    id: userId, state: { answers: [] }, chat: []
  } }

  const [row] = result.rows
  return UserSchema.parse({
    id: BigInt(row.id?.toString() ?? 0n),
    state: UserStateSchema.parse(JSON.parse(row.state?.toString() ?? '{}')),
    chat: TelegramWebHookSchema.array().parse(JSON.parse(row.chat?.toString() ?? '[]'))
  })
}

export async function resetUser(userId: bigint) {
  const db = await connect()
  await db.execute({
    sql: 'DELETE FROM user WHERE id = ?',
    args: [userId]
  })
  await db.close()
}

export async function getAnswers(questionId: bigint) {
  const db = await connect()
  const result = await db.execute({ sql: 'SELECT state FROM user', args: [] })
  await db.close()
  const states = result.rows.map(row => UserStateSchema.parse(JSON.parse(row.state?.toString() ?? '{}')))
  const allanswers = states.map(state => state.answers).flat()
  return allanswers.filter(answer => answer.question_id === questionId).map(answer => answer.answer)
}
