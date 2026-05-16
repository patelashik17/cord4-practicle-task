'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PayoutActions({ payout, userRole }) {
  const router = useRouter()
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const canSubmit = userRole === 'OPS' && payout.status === 'Draft'
  const canApprove = userRole === 'FINANCE' && payout.status === 'Submitted'
  const canReject = userRole === 'FINANCE' && payout.status === 'Submitted'

  if (!canSubmit && !canApprove && !canReject) return null

  const doAction = async (action) => {
    setError('')
    setLoading(action)

    const url = `/api/payouts/${payout._id}/${action}`
    const body = action === 'reject' ? { reason: rejectReason } : {}

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Action failed')
        return
      }
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <p className="text-xs font-medium text-gray-500 mb-4">ACTIONS</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {canSubmit && (
        <button
          onClick={() => doAction('submit')}
          disabled={loading === 'submit'}
          className="w-full bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-60"
        >
          {loading === 'submit' ? 'Submitting...' : 'Submit for Approval'}
        </button>
      )}

      {(canApprove || canReject) && (
        <div className="space-y-3">
          {canApprove && (
            <button
              onClick={() => doAction('approve')}
              disabled={!!loading}
              className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-60"
            >
              {loading === 'approve' ? 'Approving...' : '✓ Approve Payout'}
            </button>
          )}

          {canReject && !showRejectForm && (
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={!!loading}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-60"
            >
              ✕ Reject Payout
            </button>
          )}

          {showRejectForm && (
            <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
              <label className="block text-sm font-medium text-red-400 mb-2">
                Rejection reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                className="w-full bg-[#0f1117] border border-red-500/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-sm resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => doAction('reject')}
                  disabled={!rejectReason.trim() || !!loading}
                  className="flex-1 bg-red-600/80 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition text-sm"
                >
                  {loading === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-[#2a2d3a] hover:border-gray-600 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
