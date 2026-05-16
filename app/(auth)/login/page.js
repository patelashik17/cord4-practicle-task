'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillCreds = (role) => {
    if (role === 'ops') setForm({ email: 'ops@demo.com', password: 'ops123' })
    else setForm({ email: 'finance@demo.com', password: 'fin123' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">PayoutMS</h1>
          <p className="text-gray-400 text-sm mt-1">Internal Payout Management System</p>
        </div>

        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@demo.com"
                required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2a2d3a]">
            <p className="text-xs text-gray-500 text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillCreds('ops')}
                className="text-xs bg-[#0f1117] border border-[#2a2d3a] hover:border-indigo-500/50 text-gray-400 hover:text-white rounded-lg py-2 px-3 transition"
              >
                <span className="text-indigo-400 font-medium">OPS</span> · ops@demo.com
              </button>
              <button
                onClick={() => fillCreds('finance')}
                className="text-xs bg-[#0f1117] border border-[#2a2d3a] hover:border-indigo-500/50 text-gray-400 hover:text-white rounded-lg py-2 px-3 transition"
              >
                <span className="text-emerald-400 font-medium">FINANCE</span> · finance@demo.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}