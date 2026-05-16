import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { requireRole } from '@/lib/auth'

export async function POST(request, { params }) {
  const { id } = await params   // ← await params first
  
  const user = requireRole(request, ['OPS'])
  if (!user) return NextResponse.json({ error: 'Only OPS can submit payouts' }, { status: 403 })

  await connectDB()

  const payout = await Payout.findById(id)   // ← use id, not params.id
  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  if (payout.status !== 'Draft') {
    return NextResponse.json(
      { error: `Cannot submit a payout that is already ${payout.status}` },
      { status: 400 }
    )
  }

  payout.status = 'Submitted'
  await payout.save()

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'SUBMITTED',
    performed_by: user.id,
  })

  return NextResponse.json({ payout })
}