import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import Vendor from '@/models/Vendor'
import Link from 'next/link'

async function getStats() {
  await connectDB()
  const [total, draft, submitted, approved, rejected, vendorCount] = await Promise.all([
    Payout.countDocuments(),
    Payout.countDocuments({ status: 'Draft' }),
    Payout.countDocuments({ status: 'Submitted' }),
    Payout.countDocuments({ status: 'Approved' }),
    Payout.countDocuments({ status: 'Rejected' }),
    Vendor.countDocuments({ is_active: true }),
  ])
  return { total, draft, submitted, approved, rejected, vendorCount }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = verifyToken(token)
  const stats = await getStats()

  const cards = [
    { label: 'Total Payouts', value: stats.total, color: 'text-white' },
    { label: 'Draft', value: stats.draft, color: 'text-gray-400' },
    { label: 'Submitted', value: stats.submitted, color: 'text-yellow-400' },
    { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
    { label: 'Active Vendors', value: stats.vendorCount, color: 'text-indigo-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {user.role === 'OPS' && (
          <>
            <Link
              href="/dashboard/payouts/new"
              className="flex items-center gap-3 bg-indigo-600/10 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl p-5 transition group"
            >
              <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-600/30 transition">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Create Payout</p>
                <p className="text-gray-400 text-xs">New payout request</p>
              </div>
            </Link>
            <Link
              href="/dashboard/vendors/new"
              className="flex items-center gap-3 bg-[#1a1d27] border border-[#2a2d3a] hover:border-gray-600 rounded-xl p-5 transition group"
            >
              <div className="w-10 h-10 bg-[#0f1117] rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Add Vendor</p>
                <p className="text-gray-400 text-xs">Register a new vendor</p>
              </div>
            </Link>
          </>
        )}
        {user.role === 'FINANCE' && (
          <Link
            href="/dashboard/payouts?status=Submitted"
            className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500/60 rounded-xl p-5 transition col-span-2"
          >
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Pending Approvals</p>
              <p className="text-gray-400 text-xs">{stats.submitted} payouts awaiting review</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
