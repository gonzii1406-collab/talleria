import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Vehicle } from '@/lib/vehicle'
import { diagnose } from '@/lib/diagnose'

export const maxDuration = 300 // 5 min — Vercel Pro/Hobby allows up to 300s

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { faultCode: string; vehicle: Vehicle; locale?: string }

    if (!body.faultCode || !body.vehicle) {
      return NextResponse.json({ error: 'Missing faultCode or vehicle' }, { status: 400 })
    }

    const report = await diagnose(body.faultCode, body.vehicle, body.locale ?? 'es')
    return NextResponse.json(report)
  } catch (err: unknown) {
    console.error('Diagnose error:', err)
    return NextResponse.json({ error: 'DIAGNOSE_ERROR' }, { status: 500 })
  }
}
