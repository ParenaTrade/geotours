import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CustomerLayout({
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

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/customer" className="text-xl font-bold">
                Georgia Tours
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/customer/hotels" className="text-gray-700 hover:text-gray-900">
                Hotels
              </a>
              <a href="/customer/restaurants" className="text-gray-700 hover:text-gray-900">
                Restaurants
              </a>
              <a href="/customer/properties" className="text-gray-700 hover:text-gray-900">
                Real Estate
              </a>
              <a href="/customer/bookings" className="text-gray-700 hover:text-gray-900">
                My Bookings
              </a>
              <a href="/customer/orders" className="text-gray-700 hover:text-gray-900">
                My Orders
              </a>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}

