import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import PayoutActions from '@/components/PayoutActions'

async function getData(id) {
  await connectDB()
  const [payout, audits] = await Promise.all([
    Payout.findById(id)
      .populate('vendor_id', 'name upi_id bank_account ifsc')
      .populate('created_by', 'name email role')
      .lean(),
    PayoutAudit.find({ payout_id: id })
      .populate('performed_by', 'name email role')
      .sort({ createdAt: 1 })
      .lean(),
  ])
  return { payout, audits }
}

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const auditColors = {
  CREATED: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
  SUBMITTED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default async function PayoutDetailPage({ params }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = verifyToken(token)

  const { payout, audits } = await getData(id)
  if (!payout) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/payouts" className="text-gray-400 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Payout Detail</h1>
            <StatusBadge status={payout.status} />
          </div>
          <p className="text-gray-400 text-sm mt-0.5">ID: {payout._id.toString()}</p>
        </div>
      </div>

      {/* Main Info */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6 mb-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Vendor</p>
            <p className="text-white font-medium">{payout.vendor_id?.name || 'Deleted vendor'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-white font-mono font-bold text-xl">{formatAmount(payout.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Mode</p>
            <p className="text-white">{payout.mode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created by</p>
            <p className="text-white">{payout.created_by?.name} <span className="text-gray-500 text-xs">({payout.created_by?.role})</span></p>
          </div>
          {payout.note && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Note</p>
              <p className="text-gray-300">{payout.note}</p>
            </div>
          )}
          {payout.status === 'Rejected' && payout.decision_reason && (
            <div className="col-span-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400 mb-1 font-medium">Rejection Reason</p>
              <p className="text-red-300 text-sm">{payout.decision_reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Details */}
      {payout.vendor_id && (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-3">VENDOR DETAILS</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">UPI ID</p>
              <p className="text-gray-300">{payout.vendor_id.upi_id || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Bank Account</p>
              <p className="text-gray-300">{payout.vendor_id.bank_account || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">IFSC</p>
              <p className="text-gray-300">{payout.vendor_id.ifsc || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <PayoutActions payout={JSON.parse(JSON.stringify(payout))} userRole={user.role} />

      {/* Audit Trail */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 mt-4">
        <p className="text-xs font-medium text-gray-500 mb-4">AUDIT TRAIL</p>
        <div className="space-y-3">
          {audits.map((audit) => (
            <div key={audit._id.toString()} className="flex items-start gap-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border shrink-0 ${auditColors[audit.action] || ''}`}>
                {audit.action}
              </span>
              <div>
                <p className="text-sm text-gray-300">
                  by <span className="text-white font-medium">{audit.performed_by?.name}</span>
                  <span className="text-gray-500 text-xs ml-1">({audit.performed_by?.role})</span>
                </p>
                {audit.note && <p className="text-xs text-gray-500 mt-0.5">"{audit.note}"</p>}
                <p className="text-xs text-gray-600 mt-0.5">{formatDate(audit.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
