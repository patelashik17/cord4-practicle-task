import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) redirect('/login')

  const user = verifyToken(token)
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 ml-56 p-8 bg-[#0f1117]">
        {children}
      </main>
    </div>
  )
}
