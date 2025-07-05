'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  type: 'vote' | 'join' | 'create' | 'level_up' | 'reward';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  community?: string;
}

export default function RecentActivity() {
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'vote',
      title: 'Voted on Fee Structure',
      description: 'Cast vote in DeFi Governance',
      timestamp: '2 hours ago',
      points: 3,
      community: 'DeFi Governance'
    },
    {
      id: '2',
      type: 'level_up',
      title: 'Level Up!',
      description: 'Reached Level 8',
      timestamp: '1 day ago',
      points: 50
    },
    {
      id: '3',
      type: 'join',
      title: 'Joined Community',
      description: 'Became member of Technical Discussion',
      timestamp: '2 days ago',
      community: 'Technical Discussion'
    },
    {
      id: '4',
      type: 'vote',
      title: 'Knowledge Question',
      description: 'Answered correctly (+4 bonus)',
      timestamp: '3 days ago',
      points: 5,
      community: 'Technical Discussion'
    },
    {
      id: '5',
      type: 'reward',
      title: 'Daily Reward',
      description: 'Claimed 0.002 SOL',
      timestamp: '3 days ago',
      points: 10
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote': return '🗳️';
      case 'join': return '🤝';
      case 'create': return '✨';
      case 'level_up': return '🆙';
      case 'reward': return '🎁';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'vote': return 'bg-blue-50 border-blue-200';
      case 'join': return 'bg-green-50 border-green-200';
      case 'create': return 'bg-purple-50 border-purple-200';
      case 'level_up': return 'bg-yellow-50 border-yellow-200';
      case 'reward': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-600">Your latest actions and achievements</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className={`p-4 border-l-4 ${index !== activities.length - 1 ? 'border-b border-gray-100' : ''} ${getActivityColor(activity.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="text-xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 text-sm">{activity.title}</h3>
                  {activity.points && (
                    <span className="text-green-600 text-sm font-medium">
                      +{activity.points} pts
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  {activity.community && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {activity.community}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
          <p className="text-gray-600">
            Start participating in communities to see your activity here
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total activities this week</span>
          <span className="font-medium text-gray-900">{activities.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Points earned this week</span>
          <span className="font-medium text-green-600">
            +{activities.reduce((sum, activity) => sum + (activity.points || 0), 0)} pts
          </span>
        </div>
      </div>
    </div>
  );
}