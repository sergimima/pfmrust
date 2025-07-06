'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  activeVotings: number;
  userRole: 'Member' | 'Moderator' | 'Admin';
  unreadNotifications: number;
  lastActivity: string;
}

export default function MyCommunities() {
  const [communities] = useState<Community[]>([
    {
      id: '1',
      name: 'DeFi Governance',
      category: 'Finance',
      memberCount: 1245,
      activeVotings: 3,
      userRole: 'Member',
      unreadNotifications: 2,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Technical Discussion',
      category: 'Technology',
      memberCount: 567,
      activeVotings: 1,
      userRole: 'Moderator',
      unreadNotifications: 0,
      lastActivity: '5 hours ago'
    },
    {
      id: '3',
      name: 'Community Events',
      category: 'General',
      memberCount: 2341,
      activeVotings: 2,
      userRole: 'Member',
      unreadNotifications: 1,
      lastActivity: '1 day ago'
    }
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Moderator': return 'bg-blue-100 text-blue-800';
      case 'Member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Finance': return '💰';
      case 'Technology': return '💻';
      case 'Gaming': return '🎮';
      case 'Art': return '🎨';
      case 'Education': return '📚';
      case 'General': return '💬';
      default: return '🏘️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Communities</h2>
            <p className="text-sm text-gray-600">Communities you're part of</p>
          </div>
          <Link
            href="/user/communities"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {communities.map((community) => (
          <div key={community.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getCategoryEmoji(community.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{community.name}</h3>
                    {community.unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {community.unreadNotifications}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{community.memberCount} members</span>
                    <span>{community.activeVotings} active votings</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(community.userRole)}`}>
                      {community.userRole}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Last activity: {community.lastActivity}
                  </div>
                </div>
              </div>
              <Link
                href={`/user/communities/${community.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🏘️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
          <p className="text-gray-600 mb-4">
            Join communities to participate in governance and earn reputation
          </p>
          <Link
            href="/user/communities"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {communities.length} communities joined
          </div>
          <div className="flex space-x-2">
            <Link
              href="/user/communities/create"
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
              + Create Community
            </Link>
            <Link
              href="/user/communities"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              🔍 Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}