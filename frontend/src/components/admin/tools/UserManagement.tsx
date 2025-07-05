'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface User {
  wallet: string;
  reputation: number;
  level: number;
  isBanned: boolean;
  isModerator: boolean;
  totalVotes: number;
  joinedAt: string;
}

export default function UserManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      wallet: 'ABC...123',
      reputation: 150,
      level: 3,
      isBanned: false,
      isModerator: false,
      totalVotes: 25,
      joinedAt: '2025-06-01'
    },
    {
      wallet: 'DEF...456',
      reputation: 500,
      level: 5,
      isBanned: false,
      isModerator: true,
      totalVotes: 89,
      joinedAt: '2025-05-15'
    },
    {
      wallet: 'GHI...789',
      reputation: 25,
      level: 1,
      isBanned: true,
      isModerator: false,
      totalVotes: 3,
      joinedAt: '2025-07-01'
    }
  ]);

  const handleBanUser = async (userWallet: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract ban_user()
      console.log('Banning user:', userWallet);
      
      // Actualizar estado local
      setUsers(users.map(user => 
        user.wallet === userWallet 
          ? { ...user, isBanned: true }
          : user
      ));
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userWallet: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract (función unban)
      console.log('Unbanning user:', userWallet);
      
      setUsers(users.map(user => 
        user.wallet === userWallet 
          ? { ...user, isBanned: false }
          : user
      ));
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignModerator = async (userWallet: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract assign_moderator()
      console.log('Assigning moderator:', userWallet);
      
      setUsers(users.map(user => 
        user.wallet === userWallet 
          ? { ...user, isModerator: true }
          : user
      ));
    } catch (error) {
      console.error('Error assigning moderator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveModerator = async (userWallet: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract remove_moderator()
      console.log('Removing moderator:', userWallet);
      
      setUsers(users.map(user => 
        user.wallet === userWallet 
          ? { ...user, isModerator: false }
          : user
      ));
    } catch (error) {
      console.error('Error removing moderator:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.wallet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Usuarios</h3>
          <p className="text-2xl font-bold text-blue-900">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Moderadores</h3>
          <p className="text-2xl font-bold text-green-900">
            {users.filter(u => u.isModerator).length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Baneados</h3>
          <p className="text-2xl font-bold text-red-900">
            {users.filter(u => u.isBanned).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Activos</h3>
          <p className="text-2xl font-bold text-purple-900">
            {users.filter(u => !u.isBanned).length}
          </p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reputación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.wallet}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.wallet}
                    </div>
                    <div className="text-sm text-gray-500">
                      Nivel {user.level} • Desde {user.joinedAt}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.reputation} pts</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isBanned 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBanned ? 'Baneado' : 'Activo'}
                    </span>
                    {user.isModerator && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Moderador
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.totalVotes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnbanUser(user.wallet)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Desbanear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user.wallet)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Banear
                    </button>
                  )}
                  
                  {user.isModerator ? (
                    <button
                      onClick={() => handleRemoveModerator(user.wallet)}
                      disabled={loading}
                      className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                    >
                      Quitar Mod
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssignModerator(user.wallet)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      Hacer Mod
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}