'use client';

import { useState, useEffect } from 'react';

interface CommunityAnalyticsProps {
  dateRange: string;
}

export default function CommunityAnalytics({ dateRange }: CommunityAnalyticsProps) {
  const [metrics] = useState({
    totalCommunities: 156,
    activeCommunities: 89,
    avgMembersPerCommunity: 47.3,
    avgVotesPerCommunity: 22.1,
    topCategories: [
      { name: 'Technology', count: 45, percentage: 28.8 },
      { name: 'Finance', count: 34, percentage: 21.8 },
      { name: 'Gaming', count: 28, percentage: 17.9 },
      { name: 'Art', count: 23, percentage: 14.7 },
      { name: 'Education', count: 26, percentage: 16.7 }
    ],
    topCommunities: [
      { name: 'DeFi Discussions', members: 234, votes: 567, engagement: 85.2 },
      { name: 'NFT Community', members: 189, votes: 445, engagement: 78.9 },
      { name: 'Solana Developers', members: 156, votes: 389, engagement: 71.4 },
      { name: 'Gaming DAO', members: 145, votes: 334, engagement: 69.7 },
      { name: 'Art Collective', members: 123, votes: 267, engagement: 62.8 }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Comunidades Totales</h3>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalCommunities}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Comunidades Activas</h3>
          <p className="text-2xl font-bold text-green-900">{metrics.activeCommunities}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Promedio Miembros</h3>
          <p className="text-2xl font-bold text-purple-900">{metrics.avgMembersPerCommunity}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Promedio Votos</h3>
          <p className="text-2xl font-bold text-orange-900">{metrics.avgVotesPerCommunity}</p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Categorías Más Populares</h3>
        <div className="space-y-3">
          {metrics.topCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{category.count}</span>
                <span className="text-xs text-gray-500 w-12">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Communities Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Comunidades Más Activas</h3>
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
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topCommunities.map((community, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {community.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.votes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${community.engagement}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {community.engagement}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}