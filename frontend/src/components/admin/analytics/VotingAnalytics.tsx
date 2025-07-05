'use client';

export default function VotingAnalytics({ dateRange }: { dateRange: string }) {
  const metrics = {
    totalVotes: 3456,
    activeVotes: 23,
    avgParticipation: 68.4,
    avgQuorum: 78.5,
    voteTypes: [
      { type: 'Opinion', count: 2456, percentage: 71.1 },
      { type: 'Knowledge', count: 1000, percentage: 28.9 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Votaciones Totales</h3>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalVotes.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Votaciones Activas</h3>
          <p className="text-2xl font-bold text-green-900">{metrics.activeVotes}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Participación Promedio</h3>
          <p className="text-2xl font-bold text-purple-900">{metrics.avgParticipation}%</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Quorum Promedio</h3>
          <p className="text-2xl font-bold text-orange-900">{metrics.avgQuorum}%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Tipos de Votaciones</h3>
        <div className="space-y-4">
          {metrics.voteTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{type.type}</span>
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16">{type.count}</span>
                <span className="text-xs text-gray-500 w-12">{type.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}