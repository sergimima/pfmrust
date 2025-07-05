'use client';

import { useState, useEffect } from 'react';

interface SystemOverviewProps {
  dateRange: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCommunities: number;
  activeCommunities: number;
  totalVotes: number;
  activeVotes: number;
  totalSOLCollected: number;
  averageQuorum: number;
  systemHealth: number;
  uptime: string;
}

export default function SystemOverview({ dateRange }: SystemOverviewProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 1247,
    activeUsers: 892,
    totalCommunities: 156,
    activeCommunities: 89,
    totalVotes: 3456,
    activeVotes: 23,
    totalSOLCollected: 45.6,
    averageQuorum: 78.5,
    systemHealth: 98.2,
    uptime: '99.98%'
  });

  const [growthData] = useState([
    { period: 'Ene 2025', users: 450, communities: 45, votes: 890 },
    { period: 'Feb 2025', users: 678, communities: 67, votes: 1234 },
    { period: 'Mar 2025', users: 823, communities: 89, votes: 1567 },
    { period: 'Abr 2025', users: 945, communities: 112, votes: 1890 },
    { period: 'May 2025', users: 1089, communities: 134, votes: 2345 },
    { period: 'Jun 2025', users: 1156, communities: 145, votes: 2678 },
    { period: 'Jul 2025', users: 1247, communities: 156, votes: 3456 }
  ]);

  const [topCommunities] = useState([
    { name: 'DeFi Discussions', members: 234, votes: 567, fees: 12.3 },
    { name: 'NFT Community', members: 189, votes: 445, fees: 8.9 },
    { name: 'Solana Developers', members: 156, votes: 389, fees: 7.2 },
    { name: 'Gaming DAO', members: 145, votes: 334, fees: 6.8 },
    { name: 'Art Collective', members: 123, votes: 267, fees: 5.4 }
  ]);

  useEffect(() => {
    // TODO: Fetch real metrics from backend API based on dateRange
    console.log('Fetching system overview for:', dateRange);
  }, [dateRange]);

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      arrow: isPositive ? '↗️' : '↘️'
    };
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Usuarios Totales</p>
              <p className="text-3xl font-bold text-blue-900">{metrics.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm">↗️ +12.3%</span>
                <span className="text-blue-500 text-xs ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Comunidades Activas</p>
              <p className="text-3xl font-bold text-green-900">{metrics.activeCommunities}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm">↗️ +8.5%</span>
                <span className="text-green-500 text-xs ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="text-4xl">🏘️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Votaciones Activas</p>
              <p className="text-3xl font-bold text-purple-900">{metrics.activeVotes}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm">↗️ +15.7%</span>
                <span className="text-purple-500 text-xs ml-2">vs semana anterior</span>
              </div>
            </div>
            <div className="text-4xl">🗳️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">SOL Recolectado</p>
              <p className="text-3xl font-bold text-orange-900">{metrics.totalSOLCollected}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm">↗️ +23.1%</span>
                <span className="text-orange-500 text-xs ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Salud del Sistema</span>
              <span className={`font-bold ${getHealthColor(metrics.systemHealth)}`}>
                {metrics.systemHealth}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${metrics.systemHealth}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-bold text-green-600">{metrics.uptime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quorum Promedio</span>
              <span className="font-bold text-blue-600">{metrics.averageQuorum}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuarios Activos</span>
              <span className="font-bold text-purple-600">
                {metrics.activeUsers} / {metrics.totalUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Crecimiento Mensual</h3>
          <div className="space-y-3">
            {growthData.slice(-3).map((data, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{data.period}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {data.users} usuarios • {data.communities} comunidades • {data.votes} votos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Communities */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top Comunidades por Actividad</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Generados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCommunities.map((community, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {community.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.votes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.fees} SOL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(community.votes / 600) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {Math.round((community.votes / 600) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="text-green-600">✅</div>
            <div className="flex-1">
              <span className="text-sm text-gray-900">Nueva comunidad creada: "</span>
              <span className="font-medium">Web3 Education</span>
              <span className="text-sm text-gray-500 ml-2">hace 2 minutos</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">🗳️</div>
            <div className="flex-1">
              <span className="text-sm text-gray-900">Votación completada en </span>
              <span className="font-medium">DeFi Discussions</span>
              <span className="text-sm text-gray-500 ml-2">hace 5 minutos</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-600">👥</div>
            <div className="flex-1">
              <span className="text-sm text-gray-900">15 nuevos usuarios registrados</span>
              <span className="text-sm text-gray-500 ml-2">en la última hora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}