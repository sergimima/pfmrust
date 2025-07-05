'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface ModerationLog {
  id: string;
  action: string;
  moderator: string;
  target: string;
  reason: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'reversed';
}

interface BulkAction {
  type: 'ban' | 'unban' | 'approve_reports' | 'reject_reports' | 'assign_moderator';
  targets: string[];
  reason?: string;
}

export default function ModerationTools() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>({ type: 'ban', targets: [] });
  
  const [moderationLogs] = useState<ModerationLog[]>([
    {
      id: '1',
      action: 'Ban User',
      moderator: 'admin.sol',
      target: 'spammer.sol',
      reason: 'Multiple spam reports',
      timestamp: '2025-07-05T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      action: 'Approve Report',
      moderator: 'mod1.sol',
      target: 'Report #123',
      reason: 'Confirmed harassment',
      timestamp: '2025-07-05T09:15:00Z',
      status: 'completed'
    },
    {
      id: '3',
      action: 'Assign Moderator',
      moderator: 'admin.sol',
      target: 'newmod.sol',
      reason: 'Community growth',
      timestamp: '2025-07-05T08:00:00Z',
      status: 'completed'
    }
  ]);

  const [pendingReports] = useState([
    {
      id: '1',
      type: 'spam',
      content: 'Vote: "Buy my tokens now!"',
      reporter: 'alice.sol',
      reported: 'spammer.sol',
      priority: 'high',
      createdAt: '2025-07-05T10:30:00Z'
    },
    {
      id: '2',
      type: 'harassment',
      content: 'Comment: "Offensive language"',
      reporter: 'bob.sol',
      reported: 'troll.sol',
      priority: 'critical',
      createdAt: '2025-07-05T09:15:00Z'
    },
    {
      id: '3',
      type: 'misinformation',
      content: 'Vote: "False protocol claims"',
      reporter: 'charlie.sol',
      reported: 'faker.sol',
      priority: 'medium',
      createdAt: '2025-07-05T08:00:00Z'
    }
  ]);

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAllReports = () => {
    setSelectedReports(
      selectedReports.length === pendingReports.length 
        ? [] 
        : pendingReports.map(r => r.id)
    );
  };

  const handleBulkAction = async () => {
    if (!publicKey || selectedReports.length === 0) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contracts según el tipo de acción
      console.log('Executing bulk action:', {
        type: bulkAction.type,
        targets: selectedReports,
        reason: bulkAction.reason
      });

      switch (bulkAction.type) {
        case 'approve_reports':
          // Llamar review_report() para cada reporte
          console.log('Approving reports:', selectedReports);
          break;
        case 'reject_reports':
          // Llamar review_report() con rechazo
          console.log('Rejecting reports:', selectedReports);
          break;
        case 'ban':
          // Llamar ban_user() para usuarios reportados
          console.log('Banning users from reports:', selectedReports);
          break;
        default:
          console.log('Unknown bulk action:', bulkAction.type);
      }

      alert(`Acción ${bulkAction.type} ejecutada en ${selectedReports.length} elementos`);
      setSelectedReports([]);
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Error al ejecutar acción masiva');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Herramientas de Moderación Masiva</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {selectedReports.length} seleccionados
          </span>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedReports.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Acciones Masivas</h3>
          <div className="flex items-center space-x-4">
            <select
              value={bulkAction.type}
              onChange={(e) => setBulkAction(prev => ({ ...prev, type: e.target.value as any }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="approve_reports">Aprobar Reportes</option>
              <option value="reject_reports">Rechazar Reportes</option>
              <option value="ban">Banear Usuarios Reportados</option>
            </select>
            
            <input
              type="text"
              placeholder="Razón (opcional)"
              value={bulkAction.reason || ''}
              onChange={(e) => setBulkAction(prev => ({ ...prev, reason: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 flex-1"
            />
            
            <button
              onClick={handleBulkAction}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Ejecutando...' : 'Ejecutar'}
            </button>
            
            <button
              onClick={() => setSelectedReports([])}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pending Reports */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Reportes Pendientes</h3>
          <button
            onClick={handleSelectAllReports}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            {selectedReports.length === pendingReports.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === pendingReports.length}
                    onChange={handleSelectAllReports}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reportado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingReports.map((report) => (
                <tr key={report.id} className={selectedReports.includes(report.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm font-medium text-gray-900">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {report.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reported}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getPriorityColor(report.priority)
                    }`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Logs */}
      <div>
        <h3 className="text-lg font-medium mb-4">Registro de Moderación</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moderador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moderationLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.moderator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor(log.status)
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Reportes Pendientes</h4>
          <p className="text-2xl font-bold text-blue-900">{pendingReports.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Acciones Completadas</h4>
          <p className="text-2xl font-bold text-green-900">
            {moderationLogs.filter(log => log.status === 'completed').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800">Acciones Pendientes</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {moderationLogs.filter(log => log.status === 'pending').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-800">Reportes Críticos</h4>
          <p className="text-2xl font-bold text-red-900">
            {pendingReports.filter(report => report.priority === 'critical').length}
          </p>
        </div>
      </div>
    </div>
  );
}