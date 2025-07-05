'use client';

import { useState, useEffect } from 'react';

interface UserAnalyticsProps {
  dateRange: string;
}

interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  averageReputation: number;
  topUsers: Array<{
    wallet: string;
    reputation: number;
    level: number;
    totalVotes: number;
    communitiesJoined: number;
  }>;
  usersByLevel: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
  reputationDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export default function UserAnalytics({ dateRange }: UserAnalyticsProps) {
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalUsers: 1247,
    newUsers: 89,
    activeUsers: 892,
    retentionRate: 73.5,
    averageReputation: 124.8,
    topUsers: [
      {
        wallet: 'ABC...123',
        reputation: 2450,
        level: 15,
        totalVotes: 234,
        communitiesJoined: 12
      },
      {
        wallet: 'DEF...456', 
        reputation: 1890,
        level: 12,
        totalVotes: 189,
        communitiesJoined: 8
      },
      {
        wallet: 'GHI...789',
        reputation: 1567,
        level: 10,
        totalVotes: 156,
        communitiesJoined: 7
      },
      {
        wallet: 'JKL...012',
        reputation: 1234,
        level: 9,
        totalVotes: 123,
        communitiesJoined: 6
      },
      {
        wallet: 'MNO...345',
        reputation: 1089,
        level: 8,
        totalVotes: 108,
        communitiesJoined: 5
      }
    ],
    usersByLevel: [
      { level: 1, count: 456, percentage: 36.6 },
      { level: 2, count: 234, percentage: 18.8 },
      { level: 3, count: 189, percentage: 15.2 },
      { level: 4, count: 145, percentage: 11.6 },
      { level: 5, count: 123, percentage: 9.9 },
      { level: 6, count: 67, percentage: 5.4 },
      { level: 7, count: 23, percentage: 1.8 },
      { level: 8, count: 7, percentage: 0.6 },
      { level: 9, count: 2, percentage: 0.2 },
      { level: 10, count: 1, percentage: 0.1 }
    ],
    reputationDistribution: [
      { range: '0-50', count: 523, percentage: 41.9 },
      { range: '51-100', count: 298, percentage: 23.9 },
      { range: '101-250', count: 234, percentage: 18.8 },
      { range: '251-500', count: 134, percentage: 10.7 },
      { range: '501-1000', count: 45, percentage: 3.6 },
      { range: '1000+', count: 13, percentage: 1.0 }
    ]
  });

  const [userGrowth] = useState([
    { month: 'Ene', total: 450, new: 120, active: 340 },
    { month: 'Feb', total: 678, new: 228, active: 512 },
    { month: 'Mar', total: 823, new: 145, active: 623 },
    { month: 'Abr', total: 945, new: 122, active: 715 },
    { month: 'May', total: 1089, new: 144, active: 823 },
    { month: 'Jun', total: 1156, new: 67, active: 875 },
    { month: 'Jul', total: 1247, new: 91, active: 892 }
  ]);

  useEffect(() => {
    // TODO: Fetch real user analytics from backend API
    console.log('Fetching user analytics for:', dateRange);
  }, [dateRange]);

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'bg-purple-100 text-purple-800';
    if (level >= 5) return 'bg-blue-100 text-blue-800';
    if (level >= 3) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Key User Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Usuarios Totales</h3>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">+{metrics.newUsers} este período</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Usuarios Activos</h3>
          <p className="text-2xl font-bold text-green-900">{metrics.activeUsers}</p>
          <p className="text-xs text-green-600 mt-1">
            {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% del total
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Retención</h3>
          <p className="text-2xl font-bold text-purple-900">{metrics.retentionRate}%</p>
          <p className="text-xs text-purple-600 mt-1">Usuarios activos 30d</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Reputación Promedio</h3>
          <p className="text-2xl font-bold text-orange-900">{metrics.averageReputation}</p>
          <p className="text-xs text-orange-600 mt-1">Todos los usuarios</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Nuevos Usuarios</h3>
          <p className="text-2xl font-bold text-yellow-900">{metrics.newUsers}</p>
          <p className="text-xs text-yellow-600 mt-1">En {dateRange}</p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Crecimiento de Usuarios</h3>
          <div className="space-y-3">
            {userGrowth.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium w-12">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-1">
                    <div className="bg-blue-200 h-6 rounded flex-1 relative">
                      <div 
                        className="bg-blue-600 h-6 rounded" 
                        style={{ width: `${(data.total / 1400) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {data.total}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  +{data.new}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución por Niveles</h3>
          <div className="space-y-2">
            {metrics.usersByLevel.slice(0, 6).map((levelData, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(levelData.level)}`}>
                  Nivel {levelData.level}
                </span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${levelData.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {levelData.count}
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {levelData.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top Usuarios por Reputación</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reputación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidades
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topUsers.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      {index > 2 && <span className="text-gray-500 font-medium mr-2">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.wallet}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">{user.reputation.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getLevelColor(user.level)
                    }`}>
                      Nivel {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.totalVotes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.communitiesJoined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reputation Distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Distribución de Reputación</h3>
        <div className="grid grid-cols-3 gap-4">
          {metrics.reputationDistribution.map((range, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{range.count}</div>
              <div className="text-sm text-gray-600">{range.range} puntos</div>
              <div className="text-xs text-gray-500 mt-1">{range.percentage}% de usuarios</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${range.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Métricas de Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuarios que votaron (30d)</span>
              <span className="font-bold text-green-600">78.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuarios con múltiples comunidades</span>
              <span className="font-bold text-blue-600">45.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuarios creadores de contenido</span>
              <span className="font-bold text-purple-600">23.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo promedio en plataforma</span>
              <span className="font-bold text-orange-600">12.4 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sesiones por usuario/día</span>
              <span className="font-bold text-red-600">2.8</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente de Usuarios</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-600">✅</div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">Usuario alcanzó Nivel 10: </span>
                <span className="font-medium">ABC...123</span>
                <span className="text-sm text-gray-500 ml-2">hace 5 minutos</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600">🏆</div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">Nuevo líder de reputación: </span>
                <span className="font-medium">DEF...456</span>
                <span className="text-sm text-gray-500 ml-2">hace 1 hora</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600">👥</div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">25 nuevos usuarios registrados</span>
                <span className="text-sm text-gray-500 ml-2">en las últimas 2 horas</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600">⭐</div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">Usuario más activo del día: </span>
                <span className="font-medium">GHI...789</span>
                <span className="text-sm text-gray-500 ml-2">15 votos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}