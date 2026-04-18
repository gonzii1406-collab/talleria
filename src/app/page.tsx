'use client'

import { useState } from 'react'
import { Search, Loader2, Wrench, Zap, FileText, Clock, Star, ChevronRight, Cpu } from 'lucide-react'
import Logo from '@/components/Logo'
import { Locale, translations } from '@/lib/i18n'
import { Vehicle } from '@/lib/vehicle'
import { DiagnosticReport } from '@/lib/diagnose'
import { saveToHistory } from '@/lib/history'
import LanguageSelector from '@/components/LanguageSelector'
import VehicleCard from '@/components/VehicleCard'
import DiagnosticReportView from '@/components/DiagnosticReport'
import HistoryPanel from '@/components/HistoryPanel'
import PrintReport from '@/components/PrintReport'
import PricingModal from '@/components/PricingModal'

type Step = 'search' | 'fault' | 'report'

const STATS = [
  { value: '50+', label: 'Talleres activos' },
  { value: '15k+', label: 'Diagnósticos' },
  { value: '<10s', label: 'Por informe' },
  { value: '4.9★', label: 'Valoración' },
]

const FEATURES = [
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'IA de última generación',
    desc: 'Análisis por Claude AI con contexto técnico real de cada vehículo.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Esquemas eléctricos',
    desc: 'Diagramas SVG generados para cada prueba — sin buscar en manuales.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Informe completo',
    desc: 'Causas, pruebas, soluciones y piezas en un único informe exportable.',
  },
]

export default function Home() {
  const [locale, setLocale] = useState<Locale>('es')
  const t = translations[locale]

  const [step, setStep] = useState<Step>('search')
  const [plate, setPlate] = useState('')
  const [faultCode, setFaultCode] = useState('')
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [report, setReport] = useState<DiagnosticReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPricing, setShowPricing] = useState(false)

  async function handlePlateSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!plate.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/vehicle?plate=${encodeURIComponent(plate)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === 'INVALID_PLATE' ? t.errors.invalidPlate : t.errors.notFound)
        return
      }
      setVehicle(data)
      setStep('fault')
    } catch {
      setError(t.errors.apiError)
    } finally {
      setLoading(false)
    }
  }

  async function handleDiagnose(e: React.FormEvent) {
    e.preventDefault()
    if (!faultCode.trim()) { setError(t.errors.emptyFault); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faultCode, vehicle, locale }),
      })
      const data = await res.json()
      if (!res.ok) { setError(t.errors.apiError); return }
      setReport(data)
      setStep('report')
      if (vehicle) saveToHistory(vehicle, data)
    } catch {
      setError(t.errors.apiError)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('search'); setPlate(''); setFaultCode('')
    setVehicle(null); setReport(null); setError('')
  }

  function restoreFromHistory(v: Vehicle, r: DiagnosticReport) {
    setVehicle(v); setReport(r); setStep('report')
  }

  const stepIndex = ['search', 'fault', 'report'].indexOf(step)

  return (
    <div className="min-h-screen bg-white">
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 no-print">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={reset}>
            <Logo size="sm" />
          </button>

          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} onChange={setLocale} />
            <button
              onClick={() => setShowPricing(true)}
              className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Precios
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Empezar
            </button>
          </div>
        </div>
      </header>

      {/* ── STEP 1: LANDING ── */}
      {step === 'search' && (
        <main>
          {/* Hero */}
          <section className="bg-[#0f172a] pt-28 pb-20 px-4 text-center relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="relative max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Powered by Claude AI · Actualizado 2025
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                Tu taller trabaja<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  mejor con IA
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                Introduce la matrícula y el código de fallo. ECUnex genera causas, esquemas eléctricos y soluciones en segundos.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                {[
                  { icon: '🔍', text: 'Análisis IA' },
                  { icon: '⚡', text: 'En segundos' },
                  { icon: '🔌', text: 'Esquemas eléctricos' },
                  { icon: '📄', text: 'Informe PDF' },
                  { icon: '🇪🇸', text: 'DGT España' },
                ].map(p => (
                  <span key={p.text} className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                    {p.icon} {p.text}
                  </span>
                ))}
              </div>

              {/* Search card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Buscar vehículo por matrícula
                </p>
                <form onSubmit={handlePlateSearch} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={plate}
                      onChange={e => { setPlate(e.target.value.toUpperCase()); setError('') }}
                      placeholder="1234 ABC"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-mono text-2xl tracking-[0.3em] uppercase text-center font-bold text-gray-900 transition-colors"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || !plate.trim()}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                      : <><Search className="w-4 h-4" /> Buscar vehículo</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="max-w-4xl mx-auto px-4 py-14">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider text-center mb-2">Por qué ECUnex</p>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              Todo lo que necesita un taller profesional
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonial / CTA */}
          <section className="bg-blue-600 px-4 py-14 text-center">
            <div className="flex justify-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />)}
            </div>
            <blockquote className="text-white text-lg font-medium max-w-md mx-auto mb-2">
              "Con ECUnex diagnosticamos en la mitad de tiempo. Los esquemas eléctricos son una pasada."
            </blockquote>
            <p className="text-blue-200 text-sm mb-8">— Marc G., Mecánico · Urbancar Rubí</p>
            <button
              onClick={() => setShowPricing(true)}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Ver planes y precios <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-blue-200 text-xs mt-3">Sin permanencia · Cancela cuando quieras</p>
          </section>

          {/* History */}
          <div className="max-w-lg mx-auto px-4 py-6">
            <HistoryPanel t={t} onRestore={restoreFromHistory} />
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-100 py-6 px-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <Logo size="sm" />
              <div className="flex gap-4">
                <button onClick={() => setShowPricing(true)} className="hover:text-gray-700 transition-colors">Precios</button>
                <span>Privacidad</span>
                <span>Términos</span>
              </div>
              <span>© 2025 ECUnex · Diagnóstico asistido por IA</span>
            </div>
          </footer>
        </main>
      )}

      {/* ── STEPS 2 & 3 ── */}
      {step !== 'search' && (
        <main className="pt-14">
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

            {/* Step indicator */}
            <div className="flex items-center gap-2 no-print">
              {(['search', 'fault', 'report'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    stepIndex > i ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {stepIndex > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`h-0.5 w-10 transition-colors ${stepIndex > i ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
              <div className="flex-1" />
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Nueva búsqueda
              </button>
            </div>

            {/* Step 2 */}
            {step === 'fault' && vehicle && (
              <div className="space-y-4">
                <VehicleCard vehicle={vehicle} t={t} onReset={reset} onUpdate={setVehicle} />
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-1">{t.faultSection}</h2>
                  <p className="text-sm text-gray-400 mb-4">{t.faultLabel}</p>
                  <form onSubmit={handleDiagnose} className="space-y-3">
                    <input
                      type="text"
                      value={faultCode}
                      onChange={e => { setFaultCode(e.target.value.toUpperCase()); setError('') }}
                      placeholder={t.faultPlaceholder}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-mono text-xl tracking-widest uppercase text-center font-bold transition-colors"
                      maxLength={10}
                      autoFocus
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading || !faultCode.trim()}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.diagnosing}</>
                        : <><Wrench className="w-4 h-4" /> {t.diagnoseBtn}</>
                      }
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 'report' && report && vehicle && (
              <div className="space-y-4">
                <VehicleCard vehicle={vehicle} t={t} onReset={reset} onUpdate={setVehicle} />
                <DiagnosticReportView report={report} t={t} onReset={reset} />
                <PrintReport vehicle={vehicle} report={report} />
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
