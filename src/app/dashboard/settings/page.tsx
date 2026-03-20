'use client'

/**
 * Settings Page
 *
 * System configuration and user preferences.
 * Allows admin to configure company settings, alert thresholds,
 * dashboard preferences, and notification settings.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Building,
  Mail,
  Phone,
  Globe,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface Settings {
  company_name: string
  company_logo?: string
  contact_email: string
  contact_phone: string
  date_format: string
  number_format: string
  currency: string
  timezone: string
  language: string
  low_stock_threshold: number
  high_food_cost_threshold: number
  cash_difference_threshold: number
  default_time_range: number
  enable_notifications: boolean
  notification_email: string
}

const DEFAULT_SETTINGS: Settings = {
  company_name: 'Corporate Food Service',
  contact_email: 'admin@company.com',
  contact_phone: '+595 21 123 456',
  date_format: 'DD/MM/YYYY',
  number_format: '1,234.56',
  currency: 'PYG',
  timezone: 'America/Asuncion',
  language: 'es',
  low_stock_threshold: 10,
  high_food_cost_threshold: 35,
  cash_difference_threshold: 50000,
  default_time_range: 7,
  enable_notifications: true,
  notification_email: 'alerts@company.com',
}

export default function SettingsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

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

      // Check if user is admin or manager
      if (profileData?.role !== 'admin' && profileData?.role !== 'manager') {
        router.push('/dashboard')
        return
      }

      // Load existing settings
      await loadSettings()

      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadSettings = async () => {
    // For now, using default settings
    // In production, load from database
    setSettings(DEFAULT_SETTINGS)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In production, save to database
      // const { error } = await supabase
      //   .from('settings')
      //   .upsert(settings)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(t('settingsError'))
      setTimeout(() => setSaveError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('settingsSubtitle')}</p>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t('settingsSaved')}</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{saveError}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">
              {saving ? 'Saving...' : t('saveSettings')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('companySettings')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('companyName')}
                </label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactEmail')}
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactPhone')}
                </label>
                <input
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('regionalSettings') || 'Regional Settings'}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dateFormat')}
                </label>
                <select
                  value={settings.date_format}
                  onChange={(e) => handleChange('date_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('numberFormat')}
                </label>
                <select
                  value={settings.number_format}
                  onChange={(e) => handleChange('number_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1,234.56">1,234.56</option>
                  <option value="1.234,56">1.234,56</option>
                  <option value="1234.56">1234.56</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currency')}
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PYG">PYG - Guaraní</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('timezone')}
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/Asuncion">America/Asuncion</option>
                  <option value="America/Ciudad_del_Este">America/Ciudad_del_Este</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('alertThresholds')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lowStockThreshold')} (%)
                </label>
                <input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => handleChange('low_stock_threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this percentage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('highFoodCostThreshold')} (%)
                </label>
                <input
                  type="number"
                  value={settings.high_food_cost_threshold}
                  onChange={(e) => handleChange('high_food_cost_threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when food cost exceeds this percentage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cashDifferenceThreshold')} (₲)
                </label>
                <input
                  type="number"
                  value={settings.cash_difference_threshold}
                  onChange={(e) => handleChange('cash_difference_threshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when cash difference exceeds this amount</p>
              </div>
            </div>
          </div>

          {/* Dashboard Preferences */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboardPreferences')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('defaultTimeRange')} (days)
                </label>
                <select
                  value={settings.default_time_range}
                  onChange={(e) => handleChange('default_time_range', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('enableNotifications')}</label>
                  <p className="text-xs text-gray-500">Receive alert notifications</p>
                </div>
                <button
                  onClick={() => handleChange('enable_notifications', !settings.enable_notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enable_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enable_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.enable_notifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('notificationEmail')}
                  </label>
                  <input
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => handleChange('notification_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
