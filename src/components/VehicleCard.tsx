'use client'

import { useState } from 'react'
import { Fuel, Calendar, Zap, Pencil, Check, X, ArrowLeft } from 'lucide-react'
import { Vehicle } from '@/lib/vehicle'
import { T } from '@/lib/i18n'

interface Props {
  vehicle: Vehicle
  t: T
  onReset: () => void
  onUpdate: (v: Vehicle) => void
}

const FUEL_OPTIONS = ['Diesel', 'Gasolina', 'Híbrido', 'Eléctrico', 'GLP', 'GNC']

function PlateDisplay({ plate }: { plate: string }) {
  return (
    <div className="inline-flex items-stretch rounded overflow-hidden border-2 border-gray-800 shadow-sm">
      {/* EU strip */}
      <div className="bg-[#003399] flex flex-col items-center justify-center px-1.5 py-1 gap-0.5">
        <span className="text-yellow-300 text-[8px] leading-none">★</span>
        <span className="text-white text-[9px] font-bold leading-none">E</span>
      </div>
      {/* Number */}
      <div className="bg-white px-3 py-1.5 font-black text-gray-900 tracking-[0.15em] text-lg leading-none flex items-center">
        {plate}
      </div>
    </div>
  )
}

export default function VehicleCard({ vehicle, t, onReset, onUpdate }: Props) {
  const [editing, setEditing] = useState(!vehicle.brand)
  const [draft, setDraft] = useState<Vehicle>(vehicle)

  function startEdit() { setDraft(vehicle); setEditing(true) }
  function cancel() { setDraft(vehicle); setEditing(false) }
  function save() { onUpdate(draft); setEditing(false) }
  function set(field: keyof Vehicle, value: string | number) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Edit header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
          <div>
            <PlateDisplay plate={vehicle.plate} />
            {!vehicle.brand && (
              <div className="mt-2 space-y-0.5">
                <p className="text-amber-400 text-xs font-medium">
                  Introduce los datos del vehículo
                </p>
                {vehicle.yearIsEstimate && vehicle.year > 0 && (
                  <p className="text-slate-400 text-xs">
                    Año estimado por matrícula: <span className="text-cyan-400 font-semibold">~{vehicle.year}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancel}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button
              onClick={save}
              className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-3 py-1.5 transition-colors font-medium"
            >
              <Check className="w-3 h-3" /> Guardar
            </button>
          </div>
        </div>

        {/* Edit fields */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: t.vehicle.brand, field: 'brand' as keyof Vehicle, value: draft.brand, placeholder: 'Volkswagen' },
            { label: t.vehicle.model, field: 'model' as keyof Vehicle, value: draft.model, placeholder: 'Golf' },
          ].map(({ label, field, value, placeholder }) => (
            <div key={field} className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-colors"
                value={value as string}
                placeholder={placeholder}
                onChange={e => set(field, e.target.value)}
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t.vehicle.year}
            </label>
            <input
              type="number" min={1960} max={2030}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-colors"
              value={draft.year || ''} placeholder="2000"
              onChange={e => set('year', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Fuel className="w-3 h-3" /> {t.vehicle.fuel}
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-colors bg-white"
              value={draft.fuel}
              onChange={e => set('fuel', e.target.value)}
            >
              {FUEL_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> {t.vehicle.engine}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { placeholder: '1.9 TDI', field: 'engine' as keyof Vehicle, value: draft.engine },
                { placeholder: '1896cc', field: 'displacement' as keyof Vehicle, value: draft.displacement ?? '' },
                { placeholder: '90cv', field: 'power' as keyof Vehicle, value: draft.power ?? '' },
              ].map(({ placeholder, field, value }) => (
                <input
                  key={field}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-gray-900 transition-colors"
                  placeholder={placeholder}
                  value={value as string}
                  onChange={e => set(field, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Dark header */}
      <div className="bg-slate-900 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <PlateDisplay plate={vehicle.plate} />
            <div>
              <p className="text-white font-bold text-base leading-tight">
                {vehicle.brand} {vehicle.model}
              </p>
              <p className="text-slate-400 text-sm mt-0.5">
                {vehicle.year
                  ? <>{vehicle.yearIsEstimate ? <span className="text-cyan-400/80">~{vehicle.year}</span> : vehicle.year}</>
                  : '—'
                } · {vehicle.fuel}
              </p>
              {(vehicle.engine || vehicle.displacement || vehicle.power) && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-md font-mono">
                    {[vehicle.engine, vehicle.displacement, vehicle.power].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100 bg-gray-50">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {t.changePlate}
        </button>
        <button
          onClick={startEdit}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Pencil className="w-3 h-3" /> {t.vehicle.edit ?? 'Editar datos'}
        </button>
      </div>
    </div>
  )
}
