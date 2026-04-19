export interface Vehicle {
  plate: string
  brand: string
  model: string
  year: number
  engine: string
  fuel: string
  displacement?: string
  power?: string
  yearIsEstimate?: boolean // true cuando el año es estimado, no de API
}

/**
 * Estima el año de matriculación a partir del formato NNNN LLL (España post-2000).
 * Letras válidas: B C D F G H J K L M N P R S T V W X Y Z (20 letras, sin vocales ni Ñ Q)
 * El sistema empezó con 0000-BBB en 2000 y va a ~1.3M matrículas/año.
 */
function estimateYearFromPlate(plate: string): number | null {
  const match = plate.match(/^(\d{4})([B-Z]{3})$/)
  if (!match) return null

  const num = parseInt(match[1])
  const letters = match[2]

  const VALID = 'BCDFGHJKLMNPRSTVWXYZ' // 20 letras en orden
  const n = VALID.length

  const i0 = VALID.indexOf(letters[0])
  const i1 = VALID.indexOf(letters[1])
  const i2 = VALID.indexOf(letters[2])
  if (i0 === -1 || i1 === -1 || i2 === -1) return null

  // Posición total en la secuencia (0 = 0000-BBB)
  const letterSeq = i0 * n * n + i1 * n + i2
  const totalSeq = letterSeq * 10000 + num

  // ~1.3M matrículas/año en España
  const year = Math.round(2000 + totalSeq / 1_300_000)
  return Math.min(Math.max(year, 2000), new Date().getFullYear())
}

export async function lookupVehicle(plate: string): Promise<Vehicle> {
  const cleanPlate = plate.replace(/\s/g, '').toUpperCase()

  const isValid =
    /^[0-9]{4}[A-Z]{3}$/.test(cleanPlate) ||
    /^[A-Z]{1,2}[0-9]{4}[A-Z]{2}$/.test(cleanPlate) ||
    cleanPlate.length >= 5

  if (!isValid) throw new Error('INVALID_PLATE')

  // --- 1. openapi.com ---
  const openApiToken = process.env.OPENAPI_TOKEN
  const isProduction = process.env.NODE_ENV === 'production'
  const openApiBase = isProduction
    ? 'https://automotive.openapi.com'
    : 'https://test.automotive.openapi.com'

  if (openApiToken || !isProduction) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (openApiToken) headers['Authorization'] = `Bearer ${openApiToken}`

      const res = await fetch(`${openApiBase}/ES-car/${encodeURIComponent(cleanPlate)}`, {
        headers,
        next: { revalidate: 86400 },
      })

      if (res.ok) {
        const json = await res.json()
        const d = json.data ?? json
        const brand = toTitleCase(d.CarMake?.CurrentTextValue ?? d.CarMake ?? d.Make ?? '')
        const model = toTitleCase(d.CarModel?.CurrentTextValue ?? d.CarModel ?? d.Model ?? d.Description ?? '')

        if (brand) {
          const engineSize = d.EngineSize ? `${d.EngineSize}cc` : undefined
          const power = d.DynamicPower ? `${Math.round(Number(d.DynamicPower))}cv` : undefined
          const fuelLower = (d.Fuel ?? '').toLowerCase()
          const engineLabel = engineSize
            ? `${(Number(d.EngineSize) / 1000).toFixed(1)}${fuelLower.includes('diesel') ? ' TDI' : fuelLower.includes('híb') ? ' Hybrid' : ' TSI'}`
            : '-'
          return {
            plate: cleanPlate, brand, model,
            year: parseInt(d.RegistrationYear ?? d.Year ?? '0') || 0,
            engine: engineLabel,
            fuel: toTitleCase(d.Fuel ?? d.FuelType ?? 'Desconocido'),
            displacement: engineSize, power,
          }
        }
      }
    } catch { /* continúa */ }
  }

  // --- 2. matriculaapi.com ---
  const matriculaApiUser = process.env.MATRICULAAPI_USER
  if (matriculaApiUser) {
    try {
      const url = `https://www.matriculaapi.com/api/reg.asmx/CheckSpain?RegistrationNumber=${encodeURIComponent(cleanPlate)}&username=${encodeURIComponent(matriculaApiUser)}`
      const res = await fetch(url)
      if (res.ok) {
        const xml = await res.text()
        const match = xml.match(/<vehicleJson[^>]*>([\s\S]*?)<\/vehicleJson>/)
        if (match?.[1]) {
          const d = JSON.parse(match[1].replace(/&quot;/g, '"'))
          const brand = d.CarMake?.CurrentTextValue ?? d.MakeDescription?.CurrentTextValue ?? ''
          const model = d.CarModel?.CurrentTextValue ?? d.ModelDescription?.CurrentTextValue ?? ''
          if (brand) {
            const engineCc = d.EngineSize ?? ''
            const engineSize = engineCc ? `${engineCc}cc` : undefined
            const power = d.DynamicPower ? `${Math.round(Number(d.DynamicPower))}cv` : undefined
            const variation = d.Variation ?? ''
            const engineLabel = variation
              ? variation.replace(/^.*?(\d+\.\d+.*)/i, '$1').trim() || `${(Number(engineCc) / 1000).toFixed(1)} ${d.Fuel?.toLowerCase().includes('diesel') ? 'TDI' : 'TSI'}`
              : engineCc ? `${(Number(engineCc) / 1000).toFixed(1)} ${d.Fuel?.toLowerCase().includes('diesel') ? 'TDI' : 'TSI'}` : '-'
            return {
              plate: cleanPlate,
              brand: toTitleCase(brand),
              model: toTitleCase(model),
              year: parseInt(d.RegistrationYear ?? '0') || 0,
              engine: engineLabel,
              fuel: toTitleCase(d.Fuel ?? 'Desconocido'),
              displacement: engineSize, power,
            }
          }
        }
      }
    } catch { /* continúa */ }
  }

  // --- 3. Fallback: año estimado desde el número de matrícula ---
  const estimatedYear = estimateYearFromPlate(cleanPlate)

  return {
    plate: cleanPlate,
    brand: '',
    model: '',
    year: estimatedYear ?? 0,
    engine: '',
    fuel: 'Diesel',
    yearIsEstimate: estimatedYear !== null,
  }
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
