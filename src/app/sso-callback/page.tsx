'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <Suspense fallback={<Loader2 className="w-8 h-8 text-blue-400 animate-spin" />}>
        <AuthenticateWithRedirectCallback />
      </Suspense>
    </div>
  )
}
