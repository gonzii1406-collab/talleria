'use client'

import { Printer } from 'lucide-react'
import { Vehicle } from '@/lib/vehicle'
import { DiagnosticReport } from '@/lib/diagnose'

interface Props {
  vehicle: Vehicle
  report: DiagnosticReport
}

export default function PrintReport({ vehicle, report }: Props) {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Botón visible solo en pantalla */}
      <button
        onClick={handlePrint}
        className="no-print w-full py-3 rounded-xl border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Imprimir / Guardar PDF
      </button>

      {/* Contenido solo visible al imprimir */}
      <div className="print-only hidden">
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ borderBottom: '2px solid #1d4ed8', paddingBottom: '12px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>ECUnex — Informe de Diagnóstico</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Datos vehículo */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 8px' }}>Datos del Vehículo</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '13px' }}>
              <div><span style={{ color: '#6b7280' }}>Matrícula:</span> <strong>{vehicle.plate}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Marca:</span> <strong>{vehicle.brand}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Modelo:</span> <strong>{vehicle.model}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Año:</span> <strong>{vehicle.year}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Motor:</span> <strong>{vehicle.engine}</strong></div>
              <div><span style={{ color: '#6b7280' }}>Combustible:</span> <strong>{vehicle.fuel}</strong></div>
            </div>
          </div>

          {/* Código y descripción */}
          <div style={{ background: '#111827', color: 'white', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>{report.faultCode}</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: report.severity === 'high' ? '#dc2626' : report.severity === 'medium' ? '#d97706' : '#16a34a', color: 'white' }}>
                {report.severity === 'high' ? 'Alta' : report.severity === 'medium' ? 'Moderada' : 'Leve'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#d1d5db', margin: 0 }}>{report.description}</p>
          </div>

          {/* Secciones */}
          {[
            { title: 'Causas más probables', items: report.causes },
            { title: 'Soluciones paso a paso', items: report.solutions },
            { title: 'Piezas afectadas', items: report.parts },
          ].map(({ title, items }) => (
            <div key={title} style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>{title}</h3>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                {items.map((item, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>{item}</li>
                ))}
              </ol>
            </div>
          ))}

          {/* Pruebas a realizar */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>Pruebas a realizar</h3>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              {report.tests.map((test, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                  {typeof test === 'string' ? test : test.procedure}
                </li>
              ))}
            </ol>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '8px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
            Generado por ECUnex · Diagnóstico asistido por IA · Verificar siempre con equipos de taller
          </div>
        </div>
      </div>
    </>
  )
}
