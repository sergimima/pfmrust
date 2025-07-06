'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import ParticipationOverview from '@/components/user/ParticipationOverview';
import ActiveVotings from '@/components/user/ActiveVotings';
import MyCommunities from '@/components/user/MyCommunities';
import UserStats from '@/components/user/UserStats';
import RecentActivity from '@/components/user/RecentActivity';

interface UserProfile {
  wallet: string;
  reputation: number;
  level: number;
  totalVotes: number;
  communitiesJoined: number;
  votingWeight: number;
  lastActive: string;
}

export default function UserDashboard() {
  const { publicKey } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user data - replace with real API calls
  useEffect(() => {
    if (publicKey) {
      setTimeout(() => {
        setUserProfile({
          wallet: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
          reputation: 1245,
          level: 8,
          totalVotes: 89,
          communitiesJoined: 7,
          votingWeight: 2.4,
          lastActive: new Date().toISOString(),
        });
        setLoading(false);
      }, 1000);
    }
  }, [publicKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
              <p className="text-blue-100 mt-1">
                Ready to participate in community governance?
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{userProfile?.reputation}</div>
              <div className="text-blue-200 text-sm">Reputation Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {userProfile && <UserStats profile={userProfile} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Participation */}
        <div className="lg:col-span-2 space-y-6">
          <ParticipationOverview />
          <ActiveVotings />
        </div>

        {/* Right Column - Communities & Activity */}
        <div className="space-y-6">
          <MyCommunities />
          <RecentActivity />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to get more involved?
        </h3>
        <p className="text-gray-600 mb-4">
          Explore new communities, create votations, and earn reputation points.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/user/communities/explore" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            🏘️ Explore Communities
          </Link>
          <Link href="/user/voting/create" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
            ✨ Create Voting
          </Link>
        </div>
      </div>
    </div>
  );
}