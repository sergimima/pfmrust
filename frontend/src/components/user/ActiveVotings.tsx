'use client';

import { useState, useMemo } from 'react';
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

interface ApiVoting {
  id: number;
  question: string;
  description: string;
  communityId: number;
  creator: string;
  voteType: 'OPINION' | 'KNOWLEDGE';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  options: string[];
  results: number[];
  totalParticipants: number;
  quorum: number;
  deadline: string;
  createdAt: string;
  community?: {
    id: number;
    name: string;
    category: string;
  };
  _count?: { participations: number };
}

interface ActiveVotingsProps {
  apiData?: ApiVoting[];
  loading?: boolean;
}

export default function ActiveVotings({ apiData, loading }: ActiveVotingsProps) {
  // Mock data como fallback
  const [mockVotings] = useState<Voting[]>([
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

  // Transformar datos de API a formato local
  const transformedVotings = useMemo(() => {
    if (!apiData) return mockVotings;

    return apiData.map((vote): Voting => {
      const timeLeft = calculateTimeLeft(vote.deadline);
      const participantCount = vote.totalParticipants || vote._count?.participations || 0;
      const quorumReached = participantCount >= vote.quorum;

      return {
        id: vote.id.toString(),
        title: vote.question,
        community: vote.community?.name || `Community ${vote.communityId}`,
        type: vote.voteType === 'KNOWLEDGE' ? 'Knowledge' : 'Opinion',
        timeLeft,
        participantCount,
        quorumReached,
        userVoted: false, // TODO: determinar si usuario ya votó
        category: vote.community?.category || 'General',
        priority: determinePriority(vote)
      };
    });
  }, [apiData, mockVotings]);

  // Función para calcular tiempo restante
  const calculateTimeLeft = (deadline: string): string => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Función para determinar prioridad basada en datos
  const determinePriority = (vote: ApiVoting): 'high' | 'medium' | 'low' => {
    const hoursLeft = (new Date(vote.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    const participationRate = vote.totalParticipants / vote.quorum;

    if (hoursLeft < 24 && participationRate < 0.8) return 'high';
    if (hoursLeft < 72 || vote.voteType === 'KNOWLEDGE') return 'medium';
    return 'low';
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Votings</h2>
          <p className="text-sm text-gray-600">Loading votings...</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <h2 className="text-lg font-semibold text-gray-900">Active Votings</h2>
            <p className="text-sm text-gray-600">
              Vote on community proposals and earn reputation
              {apiData && (
                <span className="ml-2 text-green-600">• {apiData.length} from API</span>
              )}
            </p>
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
        {transformedVotings.map((voting) => (
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
                  <Link
                    href={`/user/voting/${voting.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium text-center block"
                  >
                    Vote Now
                  </Link>
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

      {transformedVotings.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">🗳️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active votings</h3>
          <p className="text-gray-600 mb-4">
            {apiData ? 
              "No active votings found from API" : 
              "Join communities to participate in their governance decisions"
            }
          </p>
          <Link
            href="/user/communities/explore"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      )}
    </div>
  );
}