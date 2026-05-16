import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Vendor from '@/models/Vendor'
import { requireAuth } from '@/lib/auth'

export async function GET(request) {
  const user = requireAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const vendors = await Vendor.find().sort({ createdAt: -1 })
  return NextResponse.json({ vendors })
}

export async function POST(request) {
  const user = requireAuth(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // only OPS can create vendors
  if (user.role !== 'OPS') {
    return NextResponse.json({ error: 'Only OPS can create vendors' }, { status: 403 })
  }

  const body = await request.json()
  const { name, upi_id, bank_account, ifsc, is_active } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 })
  }

  await connectDB()

  const vendor = await Vendor.create({
    name: name.trim(),
    upi_id: upi_id?.trim() || '',
    bank_account: bank_account?.trim() || '',
    ifsc: ifsc?.trim() || '',
    is_active: is_active !== undefined ? is_active : true,
  })

  return NextResponse.json({ vendor }, { status: 201 })
}
