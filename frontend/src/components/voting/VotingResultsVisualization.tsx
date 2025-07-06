'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trophy, Users, Clock, CheckCircle, TrendingUp, Target, Award } from 'lucide-react';

interface VotingOption {
  id: number;
  text: string;
  votes: number;
  percentage: number;
  isCorrect?: boolean;
  isWinner: boolean;
}

interface VotingResults {
  id: string;
  title: string;
  description: string;
  type: 'Opinion' | 'Knowledge';
  status: 'Active' | 'Completed' | 'Failed';
  totalVotes: number;
  quorumRequired: number;
  quorumReached: boolean;
  timeLeft: string;
  deadline: string;
  createdAt: string;
  community: string;
  options: VotingOption[];
  participationHistory: Array<{
    time: string;
    votes: number;
    participants: number;
  }>;
  demographics: {
    byReputation: Array<{ range: string; votes: number; percentage: number }>;
    byLevel: Array<{ level: string; votes: number; percentage: number }>;
    byTier: Array<{ tier: string; votes: number; percentage: number }>;
  };
  userVote?: {
    optionId: number;
    timestamp: string;
    isCorrect?: boolean;
    earnedPoints: number;
  };
}

interface VotingResultsVisualizationProps {
  votingId: string;
  showUserVote?: boolean;
  showDemographics?: boolean;
  showParticipationTrend?: boolean;
}

export default function VotingResultsVisualization({ 
  votingId, 
  showUserVote = true,
  showDemographics = true,
  showParticipationTrend = true
}: VotingResultsVisualizationProps) {
  const [results, setResults] = useState<VotingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'trends' | 'demographics'>('overview');

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: VotingResults = {
        id: votingId,
        title: 'Should we implement a new fee structure for DeFi protocols?',
        description: 'Proposal to reduce transaction fees by 50% while maintaining protocol sustainability through alternative revenue streams.',
        type: 'Opinion',
        status: 'Active',
        totalVotes: 347,
        quorumRequired: 200,
        quorumReached: true,
        timeLeft: '2 days 4 hours',
        deadline: '2025-07-08T14:30:00Z',
        createdAt: '2025-07-03T10:00:00Z',
        community: 'DeFi Governance Hub',
        options: [
          { id: 1, text: 'Reduce fees by 50%', votes: 156, percentage: 45.0, isWinner: true },
          { id: 2, text: 'Reduce fees by 25%', votes: 98, percentage: 28.2, isWinner: false },
          { id: 3, text: 'Keep current fees', votes: 67, percentage: 19.3, isWinner: false },
          { id: 4, text: 'Increase fees by 10%', votes: 26, percentage: 7.5, isWinner: false }
        ],
        participationHistory: [
          { time: '00:00', votes: 0, participants: 0 },
          { time: '06:00', votes: 45, participants: 45 },
          { time: '12:00', votes: 123, participants: 112 },
          { time: '18:00', votes: 234, participants: 201 },
          { time: '24:00', votes: 347, participants: 298 }
        ],
        demographics: {
          byReputation: [
            { range: '0-100', votes: 45, percentage: 13.0 },
            { range: '101-500', votes: 123, percentage: 35.4 },
            { range: '501-1000', votes: 98, percentage: 28.2 },
            { range: '1000+', votes: 81, percentage: 23.3 }
          ],
          byLevel: [
            { level: '1-3', votes: 67, percentage: 19.3 },
            { level: '4-6', votes: 134, percentage: 38.6 },
            { level: '7-9', votes: 89, percentage: 25.6 },
            { level: '10+', votes: 57, percentage: 16.4 }
          ],
          byTier: [
            { tier: 'Basic', votes: 178, percentage: 51.3 },
            { tier: 'Premium', votes: 123, percentage: 35.4 },
            { tier: 'VIP', votes: 46, percentage: 13.3 }
          ]
        },
        userVote: {
          optionId: 1,
          timestamp: '2025-07-06T08:30:00Z',
          earnedPoints: 1
        }
      };
      
      setResults(mockResults);
      setLoading(false);
    };

    fetchResults();
  }, [votingId]);

  const getOptionColor = (index: number, isWinner: boolean) => {
    if (isWinner) return '#10B981'; // green-500
    const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];
    return colors[index % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Results not found</h3>
        <p className="text-gray-600">Unable to load voting results.</p>
      </div>
    );
  }

  const winnerOption = results.options.find(option => option.isWinner);
  const userVotedOption = results.userVote ? results.options.find(opt => opt.id === results.userVote?.optionId) : null;

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{results.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.status)}`}>
                {results.status}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {results.type}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{results.description}</p>
            <p className="text-sm text-gray-500">in {results.community}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Votes</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{results.totalVotes}</p>
          </div>
          
          <div className={`rounded-lg p-4 ${results.quorumReached ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Quorum</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${results.quorumReached ? 'text-green-900' : 'text-orange-900'}`}>
              {results.quorumRequired}
            </p>
            <p className={`text-xs ${results.quorumReached ? 'text-green-600' : 'text-orange-600'}`}>
              {results.quorumReached ? '✅ Reached' : '⏳ Needed'}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Time Left</span>
            </div>
            <p className="text-lg font-bold text-purple-900 mt-1">{results.timeLeft}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Leading</span>
            </div>
            <p className="text-lg font-bold text-yellow-900 mt-1">{winnerOption?.percentage}%</p>
          </div>
        </div>
      </div>

      {/* User Vote Status */}
      {showUserVote && results.userVote && userVotedOption && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Your Vote Recorded</h4>
              <p className="text-green-700">
                You voted for "{userVotedOption.text}" {formatTimeAgo(results.userVote.timestamp)}
              </p>
              {results.userVote.earnedPoints > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  +{results.userVote.earnedPoints} reputation points earned
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Results Overview', icon: BarChart },
              { id: 'details', name: 'Detailed Breakdown', icon: TrendingUp },
              { id: 'trends', name: 'Participation Trends', icon: LineChart },
              { id: 'demographics', name: 'Voter Demographics', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as typeof activeView)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.id
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeView === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Voting Results</h3>
              
              {/* Bar Chart */}
              <div className="mb-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results.options}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="text" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value} votes`, 'Votes']}
                      labelFormatter={(label) => `Option: ${label}`}
                    />
                    <Bar 
                      dataKey="votes" 
                      fill={(entry: any) => getOptionColor(results.options.indexOf(entry), entry.isWinner)}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Results Table */}
              <div className="space-y-3">
                {results.options
                  .sort((a, b) => b.votes - a.votes)
                  .map((option, index) => (
                    <div
                      key={option.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        option.isWinner 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          option.isWinner ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className={`font-medium ${option.isWinner ? 'text-green-900' : 'text-gray-900'}`}>
                            {option.text}
                            {option.isWinner && <Trophy className="w-4 h-4 inline ml-2 text-yellow-500" />}
                            {results.userVote?.optionId === option.id && (
                              <CheckCircle className="w-4 h-4 inline ml-2 text-blue-500" />
                            )}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${option.isWinner ? 'text-green-900' : 'text-gray-900'}`}>
                          {option.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.votes} votes
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeView === 'details' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Vote Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={results.options}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="votes"
                        label={({ percentage }) => `${percentage.toFixed(1)}%`}
                      >
                        {results.options.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getOptionColor(index, entry.isWinner)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Participants:</span>
                      <span className="font-medium">{results.totalVotes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quorum Progress:</span>
                      <span className="font-medium">
                        {((results.totalVotes / results.quorumRequired) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Leading Margin:</span>
                      <span className="font-medium">
                        {winnerOption ? 
                          `${(winnerOption.percentage - (results.options.find((opt, i) => 
                            i === 1 && results.options.sort((a, b) => b.percentage - a.percentage)
                          )?.percentage || 0)).toFixed(1)}%` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Voting Period:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(results.deadline).getTime() - new Date(results.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeView === 'trends' && showParticipationTrend && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Participation Trends</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results.participationHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="votes" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Total Votes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="participants" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                    name="Unique Participants"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Peak Hour</h5>
                  <p className="text-blue-700">18:00 - 234 votes</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">Participation Rate</h5>
                  <p className="text-green-700">85.9% active voters</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-medium text-purple-900 mb-2">Growth Rate</h5>
                  <p className="text-purple-700">+34 votes/hour</p>
                </div>
              </div>
            </div>
          )}

          {/* Demographics Tab */}
          {activeView === 'demographics' && showDemographics && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Voter Demographics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* By Reputation */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">By Reputation Points</h4>
                  <div className="space-y-2">
                    {results.demographics.byReputation.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{item.range}</span>
                        <div className="text-right">
                          <span className="font-medium">{item.percentage}%</span>
                          <span className="text-xs text-gray-500 block">{item.votes} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Level */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">By User Level</h4>
                  <div className="space-y-2">
                    {results.demographics.byLevel.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Level {item.level}</span>
                        <div className="text-right">
                          <span className="font-medium">{item.percentage}%</span>
                          <span className="text-xs text-gray-500 block">{item.votes} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Tier */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">By Tier Status</h4>
                  <div className="space-y-2">
                    {results.demographics.byTier.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{item.tier}</span>
                        <div className="text-right">
                          <span className="font-medium">{item.percentage}%</span>
                          <span className="text-xs text-gray-500 block">{item.votes} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
