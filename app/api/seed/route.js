import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Vendor from '@/models/Vendor'

export async function POST() {
  await connectDB()

  // clear existing
  await User.deleteMany({})
  await Vendor.deleteMany({})

  await User.create([
    { email: 'ops@demo.com', password: 'ops123', role: 'OPS', name: 'Ops User' },
    { email: 'finance@demo.com', password: 'fin123', role: 'FINANCE', name: 'Finance User' },
  ])

  await Vendor.create([
    { name: 'Acme Corp', upi_id: 'acme@upi', bank_account: '1234567890', ifsc: 'HDFC0001234', is_active: true },
    { name: 'BuildIt Pvt Ltd', upi_id: 'buildit@okaxis', bank_account: '9876543210', ifsc: 'ICIC0005678', is_active: true },
    { name: 'CloudSync Tech', upi_id: '', bank_account: '1122334455', ifsc: 'SBIN0009999', is_active: true },
  ])

  return NextResponse.json({ message: 'Seed completed successfully' })
}
