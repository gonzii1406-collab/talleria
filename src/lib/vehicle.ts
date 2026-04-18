export interface Vehicle {
  plate: string
  brand: string
  model: string
  year: number
  engine: string
  fuel: string
  displacement?: string
  power?: string
}

export async function lookupVehicle(plate: string): Promise<Vehicle> {
  const cleanPlate = plate.replace(/\s/g, '').toUpperCase()

  const isValid = /^[0-9]{4}[A-Z]{3}$/.test(cleanPlate) ||
    /^[A-Z]{1,2}[0-9]{4}[A-Z]{2}$/.test(cleanPlate) ||
    cleanPlate.length >= 5

  if (!isValid) {
    throw new Error('INVALID_PLATE')
  }

  // --- openapi.com (sandbox gratuito en dev, producción con token) ---
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
        next: { revalidate: 86400 }, // cachear 24h por matrícula
      })

      if (res.ok) {
        const json = await res.json()
        const d = json.data ?? json

        const brand = toTitleCase(d.CarMake?.CurrentTextValue ?? d.CarMake ?? d.Make ?? '')
        const model = toTitleCase(d.CarModel?.CurrentTextValue ?? d.CarModel ?? d.Model ?? d.Description ?? '')

        // Solo usar openapi si tiene marca — si no, caer a matriculaapi
        if (brand) {
          const engineSize = d.EngineSize ? `${d.EngineSize}cc` : undefined
          const power = d.DynamicPower ? `${Math.round(Number(d.DynamicPower))}cv` : undefined
          const fuelLower = (d.Fuel ?? '').toLowerCase()
          const engineLabel = engineSize
            ? `${(Number(d.EngineSize) / 1000).toFixed(1)}${fuelLower.includes('diesel') ? ' TDI' : fuelLower.includes('híb') ? ' Hybrid' : ' TSI'}`
            : '-'
          return {
            plate: cleanPlate,
            brand,
            model,
            year: parseInt(d.RegistrationYear ?? d.Year ?? '0') || 0,
            engine: engineLabel,
            fuel: toTitleCase(d.Fuel ?? d.FuelType ?? 'Desconocido'),
            displacement: engineSize,
            power,
          }
        }
      }
    } catch {
      // continúa al fallback
    }
  }

  // --- matriculaapi.com (10 queries gratuitas en trial) ---
  const matriculaApiUser = process.env.MATRICULAAPI_USER
  if (matriculaApiUser) {
    try {
      const url = `https://www.matriculaapi.com/api/reg.asmx/CheckSpain?RegistrationNumber=${encodeURIComponent(cleanPlate)}&username=${encodeURIComponent(matriculaApiUser)}`
      const res = await fetch(url)
      if (res.ok) {
        const xml = await res.text()
        // Extraer JSON del XML: <vehicleJson>{...}</vehicleJson>
        const match = xml.match(/<vehicleJson[^>]*>([\s\S]*?)<\/vehicleJson>/)
        if (match?.[1]) {
          const d = JSON.parse(match[1].replace(/&quot;/g, '"'))
          // CarMake y CarModel son objetos: { CurrentTextValue: "..." }
          const brand = d.CarMake?.CurrentTextValue ?? d.MakeDescription?.CurrentTextValue ?? ''
          const model = d.CarModel?.CurrentTextValue ?? d.ModelDescription?.CurrentTextValue ?? ''
          if (brand) {
            const engineCc = d.EngineSize ?? ''
            const engineSize = engineCc ? `${engineCc}cc` : undefined
            const power = d.DynamicPower ? `${Math.round(Number(d.DynamicPower))}cv` : undefined
            // Usar Variation (ej: "V MATCH 1.9 TDI") si está disponible
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
              displacement: engineSize,
              power,
            }
          }
        }
      }
    } catch {
      // continúa al fallback
    }
  }

  // --- Fallback: datos vacíos para rellenar manualmente ---
  return {
    plate: cleanPlate,
    brand: '',
    model: '',
    year: 0,
    engine: '',
    fuel: 'Diesel',
  }
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
