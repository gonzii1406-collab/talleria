'use client'

import { useState } from 'react'
// Use legacy API for custom flows (Clerk v7 signal API lacks authenticateWithRedirect)
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy'
import { X, Mail, Lock, Loader2, Eye, EyeOff, Cpu } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
  defaultMode?: 'signin' | 'signup'
}

export default function AuthModal({ onClose, onSuccess, defaultMode = 'signup' }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  const { signIn, isLoaded: signInLoaded, setActive: setActiveSignIn } = useSignIn()
  const { signUp, isLoaded: signUpLoaded, setActive: setActiveSignUp } = useSignUp()

  async function handleGoogleAuth() {
    if (!signInLoaded || !signUpLoaded) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'signin') {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/',
        })
      } else {
        await signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/',
        })
      }
    } catch {
      setError('Error con Google. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signInLoaded || !signUpLoaded) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'signin') {
        const result = await signIn.create({ identifier: email, password })
        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId })
          onSuccess()
          onClose()
        }
      } else {
        await signUp.create({ emailAddress: email, password })
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr?.errors?.[0]?.message || 'Error al iniciar sesión. Comprueba tus datos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!signUpLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId })
        onSuccess()
        onClose()
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr?.errors?.[0]?.message || 'Código incorrecto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/8">
          <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ECU<span className="text-cyan-400">nex</span></span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {verifying ? 'Verifica tu email' : mode === 'signin' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {verifying ? 'Introduce el código que te hemos enviado' : mode === 'signin' ? 'Accede a tu cuenta ECUnex' : 'Diagnóstico IA para tu taller'}
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">
          {verifying ? (
            /* Verification form */
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Código de verificación</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">{error}</p>}
              <button type="submit" disabled={loading || code.length < 6} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar y entrar'}
              </button>
            </form>
          ) : (
            <>
              {/* Google button */}
              <button onClick={handleGoogleAuth} disabled={loading} className="w-full py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 border border-gray-200 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-600 text-xs">o con email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="taller@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-all"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">{error}</p>}

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 mt-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  {mode === 'signin' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
