'use client';

import { useState, useMemo } from 'react';
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

interface ApiCommunity {
  id: number;
  name: string;
  description: string;
  authority: string;
  category: string;
  isActive: boolean;
  totalMembers: number;
  totalVotes: number;
  feesCollected: number;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { memberships: number; votes: number };
}

interface MyCommunitiesProps {
  apiData?: ApiCommunity[];
  loading?: boolean;
}

export default function MyCommunities({ apiData, loading }: MyCommunitiesProps) {
  // Mock data como fallback
  const [mockCommunities] = useState<Community[]>([
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

  // Transformar datos de API a formato local
  const transformedCommunities = useMemo(() => {
    if (!apiData) return mockCommunities;

    return apiData.map((community): Community => ({
      id: community.id.toString(),
      name: community.name,
      category: community.category || 'General',
      memberCount: community.totalMembers || community._count?.memberships || 0,
      activeVotings: community.totalVotes || community._count?.votes || 0,
      userRole: 'Member', // TODO: determinar rol real del usuario
      unreadNotifications: Math.floor(Math.random() * 3), // Simulado por ahora
      lastActivity: formatLastActivity(community.updatedAt)
    }));
  }, [apiData, mockCommunities]);

  // Función para formatear última actividad
  const formatLastActivity = (updatedAt: string): string => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'FINANCE': '💰',
      'Finance': '💰',
      'TECHNOLOGY': '💻',
      'Technology': '💻',
      'GOVERNANCE': '🏛️',
      'Governance': '🏛️',
      'SOCIAL': '👥',
      'Social': '👥',
      'General': '🌟'
    };
    return icons[category] || '🌟';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Moderator': return 'bg-purple-100 text-purple-800';
      case 'Member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Communities</h2>
          <p className="text-sm text-gray-600">Loading communities...</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Communities</h2>
            <p className="text-sm text-gray-600">
              Manage your community memberships
              {apiData && (
                <span className="ml-2 text-green-600">• {apiData.length} from API</span>
              )}
            </p>
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
        {transformedCommunities.map((community) => (
          <div key={community.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getCategoryIcon(community.category)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{community.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(community.userRole)}`}>
                      {community.userRole}
                    </span>
                    {community.unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {community.unreadNotifications}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👥 {community.memberCount.toLocaleString()} members</span>
                    <span>🗳️ {community.activeVotings} active voting{community.activeVotings !== 1 ? 's' : ''}</span>
                    <span>⏰ {community.lastActivity}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/user/communities/${community.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transformedCommunities.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">🏘️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
          <p className="text-gray-600 mb-4">
            {apiData ? 
              "No communities found from API" : 
              "Join your first community to start participating in governance"
            }
          </p>
          <div className="flex justify-center space-x-3">
            <Link
              href="/user/communities/explore"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/user/communities/create"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Create Community
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}