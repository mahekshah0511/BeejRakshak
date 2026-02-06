import { useState } from 'react'
import { supabase, setLocalSession } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mobileOnly = (v) => v.replace(/\D/g, '').slice(0, 10)

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (mobile.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }

    setLoading(true)
    const { data, error: err } = await supabase
      .from('farmers')
      .insert({ name: name.trim(), mobile })
      .select()
      .single()
    setLoading(false)

    if (err) {
      if (err.code === '23505') {
        setError('This mobile number is already registered. Try signing in.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      return
    }

    setLocalSession(data)
    onLogin()
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (mobile.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }

    setLoading(true)
    const { data, error: err } = await supabase
      .from('farmers')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle()
    setLoading(false)

    if (err) { setError('Something went wrong. Please try again.'); return }
    if (!data) { setError('No account found with this number. Please sign up first.'); return }

    setLocalSession(data)
    onLogin()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
            BeejRakshak
          </h1>
          <p className="mt-2 text-emerald-100 text-sm font-medium">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/95 backdrop-blur shadow-agri-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-stone-50/80"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-700">Mobile number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(mobileOnly(e.target.value))}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-stone-50/80"
                  autoComplete="tel"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all"
              >
                {loading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => { setIsSignUp((s) => !s); setError('') }}
                className="w-full py-2.5 text-sm text-stone-500 hover:text-emerald-600 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-emerald-100/90 text-xs">
          AgriTech for farmers
        </p>
      </div>
    </div>
  )
}
