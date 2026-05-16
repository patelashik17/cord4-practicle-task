'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPayoutPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState([])
  const [form, setForm] = useState({ vendor_id: '', amount: '', mode: 'UPI', note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/vendors')
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors || []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create payout')
        return
      }
      router.push('/dashboard/payouts')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/payouts" className="text-gray-400 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Payout</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create a payout request</p>
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Vendor <span className="text-red-400">*</span>
            </label>
            <select
              value={form.vendor_id}
              onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
            >
              <option value="">Select a vendor...</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Amount (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="10000"
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Payment Mode <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {['UPI', 'IMPS', 'NEFT'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm({ ...form, mode })}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition ${
                    form.mode === mode
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-[#0f1117] border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Note (optional)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Add a note..."
              rows={3}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              {loading ? 'Creating...' : 'Create Payout'}
            </button>
            <Link
              href="/dashboard/payouts"
              className="px-4 py-2.5 bg-[#0f1117] border border-[#2a2d3a] hover:border-gray-600 text-gray-400 hover:text-white rounded-lg text-sm transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
