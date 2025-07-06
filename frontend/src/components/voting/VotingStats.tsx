'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Hash, Clock, Trophy, Target, CheckCircle } from 'lucide-react';

interface GeneralStats {
  totalVotings: number;
  activeVotings: number;
  completedVotings: number;
  totalParticipants: number;
  avgParticipation: number;
  quorumSuccessRate: number;
}

interface CategoryStats {
  category: string;
  votings: number;
  participants: number;
  successRate: number;
  emoji: string;
}

interface TrendData {
  date: string;
  votings: number;
  participants: number;
  completion: number;
}

interface VotingStatsProps {
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  showTrends?: boolean;
  showCategories?: boolean;
  compact?: boolean;
}

export default function VotingStats({ 
  timeframe = 'month',
  showTrends = true,
  showCategories = true,
  compact = false
}: VotingStatsProps) {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockStats: GeneralStats = {
        totalVotings: 1247,
        activeVotings: 89,
        completedVotings: 1158,
        totalParticipants: 15742,
        avgParticipation: 67.8,
        quorumSuccessRate: 92.3
      };

      const mockCategoryStats: CategoryStats[] = [
        { category: 'Technology', votings: 234, participants: 3456, successRate: 94.2, emoji: '💻' },
        { category: 'Finance', votings: 198, participants: 4123, successRate: 89.1, emoji: '💰' },
        { category: 'General', votings: 156, participants: 2341, successRate: 91.7, emoji: '💬' },
        { category: 'Gaming', votings: 89, participants: 1876, successRate: 87.6, emoji: '🎮' },
        { category: 'Education', votings: 67, participants: 1234, successRate: 95.5, emoji: '📚' },
        { category: 'Art', votings: 45, participants: 987, successRate: 88.9, emoji: '🎨' }
      ];

      const mockTrendData: TrendData[] = [
        { date: 'Week 1', votings: 23, participants: 1234, completion: 89 },
        { date: 'Week 2', votings: 31, participants: 1567, completion: 92 },
        { date: 'Week 3', votings: 28, participants: 1398, completion: 87 },
        { date: 'Week 4', votings: 35, participants: 1789, completion: 94 },
        { date: 'Week 5', votings: 29, participants: 1456, completion: 91 },
        { date: 'Week 6', votings: 42, participants: 2134, completion: 96 },
        { date: 'Week 7', votings: 38, participants: 1923, completion: 93 }
      ];

      setStats(mockStats);
      setCategoryStats(mockCategoryStats);
      setTrendData(mockTrendData);
      setLoading(false);
    };

    fetchStats();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No statistics available</h3>
        <p className="text-gray-600">Unable to load voting statistics.</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Voting Statistics</h3>
          <select 
            value={timeframe}
            onChange={(e) => {/* TODO: Update timeframe */}}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'} gap-4 mb-6`}>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Votings</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalVotings}</p>
            <p className="text-xs text-blue-600">{stats.activeVotings} active</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Participants</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalParticipants.toLocaleString()}</p>
            <p className="text-xs text-green-600">{stats.avgParticipation}% avg participation</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">{stats.quorumSuccessRate}%</p>
            <p className="text-xs text-purple-600">quorum reached</p>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Completed</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.completedVotings}</p>
              <p className="text-xs text-orange-600">
                {((stats.completedVotings / stats.totalVotings) * 100).toFixed(1)}% completion rate
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Active</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.activeVotings}</p>
              <p className="text-xs text-red-600">currently open</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Avg Daily</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(stats.totalVotings / 30)}</p>
              <p className="text-xs text-gray-600">new votings</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {showCategories && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Votings by Category</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votings"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Table */}
            <div className="space-y-3">
              {categoryStats.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.emoji}</span>
                    <div>
                      <h5 className="font-medium text-gray-900">{category.category}</h5>
                      <p className="text-sm text-gray-600">{category.participants.toLocaleString()} participants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{category.votings}</p>
                    <p className="text-sm text-green-600">{category.successRate}% success</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends */}
      {showTrends && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Participation Trends</h4>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="participants" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Participants"
              />
              <Area 
                type="monotone" 
                dataKey="votings" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
                name="New Votings"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Peak Week</h5>
              <p className="text-blue-700">Week 6 - 42 votings</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Avg Growth</h5>
              <p className="text-green-700">+8.3% week over week</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-purple-900 mb-2">Best Completion</h5>
              <p className="text-purple-700">Week 6 - 96% success</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
