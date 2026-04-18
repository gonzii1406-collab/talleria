'use client'

import { X, Check } from 'lucide-react'

interface Props {
  onClose: () => void
}

const plans = [
  {
    name: 'Starter',
    price: '29',
    popular: false,
    features: [
      '1 usuario',
      '50 diagnósticos/mes',
      'Idiomas ES/EN',
      'Historial 30 días',
    ],
  },
  {
    name: 'Pro',
    price: '69',
    popular: true,
    features: [
      '3 usuarios',
      '100 diagnósticos/mes',
      'Esquemas eléctricos',
      'Historial ilimitado',
      'Soporte por email',
    ],
  },
  {
    name: 'Taller',
    price: '120',
    popular: false,
    features: [
      'Usuarios ilimitados',
      'Diagnósticos ilimitados',
      'Todo lo de Pro',
      'Acceso API',
      'Soporte prioritario',
    ],
  },
]

export default function PricingModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Planes ECUnex</h2>
            <p className="text-blue-200 text-sm mt-0.5">Sin permanencia · Cancela cuando quieras</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors rounded-lg p-1.5 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-5 flex flex-col relative ${
                plan.popular
                  ? 'border-blue-500 shadow-lg shadow-blue-100'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Mas popular
                </span>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-500 text-sm">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Empezar
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pb-5">
          Todos los planes incluyen IVA · Pago seguro con Stripe
        </p>
      </div>
    </div>
  )
}
