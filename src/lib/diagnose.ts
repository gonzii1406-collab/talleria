import Anthropic from '@anthropic-ai/sdk'
import { Vehicle } from './vehicle'

export interface TestWithDiagram {
  procedure: string
  diagram?: string // SVG string
}

export interface DiagnosticReport {
  faultCode: string
  description: string
  severity: 'low' | 'medium' | 'high'
  causes: string[]
  tests: TestWithDiagram[]
  solutions: string[]
  parts: string[]
}

/** Strips dangerous elements from AI-generated SVG */
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    .replace(/xlink:href\s*=\s*(?:"(?!#)[^"]*"|'(?!#)[^']*')/gi, '')
}

/** Maps any severity string the AI might return to our 3 values */
function normalizeSeverity(raw: unknown): 'low' | 'medium' | 'high' {
  const s = String(raw ?? '').toLowerCase()
  if (['high', 'alta', 'alto', 'critical', 'grave', 'severe', 'crítica'].some(v => s.includes(v))) return 'high'
  if (['low', 'leve', 'bajo', 'baja', 'minor', 'info', 'informational'].some(v => s.includes(v))) return 'low'
  return 'medium'
}

/** Ensures the parsed response has correct shape regardless of AI quirks */
function normalizeReport(raw: Record<string, unknown>, faultCode: string): DiagnosticReport {
  const causes = Array.isArray(raw.causes)
    ? raw.causes.filter(Boolean).map(String)
    : []

  const tests: TestWithDiagram[] = Array.isArray(raw.tests)
    ? raw.tests.filter(Boolean).map(t => {
        if (typeof t === 'string') return { procedure: t }
        const obj = t as Record<string, unknown>
        const procedure = String(obj.procedure ?? obj.description ?? obj.test ?? '')
        const diagram = typeof obj.diagram === 'string' && obj.diagram.trim().startsWith('<svg')
          ? sanitizeSvg(obj.diagram)
          : undefined
        return { procedure, diagram }
      })
    : []

  const solutions = Array.isArray(raw.solutions)
    ? raw.solutions.filter(Boolean).map(String)
    : []

  const parts = Array.isArray(raw.parts)
    ? raw.parts.filter(Boolean).map(String)
    : []

  return {
    faultCode: String(raw.faultCode ?? faultCode).toUpperCase(),
    description: String(raw.description ?? 'Sin descripción disponible'),
    severity: normalizeSeverity(raw.severity),
    causes,
    tests,
    solutions,
    parts,
  }
}

/**
 * Finds the outermost JSON object in a string using brace counting.
 * More reliable than regex for nested structures.
 */
function extractJSON(text: string): Record<string, unknown> {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in response')

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inString) { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') depth++
    if (c === '}') {
      depth--
      if (depth === 0) {
        const json = text.slice(start, i + 1)
        return JSON.parse(json) as Record<string, unknown>
      }
    }
  }

  throw new Error('Unterminated JSON in response')
}

export async function diagnose(
  faultCode: string,
  vehicle: Vehicle,
  locale: string = 'es'
): Promise<DiagnosticReport> {
  const lang = locale === 'en' ? 'English' : 'Spanish'

  const prompt = `You are an expert automotive diagnostic technician. A mechanic needs a diagnostic report with electrical wiring diagrams.

Vehicle: ${vehicle.brand} ${vehicle.model} ${vehicle.year}, Engine: ${vehicle.engine}, Fuel: ${vehicle.fuel}
Fault code: ${faultCode}

Respond ONLY with a valid JSON object in ${lang} with this exact structure:
{
  "faultCode": "${faultCode}",
  "description": "clear description of what this fault code means",
  "severity": "low|medium|high",
  "causes": ["cause 1", "cause 2", "cause 3", "...up to 6 causes ordered by probability"],
  "tests": [
    {
      "procedure": "detailed test procedure with specific values, tools, and expected measurements",
      "diagram": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'>...complete SVG electrical diagram...</svg>"
    }
  ],
  "solutions": ["step 1", "step 2", "...ordered step by step repair procedure"],
  "parts": ["part 1", "part 2", "...commonly replaced parts for this fault"]
}

For each test, include an SVG electrical diagram showing:
- The component being tested (sensor, relay, fuse, ECU, etc.) as a labeled rectangle
- Wire connections with correct colors (use colored strokes)
- Multimeter/oscilloscope connection points (red=positive, black=ground)
- Expected voltage or resistance values at each measurement point
- Ground symbols (triangle) and power source (battery) when relevant

SVG guidelines:
- Background: light gray (#f8f9fa) or white
- Shapes: rect, circle, line, path, text — NO scripts, NO event handlers
- Wire colors: red=#dc2626, black=#111827, blue=#2563eb, green=#16a34a, yellow=#ca8a04, orange=#ea580c
- Font: Arial, 11-12px
- Viewbox: 400×200 or 500×250 for complex diagrams

Generate exactly 3 tests. Include an SVG diagram ONLY for the first 2 tests. For test 3, omit the diagram field. Return ONLY the JSON.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let raw: Record<string, unknown>
  try {
    raw = extractJSON(text)
  } catch {
    // Fallback: retry with a simpler prompt (no SVGs) to at least get text data
    const fallbackMessage = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an expert automotive technician. For fault code ${faultCode} on a ${vehicle.brand} ${vehicle.model} ${vehicle.year} (${vehicle.fuel}), respond ONLY with this JSON in ${lang}:
{"faultCode":"${faultCode}","description":"...","severity":"low|medium|high","causes":["...","...","..."],"tests":[{"procedure":"..."},{"procedure":"..."},{"procedure":"..."}],"solutions":["...","...","..."],"parts":["...","..."]}`,
      }],
    })
    const fallbackText = fallbackMessage.content[0].type === 'text' ? fallbackMessage.content[0].text : ''
    raw = extractJSON(fallbackText)
  }

  return normalizeReport(raw, faultCode)
}
