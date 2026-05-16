import './globals.css'

export const metadata = {
  title: 'Payout Management',
  description: 'Internal payout management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0f1117] text-[#e2e4ed] min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
