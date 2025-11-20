import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Georgia Tours Super App
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link
            href="/customer"
            className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-2">Customer</h2>
            <p>Book hotels, order food, and more</p>
          </Link>
          <Link
            href="/business"
            className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-2">Business</h2>
            <p>Manage your business operations</p>
          </Link>
          <Link
            href="/admin"
            className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-2">Admin</h2>
            <p>Platform administration</p>
          </Link>
        </div>
      </div>
    </main>
  )
}



