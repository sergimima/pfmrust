'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import ParticipationOverview from '@/components/user/ParticipationOverview';
import ActiveVotings from '@/components/user/ActiveVotings';
import MyCommunities from '@/components/user/MyCommunities';
import UserStats from '@/components/user/UserStats';
import RecentActivity from '@/components/user/RecentActivity';
import GamificationDisplay from '@/components/gamification/GamificationDisplay';
import { useUser, useUsers, useCommunities, useVotes } from '@/hooks/useApi';

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
  
  // API Hooks para datos reales
  const { data: userData, loading: userLoading, error: userError } = useUser(
    publicKey?.toString() || ''
  );
  const { data: communitiesData, loading: communitiesLoading } = useCommunities({ 
    limit: 5, 
    isActive: true 
  });
  const { data: votesData, loading: votesLoading } = useVotes({ 
    limit: 10, 
    status: 'ACTIVE' 
  });

  // Transformar datos de API a formato UserProfile
  useEffect(() => {
    if (userData && publicKey) {
      setUserProfile({
        wallet: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
        reputation: userData.reputation || 0,
        level: userData.level || 1,
        totalVotes: userData.totalVotesCast || 0,
        communitiesJoined: userData.totalCommunitiesJoined || 0,
        votingWeight: userData.votingWeight || 1.0,
        lastActive: userData.lastActiveAt || new Date().toISOString(),
      });
    } else if (publicKey && !userLoading && !userData) {
      // Usuario no existe en backend, usar datos por defecto
      setUserProfile({
        wallet: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
        reputation: 0,
        level: 1,
        totalVotes: 0,
        communitiesJoined: 0,
        votingWeight: 1.0,
        lastActive: new Date().toISOString(),
      });
    }
  }, [userData, publicKey, userLoading]);

  const loading = userLoading || communitiesLoading || votesLoading;

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  // Mostrar error de conexión si hay problemas con la API
  if (userError && !userData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ API Connection Issue
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Unable to connect to backend API: {userError}</p>
                <p className="mt-1">Using fallback data. Please check if backend is running on localhost:3001</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fallback UI con datos básicos */}
        {publicKey && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
                <p className="text-blue-100 mt-1">
                  Ready to participate in community governance?
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">0</div>
                <div className="text-blue-200 text-sm">Reputation Points</div>
              </div>
            </div>
          </div>
        )}
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
              {userData && (
                <p className="text-blue-200 text-xs mt-1">
                  ✅ Connected to API • Last active: {new Date(userData.lastActiveAt || Date.now()).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{userProfile?.reputation || 0}</div>
              <div className="text-blue-200 text-sm">Reputation Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Status Info */}
      {userData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                🌐 <strong>Real data loaded</strong> • Communities: {communitiesData?.length || 0} • Active Votes: {votesData?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {userProfile && <UserStats profile={userProfile} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Participation */}
        <div className="lg:col-span-2 space-y-6">
          <ParticipationOverview />
          <ActiveVotings apiData={votesData || undefined} loading={votesLoading} />
        </div>

        {/* Right Column - Communities, Activity & Gamification */}
        <div className="space-y-6">
          <MyCommunities apiData={communitiesData || undefined} loading={communitiesLoading} />
          <GamificationDisplay 
            userId={publicKey?.toString()}
            compact={true}
            showAchievements={false}
            showProgress={true}
            showStreaks={true}
          />
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

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              🔧 Debug Info (Development Only)
            </summary>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p><strong>API Status:</strong> {userError ? 'Error' : userData ? 'Connected' : 'No data'}</p>
              <p><strong>User Data:</strong> {userData ? 'Loaded' : 'Not loaded'}</p>
              <p><strong>Communities:</strong> {communitiesData?.length || 0} loaded</p>
              <p><strong>Votes:</strong> {votesData?.length || 0} loaded</p>
              <p><strong>Wallet:</strong> {publicKey?.toString() || 'Not connected'}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}