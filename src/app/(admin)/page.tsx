'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    pendingVerifications: 0,
    openDisputes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // In a real app, these would come from API endpoints
    setStats({
      totalUsers: 0,
      totalBusinesses: 0,
      pendingVerifications: 0,
      openDisputes: 0,
    })
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Businesses</h3>
          <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Verifications</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingVerifications}
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Open Disputes</h3>
          <p className="text-3xl font-bold text-red-600">{stats.openDisputes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/admin/users"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Users</h2>
          <p>View and manage user accounts</p>
        </a>
        <a
          href="/admin/businesses"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Businesses</h2>
          <p>Verify and manage business accounts</p>
        </a>
        <a
          href="/admin/disputes"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Resolve Disputes</h2>
          <p>Handle customer-business disputes</p>
        </a>
        <a
          href="/admin/payouts"
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Process Payouts</h2>
          <p>Approve and process business payouts</p>
        </a>
      </div>
    </div>
  )
}

