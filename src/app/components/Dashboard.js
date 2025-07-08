'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import EditListingModal from './EditListingModal';
import Pagination from './Pagination';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  FunnelIcon as FilterIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ initialData }) {
  const [listings, setListings] = useState(initialData?.listings || []);
  const [pagination, setPagination] = useState({
    page: initialData?.page || 1,
    totalPages: initialData?.totalPages || 1,
    total: initialData?.total || 0
  });
  const [currentFilter, setCurrentFilter] = useState('all');
  const [editingListing, setEditingListing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { state, dispatch, addNotification } = useApp();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!state.isAuthenticated) {
      dispatch({ 
        type: 'SET_USER', 
        payload: { email: 'admin@dashboard.com', role: 'admin' } 
      });
    }
  }, [state.isAuthenticated, router, dispatch]);

  const fetchListings = async (page = 1, status = 'all') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings?page=${page}&limit=10&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data.listings);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        });
      } else {
        addNotification('Failed to fetch listings', 'error');
      }
    } catch (error) {
      addNotification('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/audit', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const logs = await response.json();
        setAuditLogs(logs);
      }
    } catch (error) {
      addNotification('Failed to fetch audit logs', 'error');
    }
  };

  const refreshAuditLogsIfVisible = async () => {
    if (showAuditLogs) {
      await fetchAuditLogs();
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/listings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: listingId,
          action: 'updateStatus',
          status: newStatus
        })
      });

      if (response.ok) {
        addNotification(`Listing ${newStatus} successfully!`, 'success');
        await fetchListings(pagination.page, currentFilter);
        await refreshAuditLogsIfVisible();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      addNotification('Network error', 'error');
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedListing) => {
    await fetchListings(pagination.page, currentFilter);
    await refreshAuditLogsIfVisible();
  };

  const handleFilterChange = (status) => {
    setCurrentFilter(status);
    fetchListings(1, status);
  };

  const handlePageChange = (page) => {
    fetchListings(page, currentFilter);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
    router.push('/login');
  };

  const handleToggleAuditLogs = async () => {
    const newShowState = !showAuditLogs;
    setShowAuditLogs(newShowState);
    
    if (newShowState) {
      await fetchAuditLogs();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        text: 'text-white',
        icon: ClockIcon
      },
      approved: {
        bg: 'bg-gradient-to-r from-green-400 to-emerald-600',
        text: 'text-white',
        icon: CheckCircleIcon
      },
      rejected: {
        bg: 'bg-gradient-to-r from-red-400 to-red-600',
        text: 'text-white',
        icon: XCircleIcon
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} shadow-sm`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const getStatsCards = () => {
    const stats = listings.reduce((acc, listing) => {
      acc[listing.status] = (acc[listing.status] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        title: 'Total Listings',
        value: pagination.total,
        icon: TruckIcon,
        color: 'from-blue-500 to-blue-600',
        change: '+12%'
      },
      {
        title: 'Pending Review',
        value: stats.pending || 0,
        icon: ClockIcon,
        color: 'from-yellow-500 to-orange-500',
        change: '+5%'
      },
      {
        title: 'Approved',
        value: stats.approved || 0,
        icon: CheckCircleIcon,
        color: 'from-green-500 to-emerald-600',
        change: '+18%'
      },
      {
        title: 'Rejected',
        value: stats.rejected || 0,
        icon: XCircleIcon,
        color: 'from-red-500 to-red-600',
        change: '-2%'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Car Rental Admin
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <UserIcon className="h-4 w-4 mr-1" />
                  Welcome back, {state.user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleAuditLogs}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>{showAuditLogs ? 'Hide' : 'Show'} Audit Logs</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <LogoutIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showAuditLogs && (
          <div className="mb-8 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Audit Trail
                </h3>
                <div className="text-sm text-purple-100">
                  {auditLogs.length} {auditLogs.length === 1 ? 'entry' : 'entries'}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="max-h-80 overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No audit logs available.</p>
                    <p className="text-sm text-gray-400 mt-1">Actions will appear here as they are performed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <EyeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Listing #{log.listingId}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-700">{log.action}</span>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {log.adminEmail}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FilterIcon className="h-6 w-6 mr-2 text-blue-600" />
                Listings Management
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Total: <span className="font-semibold text-blue-600">{pagination.total}</span> listings
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-4 py-2 text-sm font-medium text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="pending">🟡 Pending</option>
                <option value="approved">🟢 Approved</option>
                <option value="rejected">🔴 Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">Loading listings...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {listing.title}
                        </h3>
                        {getStatusBadge(listing.status)}
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{listing.description}</p>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">${listing.price}/day</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 text-red-500" />
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <UserIcon className="h-4 w-4 text-blue-500" />
                          <span>{listing.submittedBy}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 text-purple-500" />
                          <span>{format(new Date(listing.submittedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(listing.id, 'approved')}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(listing.id, 'rejected')}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(listing)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <EditListingModal
        listing={editingListing}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}