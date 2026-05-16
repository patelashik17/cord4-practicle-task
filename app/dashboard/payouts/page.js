import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import Vendor from '@/models/Vendor'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import Link from 'next/link'
import PayoutFilters from '@/components/PayoutFilters'
import StatusBadge from '@/components/StatusBadge'

async function getData(searchParams) {
  await connectDB()

  const filter = {}
  if (searchParams.status && searchParams.status !== 'all') filter.status = searchParams.status
  if (searchParams.vendor_id && searchParams.vendor_id !== 'all') filter.vendor_id = searchParams.vendor_id

  const [payouts, vendors] = await Promise.all([
    Payout.find(filter)
      .populate('vendor_id', 'name')
      .populate('created_by', 'name role')
      .sort({ createdAt: -1 })
      .lean(),
    Vendor.find({ is_active: true }).select('name').lean(),
  ])

  return { payouts, vendors }
}

export default async function PayoutsPage({ searchParams }) {
  const params = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = verifyToken(token)

  const { payouts, vendors } = await getData(params)

  const formatAmount = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Payouts</h1>
          <p className="text-gray-400 text-sm mt-1">{payouts.length} results</p>
        </div>
        {user.role === 'OPS' && (
          <Link
            href="/dashboard/payouts/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Payout
          </Link>
        )}
      </div>

      <PayoutFilters vendors={vendors} />

      {payouts.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-12 text-center mt-4">
          <p className="text-gray-400">No payouts found</p>
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Vendor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Mode</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Created by</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr
                  key={p._id.toString()}
                  className={`${i !== payouts.length - 1 ? 'border-b border-[#2a2d3a]' : ''} hover:bg-[#1f2235] transition`}
                >
                  <td className="px-5 py-4 text-sm font-medium text-white">
                    {p.vendor_id?.name || 'Deleted vendor'}
                  </td>
                  <td className="px-5 py-4 text-sm text-white font-mono">
                    {formatAmount(p.amount)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{p.mode}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{p.created_by?.name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/payouts/${p._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
