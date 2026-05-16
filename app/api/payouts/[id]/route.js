import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { requireAuth } from '@/lib/auth'

export async function GET(request, { params }) {
  const user = requireAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const payout = await Payout.findById(params.id)
    .populate('vendor_id', 'name upi_id bank_account ifsc')
    .populate('created_by', 'name email role')

  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  const audits = await PayoutAudit.find({ payout_id: payout._id })
    .populate('performed_by', 'name email role')
    .sort({ createdAt: 1 })

  return NextResponse.json({ payout, audits })
}
