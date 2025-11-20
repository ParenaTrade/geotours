import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/admin" className="text-xl font-bold">
                Admin Panel
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/users" className="text-gray-700 hover:text-gray-900">
                Users
              </a>
              <a href="/admin/businesses" className="text-gray-700 hover:text-gray-900">
                Businesses
              </a>
              <a href="/admin/disputes" className="text-gray-700 hover:text-gray-900">
                Disputes
              </a>
              <a href="/admin/payouts" className="text-gray-700 hover:text-gray-900">
                Payouts
              </a>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

