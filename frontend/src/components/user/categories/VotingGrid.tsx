'use client';

import Link from 'next/link';

interface Voting {
  id: string;
  title: string;
  description: string;
  community: string;
  category: string;
  type: 'Opinion' | 'Knowledge';
  status: 'Active' | 'Completed' | 'Failed';
  timeLeft: string;
  deadline: string;
  participantCount: number;
  quorumReached: boolean;
  userVoted: boolean;
  priority: 'high' | 'medium' | 'low';
  options: string[];
  correctAnswer?: string;
  createdBy: string;
  createdAt: string;
}

interface VotingGridProps {
  votings: Voting[];
  onVote: (votingId: string, optionIndex: number) => void;
  loading: boolean;
}

export default function VotingGrid({ votings, onVote, loading }: VotingGridProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Knowledge' ? '🧠' : '💭';
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'technology': '💻',
      'finance': '💰',
      'gaming': '🎮',
      'art': '🎨',
      'education': '📚',
      'general': '💬'
    };
    return emojiMap[category] || '🏘️';
  };

  const getTimeLeftColor = (timeLeft: string, status: string) => {
    if (status !== 'Active') return 'text-gray-500';
    
    if (timeLeft.includes('hour') && !timeLeft.includes('day')) {
      return 'text-red-600'; // Urgent
    }
    if (timeLeft.includes('1 day') || timeLeft.includes('2 day')) {
      return 'text-orange-600'; // Soon
    }
    return 'text-green-600'; // Plenty of time
  };

  const handleQuickVote = (votingId: string, optionIndex: number) => {
    if (loading) return;
    onVote(votingId, optionIndex);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {votings.map((voting) => (
        <div
          key={voting.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
        >
          {/* Voting Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getTypeIcon(voting.type)}</span>
                <span className="text-lg">{getCategoryEmoji(voting.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(voting.priority)}`}>
                  {voting.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voting.status)}`}>
                  {voting.status}
                </span>
                {voting.userVoted && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    ✅ Voted
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {voting.title}
            </h3>

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {voting.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span className="font-medium">{voting.community}</span>
              <span className="capitalize">{voting.category}</span>
            </div>
          </div>

          {/* Voting Stats */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className={getTimeLeftColor(voting.timeLeft, voting.status)}>⏰</span>
                <span className={`${getTimeLeftColor(voting.timeLeft, voting.status)} font-medium`}>
                  {voting.timeLeft}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-600">👥</span>
                <span className="text-gray-700">{voting.participantCount} votes</span>
              </div>
              <div className="flex items-center space-x-1">
                {voting.quorumReached ? (
                  <>
                    <span className="text-green-600">✅</span>
                    <span className="text-green-600 text-xs">Quorum</span>
                  </>
                ) : (
                  <>
                    <span className="text-orange-600">⏳</span>
                    <span className="text-orange-600 text-xs">Needs votes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Vote Options (for active votings) */}
          {voting.status === 'Active' && !voting.userVoted && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Vote:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {voting.options.slice(0, 2).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickVote(voting.id, index)}
                      disabled={loading}
                      className="text-left px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {option}
                    </button>
                  ))}
                  {voting.options.length > 2 && (
                    <Link
                      href={`/user/voting/${voting.id}`}
                      className="text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View all {voting.options.length} options
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              <Link
                href={`/user/voting/${voting.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                {voting.status === 'Active' ? 'View & Vote' : 'View Results'}
              </Link>
              
              <Link
                href={`/user/communities/${voting.community}`}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Community
              </Link>
            </div>
          </div>

          {/* Voting Progress Bar */}
          {voting.quorumReached && (
            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
          )}
        </div>
      ))}
    </div>
  );
}