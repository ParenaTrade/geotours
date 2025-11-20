'use client'

import { useEffect, useState } from 'react'

export default function BusinessDashboard() {
  const [stats, setStats] = useState({
    pendingBookings: 0,
    pendingOrders: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch('/api/business/hotels/bookings?status=pending'),
        fetch('/api/business/restaurants/orders?status=pending'),
      ])

      const bookings = await bookingsRes.json()
      const orders = await ordersRes.json()

      setStats({
        pendingBookings: bookings.length || 0,
        pendingOrders: orders.length || 0,
        totalEarnings: 0, // Calculate from earnings API
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Business Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Bookings</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingBookings}
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">
            ${stats.totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/business/bookings"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Bookings</h2>
          <p>View and manage hotel reservations</p>
        </a>
        <a
          href="/business/orders"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Orders</h2>
          <p>View and manage restaurant orders</p>
        </a>
      </div>
    </div>
  )
}

