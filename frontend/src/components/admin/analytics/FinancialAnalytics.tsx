'use client';

export default function FinancialAnalytics({ dateRange }: { dateRange: string }) {
  const metrics = {
    totalSOLCollected: 45.6,
    totalDistributed: 2.28,
    totalWithdrawn: 38.2,
    averageFeePerVote: 0.013,
    topEarners: [
      { community: 'DeFi Discussions', collected: 12.3, distributed: 0.62 },
      { community: 'NFT Community', collected: 8.9, distributed: 0.45 },
      { community: 'Solana Developers', collected: 7.2, distributed: 0.36 },
      { community: 'Gaming DAO', collected: 6.8, distributed: 0.34 },
      { community: 'Art Collective', collected: 5.4, distributed: 0.27 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">SOL Recolectado</h3>
          <p className="text-2xl font-bold text-green-900">{metrics.totalSOLCollected}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">SOL Distribuido</h3>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalDistributed}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">SOL Retirado</h3>
          <p className="text-2xl font-bold text-purple-900">{metrics.totalWithdrawn}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Fee Promedio</h3>
          <p className="text-2xl font-bold text-orange-900">{metrics.averageFeePerVote}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top Comunidades por Ingresos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOL Recolectado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOL Distribuido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rentabilidad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topEarners.map((earner, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {earner.community}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {earner.collected} SOL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {earner.distributed} SOL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(earner.collected / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {((earner.collected / 45.6) * 100).toFixed(1)}%
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