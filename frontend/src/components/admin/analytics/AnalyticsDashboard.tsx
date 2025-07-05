'use client';

import { useState, useEffect } from 'react';
import SystemOverview from './SystemOverview';
import UserAnalytics from './UserAnalytics';
import CommunityAnalytics from './CommunityAnalytics';
import VotingAnalytics from './VotingAnalytics';
import FinancialAnalytics from './FinancialAnalytics';

interface AnalyticsDashboardProps {
  activeTab?: string;
}

const tabs = [
  { id: 'overview', name: 'Resumen General', icon: '📊' },
  { id: 'users', name: 'Analytics Usuarios', icon: '👥' },
  { id: 'communities', name: 'Analytics Comunidades', icon: '🏘️' },
  { id: 'voting', name: 'Analytics Votaciones', icon: '🗳️' },
  { id: 'financial', name: 'Analytics Financieros', icon: '💰' },
];

export default function AnalyticsDashboard({ activeTab = 'overview' }: AnalyticsDashboardProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [dateRange, setDateRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh cada 30 segundos si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('Refreshing analytics data...');
      // TODO: Refrescar datos desde API backend
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <SystemOverview dateRange={dateRange} />;
      case 'users':
        return <UserAnalytics dateRange={dateRange} />;
      case 'communities':
        return <CommunityAnalytics dateRange={dateRange} />;
      case 'voting':
        return <VotingAnalytics dateRange={dateRange} />;
      case 'financial':
        return <FinancialAnalytics dateRange={dateRange} />;
      default:
        return <SystemOverview dateRange={dateRange} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas y Analytics</h1>
          <p className="text-gray-600 mt-2">
            Métricas en tiempo real del sistema de votación y comunidades
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>

          {/* Auto-refresh toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>

          {/* Manual refresh button */}
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderTabContent()}
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Última actualización: {new Date().toLocaleString()} • 
          Datos en tiempo real desde blockchain y backend
        </p>
      </div>
    </div>
  );
}