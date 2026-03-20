/**
 * Debug Page - Supabase Connection Test
 *
 * This page tests the Supabase connection and displays the result
 */

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DebugPage() {
  let connectionStatus = 'unknown'
  let errorMessage = ''
  let countriesCount = 0
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
  let hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    // Test connection
    const supabase = createClient()

    // Test with a simpler query first
    const { data, error, status, statusText } = await supabase
      .from('countries')
      .select('id')
      .limit(1)

    if (error) {
      connectionStatus = 'error'
      errorMessage = `${error.message} (Status: ${status}, ${statusText})`
      console.error('Supabase error:', error)
    } else {
      connectionStatus = 'success'
      const { count } = await supabase
        .from('countries')
        .select('*', { count: 'exact', head: true })
      countriesCount = count || 0
    }

  } catch (e: any) {
    connectionStatus = 'error'
    errorMessage = `${e?.message || 'Unknown error'} - ${e?.stack?.split('\n')[0] || ''}`
    console.error('Connection error:', e)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Supabase Connection Debug</h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Connection Status</h2>
            <div className="flex items-center gap-3">
              {connectionStatus === 'success' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-600 font-medium">Connected successfully!</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-red-600 font-medium">Connection failed</span>
                </>
              )}
              {connectionStatus === 'unknown' && (
                <>
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">Unknown status</span>
                </>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-mono text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Supabase URL:</span>
                <p className="text-xs font-mono mt-1 break-all">{supabaseUrl}</p>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Anon Key Present:</span>
                <span className="text-sm font-mono">
                  {hasAnonKey ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Database Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Countries in database</span>
                <span className="text-sm font-medium">{countriesCount}</span>
              </div>
              {countriesCount > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-800">
                    ✅ Sample data loaded! Database is ready.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
            {connectionStatus === 'success' && countriesCount === 0 && (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Apply database schema from DATA_MODEL.md</li>
                <li>• Run migration scripts in Supabase SQL Editor</li>
                <li>• Insert seed data for testing</li>
              </ul>
            )}
            {connectionStatus === 'error' && (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check .env.local has correct credentials</li>
                <li>• Verify Supabase project is active</li>
                <li>• Check API keys in Supabase dashboard</li>
              </ul>
            )}
            {connectionStatus === 'success' && countriesCount > 0 && (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ✅ Database is set up!</li>
                <li>• Continue with authentication setup</li>
                <li>• Build the dashboard layout</li>
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
            {connectionStatus === 'success' && (
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Open Supabase Dashboard
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
