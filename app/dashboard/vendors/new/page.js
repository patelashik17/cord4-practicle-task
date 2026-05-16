'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewVendorPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', upi_id: '', bank_account: '', ifsc: '', is_active: true })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create vendor')
        return
      }
      router.push('/dashboard/vendors')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/vendors" className="text-gray-400 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Vendor</h1>
          <p className="text-gray-400 text-sm mt-0.5">Register a new vendor</p>
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
              Vendor Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              UPI ID <span className="text-red-400">*</span>

            </label>
            <input
              value={form.upi_id}
              onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              placeholder="vendor@upi"
              required
              pattern="^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Bank Account <span className="text-red-400">*</span>
              </label>
              <input
                value={form.bank_account}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_account: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="1234567890"
                required
                minLength={9}
                maxLength={18}
                pattern="[0-9]{9,18}"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <input
                value={form.ifsc}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ifsc: e.target.value.toUpperCase(),
                  })
                }
                placeholder="HDFC0001234"
                required
                maxLength={11}
                pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-[#0f1117] text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-300">Active vendor</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
            <Link
              href="/dashboard/vendors"
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
