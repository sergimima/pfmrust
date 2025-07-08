'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { 
  User, Edit3, Trophy, TrendingUp, Calendar, Hash, 
  Users, CheckCircle, Clock, Award, Target, Star 
} from 'lucide-react';
import GamificationDisplay from '@/components/gamification/GamificationDisplay';

interface UserProfile {
  wallet: string;
  displayName: string;
  bio: string;
  avatar: string;
  reputation: number;
  level: number;
  totalVotes: number;
  votesCreated: number;
  communitiesJoined: number;
  communitiesCreated: number;
  votingWeight: number;
  accuracy: number;
  streakDays: number;
  joinedDate: string;
  lastActive: string;
  achievements: string[];
  tier: 'Basic' | 'Premium' | 'VIP';
  nextLevelPoints: number;
  currentLevelPoints: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface ActivityItem {
  id: string;
  type: 'vote' | 'create_voting' | 'join_community' | 'create_community';
  title: string;
  description: string;
  timestamp: string;
  points: number;
}

// Mock data - replace with real API calls
const getMockProfile = (wallet: string): UserProfile => ({
  wallet: wallet.slice(0, 4) + '...' + wallet.slice(-4),
  displayName: 'Anonymous User',
  bio: 'Active participant in decentralized governance and community building.',
  avatar: '',
  reputation: 1245,
  level: 8,
  totalVotes: 89,
  votesCreated: 12,
  communitiesJoined: 7,
  communitiesCreated: 2,
  votingWeight: 2.4,
  accuracy: 87.3,
  streakDays: 15,
  joinedDate: '2024-01-15T00:00:00Z',
  lastActive: new Date().toISOString(),
  achievements: ['first_vote', 'community_builder', 'knowledge_seeker'],
  tier: 'Premium',
  nextLevelPoints: 1500,
  currentLevelPoints: 1245
});

const getMockAchievements = (): Achievement[] => [
  {
    id: 'first_vote',
    name: 'First Vote',
    description: 'Cast your first vote in a community',
    icon: '🗳️',
    earned: true,
    earnedDate: '2024-01-16T00:00:00Z'
  },
  {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Create your first community',
    icon: '🏗️',
    earned: true,
    earnedDate: '2024-02-01T00:00:00Z'
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Answer 10 knowledge questions correctly',
    icon: '🧠',
    earned: true,
    earnedDate: '2024-02-15T00:00:00Z'
  },
  {
    id: 'engagement_master',
    name: 'Engagement Master',
    description: 'Maintain a 30-day voting streak',
    icon: '🔥',
    earned: false
  },
  {
    id: 'wisdom_keeper',
    name: 'Wisdom Keeper',
    description: 'Reach 90% accuracy in knowledge votes',
    icon: '📚',
    earned: false
  },
  {
    id: 'governance_guru',
    name: 'Governance Guru',
    description: 'Create 25 successful votings',
    icon: '👑',
    earned: false
  }
];

const getMockRecentActivity = (): ActivityItem[] => [
  {
    id: '1',
    type: 'vote',
    title: 'Voted on fee structure proposal',
    description: 'DeFi Governance',
    timestamp: '2024-07-06T10:30:00Z',
    points: 1
  },
  {
    id: '2',
    type: 'create_voting',
    title: 'Created: Block time optimization',
    description: 'Technical Discussion',
    timestamp: '2024-07-05T15:45:00Z',
    points: 5
  },
  {
    id: '3',
    type: 'join_community',
    title: 'Joined Solana Developers',
    description: 'New community member',
    timestamp: '2024-07-04T09:15:00Z',
    points: 0
  }
];

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'gamification'>('overview');

  useEffect(() => {
    if (publicKey) {
      setTimeout(() => {
        setProfile(getMockProfile(publicKey.toString()));
        setAchievements(getMockAchievements());
        setRecentActivity(getMockRecentActivity());
        setLoading(false);
      }, 500);
    }
  }, [publicKey]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Premium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote': return '🗳️';
      case 'create_voting': return '✨';
      case 'join_community': return '🤝';
      case 'create_community': return '🏗️';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-600">Unable to load profile information.</p>
      </div>
    );
  }

  const progressPercentage = (profile.reputation / profile.nextLevelPoints) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(profile.tier)}`}>
                    {profile.tier}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{profile.bio}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {formatDate(profile.joinedDate)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Active {formatTimeAgo(profile.lastActive)}
                  </span>
                  <span className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    {profile.wallet}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Level Progress */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Level {profile.level}</span>
              </div>
              <span className="text-sm text-gray-600">
                {profile.reputation} / {profile.nextLevelPoints} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile.nextLevelPoints - profile.reputation} points to next level
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Reputation</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile.reputation}</p>
          <p className="text-sm text-gray-500">points earned</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Communities</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile.communitiesJoined}</p>
          <p className="text-sm text-gray-500">joined</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Votes Cast</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile.totalVotes}</p>
          <p className="text-sm text-gray-500">{profile.accuracy}% accuracy</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Voting Weight</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile.votingWeight}x</p>
          <p className="text-sm text-gray-500">multiplier</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: User },
              { id: 'achievements', name: 'Achievements', icon: Award },
              { id: 'activity', name: 'Activity', icon: Clock },
              { id: 'gamification', name: 'Gamification', icon: Trophy }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Participation Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Votes:</span>
                    <span className="font-medium">{profile.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votes Created:</span>
                    <span className="font-medium">{profile.votesCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communities Joined:</span>
                    <span className="font-medium">{profile.communitiesJoined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communities Created:</span>
                    <span className="font-medium">{profile.communitiesCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Streak:</span>
                    <span className="font-medium">{profile.streakDays} days</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy Rate:</span>
                    <span className="font-medium text-green-600">{profile.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voting Weight:</span>
                    <span className="font-medium text-purple-600">{profile.votingWeight}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reputation Rank:</span>
                    <span className="font-medium">Top 15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tier Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(profile.tier)}`}>
                      {profile.tier}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Link href="/user/voting/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Create Voting
                </Link>
                <Link href="/user/communities/explore" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Explore Communities
                </Link>
                <Link href="/user/communities/create" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Create Community
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-green-900' : 'text-gray-600'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Earned {formatDate(achievement.earnedDate)}
                        </p>
                      )}
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gamification' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Gamification & Achievements</h3>
            
            <GamificationDisplay 
              userId={publicKey?.toString()}
              userProfile={profile}
              userData={profile}
              compact={false}
              showAchievements={true}
              showProgress={true}
              showStreaks={true}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  {activity.points > 0 && (
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        +{activity.points} pts
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
                <p className="text-gray-600 mb-4">Start participating to see your activity here</p>
                <Link href="/user/communities/explore" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Explore Communities
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
