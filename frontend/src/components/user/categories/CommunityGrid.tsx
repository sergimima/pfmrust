'use client';

import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activeVotings: number;
  isJoined: boolean;
  tags: string[];
  lastActivity: string;
  admin: string;
}

interface CommunityGridProps {
  communities: Community[];
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  loading: boolean;
}

export default function CommunityGrid({ communities, onJoin, onLeave, loading }: CommunityGridProps) {
  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'technology': '💻',
      'finance': '💰',
      'gaming': '🎮',
      'art': '🎨',
      'education': '📚',
      'sports': '⚽',
      'music': '🎵',
      'science': '🔬',
      'politics': '🏛️',
      'general': '💬'
    };
    return emojiMap[category] || '🏘️';
  };

  const getActivityColor = (lastActivity: string) => {
    const now = new Date();
    const activityTime = new Date(lastActivity);
    const hoursDiff = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) return 'text-green-600';
    if (hoursDiff < 24) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <div
          key={community.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
        >
          {/* Community Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getCategoryEmoji(community.category)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{community.category}</p>
                </div>
              </div>
              
              {community.isJoined && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Joined
                </div>
              )}
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {community.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {community.tags.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{community.tags.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Community Stats */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">👥</span>
                <span className="text-gray-700">
                  {community.memberCount.toLocaleString()} members
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-600">🗳️</span>
                <span className="text-gray-700">
                  {community.activeVotings} active votings
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={`${getActivityColor(community.lastActivity)}`}>
                Last activity: {community.lastActivity}
              </span>
              <span className="text-gray-500">
                by {community.admin}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              {community.isJoined ? (
                <>
                  <Link
                    href={`/user/communities/${community.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    View Community
                  </Link>
                  <button
                    onClick={() => onLeave(community.id)}
                    disabled={loading}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Leave
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onJoin(community.id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join Community'}
                  </button>
                  <Link
                    href={`/user/communities/${community.id}`}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm text-center"
                  >
                    Preview
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hover Effect Indicator */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
      ))}
    </div>
  );
}