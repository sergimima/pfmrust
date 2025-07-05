'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import UserManagement from './UserManagement';
import FeeManagement from './FeeManagement';
import SystemConfig from './SystemConfig';
import ModerationTools from './ModerationTools';

interface AdminToolsProps {
  activeTab?: string;
}

const tabs = [
  { id: 'users', name: 'Gestión de Usuarios', icon: '👥' },
  { id: 'fees', name: 'Gestión de Fees', icon: '💰' },
  { id: 'system', name: 'Configuración', icon: '⚙️' },
  { id: 'moderation', name: 'Moderación Masiva', icon: '🛡️' },
];

export default function AdminTools({ activeTab = 'users' }: AdminToolsProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(tabFromUrl || activeTab);
  
  useEffect(() => {
    if (tabFromUrl && tabs.find(tab => tab.id === tabFromUrl)) {
      setCurrentTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'users':
        return <UserManagement />;
      case 'fees':
        return <FeeManagement />;
      case 'system':
        return <SystemConfig />;
      case 'moderation':
        return <ModerationTools />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Herramientas de Administración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona usuarios, fees, configuración del sistema y herramientas de moderación
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm
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
    </div>
  );
}