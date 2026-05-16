import connectDB from '@/lib/db'
import Vendor from '@/models/Vendor'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import Link from 'next/link'

async function getVendors() {
  await connectDB()
  return Vendor.find().sort({ createdAt: -1 }).lean()
}

export default async function VendorsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  const user = verifyToken(token)
  const vendors = await getVendors()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-gray-400 text-sm mt-1">{vendors.length} vendors registered</p>
        </div>
        {user.role === 'OPS' && (
          <Link
            href="/dashboard/vendors/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Vendor
          </Link>
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-12 text-center">
          <p className="text-gray-400">No vendors yet</p>
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">UPI ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Bank Account</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">IFSC</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, i) => (
                <tr
                  key={vendor._id.toString()}
                  className={`${i !== vendors.length - 1 ? 'border-b border-[#2a2d3a]' : ''}`}
                >
                  <td className="px-5 py-4 text-sm font-medium text-white">{vendor.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{vendor.upi_id || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{vendor.bank_account || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{vendor.ifsc || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      vendor.is_active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </span>
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
