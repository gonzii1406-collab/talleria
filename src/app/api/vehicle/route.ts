import { NextRequest, NextResponse } from 'next/server'
import { lookupVehicle } from '@/lib/vehicle'

export async function GET(req: NextRequest) {
  const plate = req.nextUrl.searchParams.get('plate')

  if (!plate) {
    return NextResponse.json({ error: 'Missing plate' }, { status: 400 })
  }

  try {
    const vehicle = await lookupVehicle(plate)
    return NextResponse.json(vehicle)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message === 'INVALID_PLATE') {
      return NextResponse.json({ error: 'INVALID_PLATE' }, { status: 400 })
    }
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }
}
