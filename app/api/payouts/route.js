import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { requireAuth } from '@/lib/auth'

export async function GET(request) {
  const user = requireAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const vendor_id = searchParams.get('vendor_id')

  const filter = {}
  if (status && status !== 'all') filter.status = status
  if (vendor_id && vendor_id !== 'all') filter.vendor_id = vendor_id

  const payouts = await Payout.find(filter)
    .populate('vendor_id', 'name upi_id')
    .populate('created_by', 'name email role')
    .sort({ createdAt: -1 })

  return NextResponse.json({ payouts })
}

export async function POST(request) {
  const user = requireAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (user.role !== 'OPS') {
    return NextResponse.json({ error: 'Only OPS can create payouts' }, { status: 403 })
  }

  const body = await request.json()
  const { vendor_id, amount, mode, note } = body

  if (!vendor_id) return NextResponse.json({ error: 'Vendor is required' }, { status: 400 })
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
  }
  if (!mode || !['UPI', 'IMPS', 'NEFT'].includes(mode)) {
    return NextResponse.json({ error: 'Mode must be UPI, IMPS or NEFT' }, { status: 400 })
  }

  await connectDB()

  const payout = await Payout.create({
    vendor_id,
    amount: Number(amount),
    mode,
    note: note?.trim() || '',
    status: 'Draft',
    created_by: user.id,
  })

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'CREATED',
    performed_by: user.id,
    note: '',
  })

  return NextResponse.json({ payout }, { status: 201 })
}
