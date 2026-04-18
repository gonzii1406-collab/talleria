'use client'

import { AlertTriangle, CheckCircle, Info, Wrench, TestTube, Package, ChevronRight } from 'lucide-react'
import { DiagnosticReport } from '@/lib/diagnose'
import { T } from '@/lib/i18n'

interface Props {
  report: DiagnosticReport
  t: T
  onReset: () => void
}

const SEVERITY_COLORS = {
  low: 'bg-green-50 border-green-200 text-green-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-red-50 border-red-200 text-red-800',
}

const SEVERITY_ICONS = {
  low: <CheckCircle className="w-4 h-4" />,
  medium: <AlertTriangle className="w-4 h-4" />,
  high: <AlertTriangle className="w-4 h-4" />,
}

function Section({ icon, title, items, numbered = false }: {
  icon: React.ReactNode
  title: string
  items: string[]
  numbered?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-600">{icon}</span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="shrink-0 mt-0.5 text-gray-400">
              {numbered
                ? <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                : <ChevronRight className="w-4 h-4" />
              }
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DiagnosticReportView({ report, t, onReset }: Props) {
  const severityLabel = {
    low: t.report.severity_low,
    medium: t.report.severity_medium,
    high: t.report.severity_high,
  }[report.severity]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono">{report.faultCode}</span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[report.severity]}`}>
            {SEVERITY_ICONS[report.severity]}
            {t.report.severity}: {severityLabel}
          </span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{report.description}</p>
      </div>

      {/* Causas */}
      <Section
        icon={<Info className="w-4 h-4" />}
        title={t.report.causes}
        items={report.causes}
      />

      {/* Pruebas */}
      <Section
        icon={<TestTube className="w-4 h-4" />}
        title={t.report.tests}
        items={report.tests}
      />

      {/* Soluciones */}
      <Section
        icon={<Wrench className="w-4 h-4" />}
        title={t.report.solutions}
        items={report.solutions}
        numbered
      />

      {/* Piezas */}
      <Section
        icon={<Package className="w-4 h-4" />}
        title={t.report.parts}
        items={report.parts}
      />

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        {t.newSearch}
      </button>
    </div>
  )
}
