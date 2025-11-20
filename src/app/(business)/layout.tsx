import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BusinessLayout({
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

  // Check if user is a business owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'business_owner') {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/business" className="text-xl font-bold">
                Business Panel
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/business/bookings" className="text-gray-700 hover:text-gray-900">
                Bookings
              </a>
              <a href="/business/orders" className="text-gray-700 hover:text-gray-900">
                Orders
              </a>
              <a href="/business/properties" className="text-gray-700 hover:text-gray-900">
                Properties
              </a>
              <a href="/business/hotels/manage" className="text-gray-700 hover:text-gray-900">
                Manage Images
              </a>
              <a href="/business/earnings" className="text-gray-700 hover:text-gray-900">
                Earnings
              </a>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

