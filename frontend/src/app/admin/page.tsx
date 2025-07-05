'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { StatsCard, ActivityFeed, QuickActions } from '@/components/admin/DashboardComponents';
import Link from 'next/link';

interface DashboardStats {
  totalCommunities: number;
  totalUsers: number;
  totalVotes: number;
  activeVotes: number;
  totalFees: number;
  dailyActiveUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock activities - replace with real API data
  const recentActivities = [
    {
      id: '1',
      type: 'community' as const,
      message: 'New community created: "DeFi Governance"',
      timestamp: '2 minutes ago',
      user: 'alice.sol'
    },
    {
      id: '2',
      type: 'vote' as const,
      message: 'Vote completed: "Protocol Upgrade"',
      timestamp: '15 minutes ago',
      user: 'bob.sol'
    },
    {
      id: '3',
      type: 'user' as const,
      message: 'User reached level 5: charlie.sol',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'system' as const,
      message: 'Daily reward distribution completed',
      timestamp: '2 hours ago'
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Manage Communities',
      icon: '🏛️',
      href: '/admin/communities',
      description: 'View and edit communities'
    },
    {
      id: '2',
      title: 'Moderation Panel',
      icon: '⚖️',
      href: '/admin/moderation',
      description: 'Review reports and appeals'
    },
    {
      id: '3',
      title: 'Admin Tools',
      icon: '🛠️',
      href: '/admin/tools',
      description: 'User management, fees, system config'
    },
    {
      id: '4',
      title: 'Analytics Dashboard',
      icon: '📈',
      href: '/admin/analytics',
      description: 'View detailed metrics and stats'
    },
    {
      id: '5',
      title: 'User Management',
      icon: '👥',
      href: '/admin/tools?tab=users',
      description: 'Ban/unban users, assign moderators'
    },
    {
      id: '6',
      title: 'Fee Management',
      icon: '💰',
      href: '/admin/tools?tab=fees',
      description: 'Withdraw fees, distribute rewards'
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getStats();
        
        // Mock data for now - replace with real API response
        setStats({
          totalCommunities: 15,
          totalUsers: 1250,
          totalVotes: 342,
          activeVotes: 23,
          totalFees: 125000,
          dailyActiveUsers: 156,
        });
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">❌ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your Solana Voting System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Communities"
          value={stats?.totalCommunities || 0}
          icon="🏛️"
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatsCard
          title="Active Votes"
          value={stats?.activeVotes || 0}
          icon="🗳️"
          color="purple"
        />
        
        <StatsCard
          title="Total Votes"
          value={stats?.totalVotes || 0}
          icon="📊"
          color="blue"
        />
        
        <StatsCard
          title="Daily Active Users"
          value={stats?.dailyActiveUsers || 0}
          icon="📈"
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        
        <StatsCard
          title="Total Fees (lamports)"
          value={stats?.totalFees || 0}
          icon="💰"
          color="yellow"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{action.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={recentActivities} />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Health</span>
              <span className="font-medium text-green-600">98.2% ✅</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Validators</span>
              <span className="font-medium text-blue-600">1/1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Update</span>
              <span className="font-medium text-gray-600">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}