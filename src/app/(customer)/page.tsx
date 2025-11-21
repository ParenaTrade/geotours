// src/app/(customer)/page.tsx
import { createServerComponentClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { BookingCard } from '@/components/booking/booking-card';
import { OrderCard } from '@/components/order/order-card';

export default async function CustomerDashboard() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Get recent bookings and orders
  const { data: bookings } = await supabase
    .from('hotel_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: orders } = await supabase
    .from('restaurant_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back!</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          {bookings?.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
          {!bookings?.length && (
            <p className="text-gray-500">No recent bookings</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {orders?.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
          {!orders?.length && (
            <p className="text-gray-500">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}