import { z } from 'zod'

export const TelegramMessageSchema = z.object({
  message_id: z.bigint({ coerce: true }),
  from: z.object({
    id: z.bigint({ coerce: true }),
    is_bot: z.boolean(),
    first_name: z.string(),
    username: z.string(),
    language_code: z.string(),
  }),
  chat: z.object({
    id: z.bigint({ coerce: true }),
    first_name: z.string().optional(),
    username: z.string().optional(),
    title: z.string().optional(),
    type: z.string(),
  }),
  date: z.bigint({ coerce: true }).optional(),
  text: z.string().optional()
})

export const TelegramWebHookSchema = z.object({
  update_id: z.bigint({ coerce: true }),
  message: TelegramMessageSchema.optional(),
  edited_message: TelegramMessageSchema.optional(),
  callback_query: z.object({
    data: z.string().optional()
  }).optional()
})

export type TelegramWebHook = z.infer<typeof TelegramWebHookSchema>

export const UserStateSchema = z.object({
  answers: z.array(z.object({
    question_id: z.bigint({ coerce: true }),
    answer: z.string()
  }))
})

export const UserSchema = z.object({
  id: z.bigint({ coerce: true }),
  state: UserStateSchema,
  chat: TelegramWebHookSchema.array()
})

export type User = z.infer<typeof UserSchema>
