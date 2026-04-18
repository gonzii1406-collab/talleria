import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

    const PRICE_IDS: Record<string, string> = {
      Starter: process.env.STRIPE_PRICE_STARTER!,
      Pro:     process.env.STRIPE_PRICE_PRO!,
      Taller:  process.env.STRIPE_PRICE_TALLER!,
    }

    const { plan } = await req.json()
    const priceId = PRICE_IDS[plan]

    if (!priceId) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL}/?canceled=1`,
      locale: 'es',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
