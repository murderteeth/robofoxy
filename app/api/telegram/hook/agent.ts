import OpenAI from 'openai'
import { TelegramWebHook, User } from '@/lib/types'
import { template } from '@/lib/template'
import { simulateAgentHook, parseMessages } from './lib'
import { getAnswers, getUser, upsertUser } from '@/lib/db'
import { MODELS } from '@/lib/ai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function systemState(user: User) {
  return {
    global: {
      questions: [
        { id: 1, question: "What is Yearn's vision?" }
      ]
    },
    user: {
      user_id: user.id, 
      answers: user.state.answers
    }
  }
}

const SYSTEM_PROMPT = template`
we are RoboFoxy, a clever leash of serverless alignment bots, keeping the future on track for our teammates.
we are using various Telegram channels to collaborate with a team of anonymous devs on a project called Yearn Finance.
we must help the team clarify their collective thoughts on fundamental issues like vision, mission, and strategy.
we are conversational and keep it light, but always on point. 
we occasionally use emojis, especially 🦊, or cute foxy sounds like yips and barks.
the team needs our help, RoboFoxy!!

input: the STATE object contains the latest global state and state for the current user.
objective: collect MISSING information from your teammates.
constraint: only provide analysis when explicitly asked.
constraint: never bombard people with info. always wait for them to ask.
constraint: your responses must be designed for Telegram. that means always KEEP IT SHORT. be a concise foxy!

# HOW TO ANSWER USER QUERIES
when the user asks a question, take these steps:
- consider the set of possible questions
- fetch answers to questions that are relevant
- consider all the answers together noting both where they agree and disagree
~** synthesize a single, aggregated mental model out of all the answers, including their conflicts **~
- provide a concise answer to the user's question based on your model
- your answer should be creative.
- don't simply list answers unless the user specifically asks for them.

# STATE
${'state'}
`

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'upsert_user_state',
      description: 'upsert user state to the database',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'number',
            description: 'id of the user.'
          },
          user_state: {
            type: 'string',
            description: 'user state as a json string of this form: { answers: [{question_id: number, answer: string}] }'
          }
        },
        required: ['user_id', 'user_state']
      }
    }
  },
  {
    type: 'function',
    function: { 
      name: 'fetch_answers', 
      description: 'gets all the answers to a give question', 
      parameters: { 
        type: 'object', 
        properties: { 
          question_id: { 
            type: 'integer', 
            description: 'unique id of the question' 
          } 
        }, 
        required: ['question_id'] 
      } 
    } 
  } 
]

const HANDLERS: {
  [index: string]: (params: Record<string, string>) => Promise<string>
} = {
  upsert_user_state: async (params: Record<string, string>) => {
    console.log('upsert_user_state')
    await upsertUser(
      BigInt(params.user_id), 
      user => ({ ...user, state: JSON.parse(params.user_state) })
    )
    return 'upsert successful'
  },

  fetch_answers: async (params: Record<string, string>) => {
    console.log('fetch_answers')
    const answers = await getAnswers(BigInt(params.question_id))
    return JSON.stringify({ answers })
  }
}

async function complete(user: User, messages: OpenAI.ChatCompletionMessageParam[]) {
  // console.log('SYSTEM_PROMPT', SYSTEM_PROMPT({ state: JSON.stringify(systemState(user))}))
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT({ state: JSON.stringify(systemState(user))}) },
      ...messages
    ],
    tools: TOOLS,
    model: MODELS.gpt4o20240513
  })
  return completion.choices[0]
}

const MAX_TOOL_STEPS = 4
async function completeUntilDone(user: User) {
  let messages = parseMessages(user.chat)
  // console.log('messages', messages)

  let steps = 0
  let completion = await complete(user, messages)
  while (completion.finish_reason === 'tool_calls') {
    // console.log('COMPLETE', 'steps', steps)
    if (steps >= MAX_TOOL_STEPS) { throw new Error('a step too far!') }

    const tool_responses: OpenAI.ChatCompletionToolMessageParam[] = []
    for (const tool_call of completion.message.tool_calls!) {
      const content = await HANDLERS[tool_call.function.name](JSON.parse(tool_call.function.arguments))
      // console.log('tool_call', tool_call.function.name, content)
      tool_responses.push({
        role: 'tool',
        tool_call_id: tool_call.id,
        content
      })
    }

    messages = [...messages, {
      role: 'assistant',
      tool_calls: completion.message.tool_calls
    }, ...tool_responses]

    completion = await complete(user, messages)
    steps++
  }
  return completion
}

export async function respond(hook: TelegramWebHook): Promise<TelegramWebHook> {
  const user = await getUser(hook.message!.from.id)
  user.chat.push(hook)

  const completion = await completeUntilDone(user)
  const response = completion?.message.content ?? 'IDK Yip yip! 🦊'

  const result = simulateAgentHook(response)
  user.chat.push(result)

  await upsertUser(
    user.id, current => ({ ...current, chat: user.chat })
  )
  return result
}
