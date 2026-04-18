'use client'

import { useState, useEffect } from 'react'
import { History, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { getHistory, deleteEntry, HistoryEntry } from '@/lib/history'
import { Vehicle } from '@/lib/vehicle'
import { DiagnosticReport } from '@/lib/diagnose'
import { T } from '@/lib/i18n'

interface Props {
  t: T
  onRestore: (vehicle: Vehicle, report: DiagnosticReport) => void
}

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPanel({ t, onRestore }: Props) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (open) setEntries(getHistory())
  }, [open])

  function handleDelete(id: string) {
    deleteEntry(id)
    setEntries(getHistory())
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden no-print">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <History className="w-4 h-4 text-gray-400" />
          Historial de diagnósticos
          {entries.length > 0 && open && (
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{entries.length}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin diagnósticos guardados</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {entries.map(entry => (
                <li key={entry.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-gray-900 text-sm">{entry.vehicle.plate}</span>
                        <span className="text-gray-500 text-sm">{entry.vehicle.brand} {entry.vehicle.model} {entry.vehicle.year}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[entry.report.severity]}`}>
                          {entry.report.faultCode}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{entry.report.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onRestore(entry.vehicle, entry.report)}
                        className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-100 hover:border-blue-300 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
