// AI Sensei — Supabase Edge Function (Deno).
// Provider-independent: the model is chosen entirely by server-side secrets, so it can be
// swapped without touching the app.
//
//   supabase secrets set AI_PROVIDER=anthropic AI_API_KEY=... AI_MODEL=<model id>
//   supabase secrets set AI_PROVIDER=openai-compatible AI_API_KEY=... AI_MODEL=<model id> AI_BASE_URL=https://api.openai.com/v1
//   supabase functions deploy sensei
//
// NOTE: written for Milestone 6 and NOT yet run against a live Supabase project or provider.
import { buildSystemPrompt, validateRequest, type ChatTurn, type SenseiContext, type SenseiMode } from '../_shared/prompt.ts'

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void }

interface ProviderAdapter {
  complete(args: { system: string; messages: ChatTurn[]; model: string; apiKey: string; baseUrl?: string }): Promise<string>
}

const anthropic: ProviderAdapter = {
  async complete({ system, messages, model, apiKey }) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 1200, system, messages }),
    })
    if (!res.ok) throw new Error(`Provider returned ${res.status}`)
    const data = await res.json()
    return (data.content as { type: string; text?: string }[]).filter((b) => b.type === 'text').map((b) => b.text).join('')
  },
}

const openAiCompatible: ProviderAdapter = {
  async complete({ system, messages, model, apiKey, baseUrl }) {
    const res = await fetch(`${(baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 1200, messages: [{ role: 'system', content: system }, ...messages] }),
    })
    if (!res.ok) throw new Error(`Provider returned ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  },
}

const PROVIDERS: Record<string, ProviderAdapter> = { anthropic, 'openai-compatible': openAiCompatible }

const cors = {
  'access-control-allow-origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'POST only' })

  const provider = PROVIDERS[Deno.env.get('AI_PROVIDER') ?? '']
  const apiKey = Deno.env.get('AI_API_KEY')
  const model = Deno.env.get('AI_MODEL')
  if (!provider || !apiKey || !model) return json(503, { error: 'not_configured', detail: 'Set AI_PROVIDER, AI_API_KEY and AI_MODEL as function secrets.' })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }
  const problem = validateRequest(body)
  if (problem) return json(400, { error: 'invalid_request', detail: problem })
  const { mode, context, messages } = body as { mode: SenseiMode; context: SenseiContext; messages: ChatTurn[] }

  try {
    const text = await provider.complete({ system: buildSystemPrompt(mode, context), messages, model, apiKey, baseUrl: Deno.env.get('AI_BASE_URL') })
    if (!text.trim()) return json(502, { error: 'empty_response' })
    return json(200, { text })
  } catch (err) {
    // Provider details stay in the function logs; the browser only learns that it failed.
    console.error(err)
    return json(502, { error: 'provider_error' })
  }
})
