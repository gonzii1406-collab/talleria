'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Zap, RotateCcw } from 'lucide-react'
import { DiagnosticReport, TestWithDiagram } from '@/lib/diagnose'
import { T } from '@/lib/i18n'

interface Props {
  report: DiagnosticReport
  t: T
  onReset: () => void
}

const SEVERITY_CONFIG = {
  low:    { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Leve',     icon: <CheckCircle className="w-3.5 h-3.5" /> },
  medium: { bg: 'bg-amber-500',   light: 'bg-amber-50 text-amber-700 border-amber-200',     label: 'Moderada',  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  high:   { bg: 'bg-red-500',     light: 'bg-red-50 text-red-700 border-red-200',           label: 'Alta',      icon: <AlertTriangle className="w-3.5 h-3.5" /> },
}

function TestItem({ test, index }: { test: TestWithDiagram; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <div className="flex gap-3 p-4 items-start">
        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed">{test.procedure}</p>
          {test.diagram && (
            <button
              onClick={() => setOpen(o => !o)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Zap className="w-3 h-3" />
              {open ? 'Ocultar esquema' : 'Ver esquema eléctrico'}
              {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      {open && test.diagram && (
        <div className="border-t border-blue-100 bg-slate-50 p-4 overflow-x-auto">
          <div
            className="rounded-xl overflow-hidden"
            dangerouslySetInnerHTML={{ __html: test.diagram }}
          />
        </div>
      )}
    </div>
  )
}

function SectionCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100`}>
        <div className={`w-1 h-5 rounded-full ${accent}`} />
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function DiagnosticReportView({ report, t, onReset }: Props) {
  // Fallback to 'medium' if severity value is unexpected
  const sev = SEVERITY_CONFIG[report.severity] ?? SEVERITY_CONFIG.medium

  const tests: TestWithDiagram[] = (report.tests ?? []).map((t: TestWithDiagram | string) =>
    typeof t === 'string' ? { procedure: t } : t
  )

  return (
    <div className="space-y-3">

      {/* Header — fault code + description */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        {/* Severity bar */}
        <div className={`h-1 w-full ${sev.bg}`} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="font-mono font-black text-2xl text-white tracking-wider">
              {report.faultCode}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${sev.light}`}>
              {sev.icon}
              {t.report.severity}: {sev.label}
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{report.description}</p>
        </div>
      </div>

      {/* Causas */}
      <SectionCard title={t.report.causes} accent="bg-amber-400">
        <ul className="space-y-2.5">
          {(report.causes ?? []).map((c, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Pruebas */}
      <SectionCard title={t.report.tests} accent="bg-blue-500">
        <div className="space-y-2">
          <p className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Incluye esquemas eléctricos interactivos
          </p>
          {tests.map((test, i) => (
            <TestItem key={i} test={test} index={i} />
          ))}
        </div>
      </SectionCard>

      {/* Soluciones */}
      <SectionCard title={t.report.solutions} accent="bg-emerald-500">
        <ol className="space-y-3">
          {(report.solutions ?? []).map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <span className="leading-relaxed pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Piezas */}
      <SectionCard title={t.report.parts} accent="bg-slate-400">
        <div className="flex flex-wrap gap-2">
          {(report.parts ?? []).map((p, i) => (
            <span key={i} className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
              {p}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Nueva búsqueda */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" /> {t.newSearch}
      </button>
    </div>
  )
}
