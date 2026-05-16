'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const statuses = ['all', 'Draft', 'Submitted', 'Approved', 'Rejected']

export default function PayoutFilters({ vendors }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentStatus = searchParams.get('status') || 'all'
  const currentVendor = searchParams.get('vendor_id') || 'all'

  const update = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    startTransition(() => router.push(`/dashboard/payouts?${params.toString()}`))
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => update('status', s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              currentStatus === s
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <select
        value={currentVendor}
        onChange={(e) => update('vendor_id', e.target.value)}
        className="bg-[#1a1d27] border border-[#2a2d3a] text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition"
      >
        <option value="all">All Vendors</option>
        {vendors.map((v) => (
          <option key={v._id.toString()} value={v._id.toString()}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  )
}
