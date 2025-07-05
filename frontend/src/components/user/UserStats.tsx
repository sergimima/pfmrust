'use client';

import { useState } from 'react';
import Link from 'next/link';

interface UserStatsProps {
  profile: {
    wallet: string;
    reputation: number;
    level: number;
    totalVotes: number;
    communitiesJoined: number;
    votingWeight: number;
    lastActive: string;
  };
}

export default function UserStats({ profile }: UserStatsProps) {
  const getLevelColor = (level: number) => {
    if (level >= 8) return 'from-purple-500 to-purple-600';
    if (level >= 5) return 'from-blue-500 to-blue-600';
    if (level >= 3) return 'from-green-500 to-green-600';
    return 'from-gray-500 to-gray-600';
  };

  const getNextLevelPoints = (level: number) => {
    return (level + 1) * 100; // Simple formula: each level requires 100 more points
  };

  const currentLevelPoints = profile.level * 100;
  const nextLevelPoints = getNextLevelPoints(profile.level);
  const progressToNext = ((profile.reputation - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Level & Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Level</h3>
            <div className={`inline-flex px-3 py-1 rounded-full text-white font-bold bg-gradient-to-r ${getLevelColor(profile.level)}`}>
              Level {profile.level}
            </div>
          </div>
          <div className="text-3xl">🏆</div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {profile.level + 1}</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(profile.level)}`}
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {profile.reputation} / {nextLevelPoints} points
          </div>
        </div>
      </div>

      {/* Voting Weight */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Voting Weight</h3>
            <div className="text-2xl font-bold text-purple-600">
              {profile.votingWeight}x
            </div>
          </div>
          <div className="text-3xl">⚖️</div>
        </div>
        <p className="text-xs text-gray-600">
          Your votes count {profile.votingWeight}x more based on your reputation
        </p>
      </div>

      {/* Communities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Communities</h3>
            <div className="text-2xl font-bold text-blue-600">
              {profile.communitiesJoined}
            </div>
          </div>
          <div className="text-3xl">🏘️</div>
        </div>
        <Link 
          href="/user/communities" 
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Explore more communities →
        </Link>
      </div>

      {/* Total Votes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Votes</h3>
            <div className="text-2xl font-bold text-green-600">
              {profile.totalVotes}
            </div>
          </div>
          <div className="text-3xl">🗳️</div>
        </div>
        <p className="text-xs text-gray-600">
          Keep participating to earn more reputation!
        </p>
      </div>
    </div>
  );
}