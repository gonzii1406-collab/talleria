import Anthropic from '@anthropic-ai/sdk'
import { Vehicle } from './vehicle'

export interface DiagnosticReport {
  faultCode: string
  description: string
  severity: 'low' | 'medium' | 'high'
  causes: string[]
  tests: string[]
  solutions: string[]
  parts: string[]
}

export async function diagnose(
  faultCode: string,
  vehicle: Vehicle,
  locale: string = 'es'
): Promise<DiagnosticReport> {
  const lang = locale === 'en' ? 'English' : 'Spanish'

  const prompt = `You are an expert automotive diagnostic technician. A mechanic needs a diagnostic report.

Vehicle: ${vehicle.brand} ${vehicle.model} ${vehicle.year}, Engine: ${vehicle.engine}, Fuel: ${vehicle.fuel}
Fault code from diagnostic machine: ${faultCode}

Respond ONLY with a valid JSON object in ${lang} with this exact structure:
{
  "faultCode": "${faultCode}",
  "description": "clear description of what this fault code means",
  "severity": "low|medium|high",
  "causes": ["cause 1", "cause 2", "cause 3", "...up to 6 causes ordered by probability"],
  "tests": ["test 1 with specific procedure", "test 2", "...up to 5 tests the mechanic should perform"],
  "solutions": ["step 1", "step 2", "...ordered step by step repair procedure"],
  "parts": ["part 1", "part 2", "...commonly replaced parts for this fault"]
}

Be specific, practical, and oriented to a professional mechanic. Include specific values, procedures, and tools when relevant.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extraer JSON de la respuesta
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response')

  const parsed = JSON.parse(jsonMatch[0]) as DiagnosticReport
  return parsed
}
