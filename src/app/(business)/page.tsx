// src/app/(business)/dashboard/page.tsx
import { createServerComponentClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function BusinessDashboard() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Get business data
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    redirect('/business/setup');
  }

  // Get stats
  const { data: pendingBookings } = await supabase
    .from('hotel_bookings')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')
    .in('hotel_id', 
      supabase.from('hotels').select('id').eq('business_id', business.id)
    );

  const { data: pendingOrders } = await supabase
    .from('restaurant_orders')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')
    .in('restaurant_id', 
      supabase.from('restaurants').select('id').eq('business_id', business.id)
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{business.business_name} Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Pending Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{pendingBookings?.length || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingOrders?.length || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${business.total_revenue}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Rating</h3>
          <p className="text-3xl font-bold text-yellow-600">{business.rating}/5</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/business/bookings" className="block w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
              Manage Bookings
            </a>
            <a href="/business/orders" className="block w-full text-left p-3 bg-orange-50 rounded-lg hover:bg-orange-100">
              Manage Orders
            </a>
            <a href="/business/earnings" className="block w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100">
              View Earnings
            </a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
}