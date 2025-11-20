'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function DownloadPage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'android' | 'ios'>('android')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQRCode()
  }, [platform])

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/app-download/qr?platform=${platform}`)
      const data = await response.json()
      setQrCode(data.qr_code)
      setDownloadUrl(data.download_url)
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Download Georgia Tours App
        </h1>

        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                platform === 'android'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                platform === 'ios'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              iOS
            </button>
          </div>
        </div>

        {qrCode && (
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="mt-4 text-gray-600">
              Scan the QR code with your {platform === 'android' ? 'Android' : 'iOS'} device
            </p>
          </div>
        )}

        {downloadUrl && (
          <div className="text-center">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download Direct Link
            </a>
          </div>
        )}
      </div>
    </div>
  )
}



