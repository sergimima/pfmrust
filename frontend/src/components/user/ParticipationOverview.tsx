'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ParticipationOverview() {
  const [stats] = useState({
    activeVotings: 12,
    pendingVotes: 3,
    completedToday: 2,
    totalEarned: 45,
    streak: 7
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Your Participation</h2>
        <p className="text-sm text-gray-600">Track your voting activity and engagement</p>
      </div>
      
      <div className="p-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.activeVotings}</div>
            <div className="text-sm text-blue-800">Active Votings</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingVotes}</div>
            <div className="text-sm text-orange-800">Pending Votes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            <div className="text-sm text-green-800">Voted Today</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Recent Achievements</h3>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl">🔥</div>
            <div className="flex-1">
              <div className="font-medium text-yellow-800">Voting Streak!</div>
              <div className="text-sm text-yellow-600">
                You've voted {stats.streak} days in a row
              </div>
            </div>
            <div className="text-yellow-600 font-bold">{stats.streak} days</div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl">💎</div>
            <div className="flex-1">
              <div className="font-medium text-green-800">Reputation Earned</div>
              <div className="text-sm text-green-600">
                +{stats.totalEarned} points this week
              </div>
            </div>
            <div className="text-green-600 font-bold">+{stats.totalEarned}</div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <div className="font-medium text-purple-800">Knowledge Expert</div>
              <div className="text-sm text-purple-600">
                92% accuracy on knowledge questions
              </div>
            </div>
            <div className="text-purple-600 font-bold">92%</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-900">Ready to vote?</div>
              <div className="text-sm text-gray-600">
                {stats.pendingVotes} votings are waiting for your input
              </div>
            </div>
            <Link
              href="/user/voting"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View All Votings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}