import { Vehicle } from './vehicle'
import { DiagnosticReport } from './diagnose'

export interface HistoryEntry {
  id: string
  date: string
  vehicle: Vehicle
  report: DiagnosticReport
}

const KEY = 'ecunex_history'

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveToHistory(vehicle: Vehicle, report: DiagnosticReport): HistoryEntry {
  const entry: HistoryEntry = {
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    vehicle,
    report,
  }
  const history = getHistory()
  history.unshift(entry)
  // Máximo 200 entradas
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 200)))
  return entry
}

export function getHistoryByPlate(plate: string): HistoryEntry[] {
  return getHistory().filter(e => e.vehicle.plate === plate.toUpperCase())
}

export function deleteEntry(id: string): void {
  const history = getHistory().filter(e => e.id !== id)
  localStorage.setItem(KEY, JSON.stringify(history))
}
