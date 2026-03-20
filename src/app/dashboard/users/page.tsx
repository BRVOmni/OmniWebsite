'use client'

/**
 * Users Management Page with Granular Permissions
 *
 * Admin-only page for managing users and their permissions.
 * Supports 4 roles: Admin, Branch Manager, Supervisor, Viewer
 * Each role has configurable permissions for pages, locations, and brands.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUserPermissions, updateUserPermissions, canManageUsers } from '@/lib/utils/permissions'
import {
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  MapPin,
  Building,
  FileText,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface UserData {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'branch_manager' | 'supervisor' | 'viewer'
  is_active: boolean
  last_sign_in?: string
  created_at: string
}

interface UserPermissions {
  can_view_executive_summary: boolean
  can_view_sales: boolean
  can_view_profitability: boolean
  can_view_cash_closing: boolean
  can_view_locations: boolean
  can_view_products: boolean
  can_view_brands: boolean
  can_view_alerts: boolean
  can_view_supervision: boolean
  can_view_purchases: boolean
  can_view_payments: boolean
  location_access: string[]
  brand_access: string[]
}

interface LocationData {
  id: string
  name: string
  cities?: { name: string } | null
}

interface BrandData {
  id: string
  name: string
}

const MODULES = [
  { key: 'can_view_executive_summary', label: 'Executive Summary', icon: '📊' },
  { key: 'can_view_sales', label: 'Sales Analytics', icon: '📈' },
  { key: 'can_view_profitability', label: 'Profitability', icon: '💰' },
  { key: 'can_view_cash_closing', label: 'Cash & Closing', icon: '💵' },
  { key: 'can_view_locations', label: 'Locations', icon: '📍' },
  { key: 'can_view_products', label: 'Products', icon: '📦' },
  { key: 'can_view_brands', label: 'Brands', icon: '🏢' },
  { key: 'can_view_alerts', label: 'Alerts', icon: '⚠️' },
  { key: 'can_view_supervision', label: 'Supervision', icon: '📋' },
  { key: 'can_view_purchases', label: 'Purchases', icon: '🛒' },
  { key: 'can_view_payments', label: 'Payments', icon: '💳' },
]

export default function UsersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [brands, setBrands] = useState<BrandData[]>([])
  const [userPermissions, setUserPermissions] = useState<Map<string, UserPermissions>>(new Map())

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<UserPermissions | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'viewer' as 'admin' | 'branch_manager' | 'supervisor' | 'viewer',
    password: '',
  })

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

      // Check if user is admin
      if (profileData?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      await loadUsers()
      await loadLocations()
      await loadBrands()
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading users:', error)
      return
    }

    setUsers(data as UserData[])

    // Load permissions for each user
    const permissionsMap = new Map<string, UserPermissions>()
    for (const userData of data) {
      const permissions = await getUserPermissions(userData.id)
      permissionsMap.set(userData.id, permissions)
    }
    setUserPermissions(permissionsMap)
  }

  const loadLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setLocations(data as LocationData[])
  }

  const loadBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name')

    setBrands(data as BrandData[])
  }

  const handleAddUser = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'viewer',
      password: '',
    })
    setShowAddModal(true)
  }

  const handleEditUser = async (userData: UserData) => {
    setSelectedUser(userData)
    setFormData({
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      password: '',
    })

    // Load user's permissions
    const permissions = userPermissions.get(userData.id)
    if (permissions) {
      setSelectedUserPermissions({
        ...permissions,
        location_access: permissions.location_access || [],
        brand_access: permissions.brand_access || [],
      })
    }

    setShowEditModal(true)
  }

  const handleConfigurePermissions = async (userData: UserData) => {
    setSelectedUser(userData)

    const permissions = userPermissions.get(userData.id)
    if (permissions) {
      setSelectedUserPermissions({
        ...permissions,
        location_access: permissions.location_access || [],
        brand_access: permissions.brand_access || [],
      })
    }

    setShowPermissionsModal(true)
  }

  const handleDeleteUser = async (userData: UserData) => {
    if (!confirm(t('confirmDeleteUser'))) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id)

      if (error) throw error

      setMessage({ type: 'success', text: t('userDeleted') })
      await loadUsers()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting user' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleToggleActive = async (userData: UserData) => {
    if (!confirm(userData.is_active ? t('confirmDeactivateUser') : `Activate ${userData.full_name}?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !userData.is_active })
        .eq('id', userData.id)

      if (error) throw error

      await loadUsers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating user status' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedUser || !selectedUserPermissions) return

    setSaving(true)
    setMessage(null)

    try {
      const result = await updateUserPermissions(selectedUser.id, selectedUserPermissions)

      if (result.success) {
        setMessage({ type: 'success', text: 'Permissions updated successfully' })
        setShowPermissionsModal(false)
        await loadUsers()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error updating permissions' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating permissions' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (showEditModal && selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq('id', selectedUser.id)

        if (error) throw error

        // Create permissions for new role
        await updateUserPermissions(selectedUser.id, {
          can_view_supervision: formData.role === 'supervisor',
          can_view_executive_summary: formData.role !== 'supervisor',
          can_view_sales: formData.role === 'admin' || formData.role === 'branch_manager' || formData.role === 'viewer',
          can_view_profitability: formData.role === 'admin' || formData.role === 'branch_manager',
          can_view_cash_closing: formData.role === 'admin' || formData.role === 'branch_manager',
          can_view_locations: formData.role === 'admin' || formData.role === 'branch_manager' || formData.role === 'viewer',
          can_view_products: formData.role === 'admin',
          can_view_brands: formData.role === 'admin' || formData.role === 'branch_manager' || formData.role === 'viewer',
          can_view_alerts: formData.role === 'admin' || formData.role === 'branch_manager' || formData.role === 'viewer',
          can_view_purchases: formData.role === 'admin',
          can_view_payments: formData.role === 'admin' || formData.role === 'branch_manager',
        })

        setMessage({ type: 'success', text: t('userUpdated') })
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
            },
          },
        })

        if (authError) throw authError

        // Create user record
        const { error } = await supabase
          .from('users')
          .insert({
            id: authData.user?.id,
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            is_active: true,
          })

        if (error) throw error

        setMessage({ type: 'success', text: t('userCreated') })
      }

      setShowAddModal(false)
      setShowEditModal(false)
      setSelectedUser(null)
      await loadUsers()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error saving user' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
      branch_manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Branch Manager' },
      supervisor: { bg: 'bg-green-100', text: 'text-green-700', label: 'Supervisor' },
      viewer: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Viewer' },
    }
    return badges[role as keyof typeof badges] || badges.viewer
  }

  const getStatusBadge = (isActive: boolean) => ({
    bg: isActive ? 'bg-green-100' : 'bg-red-100',
    text: isActive ? 'text-green-700' : 'text-red-700',
  })

  const getRoleDescription = (role: string) => {
    const descriptions = {
      admin: 'Full system access, can manage users',
      branch_manager: 'Read-only for assigned locations, configurable pages',
      supervisor: 'Configurable pages, location-based access',
      viewer: 'Read-only with granular controls',
    }
    return descriptions[role as keyof typeof descriptions] || ''
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
            <h1 className="text-2xl font-bold text-gray-900">{t('users')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('usersSubtitle')}</p>
          </div>

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">{t('addUser')}</span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => {
                  const roleBadge = getRoleBadge(userData.role)
                  const statusBadge = getStatusBadge(userData.is_active)
                  const permissions = userPermissions.get(userData.id)

                  return (
                    <tr key={userData.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userData.full_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {userData.email}
                              {userData.id === user?.id && <span className="ml-1">(You)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {roleBadge.label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{getRoleDescription(userData.role)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleConfigurePermissions(userData)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          Configure
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          {userData.is_active ? t('statusActive') : t('statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(userData)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title={t('editUser')}
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(userData)}
                            className={`p-1 hover:bg-gray-100 rounded-lg transition-colors ${
                              userData.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                            }`}
                            title={userData.is_active ? t('deactivateUser') : t('activateUser')}
                          >
                            {userData.is_active ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>

                          {userData.id !== user?.id && userData.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(userData)}
                              className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                              title={t('deleteUser')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('noUsersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Admin</h4>
            </div>
            <p className="text-sm text-purple-800">Full access to everything. Can manage users and settings.</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Branch Manager</h4>
            </div>
            <p className="text-sm text-blue-800">Read-only for assigned locations. Can configure which pages they see.</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-green-900">Supervisor</h4>
            </div>
            <p className="text-sm text-green-800">Configurable page access. Works with specific locations.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Viewer</h4>
            </div>
            <p className="text-sm text-gray-800">Read-only for investors. Granular control over what they can see.</p>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {showEditModal ? t('editUser') : t('createUser')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userEmail')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={showEditModal}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userRole')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer - Read-only investors</option>
                  <option value="supervisor">Supervisor - Field operations</option>
                  <option value="branch_manager">Branch Manager - Location read-only</option>
                  <option value="admin">Admin - Full access</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{getRoleDescription(formData.role)}</p>
              </div>

              {!showEditModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Configuration Modal */}
      {showPermissionsModal && selectedUser && selectedUserPermissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configure Permissions</h2>
                <p className="text-sm text-gray-500">{selectedUser.full_name} ({getRoleBadge(selectedUser.role).label})</p>
              </div>
              <button
                onClick={() => {
                  setShowPermissionsModal(false)
                  setSelectedUser(null)
                  setSelectedUserPermissions(null)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Page Access */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Page Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {MODULES.map((module) => (
                    <label key={module.key} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserPermissions[module.key as keyof UserPermissions] || false}
                        onChange={(e) => setSelectedUserPermissions({
                          ...selectedUserPermissions,
                          [module.key]: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">{module.icon} {module.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Access */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Access
                </h3>
                <p className="text-xs text-gray-500 mb-2">Leave empty for access to all locations</p>
                <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {locations.map((location) => (
                    <label key={location.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserPermissions.location_access.includes(location.id)}
                        onChange={(e) => {
                          const newAccess = e.target.checked
                            ? [...selectedUserPermissions.location_access, location.id]
                            : selectedUserPermissions.location_access.filter(id => id !== location.id)
                          setSelectedUserPermissions({
                            ...selectedUserPermissions,
                            location_access: newAccess
                          })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{location.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Access */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Brand Access
                </h3>
                <p className="text-xs text-gray-500 mb-2">Leave empty for access to all brands</p>
                <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserPermissions.brand_access.includes(brand.id)}
                        onChange={(e) => {
                          const newAccess = e.target.checked
                            ? [...selectedUserPermissions.brand_access, brand.id]
                            : selectedUserPermissions.brand_access.filter(id => id !== brand.id)
                          setSelectedUserPermissions({
                            ...selectedUserPermissions,
                            brand_access: newAccess
                          })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false)
                    setSelectedUser(null)
                    setSelectedUserPermissions(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
