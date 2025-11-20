import Link from 'next/link'

export default function CustomerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/customer/hotels"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">🏨 Book a Hotel</h2>
          <p>Find and book hotels in Georgia</p>
        </Link>
        
        <Link
          href="/customer/restaurants"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">🍽️ Order Food</h2>
          <p>Order from local restaurants</p>
        </Link>
        
        <Link
          href="/customer/properties"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">🏠 Real Estate</h2>
          <p>Rent or buy properties</p>
        </Link>
        
        <Link
          href="/customer/bookings"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">📋 My Bookings</h2>
          <p>View your hotel reservations</p>
        </Link>
        
        <Link
          href="/customer/orders"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">🍕 My Orders</h2>
          <p>Track your food orders</p>
        </Link>
      </div>
    </div>
  )
}

