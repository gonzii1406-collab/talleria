'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, Wrench, TestTube, Package, ChevronRight, ChevronDown, Zap } from 'lucide-react'
import { DiagnosticReport, TestWithDiagram } from '@/lib/diagnose'
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

function TestItem({ test, index }: { test: TestWithDiagram; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex gap-2 p-3 items-start">
        <span className="shrink-0 mt-0.5 text-gray-400">
          <ChevronRight className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700">{test.procedure}</p>
          {test.diagram && (
            <button
              onClick={() => setOpen(o => !o)}
              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <Zap className="w-3 h-3" />
              {open ? 'Ocultar esquema eléctrico' : 'Ver esquema eléctrico'}
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      {open && test.diagram && (
        <div className="border-t border-blue-100 bg-gray-50 p-3 overflow-x-auto">
          <div
            className="min-w-0 rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: test.diagram }}
          />
        </div>
      )}
    </li>
  )
}

function TestsSection({ tests, title }: { tests: TestWithDiagram[]; title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-600"><TestTube className="w-4 h-4" /></span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
          con esquemas eléctricos
        </span>
      </div>
      <ul className="space-y-2">
        {tests.map((test, i) => (
          <TestItem key={i} test={test} index={i} />
        ))}
      </ul>
    </div>
  )
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

  // Compatibilidad: tests puede ser string[] (viejo) o TestWithDiagram[] (nuevo)
  const tests: TestWithDiagram[] = report.tests.map((t: TestWithDiagram | string) =>
    typeof t === 'string' ? { procedure: t } : t
  )

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

      {/* Pruebas con esquemas eléctricos */}
      <TestsSection tests={tests} title={t.report.tests} />

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
