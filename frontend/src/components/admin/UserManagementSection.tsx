'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface User {
  id: string
  username: string
  email: string
  phone_number: string
  full_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
  subscription_status: string
  subscription_plan: string | null
}

export default function UserManagementSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  
  const { success, error, toasts, removeToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.request('/users/admin/list/')
      
      if (response.success) {
        setUsers(response.data)
      } else {
        console.error('Failed to fetch users:', response.message)
        setUsers([])
        error('Failed to Load Users', response.message || 'Unable to fetch user data')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
      error('Connection Error', 'Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm)
    
    const matchesRole = 
      roleFilter === 'all' || 
      (roleFilter === 'admin' && (user.is_staff || user.is_superuser)) ||
      (roleFilter === 'user' && !user.is_staff && !user.is_superuser)
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    console.log('Toggle user status clicked:', userId, currentStatus)
    const user = users.find(u => u.id === userId)
    const action = currentStatus ? 'deactivate' : 'activate'
    const userName = user?.full_name || user?.username || 'this user'
    
    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      const actionKey = `status-${userId}`
      try {
        setLoadingActions(prev => ({ ...prev, [actionKey]: true }))
        const response = await apiService.request(`/users/admin/${userId}/toggle-status/`, {
          method: 'POST',
          body: JSON.stringify({ is_active: !currentStatus })
        })
        
        if (response.success) {
          setUsers(users.map(user => 
            user.id === userId ? { ...user, is_active: !currentStatus } : user
          ))
          success(
            `User ${action === 'activate' ? 'Activated' : 'Deactivated'}`,
            `${userName} has been successfully ${action}d.`
          )
        } else {
          error('Action Failed', response.message || `Failed to ${action} user`)
        }
      } catch (err) {
        console.error(`Failed to ${action} user:`, err)
        error('Action Failed', `Failed to ${action} user. Please try again.`)
      } finally {
        setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
      }
    }
  }

  const handleToggleAdminRole = async (userId: string, currentIsStaff: boolean) => {
    console.log('Toggle admin role clicked:', userId, currentIsStaff)
    const user = users.find(u => u.id === userId)
    const action = currentIsStaff ? 'remove admin privileges from' : 'grant admin privileges to'
    const userName = user?.full_name || user?.username || 'this user'
    
    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      const actionKey = `admin-${userId}`
      try {
        setLoadingActions(prev => ({ ...prev, [actionKey]: true }))
        const response = await apiService.request(`/users/admin/${userId}/toggle-admin/`, {
          method: 'POST',
          body: JSON.stringify({ is_staff: !currentIsStaff })
        })
        
        if (response.success) {
          setUsers(users.map(user => 
            user.id === userId ? { ...user, is_staff: !currentIsStaff } : user
          ))
          success(
            `Admin Role ${currentIsStaff ? 'Removed' : 'Granted'}`,
            `${userName} ${currentIsStaff ? 'no longer has' : 'now has'} admin privileges.`
          )
        } else {
          error('Action Failed', response.message || 'Failed to update admin role')
        }
      } catch (err) {
        console.error('Failed to update admin role:', err)
        error('Action Failed', 'Failed to update admin role. Please try again.')
      } finally {
        setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    console.log('Delete user clicked:', userId)
    const user = users.find(u => u.id === userId)
    const userName = user?.full_name || user?.username || 'this user'
    
    if (window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      const actionKey = `delete-${userId}`
      try {
        setLoadingActions(prev => ({ ...prev, [actionKey]: true }))
        const response = await apiService.request(`/users/admin/${userId}/delete/`, {
          method: 'DELETE'
        })
        
        if (response.success) {
          setUsers(users.filter(user => user.id !== userId))
          success(
            'User Deleted',
            `${userName} has been permanently deleted.`
          )
        } else {
          error('Delete Failed', response.message || 'Failed to delete user')
        }
      } catch (err) {
        console.error('Failed to delete user:', err)
        error('Delete Failed', 'Failed to delete user. Please try again.')
      } finally {
        setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserRole = (user: User) => {
    if (user.is_superuser) return 'Super Admin'
    if (user.is_staff) return 'Admin'
    return 'User'
  }

  const getRoleBadge = (user: User) => {
    const role = getUserRole(user)
    const colors = {
      'Super Admin': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-blue-100 text-blue-800',
      'User': 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UsersIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <button 
            onClick={() => console.log('Test button clicked!')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Click
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-600 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.is_staff || u.is_superuser).length}
              </p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Regular Users</p>
              <p className="text-2xl font-bold text-gray-600">
                {users.filter(u => !u.is_staff && !u.is_superuser).length}
              </p>
            </div>
            <UserIcon className="h-8 w-8 text-gray-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Edit User"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          disabled={loadingActions[`status-${user.id}`]}
                          className={`${user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {loadingActions[`status-${user.id}`] ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : user.is_active ? (
                            <XCircleIcon className="h-4 w-4" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleAdminRole(user.id, user.is_staff)}
                          disabled={loadingActions[`admin-${user.id}`]}
                          className={`${user.is_staff ? 'text-purple-600' : 'text-gray-400'} hover:text-purple-900 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={user.is_staff ? 'Remove Admin' : 'Make Admin'}
                        >
                          {loadingActions[`admin-${user.id}`] ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShieldCheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loadingActions[`delete-${user.id}`]}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          {loadingActions[`delete-${user.id}`] ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}