'use client'

/**
 * Users Management Page
 *
 * Manage user accounts, roles, and permissions.
 * Admin users can create, edit, and deactivate users.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  X,
} from 'lucide-react'

interface UserData {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'manager' | 'supervisor' | 'viewer'
  is_active: boolean
  last_sign_in?: string
  created_at: string
}

export default function UsersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'viewer' as 'admin' | 'manager' | 'supervisor' | 'viewer',
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

  const handleEditUser = (userData: UserData) => {
    setSelectedUser(userData)
    setFormData({
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      password: '',
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userData: UserData) => {
    if (!confirm(t('confirmDeleteUser'))) return

    try {
      // In production, this would also delete from auth
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

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

        setMessage({ type: 'success', text: t('userUpdated') })
      } else {
        // Create new user
        // First, create auth user
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

        // Then create user record
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
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Shield },
      manager: { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShieldCheck },
      supervisor: { bg: 'bg-green-100', text: 'text-green-700', icon: ShieldCheck },
      viewer: { bg: 'bg-gray-100', text: 'text-gray-700', icon: ShieldAlert },
    }
    return badges[role as keyof typeof badges] || badges.viewer
  }

  const getStatusBadge = (isActive: boolean) => ({
    bg: isActive ? 'bg-green-100' : 'bg-red-100',
    text: isActive ? 'text-green-700' : 'text-red-700',
  })

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
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userName')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userEmail')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userRole')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userStatus')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('userLastLogin')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('userActions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => {
                  const roleBadge = getRoleBadge(userData.role)
                  const statusBadge = getStatusBadge(userData.is_active)
                  const RoleIcon = roleBadge.icon

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
                            <div className="text-xs text-gray-500">
                              {userData.id === user?.id ? '(You)' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {userData.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          <RoleIcon className="w-3 h-3" />
                          {t(`role${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                          {userData.is_active ? t('statusActive') : t('statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {userData.last_sign_in
                          ? new Date(userData.last_sign_in).toLocaleDateString()
                          : 'Never'}
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

                          {userData.id !== user?.id && (
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('noUsersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Legend */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">{t('userPermissions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-blue-800">
            <div>
              <strong className="block">{t('roleAdmin')}</strong>
              <p className="mt-1 opacity-80">{t('canManageUsers')}, {t('canConfigureSettings')}</p>
            </div>
            <div>
              <strong className="block">{t('roleManager')}</strong>
              <p className="mt-1 opacity-80">{t('canEditAll')}, {t('canViewAll')}</p>
            </div>
            <div>
              <strong className="block">{t('roleSupervisor')}</strong>
              <p className="mt-1 opacity-80">{t('canViewAll')} (assigned locations)</p>
            </div>
            <div>
              <strong className="block">{t('roleViewer')}</strong>
              <p className="mt-1 opacity-80">{t('canViewAll')} (read-only)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
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
                  <option value="viewer">{t('roleViewer')}</option>
                  <option value="supervisor">{t('roleSupervisor')}</option>
                  <option value="manager">{t('roleManager')}</option>
                  <option value="admin">{t('roleAdmin')}</option>
                </select>
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
    </DashboardLayout>
  )
}
