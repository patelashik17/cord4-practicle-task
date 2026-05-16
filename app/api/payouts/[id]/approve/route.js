import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Payout from '@/models/Payout'
import PayoutAudit from '@/models/PayoutAudit'
import { requireRole } from '@/lib/auth'

export async function POST(request, { params }) {
  const { id } = await params   // ← await params first

  const user = requireRole(request, ['FINANCE'])
  if (!user) return NextResponse.json({ error: 'Only FINANCE can approve payouts' }, { status: 403 })

  await connectDB()

  const payout = await Payout.findById(id)
  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  if (payout.status !== 'Submitted') {
    return NextResponse.json(
      { error: `Cannot approve a payout with status "${payout.status}". Must be Submitted first.` },
      { status: 400 }
    )
  }

  payout.status = 'Approved'
  await payout.save()

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'APPROVED',
    performed_by: user.id,
  })

  return NextResponse.json({ payout })
}
