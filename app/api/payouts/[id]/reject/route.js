import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { requireRole } from '@/lib/auth'

export async function POST(request, { params }) {
  const { id } = await params   // ← await params first

  const user = requireRole(request, ['FINANCE'])
  if (!user) return NextResponse.json({ error: 'Only FINANCE can reject payouts' }, { status: 403 })

  const body = await request.json()
  const { reason } = body

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 })
  }

  await connectDB()

  const payout = await Payout.findById(id)
  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  if (payout.status !== 'Submitted') {
    return NextResponse.json(
      { error: `Cannot reject a payout with status "${payout.status}". Must be Submitted first.` },
      { status: 400 }
    )
  }

  payout.status = 'Rejected'
  payout.decision_reason = reason.trim()
  await payout.save()

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'REJECTED',
    performed_by: user.id,
    note: reason.trim(),
  })

  return NextResponse.json({ payout })
}
