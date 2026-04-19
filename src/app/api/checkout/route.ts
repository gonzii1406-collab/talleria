import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

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
      customer_email: email,
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_URL}/?success=1`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL}/?canceled=1`,
      locale: 'es',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
