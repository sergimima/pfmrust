'use client';

import { formatNumber } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export function StatsCard({ title, value, icon, trend, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-3xl mr-4">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses[color]}`}>
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↗️' : '↘️'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: 'community' | 'vote' | 'user' | 'system';
    message: string;
    timestamp: string;
    user?: string;
  }>;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'community': return '🏛️';
      case 'vote': return '🗳️';
      case 'user': return '👤';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'community': return 'bg-blue-500';
      case 'vote': return 'bg-green-500';
      case 'user': return 'bg-purple-500';
      case 'system': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getActivityIcon(activity.type)}</span>
                  <p className="text-sm text-gray-900">{activity.message}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  {activity.user && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  actions: Array<{
    id: string;
    title: string;
    icon: string;
    href: string;
    description?: string;
  }>;
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {action.title}
              </span>
              {action.description && (
                <span className="text-xs text-gray-500 text-center mt-1">
                  {action.description}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}