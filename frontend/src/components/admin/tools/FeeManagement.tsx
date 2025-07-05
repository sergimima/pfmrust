'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface FeePool {
  totalCollected: number;
  availableForDistribution: number;
  lastDistribution: string;
  totalWithdrawn: number;
}

export default function FeeManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Mock data - en producción vendría del smart contract
  const [feePool] = useState<FeePool>({
    totalCollected: 12.5,
    availableForDistribution: 0.625, // 5% del total
    lastDistribution: '2025-07-04',
    totalWithdrawn: 8.2
  });

  const [communities] = useState([
    {
      id: '1',
      name: 'DeFi Discussions',
      admin: 'ABC...123',
      collectedFees: 3.2,
      pendingWithdraw: 2.1,
      members: 156
    },
    {
      id: '2', 
      name: 'NFT Community',
      admin: 'DEF...456',
      collectedFees: 5.8,
      pendingWithdraw: 4.2,
      members: 289
    },
    {
      id: '3',
      name: 'Solana Developers',
      admin: 'GHI...789',
      collectedFees: 3.5,
      pendingWithdraw: 2.0,
      members: 95
    }
  ]);

  const handleDistributeRewards = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract distribute_daily_rewards()
      console.log('Distributing daily rewards...');
      alert('Rewards distribuidos exitosamente!');
    } catch (error) {
      console.error('Error distributing rewards:', error);
      alert('Error al distribuir rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFees = async (communityId: string) => {
    if (!publicKey || !withdrawAmount) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract withdraw_fees()
      console.log(`Withdrawing ${withdrawAmount} SOL from community ${communityId}`);
      alert(`Withdrawn ${withdrawAmount} SOL exitosamente!`);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing fees:', error);
      alert('Error al retirar fees');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeTiers = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract para actualizar fee tiers
      console.log('Updating fee tiers...');
      alert('Fee tiers actualizados exitosamente!');
    } catch (error) {
      console.error('Error updating fee tiers:', error);
      alert('Error al actualizar fee tiers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Fees</h2>
        <button
          onClick={handleDistributeRewards}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Distribuyendo...' : 'Distribuir Rewards Diarios'}
        </button>
      </div>

      {/* Fee Pool Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Recolectado</h3>
          <p className="text-2xl font-bold text-blue-900">{feePool.totalCollected} SOL</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Para Distribución</h3>
          <p className="text-2xl font-bold text-green-900">{feePool.availableForDistribution} SOL</p>
          <p className="text-xs text-green-600">5% del total</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Total Retirado</h3>
          <p className="text-2xl font-bold text-purple-900">{feePool.totalWithdrawn} SOL</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Última Distribución</h3>
          <p className="text-2xl font-bold text-orange-900">{feePool.lastDistribution}</p>
        </div>
      </div>

      {/* Fee Tiers Configuration */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Configuración de Fee Tiers</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Fees de Votación</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Basic (0-49 rep):</span>
                <span className="font-medium">0.01 SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Premium (1000+ rep):</span>
                <span className="font-medium">0.005 SOL</span>
              </div>
              <div className="flex justify-between">
                <span>VIP (5000+ rep):</span>
                <span className="font-medium">0.002 SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Free (Moderadores):</span>
                <span className="font-medium">0 SOL</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Fees de Comunidad</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Creación básica:</span>
                <span className="font-medium">0.1 SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Comunidad premium:</span>
                <span className="font-medium">0.05 SOL</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleUpdateFeeTiers}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Actualizar Fee Tiers
        </button>
      </div>

      {/* Communities Fee Management */}
      <div>
        <h3 className="text-lg font-medium mb-4">Fees por Comunidad</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Recolectados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendiente Retiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {communities.map((community) => (
                <tr key={community.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {community.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.admin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.collectedFees} SOL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.pendingWithdraw} SOL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {community.members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        max={community.pendingWithdraw}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleWithdrawFees(community.id)}
                        disabled={loading || !withdrawAmount}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 text-sm"
                      >
                        Retirar
                      </button>
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