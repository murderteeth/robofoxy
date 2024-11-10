import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const MODELS = {
  'gpt4o': 'gpt-4o',
  'gpt4o20240806': 'gpt-4o-2024-08-06',
  'gpt4o20240513': 'gpt-4o-2024-05-13',
  'gpt4omini': 'gpt-4o-mini',
  'gpt4omini20240718': 'gpt-4o-mini-2024-07-18'
}

export async function complete(messages: OpenAI.ChatCompletionMessageParam[], model = MODELS.gpt4omini20240718, temperature = 0) {
  const completion = await openai.chat.completions.create({ messages, model, temperature })
  const [first] = completion.choices
  return first
}

export async function contains(text: string | undefined, expected: string) {
  if (!text) return false

  const completion = await complete([
    { role: 'system', content: `
      you are an ai powered contains function.
      the user will ask you if one string contains another.
      but the user is not nessesarily asking for an exact match.
      instead they want you to use logic!
      always check your work!

      EXAMPLE: does "rainbow" contain "rain"? TRUE
      EXAMPLE: does "rainbow" contain "bow"? TRUE
      EXAMPLE: does "rainbow" contain "colors"? TRUE
      EXAMPLE: does "rainbow" contain "hotdogs"? FALSE

      constraint: you must only respond with TRUE or FALSE, no other text
    ` },
    { role: 'user', content: `does "${text}" contain "${expected}"?` }
  ], MODELS.gpt4o20240513)
  return completion.message!.content === 'TRUE'
}
