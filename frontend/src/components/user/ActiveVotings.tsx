'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Voting {
  id: string;
  title: string;
  community: string;
  type: 'Opinion' | 'Knowledge';
  timeLeft: string;
  participantCount: number;
  quorumReached: boolean;
  userVoted: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ActiveVotings() {
  const [votings] = useState<Voting[]>([
    {
      id: '1',
      title: 'Should we implement a new fee structure?',
      community: 'DeFi Governance',
      type: 'Opinion',
      timeLeft: '2 days 4 hours',
      participantCount: 156,
      quorumReached: true,
      userVoted: false,
      category: 'Finance',
      priority: 'high'
    },
    {
      id: '2',
      title: 'What is the optimal block time for our network?',
      community: 'Technical Discussion',
      type: 'Knowledge',
      timeLeft: '5 hours 23 mins',
      participantCount: 89,
      quorumReached: false,
      userVoted: false,
      category: 'Technology',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Choose the next community event theme',
      community: 'Community Events',
      type: 'Opinion',
      timeLeft: '1 day 12 hours',
      participantCount: 234,
      quorumReached: true,
      userVoted: true,
      category: 'General',
      priority: 'low'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Knowledge' ? '🧠' : '💭';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Active Votings</h2>
            <p className="text-sm text-gray-600">Vote on community proposals and earn reputation</p>
          </div>
          <Link
            href="/user/voting"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {votings.map((voting) => (
          <div key={voting.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getTypeIcon(voting.type)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(voting.priority)}`}>
                    {voting.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {voting.category}
                  </span>
                  {voting.userVoted && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✅ Voted
                    </span>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">{voting.title}</h3>
                <p className="text-sm text-gray-600 mb-3">in {voting.community}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>⏰</span>
                    <span>{voting.timeLeft} left</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👥</span>
                    <span>{voting.participantCount} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {voting.quorumReached ? (
                      <>
                        <span>✅</span>
                        <span className="text-green-600">Quorum reached</span>
                      </>
                    ) : (
                      <>
                        <span>⏳</span>
                        <span className="text-orange-600">Needs more votes</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {!voting.userVoted ? (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Vote Now
                  </button>
                ) : (
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed text-sm font-medium">
                    Already Voted
                  </button>
                )}
                <Link
                  href={`/user/voting/${voting.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {votings.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">🗳️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active votings</h3>
          <p className="text-gray-600 mb-4">
            Join communities to participate in their governance decisions
          </p>
          <Link
            href="/user/communities"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      )}
    </div>
  );
}