'use client'

import { useState } from 'react'
import { Loader2, Wrench, Zap, FileText, Clock, Star, ChevronRight, Cpu, Car, ChevronDown } from 'lucide-react'
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
import AuthModal from '@/components/AuthModal'
import { UserButton, useUser } from '@clerk/nextjs'

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

const BRANDS = [
  'Abarth','Alfa Romeo','Audi','BMW','Chevrolet','Citroën','Cupra','Dacia','DS','Fiat',
  'Ford','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia','Lamborghini','Land Rover',
  'Lexus','Maserati','Mazda','Mercedes-Benz','Mini','Mitsubishi','Nissan','Opel','Peugeot',
  'Porsche','Renault','SEAT','Skoda','Smart','Subaru','Suzuki','Tesla','Toyota','Volkswagen',
  'Volvo',
]

const FUEL_OPTIONS = ['Diesel', 'Gasolina', 'Híbrido', 'Eléctrico', 'GLP', 'GNC']

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i)

export default function Home() {
  const { isSignedIn } = useUser()
  const [locale, setLocale] = useState<Locale>('es')
  const t = translations[locale]

  const [step, setStep] = useState<Step>('search')
  const [faultCode, setFaultCode] = useState('')
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [report, setReport] = useState<DiagnosticReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPricing, setShowPricing] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)

  // Vehicle form state
  const [vBrand, setVBrand] = useState('')
  const [vModel, setVModel] = useState('')
  const [vYear, setVYear] = useState('')
  const [vFuel, setVFuel] = useState('Diesel')
  const [vEngine, setVEngine] = useState('')
  const [vPlate, setVPlate] = useState('')

  function handleVehicleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vBrand.trim() || !vModel.trim()) {
      setError('Introduce al menos la marca y el modelo')
      return
    }
    // Gate: must be logged in to proceed
    if (!isSignedIn) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    setError('')
    setVehicle({
      plate: vPlate.replace(/\s/g, '').toUpperCase() || '—',
      brand: vBrand.trim(),
      model: vModel.trim(),
      year: parseInt(vYear) || 0,
      fuel: vFuel,
      engine: vEngine.trim(),
    })
    setStep('fault')
  }

  async function handleDiagnose(e: React.FormEvent) {
    e.preventDefault()
    if (!faultCode.trim()) { setError(t.errors.emptyFault); return }
    // Gate: must be logged in
    if (!isSignedIn) { setAuthMode('signup'); setShowAuth(true); return }
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
    setStep('search'); setFaultCode('')
    setVehicle(null); setReport(null); setError('')
    setVBrand(''); setVModel(''); setVYear(''); setVFuel('Diesel'); setVEngine(''); setVPlate('')
  }

  function restoreFromHistory(v: Vehicle, r: DiagnosticReport) {
    setVehicle(v); setReport(r); setStep('report')
  }

  const stepIndex = ['search', 'fault', 'report'].indexOf(step)

  return (
    <div className="min-h-screen bg-white">
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onNeedAuth={(plan) => {
            setPendingPlan(plan)
            setShowPricing(false)
            setAuthMode('signup')
            setShowAuth(true)
          }}
        />
      )}
      {showAuth && (
        <AuthModal
          defaultMode={authMode}
          onClose={() => { setShowAuth(false); setPendingPlan(null) }}
          onSuccess={async () => {
            setShowAuth(false)
            if (pendingPlan) {
              const plan = pendingPlan
              setPendingPlan(null)
              try {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan }),
                })
                const data = await res.json()
                if (data.url) window.location.href = data.url
                else setShowPricing(true)
              } catch {
                setShowPricing(true)
              }
            }
          }}
        />
      )}

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/5 no-print">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={reset}>
            <Logo size="md" variant="light" />
          </button>

          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} onChange={setLocale} />
            <button
              onClick={() => setShowPricing(true)}
              className="hidden sm:flex items-center gap-1 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Precios
            </button>
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Empezar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── STEP 1: LANDING ── */}
      {step === 'search' && (
        <main>
          {/* ── HERO: 2-col split ── */}
          <section className="bg-[#0a0f1e] min-h-screen pt-14 flex items-center relative overflow-hidden">
            {/* Radial glow */}
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">

              {/* LEFT: copy + search */}
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  Diagnóstico IA para talleres profesionales
                </div>

                <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                  Diagnóstica<br />
                  más rápido<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
                    con IA.
                  </span>
                </h1>

                <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
                  Introduce el vehículo y el código OBD. ECUnex genera en segundos: causas, pruebas con esquemas eléctricos y soluciones paso a paso.
                </p>

                {/* Vehicle form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm max-w-md">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Car className="w-3.5 h-3.5" /> Datos del vehículo
                  </p>
                  <form onSubmit={handleVehicleSubmit} className="space-y-3">
                    {/* Brand + Model */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          list="brands-list"
                          value={vBrand}
                          onChange={e => { setVBrand(e.target.value); setError('') }}
                          placeholder="Marca *"
                          autoFocus
                          className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-all"
                        />
                        <datalist id="brands-list">
                          {BRANDS.map(b => <option key={b} value={b} />)}
                        </datalist>
                      </div>
                      <input
                        value={vModel}
                        onChange={e => { setVModel(e.target.value); setError('') }}
                        placeholder="Modelo *"
                        className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-all"
                      />
                    </div>

                    {/* Year + Fuel */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <select
                          value={vYear}
                          onChange={e => setVYear(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-all appearance-none"
                        >
                          <option value="">Año</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={vFuel}
                          onChange={e => setVFuel(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-all appearance-none"
                        >
                          {FUEL_OPTIONS.map(f => <option key={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Engine + Plate (optional) */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={vEngine}
                        onChange={e => setVEngine(e.target.value)}
                        placeholder="Motor (ej: 2.0 TDI)"
                        className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 placeholder:text-xs transition-all"
                      />
                      <input
                        value={vPlate}
                        onChange={e => setVPlate(e.target.value.toUpperCase())}
                        placeholder="Matrícula (opcional)"
                        className="w-full px-3 py-3 rounded-xl bg-white/90 border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm font-mono text-gray-900 placeholder:text-gray-400 placeholder:text-xs placeholder:font-sans transition-all"
                        maxLength={10}
                      />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                      type="submit"
                      disabled={!vBrand.trim() || !vModel.trim()}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30"
                    >
                      <Wrench className="w-4 h-4" />
                      {isSignedIn ? 'Iniciar diagnóstico' : 'Crear cuenta gratis y diagnosticar'}
                    </button>
                    {!isSignedIn && vBrand.trim() && vModel.trim() && (
                      <p className="text-center text-slate-500 text-xs">
                        Gratis durante 7 días · Sin tarjeta
                      </p>
                    )}
                  </form>
                </div>

                {/* Trust */}
                <div className="flex items-center gap-4 mt-5">
                  <div className="flex -space-x-1.5">
                    {['#3b82f6','#0ea5e9','#6366f1','#8b5cf6'].map(c => (
                      <div key={c} className="w-7 h-7 rounded-full border-2 border-[#0a0f1e]" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm">
                    <span className="text-white font-semibold">+50 talleres</span> ya usan ECUnex · 4.9★
                  </p>
                </div>
              </div>

              {/* RIGHT: app mockup */}
              <div className="hidden lg:block">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  {/* Mockup header */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-md text-center text-xs text-slate-500 py-1 mx-4">
                      ecunex.app
                    </div>
                  </div>
                  {/* Mockup content */}
                  <div className="p-5 space-y-3">
                    {/* Vehicle card */}
                    <div className="bg-slate-900 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                          <Car className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold">Volkswagen Golf</p>
                          <p className="text-slate-400 text-[10px]">2018 · 2.0 TDI · Diesel</p>
                        </div>
                      </div>
                    </div>
                    {/* Fault header */}
                    <div className="bg-slate-900 rounded-xl overflow-hidden">
                      <div className="h-1 bg-amber-400 w-full" />
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-white font-mono font-black text-lg">P0300</span>
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg">⚠ Moderada</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-snug">Fallo de encendido aleatorio detectado en múltiples cilindros.</p>
                      </div>
                    </div>
                    {/* Causes */}
                    <div className="bg-slate-900 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-amber-400 rounded-full" />
                        <p className="text-slate-300 text-[11px] font-semibold">Causas más probables</p>
                      </div>
                      {['Bujías desgastadas o defectuosas', 'Bobinas de encendido defectuosas', 'Inyectores obstruidos'].map((c, i) => (
                        <div key={i} className="flex gap-2 items-start mb-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[9px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                          <p className="text-slate-400 text-[10px] leading-snug">{c}</p>
                        </div>
                      ))}
                    </div>
                    {/* Schema badge */}
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <p className="text-cyan-300 text-[11px] font-medium">4 pruebas con esquemas eléctricos SVG incluidos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <section className="bg-white border-y border-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
              {STATS.map(s => (
                <div key={s.label} className="text-center px-4">
                  <p className="text-2xl font-black text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-gray-50 px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest text-center mb-2">Por qué ECUnex</p>
              <h2 className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">
                Todo lo que necesita un taller profesional
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {FEATURES.map(f => (
                  <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-11 h-11 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5 transition-colors">
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial CTA */}
          <section className="bg-[#0a0f1e] px-6 py-16 text-center">
            <div className="flex justify-center gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <blockquote className="text-white text-xl font-semibold max-w-lg mx-auto mb-3 leading-snug">
              "Con ECUnex diagnosticamos en la mitad de tiempo. Los esquemas eléctricos son una pasada."
            </blockquote>
            <p className="text-slate-500 text-sm mb-10">— Marc G., Mecánico · Urbancar Rubí · 5 años de experiencia</p>
            <button
              onClick={() => setShowPricing(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-xl shadow-blue-600/30 text-base"
            >
              Ver planes y precios <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-slate-600 text-xs mt-3">Sin permanencia · Cancela cuando quieras · Desde €29/mes</p>
          </section>

          {/* History + footer */}
          <div className="max-w-lg mx-auto px-4 py-6">
            <HistoryPanel t={t} onRestore={restoreFromHistory} />
          </div>
          <footer className="border-t border-gray-100 py-6 px-4 bg-white">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <Logo size="sm" variant="light" />
              <div className="flex gap-5">
                <button onClick={() => setShowPricing(true)} className="hover:text-gray-700 transition-colors font-medium">Precios</button>
                <span className="cursor-default">Privacidad</span>
                <span className="cursor-default">Términos</span>
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
