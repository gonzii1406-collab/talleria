'use client'

import { useState } from 'react'
import { Search, Loader2, Wrench, X } from 'lucide-react'
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
    if (!faultCode.trim()) {
      setError(t.errors.emptyFault)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faultCode, vehicle, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t.errors.apiError)
        return
      }
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
    setStep('search')
    setPlate('')
    setFaultCode('')
    setVehicle(null)
    setReport(null)
    setError('')
  }

  function restoreFromHistory(v: Vehicle, r: DiagnosticReport) {
    setVehicle(v)
    setReport(r)
    setStep('report')
  }

  const stepIndex = ['search', 'fault', 'report'].indexOf(step)

  return (
    <div className="min-h-screen bg-gray-50">
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900 text-lg">
              Taller<span className="text-blue-600">IA</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector locale={locale} onChange={setLocale} />
            <button
              onClick={() => setShowPricing(true)}
              className="text-sm font-medium text-blue-600 border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Precios
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Step 1: Landing + search */}
        {step === 'search' && (
          <>
            {/* Hero gradient */}
            <div className="bg-gradient-to-b from-slate-900 to-blue-950 py-16 px-4 text-center no-print">
              <h1 className="text-3xl font-bold text-white mb-3">
                Diagnóstico inteligente para talleres
              </h1>
              <p className="text-blue-200 text-sm max-w-md mx-auto">
                Introduce la matrícula y el código de fallo. Obtén causas, pruebas y soluciones en segundos.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {['Análisis por IA', 'Resultado en segundos', 'Esquemas eléctricos'].map((pill, i) => {
                  const icons = ['🔍', '⚡', '🔌']
                  return (
                    <span
                      key={pill}
                      className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/20"
                    >
                      {icons[i]} {pill}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Search card */}
            <div className="max-w-lg mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 -mt-6 relative z-10">
                <h2 className="font-semibold text-gray-900 mb-4">Buscar vehículo</h2>
                <form onSubmit={handlePlateSearch} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={plate}
                      onChange={e => { setPlate(e.target.value.toUpperCase()); setError('') }}
                      placeholder={t.searchPlaceholder}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-widest uppercase text-center"
                      maxLength={10}
                      autoFocus
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || !plate.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {loading ? '...' : t.searchBtn}
                  </button>
                </form>
              </div>

              {/* Trust bar */}
              <p className="text-xs text-gray-400 text-center py-3">
                Powered by Claude AI · Actualizado 2025 · Datos DGT España
              </p>

              {/* History */}
              <HistoryPanel t={t} onRestore={restoreFromHistory} />
            </div>
          </>
        )}

        {/* Steps 2 & 3 — original layout */}
        {step !== 'search' && (
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 no-print">
              {(['search', 'fault', 'report'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s ? 'bg-blue-600 text-white' :
                    stepIndex > i ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`h-0.5 w-8 transition-colors ${stepIndex > i ? 'bg-blue-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 2: Vehicle + fault input */}
            {step === 'fault' && vehicle && (
              <div className="space-y-4">
                <VehicleCard vehicle={vehicle} t={t} onReset={reset} onUpdate={setVehicle} />
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-1">{t.faultSection}</h2>
                  <p className="text-sm text-gray-500 mb-4">{t.faultLabel}</p>
                  <form onSubmit={handleDiagnose} className="space-y-3">
                    <input
                      type="text"
                      value={faultCode}
                      onChange={e => { setFaultCode(e.target.value.toUpperCase()); setError('') }}
                      placeholder={t.faultPlaceholder}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider uppercase text-center"
                      maxLength={10}
                      autoFocus
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading || !faultCode.trim()}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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

            {/* Step 3: Report */}
            {step === 'report' && report && vehicle && (
              <div className="space-y-4">
                <VehicleCard vehicle={vehicle} t={t} onReset={reset} onUpdate={setVehicle} />
                <DiagnosticReportView report={report} t={t} onReset={reset} />
                <PrintReport vehicle={vehicle} report={report} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
