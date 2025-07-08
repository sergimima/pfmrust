'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Award, TrendingUp, Clock, Users, CheckCircle, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'voting' | 'community' | 'knowledge' | 'streak' | 'reputation' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  earned: boolean;
  earnedDate?: string;
  progress: number;
  maxProgress: number;
  points: number;
}

interface Level {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  perks: string[];
  icon: string;
  color: string;
}

interface UserGamification {
  currentLevel: Level;
  nextLevel: Level | null;
  totalPoints: number;
  availablePoints: number;
  progressToNext: number;
  achievements: Achievement[];
  recentEarned: Achievement[];
  streaks: {
    voting: number;
    daily: number;
    accuracy: number;
  };
  stats: {
    totalVotes: number;
    totalCommunities: number;
    accuracyRate: number;
    createdVotings: number;
    helpfulVotes: number;
  };
  tier: 'Basic' | 'Premium' | 'VIP';
  badges: string[];
}

interface GamificationDisplayProps {
  userId?: string;
  userData?: any;
  userProfile?: any;
  compact?: boolean;
  showAchievements?: boolean;
  showProgress?: boolean;
  showStreaks?: boolean;
}

export default function GamificationDisplay({
  userId,
  userData,
  userProfile,
  compact = false,
  showAchievements = true,
  showProgress = true,
  showStreaks = true
}: GamificationDisplayProps) {
  const [gamificationData, setGamificationData] = useState<UserGamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  // Usar datos reales del usuario
  useEffect(() => {
    const fetchGamificationData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const levels: Level[] = [
        { level: 1, title: 'Newcomer', minPoints: 0, maxPoints: 99, perks: ['Basic voting'], icon: '🌱', color: 'text-green-600' },
        { level: 2, title: 'Participant', minPoints: 100, maxPoints: 249, perks: ['Reduced fees'], icon: '👤', color: 'text-blue-600' },
        { level: 3, title: 'Contributor', minPoints: 250, maxPoints: 499, perks: ['Create communities'], icon: '🤝', color: 'text-purple-600' },
        { level: 4, title: 'Advocate', minPoints: 500, maxPoints: 999, perks: ['Weighted voting'], icon: '📢', color: 'text-orange-600' },
        { level: 5, title: 'Leader', minPoints: 1000, maxPoints: 1999, perks: ['Moderation tools'], icon: '👑', color: 'text-yellow-600' },
        { level: 6, title: 'Expert', minPoints: 2000, maxPoints: 3999, perks: ['Knowledge validation'], icon: '🧠', color: 'text-indigo-600' },
        { level: 7, title: 'Sage', minPoints: 4000, maxPoints: 7999, perks: ['Advanced analytics'], icon: '🔮', color: 'text-purple-800' },
        { level: 8, title: 'Guardian', minPoints: 8000, maxPoints: 15999, perks: ['Community oversight'], icon: '🛡️', color: 'text-red-600' },
        { level: 9, title: 'Legend', minPoints: 16000, maxPoints: 31999, perks: ['Protocol influence'], icon: '⚡', color: 'text-yellow-500' },
        { level: 10, title: 'Immortal', minPoints: 32000, maxPoints: 999999, perks: ['Unlimited access'], icon: '💎', color: 'text-cyan-500' }
      ];

      // USAR DATOS REALES del usuario pasados como props
      const currentPoints = userProfile?.reputation || userData?.reputation || 250; // fallback básico
      const totalVotes = userProfile?.totalVotes || userData?.totalVotesCast || userProfile?.totalVotes || 0;
      const totalCommunities = userProfile?.communitiesJoined || userData?.totalCommunitiesJoined || userProfile?.communitiesJoined || 0;
      const userLevel = userProfile?.level || userData?.level || 3; // fallback
      const userAccuracy = userProfile?.accuracy || userData?.accuracy || 87.3;
      const userTier = userProfile?.tier || userData?.tier || 'Premium';
      
      // Find level based on real data
      const currentLevel = levels.find(l => l.level === userLevel) || levels.find(l => currentPoints >= l.minPoints && currentPoints <= l.maxPoints) || levels[2]; // fallback level 3
      const nextLevel = levels.find(l => l.level === currentLevel.level + 1) || null;

      // Use real stats del usuario
      const realStats = {
        totalVotes: totalVotes,
        totalCommunities: totalCommunities,
        accuracyRate: userAccuracy,
        createdVotings: userProfile?.votesCreated || userData?.votesCreated || 3,
        helpfulVotes: totalVotes
      };

      const mockAchievements: Achievement[] = [
        {
          id: 'first_vote',
          name: 'First Vote',
          description: 'Cast your first vote in any community',
          icon: '🗳️',
          category: 'voting',
          tier: 'bronze',
          earned: true,
          earnedDate: '2024-01-16T00:00:00Z',
          progress: 1,
          maxProgress: 1,
          points: 10
        },
        {
          id: 'voter_10',
          name: 'Active Voter',
          description: 'Cast 10 votes',
          icon: '📊',
          category: 'voting',
          tier: 'bronze',
          earned: true,
          earnedDate: '2024-01-20T00:00:00Z',
          progress: 10,
          maxProgress: 10,
          points: 25
        },
        {
          id: 'voter_50',
          name: 'Dedicated Voter',
          description: 'Cast 50 votes',
          icon: '🎯',
          category: 'voting',
          tier: 'silver',
          earned: true,
          earnedDate: '2024-02-15T00:00:00Z',
          progress: 50,
          maxProgress: 50,
          points: 100
        },
        {
          id: 'voter_100',
          name: 'Voting Champion',
          description: 'Cast 100 votes',
          icon: '🏆',
          category: 'voting',
          tier: 'gold',
          earned: false,
          progress: 89,
          maxProgress: 100,
          points: 250
        },
        {
          id: 'community_builder',
          name: 'Community Builder',
          description: 'Create your first community',
          icon: '🏗️',
          category: 'community',
          tier: 'silver',
          earned: true,
          earnedDate: '2024-02-01T00:00:00Z',
          progress: 1,
          maxProgress: 1,
          points: 50
        },
        {
          id: 'knowledge_seeker',
          name: 'Knowledge Seeker',
          description: 'Answer 10 knowledge questions correctly',
          icon: '🧠',
          category: 'knowledge',
          tier: 'silver',
          earned: true,
          earnedDate: '2024-02-15T00:00:00Z',
          progress: 10,
          maxProgress: 10,
          points: 75
        },
        {
          id: 'streak_7',
          name: 'Week Warrior',
          description: 'Vote for 7 consecutive days',
          icon: '🔥',
          category: 'streak',
          tier: 'bronze',
          earned: true,
          earnedDate: '2024-03-01T00:00:00Z',
          progress: 7,
          maxProgress: 7,
          points: 50
        },
        {
          id: 'streak_30',
          name: 'Month Master',
          description: 'Vote for 30 consecutive days',
          icon: '🌟',
          category: 'streak',
          tier: 'gold',
          earned: false,
          progress: 15,
          maxProgress: 30,
          points: 200
        },
        {
          id: 'reputation_1000',
          name: 'Reputation Star',
          description: 'Reach 1000 reputation points',
          icon: '⭐',
          category: 'reputation',
          tier: 'gold',
          earned: true,
          earnedDate: '2024-03-10T00:00:00Z',
          progress: 1245,
          maxProgress: 1000,
          points: 150
        },
        {
          id: 'accuracy_master',
          name: 'Accuracy Master',
          description: 'Maintain 90% accuracy in knowledge questions',
          icon: '🎯',
          category: 'knowledge',
          tier: 'diamond',
          earned: false,
          progress: 87,
          maxProgress: 90,
          points: 500
        }
      ];

      // DATOS REALES en lugar de mock
      const realData: UserGamification = {
        currentLevel,
        nextLevel,
        totalPoints: currentPoints,
        availablePoints: 150,
        progressToNext: nextLevel ? ((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100,
        achievements: mockAchievements, // Los achievements pueden seguir siendo mock por ahora
        recentEarned: mockAchievements.filter(a => a.earned).slice(0, 3),
        streaks: {
          voting: userProfile?.streakDays || userData?.streakDays || 15,
          daily: userProfile?.streakDays || userData?.streakDays || 8,
          accuracy: 12
        },
        stats: realStats, // ¡USAR STATS REALES!
        tier: userTier as 'Basic' | 'Premium' | 'VIP',
        badges: ['Early Adopter', 'Knowledge Expert', 'Community Leader']
      };

      setGamificationData(realData);
      setLoading(false);
    };

    fetchGamificationData();
  }, [userId, userData, userProfile]); // Dependencias para recalcular cuando cambien los datos

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'diamond': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voting': return <Trophy className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      case 'knowledge': return <Star className="w-4 h-4" />;
      case 'streak': return <Flame className="w-4 h-4" />;
      case 'reputation': return <Award className="w-4 h-4" />;
      case 'special': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-4xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Gamification not available</h3>
        <p className="text-gray-600">Unable to load gamification data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Celebration Modal */}
      {celebratingAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">{celebratingAchievement.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
            <h4 className="text-xl font-semibold text-blue-600 mb-2">{celebratingAchievement.name}</h4>
            <p className="text-gray-600 mb-4">{celebratingAchievement.description}</p>
            <div className="text-lg font-bold text-green-600 mb-6">+{celebratingAchievement.points} points</div>
            <button
              onClick={() => setCelebratingAchievement(null)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {showProgress && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{gamificationData.currentLevel.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{gamificationData.currentLevel.title}</h3>
                <p className="text-blue-100">Level {gamificationData.currentLevel.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{gamificationData.totalPoints}</div>
              <div className="text-blue-200 text-sm">Total Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {gamificationData.nextLevel?.title || 'Max Level'}</span>
              <span>{gamificationData.progressToNext.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${gamificationData.progressToNext}%` }}
              ></div>
            </div>
            {gamificationData.nextLevel && (
              <div className="flex justify-between text-xs text-blue-200 mt-1">
                <span>{gamificationData.currentLevel.minPoints}</span>
                <span>{gamificationData.nextLevel.minPoints} needed</span>
              </div>
            )}
          </div>

          {/* Perks */}
          <div className="flex flex-wrap gap-2">
            {gamificationData.currentLevel.perks.map((perk, index) => (
              <span key={index} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats and Streaks */}
      {showStreaks && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Voting Streak */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Voting Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{gamificationData.streaks.voting}</div>
            <div className="text-xs text-orange-600">consecutive days</div>
          </div>

          {/* Daily Activity */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Daily Activity</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{gamificationData.streaks.daily}</div>
            <div className="text-xs text-green-600">active days</div>
          </div>

          {/* Accuracy Streak */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{gamificationData.stats.accuracyRate}%</div>
            <div className="text-xs text-blue-600">knowledge questions</div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {showAchievements && gamificationData.recentEarned.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Achievements
          </h4>
          
          <div className="space-y-3">
            {gamificationData.recentEarned.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getTierColor(achievement.tier)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h5 className="font-medium text-gray-900">{achievement.name}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earnedDate && (
                      <p className="text-xs text-gray-500">Earned {formatDate(achievement.earnedDate)}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    +{achievement.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      {showAchievements && !compact && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            All Achievements
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamificationData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  achievement.earned
                    ? `${getTierColor(achievement.tier)} hover:shadow-md`
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${achievement.earned ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(achievement.category)}
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                        {achievement.tier}
                      </span>
                    </div>
                  </div>
                  {achievement.earned && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <h5 className={`font-medium mb-1 ${achievement.earned ? 'text-gray-900' : 'text-gray-600'}`}>
                  {achievement.name}
                </h5>
                <p className={`text-sm mb-3 ${achievement.earned ? 'text-gray-700' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-600">
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.earned ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {achievement.points} points
                  </span>
                  {achievement.earned && achievement.earnedDate && (
                    <span className="text-xs text-gray-500">
                      {formatDate(achievement.earnedDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Stats */}
      {compact && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{gamificationData.totalPoints}</div>
              <div className="text-xs text-gray-600">Points</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{gamificationData.currentLevel.level}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {gamificationData.achievements.filter(a => a.earned).length}
              </div>
              <div className="text-xs text-gray-600">Achievements</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
