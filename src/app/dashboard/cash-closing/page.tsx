'use client'

/**
 * Cash & Closing Module
 *
 * Critical operations module for tracking daily cash closings,
 * differences, and cash control issues.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CheckCircle, AlertCircle, Clock, DollarSign, Wallet, CreditCard, XCircle } from 'lucide-react'

interface CashClosingData {
  id: string
  date: string
  expected_cash: number
  expected_bancard: number
  expected_upay: number
  expected_total: number
  actual_cash: number
  actual_bancard: number
  actual_upay: number
  actual_total: number
  cash_difference: number
  bancard_difference: number
  upay_difference: number
  total_difference: number
  petty_cash_rendered: number
  closing_status: 'pending' | 'closed_correctly' | 'with_difference' | 'under_review'
  closed_at: string | null
  closed_by: string | null
  observation: string | null
  requires_review: boolean
  locations: {
    name: string
  }
}

export default function CashClosingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allCashClosings, setAllCashClosings] = useState<CashClosingData[]>([])

  // Check auth and load data
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      await loadCashClosingData()
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadCashClosingData = async (startDate?: string, endDate?: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const today = new Date()

    const start = startDate || sevenDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('cash_closings')
      .select(`
        id,
        date,
        expected_cash,
        expected_bancard,
        expected_upay,
        expected_total,
        actual_cash,
        actual_bancard,
        actual_upay,
        actual_total,
        cash_difference,
        bancard_difference,
        upay_difference,
        total_difference,
        petty_cash_rendered,
        closing_status,
        closed_at,
        closed_by,
        observation,
        requires_review,
        locations(name)
      `)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
      .order('closed_at', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllCashClosings(queryResult.data as CashClosingData[])
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadCashClosingData(startDate, endDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Calculate KPIs
  const totalClosings = allCashClosings.length
  const closedCorrectly = allCashClosings.filter(c => c.closing_status === 'closed_correctly').length
  const withDifference = allCashClosings.filter(c => c.closing_status === 'with_difference').length
  const pendingReview = allCashClosings.filter(c => c.closing_status === 'under_review' || c.requires_review).length

  const totalCashDifference = allCashClosings.reduce((sum, c) => sum + c.cash_difference, 0)
  const totalBancardDifference = allCashClosings.reduce((sum, c) => sum + c.bancard_difference, 0)
  const totalUpayDifference = allCashClosings.reduce((sum, c) => sum + c.upay_difference, 0)
  const totalDifference = allCashClosings.reduce((sum, c) => sum + c.total_difference, 0)
  const totalPettyCash = allCashClosings.reduce((sum, c) => sum + (c.petty_cash_rendered || 0), 0)

  // Get cash difference by location
  const cashDifferenceByLocation = useMemo(() => {
    const locationData: Record<string, {
      closings: number
      cashDifference: number
      bancardDifference: number
      upayDifference: number
      totalDifference: number
      pettyCash: number
    }> = {}

    allCashClosings.forEach((closing) => {
      const location = closing.locations?.name || 'Unknown'
      if (!locationData[location]) {
        locationData[location] = {
          closings: 0,
          cashDifference: 0,
          bancardDifference: 0,
          upayDifference: 0,
          totalDifference: 0,
          pettyCash: 0,
        }
      }
      locationData[location].closings += 1
      locationData[location].cashDifference += closing.cash_difference
      locationData[location].bancardDifference += closing.bancard_difference
      locationData[location].upayDifference += closing.upay_difference
      locationData[location].totalDifference += closing.total_difference
      locationData[location].pettyCash += closing.petty_cash_rendered || 0
    })

    return Object.entries(locationData)
      .map(([location, data]) => ({
        location,
        ...data,
      }))
      .sort((a, b) => b.totalDifference - a.totalDifference)
  }, [allCashClosings])

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'closed_correctly':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {t('closedCorrectly')}
          </span>
        )
      case 'with_difference':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <AlertCircle className="w-3 h-3" />
            {t('withDifference')}
          </span>
        )
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            <Clock className="w-3 h-3" />
            {t('underReview')}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            <Clock className="w-3 h-3" />
            {t('pending')}
          </span>
        )
    }
  }

  // Format difference with color
  const formatDifference = (value: number) => {
    const formatted = Math.round(value).toLocaleString()
    if (value > 0) {
      return <span className="text-green-600 font-medium">+₲{formatted}</span>
    } else if (value < 0) {
      return <span className="text-red-600 font-medium">-₲{Math.abs(value).toLocaleString()}</span>
    }
    return <span className="text-gray-600">₲{formatted}</span>
  }

  if (loading) {
    return (
      <DashboardLayout titleKey="loading" subtitleKey="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cash closing data...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Date Filter */}
          <div className="mb-8">
            <DateRangeFilter onDateChange={handleDateChange} />
          </div>

          {/* KPIs - Closing Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('closingStatus')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title={t('totalClosings')}
                value={totalClosings}
                icon={CheckCircle}
                tooltip={t('totalClosingsTooltip')}
              />
              <KPICard
                title={t('closedCorrectly')}
                value={closedCorrectly}
                icon={CheckCircle}
                status="good"
                tooltip={t('closedCorrectlyTooltip')}
              />
              <KPICard
                title={t('withDifference')}
                value={withDifference}
                icon={AlertCircle}
                status={withDifference > 0 ? 'problem' : 'good'}
                tooltip={t('withDifferenceTooltip')}
              />
              <KPICard
                title={t('pendingReview')}
                value={pendingReview}
                icon={Clock}
                status={pendingReview > 0 ? 'attention' : 'good'}
                tooltip={t('pendingReviewTooltip')}
              />
            </div>
          </div>

          {/* KPIs - Cash Differences */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cashDifferences')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title={t('cashDifference')}
                value={Math.abs(totalCashDifference)}
                icon={Wallet}
                prefix="₲"
                status={totalCashDifference !== 0 ? 'problem' : 'good'}
                tooltip={t('cashDifferenceTooltip')}
              />
              <KPICard
                title={t('bancardDifference')}
                value={Math.abs(totalBancardDifference)}
                icon={CreditCard}
                prefix="₲"
                status={totalBancardDifference !== 0 ? 'problem' : 'good'}
                tooltip={t('bancardDifferenceTooltip')}
              />
              <KPICard
                title={t('upayDifference')}
                value={Math.abs(totalUpayDifference)}
                icon={CreditCard}
                prefix="₲"
                status={totalUpayDifference !== 0 ? 'problem' : 'good'}
                tooltip={t('upayDifferenceTooltip')}
              />
              <KPICard
                title={t('totalDifference')}
                value={Math.abs(totalDifference)}
                icon={DollarSign}
                prefix="₲"
                status={totalDifference !== 0 ? 'problem' : 'good'}
                tooltip={t('totalDifferenceTooltip')}
              />
            </div>
          </div>

          {/* Petty Cash */}
          <div className="mb-8">
            <KPICard
              title={t('totalPettyCash')}
              value={totalPettyCash}
              icon={Wallet}
              prefix="₲"
              tooltip={t('totalPettyCashTooltip')}
            />
          </div>

          {/* Cash Closings Table */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('cashClosingsDetail')}</h2>
                <span className="text-sm text-gray-500">
                  {allCashClosings.length} {allCashClosings.length === 1 ? t('closing') : t('closings')}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('location')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('expected')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actual')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('cashDiff')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allCashClosings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {t('noCashClosings')}
                      </td>
                    </tr>
                  ) : (
                    allCashClosings.map((closing) => (
                      <tr key={closing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {closing.locations?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{closing.date}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ₲{Math.round(closing.expected_total).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          ₲{Math.round(closing.actual_total).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatDifference(closing.total_difference)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(closing.closing_status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Difference by Location */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('cashDifferenceByLocation')}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('location')}</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('closings')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('cashDiff')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('bancardDiff')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('upayDiff')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('totalDiff')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashDifferenceByLocation.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {t('noDataAvailable')}
                        </td>
                      </tr>
                    ) : (
                      cashDifferenceByLocation.map((item) => (
                        <tr key={item.location} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.location}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{item.closings}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatDifference(item.cashDifference)}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatDifference(item.bancardDifference)}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatDifference(item.upayDifference)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{formatDifference(item.totalDifference)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
