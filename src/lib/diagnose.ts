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
      "procedure": "detailed test procedure with specific values and tools",
      "diagram": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'>...complete SVG electrical diagram showing the test connections, component, wire colors and measurement points...</svg>"
    }
  ],
  "solutions": ["step 1", "step 2", "...ordered step by step repair procedure"],
  "parts": ["part 1", "part 2", "...commonly replaced parts for this fault"]
}

For each test, create a clear SVG electrical diagram showing:
- The component being tested (sensor, relay, fuse, etc.) as a labeled rectangle or symbol
- Wire connections with colors when known (use colored strokes)
- Multimeter or oscilloscope connection points (red=positive, black=negative/ground)
- Voltage or resistance values expected at each point
- Ground points (triangle symbol at bottom)
- Battery/power source when relevant

SVG style guidelines:
- White or light gray background (#f8f9fa)
- Use simple geometric shapes: rect, circle, line, path, text
- Wire colors: red=#dc2626, black=#111827, blue=#2563eb, green=#16a34a, yellow=#ca8a04, orange=#ea580c
- Components: rounded rectangles with labels
- Measurement points: small colored circles with labels
- Keep it clean and readable for a mechanic
- Text font-size: 11-12px, font-family: Arial

Generate up to 4 tests, each with its own specific electrical diagram.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response')

  const parsed = JSON.parse(jsonMatch[0]) as DiagnosticReport
  return parsed
}
