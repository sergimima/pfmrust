'use client';

import { useState } from 'react';
import { formatRelativeTime, capitalize } from '@/lib/utils';

interface Report {
  id: string;
  type: string;
  content: string;
  reporter: string;
  reported: string;
  status: string;
  priority: string;
  createdAt: string;
  moderator?: string;
  notes?: string;
}

interface ModerationPanelProps {
  reports: Report[];
  appeals: any[];
}

export default function ModerationPanel({ reports = [], appeals = [] }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'appeals' | 'logs'>('reports');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'spam': return '🗑️';
      case 'offensive': return '🚫';
      case 'harassment': return '⚠️';
      case 'misinformation': return '❌';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const pendingAppeals = appeals.filter(a => a.status === 'pending').length;

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status === 'pending';
    if (filter === 'reviewed') return report.status === 'reviewed' || report.status === 'resolved';
    return true;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderation Panel</h1>
        <p className="text-gray-600">Review reports, appeals, and manage community moderation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📋</div>
            <div>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-xl font-bold text-red-600">{pendingReports}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚖️</div>
            <div>
              <p className="text-sm text-gray-600">Pending Appeals</p>
              <p className="text-xl font-bold text-orange-600">{pendingAppeals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-xl font-bold text-green-600">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👨‍⚖️</div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-xl font-bold text-blue-600">2.3h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Reports ({pendingReports} pending)
            </button>
            <button
              onClick={() => setActiveTab('appeals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appeals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚖️ Appeals ({pendingAppeals} pending)
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📜 Moderation Logs
            </button>
          </nav>
        </div>

        {/* Reports Content */}
        {activeTab === 'reports' && (
          <>
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    filter === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({pendingReports})
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    filter === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <div className="text-2xl">{getReportIcon(report.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {capitalize(report.type)} Report
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getPriorityColor(report.priority)
                            }`}>
                              {capitalize(report.priority)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(report.status)
                            }`}>
                              {capitalize(report.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{report.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Reporter: {report.reporter}</span>
                            <span>•</span>
                            <span>Reported: {report.reported}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 text-sm">
                              ✅ Approve
                            </button>
                            <button className="text-red-600 hover:text-red-900 text-sm">
                              ❌ Dismiss
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-gray-900 text-sm">
                          👁️ Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500">No moderation reports to review at this time</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Other tabs placeholder */}
        {activeTab === 'appeals' && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appeals Panel</h3>
            <p className="text-gray-500">User appeals management coming soon</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Moderation Logs</h3>
            <p className="text-gray-500">Complete audit trail coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}