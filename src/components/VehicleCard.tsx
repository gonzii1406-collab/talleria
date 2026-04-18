'use client'

import { useState } from 'react'
import { Car, Fuel, Calendar, Zap, Pencil, Check, X } from 'lucide-react'
import { Vehicle } from '@/lib/vehicle'
import { T } from '@/lib/i18n'

interface Props {
  vehicle: Vehicle
  t: T
  onReset: () => void
  onUpdate: (v: Vehicle) => void
}

const FUEL_OPTIONS = ['Diesel', 'Gasolina', 'Híbrido', 'Eléctrico', 'GLP', 'GNC']

export default function VehicleCard({ vehicle, t, onReset, onUpdate }: Props) {
  const [editing, setEditing] = useState(!vehicle.brand) // auto-editar si datos vacíos
  const [draft, setDraft] = useState<Vehicle>(vehicle)

  function startEdit() {
    setDraft(vehicle)
    setEditing(true)
  }

  function cancel() {
    setDraft(vehicle)
    setEditing(false)
  }

  function save() {
    onUpdate(draft)
    setEditing(false)
  }

  function set(field: keyof Vehicle, value: string | number) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  if (editing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900">
              {!vehicle.brand ? (t.vehicle.fillData ?? 'Introduce los datos del vehículo') : t.vehicleInfo}
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={cancel} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md px-2 py-1">
              <X className="w-3 h-3" /> {t.vehicle.cancel ?? 'Cancelar'}
            </button>
            <button onClick={save} className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md px-2 py-1">
              <Check className="w-3 h-3" /> {t.vehicle.save ?? 'Guardar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Matrícula — no editable */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">{t.vehicle.plate}</p>
            <p className="font-bold text-gray-900 tracking-wider">{vehicle.plate}</p>
          </div>

          {/* Marca */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">{t.vehicle.brand}</p>
            <input
              className="w-full font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
              value={draft.brand}
              onChange={e => set('brand', e.target.value)}
            />
          </div>

          {/* Modelo */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">{t.vehicle.model}</p>
            <input
              className="w-full font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
              value={draft.model}
              onChange={e => set('model', e.target.value)}
            />
          </div>

          {/* Año */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">{t.vehicle.year}</p>
            </div>
            <input
              type="number"
              min={1960}
              max={2030}
              className="w-full font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
              value={draft.year}
              onChange={e => set('year', parseInt(e.target.value) || draft.year)}
            />
          </div>

          {/* Combustible */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Fuel className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">{t.vehicle.fuel}</p>
            </div>
            <select
              className="w-full font-semibold text-gray-900 bg-transparent focus:outline-none text-sm"
              value={draft.fuel}
              onChange={e => set('fuel', e.target.value)}
            >
              {FUEL_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          {/* Motor */}
          <div className="bg-white rounded-lg p-3 border border-blue-200 col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">{t.vehicle.engine}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                className="font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="1.9 TDI"
                value={draft.engine}
                onChange={e => set('engine', e.target.value)}
              />
              <input
                className="font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="1896cc"
                value={draft.displacement ?? ''}
                onChange={e => set('displacement', e.target.value)}
              />
              <input
                className="font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="110cv"
                value={draft.power ?? ''}
                onChange={e => set('power', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-blue-900">{t.vehicleInfo}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={startEdit} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
            <Pencil className="w-3 h-3" /> {t.vehicle.edit ?? 'Editar'}
          </button>
          <button onClick={onReset} className="text-xs text-gray-400 hover:text-gray-600 underline">
            {t.changePlate}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">{t.vehicle.plate}</p>
          <p className="font-bold text-gray-900 tracking-wider">{vehicle.plate}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">{t.vehicle.brand}</p>
          <p className="font-semibold text-gray-900">{vehicle.brand}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">{t.vehicle.model}</p>
          <p className="font-semibold text-gray-900">{vehicle.model}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{t.vehicle.year}</p>
          </div>
          <p className="font-semibold text-gray-900">{vehicle.year}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-1 mb-1">
            <Fuel className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{t.vehicle.fuel}</p>
          </div>
          <p className="font-semibold text-gray-900">{vehicle.fuel}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{t.vehicle.engine}</p>
          </div>
          <p className="font-semibold text-gray-900">
            {vehicle.engine}
            {vehicle.displacement && ` · ${vehicle.displacement}`}
            {vehicle.power && ` · ${vehicle.power}`}
          </p>
        </div>
      </div>
    </div>
  )
}
