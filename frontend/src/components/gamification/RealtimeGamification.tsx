'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Plus, Zap, TrendingUp } from 'lucide-react';

interface ReputationGain {
  points: number;
  reason: string;
  timestamp: Date;
  type: 'vote' | 'create' | 'correct' | 'streak' | 'bonus';
}

interface PointsAnimationProps {
  points: number;
  onComplete?: () => void;
}

interface RealtimeGamificationProps {
  userId?: string;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  showLevel?: boolean;
  showStreaks?: boolean;
}

function PointsAnimation({ points, onComplete }: PointsAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="animate-bounce">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span className="font-bold text-lg">+{points}</span>
          <Star className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function LevelUpAnimation({ level, onComplete }: { level: number; onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-xl text-center max-w-md mx-4 animate-pulse">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
        <p className="text-xl mb-4">You've reached Level {level}!</p>
        <div className="flex justify-center space-x-2">
          <Trophy className="w-6 h-6" />
          <Zap className="w-6 h-6" />
          <Trophy className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function RealtimeGamification({
  userId,
  position = 'top-right',
  showLevel = true,
  showStreaks = true
}: RealtimeGamificationProps) {
  const [currentPoints, setCurrentPoints] = useState(1245);
  const [currentLevel, setCurrentLevel] = useState(8);
  const [recentGains, setRecentGains] = useState<ReputationGain[]>([]);
  const [showPointsAnimation, setShowPointsAnimation] = useState<number | null>(null);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState<number | null>(null);
  const [streaks, setStreaks] = useState({
    voting: 15,
    daily: 8,
    accuracy: 12
  });

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random point gains
      if (Math.random() < 0.3) { // 30% chance every 5 seconds
        const gainTypes = [
          { points: 1, reason: 'Vote cast', type: 'vote' as const },
          { points: 5, reason: 'Voting created', type: 'create' as const },
          { points: 4, reason: 'Correct answer', type: 'correct' as const },
          { points: 10, reason: 'Streak bonus', type: 'streak' as const },
          { points: 25, reason: 'Daily bonus', type: 'bonus' as const }
        ];
        
        const randomGain = gainTypes[Math.floor(Math.random() * gainTypes.length)];
        const newGain: ReputationGain = {
          ...randomGain,
          timestamp: new Date()
        };

        setRecentGains(prev => [newGain, ...prev].slice(0, 5));
        setCurrentPoints(prev => {
          const newPoints = prev + randomGain.points;
          
          // Check for level up
          const newLevel = Math.floor(newPoints / 200) + 1;
          if (newLevel > currentLevel) {
            setCurrentLevel(newLevel);
            setShowLevelUpAnimation(newLevel);
          }
          
          return newPoints;
        });
        setShowPointsAnimation(randomGain.points);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentLevel]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-left': return 'bottom-4 left-4';
      default: return 'top-4 right-4';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vote': return '🗳️';
      case 'create': return '✨';
      case 'correct': return '🎯';
      case 'streak': return '🔥';
      case 'bonus': return '🎁';
      default: return '⭐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vote': return 'text-blue-600';
      case 'create': return 'text-purple-600';
      case 'correct': return 'text-green-600';
      case 'streak': return 'text-orange-600';
      case 'bonus': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <>
      {/* Points Animation */}
      {showPointsAnimation && (
        <PointsAnimation 
          points={showPointsAnimation} 
          onComplete={() => setShowPointsAnimation(null)}
        />
      )}

      {/* Level Up Animation */}
      {showLevelUpAnimation && (
        <LevelUpAnimation 
          level={showLevelUpAnimation} 
          onComplete={() => setShowLevelUpAnimation(null)}
        />
      )}

      {/* Floating Gamification Widget */}
      <div className={`fixed ${getPositionClasses()} z-40 max-w-sm`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Gamification</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{currentPoints}</div>
                <div className="text-xs text-blue-200">points</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          {showLevel && (
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Level {currentLevel}</span>
                <span className="text-xs text-gray-500">
                  {currentPoints % 200} / 200
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentPoints % 200) / 200) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Streaks */}
          {showStreaks && (
            <div className="p-3 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-orange-50 rounded p-2">
                  <div className="text-orange-600 text-lg font-bold">{streaks.voting}</div>
                  <div className="text-xs text-orange-600">🔥 Streak</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="text-green-600 text-lg font-bold">{streaks.daily}</div>
                  <div className="text-xs text-green-600">📅 Daily</div>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-blue-600 text-lg font-bold">{streaks.accuracy}</div>
                  <div className="text-xs text-blue-600">🎯 Accuracy</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Recent Activity
            </h4>
            
            {recentGains.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">No recent activity</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentGains.map((gain, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getTypeIcon(gain.type)}</span>
                      <span className="text-gray-600 truncate">{gain.reason}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`font-medium ${getTypeColor(gain.type)}`}>
                        +{gain.points}
                      </span>
                      <span className="text-gray-400">
                        {formatTimeAgo(gain.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export { PointsAnimation, LevelUpAnimation };
